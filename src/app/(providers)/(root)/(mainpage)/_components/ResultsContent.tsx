'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import ResultsList from './ResultsList';
import { addDays } from 'date-fns';

const supabase = createClient();

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

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const selectedCity = searchParams.get('city');
  const selectedTags = searchParams.get('tags') ? JSON.parse(searchParams.get('tags') || '[]') : [];
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const fetchPosts = async () => {
    setLoading(true); // Ensure loading state is set at the beginning

    let query = supabase.from('posts').select('*').order('created_at', { ascending: false });

    if (selectedCity) {
      // schedule 테이블에서 선택된 도시와 일치하는 post_id 가져오기
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedule')
        .select('post_id')
        .ilike('area', `%${selectedCity}%`); // Use wildcard for matching

      if (scheduleError) {
        setError('Error fetching schedules');
        console.error('Error fetching schedules:', scheduleError);
        setLoading(false);
        return;
      }

      if (!scheduleData || scheduleData.length === 0) {
        setPosts([]); // No posts if no schedules found
        setLoading(false);
        return;
      }

      const postIds = scheduleData.map((schedule) => schedule.post_id);

      if (postIds.length > 0) {
        query = query.in('id', postIds);
      }
    }

    if (startDate) {
      // 시작 날짜를 하루 늦추기
      const adjustedStartDate = addDays(new Date(startDate), 1).toISOString();
      query = query.gte('startDate', adjustedStartDate);
    }

    if (endDate) {
      // 종료 날짜를 하루 늦추기
      const adjustedEndDate = addDays(new Date(endDate), 1).toISOString();
      query = query.lte('endDate', adjustedEndDate);
    }

    const { data, error: postsError } = await query;

    if (postsError) {
      setError('Error fetching posts');
      console.error('Error fetching posts:', postsError);
    } else {
      const filteredPosts = data.filter((post: Post) => {
        let tagsArray = [];

        if (Array.isArray(post.tags)) {
          tagsArray = post.tags;
        } else if (typeof post.tags === 'string') {
          try {
            tagsArray = JSON.parse(post.tags);
          } catch (e) {
            console.error('Failed to parse tags:', e);
          }
        }

        return Array.isArray(tagsArray) && selectedTags.every((tag: any) => tagsArray.includes(tag));
      });

      setPosts(filteredPosts || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [searchParams]);

  return <ResultsList posts={posts} loading={loading} error={error} />;
}
