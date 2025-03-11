'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_MYPAGE_PROFILE } from '@/utils/apiConstants';
import ProfileImageUpload from './ProfileImageUpload';
import PasswordChangeForm from './PasswordChangeForm';
import ProfileDetailsForm from './ProfileDetailsForm';
import { Tables } from '@/types/supabase';

const ProfileForm = ({ userId }: { userId: string }) => {
  const MySwal = withReactContent(Swal);
  const [profile, setProfile] = useState<Tables<'users'>>();
  const [nickname, setNickname] = useState('');
  const [region, setRegion] = useState('');
  const [email, setEmail] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const newRegion = searchParams.get('region');

  const fetchProfile = async () => {
    const response = await axios.get(API_MYPAGE_PROFILE(userId));
    const profileData = response.data;
    setProfile(profileData);
    setNickname(profileData.name);
    setRegion(newRegion || profileData.region);
    setEmail(profileData.email);
    setImageUrl(profileData.avatar);
  };

  const handleProfileUpdate = async () => {
    const result = await MySwal.fire({
      title: 'Profile updated successfully',
      icon: 'success',
      customClass: {
        actions: 'flex flex-col gap-[8px] w-full',
        title: 'font-semibold text-[18px]',
        popup: 'rounded-[16px] p-[24px]',
        confirmButton: 'bg-primary-300 text-white w-full text-[16px] p-[12px] rounded-[12px]'
      }
    });

    if (result.isConfirmed && profile) {
      try {
        await axios.put(API_MYPAGE_PROFILE(userId), {
          id: profile.id,
          name: nickname,
          email,
          avatar: imageUrl,
          region
        });
        fetchProfile();
        router.replace(`/${userId}/mypage`);
      } catch (error) {
        MySwal.fire('Failed!', 'Failed to edit profile.', 'error');
      }
    }
  };

  const handleImageChange = (newImageUrl: string) => {
    setImageUrl(newImageUrl);
  };

  const handleDeleteAccount = async () => {
    const result = await MySwal.fire({
      title: 'Are you sure you want to delete your account?',
      html: '<p style="color: #FF2D2D; font-size: 14px;">This action cannot be undone.</p>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete account',
      cancelButtonText: 'No thanks',
      customClass: {
        actions: 'flex flex-col gap-[8px] w-full',
        title: 'font-semibold text-[18px]',
        popup: 'rounded-[16px] p-[24px]',
        confirmButton: 'bg-primary-300 text-white w-full text-[16px] p-[12px] rounded-[12px]',
        cancelButton: 'bg-white text-[16px] p-[12px] w-full rounded-[12px] text-grayscale-700'
      }
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(API_MYPAGE_PROFILE(userId));
        MySwal.fire('Deleted!', 'Account deleted successfully.', 'success');
        router.push('/login');
      } catch (error) {
        MySwal.fire('Failed!', 'Error deleting account.', 'error');
      }
    }
  };

  const handleBack = () => {
    router.replace(`/${userId}/mypage`);
  };

  useEffect(() => {
    fetchProfile();
  }, [userId, newRegion, setImageUrl]);

  return (
    <div>
      {profile ? (
        <div>
          <div className="mb-[20px] flex items-center justify-between web:mb-[32px]">
            <button
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-grayscale-50 web:h-[44px] web:w-[44px]"
              onClick={handleBack}
            >
              <Image
                className="web:h-[33px] web:w-[33px]"
                src="/icons/tabler-icon-chevron-left.svg"
                alt="Go Back"
                width={24}
                height={24}
              />
            </button>
            <p className="mx-auto text-[18px] font-semibold text-primary-900 web:ml-[20px] web:self-start web:text-[32px]">
              Edit Profile
            </p>
            <button className="text-[14px] font-medium text-action-color web:text-[24px]" onClick={handleProfileUpdate}>
              Done
            </button>
          </div>

          <div className="min-h-[calc(100vh-400px)] web:mx-auto web:max-w-[648px]">
            <div className="flex flex-col gap-[8px]">
              <ProfileImageUpload userId={userId} imageUrl={imageUrl} onImageChange={handleImageChange} />
              <p className="text-center text-[24px] font-bold web:text-[28px]">{nickname}</p>
              <p className="text-center text-[16px] text-action-color web:text-[18px]">{email}</p>
            </div>
            <ProfileDetailsForm nickname={nickname} setNickname={setNickname} region={region} userId={userId} />

            <div className="mt-[40px] flex flex-col">
              {showPasswordChange && <PasswordChangeForm userId={userId} email={profile.email} />}
            </div>
            <div className="my-[20px] flex justify-around">
              <button
                className="text-[14px] web:text-[18px]"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
              >
                Change Password
              </button>
              <button className="web:text-[18px ]text-[14px] text-error-color" onClick={handleDeleteAccount}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default ProfileForm;
