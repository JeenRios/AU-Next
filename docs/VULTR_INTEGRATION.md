# VPS Provider Integration

This document describes the VPS provider integration for automated MT5 trading VPS provisioning.

## Overview

The VPS integration allows administrators to automatically provision Windows VPS instances for MT5 automated trading directly from the admin dashboard. This eliminates the need for manual VPS setup and provides a streamlined workflow for deploying trading automation.

### Supported Providers

| Provider | Status | Notes |
|----------|--------|-------|
| **Vultr** | ✅ Fully Supported | Windows VPS, global regions |
| DigitalOcean | 🔜 Planned | Linux only (Wine for MT5) |
| Linode | 🔜 Planned | Linux only (Wine for MT5) |
| Hetzner | 🔜 Planned | Cost-effective EU option |
| AWS EC2 | 🔜 Planned | Enterprise option |

## Vultr Integration

## Setup

### 1. Get Vultr API Key

1. Log in to your [Vultr account](https://my.vultr.com/)
2. Navigate to **Account** → **API**
3. Click **Enable API** if not already enabled
4. Copy your API key (keep this secure!)

### 2. Configure Environment Variables

Add the following to your `.env` or `.env.local` file:

```env
VULTR_API_KEY=your_vultr_api_key_here
```

### 3. Run Database Migrations

The Vultr integration requires additional database columns. Run migrations:

```bash
# Visit the migrate endpoint as an admin user
GET /api/migrate-db
```

This adds the following provider-agnostic columns to `vps_instances`:
- `provider` - Provider name (e.g., "vultr", "digitalocean", "linode")
- `provider_instance_id` - Provider's unique instance ID
- `provider_region` - Region code (e.g., "ewr", "nyc1", "us-east")
- `provider_plan` - Plan code (e.g., "vc2-1c-2gb", "s-1vcpu-2gb")
- `provider_metadata` - JSONB for provider-specific data (OS ID, hostname, etc.)

## Usage

### Admin Dashboard

1. Navigate to **Admin Dashboard** → **VPS Management**
2. If Vultr is configured, you'll see a green "Vultr Connected" badge
3. Click **Auto-Provision (Vultr)** to create a new VPS

### Auto-Provisioning Form

When creating a VPS, you can configure:

| Field | Description |
|-------|-------------|
| MT5 Account | Select which MT5 account this VPS is for |
| VPS Name | Optional custom name (auto-generated if blank) |
| Region | Data center location (affects latency to broker) |
| Plan | VPS specifications (CPU, RAM, storage) |
| Windows Version | Windows Server version (2016, 2019, 2022) |

### Recommended Regions

Choose a region close to your MT5 broker's servers for lowest latency:

| Region | Location | Best For |
|--------|----------|----------|
| `ewr` | New Jersey, US | US brokers |
| `ord` | Chicago, US | US brokers |
| `lhr` | London, UK | EU/UK brokers |
| `fra` | Frankfurt, DE | EU brokers |
| `ams` | Amsterdam, NL | EU brokers |
| `sgp` | Singapore | Asia brokers |
| `nrt` | Tokyo, JP | Japan brokers |

### Recommended Plans

| Plan | Specs | Monthly Cost | Best For |
|------|-------|--------------|----------|
| Basic (`vc2-1c-2gb`) | 1 vCPU, 2GB RAM | ~$24/mo | Single EA |
| Standard (`vc2-2c-4gb`) | 2 vCPU, 4GB RAM | ~$48/mo | Multiple EAs |
| Performance (`vhf-1c-2gb`) | 1 vCPU, 2GB RAM NVMe | ~$30/mo | High-frequency trading |

## VPS Lifecycle

### Status Flow

```
provisioning → active
     ↓           ↓
   error      decommissioned
```

### Status Descriptions

| Status | Description |
|--------|-------------|
| `provisioning` | Vultr is creating the VPS (usually 1-5 minutes) |
| `active` | VPS is ready and running |
| `error` | Something went wrong during provisioning |
| `decommissioned` | VPS has been shut down |

### Syncing Status

While a VPS is provisioning, click **Sync Vultr Status** to:
- Check the current Vultr status
- Get the assigned IP address when ready
- Update the local database

## API Endpoints

### GET /api/vps/provision

Get Vultr configuration and available options.

**Query Parameters:**
- `action=account` - Get Vultr account info (balance, etc.)
- `action=regions` - List all available regions
- `action=plans` - List Windows-compatible plans
- `action=os` - List Windows OS options
- `action=status&instance_id=xxx` - Get specific instance status

**Response:**
```json
{
  "success": true,
  "configured": true,
  "recommendedPlans": { ... },
  "recommendedRegions": { ... },
  "windowsOS": { ... }
}
```

### POST /api/vps/provision

Create a new Vultr VPS instance.

**Request Body:**
```json
{
  "mt5_account_id": 123,
  "vps_name": "MT5-12345",
  "region": "ewr",
  "plan": "vc2-1c-2gb",
  "os_id": 1713
}
```

**Response:**
```json
{
  "success": true,
  "message": "VPS provisioning started",
  "data": {
    "vps_id": 1,
    "vultr_instance_id": "abc123...",
    "status": "pending",
    "main_ip": null,
    "default_password": "generated_password"
  }
}
```

### PATCH /api/vps/provision

Sync VPS status from Vultr.

**Request Body:**
```json
{
  "vps_id": 1
}
```

### DELETE /api/vps/provision

Delete a VPS instance (both locally and on Vultr).

**Query Parameters:**
- `vps_id` - The local VPS ID to delete

## Vultr Client Library

The Vultr client is located at `lib/vultr.ts` and provides:

```typescript
import { getVultrClient, isVultrConfigured } from '@/lib/vultr';

// Check if Vultr is configured
if (isVultrConfigured()) {
  const vultr = getVultrClient();

  // Available methods:
  await vultr.getAccount();
  await vultr.listRegions();
  await vultr.listPlans('all');
  await vultr.listOS();
  await vultr.getWindowsOS();
  await vultr.createInstance({ ... });
  await vultr.getInstance(instanceId);
  await vultr.listInstances();
  await vultr.deleteInstance(instanceId);
  await vultr.rebootInstance(instanceId);
  await vultr.startInstance(instanceId);
  await vultr.stopInstance(instanceId);
  await vultr.reinstallInstance(instanceId);
  await vultr.getInstanceBandwidth(instanceId);
}
```

## Notifications

The system automatically sends notifications to users:

| Event | Notification |
|-------|--------------|
| VPS creation started | "Your VPS is being provisioned..." |
| VPS ready | "Your VPS is ready! IP: x.x.x.x" |

## Security Considerations

1. **API Key Security**: The Vultr API key is stored as an environment variable and never exposed to the client
2. **Admin Only**: All Vultr operations require admin authentication
3. **Password Handling**: Default VPS passwords are encrypted before storage using AES-256-GCM
4. **Credential Isolation**: Each VPS has isolated credentials per MT5 account

## Troubleshooting

### "Vultr API key not configured"

Ensure `VULTR_API_KEY` is set in your environment variables and the server has been restarted.

### VPS stuck in "provisioning"

1. Click **Sync Vultr Status** to refresh
2. Check Vultr dashboard directly for any issues
3. The VPS may be stuck due to insufficient account balance

### "VPS instance already exists for this MT5 account"

Each MT5 account can only have one VPS. Delete the existing VPS first if you need to create a new one.

### IP address shows as null or 0.0.0.0

The VPS is still being set up. Wait a few minutes and click **Sync Vultr Status**.

## Billing

- Windows VPS instances on Vultr are billed hourly
- The minimum cost is approximately $24/month for the basic plan
- Additional charges may apply for bandwidth overages
- Delete unused instances promptly to avoid charges

## Adding New Providers

The system is designed to be provider-agnostic. To add a new provider:

### 1. Create Provider Client

Create a new file `lib/{provider}.ts` following the Vultr client pattern:

```typescript
// lib/digitalocean.ts
export function getDigitalOceanClient(): DigitalOceanClient { ... }
export function isDigitalOceanConfigured(): boolean { ... }
export const RECOMMENDED_PLANS = { ... };
export const RECOMMENDED_REGIONS = { ... };
```

### 2. Update Provisioning API

Add provider-specific logic in `app/api/vps/provision/route.ts`:

```typescript
// In POST handler
if (provider === 'digitalocean') {
  const doClient = getDigitalOceanClient();
  const droplet = await doClient.createDroplet({ ... });
  // Store with provider: 'digitalocean'
}

// In PATCH handler (sync status)
if (vps.provider === 'digitalocean') {
  const doClient = getDigitalOceanClient();
  const droplet = await doClient.getDroplet(vps.provider_instance_id);
  // Update status
}

// In DELETE handler
if (provider === 'digitalocean') {
  const doClient = getDigitalOceanClient();
  await doClient.deleteDroplet(provider_instance_id);
}
```

### 3. Update Admin UI

Add provider selection and configuration in `VPSManagement.tsx`:

```typescript
// Add provider config state
const [doConfig, setDoConfig] = useState<DOConfig | null>(null);

// Add provider tabs or dropdown in the modal
<select value={provider}>
  <option value="vultr">Vultr</option>
  <option value="digitalocean">DigitalOcean</option>
</select>
```

### 4. Environment Variables

Add the provider's API key to `.env`:

```env
DIGITALOCEAN_API_KEY=your_key_here
LINODE_API_KEY=your_key_here
```

## Related Files

- [lib/vultr.ts](../lib/vultr.ts) - Vultr API client
- [app/api/vps/provision/route.ts](../app/api/vps/provision/route.ts) - Provisioning API
- [components/admin/VPSManagement.tsx](../components/admin/VPSManagement.tsx) - Admin UI
- [lib/notifications.ts](../lib/notifications.ts) - Notification templates
