'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Rating from 'react-rating-stars-component';
import { API_POST_DETAILS, API_MYPAGE_REVIEWS } from '@/utils/apiConstants';
import { Tables } from '@/types/supabase';
import { formatDateRange } from '@/utils/detail/functions';

const ReviewForm = ({ userId }: { userId: string }) => {
  const [review, setReview] = useState<Tables<'reviews'>>();
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [post, setPost] = useState<Tables<'posts'>>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const postId = searchParams.get('post_id');

  const fetchReview = async () => {
    if (id) {
      const response = await axios.get(`${API_MYPAGE_REVIEWS(userId)}?id=${id}&post_id=${postId}`);
      const reviewData = response.data[0];
      setReview(reviewData);
      setContent(reviewData.content);
      setRating(reviewData.rating);

      if (reviewData.post_id) {
        fetchPost(reviewData.post_id);
      }
    }
  };

  const fetchPost = async (post_id: string) => {
    const response = await axios.get(API_POST_DETAILS(post_id));
    const postData: Tables<'posts'> = response.data;
    setPost(postData);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (id) {
      await axios.put(API_MYPAGE_REVIEWS(userId), { id, content, rating });
    } else {
      await axios.post(API_MYPAGE_REVIEWS(userId), { content, rating, post_id: postId, user_id: userId });
    }
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  const ratingChanged = (newRating: number) => {
    setRating(newRating);
  };

  useEffect(() => {
    fetchReview();

    if (postId) {
      fetchPost(postId);
    }
  }, [id, postId]);

  return (
    <div className="mt-[8px]">
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
          {id ? 'Edit Review' : 'New Review'}
        </p>
        <div className="w-8"></div>
      </div>
      <div className="my-[20px]">
        {post ? (
          <div className="flex">
            <Image
              className="rounded-[8px] web:h-[120px] web:w-[120px] web:rounded-[12px]"
              src={post.image ?? '/icons/upload.png'}
              alt={post.title ?? 'Default title'}
              width={44}
              height={44}
            />
            <div className="ml-[8px] flex flex-col gap-[4px] web:ml-[16px] web:gap-[8px]">
              <p className="text-[14px] font-semibold text-primary-900 web:text-[21px]">{post.title}</p>
              <p className="text-[14px] text-grayscale-500 web:text-[18px]">
                {formatDateRange(post.startDate, post.endDate)}
              </p>
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <Rating key={rating} count={5} value={rating} onChange={ratingChanged} size={24} activeColor="#ffd700" />
        <div className="flex flex-col gap-[12px] web:gap-[24px]">
          <textarea
            className="mt-[20px] h-[225px] w-full resize-none rounded-2xl border bg-grayscale-50 p-[16px] text-[14px] text-grayscale-900 web:mt-[40px] web:p-[24px] web:text-[16px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="You can write up to 500 characters"
          />
          <button
            className="w-full rounded-xl border bg-primary-300 p-[12px] text-[16px] font-semibold text-white web:p-[16px] web:text-[18px]"
            type="submit"
          >
            {id ? 'Update Review' : 'Add Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
