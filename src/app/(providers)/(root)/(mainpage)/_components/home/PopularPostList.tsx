'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import InfiniteScroll from '@/components/common/InfiniteScroll/InfiniteScroll';

const supabase = createClient();
const POSTS_PER_PAGE = 8;
const MAX_POSTS = 10; // 최대 포스트 개수

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
  created_at?: string; // Assuming the post table has a `created_at` field
}

const formatPrice = (price: number) => `$${price}`;
const formatDate = (date: string) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('ko', {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric'
  }).format(d);
};

const PopularPostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);
  const startX = useRef<number>(0);
  const scrollLeft = useRef<number>(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        // 좋아요 수를 기준으로 포스트 ID를 정렬
        const { data: likesData, error: likesError } = await supabase.from('likes').select('post_id');

        if (likesError) throw likesError;

        const postIdCounts: { [key: string]: number } = {};
        likesData.forEach((like: { post_id: string }) => {
          postIdCounts[like.post_id] = (postIdCounts[like.post_id] || 0) + 1;
        });

        const sortedPostIds = Object.keys(postIdCounts)
          .sort((a, b) => postIdCounts[b] - postIdCounts[a])
          .slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

        // 포스트 ID에 해당하는 포스트 정보를 가져옴
        const { data: postsData, error: postsError } = await supabase.from('posts').select('*').in('id', sortedPostIds);

        if (postsError) throw postsError;

        // 포스트 데이터를 정렬
        const sortedPosts = postsData.sort(
          (a: Post, b: Post) => sortedPostIds.indexOf(a.id) - sortedPostIds.indexOf(b.id)
        );

        // 상태 업데이트
        setPosts((prevPosts) => [...prevPosts, ...sortedPosts]);

        // 더 가져올 데이터가 있는지 확인
        setHasMore(sortedPostIds.length === POSTS_PER_PAGE && sortedPosts.length > 0);
      } catch (err) {
        setError('포스트를 가져오는 중 문제가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]);

  const loadMorePosts = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;

    const handleDragStart = (e: MouseEvent | TouchEvent) => {
      if (container) {
        isDragging.current = true;
        if (e instanceof TouchEvent) {
          startX.current = e.touches[0].clientX - container.getBoundingClientRect().left;
        } else {
          startX.current = e.clientX - container.getBoundingClientRect().left;
        }
        scrollLeft.current = container.scrollLeft;
      }
    };

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging.current && container) {
        e.preventDefault();
        let x;
        if (e instanceof TouchEvent) {
          x = e.touches[0].clientX - container.getBoundingClientRect().left;
        } else {
          x = e.clientX - container.getBoundingClientRect().left;
        }
        const walk = (x - startX.current) * 2; // Scroll speed factor
        container.scrollLeft = scrollLeft.current - walk;
      }
    };

    const handleDragEnd = () => {
      isDragging.current = false;
    };

    if (container) {
      container.addEventListener('mousedown', handleDragStart);
      container.addEventListener('touchstart', handleDragStart, { passive: false });

      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('touchmove', handleDragMove, { passive: false });

      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);

      return () => {
        container.removeEventListener('mousedown', handleDragStart);
        container.removeEventListener('touchstart', handleDragStart);

        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('touchmove', handleDragMove);

        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, []);

  return (
    <div className="relative mt-[40px] md:mt-0">
      <h2 className="mb-5 text-xl font-bold md:mb-[40px] md:text-4xl">Popular Monthly Tour</h2>
      <div className="overflow-hidden">
        {/* 모바일에서 InfiniteScroll을 사용하여 무한 스크롤 구현 */}
        <div className="block md:hidden">
          <InfiniteScroll loading={loading} hasMore={hasMore} onLoadMore={loadMorePosts}>
            <div
              className="scroll-container no-scrollbar relative overflow-x-auto"
              ref={scrollContainerRef}
              style={{ whiteSpace: 'nowrap' }} // Ensure horizontal scrolling
            >
              <div className="flex space-x-1">
                {posts.map((post, index) => (
                  <div key={`${post.id}-${index}`} className="inline-block w-64 flex-none rounded-md">
                    <Link href={`/detail/${post.id}`} className="flex max-w-[236px] flex-col">
                      {post.image ? (
                        <div
                          className="relative mb-2 flex-none overflow-hidden rounded-2xl"
                          style={{ width: '236px', height: '236px' }}
                        >
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="rounded-2xl"
                            sizes="236px"
                          />
                        </div>
                      ) : (
                        <div className="mb-2 flex h-[236px] w-[236px] items-center justify-center rounded-2xl bg-gray-200">
                          이미지 없음
                        </div>
                      )}
                      <div className="flex flex-grow flex-col">
                        <h3 className="mb-1 line-clamp-1 text-base font-semibold">{post.title}</h3>
                        <p className="tracking-[-0.1em] text-gray-500">
                          {post.startDate && post.endDate
                            ? `${formatDate(post.startDate)} ~ ${formatDate(post.endDate)}`
                            : 'No dates available'}
                        </p>
                        <div className="mt-1 flex text-sm">
                          <div className="mt-auto line-clamp-1 font-bold text-[#B95FAB]">{formatPrice(post.price)}</div>
                          <div className="font-medium">/Person</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </InfiniteScroll>
        </div>
        {/* 데스크탑에서 포스터 8개만 표시 */}
        <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid lg:grid-cols-3 min-[1440px]:grid min-[1440px]:grid-cols-4">
          {posts.slice(0, 8).map((post) => (
            <div key={post.id} className="max-w-[286px]">
              <Link href={`/detail/${post.id}`} className="flex flex-col">
                {post.image ? (
                  <div className="relative mb-2 aspect-square max-w-[286px] overflow-hidden rounded-2xl">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-2xl"
                      sizes="286px"
                    />
                  </div>
                ) : (
                  <div className="mb-2 flex h-[236px] w-full items-center justify-center rounded-2xl bg-gray-200">
                    이미지 없음
                  </div>
                )}
                <div className="flex flex-col">
                  <h3 className="mb-1 line-clamp-2 text-base font-semibold">{post.title}</h3>
                  <p className="mb-1 text-[14px] tracking-[-0.05em] text-gray-500">
                    {post.startDate && post.endDate
                      ? `${formatDate(post.startDate)} ~ ${formatDate(post.endDate)}`
                      : 'No dates available'}
                  </p>
                  <div className="flex items-center text-sm">
                    <div className="font-bold text-[#B95FAB]">{formatPrice(post.price)}</div>
                    <div className="ml-1 font-medium">/Person</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularPostList;
