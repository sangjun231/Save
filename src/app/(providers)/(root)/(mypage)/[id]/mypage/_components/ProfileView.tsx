'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_MYPAGE_PROFILE } from '@/utils/apiConstants';
import Image from 'next/image';
import { Tables } from '@/types/supabase';

const ProfileView = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState<Tables<'users'>>();
  const router = useRouter();

  const fetchProfile = async () => {
    const response = await axios.get(API_MYPAGE_PROFILE(userId));
    const profileData = response.data;
    setProfile(profileData);
  };

  const goToProfilePage = () => {
    router.replace(`/${userId}/profilepage`);
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return (
    <div>
      {profile ? (
        <div className="flex gap-[12px] web:gap-[16px]">
          <div>
            <div className="max-h-[56px] max-w-[56px] web:max-h-[80px] web:max-w-[80px]">
              <Image
                className="h-[56px] w-[56px] rounded-full web:h-[80px] web:w-[80px]"
                src={profile.avatar ? `${profile.avatar}?${new Date().getTime()}` : '/icons/Profile.svg'}
                alt="Profile"
                width={56}
                height={56}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex gap-[8px] web:gap-[16px]">
              <p className="text-[18px] font-semibold leading-none web:text-[26px]">{profile.name}</p>
              <p className="text-[12px] web:text-[20px]">{profile.region ? profile.region : 'Please set the region'}</p>
            </div>
            <button
              onClick={goToProfilePage}
              className="mt-[8px] flex items-center text-[12px] max-w-[90px] web:max-w-[120px] web:text-[16px]"
            >
              Edit Profile
              <div className="max-h-[16px] max-w-[16px] web:max-h-[24px] web:max-w-[24px]">
                <Image
                  className="h-[16px] w-[16px] web:h-[24px] web:w-[24px]"
                  src="/icons/tabler-icon-chevron-right.svg"
                  alt="Edit Profile"
                  width={16}
                  height={16}
                />
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default ProfileView;
