# install_mt5.ps1
# Downloads and silently installs MetaTrader 5 on Windows VPS
# Returns JSON status for parsing by the provisioning service
#
# Exit codes:
#   0 - Success (MT5 installed or already installed)
#   1 - Download failed
#   2 - Installation failed
#   3 - Verification failed

param(
    [switch]$Force  # Force reinstall even if MT5 exists
)

$ErrorActionPreference = "Stop"

# Configuration
$MT5_DOWNLOAD_URL = "https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe"
$INSTALLER_PATH = "$env:TEMP\mt5setup.exe"
$MT5_INSTALL_DIR = "C:\Program Files\MetaTrader 5"
$MT5_TERMINAL_EXE = "$MT5_INSTALL_DIR\terminal64.exe"

# Helper function to output JSON result
function Write-Result {
    param(
        [string]$Status,
        [string]$Message,
        [hashtable]$Data = @{}
    )

    $result = @{
        status = $Status
        message = $Message
        timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        data = $Data
    }

    $result | ConvertTo-Json -Compress
}

# Check if MT5 is already installed
function Test-MT5Installed {
    return (Test-Path $MT5_TERMINAL_EXE)
}

# Main installation logic
try {
    # Step 1: Check if already installed
    if ((Test-MT5Installed) -and (-not $Force)) {
        Write-Result -Status "MT5_ALREADY_INSTALLED" -Message "MetaTrader 5 is already installed" -Data @{
            installPath = $MT5_INSTALL_DIR
            terminalPath = $MT5_TERMINAL_EXE
        }
        exit 0
    }

    # Step 2: Download MT5 installer
    Write-Host "Downloading MetaTrader 5 installer..." -ForegroundColor Cyan

    # Use TLS 1.2 for secure download
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

    # Download with progress
    $webClient = New-Object System.Net.WebClient
    try {
        $webClient.DownloadFile($MT5_DOWNLOAD_URL, $INSTALLER_PATH)
    }
    catch {
        Write-Result -Status "DOWNLOAD_FAILED" -Message "Failed to download MT5 installer: $($_.Exception.Message)"
        exit 1
    }
    finally {
        $webClient.Dispose()
    }

    # Verify download
    if (-not (Test-Path $INSTALLER_PATH)) {
        Write-Result -Status "DOWNLOAD_FAILED" -Message "Installer file not found after download"
        exit 1
    }

    $installerSize = (Get-Item $INSTALLER_PATH).Length
    if ($installerSize -lt 1000000) {  # Less than 1MB is suspicious
        Write-Result -Status "DOWNLOAD_FAILED" -Message "Installer file too small ($installerSize bytes), may be corrupted"
        exit 1
    }

    Write-Host "Download complete. File size: $([math]::Round($installerSize / 1MB, 2)) MB" -ForegroundColor Green

    # Step 3: Run silent installation
    Write-Host "Installing MetaTrader 5 silently..." -ForegroundColor Cyan

    # MT5 installer silent switches:
    # /auto - automatic installation without user interaction
    # /portable - install in portable mode (optional, not used here)
    $installArgs = "/auto"

    $process = Start-Process -FilePath $INSTALLER_PATH -ArgumentList $installArgs -Wait -PassThru -NoNewWindow

    # Check installation result
    if ($process.ExitCode -ne 0) {
        Write-Result -Status "INSTALL_FAILED" -Message "MT5 installer exited with code $($process.ExitCode)"
        exit 2
    }

    # Step 4: Wait for installation to complete and verify
    Write-Host "Verifying installation..." -ForegroundColor Cyan

    # Give some time for installation to finalize
    $maxWait = 60  # seconds
    $waited = 0
    while (-not (Test-MT5Installed) -and $waited -lt $maxWait) {
        Start-Sleep -Seconds 2
        $waited += 2
    }

    if (-not (Test-MT5Installed)) {
        Write-Result -Status "VERIFICATION_FAILED" -Message "MT5 terminal not found after installation"
        exit 3
    }

    # Step 5: Clean up installer
    Remove-Item -Path $INSTALLER_PATH -Force -ErrorAction SilentlyContinue

    # Success
    Write-Result -Status "MT5_INSTALLED" -Message "MetaTrader 5 installed successfully" -Data @{
        installPath = $MT5_INSTALL_DIR
        terminalPath = $MT5_TERMINAL_EXE
        installerSize = $installerSize
    }
    exit 0
}
catch {
    Write-Result -Status "ERROR" -Message "Unexpected error: $($_.Exception.Message)" -Data @{
        errorType = $_.Exception.GetType().Name
        stackTrace = $_.ScriptStackTrace
    }
    exit 1
}
