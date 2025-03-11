'use client';

import ReviewForm from './_components/ReviewForm';
import { useParams } from 'next/navigation';

const ReviewPage = () => {
  const { id } = useParams() as { id: string };

  return (
    <div className="mx-[20px]">
      <ReviewForm userId={id} />
    </div>
  );
};

export default ReviewPage;
