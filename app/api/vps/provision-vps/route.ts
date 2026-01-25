/**
 * VPS Provisioning API
 * POST /api/vps/provision-vps - Start VPS provisioning
 * GET /api/vps/provision-vps - Get provisioning status
 * PATCH /api/vps/provision-vps - Test VPS connection
 *
 * Phase 1 Scope:
 * - Connect to user-provided Windows VPS
 * - Install MetaTrader 5 silently
 * - Copy compiled EA (.ex5) to Experts folder
 * - Report provisioning status
 *
 * NOT in scope:
 * - MT5 login
 * - EA attachment to chart
 * - Trading logic
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { query } from '@/lib/db';
import { requireAdmin, encrypt, decrypt } from '@/lib/auth';
import { notifyUser, NotificationTemplates } from '@/lib/notifications';

// Dynamic import for provisioning service (may not be available if ssh2 not installed)
let VPSProvisioningService: any = null;
try {
  VPSProvisioningService = require('@/lib/vps-provisioning').VPSProvisioningService;
} catch (err) {
  console.warn('VPS provisioning service not available:', err);
}

export const dynamic = 'force-dynamic';

// EA file location (should be stored securely, not in public folder)
const EA_FILE_PATH = process.env.EA_FILE_PATH || join(process.cwd(), 'private', 'ea', 'AutoTrader.ex5');
const EA_FILE_NAME = process.env.EA_FILE_NAME || 'AutoTrader.ex5';

/**
 * POST - Start VPS provisioning
 *
 * Request body:
 * {
 *   vps_id: number,                  // VPS instance ID
 *   skip_mt5_install?: boolean,      // Skip MT5 installation
 *   skip_ea_copy?: boolean,          // Skip EA file copy
 *   force_reinstall?: boolean,       // Force MT5 reinstall
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   job_id?: number,                 // Provisioning job ID
 *   status: string,
 *   steps?: ProvisioningStep[],
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    // Check if provisioning service is available
    if (!VPSProvisioningService) {
      return NextResponse.json({
        success: false,
        error: 'VPS provisioning service not available. Install ssh2 package: npm install ssh2',
        hint: 'Run: npm install ssh2 @types/ssh2',
      }, { status: 503 });
    }

    const {
      vps_id,
      skip_mt5_install = false,
      skip_ea_copy = false,
      force_reinstall = false,
    } = await request.json();

    // Validate required fields
    if (!vps_id) {
      return NextResponse.json({
        success: false,
        error: 'vps_id is required',
      }, { status: 400 });
    }

    // Get VPS instance with credentials
    const vpsResult = await query(
      `SELECT
        v.*,
        m.account_number,
        m.user_id,
        u.email as user_email
      FROM vps_instances v
      LEFT JOIN mt5_accounts m ON v.mt5_account_id = m.id
      LEFT JOIN users u ON m.user_id = u.id
      WHERE v.id = $1`,
      [vps_id]
    );

    if (vpsResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'VPS instance not found',
      }, { status: 404 });
    }

    const vps = vpsResult.rows[0];

    // Validate VPS has required connection info
    if (!vps.ip_address) {
      return NextResponse.json({
        success: false,
        error: 'VPS IP address not configured',
      }, { status: 400 });
    }

    if (!vps.ssh_username) {
      return NextResponse.json({
        success: false,
        error: 'VPS username not configured',
      }, { status: 400 });
    }

    if (!vps.encrypted_ssh_password) {
      return NextResponse.json({
        success: false,
        error: 'VPS password not configured',
      }, { status: 400 });
    }

    // Check if there's already an active provisioning job
    const existingJob = await query(
      `SELECT id, status FROM automation_jobs
       WHERE vps_instance_id = $1
       AND status IN ('pending', 'running')
       AND job_type = 'provision'`,
      [vps_id]
    );

    if (existingJob.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Provisioning already in progress',
        job_id: existingJob.rows[0].id,
        status: existingJob.rows[0].status,
      }, { status: 409 });
    }

    // Decrypt VPS password
    const password = decrypt(vps.encrypted_ssh_password);

    // Load EA file if needed
    let eaBuffer: Buffer | undefined;
    if (!skip_ea_copy) {
      if (!existsSync(EA_FILE_PATH)) {
        return NextResponse.json({
          success: false,
          error: 'EA file not found on server',
          hint: `Expected at: ${EA_FILE_PATH}`,
        }, { status: 500 });
      }
      eaBuffer = readFileSync(EA_FILE_PATH);
    }

    // Create provisioning job record
    const jobResult = await query(
      `INSERT INTO automation_jobs
       (vps_instance_id, mt5_account_id, job_type, status, progress, message, created_by, metadata)
       VALUES ($1, $2, 'provision', 'pending', 0, 'Initializing...', $3, $4)
       RETURNING id`,
      [
        vps_id,
        vps.mt5_account_id,
        session.user.id,
        JSON.stringify({
          skip_mt5_install,
          skip_ea_copy,
          force_reinstall,
        }),
      ]
    );

    const jobId = jobResult.rows[0].id;

    // Update VPS status
    await query(
      `UPDATE vps_instances SET status = 'provisioning', updated_at = NOW() WHERE id = $1`,
      [vps_id]
    );

    // Update MT5 account automation status
    if (vps.mt5_account_id) {
      await query(
        `UPDATE mt5_accounts SET automation_status = 'vps_provisioning', updated_at = NOW() WHERE id = $1`,
        [vps.mt5_account_id]
      );
    }

    // Start provisioning in background (non-blocking)
    runProvisioning(jobId, vps, password, eaBuffer, {
      skip_mt5_install,
      skip_ea_copy,
      force_reinstall,
    }).catch(err => {
      console.error('Background provisioning error:', err);
    });

    // Notify user
    if (vps.user_id) {
      const notification = NotificationTemplates.vpsProvisioning(vps.account_number);
      await notifyUser(vps.user_id, notification.type, notification.title, notification.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Provisioning started',
      job_id: jobId,
      status: 'pending',
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('Provision VPS error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * GET - Get provisioning status
 *
 * Query params:
 * - job_id: number - Specific job ID
 * - vps_id: number - VPS instance ID (returns latest job)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('job_id');
    const vpsId = searchParams.get('vps_id');

    if (!jobId && !vpsId) {
      return NextResponse.json({
        success: false,
        error: 'job_id or vps_id is required',
      }, { status: 400 });
    }

    let queryText: string;
    let params: any[];

    if (jobId) {
      queryText = `
        SELECT j.*, v.name as vps_name, v.ip_address, m.account_number
        FROM automation_jobs j
        LEFT JOIN vps_instances v ON j.vps_instance_id = v.id
        LEFT JOIN mt5_accounts m ON j.mt5_account_id = m.id
        WHERE j.id = $1 AND j.job_type = 'provision'
      `;
      params = [jobId];
    } else {
      queryText = `
        SELECT j.*, v.name as vps_name, v.ip_address, m.account_number
        FROM automation_jobs j
        LEFT JOIN vps_instances v ON j.vps_instance_id = v.id
        LEFT JOIN mt5_accounts m ON j.mt5_account_id = m.id
        WHERE j.vps_instance_id = $1 AND j.job_type = 'provision'
        ORDER BY j.created_at DESC
        LIMIT 1
      `;
      params = [vpsId];
    }

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Provisioning job not found',
      }, { status: 404 });
    }

    const job = result.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        id: job.id,
        vps_id: job.vps_instance_id,
        vps_name: job.vps_name,
        ip_address: job.ip_address,
        account_number: job.account_number,
        status: job.status,
        progress: job.progress,
        message: job.message,
        error_message: job.error_message,
        steps: job.metadata?.steps || [],
        started_at: job.started_at,
        completed_at: job.completed_at,
        created_at: job.created_at,
        duration: job.completed_at
          ? new Date(job.completed_at).getTime() - new Date(job.started_at || job.created_at).getTime()
          : null,
      },
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('Get provision status error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * PATCH - Test VPS connection
 *
 * Request body:
 * {
 *   vps_id?: number,      // VPS instance ID (uses stored credentials)
 *   host?: string,        // OR direct host
 *   username?: string,    // OR direct username
 *   password?: string,    // OR direct password
 *   port?: number,        // SSH port (default: 22)
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    if (!VPSProvisioningService) {
      return NextResponse.json({
        success: false,
        error: 'VPS provisioning service not available',
      }, { status: 503 });
    }

    const { vps_id, host, username, password, port = 22 } = await request.json();

    let credentials: { host: string; username: string; password: string; port: number };

    if (vps_id) {
      // Get credentials from VPS instance
      const vpsResult = await query(
        `SELECT ip_address, ssh_port, ssh_username, encrypted_ssh_password
         FROM vps_instances WHERE id = $1`,
        [vps_id]
      );

      if (vpsResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'VPS instance not found',
        }, { status: 404 });
      }

      const vps = vpsResult.rows[0];

      if (!vps.ip_address || !vps.ssh_username || !vps.encrypted_ssh_password) {
        return NextResponse.json({
          success: false,
          error: 'VPS credentials not configured',
        }, { status: 400 });
      }

      credentials = {
        host: vps.ip_address,
        username: vps.ssh_username,
        password: decrypt(vps.encrypted_ssh_password),
        port: vps.ssh_port || 22,
      };
    } else {
      // Use direct credentials
      if (!host || !username || !password) {
        return NextResponse.json({
          success: false,
          error: 'host, username, and password are required',
        }, { status: 400 });
      }

      credentials = { host, username, password, port };
    }

    // Test connection
    const result = await VPSProvisioningService.testConnection(credentials);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: result.details,
    }, { status: result.success ? 200 : 400 });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('Test VPS connection error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * Run provisioning in background
 * This function runs asynchronously and updates the database with progress
 */
