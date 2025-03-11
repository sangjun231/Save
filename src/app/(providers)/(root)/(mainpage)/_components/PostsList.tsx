'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LikeBtn from '/public/icons/tabler-icon-post-heart.svg';
import { createClient } from '@/utils/supabase/client';
import { useLikeStore } from '@/zustand/likeStore';
import useAuthStore from '@/zustand/bearsStore';

const supabase = createClient();

interface Post {
  id: string;
  title: string;
  content?: string;
  startDate?: string;
  endDate?: string;
  recommendations?: number;
  image?: string;
  price: number;
  tags?: string[];
  created_at: string;
}

const NewPostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: number) => `$${price}`;
  // 사용 안하는 함수 주석, 추후 필요시 사용 할 수도 있어서 삭제 보류
  // const formatDate = (date: string) => {
  //   const d = new Date(date);
  //   return new Intl.DateTimeFormat('ko', {
  //     year: '2-digit',
  //     month: 'numeric',
  //     day: 'numeric'
  //   }).format(d);
  // };

  const user = useAuthStore((state) => state.user);
  const { isLiked, fetchLikeStatus, toggleLike } = useLikeStore((state) => ({
    isLiked: state.isLiked,
    fetchLikeStatus: state.fetchLikeStatus,
    toggleLike: state.toggleLike
  }));

  const handleLike = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (user?.id) {
      toggleLike(postId, user.id);
    }
  };

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8);

        if (postsError) throw postsError;

        setPosts(postsData || []);
      } catch (err) {
        setError('포스트를 가져오는 중 문제가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPosts();
  }, []);

  useEffect(() => {
    if (user?.id && posts.length > 0) {
      posts.forEach((post) => {
        fetchLikeStatus(post.id, user.id);
      });
    }
  }, [posts, user?.id, fetchLikeStatus]);

  return (
    <div className="mt-[40px] md:mt-[160px]">
      <h2 className="text-xl font-bold md:mb-10 md:text-4xl">New Tour</h2>
      <ul className="mt-5 lg:flex lg:flex-wrap lg:gap-5">
        {posts.map((post, index) => (
          <li key={`${post.id}-${index}`} className="mb-4 flex rounded-md lg:mb-0 lg:w-[calc(50%-10px)] lg:p-0">
            <div className="relative flex max-w-[460px]">
              <Link href={`/detail/${post.id}`} className="block">
                <div className="relative h-[100px] w-[80px] web:h-[140px] web:w-[120px]">
                  <Image
                    className="rounded-lg"
                    src={post.image || '/icons/upload.png'}
                    alt={post.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <button
                    onClick={(e) => handleLike(e, post.id)}
                    className="z-1 absolute right-[4px] top-[8px] rounded-[24px] bg-[rgba(255,255,255,0.10)] p-0.5 backdrop-blur-[10px] web:right-[8px] web:top-[8px]"
                  >
                    <LikeBtn
                      className="h-[24px] w-[24px] web:h-[36px] web:w-[36px] web:p-[6px]"
                      color={isLiked(post.id) ? '#FF7029' : 'white'}
                      fill={isLiked(post.id) ? '#FF7029' : 'none'}
                    />
                  </button>
                </div>
              </Link>
              <Link href={`/detail/${post.id}`} className="ml-2 flex flex-col md:ml-4">
                <h3 className="line-clamp-1 text-sm font-semibold web:text-base">{post.title}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {post.startDate && post.endDate
                    ? `${new Date(post.startDate).toLocaleDateString()} ~ ${new Date(post.endDate).toLocaleDateString()}`
                    : 'No dates available'}
                </p>
                <div className="mt-auto flex text-sm">
                  <span className="font-bold text-primary-300">{formatPrice(post.price)}</span>
                  <span className="ml-1 font-medium text-grayscale-700">/Person</span>
                </div>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewPostList;
