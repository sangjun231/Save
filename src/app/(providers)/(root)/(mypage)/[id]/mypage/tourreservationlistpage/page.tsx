'use client';

import { useSearchParams, useParams } from 'next/navigation';
import TourReservationList from './_components/TourReservationList';

const TourReservationListPage = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  const postId = searchParams.get('postId');

  return (
    <div className="mx-[20px] mt-[56px] web:mt-[8px]">
      {userId && postId ? <TourReservationList userId={userId} postId={postId} /> : <div>No Post ID Provided</div>}
    </div>
  );
};

export default TourReservationListPage;
