'use client';

import React, { useEffect, useState } from 'react';
import useAuthStore from '@/zustand/bearsStore';
import usePostStore from '@/zustand/postStore';
import usePaymentStore from '@/zustand/paymentStore';

const SelectUser = () => {
  const user = useAuthStore((state) => state.user);
  const post = usePostStore((state) => state.post);
  const { totalAmount, setTotalAmount } = usePaymentStore((state) => ({
    totalAmount: state.totalAmount,
    setTotalAmount: state.setTotalAmount
  }));

  const [numPersons, setNumPersons] = useState<number | string>(1);

  useEffect(() => {
    if (post) {
      const num = typeof numPersons === 'string' ? parseFloat(numPersons) : numPersons;
      setTotalAmount(post.price * num);
    }
  }, [numPersons, post, setTotalAmount]);

  // 예약 인원 입력 필드 변경 시 호출되는 함수
  const handleNumPersonsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 빈 문자열은 그대로 상태에 반영하고, 숫자만 업데이트
    if (value === '' || /^\d+$/.test(value)) {
      setNumPersons(value === '' ? '' : parseFloat(value));
    }
  };

  return (
    <div className="web:w-2/5 mobile:mt-6 web:absolute top-[343px] flex w-full flex-col">
      <div className="web:mb-20 mb-5 gap-2">
        <h3 className="web:text-xl web:mb-5 text-base font-medium text-text-color">How many tourists?</h3>
        <input
          type="number"
          className="my-2 w-full rounded-xl bg-grayscale-50 p-6 text-base outline-none"
          min="1"
          placeholder="ex) 3"
          value={numPersons === '' ? '' : numPersons}
          onChange={handleNumPersonsChange}
        />

        <p className="web:mt-6 web:text-base text-[10px] text-grayscale-500">
          If you exceed the number of people booked, your reservation may be canceled. Please contact the guide first.
        </p>
      </div>
      <div className="mb-5 gap-2">
        <h3 className="web:text-xl web:mb-5 text-base font-medium text-text-color">Nickname/email</h3>
        <div className="my-2 w-full rounded-xl bg-grayscale-100 p-6">
          {user ? user.email : '로그인 정보가 없습니다.'}
        </div>
      </div>
      <div className="web:hidden">
        <h3 className="web:text-xl web:mb-5 mb-1 text-base font-medium text-text-color">Cancellation Policy</h3>
        <p className="web:text-base text-xs font-normal text-grayscale-500">
          Before you book, make sure you&apos;re comfortable with
          <u className="text-grayscale-900"> this guide&apos;s cancellation policy.</u> If you want a refund, click the
          Request for a <u className="text-grayscale-900">refund button</u> and you will get a refund right away. The
          refund amount will be refunded before 12 o&apos;clock on the same day. You can cancel it for free up to two
          days after payment. After that, there will be a <u className="text-grayscale-900">cancellation penalty.</u>
        </p>
      </div>
    </div>
  );
};

export default SelectUser;
