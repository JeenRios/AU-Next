/**
 * VPS Provisioning Service
 * Main entry point for Phase 1 VPS provisioning
 *
 * This service handles:
 * 1. Connecting to a Windows VPS via SSH
 * 2. Installing MetaTrader 5 silently
 * 3. Finding the MT5 data directory dynamically
 * 4. Copying a compiled EA (.ex5) file to the Experts folder
 * 5. Reporting status back to the website
 *
 * Security:
 * - EA file is never publicly accessible
 * - Credentials are used only during provisioning
 * - Temporary files are cleaned up after use
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { SSHClient, createSSHClient } from './ssh-client';
import {
  VPSCredentials,
  EAConfig,
  ProvisioningOptions,
  ProvisioningResult,
  ProvisioningStep,
  ProvisioningStatus,
  ScriptResult,
} from './types';

// Load PowerShell scripts
const SCRIPTS_DIR = join(__dirname, 'scripts');

function loadScript(name: string): string {
  const scriptPath = join(SCRIPTS_DIR, name);
  if (!existsSync(scriptPath)) {
    throw new Error(`Script not found: ${scriptPath}`);
  }
  return readFileSync(scriptPath, 'utf-8');
}

// Pre-load scripts
let SCRIPT_INSTALL_MT5: string;
let SCRIPT_FIND_MT5_PATH: string;
let SCRIPT_COPY_EA: string;
let SCRIPT_CLEANUP: string;

try {
  SCRIPT_INSTALL_MT5 = loadScript('install_mt5.ps1');
  SCRIPT_FIND_MT5_PATH = loadScript('find_mt5_path.ps1');
  SCRIPT_COPY_EA = loadScript('copy_ea.ps1');
  SCRIPT_CLEANUP = loadScript('cleanup.ps1');
} catch (err) {
  console.warn('PowerShell scripts not loaded:', err);
}

/**
 * Main VPS Provisioning Service
 */
export class VPSProvisioningService {
  private client: SSHClient | null = null;
  private steps: ProvisioningStep[] = [];
  private options: ProvisioningOptions;
  private startTime: number = 0;
  private tempDir: string = '';

  constructor(options: ProvisioningOptions = {}) {
    this.options = {
      forceReinstall: false,
      skipMT5Install: false,
      skipEACopy: false,
      timeout: 600000,      // 10 minutes
      stepTimeout: 180000,  // 3 minutes per step
      cleanupOnFailure: true,
      ...options,
    };
  }

