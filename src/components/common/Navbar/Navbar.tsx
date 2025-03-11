'use client';

import useRequireLogin from '@/hooks/CustomAlert';
import useAuthStore from '@/zustand/bearsStore';
import { useMyPageStore } from '@/zustand/mypageStore';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import IconHome from '/public/icons/navbar_icons/icon_home.svg';
import IconMessage from '/public/icons/navbar_icons/icon_message.svg';
import IconMypage from '/public/icons/navbar_icons/icon_mypage.svg';
import IconPlus from '/public/icons/navbar_icons/icon_plus.svg';
import IconReservation from '/public/icons/navbar_icons/icon_reservation.svg';

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const setSelectedComponent = useMyPageStore((state) => state.setSelectedComponent);
  const uuid = uuidv4();
  const requireLogin = useRequireLogin();

  const handleReservationsClick = () => {
    if (!user) {
      requireLogin(() => {
        setSelectedComponent('Reservation');
        router.push(`/${user?.id}/mypage`);
      });
      return;
    }
    setSelectedComponent('Reservation');
    router.push(`/${user?.id}/mypage`);
  };

  const handlePostClick = () => {
    if (!user) {
      requireLogin(() => {
        router.push(`/postpage/${uuid}`);
      });
      return;
    }
    router.push(`/postpage/${uuid}`);
  };

  const handleMessagesClick = () => {
    if (!user) {
      requireLogin(() => {
        router.push(`/${user?.id}/chatlistpage`);
      });
      return;
    }
    router.push(`/${user?.id}/chatlistpage`);
  };

  const handleMypageClick = () => {
    if (!user) {
      requireLogin(() => {
        setSelectedComponent('Wishlist');
        router.push(`/${user?.id}/mypage`);
      });
      return;
    }
    setSelectedComponent('Wishlist');
    router.push(`/${user?.id}/mypage`);
  };

  // 특정 경로에서 Navbar를 숨기기
  const excludedRoutes = ['/login', `/chatpage`];
  if (excludedRoutes.includes(pathname) || pathname.startsWith('/detail') || pathname.startsWith('/postpage')) {
    return null;
  }
  const chatpageRegex = /\/[a-f0-9-]+\/[a-f0-9-]+\/chatpage/;
  if (chatpageRegex.test(pathname)) {
    return null;
  }

  return (
    <nav className="sticky bottom-0 flex border-t border-grayscale-100 bg-white text-grayscale-500 web:hidden">
      <div className="container mx-auto flex items-center justify-between p-[15px]">
        <Link href="/">
          <div className="flex flex-col items-center gap-1 hover:text-primary-300">
            <IconHome alt="Home" width={24} height={24} />
            <span className="text-[10px]">Home</span>
          </div>
        </Link>
        <div
          onClick={handleReservationsClick}
          className="flex cursor-pointer flex-col items-center gap-1 hover:text-primary-300"
        >
          <IconReservation alt="Reservation" width={24} height={24} />
          <span className="text-[10px]">Reservations</span>
        </div>
        <div
          onClick={handlePostClick}
          className="flex h-12 w-12 cursor-pointer flex-col items-center justify-center rounded-full bg-primary-300 shadow-[0px_8px_19px_rgba(0,0,0,0.17)]"
        >
          <IconPlus alt="Plus" width={24} height={24} />
        </div>
        <div
          onClick={handleMessagesClick}
          className="flex cursor-pointer flex-col items-center justify-center gap-1 hover:text-primary-300"
        >
          <IconMessage alt="Message" width={24} height={24} />
          <span className="text-[10px]">Messages</span>
        </div>
        <div
          onClick={handleMypageClick}
          className="flex cursor-pointer flex-col items-center gap-1 hover:text-primary-300"
        >
          <IconMypage alt="Mypage" width={24} height={24} />
          <span className="text-[10px]">Mypage</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
