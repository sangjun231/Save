'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

function Footer() {
  const pathname = usePathname();
  const uuid = uuidv4();

  // 특정 경로에서 Footer를 숨기기
  const excludedRoutes = ['/login', '/chatpage'];
  const shouldHideFooter =
    excludedRoutes.includes(pathname) ||
    (pathname.startsWith('/detail') && !pathname.startsWith('/detail/payment')) ||
    pathname.startsWith('/postpage');

  if (shouldHideFooter) {
    return null;
  }

  return (
    <>
      <div className="mt-[310px] hidden bg-grayscale-50 py-8 web:block">
        <div className="flex items-center justify-between px-[88px]">
          <div className="flex items-center">
            <div className="flex">
              <Image src="/icons/WelKo LOGO(991x160).png" alt="WelKo Logo" width={124} height={20} />
            </div>
          </div>
          <div className="flex gap-2">
            <p className="text-base text-grayscale-400">Project WelKo. All rights reserved @sibiganzi (2024)</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Footer;
