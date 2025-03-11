'use client';

import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import useAuthStore from '@/zustand/bearsStore';
import { Tables } from '@/types/supabase';
import { API_MYPAGE_LIKES } from '@/utils/apiConstants';
import { formatDateRange } from '@/utils/detail/functions';
import Like from './Like';

export default function LikeList() {
  const params = useParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  const user = useAuthStore((state) => state.user);

  const getLikedPostsData = async () => {
    try {
      const response = await axios.get(API_MYPAGE_LIKES(userId));
      const data: Tables<'posts'>[] = response.data.posts;
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`HTTP error! status: ${error.response?.status}`);
      } else {
        throw new Error('An unknown error occurred');
      }
    }
  };

  const { data, isPending, error } = useQuery<Tables<'posts'>[]>({
    queryKey: ['likedPosts', userId],
    queryFn: getLikedPostsData,
    enabled: !!userId
  });

  const formatPrice = (price: number | null): string => {
    if (price === null) {
      return 'N/A';
    }
    return `$${price.toLocaleString('en-US')}`;
  };

  if (isPending) return <div className="flex min-h-[calc(100vh-400px)] items-center justify-center">Loading...</div>;

  if (error) {
    return <div className="flex min-h-[calc(100vh-400px)] items-center justify-center">Error: {error.message}</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-400px)] items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-[8px]">
          <Image src="/icons/tabler-icon-heart.svg" alt="no wishlist" width={44} height={44} />
          <p className="text-[14px] font-semibold text-grayscale-900">You don&apos;t have any Wishlist</p>
          <p className="text-[12px] text-grayscale-600">When you like a tour,</p>
          <p className="text-[12px] text-grayscale-600">it will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid web:grid-cols-4 web:gap-[40px]">
      {data.map((post, index) => (
        <div key={`${post.id}-${index}`} className="relative mb-[16px]">
          <div className="flex web:flex-col web:gap-[16px]">
            <div className="relative max-h-[100px] min-h-[100px] min-w-[80px] max-w-[80px] web:max-h-[286px] web:max-w-[286px]">
              <Link href={`/detail/${post.id}`}>
                <Image
                  className="h-[100px] w-[80px] rounded-[8px] web:h-[286px] web:w-[286px] web:rounded-[16px]"
                  src={post.image ?? '/icons/upload.png'}
                  alt={post.title ?? 'Default title'}
                  width={80}
                  height={100}
                />
              </Link>
              <Like postId={post.id} userId={user.id} />
            </div>
            <Link href={`/detail/${post.id}`}>
              <div className="ml-[8px] flex flex-col gap-[4px] web:ml-0 web:gap-[8px]">
                <p className="line-clamp-1 text-[14px] font-semibold text-primary-900 web:text-[18px]">{post.title}</p>
                <p className="text-[14px] text-grayscale-500 web:text-[16px]">
                  {formatDateRange(post.startDate, post.endDate)}
                </p>
                <p className="text-[13px] font-medium text-grayscale-700 web:text-[16px]">
                  <span className="font-semibold text-primary-300">{formatPrice(post.price)}</span>
                  /Person
                </p>
              </div>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
