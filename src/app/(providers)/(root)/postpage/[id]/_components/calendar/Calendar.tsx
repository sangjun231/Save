'use client';
import BackButton from '@/components/common/Button/BackButton';
import { createClient } from '@/utils/supabase/client';
import { addMonths, format } from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiCalendarDots } from 'react-icons/pi';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import DateSaveButton from './DateSaveButton';
import DaySelect from './DaySelect';

interface CalendarProps {
  next: () => void;
  postId?: string; // 수정 모드일 때 사용
}

const Calendar = ({ next, postId }: CalendarProps) => {
  const MySwal = withReactContent(Swal);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const months = Array.from({ length: 12 }, (_, i) => i);
  const monthLabelM = months.map((month) => format(addMonths(new Date(), month), 'MMM'));
  const monthLabelY = months.map((month) => format(addMonths(new Date(), month), 'yyyy'));

  // 수정할 때
  useEffect(() => {
    if (postId) {
      const fetchData = async () => {
        const supabase = createClient();
        const { data, error } = await supabase.from('posts').select('startDate, endDate, id').eq('id', postId).single();
        if (!data || data.id !== postId) {
          return;
        }
        if (error) {
          console.error('Error fetching post data:', error);
          return;
        }

        if (data) {
          setStartDate(new Date(data.startDate));
          setEndDate(new Date(data.endDate));
        }
      };

      fetchData();
    }
  }, [postId]);

  const handleDateSave = async () => {
    const formatDateForDB = (date: Date | null) => {
      return date?.toISOString().split('T')[0];
    };

    try {
      // 날짜 저장
      if (startDate && endDate) {
        const start = formatDateForDB(startDate) as string;
        const end = formatDateForDB(endDate) as string;
        sessionStorage.setItem('startDate', start);
        sessionStorage.setItem('endDate', end);
        next();
      } else {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          toast('Please select a date', {
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
          // Web 환경
          MySwal.fire({ title: 'Please select a date', icon: 'warning' });
        }
      }
    } catch (error) {
      console.error('Error saving dates:', error);
    }
  };

  return (
    <div className="flex flex-col justify-center">
      {/* 헤더 부분 디자인 */}
      <div className="my-5 flex items-center web:hidden">
        <div className="flex w-20 justify-center">
          <BackButton />
        </div>

        <h1 className="flex w-[199px] justify-center text-xl font-semibold">Make tour</h1>
      </div>

      <div className="flex flex-col gap-7 rounded-xl border-x-0 border-y-2 border-gray-200 px-5 shadow-xl web:gap-10 web:border-0 web:shadow-none">
        <div className="web:mb-14">
          <h2 className="ml-3 mt-7 font-bold mobile:text-2xl web:text-3xl">When&apos;s your tour?</h2>
          <p className="ml-3 mt-3 hidden text-lg text-grayscale-600 web:block">You can choose up to 7 days</p>
        </div>
        <div className="no-scrollbar flex w-full overflow-x-auto web:hidden">
          {months.map((month, index) => (
            <button
              key={index}
              className="mx-1 flex h-[78px] w-[96px] flex-col items-center justify-center rounded-lg border-2 px-[25px] text-black hover:bg-gray-100"
              onClick={() => setSelectedMonth(addMonths(new Date(), month))}
            >
              <PiCalendarDots className="mb-1 size-5 text-grayscale-500" />
              <p className="flex">
                <span className="mr-1 text-sm font-semibold">{monthLabelM[index]}</span>
                <span className="text-sm">{monthLabelY[index]}</span>
              </p>
            </button>
          ))}
        </div>

        <DaySelect
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />

        <DateSaveButton
          onClick={handleDateSave}
          startDate={startDate}
          endDate={endDate}
          selectedMonth={selectedMonth}
        />
      </div>
    </div>
  );
};

export default Calendar;
