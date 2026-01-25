# VPS Provisioning System

This document describes the Phase 1 VPS provisioning system for automated MT5 trading setup.

## Overview

The VPS provisioning system enables administrators to automatically:
1. Connect to a user-provided Windows VPS
2. Install MetaTrader 5 silently
3. Copy a compiled EA (.ex5) file to the Experts folder
4. Report provisioning status back to the website

### What's NOT in Phase 1 Scope
- MT5 account login
- EA attachment to charts
- Trading logic
- EA parameter configuration

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Admin Dashboard                           │
│                    (VPSManagement.tsx)                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js API Route                              │
│               /api/vps/provision-vps                            │
│  • POST - Start provisioning                                    │
│  • GET  - Get provisioning status                               │
│  • PATCH - Test VPS connection                                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│               VPS Provisioning Service                           │
│              (lib/vps-provisioning/)                            │
│  • SSH Client for Windows                                       │
│  • Script management                                            │
│  • Progress tracking                                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼ SSH (Port 22)
┌─────────────────────────────────────────────────────────────────┐
│                     Windows VPS                                  │
│               (Windows Server 2019/2022)                        │
│                                                                 │
│  PowerShell Scripts:                                            │
│  ├── install_mt5.ps1    - Download & install MT5               │
│  ├── find_mt5_path.ps1  - Find MT5 data directory              │
│  ├── copy_ea.ps1        - Copy EA to Experts folder            │
│  └── cleanup.ps1        - Remove temporary files               │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

### On the Server (Next.js)
```bash
# Install SSH2 package for SSH connectivity
npm install ssh2 @types/ssh2
```

### On the Windows VPS
The VPS must have:
1. **Windows Server 2019 or 2022**
2. **OpenSSH Server** enabled and running
3. **Administrator account** with SSH access
4. **Internet access** for downloading MT5

#### Enable OpenSSH on Windows VPS
Run these commands in PowerShell as Administrator:
```powershell
# Install OpenSSH Server
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Start the SSH service
Start-Service sshd

# Set SSH service to start automatically
Set-Service -Name sshd -StartupType 'Automatic'

# Confirm service is running
Get-Service sshd
```

## Setup

### 1. Configure Environment Variables

Add to your `.env` or `.env.local`:

```env
# Path to the EA file (stored securely on server, NOT in public folder)
EA_FILE_PATH=/path/to/private/ea/AutoTrader.ex5
EA_FILE_NAME=AutoTrader.ex5
```

### 2. Create EA Storage Directory

```bash
# Create a private directory for EA files (outside public folder)
mkdir -p private/ea

# Place your compiled EA file there
cp YourEA.ex5 private/ea/AutoTrader.ex5
```

### 3. Run Database Migrations

Visit `/api/migrate-db` as an admin user to ensure the required database tables exist:
- `automation_jobs` - Tracks provisioning job status
- `vps_instances` - Stores VPS configuration

## API Reference

### POST /api/vps/provision-vps
Start VPS provisioning.

**Request:**
```json
{
  "vps_id": 123,
  "skip_mt5_install": false,
  "skip_ea_copy": false,
  "force_reinstall": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Provisioning started",
  "job_id": 456,
  "status": "pending"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "VPS credentials not configured"
}
```

### GET /api/vps/provision-vps
Get provisioning job status.

