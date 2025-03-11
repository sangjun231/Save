'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import Chat from '@/components/Chat';

const ChatPage = () => {
  const { id: senderId, receiverid: receiverId } = useParams() as { id: string; receiverid: string };
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const handleBack = () => {
    router.back();
  };

  const checkAccess = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw new Error(error.message);

    if (data.user.id !== senderId && data.user.id !== receiverId) {
      alert('접근 권한이 없습니다.');
      router.push('/');
    }
  };

  const postId = searchParams.get('postId');
  const postTitle = searchParams.get('postTitle');
  const postImage = searchParams.get('postImage');

  useEffect(() => {
    checkAccess();
  }, [senderId, receiverId, router, supabase]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="mx-[20px] mt-[8px]">
        <div className="relative my-[20px] flex items-center justify-between">
          <button
            className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-grayscale-50"
            onClick={handleBack}
          >
            <Image
              src="/icons/tabler-icon-chevron-left.svg"
              alt="Go Back"
              width={24}
              height={24}
              style={{ width: '24px', height: '24px' }}
            />
          </button>
          <p className="absolute left-1/2 -translate-x-1/2 transform text-[18px] font-semibold text-primary-900">
            Message
          </p>
          <div className="w-8"></div>
        </div>
        <div className="flex">
          <Image
            className="rounded-[8px]"
            src={postImage ?? '/icons/upload.png'}
            alt={postTitle ?? 'Default title'}
            width={44}
            height={44}
            style={{ width: '44px', height: '44px' }}
          />
          <div className="ml-[8px] max-w-[360px]">
            <p className="line-clamp-1 text-[14px] font-bold">{postTitle}</p>
          </div>
        </div>
        <Chat postId={postId || ''} senderId={senderId} receiverId={receiverId} />
      </div>
    </div>
  );
};

export default ChatPage;
