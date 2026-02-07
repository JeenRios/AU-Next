'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/shared/Toast';
import { JournalTab } from '@/components/user';
import { PageContainer } from '@/components/shared';

export default function JournalPage() {
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <PageContainer>
      <JournalTab user={user} showToast={showToast} />
    </PageContainer>
  );
}
