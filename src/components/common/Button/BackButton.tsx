import React, { useEffect } from 'react';
import BackBtn from '/public/icons/tabler-icon-back.svg';
import { useWebStore } from '@/zustand/webStateStore';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  className?: string;
}

const BackButton = ({ className }: BackButtonProps) => {
  const { isWeb, setIsWeb } = useWebStore();
  const router = useRouter();

  // 화면 크기에 따라 isWeb 상태 업데이트
  useEffect(() => {
    const handleResize = () => {
      setIsWeb(window.innerWidth >= 768);
    };

    handleResize(); // 초기 로드 시 한 번 실행
    window.addEventListener('resize', handleResize); // 화면 크기 변경 시마다 실행

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setIsWeb]);

  return (
    <div className={`${className}`}>
      <button
        onClick={() => router.back()}
        className={`flex ${isWeb ? 'web:h-14 web:w-14 items-center justify-center rounded-full bg-[#F7F7F9]' : 'icon-button'}`}
        aria-label="Go Back"
      >
        <BackBtn width={isWeb ? 32 : 24} height={isWeb ? 32 : 24} />
      </button>
    </div>
  );
};

export default BackButton;