**Query Parameters:**
- `job_id` - Specific job ID
- `vps_id` - VPS instance ID (returns latest job)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "vps_id": 123,
    "vps_name": "MT5-12345",
    "status": "running",
    "progress": 50,
    "message": "Installing MetaTrader 5",
    "steps": [
      {
        "step": "connect",
        "status": "completed",
        "message": "Connected to VPS",
        "startedAt": "2024-01-15T10:00:00Z",
        "completedAt": "2024-01-15T10:00:05Z"
      },
      {
        "step": "install_mt5",
        "status": "running",
        "message": "Installing MetaTrader 5",
        "startedAt": "2024-01-15T10:00:06Z"
      }
    ],
    "started_at": "2024-01-15T10:00:00Z"
  }
}
```

### PATCH /api/vps/provision-vps
Test VPS connection.

**Request (with VPS ID):**
```json
{
  "vps_id": 123
}
```

**Request (with direct credentials):**
```json
{
  "host": "192.168.1.100",
  "username": "Administrator",
  "password": "SecurePassword123",
  "port": 22
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connection successful",
  "data": {
    "hostname": "WIN-SERVER-01",
    "connected": true
  }
}
```

## Provisioning Flow

### Status Progression

```
PENDING → CONNECTING → CONNECTED → INSTALLING_MT5 → MT5_INSTALLED
    → FINDING_MT5_PATH → MT5_PATH_FOUND → COPYING_EA → EA_COPIED
    → CLEANING_UP → COMPLETED

At any point:
    → FAILED (with error message)
