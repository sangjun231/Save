'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchReviews, Review } from '@/utils/supabase/api/detail/reviews';
import { averageRatings, formatRelativeDate } from '@/utils/detail/functions';
import IconStar from '/public/icons/tabler-icon-star-filled.svg';
import BackButton from '@/components/common/Button/BackButton';

const AllReviewsPage = () => {
  const params = useParams();
  const postId = Array.isArray(params.id) ? params.id[0] : params.id;

  // React Query를 사용하여 리뷰 데이터 가져오기
  const {
    data: reviews,
    isPending,
    error
  } = useQuery<Review[]>({
    queryKey: ['reviews', postId],
    queryFn: () => fetchReviews(postId),
    enabled: !!postId // postId가 있을 때만 쿼리 실행
  });

  if (isPending) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (error) {
    return <div className="flex h-screen items-center justify-center">Error: {error.message}</div>;
  }

  if (!reviews || reviews.length === 0) {
    return <div className="flex h-screen items-center justify-center">No reviews found</div>;
  }

  // 평균 평점 계산
  const averageRating: number = averageRatings(reviews || []);

  return (
    <div className="mx-auto mt-2 flex max-w-[360px] flex-col">
      <div className="mx-auto w-full max-w-[320px]">
        <div className="mb-8">
          <BackButton />
        </div>
        <div className="ml-1 flex items-center gap-1 text-lg text-grayscale-900">
          <IconStar alt="Reviews Star" width={24} height={24} />
          <h2 className="flex font-semibold">{averageRating.toFixed(2)}</h2>
          <span className="flex font-normal">·</span>
          <span className="flex font-normal">{reviews.length} reviews</span>
        </div>
        <div className="mt-5 flex flex-col items-center">
          {reviews.map((review) => (
            <div key={review.id} className="mb-5 w-full items-center gap-3 rounded-2xl bg-grayscale-50 p-4">
              <div className="flex items-center gap-2 pb-2">
                <IconStar alt="Reviews Star" width={16} height={16} />
                <p className="text-xs font-semibold">{review.rating.toFixed(2)}</p>
                <p className="text-xs font-medium">{review.user_name}</p>
                <p className="text-[10px] font-normal">{formatRelativeDate(review.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-normal text-gray-700">{review.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllReviewsPage;
