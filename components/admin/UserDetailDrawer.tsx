'use client';

import SlideOutPanel from './SlideOutPanel';

export interface UserDetail {
  id: number;
  email: string;
  role: string;
  status?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
  city?: string;
  postal_code?: string;
  account_number?: string;
  account_type?: string;
  account_balance?: string;
  account_currency?: string;
  kyc_status?: string;
  id_document_type?: string;
  created_at: string;
  last_login?: string;
}

interface UserDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDetail | null;
  onEdit?: (user: UserDetail) => void;
  onDelete?: (userId: number) => void;
}

export default function UserDetailDrawer({
  isOpen,
  onClose,
  user,
  onEdit,
  onDelete
}: UserDetailDrawerProps) {
  if (!user) return null;

  return (
    <SlideOutPanel
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile"
      subtitle={user.email}
    >
      <div className="space-y-6">
        {/* Account Status */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.first_name?.[0] || user.email[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1d]">
                  {user.first_name || user.last_name
                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                    : 'No Name Set'}
                </h3>
                <p className="text-sm text-gray-600">{user.role === 'admin' ? 'Administrator' : 'User Account'}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              user.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {user.status || 'Active'}
            </span>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-bold text-[#1a1a1d] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Account Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Account Number</p>
              <p className="text-sm font-semibold text-[#1a1a1d]">{user.account_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Account Type</p>
              <p className="text-sm font-semibold text-[#1a1a1d] capitalize">{user.account_type || 'Standard'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Balance</p>
              <p className="text-sm font-bold text-green-600">
                ${parseFloat(user.account_balance || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Currency</p>
              <p className="text-sm font-semibold text-[#1a1a1d]">{user.account_currency || 'USD'}</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-bold text-[#1a1a1d] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Personal Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="text-sm font-semibold text-[#1a1a1d]">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Phone</p>
              <p className="text-sm font-semibold text-[#1a1a1d]">{user.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Country</p>
              <p className="text-sm font-semibold text-[#1a1a1d]">{user.country || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">City</p>
              <p className="text-sm font-semibold text-[#1a1a1d]">{user.city || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Postal Code</p>
              <p className="text-sm font-semibold text-[#1a1a1d]">{user.postal_code || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* KYC Status */}
        {user.role !== 'admin' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-bold text-[#1a1a1d] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              KYC Verification
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Verification Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  user.kyc_status === 'verified'
                    ? 'bg-green-100 text-green-700'
                    : user.kyc_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.kyc_status || 'Pending'}
                </span>
              </div>
              {user.id_document_type && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Document Type</p>
                  <p className="text-sm font-semibold text-[#1a1a1d] capitalize">{user.id_document_type}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Account Dates */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-bold text-[#1a1a1d] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Account Timeline
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Created</p>
              <p className="text-sm font-semibold text-[#1a1a1d]">
                {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            {user.last_login && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Last Login</p>
                <p className="text-sm font-semibold text-[#1a1a1d]">
                  {new Date(user.last_login).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => onEdit?.(user)}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:from-[#f0d78c] hover:to-[#c9a227] text-[#1a1a1d] font-semibold rounded-lg transition-all shadow-md"
          >
            Edit Profile
          </button>
          <button
            onClick={() => onDelete?.(user.id)}
            className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </SlideOutPanel>
  );
}
