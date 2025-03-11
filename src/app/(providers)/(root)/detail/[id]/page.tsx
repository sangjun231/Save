'use client';

import React, { useEffect, Suspense } from 'react';
import DetailImg from './_components/DetailImg';
import { Guide } from './_components/Guide';
import Reviews from './_components/Reviews';
import { CheckboxDetail } from './_components/CheckboxDetail';
import DetailNavbar from './_components/DetailNavbar';
import ScheduleMap from './_components/ScheduleMap';
import { useWebStore } from '@/zustand/webStateStore';
import DetailRead from './_components/DetailRead';

// Skeleton 컴포넌트 정의
const Skeleton = ({ height }: { height: string }) => <div className={`animate-pulse bg-gray-200 ${height}`} />;

export default function DetailPage() {
  const { isWeb, setIsWeb } = useWebStore();

  useEffect(() => {
    const handleResize = () => {
      setIsWeb(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [setIsWeb]);

  return (
    <>
      <DetailImg isWeb={isWeb} />
      <div className="flex w-full justify-center">
        <div className="web:mx-[88px] mx-5 w-full">
          {/* Suspense로 각 컴포넌트를 감싸고 로딩 중에 Skeleton UI를 표시 */}
          <Suspense fallback={<Skeleton height="650px" />}>
            <DetailRead isWeb={isWeb} />
          </Suspense>
          <Suspense fallback={<Skeleton height="650px" />}>
            <CheckboxDetail isWeb={isWeb} />
          </Suspense>
          <Suspense fallback={<Skeleton height="650px" />}>
            <ScheduleMap isWeb={isWeb} />
          </Suspense>
          <Suspense fallback={<Skeleton height="650px" />}>
            <Guide isWeb={isWeb} />
          </Suspense>
          <Suspense fallback={<Skeleton height="650px" />}>
            <Reviews isWeb={isWeb} />
          </Suspense>
        </div>
      </div>
      <DetailNavbar />
    </>
  );
}
