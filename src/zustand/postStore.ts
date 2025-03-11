import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import { Post } from '@/types/posts';

interface PostState {
  postId: string | null;
  post: Post | null;
  postArea: string | null;
  userName: string | null;
  setPostId: (id: string | null) => void;
  setPost: (post: Post | null) => void;
  setPostArea: (area: string | null) => void;
  setUserName: (name: string | null) => void;
  fetchPost: (id: string) => Promise<void>;
}

const usePostStore = create<PostState>((set) => ({
  postId: null,
  post: null,
  postArea: null,
  userName: null,
  setPostId: (id) => set({ postId: id }),
  setPost: (post) => set({ post }),
  setPostArea: (area) => set({ postArea: area }),
  setUserName: (name) => set({ userName: name }),
  fetchPost: async (id: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        *,
        users!posts_user_id_fkey1 (name),
        schedule (area)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
    } else {
      const scheduleData = data.schedule ? data.schedule[0]?.area || 'N/A' : 'N/A';
      set({
        post: data,
        postArea: scheduleData,
        userName: data.users.name
      });
    }
  }
}));

export default usePostStore;
