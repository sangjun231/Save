'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

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
}

const BestPostsList = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.from('posts').select('*').order('price', { ascending: false }).limit(4);
      setPosts(data || []);
    };

    fetchPosts();
  }, []);

  const formatPrice = (price: number) => `$${price}`;
  const formatDate = (date: string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('ko', {
      year: '2-digit',
      month: 'numeric',
      day: 'numeric'
    }).format(d);
  };

  return (
    <div className="mt-[40px] md:mt-[160px]">
      <h2 className="text-xl font-bold md:text-4xl">Best Tour</h2>
      <div className="mt-5 grid grid-cols-2 gap-4 md:mt-[40px] md:grid-cols-2 lg:grid-cols-3 min-[1440px]:grid-cols-4">
        {posts.map((post, index) => (
          <div key={`${post.id}-${index}`} className="max-w-[150px] flex-none rounded-md md:max-w-[286px]">
            <Link href={`/detail/${post.id}`} className="flex flex-col">
              {post.image ? (
                <div className="relative mb-2 aspect-square max-w-[150px] overflow-hidden rounded-2xl md:max-w-[286px]">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-2xl"
                  />
                </div>
              ) : (
                <div className="mb-2 flex h-[236px] w-full items-center justify-center bg-gray-200">이미지 없음</div>
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
  );
};

export default BestPostsList;
