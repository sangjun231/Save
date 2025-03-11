'use client';

import React, { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '@/zustand/bearsStore';
import usePostStore from '@/zustand/postStore';
import usePaymentStore, { requestPayment } from '@/zustand/paymentStore';
import { formatDateRange } from '@/utils/detail/functions';
import axios from 'axios';
import { useAutoCancelHandler } from '@/hooks/Detail/autoCancelHandler';
import useRequireLogin from '@/hooks/CustomAlert';

const DetailNavbar = () => {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const { post } = usePostStore((state) => ({
    post: state.post
  }));
  const { totalAmount } = usePaymentStore((state) => ({
    totalAmount: state.totalAmount
  }));

  const { handleCancel } = useAutoCancelHandler();
  const requireLogin = useRequireLogin();

  const handlePaymentSuccess = useCallback(
    async (response: any) => {
      console.log('Payment Response:', response);
      if (response.txId && response.paymentId) {
        const paymentData = {
          id: response.txId, // 고유 트랜잭션 ID
          user_id: user?.id, // 로그인한 사용자 ID
          user_email: user?.email,
          post_id: post?.id, // 결제한 게시물 ID
          pay_state: response.paymentId, // 결제 서비스 제공자에서 생성한 고유 결제 ID
          total_price: totalAmount // 총 결제 금액
        };
        try {
          // 실제로 데이터 저장 요청에 실패시키기 위해 존재하지 않는 URL로 요청을 보냄
          // await axios.post('/api/non-existent-url', paymentData);

          // 결제 내역을 서버에 저장
          await axios.post('/api/detail/payment', paymentData);
          router.push(`/detail/payment/${response.txId}`);
        } catch (error) {
          console.error('Error saving payment data:', error);
          await handleCancel(response.paymentId, router);
          router.push(`/${user?.id}/mypage`);
        }
      } else {
        console.error('Invalid payment response:', response);
        router.back();
      }
    },
    [router, user?.id, user?.email, post?.id, totalAmount]
  );

  const handlePaymentFailure = useCallback(
    async (error: any) => {
      console.error('Payment failed:', error);
      router.push(`/detail/${post?.id}`);
    },
    [router, post?.id]
  );

  const handlePaymentClick = async () => {
    if (post && user) {
      const postId = post.id;
      const totalAmountFormatted = totalAmount.toString(); // totalAmount를 문자열로 변환
      // baseRedirectUrl에 post_id와 total_amount를 쿼리 파라미터로 추가
      const baseRedirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/payment?postId=${postId}&totalAmount=${totalAmountFormatted}`;
      await requestPayment(post, user, totalAmount, handlePaymentSuccess, handlePaymentFailure, baseRedirectUrl);
    }
  };

  const handleReserveClick = () => {
    if (!user) {
      requireLogin();
    } else {
      router.push(`/detail/reservation/${post?.id}`);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 z-10 w-full bg-white web:mt-28">
      {pathname.includes('reservation') ? (
        <div className="border-t-1 h-20 w-full border-grayscale-100 px-5 shadow-custom-navbar web:h-[133px] web:px-[88px]">
          <div className="flex h-full items-center justify-between">
            <div className="flex flex-1 flex-col justify-center web:gap-y-2.5">
              <div className="flex items-center text-lg web:text-4xl">
                <span className="font-semibold text-grayscale-900">${totalAmount}</span>
                <span className="font-medium text-grayscale-600">/Total</span>
              </div>
              <div className="flex justify-start">
                <p className="text-xs font-medium text-grayscale-900 web:text-xl web:text-grayscale-600">
                  {formatDateRange(post?.startDate ?? null, post?.endDate ?? null)}
                </p>
              </div>
            </div>
            <button
              onClick={handlePaymentClick}
              className="flex max-w-[480px] flex-1 items-center justify-center rounded-xl bg-primary-300 px-5 py-3 text-base font-semibold text-white web:px-6 web:py-4 web:text-xl"
            >
              Confirm and Pay
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t-1 h-20 w-full border-grayscale-100 px-5 shadow-custom-navbar web:h-[133px] web:px-[88px]">
          <div className="flex h-full items-center justify-between">
            <div className="flex flex-1 flex-col justify-center web:gap-2.5">
              <div className="flex items-center text-lg web:text-4xl">
                <span className="font-semibold text-primary-300">${post?.price}</span>
                <span className="font-medium text-grayscale-600">/Person</span>
              </div>
              <div className="flex justify-start">
                <p className="text-xs font-medium text-grayscale-900 web:text-xl">
                  {formatDateRange(post?.startDate ?? null, post?.endDate ?? null)}
                </p>
              </div>
            </div>
            <button
              onClick={handleReserveClick}
              className="flex max-w-[480px] flex-1 items-center justify-center rounded-xl bg-primary-300 px-5 py-3 text-base font-semibold text-white web:px-6 web:py-4 web:text-xl"
            >
              Reserve
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailNavbar;
