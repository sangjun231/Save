import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient();

// 채팅방 구독을 관리하는 Map
let chatSubscriptions = new Map<string, RealtimeChannel>();

export const fetchMessages = async (senderId: string, receiverId: string, postId: string) => {
  // postId가 비어있으면 빈 배열 반환
  if (!postId) {
    return [];
  }

  const { data, error } = await supabase
    .from('messages')
    .select(
      `
      *,
      sender:users!messages_sender_id_fkey ( id, name, avatar ),
      receiver:users!messages_receiver_id_fkey ( id, name, avatar )
    `
    )
    .eq('post_id', postId)
    .or(
      `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
    )
    .order('created_at', { ascending: true });

  if (error) {
    console.error('메시지 조회 중 오류 발생:', error);
    return [];
  }

  return data;
};

export const sendMessage = async (senderId: string, receiverId: string, content: string, postId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender_id: senderId, receiver_id: receiverId, content, post_id: postId, is_checked: false }]);

  if (error) {
    console.error('메시지 전송 중 오류 발생:', error);
    return null;
  }

  return data;
};

type SubscriptionCallbacks = {
  onMessage: (payload: any) => void;
  onError?: (error: any) => void;
  onConnectionChange?: (isConnected: boolean) => void;
};

// 채팅 목록 구독
export const subscribeToChatList = (userId: string, callbacks: SubscriptionCallbacks) => {
  const channelName = `chat-list-${userId}`;

  // 이미 구독 중인 경우 기존 구독 해제
  if (chatSubscriptions.has(channelName)) {
    chatSubscriptions.get(channelName)?.unsubscribe();
  }

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`
      },
      (payload) => {
        try {
          callbacks.onMessage(payload);
        } catch (error) {
          callbacks.onError?.(error);
        }
      }
    )
    .subscribe((status, err) => {
      if (err) {
        callbacks.onError?.(err);
        callbacks.onConnectionChange?.(false);
      } else {
        callbacks.onConnectionChange?.(status === 'SUBSCRIBED');
      }
    });

  chatSubscriptions.set(channelName, channel);

  // 구독 해제 함수 반환
  return () => {
    channel.unsubscribe();
    chatSubscriptions.delete(channelName);
  };
};

// 특정 채팅방 구독
export const subscribeToChatRoom = (
  postId: string,
  senderId: string,
  receiverId: string,
  callbacks: SubscriptionCallbacks
) => {
  const channelName = `chat-room-${postId}-${[senderId, receiverId].sort().join('-')}`;

  // 이미 구독 중인 경우 기존 구독 해제
  if (chatSubscriptions.has(channelName)) {
    chatSubscriptions.get(channelName)?.unsubscribe();
  }

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `post_id=eq.${postId}`
      },
      (payload) => {
        try {
          callbacks.onMessage(payload);
        } catch (error) {
          callbacks.onError?.(error);
        }
      }
    )
    .subscribe((status, err) => {
      if (err) {
        callbacks.onError?.(err);
        callbacks.onConnectionChange?.(false);
      } else {
        callbacks.onConnectionChange?.(status === 'SUBSCRIBED');
      }
    });

  chatSubscriptions.set(channelName, channel);

  return () => {
    channel.unsubscribe();
    chatSubscriptions.delete(channelName);
  };
};

// 모든 구독 해제
export const unsubscribeAll = () => {
  chatSubscriptions.forEach((channel) => channel.unsubscribe());
  chatSubscriptions.clear();
};
