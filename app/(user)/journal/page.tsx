'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/shared/Toast';
import { PageContainer } from '@/components/shared';
import { JournalTab } from '@/components/user';
import { ContentTabIcons } from '@/components/shared/ui/ContentTabs';

export default function JournalPage() {
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const journalTabs = [
    { id: 'journal', label: 'Trading Journal', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ContentTabIcons.history} /></svg> },
  ];

  return (
    <PageContainer
      tabs={journalTabs}
      defaultTab="journal"
      title="Trading Journal"
      subtitle="Track your trades and analyze performance"
      className="h-full"
    >
      {() => <JournalTab user={user} showToast={showToast} />}
    </PageContainer>
  );
}
