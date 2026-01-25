# copy_ea.ps1
# Copies the EA (.ex5) file to the MT5 Experts directory
# The EA file should be uploaded to a temporary location before running this script
#
# This script:
# 1. Validates the source EA file exists
# 2. Finds the MT5 Experts directory dynamically
# 3. Copies the EA file with proper permissions
# 4. Verifies the copy was successful
# 5. Cleans up the temporary source file
#
# Exit codes:
#   0 - Success
#   1 - Source file not found
#   2 - MT5 Experts directory not found
#   3 - Copy failed
#   4 - Verification failed

param(
    [Parameter(Mandatory=$true)]
    [string]$SourcePath,           # Path to the uploaded EA file (temporary location)

    [Parameter(Mandatory=$false)]
    [string]$EAFileName = "",      # Target filename (optional, uses source name if not specified)

    [switch]$KeepSource,           # Don't delete source file after copy

    [Parameter(Mandatory=$false)]
    [string]$TargetHash = ""       # Specific terminal hash to use (optional)
)

$ErrorActionPreference = "Stop"

# Configuration
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

# Find MT5 Experts directory
function Get-MT5ExpertsPath {
    param(
        [string]$SpecificHash = ""
    )

    if (-not (Test-Path $METAQUOTES_DATA_ROOT)) {
        return $null
    }

    # If specific hash provided, use that
    if ($SpecificHash) {
        $targetPath = Join-Path $METAQUOTES_DATA_ROOT $SpecificHash
        $expertsPath = Join-Path $targetPath "MQL5\Experts"

        if (Test-Path (Join-Path $targetPath "MQL5")) {
            return $expertsPath
        }
        return $null
    }

    # Otherwise, find all terminals and use the most recently modified
    $hashFolders = Get-ChildItem -Path $METAQUOTES_DATA_ROOT -Directory -ErrorAction SilentlyContinue

    $validTerminals = @()
    foreach ($folder in $hashFolders) {
        $mql5Path = Join-Path $folder.FullName "MQL5"
        if (Test-Path $mql5Path) {
            $validTerminals += @{
                path = $folder.FullName
                expertsPath = Join-Path $mql5Path "Experts"
                lastModified = $folder.LastWriteTime
            }
        }
    }

    if ($validTerminals.Count -eq 0) {
        return $null
    }

    # Return the most recently modified terminal's Experts path
    $mostRecent = $validTerminals | Sort-Object lastModified -Descending | Select-Object -First 1
    return $mostRecent.expertsPath
}

# Compute file hash for verification
function Get-FileHashValue {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return $null
    }

    return (Get-FileHash -Path $Path -Algorithm SHA256).Hash
}

# Main logic
try {
    # Step 1: Validate source file exists
    if (-not (Test-Path $SourcePath)) {
        Write-Result -Status "SOURCE_NOT_FOUND" -Message "Source EA file not found" -Data @{
            sourcePath = $SourcePath
        }
        exit 1
    }

    # Get source file info
    $sourceFile = Get-Item $SourcePath
    $sourceHash = Get-FileHashValue -Path $SourcePath

    # Validate it's an .ex5 file
    if ($sourceFile.Extension -ne ".ex5") {
        Write-Result -Status "INVALID_FILE_TYPE" -Message "Source file is not an .ex5 file" -Data @{
            extension = $sourceFile.Extension
            expectedExtension = ".ex5"
        }
        exit 1
    }

    # Determine target filename
    $targetFileName = if ($EAFileName) { $EAFileName } else { $sourceFile.Name }

    # Ensure .ex5 extension
    if (-not $targetFileName.EndsWith(".ex5")) {
        $targetFileName = "$targetFileName.ex5"
    }

    Write-Host "Source file: $($sourceFile.Name) ($([math]::Round($sourceFile.Length / 1KB, 2)) KB)" -ForegroundColor Cyan

    # Step 2: Find MT5 Experts directory
    $expertsPath = Get-MT5ExpertsPath -SpecificHash $TargetHash

    if (-not $expertsPath) {
        Write-Result -Status "EXPERTS_DIR_NOT_FOUND" -Message "MT5 Experts directory not found" -Data @{
            searchPath = $METAQUOTES_DATA_ROOT
            hint = "Ensure MT5 is installed and has been run at least once"
        }
        exit 2
    }

    # Create Experts directory if it doesn't exist
    if (-not (Test-Path $expertsPath)) {
        Write-Host "Creating Experts directory: $expertsPath" -ForegroundColor Yellow
        New-Item -Path $expertsPath -ItemType Directory -Force | Out-Null
    }

    # Step 3: Copy the EA file
    $targetPath = Join-Path $expertsPath $targetFileName

    Write-Host "Copying EA to: $targetPath" -ForegroundColor Cyan

    # Check if file already exists
    $fileExists = Test-Path $targetPath
    $existingHash = if ($fileExists) { Get-FileHashValue -Path $targetPath } else { $null }

    # Copy the file
    try {
        Copy-Item -Path $SourcePath -Destination $targetPath -Force
    }
    catch {
        Write-Result -Status "COPY_FAILED" -Message "Failed to copy EA file: $($_.Exception.Message)" -Data @{
            source = $SourcePath
            target = $targetPath
            error = $_.Exception.Message
        }
        exit 3
    }

    # Step 4: Verify the copy
    if (-not (Test-Path $targetPath)) {
        Write-Result -Status "VERIFICATION_FAILED" -Message "EA file not found after copy" -Data @{
            targetPath = $targetPath
        }
        exit 4
    }

    $targetHash = Get-FileHashValue -Path $targetPath
    $targetFile = Get-Item $targetPath

    if ($sourceHash -ne $targetHash) {
        Write-Result -Status "VERIFICATION_FAILED" -Message "File hash mismatch after copy" -Data @{
            sourceHash = $sourceHash
            targetHash = $targetHash
        }
        exit 4
    }

    # Step 5: Clean up source file (unless KeepSource is specified)
    if (-not $KeepSource) {
        Remove-Item -Path $SourcePath -Force -ErrorAction SilentlyContinue
    }

    # Success
    Write-Result -Status "EA_COPIED" -Message "EA file copied successfully" -Data @{
        fileName = $targetFileName
        targetPath = $targetPath
        expertsDirectory = $expertsPath
        fileSize = $targetFile.Length
        fileHash = $targetHash
        wasOverwritten = $fileExists
        previousHash = $existingHash
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
