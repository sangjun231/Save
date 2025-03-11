'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import axios from 'axios';

interface Payment {
  id: string;
  user_id: string;
  post_id: string;
  total_price: number;
  created_at: string;
  pay_state: string;
  user_name: string;
  user_email: string;
  post_title: string;
}

const PaymentManagement = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [reason, setReason] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    Modal.setAppElement('body');

    const fetchPayments = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error fetching user data:', userError);
        setError(userError.message);
        return null;
      }

      if (!user) {
        console.error('No user found');
        setError('사용자가 없습니다.');
        return null;
      }

      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (userFetchError) {
        console.error('Error fetching user data:', userFetchError);
        setError(userFetchError.message);
        return null;
      }

      if (!userData.is_admin) {
        console.error('Access denied: Not an admin');
        setError('접근이 거부되었습니다: 관리자가 아닙니다.');
        return null;
      }

      const { data: paymentsData, error: paymentsError } = await supabase.from('payments').select(`
          id,
          user_id,
          post_id,
          total_price,
          created_at,
          pay_state,
          users ( name, email ),
          posts ( title )
        `);

      if (paymentsError) {
        console.error('Error fetching payments data:', paymentsError);
        setError(paymentsError.message);
        return null;
      }

      const formattedPayments = paymentsData.map((payment: any) => ({
        id: payment.id,
        user_id: payment.user_id,
        post_id: payment.post_id,
        total_price: payment.total_price,
        created_at: payment.created_at,
        pay_state: payment.pay_state,
        user_name: payment.users ? payment.users.name : 'N/A', // 기본값 설정
        user_email: payment.users ? payment.users.email : 'N/A', // 기본값 설정
        post_title: payment.posts ? payment.posts.title : 'N/A' // 기본값 설정
      }));

      return formattedPayments;
    };

    const getPayments = async () => {
      const payments = await fetchPayments();
      if (payments) {
        setPayments(payments);
      }
    };

    getPayments();
  }, [supabase]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16).replace('T', ' ');
  };

  const handleCancelRequest = async () => {
    if (!selectedPayment) return;

    try {
      const response = await axios.post(`/api/detail/payment/${selectedPayment.id}`, {
        reason: reason,
        requester: 'ADMIN'
      });
      toast.success(response.data.message);

      // 업데이트된 결제 정보 가져오기
      const { data: updatedPayment } = await axios.get(`/api/detail/payment/${selectedPayment.id}`);
      const formattedUpdatedPayment = {
        id: updatedPayment.id,
        user_id: updatedPayment.user_id,
        post_id: updatedPayment.post_id,
        total_price: updatedPayment.total_price,
        created_at: updatedPayment.created_at,
        pay_state: updatedPayment.pay_state,
        user_name: updatedPayment.users.name,
        user_email: updatedPayment.users.email,
        post_title: updatedPayment.posts.title
      };

      // 상태 업데이트
      setPayments(
        payments.map((payment) => (payment.id === formattedUpdatedPayment.id ? formattedUpdatedPayment : payment))
      );

      setSelectedPayment(null);
      setReason('');
    } catch (error) {
      console.error('Error requesting cancel:', error);
      toast.error('Cancel request failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-6">
      <h1 className="mb-4 text-2xl font-bold">결제 관리</h1>
      {error && <p className="text-red-500">{error}</p>}
      <table className="min-w-full border border-gray-300 bg-white">
        <thead>
          <tr>
            <th className="border-b px-4 py-2 text-left">유저 이름</th>
            <th className="border-b px-4 py-2 text-left">이메일</th>
            <th className="border-b px-4 py-2 text-left">포스트 제목</th>
            <th className="border-b px-4 py-2 text-left">가격</th>
            <th className="border-b px-4 py-2 text-left">결제기간</th>
            <th className="border-b px-4 py-2 text-left">결제상태</th>
            <th className="border-b px-4 py-2 text-left">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="border-b px-4 py-2">{payment.user_name}</td>
              <td className="border-b px-4 py-2">{payment.user_email}</td>
              <td className="border-b px-4 py-2">{payment.post_title}</td>
              <td className="border-b px-4 py-2">${payment.total_price}</td>
              <td className="border-b px-4 py-2">{formatDate(payment.created_at)}</td>
              <td className="border-b px-4 py-2">{payment.pay_state}</td>
              <td className="border-b px-4 py-2">
                <button
                  onClick={() => setSelectedPayment(payment)}
                  className="mr-2 rounded bg-blue-500 px-2 py-1 text-white"
                >
                  환불
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        isOpen={selectedPayment !== null}
        onRequestClose={() => setSelectedPayment(null)}
        contentLabel="Refund Payment"
        style={{
          content: {
            width: '300px',
            height: '300px',
            margin: 'auto',
            padding: '20px',
            textAlign: 'center'
          }
        }}
      >
        <h2 className="mb-4 text-xl">환불 요청</h2>
        <label className="mb-2 block">
          환불 사유:
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded border border-gray-400 p-2"
          />
        </label>
        <button onClick={handleCancelRequest} className="mr-2 rounded bg-blue-500 px-4 py-1 text-white">
          요청 보내기
        </button>
        <button onClick={() => setSelectedPayment(null)} className="rounded bg-gray-300 px-4 py-1">
          취소
        </button>
      </Modal>
    </div>
  );
};

export default PaymentManagement;
