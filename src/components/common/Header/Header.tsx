'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import useAuthStore from '@/zustand/bearsStore';
import HeaderSearch from '../Search/HeaderSearch';
import Image from 'next/image';

function Header() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { logout } = useAuthStore();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      setIsLoggedIn(session !== null);

      if (session) {
        const user = session.user;
        setUserId(user?.id ?? null);

        if (user) {
          const { data, error } = await supabase.from('users').select('avatar').eq('id', user.id).single();

          if (data && data.avatar) {
            setAvatarUrl(data.avatar);
          }
        }
      }
      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(session !== null);
      if (session) {
        setUserId(session.user?.id ?? null);
      } else {
        setUserId(null);
        setAvatarUrl(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const onLogout = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await logout(router);
  };

  if (loading) {
    return null;
  }

  const handleHomeNavigation = () => {
    window.location.href = '/';
  };

  const uuid = uuidv4();

  return (
    <>
      <div className="hidden border-b py-5 md:block">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div onClick={handleHomeNavigation} className="ml-[88px] cursor-pointer">
              <Image src="/icons/WelKo LOGO(991x160).png" alt="WelKo Logo" width={124} height={20} />
            </div>

            <div className="ml-6" style={{ width: '372px' }}>
              <HeaderSearch />
            </div>
          </div>
          <div className="mr-[88px] flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link href={`/postpage/${uuid}`}>
                  <button className="whitespace-pre rounded-3xl px-4 py-2 text-base font-medium text-[#B95FAB] transition-colors duration-200 hover:bg-[#B95FAB] hover:text-white">
                    Make Your Tour
                  </button>
                </Link>
                <Link href={`/${userId}/chatlistpage`}>
                  <button className="whitespace-pre rounded-3xl px-4 py-2 text-base font-medium transition-colors duration-200 hover:bg-[#B95FAB] hover:text-white">
                    Message
                  </button>
                </Link>
                <button
                  onClick={onLogout}
                  className="whitespace-pre rounded-3xl px-4 py-2 text-base font-semibold transition-colors duration-200 hover:bg-[#B95FAB] hover:text-white"
                >
                  Log Out
                </button>
                <Link href={`/${userId}/mypage`} className="ml-4">
                  <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden whitespace-pre rounded-full bg-gray-300">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="User Avatar" fill objectFit="cover" />
                    ) : (
                      <span className="text-xs text-white">?</span>
                    )}
                  </div>
                </Link>
              </>
            ) : (
              <Link href="/login">
                <button className="whitespace-pre rounded-3xl px-4 py-2 text-base font-medium transition-colors duration-200 hover:bg-[#B95FAB] hover:text-white">
                  Log In
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
