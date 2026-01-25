'use client';

import SlideOutPanel from '../shared/SlideOutPanel';

export interface NotificationDetail {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  user_email?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
}

interface NotificationDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationDetail | null;
  onMarkAsRead?: (notificationId: number) => void;
}

export default function NotificationDetailDrawer({
  isOpen,
  onClose,
  notification,
  onMarkAsRead
}: NotificationDetailDrawerProps) {
  if (!notification) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trade':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />;
      case 'account':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />;
      case 'system':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />;
      case 'promotion':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />;
      default:
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'trade':
        return { bg: 'bg-amber-50 border-[#f0d78c]', icon: 'text-[#c9a227]', badge: 'bg-amber-100 text-[#c9a227]' };
      case 'account':
        return { bg: 'bg-green-50 border-green-200', icon: 'text-green-600', badge: 'bg-green-100 text-green-700' };
      case 'system':
        return { bg: 'bg-blue-50 border-blue-200', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' };
      case 'promotion':
        return { bg: 'bg-purple-50 border-purple-200', icon: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' };
      default:
        return { bg: 'bg-gray-50 border-gray-200', icon: 'text-gray-600', badge: 'bg-gray-100 text-gray-700' };
    }
  };

  const styles = getTypeStyles(notification.type);

  return (
    <SlideOutPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Notification"
      subtitle={new Date(notification.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })}
    >
      <div className="space-y-6">
        {/* Notification Type Badge */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${styles.bg}`}>
            <svg className={`w-6 h-6 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {getTypeIcon(notification.type)}
            </svg>
          </div>
          <div className="flex-1">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${styles.badge}`}>
              {notification.type?.toUpperCase() || 'NOTIFICATION'}
            </span>
            <p className="text-xs text-gray-500">
              {notification.is_read ? 'Read' : 'Unread'}
            </p>
          </div>
        </div>

        {/* Notification Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-bold text-[#1a1a1d] mb-3">
            {notification.title}
          </h3>
          <p className="text-base text-gray-700 leading-relaxed">
            {notification.message}
          </p>
        </div>

        {/* User Info (if available) */}
        {notification.user_email && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Related User</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] rounded-full flex items-center justify-center text-white font-bold">
                {notification.first_name?.[0] || notification.user_email?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1a1a1d]">
                  {notification.first_name && notification.last_name
                    ? `${notification.first_name} ${notification.last_name}`
                    : notification.user_email}
                </p>
                <p className="text-xs text-gray-500">{notification.user_email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {!notification.is_read && (
            <button
              onClick={() => onMarkAsRead?.(notification.id)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:from-[#f0d78c] hover:to-[#c9a227] text-[#1a1a1d] font-semibold rounded-lg transition-all shadow-md"
            >
              Mark as Read
            </button>
          )}
          <button
            onClick={onClose}
            className={`${notification.is_read ? 'flex-1' : ''} px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all`}
          >
            Close
          </button>
        </div>
      </div>
    </SlideOutPanel>
  );
}
