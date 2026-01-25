# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AU-Next is an automated trading platform built with Next.js 14, PostgreSQL, and Redis. It uses the App Router with route groups for organizing pages by access level.

## Common Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run db:check     # Check database connection
npm run db:setup     # Create database tables
npm run db:seed      # Seed database with sample data
```

## Architecture

### Route Groups
The app uses Next.js route groups to organize pages by access level without affecting URL paths:
- `app/(auth)/` - Authentication pages (login)
- `app/(user)/` - User-protected pages (dashboard, trades, profile)
- `app/(admin)/` - Admin-protected pages (admin dashboard, analytics)
- `app/(landing)/` - Public landing pages

### API Routes
API routes are in `app/api/` with each endpoint in its own folder:
- `/api/health` - Health check (public)
- `/api/stats` - Trading statistics
- `/api/trades` - Trade CRUD operations (returns `profit_loss` aliased as `profit`)
- `/api/login` - Authentication with rate limiting (5 attempts/min per IP)
- `/api/logout` - Session destruction
- `/api/session` - Get current session info (public)
- `/api/users` - User management (admin only)
- `/api/init` - Database initialization
- `/api/mt5/connect` - MT5 account connection with encrypted credentials (auth required, PATCH admin only)
- `/api/mt5/status` - On-demand MT5 account status refresh (GET returns live data, POST bulk refresh admin only)
- `/api/notifications` - User notifications (GET, POST admin, PATCH mark read)
- `/api/tickets` - Support tickets
- `/api/transactions` - Transaction history
- `/api/community` - Community posts feed (GET, POST, PATCH for likes)
- `/api/landing-stats` - Public stats for landing page
- `/api/migrate-db` - Database migrations (admin only)
- `/api/vps` - VPS instance management (admin only, CRUD operations)
- `/api/vps/provision` - Auto-provision VPS via providers like Vultr (admin only)
- `/api/vps/provision-vps` - Provision MT5 + EA on VPS (admin only, POST start, GET status, PATCH test connection)
- `/api/automation/jobs` - Automation job tracking (admin CRUD, user read)
- `/api/automation/deploy-ea` - EA deployment trigger (admin only)

### Database Layer
- `lib/db.ts` - PostgreSQL connection pool (singleton pattern) with `query()` helper
- `lib/redis.ts` - Redis for sessions, rate limiting, and optional caching
- `lib/auth.ts` - Security utilities:
  - Password hashing: `hashPassword()`, `verifyPassword()`
  - Session management: `createSession()`, `getSession()`, `destroySession()`
  - Auth guards: `requireAuth()`, `requireAdmin()`
  - Rate limiting: `checkRateLimit(key, maxRequests, windowSeconds)`
  - Encryption: `encrypt()`, `decrypt()` for MT5 credentials

### Key Components
- `components/ModalProvider.tsx` - Context provider for confirm/alert modals, wraps app in root layout
- `components/LoginModal.tsx` - Authentication modal
- `components/Navbar.tsx` - Navigation component
- `components/Toast.tsx` - Toast notifications

### Database Schema
Key tables (created by `npm run db:setup`):
- `users` - Authentication (email, bcrypt-hashed password, role)
- `user_profiles` - Personal info, KYC status, trading account details
- `trades` - Trading history with `profit_loss` column (aliased as `profit` in API responses)
- `transactions` - Deposits and withdrawals
- `mt5_accounts` - Connected MT5/MT4 trading accounts with automation fields (automation_status, gain_percentage, etc.)
- `vps_instances` - VPS tracking for automated trading (linked to mt5_accounts, provider-agnostic with `provider`, `provider_instance_id`, `provider_region`, `provider_plan`, `provider_metadata` columns)
- `automation_jobs` - EA deployment and automation job tracking
- `community_posts` - Social feed posts
- `notifications`, `support_tickets`, `audit_logs`

### Environment Variables
Required:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string (required for sessions and rate limiting)

Optional:
- `ENCRYPTION_KEY` - 32-byte hex key for MT5 credential encryption (auto-generated if not set)
- `VULTR_API_KEY` - Vultr API key for auto-provisioning VPS instances
- `EA_FILE_PATH` - Path to EA file for provisioning (default: `private/ea/AutoTrader.ex5`)
- `EA_FILE_NAME` - Target filename for EA on VPS (default: `AutoTrader.ex5`)

### Path Aliases
Uses `@/*` alias mapping to project root (configured in tsconfig.json).

## Security

### Authentication & Sessions
- HTTP-only cookies with Redis-backed session tokens
- Sessions expire after 7 days
- `middleware.ts` protects routes and adds security headers (X-Frame-Options, X-XSS-Protection, etc.)

### Rate Limiting
- Login: 5 attempts per minute per IP
- Uses Redis sliding window algorithm
- Returns 429 with Retry-After header when exceeded

### Authorization
- `requireAuth()` - Validates session exists
- `requireAdmin()` - Validates session and admin role
- Admin-only endpoints: `/api/users`, `/api/migrate-db`, MT5 PATCH operations

### Data Protection
- Passwords hashed with bcrypt (10 salt rounds)
- MT5 credentials encrypted with AES-256-GCM
- Encrypted data format: `iv:authTag:ciphertext`

### Audit Logging
- MT5 sync failures logged to `audit_logs` table with details
- Logs include operation type, error message, and timestamp

## MT5 Trading Integration

### Architecture
```
Next.js App → /api/mt5/trading → Python MT5 Service → MT5 Terminal
```

### Python MT5 Service
Located in `mt5-service/` directory. Requires Windows with MT5 terminal installed.

```bash
cd mt5-service
pip install -r requirements.txt
python app.py
```

### MT5 Service Endpoints
- `GET /health` - Service health check
- `POST /initialize` - Initialize MT5 terminal
- `POST /login` - Login to MT5 account
- `GET /account` - Get account info
- `POST /account/extended` - Extended account info with positions summary
- `GET /positions` - Get open positions
- `POST /trade/open` - Open new trade
- `POST /trade/close` - Close position
- `POST /trade/modify` - Modify SL/TP
- `POST /ea/status` - Check EA status (by magic number)

### Environment Variables for MT5
```
MT5_SERVICE_URL=http://localhost:5000
MT5_SERVICE_API_KEY=your-api-key
```

## Automated Trading System

### Workflow
1. User submits MT5 connection request with credentials
2. Admin receives notification and approves/rejects request
3. Admin creates VPS instance for the account
4. Admin triggers EA deployment when VPS is ready
5. System sends notifications at each status change
6. User can check real-time status on dashboard

### Automation Status Flow
```
none → vps_provisioning → vps_ready → ea_deploying → active
                                                    ↓
                                                  error
```

### Key Components
- `lib/notifications.ts` - Notification helper functions and templates
- `components/admin/VPSManagement.tsx` - VPS instance management UI
- `components/admin/AutomationJobs.tsx` - Job tracking UI
- `components/dashboard/MT5AccountStatus.tsx` - User account status with timeline

### VPS Provider Integration
The system supports multiple VPS providers with a provider-agnostic database schema:
- `lib/vultr.ts` - Vultr API client (currently implemented)
- `app/api/vps/provision/route.ts` - Auto-provisioning API endpoint
- Database columns: `provider`, `provider_instance_id`, `provider_region`, `provider_plan`, `provider_metadata`

To add a new provider, create a client library in `lib/` and add provider-specific logic to the provisioning API.
See `docs/VULTR_INTEGRATION.md` for detailed documentation.

### VPS Provisioning (MT5 + EA Installation)
Phase 1 provisioning system for setting up MT5 and copying EA files:

**Components:**
- `lib/vps-provisioning/` - Provisioning service library
  - `index.ts` - Main orchestrator
  - `ssh-client.ts` - SSH client wrapper for Windows
  - `types.ts` - TypeScript definitions
  - `scripts/` - PowerShell scripts (install_mt5.ps1, find_mt5_path.ps1, copy_ea.ps1, cleanup.ps1)
- `app/api/vps/provision-vps/route.ts` - Provisioning API

**Requirements:**
- `npm install ssh2 @types/ssh2` - SSH connectivity
- OpenSSH Server enabled on Windows VPS
- EA file stored in `private/ea/` directory

**Provisioning Flow:**
1. Connect to VPS via SSH
2. Upload PowerShell scripts
3. Install MT5 silently
4. Find MT5 data directory dynamically
5. Copy EA to Experts folder
6. Cleanup temporary files

See `docs/VPS_PROVISIONING.md` for detailed documentation.

### Notification Types
- `mt5_request` - Admin: New connection request
- `mt5_approved` / `mt5_rejected` - User: Request decision
- `vps_provisioning` / `vps_ready` - User: VPS status updates
- `ea_deploying` / `ea_deployed` / `ea_deploy_failed` - EA deployment updates

## Admin UI Components

### Drawer Components (in `components/admin/`)
These are reusable slide-out panel components used in the admin dashboard:

- `SlideOutPanel.tsx` - Base wrapper component for all drawers (handles backdrop, animation, close behavior)
- `UserDetailDrawer.tsx` - Shows user profile, account info, KYC status (actions: Edit, Delete)
- `TicketDetailDrawer.tsx` - Shows ticket details with user info (actions: Reply, Mark Resolved)
- `NotificationDetailDrawer.tsx` - Shows notification details with type styling (action: Mark as Read)

### How Drawers Work
1. Parent component manages `isOpen` state and `selectedItem` data
2. Drawer component receives `isOpen`, `onClose`, and item data as props
3. `SlideOutPanel` handles animation internally (no external animation state needed)
4. Action callbacks (onEdit, onDelete, etc.) are passed as optional props

## Refactoring Guidelines

**IMPORTANT: Follow these rules when modifying or refactoring code to prevent losing existing features.**

### Before Making Changes
1. **Read the entire file** before modifying - understand all existing features
2. **Document existing interactive features**: clickable elements, modals, drawers, expandable sections
3. **Note all state variables and their purposes** - check what each state controls
4. **Check for component imports** - ensure you know what external components are being used

### During Refactoring
1. **Preserve all functionality** - if you're extracting code to a component, ensure ALL features are moved
2. **Don't silently remove features** - if something must be removed, explicitly note it
3. **Test click handlers** - ensure all clickable items still have their handlers connected
4. **Verify state connections** - extracted components must receive all necessary state/callbacks as props

### Component Extraction Pattern
When extracting inline code to a reusable component:
```tsx
// 1. Create interface with ALL required props
interface ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  data: DataType | null;
  onAction1?: (item: DataType) => void;  // Include all action callbacks
  onAction2?: (id: number) => void;
}

// 2. In parent, replace inline code with component usage
<MyComponent
  isOpen={showDetails}
  onClose={closeDetails}
  data={selectedItem}
  onAction1={handleAction1}
  onAction2={handleAction2}
/>
```

### Checklist After Refactoring
- [ ] All clickable items still work
- [ ] All modals/drawers still open and close
- [ ] All form submissions still function
- [ ] All action buttons (edit, delete, etc.) still trigger correct behavior
- [ ] No console errors related to missing handlers or props

## Deployment

Configured for Dokploy deployment with standalone Next.js output. The Dockerfile uses multi-stage build and runs on port 3001 in production.
