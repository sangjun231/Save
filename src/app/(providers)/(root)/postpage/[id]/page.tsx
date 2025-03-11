'use client';
import useAuthStore from '@/zustand/bearsStore';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Calendar from './_components/calendar/Calendar';
import AddressSearch from './_components/dayplaces/AddressSearch';
import DayPlaces from './_components/dayplaces/DayPlaces';
import Write from './_components/Write';

function PostPage() {
  const { id } = useParams();
  const postId = id;
  const [step, setStep] = useState(1);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [userId, setUserId] = useState<string>('');
  const [sequence, setSequence] = useState<number>(0);
  const MySwal = withReactContent(Swal);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (user) {
      setUserId(user.id); // user가 존재할 때만 userId 설정
    }
    if (!user) {
      if (isMobile) {
        toast('Please login', {
          duration: 3000,
          position: 'bottom-center',
          style: {
            background: '#333',
            color: '#fff',
            marginBottom: '100px',
            borderRadius: '70px',
            padding: '10px 20px'
          }
        });
      } else {
        MySwal.fire({
          title: 'Please login',
          icon: 'warning',
          customClass: {
            actions: 'flex flex-col gap-[8px] w-full',
            title: 'font-semibold text-[18px]',
            popup: 'rounded-[16px] p-[24px]',
            confirmButton: 'bg-primary-300 text-white w-full text-[16px] p-[12px] rounded-[12px]'
          }
        });
      }
      router.push('/login');
      return;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id as string)) {
      MySwal.fire({ title: 'Please enter through the correct path', icon: 'warning' });
      router.back(); // 유효하지 않은 경우 이전 페이지로 이동
      return;
    }
  }, [user, id, router]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  const goToStep4 = () => setStep(4);
  const goToStep2 = () => setStep(2);

  return (
    <div>
      <Toaster />
      {step === 1 && <Calendar next={nextStep} postId={postId as string} />}
      {step === 2 && (
        <DayPlaces
          next={nextStep}
          prev={prevStep}
          goToStep4={goToStep4}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          region={region}
          setRegion={setRegion}
          sequence={sequence}
          setSequence={setSequence}
          postId={postId as string}
          userId={userId}
        />
      )}
      {step === 3 && <AddressSearch prev={prevStep} selectedDay={selectedDay} sequence={sequence} />}
      {step === 4 && <Write goToStep2={goToStep2} region={region} postId={postId as string} userId={userId} />}
    </div>
  );
}
export default PostPage;
