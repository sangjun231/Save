import axios from 'axios';

export const useAutoCancelHandler = () => {
  const handleCancel = async (paymentId: string | null, router: any) => {
    try {
      await axios.post('/api/detail/autocancel', {
        paymentId,
        reason: 'Data save failed',
        requester: 'CUSTOMER'
      });
      alert('결제 데이터 저장에 실패하여 자동으로 환불 처리되었습니다.');
    } catch (cancelError) {
      console.error('Refund failed:', cancelError);
      alert('결제 데이터 저장에 실패했으며, 환불 처리에도 실패했습니다. 관리자에게 문의하세요.');
    }
  };

  return { handleCancel };
};
