# find_mt5_path.ps1
# Dynamically finds the MetaTrader 5 data directory
# The data directory contains a hash-based folder name that varies per installation
#
# MT5 Data Directory Structure:
#   %APPDATA%\MetaQuotes\Terminal\<HASH>\
#     ├── MQL5\
#     │   ├── Experts\     <- EA files go here
#     │   ├── Include\
#     │   ├── Libraries\
#     │   └── Scripts\
#     ├── config\
#     └── logs\
#
# Exit codes:
#   0 - Success (path found)
#   1 - MT5 not installed
#   2 - Data directory not found
#   3 - Multiple terminals found (returns all)

param(
    [switch]$CreateIfMissing,  # Create Experts directory if it doesn't exist
    [switch]$RunTerminal       # Run terminal once to generate data directory
)

$ErrorActionPreference = "Stop"

# Configuration
$MT5_INSTALL_DIR = "C:\Program Files\MetaTrader 5"
$MT5_TERMINAL_EXE = "$MT5_INSTALL_DIR\terminal64.exe"
$METAQUOTES_DATA_ROOT = "$env:APPDATA\MetaQuotes\Terminal"

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

# Check if MT5 is installed
function Test-MT5Installed {
    return (Test-Path $MT5_TERMINAL_EXE)
}

# Find all MT5 terminal data directories
function Get-MT5DataDirectories {
    $terminals = @()

    if (-not (Test-Path $METAQUOTES_DATA_ROOT)) {
        return $terminals
    }

    # Each subfolder in Terminal directory is a hash representing a terminal instance
    $hashFolders = Get-ChildItem -Path $METAQUOTES_DATA_ROOT -Directory -ErrorAction SilentlyContinue

    foreach ($folder in $hashFolders) {
        # Verify this is a valid MT5 data directory by checking for MQL5 subfolder
        $mql5Path = Join-Path $folder.FullName "MQL5"
        $expertsPath = Join-Path $mql5Path "Experts"

        if (Test-Path $mql5Path) {
            $terminals += @{
                hash = $folder.Name
                dataPath = $folder.FullName
                mql5Path = $mql5Path
                expertsPath = $expertsPath
                expertsExists = (Test-Path $expertsPath)
                lastModified = $folder.LastWriteTime.ToString("yyyy-MM-ddTHH:mm:ssZ")
            }
        }
    }

    return $terminals
}

# Run terminal briefly to create data directory
function Initialize-MT5DataDirectory {
    if (-not (Test-MT5Installed)) {
        return $false
    }

    Write-Host "Starting MT5 terminal to initialize data directory..." -ForegroundColor Cyan

    # Start terminal with /portable flag to initialize quickly
    $process = Start-Process -FilePath $MT5_TERMINAL_EXE -PassThru

    # Wait a few seconds for terminal to create data directory
    Start-Sleep -Seconds 10

    # Close the terminal
    try {
        $process | Stop-Process -Force -ErrorAction SilentlyContinue
    }
    catch {
        # Process may have already closed
    }

    # Wait a moment for cleanup
    Start-Sleep -Seconds 2

    return $true
}

# Main logic
try {
    # Step 1: Check if MT5 is installed
    if (-not (Test-MT5Installed)) {
        Write-Result -Status "MT5_NOT_INSTALLED" -Message "MetaTrader 5 is not installed" -Data @{
            expectedPath = $MT5_TERMINAL_EXE
        }
        exit 1
    }

    # Step 2: Find existing data directories
    $terminals = Get-MT5DataDirectories

    # Step 3: If no data directories found and RunTerminal is specified, initialize
    if ($terminals.Count -eq 0 -and $RunTerminal) {
        Write-Host "No data directory found. Initializing..." -ForegroundColor Yellow

        if (Initialize-MT5DataDirectory) {
            # Try finding again after initialization
            Start-Sleep -Seconds 2
            $terminals = Get-MT5DataDirectories
        }
    }

    # Step 4: Handle results
    if ($terminals.Count -eq 0) {
        Write-Result -Status "DATA_DIR_NOT_FOUND" -Message "MT5 data directory not found. Run terminal once to create it." -Data @{
            searchPath = $METAQUOTES_DATA_ROOT
            hint = "Use -RunTerminal flag to automatically initialize"
        }
        exit 2
    }

    # Step 5: Create Experts directory if requested and missing
    if ($CreateIfMissing) {
        foreach ($terminal in $terminals) {
            if (-not $terminal.expertsExists) {
                New-Item -Path $terminal.expertsPath -ItemType Directory -Force | Out-Null
                $terminal.expertsExists = $true
                $terminal.expertsCreated = $true
            }
        }
    }

    # Step 6: Return results
    if ($terminals.Count -eq 1) {
        $terminal = $terminals[0]
        Write-Result -Status "MT5_PATH_FOUND" -Message "MT5 data directory found" -Data @{
            hash = $terminal.hash
            dataPath = $terminal.dataPath
            mql5Path = $terminal.mql5Path
            expertsPath = $terminal.expertsPath
            expertsExists = $terminal.expertsExists
        }
        exit 0
    }
    else {
        # Multiple terminals found - return the most recently modified one as primary
        $sortedTerminals = $terminals | Sort-Object { [DateTime]$_.lastModified } -Descending
        $primary = $sortedTerminals[0]

        Write-Result -Status "MULTIPLE_TERMINALS_FOUND" -Message "Multiple MT5 data directories found, using most recent" -Data @{
            count = $terminals.Count
            primary = @{
                hash = $primary.hash
                dataPath = $primary.dataPath
                mql5Path = $primary.mql5Path
                expertsPath = $primary.expertsPath
                expertsExists = $primary.expertsExists
            }
            all = $sortedTerminals
        }
        exit 0
    }
}
catch {
    Write-Result -Status "ERROR" -Message "Unexpected error: $($_.Exception.Message)" -Data @{
        errorType = $_.Exception.GetType().Name
        stackTrace = $_.ScriptStackTrace
    }
    exit 1
}