```

### Detailed Steps

| Step | Description | Timeout |
|------|-------------|---------|
| `connect` | Establish SSH connection to VPS | 30s |
| `upload_scripts` | Upload PowerShell scripts to temp directory | 30s |
| `install_mt5` | Download and install MT5 silently | 3 min |
| `find_mt5_path` | Locate MT5 data directory dynamically | 30s |
| `copy_ea` | Copy EA file to Experts folder | 30s |
| `cleanup` | Remove temporary files | 30s |

## PowerShell Scripts

### install_mt5.ps1
Downloads MT5 from the official source and installs silently.

**Exit Codes:**
- `0` - Success (MT5 installed or already present)
- `1` - Download failed
- `2` - Installation failed
- `3` - Verification failed

**Features:**
- Downloads from official MQL5 CDN
- Uses `/auto` flag for silent installation
- Verifies installation before returning success
- Cleans up installer after completion

### find_mt5_path.ps1
Dynamically finds the MT5 data directory.

**Why Dynamic Detection?**
MT5 stores data in `%APPDATA%\MetaQuotes\Terminal\<HASH>\` where `<HASH>` varies per installation. Hardcoding this path would break on different machines.

**Features:**
- Scans for all MT5 terminal data directories
- Returns the most recently used terminal if multiple exist
- Can optionally run MT5 to create data directory if missing
- Creates Experts folder if it doesn't exist

### copy_ea.ps1
Copies the EA file to the correct location.

**Parameters:**
- `-SourcePath` - Path to uploaded EA file (required)
- `-EAFileName` - Target filename (optional)
- `-KeepSource` - Don't delete source after copy
- `-TargetHash` - Specific terminal hash to use

**Features:**
- Validates source file exists and is .ex5
- Creates Experts directory if needed
- Verifies copy with SHA256 hash comparison
- Cleans up source file after successful copy

### cleanup.ps1
Removes temporary files created during provisioning.

**Features:**
- Removes uploaded scripts
- Cleans MT5 installer
- Removes temporary EA files
- Idempotent - safe to run multiple times

## Security Considerations

### EA File Protection
- EA file is stored in `private/` directory (not accessible via HTTP)
- EA is only transferred during provisioning via SSH
- Temporary EA file is deleted after copy

### Credential Handling
- VPS password is encrypted in database using AES-256-GCM
- Password is only decrypted during provisioning
- Credentials are never logged
- SSH connection uses secure algorithms

### Temporary Files
- All scripts uploaded to `C:\Windows\Temp\au-provision-<timestamp>\`
- Cleanup runs after provisioning (success or failure)
- No sensitive data persists on VPS after cleanup

## Troubleshooting

### "ssh2 package not installed"
```bash
npm install ssh2 @types/ssh2
```

### "Connection refused" or "Connection timeout"
1. Verify OpenSSH Server is running on VPS:
   ```powershell
   Get-Service sshd
   ```
2. Check Windows Firewall allows port 22:
   ```powershell
   Get-NetFirewallRule -DisplayName "*SSH*"
   ```
3. Test SSH locally on VPS:
   ```powershell
   ssh localhost
   ```

### "Authentication failed"
1. Verify username is correct (usually `Administrator`)
2. Ensure password hasn't expired
3. Check SSH allows password authentication:
   ```powershell
   notepad C:\ProgramData\ssh\sshd_config
   # Look for: PasswordAuthentication yes
   ```

### "MT5 installation failed"
1. Check VPS has internet access
2. Verify sufficient disk space (at least 500MB free)
3. Check Windows Defender isn't blocking the download
4. Review provisioning job logs for specific error

### "EA copy failed"
1. Ensure MT5 was run at least once to create data directory
2. Check Experts folder permissions
3. Verify EA file exists on server at configured path

## Example JSON Responses

### Successful Provisioning
```json
{
  "success": true,
  "status": "COMPLETED",
  "message": "VPS provisioning completed successfully",
  "steps": [
    {
      "step": "connect",
      "status": "completed",
      "message": "Connected to VPS",
      "data": { "host": "192.168.1.100" }
    },
    {
      "step": "upload_scripts",
      "status": "completed",
      "message": "Scripts uploaded"
    },
    {
      "step": "install_mt5",
      "status": "completed",
      "message": "MetaTrader 5 installed",
      "data": { "installPath": "C:\\Program Files\\MetaTrader 5" }
    },
    {
      "step": "find_mt5_path",
      "status": "completed",
      "message": "MT5 data directory found",
      "data": {
        "dataPath": "C:\\Users\\Administrator\\AppData\\Roaming\\MetaQuotes\\Terminal\\ABC123...",
        "expertsPath": "...\\MQL5\\Experts"
      }
    },
    {
      "step": "copy_ea",
      "status": "completed",
      "message": "EA file copied",
      "data": {
        "fileName": "AutoTrader.ex5",
        "targetPath": "...\\MQL5\\Experts\\AutoTrader.ex5"
      }
    },
    {
      "step": "cleanup",
      "status": "completed",
      "message": "Cleanup complete"
    }
  ],
  "mt5Path": "C:\\Users\\Administrator\\AppData\\Roaming\\MetaQuotes\\Terminal\\ABC123...",
  "expertsPath": "...\\MQL5\\Experts",
  "eaPath": "...\\MQL5\\Experts\\AutoTrader.ex5",
  "duration": 125000
}
```

### Failed Provisioning
```json
{
  "success": false,
  "status": "FAILED",
  "message": "SSH connection error: Connection refused",
  "steps": [
    {
      "step": "connect",
      "status": "failed",
      "message": "Connecting to VPS",
      "error": "Connection refused"
    }
  ],
  "duration": 30000,
  "error": "SSH connection error: Connection refused",
  "errorDetails": {
    "step": "connect",
    "code": "ECONNREFUSED"
  }
}
```

## Folder Structure

```
lib/vps-provisioning/
├── index.ts              # Main provisioning service
├── types.ts              # TypeScript type definitions
├── ssh-client.ts         # SSH client wrapper
└── scripts/
    ├── install_mt5.ps1   # MT5 installation script
    ├── find_mt5_path.ps1 # Path detection script
    ├── copy_ea.ps1       # EA copy script
    └── cleanup.ps1       # Cleanup script

app/api/vps/
├── route.ts              # VPS CRUD operations
├── provision/route.ts    # Vultr auto-provisioning
└── provision-vps/route.ts # MT5+EA provisioning

private/ea/
└── AutoTrader.ex5        # EA file (not publicly accessible)
```

## Related Documentation
- [VPS Provider Integration](./VULTR_INTEGRATION.md) - Auto-provisioning VPS from cloud providers
- [MT5 Trading Integration](../CLAUDE.md#mt5-trading-integration) - MT5 service documentation
