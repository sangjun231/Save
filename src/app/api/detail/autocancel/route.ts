import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

export async function POST(request: NextRequest) {
  const { paymentId, reason, requester } = await request.json();

  try {
    // PortOne 결제 취소 요청 API 호출
    const cancelResponse = await axios.post(
      `https://api.portone.io/payments/${paymentId}/cancel`,
      {
        storeId: process.env.NEXT_PUBLIC_POSTONE_STORE_ID || '',
        reason: reason || 'Data save failed',
        requester: requester || 'CUSTOMER'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `PortOne ${process.env.NEXT_PUBLIC_PORTONE_SECRET_KEY}`
        }
      }
    );

    const responseData = cancelResponse.data;

    if (responseData.status === 'FAILED') {
      // 환불 실패 시 처리
      return NextResponse.json({ message: 'Cancel failed', error: responseData.reason }, { status: 400 });
    } else {
      // 환불 성공 시 처리
      return NextResponse.json({ message: '환불 성공!', data: responseData }, { status: 200 });
    }
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Refund request failed:', axiosError);
    return NextResponse.json({ message: 'Cancel request failed', error: axiosError.message }, { status: 500 });
  }
}
