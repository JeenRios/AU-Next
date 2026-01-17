import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { notifyUser, notifyAdmins, NotificationTemplates } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// POST - Trigger EA deployment (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const {
      mt5_account_id,
      ea_config = {}
    } = await request.json();

    // Validate required fields
    if (!mt5_account_id) {
      return NextResponse.json(
        { success: false, error: 'mt5_account_id is required' },
        { status: 400 }
      );
    }

    // Get MT5 account details
    const mt5Result = await query(
      `SELECT m.*, u.email as user_email FROM mt5_accounts m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.id = $1`,
      [mt5_account_id]
    );

    if (mt5Result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'MT5 account not found' },
        { status: 404 }
      );
    }

    const mt5Account = mt5Result.rows[0];

    // Check if MT5 account is active
    if (mt5Account.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'MT5 account must be active before deploying EA' },
        { status: 400 }
      );
    }

    // Get VPS instance for this MT5 account
    const vpsResult = await query(
      `SELECT * FROM vps_instances WHERE mt5_account_id = $1`,
      [mt5_account_id]
    );

    if (vpsResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No VPS instance found for this MT5 account. Please set up VPS first.' },
        { status: 400 }
      );
    }

    const vpsInstance = vpsResult.rows[0];

    // Check if VPS is active
    if (vpsInstance.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'VPS instance must be active before deploying EA' },
        { status: 400 }
      );
    }

    // Check if there's already a pending/running EA deployment job
    const existingJob = await query(
      `SELECT id FROM automation_jobs
       WHERE mt5_account_id = $1 AND job_type = 'ea_deploy' AND status IN ('pending', 'running')`,
      [mt5_account_id]
    );

    if (existingJob.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'EA deployment already in progress for this account' },
        { status: 409 }
      );
    }

    // Create EA deployment job
    const jobResult = await query(
      `INSERT INTO automation_jobs
       (mt5_account_id, vps_instance_id, job_type, status, created_by, metadata)
       VALUES ($1, $2, 'ea_deploy', 'pending', $3, $4)
       RETURNING *`,
      [mt5_account_id, vpsInstance.id, session.user.id, JSON.stringify({ ea_config })]
    );

    const job = jobResult.rows[0];

    // Update MT5 account automation status
    await query(
      `UPDATE mt5_accounts SET automation_status = 'ea_deploying', updated_at = NOW() WHERE id = $1`,
      [mt5_account_id]
    );

    // Notify user that EA deployment has started
    const notification = NotificationTemplates.eaDeploying(mt5Account.account_number);
    await notifyUser(mt5Account.user_id, notification.type, notification.title, notification.message);

    return NextResponse.json({
      success: true,
      message: 'EA deployment job created successfully',
      data: {
        job_id: job.id,
        mt5_account_id,
        vps_instance_id: vpsInstance.id,
        status: 'pending'
      }
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('EA deploy error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Complete EA deployment (update job status and notify)
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const {
      job_id,
      success: deploymentSuccess,
      error_message
    } = await request.json();

    if (!job_id) {
      return NextResponse.json(
        { success: false, error: 'job_id is required' },
        { status: 400 }
      );
    }

    // Get job details
    const jobResult = await query(
      `SELECT j.*, m.account_number, m.user_id
       FROM automation_jobs j
       LEFT JOIN mt5_accounts m ON j.mt5_account_id = m.id
       WHERE j.id = $1 AND j.job_type = 'ea_deploy'`,
      [job_id]
    );

    if (jobResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'EA deployment job not found' },
        { status: 404 }
      );
    }

    const job = jobResult.rows[0];

    if (deploymentSuccess) {
      // Update job as completed
      await query(
        `UPDATE automation_jobs
         SET status = 'completed', progress = 100, completed_at = NOW(), message = 'EA deployed successfully'
         WHERE id = $1`,
        [job_id]
      );

      // Update MT5 account
      await query(
        `UPDATE mt5_accounts
         SET automation_status = 'active', ea_status = 'active', updated_at = NOW()
         WHERE id = $1`,
        [job.mt5_account_id]
      );

      // Notify user of success
      const notification = NotificationTemplates.eaDeployed(job.account_number);
      await notifyUser(job.user_id, notification.type, notification.title, notification.message);
    } else {
      // Update job as failed
      await query(
        `UPDATE automation_jobs
         SET status = 'failed', completed_at = NOW(), error_message = $2
         WHERE id = $1`,
        [job_id, error_message || 'Deployment failed']
      );

      // Update MT5 account
      await query(
        `UPDATE mt5_accounts SET automation_status = 'error', updated_at = NOW() WHERE id = $1`,
        [job.mt5_account_id]
      );

      // Notify admins of failure
      const notification = NotificationTemplates.eaDeployFailed(job.account_number, error_message || 'Unknown error');
      await notifyAdmins(notification.type, notification.title, notification.message);
    }

    return NextResponse.json({
      success: true,
      message: deploymentSuccess ? 'EA deployment completed successfully' : 'EA deployment marked as failed'
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('EA deploy completion error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
