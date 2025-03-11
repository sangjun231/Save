'use client';

import handleDelete from '@/hooks/Post/usePostDelete';
import { Tables } from '@/types/supabase';
import { API_MYPAGE_POST } from '@/utils/apiConstants';
import { formatDateRange } from '@/utils/detail/functions';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const getPostsData = async (userId: string) => {
  try {
    const response = await axios.get(API_MYPAGE_POST(userId));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`HTTP error! status: ${error.response?.status}`);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};

export default function PostList() {
  const params = useParams();
  const router = useRouter();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data, isPending, error, refetch } = useQuery<Tables<'posts'>[]>({
    queryKey: ['postList', userId],
    queryFn: () => getPostsData(userId),
    enabled: !!userId
  });

  const formatPrice = (price: number | null): string => {
    if (price === null) {
      return 'N/A';
    }
    return `$${price.toLocaleString('en-US')}`;
  };

  const tourStatus = (endDate: string | null): string => {
    if (!endDate) return 'N/A';
    const currentDate = new Date();
    const tourEndDate = new Date(endDate);
    return tourEndDate < currentDate ? 'Tour Completed' : 'Upcoming Tour';
  };

  const handleReservationList = (postId: string) => {
    router.push(`/${userId}/mypage/tourreservationlistpage?postId=${postId}`);
  };

  useEffect(() => {
    refetch();
  }, [userId, refetch]);

  if (isPending) return <div className="flex min-h-[calc(100vh-400px)] items-center justify-center">Loading...</div>;

  if (error) {
    return <div className="flex min-h-[calc(100vh-400px)] items-center justify-center">Error: {error.message}</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-400px)] items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-[8px]">
          <Image src="/icons/tabler-icon-sticker-2.svg" alt="no post" width={44} height={44} />
          <p className="text-[14px] font-semibold text-grayscale-900">You don&apos;t have any post</p>
          <p className="text-[12px] text-grayscale-600">When you make your tour,</p>
          <p className="text-[12px] text-grayscale-600">it will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {data.map((post: Tables<'posts'>, index) => {
        const status = tourStatus(post.endDate);

        return (
          <div key={`${post.id}-${index}`} className="mb-[20px] border-b pb-[20px] web:mb-[40px] web:pb-[40px]">
            <div className="flex justify-between">
              <div>
                <p className="text-[14px] font-semibold text-grayscale-900 web:text-[21px]">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
                <p
                  className={`text-[14px] font-medium web:text-[21px] ${status === 'Upcoming Tour' ? 'text-primary-300' : 'text-grayscale-900'}`}
                >
                  {status}
                </p>
              </div>
              <div className="flex gap-[16px] web:gap-[40px]">
                <Link href={`/postpage/${post.id}`}>
                  <button className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F7F7F9] web:h-[44px] web:w-[44px]">
                    <Image
                      className="web:h-[33px] web:w-[33px]"
                      src="/icons/tabler-icon-pencil.svg"
                      alt="Edit Tour"
                      width={24}
                      height={24}
                    />
                  </button>
                </Link>
                <button
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F7F7F9] web:h-[44px] web:w-[44px]"
                  onClick={() => handleDelete(post.id, router)}
                >
                  <Image
                    className="web:h-[33px] web:w-[33px]"
                    src="/icons/tabler-icon-trash.svg"
                    alt="Delete Tour"
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </div>
            <Link href={`/detail/${post.id}`}>
              <div className="my-[12px] flex web:my-[24px]">
                <div className="max-h-[80px] min-h-[80px] min-w-[80px] max-w-[80px] web:max-h-[120px] web:min-h-[120px] web:min-w-[120px] web:max-w-[120px]">
                  <Image
                    className="h-[80px] w-[80px] rounded-[8px] web:h-[120px] web:w-[120px] web:rounded-[12px]"
                    src={post.image ?? '/icons/upload.png'}
                    alt={post.title ?? 'Default title'}
                    width={80}
                    height={80}
                  />
                </div>
                <div className="ml-[8px] flex flex-col gap-[4px] web:ml-[16px]">
                  <p className="line-clamp-1 text-[14px] font-semibold text-primary-900 web:text-[21px]">
                    {post.title}
                  </p>
                  <p className="text-[14px] text-grayscale-500 web:text-[18px]">
                    {formatDateRange(post.startDate, post.endDate)}
                  </p>
                  <p className="text-[13px] font-semibold text-grayscale-700 web:text-[18px]">
                    <span className="font-medium text-primary-300">{formatPrice(post.price)}</span>
                    /Person
                  </p>
                </div>
              </div>
            </Link>
            <button
              className="w-full rounded-lg border p-[8px] text-[14px] font-semibold text-grayscale-700 web:p-[16px] web:text-[18px]"
              onClick={() => {
                handleReservationList(post.id);
              }}
            >
              Reservation List
            </button>
          </div>
        );
      })}
    </div>
  );
}
