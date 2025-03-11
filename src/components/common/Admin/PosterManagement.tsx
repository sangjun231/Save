'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

// 게시글 데이터 타입 정의
interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  price: number;
  image: string;
  tags: Array<string>;

  created_at: string;
  updated_at: string;
  maxPeople: number;
  selectedPrices: Array<string>;
  startDate: string;
  endDate: string;
  user_name: string;
  [key: string]: any; // 추가적인 필드가 있을 경우를 대비한 인덱스 시그니처
}

const PosterManagement = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string>('');
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [editedPost, setEditedPost] = useState<Partial<Post>>({});
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    Modal.setAppElement('body'); // 'body'를 AppElement로 설정

    const fetchAllPosts = async () => {
      try {
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('사용자가 없습니다.');

        const { data: userData, error: userFetchError } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (userFetchError) throw userFetchError;
        if (!userData?.is_admin) throw new Error('접근이 거부되었습니다: 관리자가 아닙니다.');

        const { data: allPostsData, error: allPostsError } = await supabase.from('posts').select(`
          id,
          user_id,
          title,
          content,
          price,
          image,
          tags,
          
          created_at,
          updated_at,
          maxPeople,
          selectedPrices,
          startDate,
          endDate,
          users:user_id (name)
        `);

        if (allPostsError) throw allPostsError;

        const formattedPosts = allPostsData.map((post: any) => ({
          id: post.id,
          user_id: post.user_id,
          title: post.title,
          content: post.content,
          price: post.price,
          image: post.image,
          tags: post.tags || [],

          created_at: post.created_at,
          updated_at: post.updated_at,
          maxPeople: post.maxPeople,
          selectedPrices: post.selectedPrices || [],
          startDate: post.startDate,
          endDate: post.endDate,
          user_name: post.users.name
        }));

        setPosts(formattedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError((error as Error).message);
      }
    };

    fetchAllPosts();
  }, [supabase]);

  // 날짜를 원하는 형식으로 변환하는 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16).replace('T', ' ');
  };

  // 게시글 수정 핸들러
  const handleEdit = (post: Post) => {
    setEditPost(post);
    setEditedPost({
      title: post.title,
      content: post.content,
      price: post.price
    });
  };

  // 수정된 게시글 저장 핸들러
  const handleSave = async () => {
    if (editPost) {
      try {
        const { error } = await supabase.from('posts').update(editedPost).eq('id', editPost.id);
        if (error) throw error;

        setPosts(posts.map((post) => (post.id === editPost.id ? { ...post, ...editedPost } : post)));
        toast.success('Post updated successfully');
        setEditPost(null);
        setEditedPost({});
      } catch (error) {
        toast.error(`Failed to update post: ${(error as Error).message}`);
      }
    }
  };

  // 게시글 삭제 핸들러
  const handleDelete = async () => {
    if (deletePostId) {
      try {
        // 관련 결제 데이터의 외래 키를 NULL로 설정
        const { error: paymentError } = await supabase
          .from('payments')
          .update({ post_id: null })
          .eq('post_id', deletePostId);

        if (paymentError) throw paymentError;

        // 게시글 삭제
        const { error: postError } = await supabase.from('posts').delete().eq('id', deletePostId);

        if (postError) throw postError;

        // 상태 업데이트
        setPosts(posts.filter((post) => post.id !== deletePostId));
        toast.success('Post deleted successfully');
        setDeletePostId(null);
      } catch (error) {
        toast.error(`Failed to delete post: ${(error as Error).message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-6">
      <h1 className="mb-4 text-2xl font-bold">포스터 관리</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4">
        <input type="text" placeholder="검색" className="rounded border border-gray-400 p-2" />
      </div>
      <table className="min-w-full border border-gray-300 bg-white">
        <thead>
          <tr>
            <th className="border-b px-4 py-2 text-left">NICKNAME</th>
            <th className="border-b px-4 py-2 text-left">TITLE</th>
            <th className="border-b px-4 py-2 text-left">CREATED_AT</th>
            <th className="border-b px-4 py-2 text-left">UPDATED_AT</th>
            <th className="border-b px-4 py-2 text-left">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, index) => (
            <tr key={`${post.id}-${index}`}>
              <td className="border-b px-4 py-2">{post.user_name}</td>
              <td className="border-b px-4 py-2">{post.title}</td>
              <td className="border-b px-4 py-2">{formatDate(post.created_at)}</td>
              <td className="border-b px-4 py-2">{formatDate(post.updated_at)}</td>
              <td className="border-b px-4 py-2">
                <button onClick={() => handleEdit(post)} className="mr-2 rounded bg-blue-500 px-2 py-1 text-white">
                  수정
                </button>
                <button onClick={() => setDeletePostId(post.id)} className="rounded bg-red-500 px-2 py-1 text-white">
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        isOpen={editPost !== null}
        onRequestClose={() => setEditPost(null)}
        contentLabel="Edit Post"
        style={{
          content: {
            width: '400px',
            height: '400px',
            margin: 'auto',
            padding: '20px'
          }
        }}
      >
        <h2 className="mb-4 text-xl font-bold">Edit Post</h2>
        <div>제목</div>
        <input
          type="text"
          value={editedPost.title || ''}
          onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
          placeholder="Title"
          className="mb-4 w-full rounded border border-gray-400 p-2"
        />
        <div>내용</div>
        <textarea
          value={editedPost.content || ''}
          onChange={(e) => setEditedPost({ ...editedPost, content: e.target.value })}
          placeholder="Content"
          className="mb-4 w-full rounded border border-gray-400 p-2"
        />
        <div>가격</div>
        <input
          type="number"
          value={editedPost.price || ''}
          onChange={(e) => setEditedPost({ ...editedPost, price: parseFloat(e.target.value) })}
          placeholder="Price"
          className="mb-4 w-full rounded border border-gray-400 p-2"
        />
        <button onClick={handleSave} className="mr-2 rounded bg-blue-500 px-4 py-2 text-white">
          저장
        </button>
        <button onClick={() => setEditPost(null)} className="rounded bg-gray-500 px-4 py-2 text-white">
          취소
        </button>
      </Modal>
      <Modal
        isOpen={deletePostId !== null}
        onRequestClose={() => setDeletePostId(null)}
        contentLabel="Delete Post"
        style={{
          content: {
            width: '300px',
            height: '200px',
            margin: 'auto',
            padding: '20px'
          }
        }}
      >
        <h2 className="mb-4 text-xl font-bold">Delete Post</h2>
        <p>Are you sure you want to delete this post?</p>
        <button onClick={handleDelete} className="mr-2 rounded bg-red-500 px-4 py-2 text-white">
          삭제
        </button>
        <button onClick={() => setDeletePostId(null)} className="rounded bg-gray-500 px-4 py-2 text-white">
          취소
        </button>
      </Modal>
    </div>
  );
};

export default PosterManagement;
