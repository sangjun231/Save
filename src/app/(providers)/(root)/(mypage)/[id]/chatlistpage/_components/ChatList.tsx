import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_MYPAGE_CHATS, API_POST_DETAILS, API_MYPAGE_PROFILE } from '@/utils/apiConstants';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchMessages, subscribeToChatList } from '@/services/chatService';
import { createClient } from '@/utils/supabase/client';

type ChatListProps = {
  userId: string;
};

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  post_id: string;
  is_checked: boolean;
};

type Chat = {
  post_id: string;
  sender_id: string;
  receiver_id: string;
  messages: Message[];
};

type Post = {
  id: string;
  title: string;
  image: string;
};

type User = {
  id: string;
  name: string;
  avatar: string;
};

const fetchPostDetails = async (postId: string): Promise<Post> => {
  const response = await axios.get(API_POST_DETAILS(postId));
  return response.data;
};

const fetchUserDetails = async (userId: string): Promise<User> => {
  const response = await axios.get(API_MYPAGE_PROFILE(userId));
  return response.data;
};

// 채팅방 컴포넌트를 분리하여 독립적인 렌더링이 가능하도록 함
const ChatRoom = React.memo(
  ({
    chat,
    userId,
    postDetails,
    senderDetails,
    isNewMessage: initialIsNewMessage,
    onChatClick,
    formatDate,
    chatId
  }: {
    chat: Chat;
    userId: string;
    postDetails?: Post;
    senderDetails?: User;
    isNewMessage: boolean;
    onChatClick: (chat: Chat) => void;
    formatDate: (date: string) => string;
    chatId: string;
  }) => {
    const supabase = createClient();
    const queryClient = useQueryClient();
    const [isNewMessage, setIsNewMessage] = useState(initialIsNewMessage);

    // chat.messages가 변경될 때마다 최신 상태 유지
    const messages = useMemo(() => chat.messages, [chat.messages]);
    const firstMessage = messages[0];

    // 각 채팅방별로 실시간 구독
    useEffect(() => {
      const handleNewMessage = (payload: any) => {
        if (payload.new) {
          const newMessage = payload.new;
          const messageId = `${newMessage.post_id}-${[newMessage.sender_id, newMessage.receiver_id].sort().join('-')}`;

          // 현재 채팅방의 메시지인 경우에만 업데이트
          if (messageId === chatId) {
            // 새 메시지가 도착하면 queryClient를 통해 채팅 목록 업데이트
            queryClient.setQueryData(['chatList', userId], (oldData: Message[] | undefined) => {
              if (!oldData) return [newMessage];
              return [newMessage, ...oldData.filter((msg) => msg.id !== newMessage.id)];
            });

            if (newMessage.sender_id !== userId) {
              setIsNewMessage(true);
            }
          }
        }
      };

      // 채팅방별 구독 설정
      const channel = supabase
        .channel(`chat:${chatId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `post_id=eq.${chat.post_id}`
          },
          handleNewMessage
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }, [chatId, userId, chat.post_id, queryClient]);

    if (!postDetails || !senderDetails) return null;

    return (
      <div
        className="mb-[32px]"
        onClick={() => {
          onChatClick(chat);
          setIsNewMessage(false);
        }}
      >
        <div className="flex">
          <Image
            className="rounded-[8px]"
            src={postDetails.image || '/icons/upload.png'}
            alt={postDetails.title || 'Default name'}
            width={64}
            height={64}
            style={{ width: '64px', height: '64px' }}
          />
          <div className="ml-[8px] flex w-full flex-col gap-[5px]">
            <div className="flex items-center justify-between">
              <p className="line-clamp-1 text-[13px] font-medium text-primary-900">{postDetails.title}</p>
              <p className="ml-[8px] flex-shrink-0 text-[10px] text-grayscale-500">
                {formatDate(firstMessage?.created_at)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-grayscale-900">{firstMessage?.content}</p>
              {isNewMessage && <span className="h-[8px] w-[8px] rounded-full bg-action-color"></span>}
            </div>
            <div className="flex">
              <Image
                className="items-center rounded-full"
                src={senderDetails.avatar || '/icons/upload.png'}
                alt={senderDetails.name || 'Default name'}
                width={16}
                height={16}
                style={{ width: '16px', height: '16px' }}
              />
              <p className="ml-[4px] text-[10px] text-grayscale-500">{senderDetails.name}</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 메모이제이션 최적화 - messages 비교 추가
    return (
      prevProps.chat.messages[0]?.id === nextProps.chat.messages[0]?.id &&
      prevProps.isNewMessage === nextProps.isNewMessage &&
      prevProps.postDetails?.id === nextProps.postDetails?.id &&
      prevProps.senderDetails?.id === nextProps.senderDetails?.id &&
      JSON.stringify(prevProps.chat.messages) === JSON.stringify(nextProps.chat.messages)
    );
  }
);

const ChatList = ({ userId }: ChatListProps) => {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [newMessages, setNewMessages] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 채팅 데이터 쿼리
  const { data: chatData = [], error: chatError } = useQuery<Message[]>({
    queryKey: ['chatList', userId],
    queryFn: async () => {
      const response = await axios.get(API_MYPAGE_CHATS(userId));
      setIsInitialLoading(false);
      return response.data;
    },
    refetchInterval: false,
    staleTime: 0 // 항상 최신 데이터를 사용하도록 설정
  });

  // chatData를 기반으로 groupedChats 계산
  const groupedChats = useMemo(() => {
    return chatData.reduce((acc: { [key: string]: Chat }, message) => {
      const chatId = `${message.post_id}-${[message.sender_id, message.receiver_id].sort().join('-')}`;
      if (!acc[chatId]) {
        acc[chatId] = {
          post_id: message.post_id,
          sender_id: message.sender_id,
          receiver_id: message.receiver_id,
          messages: []
        };
      }
      acc[chatId].messages.push(message);
      return acc;
    }, {});
  }, [chatData]);

  // postIds와 userIds를 groupedChats에서 계산
  const { postIds, userIds } = useMemo(() => {
    const posts = new Set<string>();
    const users = new Set<string>();

    Object.values(groupedChats).forEach((chat) => {
      posts.add(chat.post_id);
      users.add(chat.sender_id);
      users.add(chat.receiver_id);
    });

    return {
      postIds: Array.from(posts),
      userIds: Array.from(users)
    };
  }, [groupedChats]);

  // 게시물 데이터 쿼리
  const { data: postData = [], error: postError } = useQuery<Post[]>({
    queryKey: ['postDetails', postIds],
    queryFn: async () => {
      if (postIds.length === 0) return [];
      return Promise.all(postIds.map((postId) => fetchPostDetails(postId)));
    },
    enabled: postIds.length > 0,
    staleTime: 0
  });

  // 사용자 데이터 쿼리
  const { data: userData = [], error: userError } = useQuery<User[]>({
    queryKey: ['userDetails', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];
      return Promise.all(userIds.map((id) => fetchUserDetails(id)));
    },
    enabled: userIds.length > 0,
    staleTime: 0
  });

  const handleChatClick = async (chat: Chat) => {
    const receiverId = userId === chat.sender_id ? chat.receiver_id : chat.sender_id;
    const postDetails = postData?.find((post) => post.id === chat.post_id);
    const chatId = `${chat.post_id}-${[chat.sender_id, chat.receiver_id].sort().join('-')}`;

    setNewMessages((prev) => ({
      ...prev,
      [chatId]: true
    }));

    const messages = await fetchMessages(userId, receiverId, chat.post_id);
    const uncheckedMessages = messages.filter((message) => message.receiver_id === userId && !message.is_checked);

    if (uncheckedMessages.length > 0) {
      const uncheckedMessageIds = uncheckedMessages.map((message) => message.id);
      await supabase.from('messages').update({ is_checked: true }).in('id', uncheckedMessageIds);
    }
    queryClient.invalidateQueries({ queryKey: ['chatList', userId] });

    router.push(
      `/${userId}/${receiverId}/chatpage?postId=${chat.post_id}&postTitle=${postDetails?.title}&postImage=${postDetails?.image}`
    );
  };

  const formatDate = (created_at: string) => {
    const messageDate = new Date(created_at);
    const today = new Date();

    const isToday =
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear();

    if (isToday) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } else {
      return `${messageDate.getMonth() + 1}.${messageDate.getDate()}`;
    }
  };

  // 실시간 업데이트 로직
  useEffect(() => {
    const handleNewMessage = async (payload: any) => {
      try {
        if (payload.new) {
          const newMessage = payload.new;
          const chatId = `${newMessage.post_id}-${[newMessage.sender_id, newMessage.receiver_id].sort().join('-')}`;
          const otherUserId = newMessage.sender_id === userId ? newMessage.receiver_id : newMessage.sender_id;

          // 새 메시지 관련 데이터 가져오기
          const [messageUser, messagePost] = await Promise.all([
            fetchUserDetails(otherUserId),
            fetchPostDetails(newMessage.post_id)
          ]);

          // 채팅 목록 즉시 업데이트
          queryClient.setQueryData(['chatList', userId], (oldData: Message[] | undefined) => {
            if (!oldData) return [newMessage];
            return [newMessage, ...oldData.filter((msg) => msg.id !== newMessage.id)];
          });

          // 사용자와 게시물 데이터 즉시 업데이트
          queryClient.setQueryData(['userDetails', userIds], (oldData: User[] | undefined) => {
            if (!oldData) return [messageUser];
            return oldData.some((user) => user.id === messageUser.id)
              ? oldData.map((user) => (user.id === messageUser.id ? messageUser : user))
              : [...oldData, messageUser];
          });

          queryClient.setQueryData(['postDetails', postIds], (oldData: Post[] | undefined) => {
            if (!oldData) return [messagePost];
            return oldData.some((post) => post.id === messagePost.id)
              ? oldData.map((post) => (post.id === messagePost.id ? messagePost : post))
              : [...oldData, messagePost];
          });

          // 새 메시지 알림 상태 업데이트
          if (newMessage.sender_id !== userId) {
            setNewMessages((prev) => ({
              ...prev,
              [chatId]: false
            }));
          }
        }
      } catch (error) {
        console.error('새 메시지 처리 중 오류 발생:', error);
      }
    };

    const unsubscribe = subscribeToChatList(userId, {
      onMessage: handleNewMessage,
      onError: (error) => console.error('실시간 구독 오류:', error),
      onConnectionChange: (connected) => {
        console.log(connected ? '채팅 연결됨' : '채팅 연결 끊김');
        if (connected) {
          queryClient.invalidateQueries({ queryKey: ['chatList', userId] });
        }
      }
    });

    return () => unsubscribe();
  }, [userId, queryClient]);

  if (isInitialLoading) {
    return <div className="flex min-h-[calc(100vh-400px)] items-center justify-center">Loading...</div>;
  }

  if (chatError || postError || userError) {
    return <div className="flex min-h-[calc(100vh-400px)] items-center justify-center">Error loading data</div>;
  }

  if (!chatData || chatData.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-400px)] items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-[8px]">
          <Image src="/icons/Group-348.svg" alt="no chat" width={44} height={44} />
          <p className="text-[14px] font-semibold text-grayscale-900">메시지가 없습니다</p>
          <p className="text-[12px] text-grayscale-600">새로운 메시지가 오면</p>
          <p className="text-[12px] text-grayscale-600">여기에 표시됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {Object.entries(groupedChats).map(([chatId, chat]) => {
        const postDetails = postData?.find((post) => post.id === chat.post_id);
        const receiverId = userId === chat.sender_id ? chat.receiver_id : chat.sender_id;
        const senderDetails = userData?.find((user) => user.id === receiverId);
        const isNewMessage =
          !newMessages[chatId] && chat.messages[0]?.sender_id !== userId && !chat.messages[0]?.is_checked;

        return (
          <ChatRoom
            key={chatId}
            chatId={chatId}
            chat={chat}
            userId={userId}
            postDetails={postDetails}
            senderDetails={senderDetails}
            isNewMessage={isNewMessage}
            onChatClick={handleChatClick}
            formatDate={formatDate}
          />
        );
      })}
    </div>
  );
};

export default ChatList;
