'use client';

import { useState, useEffect } from 'react';
import { SettingsTab } from '@/components/user';
import { PageContainer } from '@/components/shared';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <PageContainer>
      <SettingsTab user={user} onUserUpdate={handleUserUpdate} />
    </PageContainer>
  );
}
