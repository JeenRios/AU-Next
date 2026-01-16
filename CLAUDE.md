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
- `/api/health` - Health check
- `/api/stats` - Trading statistics
- `/api/trades` - Trade CRUD operations (returns `profit_loss` aliased as `profit`)
- `/api/login` - Authentication (uses bcrypt password verification)
- `/api/users` - User management
- `/api/init` - Database initialization
- `/api/mt5/connect` - MT5 account connection (GET, POST, PATCH)
- `/api/notifications` - User notifications
- `/api/tickets` - Support tickets
- `/api/transactions` - Transaction history
- `/api/community` - Community posts feed (GET, POST, PATCH for likes)
- `/api/landing-stats` - Public stats for landing page
- `/api/migrate-db` - Database migrations

### Database Layer
- `lib/db.ts` - PostgreSQL connection pool (singleton pattern) with `query()` helper
- `lib/redis.ts` - Optional Redis caching with `getCachedData()`, `setCachedData()`, `deleteCachedData()`
- `lib/auth.ts` - Password hashing with bcrypt (`hashPassword()`, `verifyPassword()`)

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
- `mt5_accounts` - Connected MT5/MT4 trading accounts
- `community_posts` - Social feed posts
- `notifications`, `support_tickets`, `audit_logs`

### Environment Variables
Required:
- `DATABASE_URL` - PostgreSQL connection string

Optional:
- `REDIS_URL` - Redis connection string (caching disabled if not set)

### Path Aliases
Uses `@/*` alias mapping to project root (configured in tsconfig.json).

## Deployment

Configured for Dokploy deployment with standalone Next.js output. The Dockerfile uses multi-stage build and runs on port 3001 in production.
