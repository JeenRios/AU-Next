'use client';

import { useState, useEffect } from 'react';
import { CommunityTab } from '@/components/user';

export default function CommunityPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return <CommunityTab user={user} />;
}
