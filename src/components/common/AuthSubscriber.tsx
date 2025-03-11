'use client';
import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import useAuthStore from '@/zustand/bearsStore';

export function AuthSubscriber() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const supabase = createClient();

    // 인증 상태 변경을 구독합니다.
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // 컴포넌트 언마운트 시 구독을 해제합니다.
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      } else {
        console.warn('Unsubscribe method is not available on subscription object');
      }
    };
  }, [setUser]);

  return null;
}
