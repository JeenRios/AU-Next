/**
 * SSH Client for Windows VPS
 * Uses Windows OpenSSH for remote PowerShell execution
 *
 * Requirements on Windows VPS:
 * - Windows Server 2019/2022 with OpenSSH Server installed
 * - OpenSSH Server service running
 * - Administrator account with SSH access
 *
 * To enable OpenSSH on Windows:
 * 1. Open PowerShell as Administrator
 * 2. Run: Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
 * 3. Run: Start-Service sshd
 * 4. Run: Set-Service -Name sshd -StartupType 'Automatic'
 */

import { Client, ConnectConfig, SFTPWrapper } from 'ssh2';
import { SSHOptions, ScriptResult } from './types';

// SSH2 package may not be installed - we'll handle this gracefully
let SSH2Client: typeof Client | null = null;

try {
  // Dynamic import to avoid build errors if ssh2 is not installed
  const ssh2 = require('ssh2');
  SSH2Client = ssh2.Client;
} catch {
  console.warn('ssh2 package not installed. SSH functionality will be unavailable.');
}

export class SSHClient {
  private client: Client | null = null;
  private connected: boolean = false;
  private options: SSHOptions;

  constructor(options: SSHOptions) {
    this.options = options;
  }

  /**
   * Check if SSH2 is available
   */
  static isAvailable(): boolean {
    return SSH2Client !== null;
  }

  /**
   * Connect to the Windows VPS via SSH
   */
  async connect(): Promise<void> {
    if (!SSH2Client) {
      throw new Error('ssh2 package not installed. Run: npm install ssh2');
    }

    return new Promise((resolve, reject) => {
      this.client = new SSH2Client();

      const config: ConnectConfig = {
        host: this.options.host,
        port: this.options.port,
        username: this.options.username,
        password: this.options.password,
        readyTimeout: this.options.readyTimeout,
        // Windows SSH might not use standard algorithms
        algorithms: {
          kex: [
            'ecdh-sha2-nistp256',
            'ecdh-sha2-nistp384',
            'ecdh-sha2-nistp521',
            'diffie-hellman-group-exchange-sha256',
            'diffie-hellman-group14-sha256',
            'diffie-hellman-group14-sha1',
          ],
          cipher: [
            'aes128-ctr',
            'aes192-ctr',
            'aes256-ctr',
            'aes128-gcm@openssh.com',
            'aes256-gcm@openssh.com',
          ],
        },
      };

      this.client.on('ready', () => {
        this.connected = true;
        resolve();
      });

      this.client.on('error', (err) => {
        this.connected = false;
        reject(new Error(`SSH connection error: ${err.message}`));
      });

      this.client.on('close', () => {
        this.connected = false;
      });

      this.client.connect(config);
    });
  }

