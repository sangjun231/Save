import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

type OnConfirmCallback = () => void;

const useRequireLogin = () => {
  const router = useRouter();

  const requireLogin = (onConfirm?: OnConfirmCallback) => {
    Swal.fire({
      title: 'This service requires login!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, login!',
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
        router.push('/login');
      } else if (onConfirm) {
        onConfirm();
      }
    });
  };

  return requireLogin;
};

export default useRequireLogin;
