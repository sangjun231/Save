'use client';

import React, { useEffect, useState } from 'react';
import { WebProps } from '@/types/webstate';
import IconLocation from '/public/icons/detail_icons/icon_location.svg';
import IconPeoples from '/public/icons/detail_icons/icon_peoples.svg';
import { formatDateRange } from '@/utils/detail/functions';
import { useParams } from 'next/navigation';
import usePostStore from '@/zustand/postStore';

// Skeleton 컴포넌트 정의
const Skeleton = ({ height }: { height: string }) => <div className={`animate-pulse bg-gray-200 ${height}`}></div>;

export default function DetailRead({ isWeb }: WebProps) {
  const { id } = useParams();
  const postId = Array.isArray(id) ? id[0] : id;
  const { setPostId, post, fetchPost, postArea } = usePostStore((state) => ({
    setPostId: state.setPostId,
    post: state.post,
    fetchPost: state.fetchPost,
    postArea: state.postArea
  }));

  const [pending, setPending] = useState(true);

  useEffect(() => {
    if (postId) {
      setPostId(postId);
      fetchPost(postId).finally(() => setPending(false));
    }
  }, [postId, setPostId, fetchPost]);

  if (pending) {
    return (
      <div className="flex w-full flex-col">
        <Skeleton height="h-10" />
        <Skeleton height="h-6" />
        <Skeleton height="h-6" />
        <Skeleton height="h-[300px]" />
      </div>
    );
  }

  if (!post) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  const tags: string[] = Array.isArray(post.tags) ? post.tags.map((tag) => String(tag)) : [];

  return (
    <div className="flex w-full flex-col">
      <div className="web:mt-10 web:gap-20 mt-6 flex flex-col gap-8">
        <div className="web:gap-10 flex flex-col gap-4">
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <li key={index} className="select-button web:text-xl text-sm">
                {tag}
              </li>
            ))}
          </ul>
          <h1 className="web:text-4xl text-xl font-semibold text-grayscale-900">{post.title}</h1>
          <p className="web:text-3xl text-xl text-grayscale-500">{formatDateRange(post.startDate, post.endDate)}</p>
          <div className="web:text-3xl flex text-lg">
            <span className="font-semibold text-primary-300">${post.price}</span>
            <span className="font-medium text-grayscale-600">/Person</span>
          </div>
        </div>
        <div className="web:text-2xl flex text-sm font-semibold text-grayscale-900">
          <IconLocation alt="Location" width={isWeb ? 37 : 24} height={isWeb ? 37 : 24} />
          <h4 className="web:ml-2 web:mr-11 ml-1 mr-8">{postArea}</h4>
          <IconPeoples alt="Max Peoples" width={isWeb ? 37 : 24} height={isWeb ? 37 : 24} />
          <h4 className="web:ml-2 web:mr-11 ml-1">Max {post.maxPeople}</h4>
        </div>
      </div>
      <hr className="web:my-20 mb-6 mt-8 h-[1px] w-full bg-grayscale-100" />
      <div className="web:text-xl text-sm text-grayscale-700">
        <p>{post.content}</p>
      </div>
      <hr className="web:my-20 mb-6 mt-8 h-[1px] w-full bg-grayscale-100" />
    </div>
  );
}
