import axios from 'axios';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const handleDelete = async (postId: string, router: AppRouterInstance) => {
  const MySwal = withReactContent(Swal);
  const result = await MySwal.fire({
    title: 'Do you want to delete your tour?',
    text: 'If you delete, you can always rewrite it later',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete Tour',
    cancelButtonText: 'No thanks',
    customClass: {
      actions: 'flex flex-col gap-[8px] w-full',
      title: 'font-semibold text-[18px]',
      htmlContainer: 'text-grayscale-500 text-[14px]',
      popup: 'rounded-[16px] p-[24px]',
      confirmButton: 'bg-primary-300 text-white w-full text-[16px] p-[12px] rounded-[12px]',
      cancelButton: 'bg-white text-[16px] p-[12px] w-full rounded-[12px] text-grayscale-700'
    }
  });

  if (result.isConfirmed) {
    try {
      await axios.delete('/api/post', { data: { post_id: postId } });
      MySwal.fire({
        title: 'Deleted!',
        text: 'Your post has been deleted.',
        icon: 'success',
        customClass: {
          actions: 'flex flex-col gap-[8px] w-full',
          title: 'font-semibold text-[18px]',
          popup: 'rounded-[16px] p-[24px]',
          confirmButton: 'bg-primary-300 text-white w-full text-[16px] p-[12px] rounded-[12px]'
        }
      });
      router.replace('/');
    } catch (error) {
      MySwal.fire({
        title: 'Failed!',
        text: 'Failed to delete post.',
        icon: 'error',
        customClass: {
          actions: 'flex flex-col gap-[8px] w-full',
          title: 'font-semibold text-[18px]',
          popup: 'rounded-[16px] p-[24px]',
          confirmButton: 'bg-primary-300 text-white w-full text-[16px] p-[12px] rounded-[12px]'
        }
      });
    }
  }
};

export default handleDelete;