  /**
   * Run the full provisioning process
   */
  async provision(
    credentials: VPSCredentials,
    eaConfig?: EAConfig
  ): Promise<ProvisioningResult> {
    this.startTime = Date.now();
    this.steps = [];
    let result: ProvisioningResult;

    try {
      // Validate inputs
      this.validateCredentials(credentials);
      if (eaConfig && !this.options.skipEACopy) {
        this.validateEAConfig(eaConfig);
      }

      // Step 1: Connect to VPS
      await this.runStep('connect', 'Connecting to VPS', async () => {
        await this.connect(credentials);
        return { host: credentials.host };
      });

      // Step 2: Upload provisioning scripts
      await this.runStep('upload_scripts', 'Uploading provisioning scripts', async () => {
        await this.uploadScripts();
        return { tempDir: this.tempDir };
      });

      // Step 3: Install MT5
      let mt5Installed = false;
      if (!this.options.skipMT5Install) {
        mt5Installed = await this.runStep('install_mt5', 'Installing MetaTrader 5', async () => {
          return await this.installMT5();
        });
      }

      // Step 4: Find MT5 path
      let pathInfo: any = null;
      await this.runStep('find_mt5_path', 'Finding MT5 data directory', async () => {
        pathInfo = await this.findMT5Path();
        return pathInfo;
      });

      // Step 5: Copy EA file
      let eaCopied: any = null;
      if (eaConfig && !this.options.skipEACopy) {
        await this.runStep('copy_ea', 'Copying EA file', async () => {
          eaCopied = await this.copyEA(eaConfig, pathInfo.expertsPath);
          return eaCopied;
        });
      }

      // Step 6: Cleanup
      await this.runStep('cleanup', 'Cleaning up temporary files', async () => {
        await this.cleanup();
        return { cleaned: true };
      });

      // Success
      result = {
        success: true,
        status: 'COMPLETED',
        message: 'VPS provisioning completed successfully',
        steps: this.steps,
        mt5Path: pathInfo?.dataPath,
        expertsPath: pathInfo?.expertsPath,
        eaPath: eaCopied?.targetPath,
        duration: Date.now() - this.startTime,
      };

    } catch (error: any) {
      // Handle failure
      const lastStep = this.steps[this.steps.length - 1];

      // Run cleanup on failure if configured
      if (this.options.cleanupOnFailure && this.client?.isConnected()) {
        try {
          await this.cleanup();
          this.addStep({
            step: 'cleanup_on_failure',
            status: 'completed',
            message: 'Cleanup completed after failure',
          });
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      }

      result = {
        success: false,
        status: 'FAILED',
        message: error.message || 'Provisioning failed',
        steps: this.steps,
        duration: Date.now() - this.startTime,
        error: error.message,
        errorDetails: {
          step: lastStep?.step,
          code: error.code,
          stack: error.stack,
        },
      };
    } finally {
      // Always disconnect
      this.disconnect();
    }

    return result;
  }

  /**
   * Run a single provisioning step with tracking
   */
  private async runStep<T>(
    stepName: string,
    description: string,
    action: () => Promise<T>
  ): Promise<T> {
    const step: ProvisioningStep = {
      step: stepName,
      status: 'running',
      message: description,
      startedAt: new Date().toISOString(),
    };
    this.steps.push(step);
    this.notifyProgress(step);

    try {
      // Check overall timeout
      if (Date.now() - this.startTime > this.options.timeout!) {
        throw new Error('Provisioning timeout exceeded');
      }

      // Run action with step timeout
      const result = await Promise.race([
        action(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Step '${stepName}' timed out`)),
            this.options.stepTimeout
          )
        ),
      ]);

      step.status = 'completed';
      step.completedAt = new Date().toISOString();
      step.data = typeof result === 'object' ? result as Record<string, any> : { result };
      this.notifyProgress(step);

      return result;

    } catch (error: any) {
      step.status = 'failed';
      step.completedAt = new Date().toISOString();
      step.error = error.message;
      this.notifyProgress(step);
      throw error;
    }
  }

  /**
   * Add a step to the tracking list
   */
  private addStep(step: ProvisioningStep): void {
    step.startedAt = step.startedAt || new Date().toISOString();
    step.completedAt = step.completedAt || new Date().toISOString();
    this.steps.push(step);
    this.notifyProgress(step);
  }

  /**
   * Notify progress callback
   */
  private notifyProgress(step: ProvisioningStep): void {
    if (this.options.onProgress) {
      this.options.onProgress(step);
    }
  }

  /**
   * Validate VPS credentials
   */
  private validateCredentials(credentials: VPSCredentials): void {
    if (!credentials.host) {
      throw new Error('VPS host is required');
    }
    if (!credentials.username) {
      throw new Error('VPS username is required');
    }
    if (!credentials.password) {
      throw new Error('VPS password is required');
    }

    // Validate host format (IP or hostname)
    const hostRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$|^(\d{1,3}\.){3}\d{1,3}$/;
    if (!hostRegex.test(credentials.host)) {
      throw new Error('Invalid VPS host format');
    }
  }

  /**
   * Validate EA configuration
   */
  private validateEAConfig(eaConfig: EAConfig): void {
    if (!eaConfig.sourceBuffer && !eaConfig.sourcePath) {
      throw new Error('EA source (buffer or path) is required');
    }
    if (!eaConfig.fileName) {
      throw new Error('EA filename is required');
    }
    if (!eaConfig.fileName.endsWith('.ex5')) {
      throw new Error('EA file must have .ex5 extension');
    }
    if (eaConfig.sourcePath && !existsSync(eaConfig.sourcePath)) {
      throw new Error(`EA source file not found: ${eaConfig.sourcePath}`);
    }
  }

  /**
   * Connect to VPS via SSH
   */
  private async connect(credentials: VPSCredentials): Promise<void> {
    if (!SSHClient.isAvailable()) {
      throw new Error('SSH not available. Install ssh2 package: npm install ssh2');
    }

    this.client = createSSHClient(
      credentials.host,
      credentials.username,
      credentials.password,
      credentials.port || 22
    );

    await this.client.connect();
  }

  /**
   * Disconnect from VPS
   */
  private disconnect(): void {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
  }

  /**
   * Upload provisioning scripts to VPS
   */
  private async uploadScripts(): Promise<void> {
    if (!this.client) throw new Error('Not connected');

    // Create temp directory
    this.tempDir = `C:\\Windows\\Temp\\au-provision-${Date.now()}`;
    await this.client.executeCommand(`New-Item -Path '${this.tempDir}' -ItemType Directory -Force`);

    // Upload scripts
    await this.client.uploadFile(SCRIPT_INSTALL_MT5, `${this.tempDir}\\install_mt5.ps1`);
    await this.client.uploadFile(SCRIPT_FIND_MT5_PATH, `${this.tempDir}\\find_mt5_path.ps1`);
    await this.client.uploadFile(SCRIPT_COPY_EA, `${this.tempDir}\\copy_ea.ps1`);
    await this.client.uploadFile(SCRIPT_CLEANUP, `${this.tempDir}\\cleanup.ps1`);
  }

  /**
   * Install MetaTrader 5
   */
  private async installMT5(): Promise<any> {
    if (!this.client) throw new Error('Not connected');

    const scriptPath = `${this.tempDir}\\install_mt5.ps1`;
    const args = this.options.forceReinstall ? ['-Force'] : [];

    const result = await this.client.executeScript(scriptPath, args, this.options.stepTimeout);

    if (result.exitCode !== 0 && !result.parsed?.status?.includes('ALREADY_INSTALLED')) {
      throw new Error(result.parsed?.message || result.stderr || 'MT5 installation failed');
    }

    return result.parsed?.data || { installed: true };
  }

  /**
   * Find MT5 data directory
   */
  private async findMT5Path(): Promise<any> {
    if (!this.client) throw new Error('Not connected');

    const scriptPath = `${this.tempDir}\\find_mt5_path.ps1`;

    // First try without running terminal
    let result = await this.client.executeScript(scriptPath, ['-CreateIfMissing'], this.options.stepTimeout);

    // If not found, try running terminal to initialize
    if (result.exitCode !== 0 || result.parsed?.status === 'DATA_DIR_NOT_FOUND') {
      result = await this.client.executeScript(scriptPath, ['-RunTerminal', '-CreateIfMissing'], this.options.stepTimeout);
    }

    if (result.exitCode !== 0) {
      throw new Error(result.parsed?.message || result.stderr || 'Failed to find MT5 data directory');
    }

    // Extract path info
    const data = result.parsed?.data;
    if (data?.primary) {
      return data.primary; // Multiple terminals case
    }
    return data; // Single terminal case
  }

  /**
   * Copy EA file to Experts directory
   */
  private async copyEA(eaConfig: EAConfig, expertsPath: string): Promise<any> {
    if (!this.client) throw new Error('Not connected');

    // Upload EA file to temp location
    const tempEAPath = `${this.tempDir}\\${eaConfig.fileName}`;
    const eaContent = eaConfig.sourceBuffer ||
      (eaConfig.sourcePath ? readFileSync(eaConfig.sourcePath) : null);

    if (!eaContent) {
      throw new Error('EA content not available');
    }

    await this.client.uploadFile(eaContent, tempEAPath);

    // Run copy script
    const scriptPath = `${this.tempDir}\\copy_ea.ps1`;
    const result = await this.client.executeScript(
      scriptPath,
      ['-SourcePath', tempEAPath, '-EAFileName', eaConfig.fileName],
      this.options.stepTimeout
    );

    if (result.exitCode !== 0) {
      throw new Error(result.parsed?.message || result.stderr || 'Failed to copy EA file');
    }

    return result.parsed?.data || { copied: true };
  }

  /**
   * Cleanup temporary files
   */
  private async cleanup(): Promise<void> {
    if (!this.client?.isConnected()) return;

    try {
      const scriptPath = `${this.tempDir}\\cleanup.ps1`;
      await this.client.executeScript(
        scriptPath,
        ['-TempDirectory', this.tempDir, '-RemoveScripts'],
        30000 // 30 second timeout for cleanup
      );
    } catch {
      // Try direct deletion as fallback
      try {
        await this.client.deleteFile(this.tempDir, true);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Test connection to VPS (quick connectivity check)
   */
  static async testConnection(credentials: VPSCredentials): Promise<{
    success: boolean;
    message: string;
    details?: Record<string, any>;
  }> {
    let client: SSHClient | null = null;

    try {
      if (!SSHClient.isAvailable()) {
        return {
          success: false,
          message: 'SSH not available. Install ssh2 package.',
        };
      }

      client = createSSHClient(
        credentials.host,
        credentials.username,
        credentials.password,
        credentials.port || 22
      );

      await client.connect();

      // Run a simple command to verify
      const result = await client.executeCommand('hostname', 10000);

      return {
        success: true,
        message: 'Connection successful',
        details: {
          hostname: result.stdout.trim(),
          connected: true,
        },
      };

    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Connection failed',
        details: {
          code: error.code,
        },
      };
    } finally {
      client?.disconnect();
    }
  }
}

// Export types and utilities
export * from './types';
export { SSHClient, createSSHClient } from './ssh-client';

// Default export
export default VPSProvisioningService;
