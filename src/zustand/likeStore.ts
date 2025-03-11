import { create } from 'zustand';
import axios from 'axios';

interface LikeState {
  likedPosts: { [key: string]: boolean };
  fetchLikeStatus: (postId: string, userId: string) => Promise<void>;
  toggleLike: (postId: string, userId: string) => Promise<void>;
  isLiked: (postId: string) => boolean;
}

export const useLikeStore = create<LikeState>((set, get) => ({
  likedPosts: {},

  isLiked: (postId: string) => {
    return get().likedPosts[postId] || false;
  },

  fetchLikeStatus: async (postId: string, userId: string) => {
    try {
      const response = await axios.get(`/api/detail/likes/${postId}`, {
        headers: { 'user-id': userId }
      });
      set((state) => ({
        likedPosts: {
          ...state.likedPosts,
          [postId]: response.data.exists
        }
      }));
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  },

  toggleLike: async (postId: string, userId: string) => {
    try {
      const currentLikeStatus = get().likedPosts[postId];

      // Optimistic update
      set((state) => ({
        likedPosts: {
          ...state.likedPosts,
          [postId]: !currentLikeStatus
        }
      }));

      if (currentLikeStatus) {
        await axios.delete(`/api/detail/likes/${postId}`, {
          data: { userId }
        });
      } else {
        await axios.post(`/api/detail/likes/${postId}`, { userId });
      }
    } catch (error) {
      // Revert on error
      set((state) => ({
        likedPosts: {
          ...state.likedPosts,
          [postId]: !state.likedPosts[postId]
        }
      }));
      console.error('Error toggling like:', error);
    }
  }
}));
