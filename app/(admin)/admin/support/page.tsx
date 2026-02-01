'use client';

import { useState } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { SectionHeader, ContentTabs, ContentTab, ContentTabIcons } from '@/components/shared';
import TicketDetailDrawer from '@/components/admin/support/TicketDetailDrawer';
import NotificationDetailDrawer from '@/components/admin/support/NotificationDetailDrawer';

const supportTabs: ContentTab[] = [
  { id: 'tickets', label: 'Support Tickets', icon: ContentTabIcons.support },
  { id: 'notifications', label: 'Notifications', icon: ContentTabIcons.overview },
];

export default function AdminSupportPage() {
  const { tickets, notifications, loading, refreshing, fetchData } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState('tickets');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#c9a227] rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSubTab) {
      case 'tickets':
        return (
          <div className="bg-white border border-gray-100 rounded-xl">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-[#1a1a1d]">Open Tickets ({tickets.length})</h3>
            </div>
            {tickets.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No open tickets</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => { setSelectedTicket(ticket); setShowTicketDetails(true); }}
                    className="p-4 hover:bg-amber-50/50 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#c9a227] to-[#f0d78c] rounded-full flex items-center justify-center text-white font-bold">
                        {ticket.first_name?.[0] || ticket.user_email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-[#1a1a1d]">{ticket.subject}</p>
                        <p className="text-sm text-gray-500">{ticket.ticket_number} · {ticket.user_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                        ticket.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {ticket.priority || 'normal'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'open' ? 'bg-orange-100 text-orange-700' :
                        ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'notifications':
        return (
          <div className="bg-white border border-gray-100 rounded-xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-[#1a1a1d]">All Notifications</h3>
              <span className="text-xs text-[#c9a227] bg-amber-50 px-2 py-1 rounded">
                {notifications.filter(n => !n.is_read).length} unread
              </span>
            </div>
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No notifications</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => { setSelectedNotification(notif); setShowNotificationDetails(true); }}
                    className="p-4 hover:bg-amber-50/50 cursor-pointer flex items-start gap-4 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${notif.is_read ? 'bg-gray-300' : 'bg-[#c9a227]'}`}></div>
                    <div className="flex-1">
                      <p className={`${notif.is_read ? 'text-gray-600' : 'text-[#1a1a1d] font-medium'}`}>{notif.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <SectionHeader
        title="Support"
        subtitle="Manage support tickets and notifications"
        onRefresh={fetchData}
        isRefreshing={refreshing}
      />
      <ContentTabs
        tabs={supportTabs}
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
      >
        {renderContent()}
      </ContentTabs>

      {/* Ticket Detail Drawer */}
      <TicketDetailDrawer
        isOpen={showTicketDetails}
        onClose={() => setShowTicketDetails(false)}
        ticket={selectedTicket}
        onMarkResolved={async (ticketId) => {
          // Mark ticket as resolved and refresh
          await fetchData();
        }}
      />

      {/* Notification Detail Drawer */}
      <NotificationDetailDrawer
        isOpen={showNotificationDetails}
        onClose={() => setShowNotificationDetails(false)}
        notification={selectedNotification}
        onMarkAsRead={async (notificationId) => {
          // Mark notification as read and refresh
          await fetchData();
        }}
      />
    </>
  );
}
