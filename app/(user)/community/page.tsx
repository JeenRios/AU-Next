'use client';

import { useState, useEffect } from 'react';
import { CommunityTab } from '@/components/user';
import { PageContainer } from '@/components/shared';

export default function CommunityPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <PageContainer>
      <CommunityTab user={user} />
    </PageContainer>
  );
}
