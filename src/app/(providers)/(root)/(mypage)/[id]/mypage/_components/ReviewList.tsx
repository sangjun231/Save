import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { formatRelativeDate, formatDateRange } from '@/utils/detail/functions';
import { API_MYPAGE_REVIEWS, API_MYPAGE_PROFILE, API_POST } from '@/utils/apiConstants';
import { Tables } from '@/types/supabase';
import axios from 'axios';

const fetchReviews = async (userId: string) => {
  const response = await axios.get(API_MYPAGE_REVIEWS(userId));
  return response.data;
};

const fetchProfile = async (userId: string) => {
  const response = await axios.get(API_MYPAGE_PROFILE(userId));
  return response.data;
};

const fetchPostsData = async () => {
  const response = await axios.get(API_POST());
  return response.data;
};

const ReviewList = ({ userId }: { userId: string }) => {
  const MySwal = withReactContent(Swal);
  const [profile, setProfile] = useState<Tables<'users'>>();
  const [reviews, setReviews] = useState<Tables<'reviews'>[]>([]);
  const router = useRouter();

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
    refetch
  } = useQuery<Tables<'reviews'>[]>({
    queryKey: ['reviewList', userId],
    queryFn: () => fetchReviews(userId),
    enabled: !!userId
  });

  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError
  } = useQuery<Tables<'posts'>[]>({
    queryKey: ['isPost', userId],
    queryFn: fetchPostsData,
    enabled: !!userId
  });


  const handleEditReview = (id: string, postId: string) => {
    router.push(`/${userId}/reviewpage?id=${id}&post_id=${postId}`);
  };

  const handleDelete = async (id: string) => {
    const result = await MySwal.fire({
      title: 'Do you want to delete your review?',
      text: 'If you delete, you can always rewrite it later',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'delete review',
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
        await axios.delete(API_MYPAGE_REVIEWS(userId), { data: { id } });
        MySwal.fire('Deleted!', 'Your review has been deleted.', 'success');
        refetch();
      } catch (error) {
        MySwal.fire('Failed!', 'Failed to delete review.', 'error');
      }
    }
  };
  
  useEffect(() => {
    if (reviewsData) {
      setReviews(reviewsData);
    }
  }, [reviewsData]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileData = await fetchProfile(userId);
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  if (reviewsLoading || postsLoading) {
    return <div className="flex min-h-[calc(100vh-400px)] items-center justify-center">Loading...</div>;
  }

  if (reviewsError || postsError) {
    return (
      <div className="flex min-h-[calc(100vh-400px)] items-center justify-center">
        Error: {reviewsError?.message || postsError?.message}
      </div>
    );
  }

  if (!reviewsData || reviewsData.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-400px)] items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-[8px]">
          <Image src="/icons/tabler-icon-pencil.svg" alt="no review" width={44} height={44} />
          <p className="text-[14px] font-semibold text-grayscale-900">You don&apos;t have any Review</p>
          <p className="text-[12px] text-grayscale-600">When you write a new review, it will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {posts?.map((post, index) => {
        const review = reviews.find((r) => r.post_id === post.id);

        return (
          review && (
            <div key={`${post.id}-${index}`} className="mb-[20px] web:mb-[40px]">
              <div className="flex">
                <Image
                  className="h-[44px] w-[44px] rounded-[8px] web:h-[120px] web:w-[120px] web:rounded-[12px]"
                  src={post.image ?? '/icons/upload.png'}
                  alt={post.title ?? 'Default title'}
                  width={44}
                  height={44}
                />
                <div className="ml-[8px] flex w-full flex-col gap-[4px] web:ml-[16px] web:gap-[8px]">
                  <p className="line-clamp-1 text-[14px] font-semibold text-primary-900 web:text-[21px]">
                    {post.title}
                  </p>
                  <p className="text-[14px] text-grayscale-500 web:text-[18px]">
                    {formatDateRange(post.startDate, post.endDate)}
                  </p>
                </div>
              </div>
              <div className="my-[16px] w-full items-start rounded-[16px] border bg-grayscale-50 p-[16px] web:my-[32px] web:p-[24px]">
                <div className="flex items-center gap-[8px] web:gap-[16px]">
                  <Image
                    src="/icons/tabler-icon-star-filled.svg"
                    alt="Star"
                    width={16}
                    height={16}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <p className="text-[14px] font-semibold text-grayscale-900 web:text-[21px]">{review.rating ?? 0}</p>
                  <p className="text-[13px] font-medium web:text-[21px]">{profile?.name}</p>
                  <p className="text-[13px] text-grayscale-700 web:text-[14px]">
                    {formatRelativeDate(review.created_at)}
                  </p>
                </div>
                <p className="mt-[12px] break-words text-[14px] text-grayscale-700 web:mt-[16px] web:text-[18px]">
                  {review.content}
                </p>
              </div>
              <div className="flex justify-end gap-[16px] web:gap-[40px]">
                <button
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F7F7F9] web:h-[44px] web:w-[44px]"
                  onClick={() => handleEditReview(review.id, post.id)}
                >
                  <Image
                    className="web:h-[33px] web:w-[33px]"
                    src="/icons/tabler-icon-pencil.svg"
                    alt="Edit Review"
                    width={24}
                    height={24}
                  />
                </button>
                <button
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F7F7F9] web:h-[44px] web:w-[44px]"
                  onClick={() => handleDelete(review.id)}
                >
                  <Image
                    className="web:h-[33px] web:w-[33px]"
                    src="/icons/tabler-icon-trash.svg"
                    alt="Delete Review"
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </div>
          )
        );
      })}
    </div>
  );
};

export default ReviewList;
