'use client';

import SlideOutPanel from '../shared/SlideOutPanel';
import UserDetailContent, { UserDetail } from './UserDetailContent';

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
      <UserDetailContent user={user} onEdit={onEdit} onDelete={onDelete} />
    </SlideOutPanel>
  );
}
