'use client';

import PosterManagement from '@/components/common/Admin/PosterManagement';
import TabNavigation from '@/components/common/Admin/TabNavigation';
import UserManagement from '@/components/common/Admin/UserManagement';
import PaymentManagement from '@/components/common/Admin/PaymentManagement';
import { useState } from 'react';

const BackOffice = () => {
  const [activeTab, setActiveTab] = useState<'user' | 'poster' | 'payment'>('user');

  return (
    <div className="min-h-screen bg-gray-200 p-6">
      <TabNavigation activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === 'user' && <UserManagement />}
      {activeTab === 'poster' && <PosterManagement />}
      {activeTab === 'payment' && <PaymentManagement />}
    </div>
  );
};

export default BackOffice;
