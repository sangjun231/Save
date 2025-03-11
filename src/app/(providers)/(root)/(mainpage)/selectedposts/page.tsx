'use client';

import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const supabase = createClient();

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  recommendations: number;
  image: string;
  price: number;
}

const PostsList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    const selectedCity = searchParams.get('city');
    const selectedThemes = searchParams.get('theme')?.split(',') || [];
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase.from('posts').select('*').order('created_at', { ascending: false }); // 최신순으로 정렬

    if (selectedCity) {
      query = query.ilike('title', `%${selectedCity}%`);
    }

    if (selectedThemes.length > 0) {
      query = query.in('theme', selectedThemes);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      setError('데이터를 가져오는 중 오류가 발생했습니다.');
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [searchParams]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="p-4">
      <button onClick={() => router.back()} className="mb-4">
        ←
      </button>

      <h2 className="mb-4 text-xl font-bold">Related Posts</h2>
      {loading && <div>로딩 중...</div>}
      {error && <div>{error}</div>}
      {!loading && posts.length === 0 && <div>관련된 게시물이 없습니다.</div>}
      <ul>
        {posts.map((post, index) => (
          <li key={`${post.id}-${index}`} className="mb-4 flex rounded-md border p-2">
            <Link href={`/detail/${post.id}`} className="flex w-full">
              {post.image ? (
                <Image src={post.image} alt={post.title} width={96} height={96} className="mr-2 w-24" />
              ) : (
                <div className="mr-2 flex h-24 w-24 items-center justify-center bg-gray-200">이미지 없음</div>
              )}
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold">{post.title}</h3>
                  <p className="text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                  <p className="text-gray-700">{post.content}</p>
                </div>
                <div className="mt-2 text-sm font-bold">{formatPrice(post.price)}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function SelectedPosts() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <PostsList />
    </Suspense>
  );
}
