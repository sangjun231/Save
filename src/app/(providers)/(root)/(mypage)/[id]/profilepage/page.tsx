'use client';

import ProfileForm from './_components/ProfileForm';
import { useParams } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

const ProfilePage = () => {
  const { id } = useParams() as { id: string };

  return (
    <div>
      <Toaster />
      <div className="mx-[20px] mt-[8px] web:mx-[88px] web:mt-[40px]">
        <ProfileForm userId={id} />
      </div>
    </div>
  );
};

export default ProfilePage;
