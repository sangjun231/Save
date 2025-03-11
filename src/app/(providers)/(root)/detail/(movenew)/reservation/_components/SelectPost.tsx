'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import usePostStore from '@/zustand/postStore';
import { formatDateRange } from '@/utils/detail/functions';
import BackButton from '@/components/common/Button/BackButton';
import useAuthStore from '@/zustand/bearsStore';
import LikeBtn from '/public/icons/tabler-icon-post-heart.svg';
import { useLikeStore } from '@/zustand/likeStore';
import { useWebStore } from '@/zustand/webStateStore';
import Swal from 'sweetalert2';

const SelectPost = () => {
  const { isWeb, setIsWeb } = useWebStore();
  const { id: postId } = useParams<{ id: string }>();
  const { post } = usePostStore((state) => ({
    post: state.post
  }));
  const user = useAuthStore((state) => state.user);

  const { isLiked, fetchLikeStatus, toggleLike } = useLikeStore((state) => ({
    isLiked: state.isLiked,
    fetchLikeStatus: state.fetchLikeStatus,
    toggleLike: state.toggleLike
  }));

  useEffect(() => {
    if (post?.id && user?.id) {
      fetchLikeStatus(post.id, user.id);
    }
  }, [post?.id, user?.id, fetchLikeStatus]);

  const handleLike = () => {
    if (post?.id && user?.id) {
      toggleLike(post.id, user.id);
      const primaryColor = '#B95FAB'; // primary-300 색상의 HEX 코드

      if (isLiked(postId)) {
        Swal.fire({
          title: 'You have removed this post from your favorites!',
          icon: 'info',
          confirmButtonText: 'OK',
          confirmButtonColor: primaryColor // 버튼 색상 설정
        });
      } else {
        Swal.fire({
          title: 'You have added this post to your favorites!',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: primaryColor // 버튼 색상 설정
        });
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // 화면 크기에 따라 isWeb 상태 업데이트
  useEffect(() => {
    const handleResize = () => {
      setIsWeb(window.innerWidth >= 768);
    };

    handleResize(); // 초기 로드 시 한 번 실행
    window.addEventListener('resize', handleResize); // 화면 크기 변경 시마다 실행

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setIsWeb]);

  if (!post) return <div className="flex items-center justify-center">Loading...</div>;

  return (
    <div className="mt-2 flex flex-col items-center gap-2 web:mt-10 web:justify-between">
      <div className="mb-4 flex w-full items-center justify-between py-4">
        <BackButton className="web:hidden" />
        <h2 className="text-center text-lg font-semibold mobile:flex-grow web:text-left web:text-3xl">Pay</h2>
        <div className="w-8"></div>
      </div>
      <div className="flex w-full">
        <div className="flex flex-1">
          <div className="relative mr-4 h-20 w-20 flex-shrink-0 web:h-[140px] web:w-[120px]">
            <Image src={post.image} alt={post.title} fill style={{ objectFit: 'cover' }} className="rounded-lg" />
            <button
              onClick={handleLike}
              className="absolute right-2 top-2 rounded-full bg-[rgba(255,255,255,0.10)] p-0.5 backdrop-blur-[10px] web:p-2"
            >
              {isLiked(postId) ? (
                <LikeBtn width={isWeb ? 24 : 20} height={isWeb ? 24 : 20} color="#FF7029" fill="#FF7029" />
              ) : (
                <LikeBtn width={isWeb ? 24 : 20} height={isWeb ? 24 : 20} color="white" />
              )}
            </button>
          </div>

          <div className="flex flex-col gap-1 web:mb-[137px] web:gap-2">
            <h4 className="line-clamp-1 text-sm font-semibold web:line-clamp-2 web:text-lg web:font-semibold">
              {post.title}
            </h4>
            <p className="text-sm font-normal text-grayscale-500 web:text-base">
              {formatDateRange(post.startDate, post.endDate)}
            </p>
            <div className="flex items-center text-xs web:text-base">
              <span className="font-semibold text-primary-300 web:font-semibold">{formatPrice(post.price)}</span>
              <span className="font-medium text-grayscale-700">/Person</span>
            </div>
          </div>
        </div>
        <div className="mx-6 hidden web:block"></div>
        {/* 모바일에서 숨기고, 웹에서만 보이는 Cancellation Policy */}
        <div className="hidden flex-1 web:block">
          <h3 className="mb-6 text-xl font-medium text-text-color">Cancellation Policy</h3>
          <p className="text-base font-normal text-grayscale-500">
            Before you book, make sure you&apos;re comfortable with
            <u className="text-grayscale-900"> this guide&apos;s cancellation policy.</u> If you want a refund, click
            the Request for a <u className="text-grayscale-900">refund button</u> and you will get a refund right away.
            The refund amount will be refunded before 12 o&apos;clock on the same day. You can cancel it for free up to
            two days after payment. After that, there will be a{' '}
            <u className="text-grayscale-900">cancellation penalty.</u>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectPost;
