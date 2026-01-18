'use client';

import SlideOutPanel from './SlideOutPanel';

export interface TicketDetail {
  id: number;
  ticket_number: string;
  subject: string;
  message?: string;
  status: string;
  priority?: string;
  user_email?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  resolved_at?: string;
}

interface TicketDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketDetail | null;
  onReply?: (ticket: TicketDetail) => void;
  onMarkResolved?: (ticketId: number) => void;
}

export default function TicketDetailDrawer({
  isOpen,
  onClose,
  ticket,
  onReply,
  onMarkResolved
}: TicketDetailDrawerProps) {
  if (!ticket) return null;

  return (
    <SlideOutPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Support Ticket"
      subtitle={ticket.ticket_number}
    >
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] rounded-full flex items-center justify-center text-white font-bold text-lg">
              {ticket.first_name?.[0] || ticket.user_email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#1a1a1d]">
                {ticket.first_name && ticket.last_name
                  ? `${ticket.first_name} ${ticket.last_name}`
                  : ticket.user_email || 'Unknown User'}
              </h3>
              <p className="text-sm text-gray-600">{ticket.user_email}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              ticket.priority === 'high'
                ? 'bg-red-100 text-red-700'
                : ticket.priority === 'normal'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {ticket.priority || 'Normal'} Priority
            </span>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-bold text-[#1a1a1d] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ticket Information
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Subject</p>
              <p className="text-base font-semibold text-[#1a1a1d]">{ticket.subject}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Message</p>
              <p className="text-sm text-gray-700 leading-relaxed">{ticket.message || 'No message provided.'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  ticket.status === 'open'
                    ? 'bg-orange-100 text-orange-700'
                    : ticket.status === 'resolved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {ticket.status || 'Open'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Created</p>
                <p className="text-sm font-semibold text-[#1a1a1d]">
                  {new Date(ticket.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            {ticket.resolved_at && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Resolved At</p>
                <p className="text-sm font-semibold text-green-700">
                  {new Date(ticket.resolved_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => onReply?.(ticket)}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:from-[#f0d78c] hover:to-[#c9a227] text-[#1a1a1d] font-semibold rounded-lg transition-all shadow-md"
          >
            Reply to Ticket
          </button>
          {ticket.status === 'open' && (
            <button
              onClick={() => onMarkResolved?.(ticket.id)}
              className="px-4 py-3 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-lg transition-all"
            >
              Mark Resolved
            </button>
          )}
        </div>
      </div>
    </SlideOutPanel>
  );
}
