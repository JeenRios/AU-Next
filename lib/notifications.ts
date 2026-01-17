import { query } from './db';

// Notification types for the system
export type NotificationType =
  | 'mt5_request'      // Admin: New MT5 connection request
  | 'mt5_approved'     // User: MT5 request approved
  | 'mt5_rejected'     // User: MT5 request rejected
  | 'vps_ready'        // User: VPS provisioned
  | 'ea_deploying'     // User: EA deployment started
  | 'ea_deployed'      // User: EA deployed successfully
  | 'ea_deploy_failed' // Admin: EA deployment failed
  | 'vps_provisioning' // User: VPS provisioning started
  | 'automation_error' // Admin: Automation error
  | 'system'           // General system notification
  | 'trade'            // Trade-related notification
  | 'account';         // Account-related notification

interface CreateNotificationParams {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
}

/**
 * Creates a notification for a specific user
 */
export async function createNotification({
  userId,
  type,
  title,
  message
}: CreateNotificationParams): Promise<{ id: number } | null> {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [userId, type, title, message]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Sends a notification to a specific user
 */
export async function notifyUser(
  userId: number,
  type: NotificationType,
  title: string,
  message: string
): Promise<boolean> {
  const result = await createNotification({ userId, type, title, message });
  return result !== null;
}

/**
 * Sends a notification to all admin users
 */
export async function notifyAdmins(
  type: NotificationType,
  title: string,
  message: string
): Promise<number> {
  try {
    // Get all admin users
    const adminsResult = await query(
      `SELECT id FROM users WHERE role = 'admin' AND status = 'active'`
    );

    let notifiedCount = 0;
    for (const admin of adminsResult.rows) {
      const success = await notifyUser(admin.id, type, title, message);
      if (success) notifiedCount++;
    }

    return notifiedCount;
  } catch (error) {
    console.error('Error notifying admins:', error);
    return 0;
  }
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(
  notificationId: number,
  userId?: number
): Promise<boolean> {
  try {
    let queryText = `UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1`;
    const params: (number | undefined)[] = [notificationId];

    // If userId provided, ensure the notification belongs to that user
    if (userId) {
      queryText += ` AND user_id = $2`;
      params.push(userId);
    }

    const result = await query(queryText, params);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Marks all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: number): Promise<boolean> {
  try {
    await query(
      `UPDATE notifications SET is_read = true, read_at = NOW()
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

/**
 * Gets unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: number): Promise<number> {
  try {
    const result = await query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return parseInt(result.rows[0]?.count || '0', 10);
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}

// Pre-defined notification templates for common scenarios
export const NotificationTemplates = {
  mt5RequestSubmitted: (accountNumber: string, userEmail: string) => ({
    type: 'mt5_request' as NotificationType,
    title: 'New MT5 Connection Request',
    message: `User ${userEmail} has submitted a connection request for MT5 account ${accountNumber}. Please review and approve/reject.`
  }),

  mt5Approved: (accountNumber: string) => ({
    type: 'mt5_approved' as NotificationType,
    title: 'MT5 Account Approved',
    message: `Your MT5 account ${accountNumber} has been approved! VPS setup will begin shortly.`
  }),

  mt5Rejected: (accountNumber: string, reason?: string) => ({
    type: 'mt5_rejected' as NotificationType,
    title: 'MT5 Account Request Rejected',
    message: reason
      ? `Your MT5 account ${accountNumber} request was rejected. Reason: ${reason}`
      : `Your MT5 account ${accountNumber} request was rejected. Please contact support for more information.`
  }),

  vpsProvisioning: (accountNumber: string) => ({
    type: 'vps_provisioning' as NotificationType,
    title: 'VPS Setup Started',
    message: `VPS provisioning has started for your MT5 account ${accountNumber}. You will be notified when it's ready.`
  }),

  vpsReady: (accountNumber: string, vpsName: string) => ({
    type: 'vps_ready' as NotificationType,
    title: 'VPS Ready',
    message: `Your VPS "${vpsName}" is now ready for MT5 account ${accountNumber}. EA deployment will begin shortly.`
  }),

  eaDeploying: (accountNumber: string) => ({
    type: 'ea_deploying' as NotificationType,
    title: 'EA Deployment Started',
    message: `Expert Advisor is being deployed to your MT5 account ${accountNumber}. This may take a few minutes.`
  }),

  eaDeployed: (accountNumber: string) => ({
    type: 'ea_deployed' as NotificationType,
    title: 'EA Deployed Successfully',
    message: `Expert Advisor has been successfully deployed to your MT5 account ${accountNumber}. Automated trading is now active!`
  }),

  eaDeployFailed: (accountNumber: string, error: string) => ({
    type: 'ea_deploy_failed' as NotificationType,
    title: 'EA Deployment Failed',
    message: `EA deployment failed for MT5 account ${accountNumber}. Error: ${error}. Please investigate and retry.`
  }),

  automationError: (accountNumber: string, error: string) => ({
    type: 'automation_error' as NotificationType,
    title: 'Automation Error',
    message: `An automation error occurred for MT5 account ${accountNumber}: ${error}`
  })
};
