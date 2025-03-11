'use client';

import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { API_MYPAGE_RESERVATION, API_MYPAGE_REVIEWS } from '@/utils/apiConstants';
import { Tables } from '@/types/supabase';
import { formatDateRange } from '@/utils/detail/functions';

const fetchReservations = async (userId: string) => {
  const response = await axios.get(API_MYPAGE_RESERVATION(userId));
  return response.data;
};

const getReviewsData = async (userId: string) => {
  const response = await axios.get(API_MYPAGE_REVIEWS(userId));
  return response.data as Tables<'reviews'>[];
};

export default function ReservationList() {
  const MySwal = withReactContent(Swal);
  const params = useParams();
  const router = useRouter();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [reviews, setReviews] = useState<Tables<'reviews'>[]>([]);

  const {
    data: reservationsData,
    error,
    isPending,
    refetch
  } = useQuery<
    (Tables<'payments'> & {
      users: { id: string };
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
    queryKey: ['reservationList', userId],
    queryFn: () => fetchReservations(userId),
    enabled: !!userId
  });

  const reviewsQuery = useQuery<Tables<'reviews'>[]>({
    queryKey: ['isReview', userId],
    queryFn: () => getReviewsData(userId),
    enabled: !!userId
  });

  const formatPrice = (price: number | null): string => {
    if (price === null) return 'N/A';
    return `$${price.toLocaleString('en-US')}`;
  };

  const tourStatus = (endDate: string | null, payState: string | null): string => {
    if (payState === 'cancel') return 'Refunded';
    if (!endDate) return 'N/A';
    const currentDate = new Date();
    const tourEndDate = new Date(endDate);
    return tourEndDate < currentDate ? 'Tour Completed' : 'Upcoming Tour';
  };

  const handleReviewAction = (postId: string, reviewId?: string) => {
    router.push(`/${userId}/reviewpage${reviewId ? `?id=${reviewId}&post_id=${postId}` : `?post_id=${postId}`}`);
  };

  const handleChat = (post: Partial<Tables<'posts'>>) => {
    const postAuthorId = post.user_id;
    const query = new URLSearchParams({
      postId: post.id || '',
      postTitle: post.title || '',
      postImage: post.image || ''
    }).toString();
    router.push(`/${userId}/${postAuthorId}/chatpage?${query}`);
  };

  const handleChangeReservation = async (paymentId: string, postId: string) => {
    const result = await MySwal.fire({
      title: 'Do you want to change your tour?',
      text: 'After the full refund, the new payment will be made.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Change Tour',
      cancelButtonText: 'No thanks',
      customClass: {
        actions: 'flex flex-col gap-[8px] w-full',
        title: 'font-semibold text-[18px]',
        htmlContainer: 'text-grayscale-500 text-[14px]',
        popup: 'rounded-[16px] p-[24px]',
        confirmButton: 'bg-primary-300 text-white w-full text-[16px] p-[12px] rounded-[12px]',
        cancelButton: 'bg-white text-[16px] p-[12px] w-full rounded-[12px] text-grayscale-700'
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post(`/api/detail/payment/${paymentId}`, {
          reason: 'User requested cancel',
          requester: 'CUSTOMER'
        });

        MySwal.fire('Refunded!', 'You have been fully refunded!', 'success');

        if (response.data.data.pay_state === 'cancel') {
          router.push(`/detail/reservation/${postId}`);
        }
      } catch (error) {
        MySwal.fire('Failed!', 'The refund is not possible as it has been more than a day.', 'error');
      }
    }
  };

  const handleCancelReservation = async (paymentId: string) => {
    const result = await MySwal.fire({
      title: 'Do you want to cancel your tour?',
      text: 'If you cancel, you will get a full refund',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Cancel Tour',
      cancelButtonText: 'No thanks',
      customClass: {
        actions: 'flex flex-col gap-[8px] w-full',
        title: 'font-semibold text-[18px]',
        htmlContainer: 'text-grayscale-500 text-[14px]',
        popup: 'rounded-[16px] p-[24px]',
        confirmButton: 'bg-primary-300 text-white w-full text-[16px] p-[12px] rounded-[12px]',
        cancelButton: 'bg-white text-[16px] p-[12px] w-full rounded-[12px] text-grayscale-700'
      }
    });

    if (result.isConfirmed) {
      try {
        await axios.post(`/api/detail/payment/${paymentId}`, {
          reason: 'User requested cancel',
          requester: 'CUSTOMER'
        });
        MySwal.fire('Deleted!', 'Your post has been deleted.', 'success');
        refetch();
      } catch (error) {
        MySwal.fire('Failed!', 'Failed to delete post.', 'error');
      }
    }
  };

  useEffect(() => {
    if (reviewsQuery.data) {
      setReviews(reviewsQuery.data);
    }
  }, [reviewsQuery]);

  if (isPending) {
    return <div className="flex min-h-[calc(100vh-400px)] items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="flex min-h-[calc(100vh-400px)] items-center justify-center">Error: {error.message}</div>;
  }

  if (!reservationsData || reservationsData.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-400px)] items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-[8px]">
          <Image src="/icons/tabler-icon-calendar-month.svg" alt="no reservation" width={44} height={44} />
          <p className="text-[14px] font-semibold text-grayscale-900">You don&apos;t have any Reservation</p>
          <p className="text-[12px] text-grayscale-600">When you make a reservation,</p>
          <p className="text-[12px] text-grayscale-600">it will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {reservationsData.map((reservation, index) => {
        const { posts: post, id: paymentId, pay_state } = reservation;
        const status = tourStatus(post.endDate, pay_state ?? '');
        const review = reviews.find((review) => review.post_id === post.id);

        return (
          <div key={`${post.id}-${index}`} className="mb-[20px] border-b pb-[20px] web:mb-[40px] web:pb-[40px]">
            <div className="flex justify-between">
              <div>
                <p className="text-[14px] font-semibold text-grayscale-900 web:text-[21px]">
                  {new Date(reservation.created_at).toLocaleDateString()}
                </p>
                <p
                  className={`text-[14px] font-medium web:text-[21px] ${
                    status === 'Upcoming Tour'
                      ? 'text-primary-300'
                      : status === 'Refunded'
                        ? 'text-error-color'
                        : 'text-grayscale-900'
                  }`}
                >
                  {status}
                </p>
              </div>
              <Link className="flex items-center" href={`/detail/payment/history/${paymentId}`}>
                <p className="text-[14px] font-semibold text-primary-300 web:text-[18px]">Detail</p>
                <Image
                  className="web:h-[24px] web:w-[24px]"
                  src="/icons/tabler-icon-chevron-right-pr300.svg"
                  alt="Edit Profile"
                  width={16}
                  height={16}
                />
              </Link>
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
                    {post.title ?? 'No Title'}
                  </p>
                  <p className="text-[14px] text-grayscale-500 web:text-[18px]">
                    {formatDateRange(post.startDate, post.endDate)}
                  </p>
                  <p className="text-[13px] font-medium text-gray-700 web:text-[18px]">
                    <span className="font-semibold text-primary-300">{formatPrice(post.price)}</span>
                    /Person
                  </p>
                </div>
              </div>
            </Link>
            {status === 'Upcoming Tour' ? (
              <div>
                <div className="mb-[12px] flex gap-[8px] web:mb-[24px] web:gap-[24px]">
                  <button
                    className="flex-1 rounded-[8px] border p-[8px] text-[14px] font-semibold text-grayscale-700 web:rounded-[16px] web:p-[16px] web:text-[18px]"
                    onClick={() => handleChangeReservation(paymentId, post.id)}
                  >
                    Change Tour
                  </button>
                  <button
                    className="flex-1 rounded-[8px] border bg-primary-300 p-[8px] text-[14px] font-semibold text-white web:rounded-[16px] web:p-[16px] web:text-[18px]"
                    onClick={() => {
                      if (paymentId) {
                        handleCancelReservation(paymentId);
                      }
                    }}
                  >
                    Cancel Tour
                  </button>
                </div>
                <button
                  className="w-full rounded-[8px] border p-[8px] text-[14px] font-semibold text-grayscale-700 web:rounded-[16px] web:p-[16px] web:text-[18px]"
                  onClick={() => handleChat(post)}
                >
                  Message Guide
                </button>
              </div>
            ) : status === 'Refunded' ? (
              <button
                className="w-full rounded-[8px] border p-[8px] text-[14px] font-semibold text-grayscale-700 web:rounded-[16px] web:p-[16px] web:text-[18px]"
                onClick={() => handleChat(post)}
              >
                Message Guide
              </button>
            ) : (
              <button
                className="w-full rounded-[8px] border p-[8px] text-[14px] font-semibold text-grayscale-700 web:rounded-[16px] web:p-[16px] web:text-[18px]"
                onClick={() => {
                  handleReviewAction(post.id, review?.id);
                }}
              >
                {review ? 'View Review' : 'Write a Review'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
