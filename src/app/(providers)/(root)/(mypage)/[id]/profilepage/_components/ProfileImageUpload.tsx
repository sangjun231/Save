'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

type ProfileImageUploadProps = {
  userId: string;
  imageUrl: string;
  onImageChange: (newImageUrl: string) => void;
};

const ProfileImageUpload = ({ userId, imageUrl, onImageChange }: ProfileImageUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const supabase = createClient();

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `profile_images/${fileName}`;

      const existingImagePath = imageUrl?.split('/').pop();
      if (existingImagePath && existingImagePath !== fileName) {
        await supabase.storage.from('users').remove([`profile_images/${existingImagePath}`]);
      }

      const { error: uploadError } = await supabase.storage.from('users').upload(filePath, file, {
        upsert: true
      });

      if (uploadError) return;

      const { data: publicUrlData } = supabase.storage.from('users').getPublicUrl(filePath);
      if (!publicUrlData) return;

      onImageChange(publicUrlData.publicUrl);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="relative">
        {imageUrl ? (
          <Image
            className="rounded-full"
            src={`${imageUrl}?${new Date().getTime()}`}
            alt="Profile"
            width={96}
            height={96}
            style={{ width: '96px', height: '96px' }}
          />
        ) : (
          <Image
            className="rounded-full"
            src="/icons/Profile.svg"
            alt="Profile"
            width={96}
            height={96}
            style={{ width: '96px', height: '96px' }}
          />
        )}
        <label className="absolute right-0 top-0 flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full bg-[#F7F7F9]">
          <Image
            src="/icons/tabler-icon-camera-filled.svg"
            alt="Select File"
            width={24}
            height={24}
            style={{ width: '24px', height: '24px' }}
          />
          <input type="file" className="hidden" onChange={handleImageChange} />
        </label>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
