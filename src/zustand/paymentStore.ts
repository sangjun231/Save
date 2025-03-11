import { create } from 'zustand';
import * as PortOne from '@portone/browser-sdk/v2';

// PaymentResponse 타입 수동 정의
interface PaymentResponse {
  code?: string;
  txId?: string;
  paymentId?: string;
}

// Zustand 상태 정의
interface PaymentState {
  totalAmount: number;
  txId: string | null;
  paymentId: string | null;
  setTotalAmount: (amount: number) => void;
  setTxId: (txId: string) => void;
  setPaymentId: (paymentId: string) => void;
}

// Zustand 스토어 생성
export const usePaymentStore = create<PaymentState>((set) => ({
  totalAmount: 0,
  txId: null,
  paymentId: null,
  setTotalAmount: (amount) => set({ totalAmount: amount }),
  setTxId: (txId) => {
    set({ txId });
  },
  setPaymentId: (paymentId) => {
    set({ paymentId });
  }
}));

// 결제 요청 함수 (redirectUrl 수정)
export async function initiatePayment(
  post: any,
  user: any,
  totalAmountInCents: number,
  isMobile: boolean,
  redirectUrl?: string // redirectUrl을 선택적 매개변수로 변경
): Promise<PaymentResponse | undefined> {
  console.log('redirectUrl in initiatePayment:', redirectUrl);

  try {
    // 기본 결제 옵션 설정
    const paymentOptions: any = {
      storeId: process.env.NEXT_PUBLIC_POSTONE_STORE_ID || '',
      channelKey: process.env.NEXT_PUBLIC_POSTONE_KG_CHANNEL_KEY || '',
      paymentId: `payment${crypto.randomUUID().split('-')[0]}`,
      orderName: post.title,
      totalAmount: totalAmountInCents,
      currency: 'CURRENCY_KRW',
      payMethod: 'CARD',
      customer: {
        fullName: user?.name || 'Unknown',
        phoneNumber: user?.phone || '010-0000-0000',
        email: user?.email || 'test@portone.io'
      },
      locale: 'EN_US'
    };

    // 모바일 환경인 경우
    if (isMobile) {
      paymentOptions.bypass = {
        inicis_v2: {
          P_CARD_OPTION: 'selcode=14',
          P_MNAME: '포트원',
          P_RESERVED: ['below1000=Y', 'noeasypay=Y', 'global_visa3d=Y', 'apprun_check=Y']
        }
      };
      if (redirectUrl) {
        paymentOptions.redirectUrl = redirectUrl;
      }
    }
    // 웹 환경인 경우
    else {
      paymentOptions.bypass = {
        inicis_v2: {
          logo_url: 'https://portone.io/assets/portone.87061e94.avif',
          logo_2nd: 'https://admin.portone.io/assets/img/auth/lock.png',
          parentemail: 'parentemail',
          Ini_SSGPAY_MDN: '01012341234',
          acceptmethod: ['SKIN(#BA68C8)', 'below1000', 'noeasypay'],
          P_CARD_OPTION: 'selcode=14',
          P_MNAME: '포트원',
          P_RESERVED: ['below1000=Y', 'noeasypay=Y']
        }
      };
    }

    // 결제 요청 실행
    const response = await PortOne.requestPayment(paymentOptions);

    return response;
  } catch (error) {
    console.error('Payment request error:', error);
    throw new Error('결제 요청 중 오류가 발생했습니다.');
  }
}

// 전역 상태를 사용하는 결제 처리 함수
export const requestPayment = async (
  post: any,
  user: any,
  totalAmount: number,
  handlePaymentSuccess: (response: any) => Promise<void>,
  handlePaymentFailure: (error: any) => Promise<void>,
  redirectUrl: string // DetailNavbar에서 전달된 URL
) => {
  const { setTxId, setPaymentId } = usePaymentStore.getState();
  const totalAmountInCents = totalAmount * 1000;

  // 사용자가 모바일인지 확인
  const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  try {
    // 결제 요청 함수 호출
    const response = await initiatePayment(post, user, totalAmountInCents, isMobile, redirectUrl);

    // 결제 요청 실패 처리
    if (response?.code != null) {
      console.error('Payment failed with code:', response.code);
      await handlePaymentFailure(response);
    } else if (response) {
      const { txId, paymentId } = response;

      // txId와 paymentId가 없는 경우 예외 처리
      if (!txId || !paymentId) {
        throw new Error('txId 또는 paymentId가 응답에 포함되지 않았습니다.');
      }

      // 전역 상태에 txId와 paymentId 저장
      setTxId(txId);
      setPaymentId(paymentId);

      // 성공 시 handlePaymentSuccess 호출
      await handlePaymentSuccess(response);
    } else {
      console.error('Payment response is undefined or null.');
      alert('결제 응답이 없습니다.');
    }
  } catch (error) {
    console.error('Payment request error:', error);
    alert('An error occurred while processing the payment request.');
  }
};

export default usePaymentStore;
