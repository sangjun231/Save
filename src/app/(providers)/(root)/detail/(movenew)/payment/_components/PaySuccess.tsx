'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import usePostStore from '@/zustand/postStore';
import axios from 'axios';
import { useMyPageStore } from '@/zustand/mypageStore';
import useAuthStore from '@/zustand/bearsStore';
import Link from 'next/link';
import { useAutoCancelHandler } from '@/hooks/Detail/autoCancelHandler';
import Swal from 'sweetalert2';

export default function PaySuccess() {
  const user = useAuthStore((state) => state.user);
  const { id } = useParams(); // 웹 결제의 경우 id를 사용
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const txId = searchParams.get('txId');
  const postIdFromParams = searchParams.get('postId');
  const totalAmountFromParams = searchParams.get('totalAmount');
  const failureCode = searchParams.get('code'); // 실패 코드를 가져옴
  const router = useRouter();
  const { fetchPost } = usePostStore((state) => ({
    setPostId: state.setPostId,
    fetchPost: state.fetchPost,
    post: state.post
  }));
  const setSelectedComponent = useMyPageStore((state) => state.setSelectedComponent);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [pending, setPending] = useState(true);
  const [isDataSaved, setIsDataSaved] = useState(false);

  const { handleCancel } = useAutoCancelHandler();

  // 중복 실행 방지용 useRef
  const isFailureHandled = useRef(false);

  useEffect(() => {
    // 결제 실패 코드가 있으면 게시물 상세 페이지로 리디렉션
    if (failureCode === 'FAILURE_TYPE_PG' && !isFailureHandled.current) {
      isFailureHandled.current = true; // 이 코드가 한 번만 실행되도록 설정
      alert('Payment has been canceled. You will be redirected to the post detail page.');
      router.push(`/detail/${postIdFromParams}`);
      return; // 이후 로직 실행하지 않도록 return
    }
    const savePaymentData = async () => {
      try {
        if (isDataSaved) return;

        // 결제 데이터를 객체로 묶어서 처리
        const paymentData = {
          id: txId,
          user_id: user?.id,
          post_id: postIdFromParams,
          pay_state: paymentId,
          total_price: parseFloat(totalAmountFromParams || '0')
        };

        // 실제로 데이터 저장 요청에 실패시키기 위해 존재하지 않는 URL로 요청을 보냄
        // await axios.post('/api/non-existent-url', paymentData);

        // 결제 내역을 서버에 저장
        const response = await axios.post('/api/detail/payment', paymentData);
        setPaymentData(response.data);
        setIsDataSaved(true);
      } catch (error) {
        console.error('Error saving payment data:', error);
        await handleCancel(paymentId, router);
        router.push(`/${user?.id}/mypage`);
      } finally {
        setPending(false);
      }
    };

    if (paymentId && txId && postIdFromParams && totalAmountFromParams && !isDataSaved && user?.id) {
      savePaymentData();
    } else {
      setPending(false);
    }
  }, [paymentId, txId, postIdFromParams, totalAmountFromParams, user?.id, isDataSaved]);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        if (!isDataSaved) {
          await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5초 대기
        }

        // 모바일 결제는 txId를, 웹 결제는 id를 사용하여 데이터 조회
        const response = await axios.get(`/api/detail/payment/${txId || id}`);
        setPaymentData(response.data);
        if (response.data && response.data.post_id) {
          fetchPost(response.data.post_id);
        }
      } catch (error) {
        console.error('Error fetching payment data:', error);
      } finally {
        setPending(false);
      }
    };

    if (txId || id) {
      fetchPaymentData();
    }
  }, [txId, id, fetchPost, isDataSaved]);

  const handleReservationsClick = () => {
    if (!user) {
      alert('로그인이 필요한 서비스입니다!!');
      router.push('/login');
      return;
    }
    setSelectedComponent('Reservations');
    router.push(`/${user?.id}/mypage`);
  };

  const handleCancelRequest = async () => {
    try {
      const response = await axios.post(`/api/detail/payment/${txId || id}`, {
        reason: 'User requested cancel',
        requester: 'CUSTOMER'
      });

      // 성공 시 알림
      if (response.data.success) {
        Swal.fire({
          title: 'Cancellation Successful',
          text: response.data.message,
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          setSelectedComponent('Reservations');
          router.push(`/${user?.id}/mypage`);
        });
      } else {
        Swal.fire({
          title: 'Cancellation Failed',
          text: response.data.message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Error requesting cancel:', error);
      Swal.fire({
        title: 'Error',
        text: 'The refund is not possible as it has been more than a day.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleCancelClick = () => {
    Swal.fire({
      title: 'Are you sure you want to cancel the payment?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: 'white',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, thanks',
      customClass: {
        actions: 'flex flex-col gap-[8px] w-full',
        title: 'font-semibold text-[18px]',
        htmlContainer: 'text-grayscale-500 text-[14px]',
        popup: 'rounded-[16px] p-[24px]',
        confirmButton: 'bg-primary-300 text-white w-full text-[16px] p-[12px] rounded-[12px]',
        cancelButton: 'bg-white text-[16px] p-[12px] w-full rounded-[12px] text-grayscale-700'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        handleCancelRequest();
      }
    });
  };

  if (failureCode === 'FAILURE_TYPE_PG') {
    // 결제 실패인 경우 PaySuccess 컴포넌트를 렌더링하지 않음
    return null;
  }

  if (pending) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="web:gap-3 web:mb-12 web:max-w-lg mb-5 flex w-full flex-col items-center gap-1">
        <h1 className="web:text-3xl mb-2 text-center text-xl font-semibold text-grayscale-900">
          We’re getting your tour!
        </h1>
        <p className="web:text-lg text-center text-xs font-normal text-grayscale-600">
          The payment has been completed.
        </p>
      </div>
      <div className="web:max-w-lg flex w-full flex-col gap-2">
        <button
          onClick={handleReservationsClick}
          className="web:text-lg web:py-4 web:rounded-2xl w-full cursor-pointer rounded-xl bg-primary-300 px-6 py-3 text-center text-white"
        >
          My Reservation
        </button>
        <Link
          href="/"
          className="web:text-lg web:py-4 web:rounded-2xl w-full rounded-xl border border-primary-300 px-6 py-3 text-center text-primary-300"
        >
          Back to Home
        </Link>
      </div>
      <div className="web:max-w-lg absolute bottom-20 flex w-full flex-col items-center">
        <div className="web:text-base mb-2 text-center text-xs text-gray-600">
          Is there a mistake? You can cancel it immediately by pressing the button below
        </div>
        <button onClick={handleCancelClick} className="web:text-lg text-sm font-semibold text-grayscale-900 underline">
          Cancel Now
        </button>
      </div>
    </div>
  );
}
