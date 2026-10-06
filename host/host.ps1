# Chrome Appearance Switcher - Native Messaging Host (Windows)
# Handles JSON messages via standard input/output with 4-byte prefix.

[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$stdin = [System.Console]::OpenStandardInput()
$stdout = [System.Console]::OpenStandardOutput()

# C# definition for broadcasting WM_SETTINGCHANGE to ensure instant UI reaction
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

public class NativeThemeNotifier {
    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    public static extern IntPtr SendMessageTimeout(
        IntPtr hWnd,
        uint Msg,
        UIntPtr wParam,
        string lParam,
        uint fuFlags,
        uint uTimeout,
        out UIntPtr lpdwResult);
}
'@

function Notify-ThemeChange {
    try {
        $result = [UIntPtr]::Zero
        # HWND_BROADCAST = 0xffff, WM_SETTINGCHANGE = 0x001A, SMTO_ABORTIFHUNG = 2
        [void][NativeThemeNotifier]::SendMessageTimeout([IntPtr]0xffff, 0x001A, [UIntPtr]::Zero, "ImmersiveColorSet", 2, 200, [ref]$result)
    } catch {
        # Fallback without failing
    }
}

function Send-NativeResponse([hashtable]$data) {
    $json = ($data | ConvertTo-Json -Compress)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $lenBytes = [System.BitConverter]::GetBytes([int]$bytes.Length)

    [void]$stdout.Write($lenBytes, 0, 4)
    [void]$stdout.Write($bytes, 0, $bytes.Length)
    [void]$stdout.Flush()
}

$regKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize"

while ($true) {
    $lenBytes = New-Object byte[] 4
    $read = $stdin.Read($lenBytes, 0, 4)
    if ($read -lt 4) {
        # End of stream / Chrome disconnected
        break
    }

    $msgLen = [System.BitConverter]::ToInt32($lenBytes, 0)
    if ($msgLen -le 0 -or $msgLen -gt 1048576) {
        # Invalid length
        break
    }

    $buffer = New-Object byte[] $msgLen
    $totalRead = 0
    while ($totalRead -lt $msgLen) {
        $chunk = $stdin.Read($buffer, $totalRead, $msgLen - $totalRead)
        if ($chunk -le 0) { break }
        $totalRead += $chunk
    }

    if ($totalRead -lt $msgLen) {
        break
    }

    $rawText = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $totalRead)
    
    try {
        $msg = $rawText | ConvertFrom-Json
        $action = $msg.action

        if ($action -eq "ping") {
            Send-NativeResponse @{
                status = "ok"
                pong = $true
                version = "1.0.1"
            }
        }
        elseif ($action -eq "get_status") {
            $appsLight = 1
            $sysLight = 1
            try {
                $prop = Get-ItemProperty -Path $regKey -ErrorAction SilentlyContinue
                if ($null -ne $prop.AppsUseLightTheme) { $appsLight = [int]$prop.AppsUseLightTheme }
                if ($null -ne $prop.SystemUsesLightTheme) { $sysLight = [int]$prop.SystemUsesLightTheme }
            } catch {}

            $mode = if ($appsLight -eq 1) { "light" } else { "dark" }
            Send-NativeResponse @{
                status = "ok"
                mode = $mode
                appsUseLightTheme = $appsLight
                systemUsesLightTheme = $sysLight
            }
        }
        elseif ($action -eq "set_theme") {
            $targetMode = $msg.mode # "light", "dark", or "toggle"
            $currentApps = 1
            try {
                $prop = Get-ItemProperty -Path $regKey -ErrorAction SilentlyContinue
                if ($null -ne $prop.AppsUseLightTheme) { $currentApps = [int]$prop.AppsUseLightTheme }
            } catch {}

            $newLightVal = 1
            if ($targetMode -eq "toggle") {
                $newLightVal = if ($currentApps -eq 1) { 0 } else { 1 }
            } elseif ($targetMode -eq "dark") {
                $newLightVal = 0
            } else {
                $newLightVal = 1
            }

            # Set Apps theme (this controls Chrome UI tabs, toolbar, omnibox)
            Set-ItemProperty -Path $regKey -Name "AppsUseLightTheme" -Value $newLightVal -Type DWord -Force
            
            # Optionally sync System theme if requested (default true)
            if ($null -eq $msg.syncSystem -or $msg.syncSystem -eq $true) {
                Set-ItemProperty -Path $regKey -Name "SystemUsesLightTheme" -Value $newLightVal -Type DWord -Force
            }

            # Notify desktop applications to immediately repaint
            Notify-ThemeChange

            $finalMode = if ($newLightVal -eq 1) { "light" } else { "dark" }
            $currSysLight = 1
            try {
                $currSysLight = [int](Get-ItemProperty -Path $regKey -ErrorAction SilentlyContinue).SystemUsesLightTheme
            } catch {}

            Send-NativeResponse @{
                status = "ok"
                mode = $finalMode
                appsUseLightTheme = $newLightVal
                systemUsesLightTheme = $currSysLight
            }
        }
        else {
            Send-NativeResponse @{
                status = "error"
                message = "Unknown action: $action"
            }
        }
    } catch {
        Send-NativeResponse @{
            status = "error"
            message = $_.Exception.Message
        }
    }
}
