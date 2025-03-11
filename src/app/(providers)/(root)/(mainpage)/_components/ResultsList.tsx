'use client';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Search from '@/components/common/Search/Search';
import Link from 'next/link';
import InfiniteScroll from '@/components/common/InfiniteScroll/InfiniteScroll';
import { useEffect, useState } from 'react';
import Loader from '@/components/common/Loading/Loader';

interface Post {
  id: string;
  title: string;
  content: string;
  startDate: string; // 시작 날짜
  endDate: string; // 종료 날짜
  recommendations: number;
  image: string;
  price: number;
  tags: string[];
}

interface ResultsListProps {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

const formatDate = (date: Date | null): string => {
  if (!date) return '';
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
};

export default function ResultsList({ posts, loading, error }: ResultsListProps) {
  const searchParams = useSearchParams();
  const tags = searchParams.get('tags') ? JSON.parse(searchParams.get('tags') as string) : [];
  const city = searchParams.get('city') || '';
  const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate') as string) : null;
  const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate') as string) : null;

  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1); // 페이지 상태

  useEffect(() => {
    // 페이지가 변경될 때마다 10개의 포스터를 추가로 보여줌
    const loadMorePosts = () => {
      const newPosts = posts.slice((page - 1) * 10, page * 10);
      setDisplayedPosts((prev) => [...prev, ...newPosts]);
    };

    loadMorePosts();
  }, [page, posts]);

  const formatTags = () => {
    if (tags.length === 0) return 'Any Tag';
    return tags.length > 1 ? `${tags[0]} + ${tags.length - 1}` : tags[0];
  };

  const selection = [
    formatTags(),
    `${city || 'Any City'} ・ ${startDate && endDate ? `${formatDate(startDate)} ~ ${formatDate(endDate)}` : 'Any Date'}`
  ].join('\n');

  return (
    <div className="p-4 md:px-[88px]">
      <div className="block md:hidden">
        <Search initialQuery={selection} style={{ paddingTop: '8px', lineHeight: '20px', fontWeight: 500 }} />
      </div>

      <div className="hidden md:block">
        <div className="my-[40px] text-[32px] font-semibold">Search Results</div>
        <div className="mb-6 text-[21px] font-medium">{posts.length} Tour found</div>
      </div>

      {loading && (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="mt-[230px] flex flex-col items-center justify-center gap-2 text-center">
          {/* mt-[230px] 전에 썼던 것 min-h-[400px]  */}
          <Image
            src="/icons/tabler-icon-list-search.svg"
            alt="search list image"
            width={44}
            height={44}
            className="md:h-[80px] md:w-[80px]"
          />
          <div className="text-sm font-semibold md:text-2xl">No posts found</div>
          <div className="w-[213px] text-xs font-normal md:w-[320px] md:text-lg">
            Try to search by changing the date and region
          </div>
        </div>
      )}

      <InfiniteScroll
        loading={loading}
        hasMore={displayedPosts.length < posts.length}
        onLoadMore={() => setPage((prev) => prev + 1)}
      >
        <ul className="mt-5 min-[1440px]:flex min-[1440px]:flex-wrap min-[1440px]:gap-5">
          {displayedPosts.map((post, index) => (
            <li
              key={`${post.id}-${index}`}
              className="flex rounded-md p-2 md:mb-5 md:p-0 min-[1440px]:mb-0 min-[1440px]:w-[calc(50%-10px)] min-[1440px]:p-0"
            >
              <Link href={`/detail/${post.id}`} className="flex max-w-[460px]">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={96}
                    height={96}
                    className="mr-2 h-[100px] w-[80px] rounded-lg md:mr-4 md:h-[140px] md:w-[120px]"
                  />
                ) : (
                  <div className="mr-2 flex h-24 w-24 items-center justify-center bg-gray-200">No Image</div>
                )}
                <div className="flex flex-col">
                  <div>
                    <h3 className="line-clamp-1 text-sm font-semibold md:line-clamp-2 md:text-[21px] md:leading-7">
                      {post.title}
                    </h3>
                    <p className="mt-1 tracking-[-0.1em] text-gray-500 md:mt-2 md:text-lg">
                      {post.startDate && post.endDate
                        ? `${new Intl.DateTimeFormat('ko', {
                            year: '2-digit',
                            month: 'numeric',
                            day: 'numeric'
                          }).format(new Date(post.startDate))} ~ ${new Intl.DateTimeFormat('ko', {
                            year: '2-digit',
                            month: 'numeric',
                            day: 'numeric'
                          }).format(new Date(post.endDate))}`
                        : 'No dates available'}
                    </p>
                  </div>
                  <div className="mt-1 flex text-sm md:mt-2 md:text-lg">
                    <div className="font-bold text-[#B95FAB]">{formatPrice(post.price)}</div>
                    <div className="font-medium">/Person</div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </div>
  );
}
