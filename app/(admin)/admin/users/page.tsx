'use client';

import { useState } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { SectionHeader } from '@/components/shared';
import UnifiedPageLayout from '@/components/shared/layout/UnifiedPageLayout';
import { ContentTabIcons } from '@/components/shared/ui/ContentTabs';
import { EmptyState } from '@/components/user/ErrorState';
import ListContainer, { FilterOption } from '@/components/admin/shared/ListContainer';
import UserDetailDrawer from '@/components/admin/users/UserDetailDrawer';
import SlideOutPanel from '@/components/admin/shared/SlideOutPanel';

const USER_FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'admin', label: 'Admins' },
  { value: 'user', label: 'Users' },
];

export default function AdminUsersPage() {
  const { users, loading, refreshing, fetchData, handleAddUser, handleDeleteUser } = useAdmin();
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'user',
    name: ''
  });

  const getUserSearchableText = (user: any) => {
    return [user.email, user.name, user.first_name, user.last_name].filter(Boolean).join(' ');
  };

  const getUserFilterValue = (user: any) => user.role;

  const onAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleAddUser(newUser);
    if (success) {
      setShowAddUser(false);
      setNewUser({ email: '', password: '', role: 'user', name: '' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  const usersTabs = [
    { id: 'users', label: 'Users', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.user} /></svg> },
  ];

  return (
    <UnifiedPageLayout
      tabs={usersTabs}
      defaultTab="users"
      title="Users"
      subtitle="Manage user accounts and permissions"
      actions={
        <button
          onClick={() => setShowAddUser(true)}
          className="px-4 py-2 bg-gradient-to-r from-primary-gold to-secondary-gold text-surface-dark font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      }
      className="h-full"
    >
      {() => (
        <div className="space-y-6">

      <ListContainer
        items={users}
        filterOptions={USER_FILTER_OPTIONS}
        getSearchableText={getUserSearchableText}
        getFilterValue={getUserFilterValue}
        searchPlaceholder="Search users..."
        emptyState={<EmptyState title="No users found" description="Add a user to get started." action={{ label: 'Add user', onClick: () => setShowAddUser(true) }} />}
        renderItem={(user) => (
          <div
            key={user.id}
            onClick={() => { setSelectedUser(user); setShowUserDetails(true); }}
            className="p-4 hover:bg-primary-gold/10 cursor-pointer flex items-center justify-between transition-colors border-b border-gray-50 last:border-0"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-gold to-secondary-gold rounded-full flex items-center justify-center text-white font-bold">
                {user.first_name?.[0] || user.email[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-surface-dark">
                  {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.role === 'admin' 
                  ? 'bg-gradient-to-r from-primary-gold/20 to-secondary-gold/20 text-primary-gold border border-primary-gold/30' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {user.role}
              </span>
              <span className="text-xs text-gray-400">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id); }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )}
      />

      {/* Add User Slide Out Panel */}
      <SlideOutPanel
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        title="Add New User"
      >
        <form onSubmit={onAddUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddUser(false)}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-gold to-secondary-gold text-surface-dark font-semibold rounded-xl hover:shadow-lg"
            >
              Create User
            </button>
          </div>
        </form>
      </SlideOutPanel>

      {/* User Detail Drawer */}
      <UserDetailDrawer 
        isOpen={showUserDetails} 
        onClose={() => setShowUserDetails(false)}
        user={selectedUser}
        onDelete={handleDeleteUser}
      />
        </div>
      )}
    </UnifiedPageLayout>
  );
}
