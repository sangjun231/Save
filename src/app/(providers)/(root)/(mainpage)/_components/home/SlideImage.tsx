'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import Search from '@/components/common/Search/Search';
import { createClient } from '@/utils/supabase/client';

const images = [
  { src: '/img/main.jpeg', webpSrc: '/img/main.webp', alt: 'Main Image' },
  { src: '/img/main-busan.jpg', webpSrc: '/img/main-busan.webp', alt: 'Busan' },
  { src: '/img/main-seoul.jpg', webpSrc: '/img/main-seoul.webp', alt: 'Seoul' },
  { src: '/img/main-jeju.jpg', webpSrc: '/img/main-jeju.webp', alt: 'Jeju' },
  { src: '/img/main-yeosu.jpg', webpSrc: '/img/main-yeosu.webp', alt: 'Yeosu' }
];

const SlideImage: React.FC = () => {
  const supabase = createClient();
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      setIsLoggedIn(session !== null);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(session !== null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    if (isDesktop) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isDesktop]);

  const handleTourButtonClick = () => {
    const uuid = uuidv4();
    if (isLoggedIn) {
      router.push(`/postpage/${uuid}`);
    } else {
      // 알림창 필요할듯?
      router.push('/login');
    }
  };

  return (
    <div className="relative">
      {isLoading && <div className="absolute inset-0 bg-transparent" />}
      {isDesktop ? (
        <div style={{ width: '100%', height: '560px', overflow: 'hidden' }}>
          <picture>
            <source srcSet={images[currentImageIndex].webpSrc} type="image/webp" />
            <Image
              src={images[currentImageIndex].src}
              alt={images[currentImageIndex].alt}
              width={1440}
              height={560}
              style={{
                display: isLoading ? 'none' : 'block',
                width: '100%',
                height: '560px',
                objectFit: 'cover'
              }}
              priority
              onLoad={() => setIsLoading(false)}
            />
          </picture>
        </div>
      ) : (
        <Image
          src="/img/main.webp"
          alt="Mobile Image"
          width={800}
          height={216}
          style={{
            display: isLoading ? 'none' : 'block',
            width: '100%',
            height: '216px'
          }}
          priority
          onLoad={() => setIsLoading(false)}
        />
      )}
      {!isLoading && (
        <div
          className={`absolute left-0 top-0 ml-[88px] flex flex-col justify-center text-white ${isDesktop ? '' : 'hidden'}`}
          style={{
            height: '560px',
            width: '40%'
          }}
        >
          <h1
            className="text-shadow mb-[32px] whitespace-pre text-lg font-bold sm:text-2xl md:text-4xl"
            style={{
              lineHeight: '1.35'
            }}
          >
            Enjoy the wonders of Korea{'\n'}with our Knowledgeable{'\n'}guide
          </h1>
          <div className="text-shadow mb-[32px] whitespace-pre">
            Welco offers a rich travel experience through the kind guidance
            <br />
            of a local guide living in Korea
          </div>
          <div className="w-[220px]">
            <button
              onClick={handleTourButtonClick}
              className="flex items-center rounded-2xl bg-[#B95FAB] px-6 py-4 text-lg font-semibold"
            >
              Make Your Tour
              <Image
                src="/icons/tabler-icon-whtiepencil.svg"
                alt="Pencil Icon"
                width={24}
                height={24}
                className="ml-1"
              />
            </button>
          </div>
        </div>
      )}
      {!isDesktop && (
        <div className="absolute bottom-3 left-0 block flex w-full justify-center px-5 md:hidden">
          <Search />
        </div>
      )}
    </div>
  );
};

export default SlideImage;
