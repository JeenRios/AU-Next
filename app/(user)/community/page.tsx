'use client';

import { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/shared';
import { PageContainer } from '@/components/shared';
import { CommunityTab } from '@/components/user';
import { ContentTabIcons } from '@/components/shared/ui/ContentTabs';

export default function CommunityPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const communityTabs = [
    { 
      id: 'feed', 
      label: 'Community Feed', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.trending} /></svg> 
    },
  ];

  return (
    <PageContainer
      tabs={communityTabs}
      defaultTab="feed"
      title="Community"
      subtitle="Connect with fellow traders and share insights"
      className="h-full"
    >
      {() => <CommunityTab user={user} />}
    </PageContainer>
  );
}
