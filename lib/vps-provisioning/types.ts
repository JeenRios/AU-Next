/**
 * VPS Provisioning Types
 * Type definitions for the VPS provisioning system
 */

// Provisioning status codes
export type ProvisioningStatus =
  | 'PENDING'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'INSTALLING_MT5'
  | 'MT5_INSTALLED'
  | 'FINDING_MT5_PATH'
  | 'MT5_PATH_FOUND'
  | 'COPYING_EA'
  | 'EA_COPIED'
  | 'CLEANING_UP'
  | 'COMPLETED'
  | 'FAILED';

// Provisioning step for detailed tracking
export interface ProvisioningStep {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  message?: string;
  startedAt?: string;
  completedAt?: string;
  data?: Record<string, any>;
  error?: string;
}

// VPS Connection credentials
export interface VPSCredentials {
  host: string;           // IP address or hostname
  port?: number;          // SSH port (default: 22) or WinRM port (default: 5985/5986)
  username: string;       // Administrator username
  password: string;       // Administrator password (used only during provisioning)
  useSSH?: boolean;       // Use SSH instead of WinRM (default: true for OpenSSH)
  useTLS?: boolean;       // Use TLS for WinRM (default: true)
}

// EA file configuration
export interface EAConfig {
  sourceBuffer?: Buffer;  // EA file content as buffer
  sourcePath?: string;    // Path to EA file on server (for local testing)
  fileName: string;       // Target filename for the EA
}

// Provisioning options
export interface ProvisioningOptions {
  forceReinstall?: boolean;     // Force MT5 reinstall even if already installed
  skipMT5Install?: boolean;     // Skip MT5 installation (for testing)
  skipEACopy?: boolean;         // Skip EA copy (for testing)
  timeout?: number;             // Overall timeout in milliseconds (default: 600000 = 10 min)
  stepTimeout?: number;         // Timeout per step in milliseconds (default: 180000 = 3 min)
  cleanupOnFailure?: boolean;   // Run cleanup on failure (default: true)
  onProgress?: (step: ProvisioningStep) => void;  // Progress callback
}

// Script execution result
export interface ScriptResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  parsed?: {
    status: string;
    message: string;
    timestamp: string;
    data: Record<string, any>;
  };
}

// Provisioning result
export interface ProvisioningResult {
  success: boolean;
  status: ProvisioningStatus;
  message: string;
  steps: ProvisioningStep[];
  mt5Path?: string;
  expertsPath?: string;
  eaPath?: string;
  duration?: number;
  error?: string;
  errorDetails?: Record<string, any>;
}

// Database record for provisioning job
export interface ProvisioningJob {
  id: number;
  vps_instance_id: number;
  status: ProvisioningStatus;
  current_step: string;
  steps: ProvisioningStep[];
  started_at: string;
  completed_at?: string;
  error_message?: string;
  created_by: number;
  created_at: string;
}

// WinRM specific options
export interface WinRMOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  useTLS: boolean;
  timeout: number;
  maxRetries: number;
}

// SSH specific options
export interface SSHOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  timeout: number;
  readyTimeout: number;
}
