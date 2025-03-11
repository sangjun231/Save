'use client';

import React from 'react';
import Image from 'next/image';
import { useLikeStore } from '@/zustand/likeStore';

type LikeProps = {
  postId: string;
  userId: string;
};

const Like: React.FC<LikeProps> = ({ postId, userId }) => {
  const { isLiked, fetchLikeStatus, toggleLike } = useLikeStore((state) => ({
    isLiked: state.isLiked,
    fetchLikeStatus: state.fetchLikeStatus,
    toggleLike: state.toggleLike
  }));

  React.useEffect(() => {
    if (postId && userId) {
      fetchLikeStatus(postId, userId);
    }
  }, [postId, userId, fetchLikeStatus]);

  const handleLike = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (postId && userId) {
      toggleLike(postId, userId);
    }
  };

  return (
    <button
      className="absolute right-[4px] top-[8px] rounded-[24px] backdrop-blur-[10px] web:right-[16px] web:top-[16px]"
      onClick={handleLike}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.10)'
      }}
    >
      <Image
        className="h-[24px] w-[24px] web:h-[44px] web:w-[44px] web:p-[6px]"
        src={isLiked(postId) ? '/icons/tabler-icon-heart-filled.svg' : '/icons/tabler-icon-post-heart.svg'}
        alt="heart icon"
        width={24}
        height={24}
      />
    </button>
  );
};

export default Like;
