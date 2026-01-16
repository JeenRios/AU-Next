'use client';

import { ReactNode } from 'react';

interface Notification {
  id: number;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  created_at: string;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  loading?: boolean;
  maxItems?: number;
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-2 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );
}

export function NotificationsPanel({ notifications, loading = false, maxItems = 5 }: NotificationsPanelProps) {
  const displayNotifications = notifications.slice(0, maxItems);

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm" role="region" aria-label="Notifications">
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-bold text-[#1a1a1d] flex items-center gap-2">
          <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notifications
          {notifications.length > 0 && (
            <span className="ml-auto text-xs bg-[#c9a227]/10 text-[#c9a227] px-2 py-1 rounded-full">
              {notifications.length} new
            </span>
          )}
        </h3>
      </div>
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto" role="list">
        {loading ? (
          <>
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </>
        ) : displayNotifications.length > 0 ? (
          displayNotifications.map((notif) => (
            <div 
              key={notif.id} 
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#c9a227] focus-visible:outline-none"
              role="listitem"
              tabIndex={0}
              aria-label={`${notif.type} notification: ${notif.title}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColor(notif.type)}`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#1a1a1d] mb-1 truncate">{notif.title}</div>
                <div className="text-xs text-gray-600 line-clamp-2">{notif.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(notif.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500" role="status">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p>No new notifications</p>
            <p className="text-sm mt-1">You&apos;re all caught up!</p>
          </div>
        )}
      </div>
      {notifications.length > maxItems && (
        <div className="px-6 pb-4">
          <button className="w-full text-center text-sm text-[#c9a227] hover:text-[#b8911f] font-medium py-2 hover:bg-amber-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#c9a227] focus-visible:outline-none">
            View all {notifications.length} notifications
          </button>
        </div>
      )}
    </div>
  );
}