async function runProvisioning(
  jobId: number,
  vps: any,
  password: string,
  eaBuffer: Buffer | undefined,
  options: {
    skip_mt5_install: boolean;
    skip_ea_copy: boolean;
    force_reinstall: boolean;
  }
): Promise<void> {
  const updateJob = async (
    status: string,
    progress: number,
    message: string,
    steps?: any[],
    error?: string
  ) => {
    await query(
      `UPDATE automation_jobs SET
        status = $1,
        progress = $2,
        message = $3,
        metadata = COALESCE(metadata, '{}')::jsonb || $4::jsonb,
        error_message = $5,
        started_at = COALESCE(started_at, NOW()),
        completed_at = CASE WHEN $1 IN ('completed', 'failed') THEN NOW() ELSE completed_at END,
        updated_at = NOW()
      WHERE id = $6`,
      [
        status,
        progress,
        message,
        JSON.stringify({ steps: steps || [] }),
        error || null,
        jobId,
      ]
    );
  };

  try {
    // Update job to running
    await updateJob('running', 5, 'Starting provisioning...');

    // Create provisioning service
    const service = new VPSProvisioningService({
      skipMT5Install: options.skip_mt5_install,
      skipEACopy: options.skip_ea_copy || !eaBuffer,
      forceReinstall: options.force_reinstall,
      timeout: 600000,  // 10 minutes
      stepTimeout: 180000,  // 3 minutes per step
      onProgress: async (step: any) => {
        // Calculate progress based on step
        const progressMap: Record<string, number> = {
          connect: 15,
          upload_scripts: 25,
          install_mt5: 50,
          find_mt5_path: 70,
          copy_ea: 85,
          cleanup: 95,
        };
        const progress = progressMap[step.step] || 50;
        const status = step.status === 'failed' ? 'failed' : 'running';

        // Don't await here to avoid blocking
        updateJob(status, progress, step.message || step.step).catch(console.error);
      },
    });

    // Run provisioning
    const result = await service.provision(
      {
        host: vps.ip_address,
        username: vps.ssh_username,
        password: password,
        port: vps.ssh_port || 22,
      },
      eaBuffer ? {
        sourceBuffer: eaBuffer,
        fileName: EA_FILE_NAME,
      } : undefined
    );

    if (result.success) {
      // Success
      await updateJob('completed', 100, 'Provisioning completed successfully', result.steps);

      // Update VPS status
      await query(
        `UPDATE vps_instances SET
          status = 'active',
          mt5_path = $1,
          ea_path = $2,
          notes = COALESCE(notes, '') || E'\\n' || $3,
          updated_at = NOW()
        WHERE id = $4`,
        [
          result.mt5Path || null,
          result.eaPath || null,
          `Provisioned at ${new Date().toISOString()}. Duration: ${result.duration}ms`,
          vps.id,
        ]
      );

      // Update MT5 account status
      if (vps.mt5_account_id) {
        await query(
          `UPDATE mt5_accounts SET automation_status = 'vps_ready', updated_at = NOW() WHERE id = $1`,
          [vps.mt5_account_id]
        );
      }

      // Notify user
      if (vps.user_id) {
        const notification = NotificationTemplates.vpsReady(vps.account_number, vps.name);
        await notifyUser(vps.user_id, notification.type, notification.title, notification.message);
      }

    } else {
      // Failure
      await updateJob(
        'failed',
        result.steps.filter(s => s.status === 'completed').length * 20,
        result.message,
        result.steps,
        result.error
      );

      // Update VPS status
      await query(
        `UPDATE vps_instances SET
          status = 'error',
          health_status = 'provisioning_failed',
          notes = COALESCE(notes, '') || E'\\n' || $1,
          updated_at = NOW()
        WHERE id = $2`,
        [
          `Provisioning failed at ${new Date().toISOString()}: ${result.error}`,
          vps.id,
        ]
      );

      // Update MT5 account status
      if (vps.mt5_account_id) {
        await query(
          `UPDATE mt5_accounts SET automation_status = 'error', automation_notes = $1, updated_at = NOW() WHERE id = $2`,
          [result.error, vps.mt5_account_id]
        );
      }
    }

  } catch (error: any) {
    console.error('Provisioning error:', error);

    await updateJob('failed', 0, 'Provisioning failed', [], error.message);

    // Update VPS status
    await query(
      `UPDATE vps_instances SET status = 'error', health_status = 'provisioning_failed', updated_at = NOW() WHERE id = $1`,
      [vps.id]
    );
  }
}
