/**
 * Database Module
 * 
 * This is the main entry point for database operations.
 * All imports from '@/lib/db' will use this file.
 * 
 * Usage:
 *   import { query, getPool, transaction } from '@/lib/db';
 *   import { ALL_TABLES, USERS_TABLE } from '@/lib/db/schema';
 */

// Re-export connection utilities (backward compatible)
export { getPool, query, transaction } from './connection';

// Re-export schema for direct access when needed
export * from './schema';
