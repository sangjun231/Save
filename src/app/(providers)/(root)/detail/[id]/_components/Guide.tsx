'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { API_MYPAGE_PROFILE, API_POST_DETAILS } from '@/utils/apiConstants';
import { WebProps } from '@/types/webstate';
import Swal from 'sweetalert2';

interface User {
  name: string;
  avatar: string;
  id: string;
  region: string;
}

type Post = {
  id: string;
  title: string;
  image: string;
};

export const Guide = ({ isWeb }: WebProps) => {
  const { id: postId } = useParams() as { id: string };
  const supabase = createClient();
  const router = useRouter();
  const [customerUser, setCustomerUser] = useState<User | null>(null);

  // 작성자 데이터를 가져오는 함수
  const fetchUser = async (): Promise<User> => {
    const response = await axios.get(`/api/detail/guide/${postId}`);
    return response.data.user; // response.data에서 user 객체를 반환
  };

  const {
    data: user,
    isPending,
    error
  } = useQuery<User>({
    queryKey: ['user', postId],
    queryFn: fetchUser,
    enabled: !!postId
  });

  const fetchPostDetails = async (): Promise<Post> => {
    const response = await axios.get(API_POST_DETAILS(postId));
    return response.data;
  };

  const { data: post } = useQuery<Post>({
    queryKey: ['post', postId],
    queryFn: fetchPostDetails,
    enabled: !!postId
  });

  const fetchCustomerUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (data.user) {
      const userId = data.user.id;
      const response = await axios.get(API_MYPAGE_PROFILE(userId));
      const profileData = response.data;

      const customerUserData: User = {
        id: profileData.id,
        name: profileData.name,
        avatar: profileData.avatar,
        region: profileData.region
      };

      setCustomerUser(customerUserData);
    }
  };

  const handleChat = () => {
    if (!customerUser || !user || !post) {
      Swal.fire({
        title: 'Missing Information',
        icon: 'warning',
        confirmButtonText: 'OK',
        customClass: {
          actions: 'flex flex-col gap-[8px] w-full',
          title: 'font-semibold text-[18px]',
          htmlContainer: 'text-grayscale-500 text-[14px]',
          popup: 'rounded-[16px] p-[24px]',
          confirmButton: 'bg-primary-300 text-white w-full text-[16px] p-[12px] rounded-[12px]'
        }
      });
      return;
    }
    const senderId = customerUser.id;
    const receiverId = user.id;

    const query = new URLSearchParams({
      postId: post.id,
      postTitle: post.title,
      postImage: post.image
    }).toString();

    router.push(`/${senderId}/${receiverId}/chatpage?${query}`);
  };

  useEffect(() => {
    fetchCustomerUser();
  }, [supabase]);

  if (isPending) return <div>Loading...</div>;

  if (error) return <div>Error fetching user data</div>;

  return (
    <div className="flex flex-col gap-6 web:flex web:flex-row web:gap-10 web:gap-40">
      <div className="flex flex-col gap-2 web:w-1/2">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-grayscale-900 web:text-4xl">Contact your guide</h2>
          <p className="text-sm text-grayscale-500 web:mb-10 web:text-lg">
            For more information such as the number of people and schedule change, it is recommended to send a message
            to the guide to discuss and check.
          </p>
        </div>
        <div className="flex flex-col gap-4 web:gap-6">
          {user && (
            <div className="flex items-center gap-4">
              <Image
                src={user.avatar}
                alt={`${user.name}의 아바타`}
                width={isWeb ? 80 : 56}
                height={isWeb ? 80 : 56}
                priority
                className="h-14 w-14 rounded-full web:h-20 web:w-20"
              />
              <div className="flex flex-col web:gap-1.5">
                <h4 className="text-lg font-semibold web:text-[26px]">{user.name}</h4>
                <h5 className="text-sm font-normal web:text-xl">{user.region}</h5>
              </div>
            </div>
          )}

          <button
            className="rounded-2xl border border-grayscale-800 px-5 py-3 text-base font-semibold text-grayscale-700 web:px-6 web:py-4 web:text-lg"
            onClick={handleChat}
          >
            Message Host
          </button>
        </div>
      </div>
      <div className="flex hidden web:flex web:w-1/2 web:items-center web:justify-center">
        <Image
          src="/img/GuideWeb.png"
          alt={`${user.name}의 아바타`}
          width={624}
          height={281}
          sizes="100vw"
          priority
          className="rounded-2xl"
        />
      </div>
    </div>
  );
};
