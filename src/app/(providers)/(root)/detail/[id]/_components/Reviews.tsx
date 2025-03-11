'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchReviews, Review } from '@/utils/supabase/api/detail/reviews';
import { averageRatings, formatRelativeDate } from '@/utils/detail/functions';
import useAuthStore from '@/zustand/bearsStore';
import IconStar from '/public/icons/tabler-icon-star-filled.svg';
import { WebProps } from '@/types/webstate';

const Reviews = ({ isWeb }: WebProps) => {
  const user = useAuthStore((state) => state.user);
  const params = useParams();
  const postId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [showAllReviews, setShowAllReviews] = useState(false);

  const {
    data: reviews,
    isPending,
    error
  } = useQuery<Review[]>({
    queryKey: ['reviews', postId],
    queryFn: () => fetchReviews(postId),
    enabled: !!postId
  });

  const averageRating = averageRatings(reviews || []);

  if (isPending) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (error) {
    return <div className="flex h-screen items-center justify-center">Error: {error.message}</div>;
  }

  return (
    <div className="mb-32 flex flex-col">
      <hr className="web:my-20 web:my-20 mb-6 mt-3 h-[1px] w-full bg-grayscale-100" />
      <div className="web:gap-10 flex flex-col">
        <div className="web:text-4xl web:gap-2 flex items-center gap-1 text-lg text-grayscale-900">
          <IconStar alt="Reviews Star" width={isWeb ? 44 : 24} height={isWeb ? 44 : 24} />
          {reviews.length > 0 ? (
            <>
              <h2 className="font-semibold">{averageRating.toFixed(2)}</h2>
              <span className="font-medium">·</span>
              <span className="font-medium">{reviews.length} reviews</span>
            </>
          ) : (
            <h2 className="font-semibold">No Reviews</h2>
          )}
        </div>
        {reviews.length > 0 && (
          <>
            <div className="web:gap-10 web:mb-8 my-4 flex flex-col gap-3">
              {reviews.slice(0, showAllReviews || isWeb ? reviews.length : 1).map((review) => (
                <div key={review.id} className="web:p-6 web:gap-4 flex flex-col gap-2 rounded-2xl bg-grayscale-50 p-4">
                  <div className="flex items-center gap-2">
                    <IconStar alt="Reviews Star" width={16} height={16} />
                    <div className="web:gap-4 flex flex-row items-center gap-2">
                      <h4 className="web:text-xl text-xs font-semibold">{review.rating.toFixed(2)}</h4>
                      <h4 className="web:text-lg text-xs text-gray-900">・</h4>
                      <span className="web:text-xl text-xs text-gray-900">{review.user_name}</span>
                      <span className="web:text-sm text-[10px] font-normal text-gray-700">
                        {formatRelativeDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                  <p className="web:text-lg line-clamp-3 text-sm font-normal text-gray-700">{review.content}</p>
                </div>
              ))}
            </div>
            <button
              className="web:hidden w-full rounded-xl border border-gray-800 px-5 py-3 text-center text-base font-semibold text-gray-700"
              onClick={() => {
                if (isWeb) {
                  setShowAllReviews((prev) => !prev);
                } else {
                  router.push(`/detail/allreviews/${postId}`);
                }
              }}
            >
              Show more reviews
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Reviews;
