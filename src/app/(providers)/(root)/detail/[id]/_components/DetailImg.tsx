'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import usePostStore from '@/zustand/postStore';
import Likes from './Likes';
import { WebProps } from '@/types/webstate';

export default function DetailImg({ isWeb }: WebProps) {
  const { id } = useParams();
  const postId = Array.isArray(id) ? id[0] : id;
  const { setPostId, post, fetchPost } = usePostStore((state) => ({
    setPostId: state.setPostId,
    post: state.post,
    fetchPost: state.fetchPost
  }));

  useEffect(() => {
    if (postId) {
      setPostId(postId);
      fetchPost(postId);
    }
  }, [postId, setPostId, fetchPost]);

  if (!post) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative h-[300px] w-full web:h-[640px]">
        <Image src={post.image} alt={post.title} priority fill className="object-cover" sizes="100vw" />
        <Likes isWeb={isWeb} />
      </div>
    </div>
  );
}
