'use client';
import { addMonths, format } from 'date-fns';
import React, { useState, useRef, useEffect } from 'react';
import DaySelect from '../planner/DaySelect';
import Image from 'next/image';

// 스크롤바 숨기기 위해 만든 css
const noScrollbarCSS = `
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
`;

// 스타일을 글로벌 CSS에 추가하는 방법
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = noScrollbarCSS;
  document.head.appendChild(styleElement);
}

interface PeriodSelectorProps {
  next: () => void;
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  isModal?: boolean;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  next,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  isModal = false
}) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeButtonIndex, setActiveButtonIndex] = useState<number | null>(null);

  const months = Array.from({ length: 12 }, (_, i) => i);

  const monthLabels = months.map((month) => {
    const monthDate = addMonths(new Date(), month);
    const monthPart = format(monthDate, 'MMM');
    const yearPart = format(monthDate, 'yyyy');
    return { monthPart, yearPart };
  });

  const handleDateSave = () => {
    next();
  };

  const handleDateChange = (date: Date | null, type: 'start' | 'end') => {
    if (date) {
      if (type === 'start') {
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  // Drag-to-scroll 기능 추가
  const isDragging = useRef<boolean>(false);
  const startX = useRef<number>(0);
  const scrollLeft = useRef<number>(0);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (scrollContainerRef.current) {
        isDragging.current = true;
        startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
        scrollLeft.current = scrollContainerRef.current.scrollLeft;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current && scrollContainerRef.current) {
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX.current) * 2; // 스크롤 속도 조절
        scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
      }
    };

    const handleMouseUpOrLeave = () => {
      isDragging.current = false;
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUpOrLeave);
      container.addEventListener('mouseleave', handleMouseUpOrLeave);

      return () => {
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseup', handleMouseUpOrLeave);
        container.removeEventListener('mouseleave', handleMouseUpOrLeave);
      };
    }
  }, []);

  return (
    <div className="flex flex-col justify-center">
      <div className="my-4 max-w-full">
        <div className="no-scrollbar relative flex max-w-full overflow-x-auto scroll-smooth" ref={scrollContainerRef}>
          <div className="flex flex-row">
            {months.slice(0, 12).map((month, index) => (
              <button
                key={index}
                className={`h-15 mr-2 flex w-24 flex-col items-center justify-center rounded-lg border border-solid px-2 py-4 text-black hover:bg-gray-100 ${activeButtonIndex === index ? 'border-2 border-[#B95FAB]' : ''}`}
                onClick={() => {
                  setSelectedMonth(addMonths(new Date(), month));
                  setActiveButtonIndex(index);
                }}
              >
                <Image
                  src="/icons/tabler-icon-calendar-month.svg"
                  alt="Calendar icon"
                  width={24}
                  height={24}
                  className="mb-1"
                />
                <div className="flex flex-row items-center">
                  <span className="mr-1 text-[13px] font-semibold">{monthLabels[index].monthPart}</span>
                  <span className="text-[13px] text-[#939394]">{monthLabels[index].yearPart}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <DaySelect
        selectedMonth={selectedMonth}
        startDate={startDate}
        endDate={endDate}
        setStartDate={(date) => handleDateChange(date, 'start')}
        setEndDate={(date: any) => handleDateChange(date, 'end')}
        setSelectedMonth={setSelectedMonth}
        isModal={isModal}
      />
      <button
        className="my-4 w-full rounded-2xl bg-[#B95FAB] p-2 text-lg font-semibold text-white"
        onClick={handleDateSave}
      >
        {startDate && endDate
          ? `${format(startDate, 'yy. M. d')} - ${format(endDate, 'M. d')} Search`
          : selectedMonth
            ? `Search`
            : '날짜 선택하기'}
      </button>
    </div>
  );
};

export default PeriodSelector;
