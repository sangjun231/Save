'use client';

import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import Image from 'next/image';
import { API_MYPAGE_TOURRESERVATIONLIST } from '@/utils/apiConstants';
import { Tables } from '@/types/supabase';
import { useRouter } from 'next/navigation';
import { formatDateRange } from '@/utils/detail/functions';

const fetchTourReservations = async (userId: string, postId: string) => {
  const response = await axios.get(API_MYPAGE_TOURRESERVATIONLIST(userId, postId));
  return response.data;
};

const TourReservationList = ({ userId, postId }: { userId: string; postId: string }) => {
  const router = useRouter();

  const { data, error, isLoading } = useQuery<
    (Tables<'payments'> & {
      users: { id: string; email: string; name: string; avatar: string };
      posts: {
        id: string;
        user_id: string | null;
        title: string;
        image: string | null;
        price: number | null;
        startDate: string | null;
        endDate: string | null;
      };
    })[]
  >({
    queryKey: ['reservations', userId, postId],
    queryFn: () => fetchTourReservations(userId, postId),
    enabled: !!userId && !!postId
  });

  const formatPrice = (price: number | null): string => {
    if (price === null) {
      return 'N/A';
    }
    return `$${price.toLocaleString('en-US')}`;
  };

  const handleBack = () => {
    router.back();
  };

  const handleChat = (
    post: { id: string; user_id: string | null; title: string; image: string | null },
    postAuthorId: string
  ) => {
    const query = new URLSearchParams({
      postId: post.id,
      postTitle: post.title || '',
      postImage: post.image || ''
    }).toString();
    router.push(`/${userId}/${postAuthorId}/chatpage?${query}`);
  };

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error loading reservations</div>;

  if (!data || data.length === 0) return <div>No reservations found</div>;

  return (
    <div>
      <div className="relative flex items-center justify-between">
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
          Reservation List
        </p>
        <div className="w-8"></div>
      </div>
      <div className="mt-[24px] flex">
        <Image
          className="h-[80px] w-[80px] rounded-[8px] web:h-[120px] web:w-[120px] web:rounded-[12px]"
          src={data[0].posts.image || '/default-image.png'}
          alt={data[0]?.posts.title}
          width={80}
          height={80}
        />
        <div className="ml-[8px] flex flex-col gap-[4px] web:ml-[16px] web:gap-[8px]">
          <p className="line-clamp-1 text-[14px] font-semibold text-primary-900 web:text-[21px]">
            {data[0]?.posts.title}
          </p>
          <p className="text-[14px] text-grayscale-500 web:text-[18px]">
            {formatDateRange(data[0]?.posts.startDate, data[0]?.posts.endDate)}
          </p>
          <p className="text-[13px] font-medium text-gray-700 web:text-[18px]">
            <span className="font-semibold text-primary-300">{formatPrice(data[0]?.posts.price)}</span>
            /Person
          </p>
        </div>
      </div>
      <div>
        {data.map((reservation) => (
          <div
            className="my-[20px] flex flex-col gap-[20px] border-b pb-[20px] web:my-[40px] web:gap-[40px] web:pb-[40px]"
            key={reservation.id}
          >
            <div className="flex flex-col gap-[16px] web:gap-[24px]">
              <div className="flex flex-col gap-[8px] text-[14px] web:flex-row web:gap-[16px] web:text-[18px]">
                <span className="min-w-[120px] text-[12px] text-grayscale-500 web:text-[18px]">Number</span>
                <span className="flex-grow text-left">{reservation.id}</span>
              </div>
              <div className="flex flex-col gap-[8px] text-[14px] web:flex-row web:gap-[16px] web:text-[18px]">
                <span className="min-w-[120px] text-[12px] text-grayscale-500 web:text-[18px]">Nickname</span>
                <span className="flex-grow text-left">{reservation.users.name}</span>
              </div>
              <div className="flex flex-col gap-[8px] text-[14px] web:flex-row web:gap-[16px] web:text-[18px]">
                <span className="min-w-[120px] text-[12px] text-grayscale-500 web:text-[18px]">Email</span>
                <span className="flex-grow text-left">{reservation.users.email}</span>
              </div>
              <div className="flex flex-col gap-[8px] text-[14px] web:flex-row web:gap-[16px] web:text-[18px]">
                <span className="min-w-[120px] text-[12px] text-grayscale-500 web:text-[18px]">Date</span>
                <span className="flex-grow text-left">{new Date(reservation.created_at).toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-[8px] text-[14px] web:flex-row web:gap-[16px] web:text-[18px]">
                <span className="min-w-[120px] text-[12px] text-grayscale-500 web:text-[18px]">Tourist</span>
                <span className="flex-grow text-left">{reservation.people}</span>
              </div>
              <div className="flex flex-col gap-[8px] text-[14px] web:flex-row web:gap-[16px] web:text-[18px]">
                <span className="min-w-[120px] text-[12px] text-grayscale-500 web:text-[18px]">Amount</span>
                <span className="flex-grow text-left">{formatPrice(reservation.total_price)}</span>
              </div>
              <div className="flex flex-col gap-[8px] text-[14px] web:flex-row web:gap-[16px] web:text-[18px]">
                <span className="min-w-[120px] text-[12px] text-grayscale-500 web:text-[18px]">State</span>
                <span className="flex-grow text-left">{reservation.pay_state}</span>
              </div>
            </div>
            <button
              className="w-full rounded-[8px] border p-[8px] text-[14px] font-semibold text-grayscale-700 web:rounded-[16px] web:p-[16px] web:text-[18px]"
              onClick={() => handleChat(reservation.posts, reservation.users.id)}
            >
              Message Tourist
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TourReservationList;
