import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Job types for automation
export type JobType = 'ea_deploy' | 'ea_configure' | 'ea_start' | 'ea_stop' | 'status_check' | 'vps_health_check';

// Job statuses
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// GET - List automation jobs
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const mt5AccountId = searchParams.get('mt5_account_id');
    const status = searchParams.get('status');
    const jobType = searchParams.get('job_type');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let queryText = `
      SELECT
        j.*,
        m.account_number,
        m.server as mt5_server,
        m.user_id,
        v.name as vps_name,
        v.ip_address as vps_ip,
        u.email as created_by_email
      FROM automation_jobs j
      LEFT JOIN mt5_accounts m ON j.mt5_account_id = m.id
      LEFT JOIN vps_instances v ON j.vps_instance_id = v.id
      LEFT JOIN users u ON j.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Non-admin users can only see their own jobs
    if (session.user.role !== 'admin') {
      queryText += ` AND m.user_id = $${paramIndex++}`;
      params.push(session.user.id);
    }

    if (mt5AccountId) {
      queryText += ` AND j.mt5_account_id = $${paramIndex++}`;
      params.push(mt5AccountId);
    }

    if (status) {
      queryText += ` AND j.status = $${paramIndex++}`;
      params.push(status);
    }

    if (jobType) {
      queryText += ` AND j.job_type = $${paramIndex++}`;
      params.push(jobType);
    }

    queryText += ` ORDER BY j.created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await query(queryText, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Automation jobs fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create automation job (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const {
      mt5_account_id,
      vps_instance_id,
      job_type,
      metadata = {}
    } = await request.json();

    // Validate required fields
    if (!mt5_account_id || !job_type) {
      return NextResponse.json(
        { success: false, error: 'mt5_account_id and job_type are required' },
        { status: 400 }
      );
    }

    // Validate job type
    const validJobTypes: JobType[] = ['ea_deploy', 'ea_configure', 'ea_start', 'ea_stop', 'status_check', 'vps_health_check'];
    if (!validJobTypes.includes(job_type)) {
      return NextResponse.json(
        { success: false, error: `Invalid job_type. Valid types: ${validJobTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if there's already a running job of the same type for this account
    const existingJob = await query(
      `SELECT id FROM automation_jobs
       WHERE mt5_account_id = $1 AND job_type = $2 AND status IN ('pending', 'running')`,
      [mt5_account_id, job_type]
    );

    if (existingJob.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: `A ${job_type} job is already pending or running for this account` },
        { status: 409 }
      );
    }

    // If VPS instance not provided, try to get it from MT5 account
    let actualVpsInstanceId = vps_instance_id;
    if (!actualVpsInstanceId) {
      const vpsResult = await query(
        `SELECT id FROM vps_instances WHERE mt5_account_id = $1`,
        [mt5_account_id]
      );
      if (vpsResult.rows.length > 0) {
        actualVpsInstanceId = vpsResult.rows[0].id;
      }
    }

    // Create job
    const result = await query(
      `INSERT INTO automation_jobs
       (mt5_account_id, vps_instance_id, job_type, status, created_by, metadata)
       VALUES ($1, $2, $3, 'pending', $4, $5)
       RETURNING *`,
      [mt5_account_id, actualVpsInstanceId, job_type, session.user.id, JSON.stringify(metadata)]
    );

    return NextResponse.json({
      success: true,
      message: 'Automation job created successfully',
      data: result.rows[0]
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('Automation job create error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update automation job (admin only)
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const {
      id,
      status,
      progress,
      message,
      error_message
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status) {
      const validStatuses: JobStatus[] = ['pending', 'running', 'completed', 'failed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Valid statuses: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Get existing job
    const existingJob = await query(`SELECT * FROM automation_jobs WHERE id = $1`, [id]);
    if (existingJob.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);

      // Set timestamps based on status
      if (status === 'running' && existingJob.rows[0].status !== 'running') {
        updates.push(`started_at = NOW()`);
      }
      if (['completed', 'failed', 'cancelled'].includes(status) && !existingJob.rows[0].completed_at) {
        updates.push(`completed_at = NOW()`);
      }
    }

    if (progress !== undefined) {
      updates.push(`progress = $${paramIndex++}`);
      values.push(Math.min(100, Math.max(0, progress)));
    }

    if (message !== undefined) {
      updates.push(`message = $${paramIndex++}`);
      values.push(message);
    }

    if (error_message !== undefined) {
      updates.push(`error_message = $${paramIndex++}`);
      values.push(error_message);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No updates provided' },
        { status: 400 }
      );
    }

    values.push(id);

    const result = await query(
      `UPDATE automation_jobs SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('Automation job update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Cancel/delete automation job (admin only)
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Check if job exists
    const existingJob = await query(`SELECT * FROM automation_jobs WHERE id = $1`, [id]);
    if (existingJob.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // If job is running, cancel it instead of deleting
    if (existingJob.rows[0].status === 'running') {
      await query(
        `UPDATE automation_jobs SET status = 'cancelled', completed_at = NOW(), message = 'Cancelled by admin' WHERE id = $1`,
        [id]
      );
      return NextResponse.json({
        success: true,
        message: 'Running job cancelled'
      });
    }

    // Delete the job
    await query(`DELETE FROM automation_jobs WHERE id = $1`, [id]);

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('Automation job delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
