'use client';

import Image from 'next/image';
import usePostStore from '@/zustand/postStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { formatDate, formatDateRange } from '@/utils/detail/functions';
import { useParams } from 'next/navigation';
import LikeBtn from '/public/icons/tabler-icon-post-heart.svg';
import ExitBtn from '/public/icons/tabler-icon-x.svg';
import { useLikeStore } from '@/zustand/likeStore';
import useAuthStore from '@/zustand/bearsStore';
import { useMyPageStore } from '@/zustand/mypageStore';
import { useWebStore } from '@/zustand/webStateStore';
import BackButton from '@/components/common/Button/BackButton';

export default function PaymentHistory() {
  const { id } = useParams(); // URL 경로에서 id 파라미터를 가져옴
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setSelectedComponent = useMyPageStore((state) => state.setSelectedComponent);
  const { fetchPost, post } = usePostStore((state) => ({
    fetchPost: state.fetchPost,
    post: state.post
  }));
  const [paymentData, setPaymentData] = useState<any>(null);
  const [pending, setPending] = useState(true);
  const { isLiked, fetchLikeStatus, toggleLike } = useLikeStore((state) => ({
    isLiked: state.isLiked,
    fetchLikeStatus: state.fetchLikeStatus,
    toggleLike: state.toggleLike
  }));
  const { isWeb, setIsWeb } = useWebStore();

  useEffect(() => {
    const handleResize = () => {
      setIsWeb(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [setIsWeb]);

  useEffect(() => {
    if (post?.id && user?.id) {
      fetchLikeStatus(post.id, user.id);
    }
  }, [post?.id, user?.id, fetchLikeStatus]);

  const handleLike = () => {
    if (post?.id && user?.id) {
      toggleLike(post.id, user.id);
    }
  };

  const handleExitClick = () => {
    setSelectedComponent('Reservation');
    router.push(`/${user?.id}/mypage`);
  };

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!id) {
        setPending(false);
        return;
      }
      try {
        const response = await axios.get(`/api/detail/payment/${id}`);
        const payment = response.data;
        setPaymentData(payment);
        if (payment && payment.post_id) {
          await fetchPost(payment.post_id);
        }
      } catch (error) {
        console.error('Error fetching payment data:', error);
      } finally {
        setPending(false);
      }
    };

    fetchPaymentData();
  }, [id, fetchPost]);

  if (pending) {
    return <div>Loading...</div>;
  }

  if (!paymentData) {
    return <div>No payment data found.</div>;
  }

  const postPrice = post?.price ?? 0;
  const numberOfPeople = postPrice > 0 ? paymentData.total_price / postPrice : 'N/A';

  return (
    <div className="mt-2 flex w-full flex-col web:gap-20">
      <div className="web:flex web:gap-5">
        <button className="icon-button my-2" onClick={handleExitClick}>
          {isWeb ? (
            <BackButton /> // 웹 버전일 경우 BackButton 사용
          ) : (
            <ExitBtn width={24} height={24} /> // 모바일 버전일 경우 ExitBtn 사용
          )}
        </button>
        <h1 className="my-5 text-xl font-semibold web:text-3xl">Reservation confirmed</h1>
      </div>
      {post && (
        <div>
          <div className="flex items-start space-x-4">
            {/* 이미지와 제목 */}
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg web:h-[120px] web:w-[120px]">
              <Image src={post.image} alt={post.title} fill style={{ objectFit: 'cover' }} className="rounded-lg" />
              {/* <button
                onClick={handleLike}
                className="absolute right-1 top-2 rounded-full bg-[rgba(255,255,255,0.10)] p-0.5 backdrop-blur-[10px]"
              >
                결제 및 환불 내역 좋아요 기능 주석 
                {liked ? (
                  <LikeBtn width={20} height={20} color="#FF7029" fill="#FF7029" />
                ) : (
                  <LikeBtn width={20} height={20} color="white" />
                )}
              </button> */}
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="line-clamp-1 text-sm font-semibold web:text-xl">{post.title}</h4>
              <p className="text-sm text-gray-500 web:text-lg">{formatDateRange(post.startDate, post.endDate)}</p>
              <div className="text-sm font-medium web:text-lg">
                <span className="text-primary-300">${post.price}</span>
                <span className="text-grayscale-700">/Person</span>
              </div>
            </div>
          </div>
          <hr className="my-5 h-[1px] w-full bg-grayscale-100 web:my-10" />

          {/* 예약 정보 */}
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold web:text-3xl">Reservation</h3>
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-xs text-grayscale-500 web:text-lg">Number</span>
              <span className="text-sm text-grayscale-900 web:text-lg">{paymentData.id}</span>
            </div>
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-xs text-grayscale-500 web:text-lg">Nickname</span>
              <span className="text-sm text-grayscale-900 web:text-lg">{paymentData.users.name}</span>
            </div>
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-xs text-grayscale-500 web:text-lg">Email</span>
              <span className="text-sm text-grayscale-900 web:text-lg">{paymentData.users.email}</span>
            </div>
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-xs text-grayscale-500 web:text-lg">Tourist</span>
              <span className="text-sm text-grayscale-900 web:text-lg">{numberOfPeople}</span>
            </div>
          </div>

          <hr className="my-5 h-[1px] w-full bg-grayscale-100 web:my-10" />

          {/* 결제 정보 */}
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold web:text-3xl">Payment</h3>
            <div className="mt-2 flex flex-col gap-2 text-sm">
              <span className="text-xs text-grayscale-500 web:text-lg">Date</span>
              <span className="text-sm text-grayscale-900">{formatDate(paymentData.created_at)}</span>
            </div>
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-xs text-grayscale-500 web:text-lg">Amount</span>
              <span className="text-sm text-grayscale-900 web:text-lg">${paymentData.total_price.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-xs text-grayscale-500 web:text-lg">Method</span>
              <span className="text-sm text-grayscale-900 web:text-lg">Card</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
