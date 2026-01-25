# cleanup.ps1
# Cleans up temporary files created during VPS provisioning
# Should be run after provisioning is complete (success or failure)
#
# This script removes:
# - Temporary EA files
# - Uploaded scripts
# - MT5 installer (if present)
# - Any other temporary files in the provisioning temp directory
#
# Exit codes:
#   0 - Success (cleanup complete)
#   1 - Partial cleanup (some files could not be removed)

param(
    [Parameter(Mandatory=$false)]
    [string]$TempDirectory = "",    # Specific temp directory to clean

    [Parameter(Mandatory=$false)]
    [string[]]$FilesToRemove = @(), # Specific files to remove

    [switch]$RemoveScripts,         # Also remove the provisioning scripts

    [switch]$Verbose                # Show detailed output
)

$ErrorActionPreference = "Continue"  # Continue on errors to clean up as much as possible

# Configuration
$DEFAULT_TEMP_PATTERNS = @(
    "$env:TEMP\mt5setup.exe",
    "$env:TEMP\*.ex5",
    "$env:TEMP\au-provision-*"
)

$SCRIPT_DIRECTORY = $PSScriptRoot

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

# Remove a file safely
function Remove-FileSafe {
    param([string]$Path)

    $result = @{
        path = $Path
        removed = $false
        error = $null
    }

    if (-not (Test-Path $Path)) {
        $result.removed = $true
        $result.note = "File did not exist"
        return $result
    }

    try {
        Remove-Item -Path $Path -Force -Recurse -ErrorAction Stop
        $result.removed = $true
    }
    catch {
        $result.error = $_.Exception.Message
    }

    return $result
}

# Main logic
try {
    $cleanupResults = @()
    $failedCount = 0

    # Step 1: Remove specific files if provided
    foreach ($file in $FilesToRemove) {
        if ($file) {
            $result = Remove-FileSafe -Path $file
            $cleanupResults += $result
            if (-not $result.removed) {
                $failedCount++
            }
            if ($Verbose) {
                Write-Host "Removing: $file - $($result.removed ? 'OK' : 'FAILED')" -ForegroundColor ($result.removed ? 'Green' : 'Red')
            }
        }
    }

    # Step 2: Clean temp directory if specified
    if ($TempDirectory -and (Test-Path $TempDirectory)) {
        $result = Remove-FileSafe -Path $TempDirectory
        $cleanupResults += $result
        if (-not $result.removed) {
            $failedCount++
        }
        if ($Verbose) {
            Write-Host "Removing temp directory: $TempDirectory - $($result.removed ? 'OK' : 'FAILED')" -ForegroundColor ($result.removed ? 'Green' : 'Red')
        }
    }

    # Step 3: Clean default temp patterns
    foreach ($pattern in $DEFAULT_TEMP_PATTERNS) {
        $files = Get-Item -Path $pattern -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            $result = Remove-FileSafe -Path $file.FullName
            $cleanupResults += $result
            if (-not $result.removed) {
                $failedCount++
            }
            if ($Verbose) {
                Write-Host "Removing: $($file.FullName) - $($result.removed ? 'OK' : 'FAILED')" -ForegroundColor ($result.removed ? 'Green' : 'Red')
            }
        }
    }

    # Step 4: Remove provisioning scripts if requested
    if ($RemoveScripts -and $SCRIPT_DIRECTORY) {
        $scriptsToRemove = @(
            "install_mt5.ps1",
            "find_mt5_path.ps1",
            "copy_ea.ps1",
            "cleanup.ps1"
        )

        foreach ($script in $scriptsToRemove) {
            $scriptPath = Join-Path $SCRIPT_DIRECTORY $script
            if (Test-Path $scriptPath) {
                $result = Remove-FileSafe -Path $scriptPath
                $cleanupResults += $result
                if (-not $result.removed) {
                    $failedCount++
                }
                if ($Verbose) {
                    Write-Host "Removing script: $scriptPath - $($result.removed ? 'OK' : 'FAILED')" -ForegroundColor ($result.removed ? 'Green' : 'Red')
                }
            }
        }

        # Try to remove the script directory itself if empty
        if ((Test-Path $SCRIPT_DIRECTORY) -and ((Get-ChildItem $SCRIPT_DIRECTORY | Measure-Object).Count -eq 0)) {
            $result = Remove-FileSafe -Path $SCRIPT_DIRECTORY
            $cleanupResults += $result
        }
    }

    # Step 5: Clear Windows temp file traces
    # Remove any credentials or sensitive data from memory (best effort)
    [System.GC]::Collect()

    # Return results
    $successCount = ($cleanupResults | Where-Object { $_.removed }).Count
    $totalCount = $cleanupResults.Count

    if ($failedCount -eq 0) {
        Write-Result -Status "CLEANUP_COMPLETE" -Message "Cleanup completed successfully" -Data @{
            filesRemoved = $successCount
            totalFiles = $totalCount
            details = $cleanupResults
        }
        exit 0
    }
    else {
        Write-Result -Status "CLEANUP_PARTIAL" -Message "Cleanup completed with $failedCount failures" -Data @{
            filesRemoved = $successCount
            filesFailed = $failedCount
            totalFiles = $totalCount
            details = $cleanupResults
        }
        exit 1
    }
}
catch {
    Write-Result -Status "ERROR" -Message "Cleanup error: $($_.Exception.Message)" -Data @{
        errorType = $_.Exception.GetType().Name
        stackTrace = $_.ScriptStackTrace
    }
    exit 1
}
