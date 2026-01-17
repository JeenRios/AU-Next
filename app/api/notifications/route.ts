import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { createNotification, markNotificationAsRead, markAllNotificationsAsRead, NotificationType } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// GET - Fetch notifications (user sees own, admin sees all)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const unreadOnly = searchParams.get('unread') === 'true';

    let result;

    // Admin can fetch any user's notifications or all notifications
    if (session.user.role === 'admin') {
      if (userId) {
        result = await query(`
          SELECT
            n.*,
            u.email as user_email,
            p.first_name,
            p.last_name
          FROM notifications n
          LEFT JOIN users u ON n.user_id = u.id
          LEFT JOIN user_profiles p ON u.id = p.user_id
          WHERE n.user_id = $1 ${unreadOnly ? 'AND n.is_read = false' : ''}
          ORDER BY n.created_at DESC
          LIMIT 100
        `, [userId]);
      } else {
        result = await query(`
          SELECT
            n.*,
            u.email as user_email,
            p.first_name,
            p.last_name
          FROM notifications n
          LEFT JOIN users u ON n.user_id = u.id
          LEFT JOIN user_profiles p ON u.id = p.user_id
          ${unreadOnly ? 'WHERE n.is_read = false' : ''}
          ORDER BY n.created_at DESC
          LIMIT 100
        `);
      }
    } else {
      // Regular users can only see their own notifications
      result = await query(`
        SELECT
          n.*,
          u.email as user_email,
          p.first_name,
          p.last_name
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        LEFT JOIN user_profiles p ON u.id = p.user_id
        WHERE n.user_id = $1 ${unreadOnly ? 'AND n.is_read = false' : ''}
        ORDER BY n.created_at DESC
        LIMIT 100
      `, [session.user.id]);
    }

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create notification (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { user_id, type, title, message } = await request.json();

    // Validate required fields
    if (!user_id || !type || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'user_id, type, title, and message are required' },
        { status: 400 }
      );
    }

    // Validate notification type
    const validTypes: NotificationType[] = [
      'mt5_request', 'mt5_approved', 'mt5_rejected', 'vps_ready',
      'ea_deploying', 'ea_deployed', 'ea_deploy_failed', 'vps_provisioning',
      'automation_error', 'system', 'trade', 'account'
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid notification type. Valid types: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await createNotification({
      userId: user_id,
      type,
      title,
      message
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
      data: { id: result.id }
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { id, mark_all_read } = await request.json();

    // Mark all notifications as read for the user
    if (mark_all_read) {
      const success = await markAllNotificationsAsRead(session.user.id);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to mark notifications as read' },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    }

    // Mark single notification as read
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Users can only mark their own notifications, admins can mark any
    const userId = session.user.role === 'admin' ? undefined : session.user.id;
    const success = await markNotificationAsRead(id, userId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Notification not found or already read' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