  /**
   * Execute a PowerShell command on the remote VPS
   */
  async executeCommand(command: string, timeout?: number): Promise<ScriptResult> {
    if (!this.client || !this.connected) {
      throw new Error('SSH client not connected');
    }

    // Wrap command in PowerShell
    const psCommand = `powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "${command.replace(/"/g, '\\"')}"`;

    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timeoutHandle = timeout ? setTimeout(() => {
        timedOut = true;
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout) : null;

      this.client!.exec(psCommand, (err, stream) => {
        if (err) {
          if (timeoutHandle) clearTimeout(timeoutHandle);
          reject(new Error(`Failed to execute command: ${err.message}`));
          return;
        }

        stream.on('close', (code: number) => {
          if (timedOut) return;
          if (timeoutHandle) clearTimeout(timeoutHandle);

          const result: ScriptResult = {
            exitCode: code ?? 0,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
          };

          // Try to parse JSON output
          try {
            const lastLine = stdout.trim().split('\n').pop() || '';
            if (lastLine.startsWith('{') && lastLine.endsWith('}')) {
              result.parsed = JSON.parse(lastLine);
            }
          } catch {
            // Not JSON output, that's fine
          }

          resolve(result);
        });

        stream.on('data', (data: Buffer) => {
          stdout += data.toString();
        });

        stream.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });
      });
    });
  }

  /**
   * Execute a PowerShell script file on the remote VPS
   */
  async executeScript(scriptPath: string, args: string[] = [], timeout?: number): Promise<ScriptResult> {
    const argsStr = args.map(arg => {
      // Escape and quote arguments properly
      if (arg.includes(' ') || arg.includes('"')) {
        return `'${arg.replace(/'/g, "''")}'`;
      }
      return arg;
    }).join(' ');

    const command = `& '${scriptPath}' ${argsStr}`;
    return this.executeCommand(command, timeout);
  }

  /**
   * Upload a file to the remote VPS via SFTP
   */
  async uploadFile(localContent: Buffer | string, remotePath: string): Promise<void> {
    if (!this.client || !this.connected) {
      throw new Error('SSH client not connected');
    }

    return new Promise((resolve, reject) => {
      this.client!.sftp((err, sftp: SFTPWrapper) => {
        if (err) {
          reject(new Error(`Failed to start SFTP session: ${err.message}`));
          return;
        }

        const writeStream = sftp.createWriteStream(remotePath);

        writeStream.on('error', (err: Error) => {
          sftp.end();
          reject(new Error(`Failed to write file: ${err.message}`));
        });

        writeStream.on('close', () => {
          sftp.end();
          resolve();
        });

        const content = typeof localContent === 'string'
          ? Buffer.from(localContent, 'utf-8')
          : localContent;

        writeStream.end(content);
      });
    });
  }

  /**
   * Upload a script to a temporary location on the VPS
   */
  async uploadScript(scriptContent: string, scriptName: string): Promise<string> {
    const remotePath = `C:\\Windows\\Temp\\au-provision-${Date.now()}\\${scriptName}`;
    const remoteDir = remotePath.substring(0, remotePath.lastIndexOf('\\'));

    // Create directory
    await this.executeCommand(`New-Item -Path '${remoteDir}' -ItemType Directory -Force`);

    // Upload script
    await this.uploadFile(scriptContent, remotePath);

    return remotePath;
  }

  /**
   * Download a file from the remote VPS via SFTP
   */
  async downloadFile(remotePath: string): Promise<Buffer> {
    if (!this.client || !this.connected) {
      throw new Error('SSH client not connected');
    }

    return new Promise((resolve, reject) => {
      this.client!.sftp((err, sftp: SFTPWrapper) => {
        if (err) {
          reject(new Error(`Failed to start SFTP session: ${err.message}`));
          return;
        }

        const chunks: Buffer[] = [];
        const readStream = sftp.createReadStream(remotePath);

        readStream.on('error', (err: Error) => {
          sftp.end();
          reject(new Error(`Failed to read file: ${err.message}`));
        });

        readStream.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        readStream.on('close', () => {
          sftp.end();
          resolve(Buffer.concat(chunks));
        });
      });
    });
  }

  /**
   * Check if a file exists on the remote VPS
   */
  async fileExists(remotePath: string): Promise<boolean> {
    const result = await this.executeCommand(`Test-Path '${remotePath}'`);
    return result.stdout.toLowerCase().includes('true');
  }

  /**
   * Delete a file or directory on the remote VPS
   */
  async deleteFile(remotePath: string, recursive: boolean = false): Promise<void> {
    const recurseFlag = recursive ? '-Recurse' : '';
    await this.executeCommand(`Remove-Item -Path '${remotePath}' -Force ${recurseFlag} -ErrorAction SilentlyContinue`);
  }

  /**
   * Disconnect from the VPS
   */
  disconnect(): void {
    if (this.client) {
      this.client.end();
      this.client = null;
      this.connected = false;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * Create an SSH client with default Windows SSH settings
 */
export function createSSHClient(
  host: string,
  username: string,
  password: string,
  port: number = 22
): SSHClient {
  return new SSHClient({
    host,
    port,
    username,
    password,
    timeout: 30000,
    readyTimeout: 30000,
  });
}
