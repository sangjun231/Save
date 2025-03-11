import React, { useEffect, useState } from 'react';
import {
  format,
  isBefore,
  isAfter,
  startOfDay,
  endOfMonth,
  startOfMonth,
  endOfWeek,
  startOfWeek,
  addMonths,
  subMonths
} from 'date-fns';

interface DaySelectProps {
  selectedMonth: Date;
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: any; //(date: Date | null) => void;
  setSelectedMonth: (date: Date) => void;
  isModal?: boolean;
}

const DaySelect: React.FC<DaySelectProps> = ({
  selectedMonth,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  setSelectedMonth,
  isModal = false
}) => {
  const today = startOfDay(new Date());

  // 현재 달의 시작과 끝을 계산
  const startMonth = startOfMonth(selectedMonth);
  const endMonth = endOfMonth(selectedMonth);

  // 달력의 시작과 끝 날짜를 계산
  const startCalendar = startOfWeek(startMonth, { weekStartsOn: 0 });
  const endCalendar = endOfWeek(endMonth, { weekStartsOn: 0 });

  // 달력에 표시할 날짜 배열을 생성
  const daysInCalendar = Array.from(
    { length: (endCalendar.getTime() - startCalendar.getTime()) / (1000 * 60 * 60 * 24) + 1 },
    (_, i) => new Date(startCalendar.getFullYear(), startCalendar.getMonth(), startCalendar.getDate() + i)
  );

  // 날짜가 비활성화되었는지 확인
  const isDateDisabled = (date: Date) => isBefore(startOfDay(date), today);

  // 날짜가 선택 범위에 포함되는지 확인
  const isDateInRange = (date: Date) => startDate && endDate && isAfter(date, startDate) && isBefore(date, endDate);

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (!startDate) {
      // 시작 날짜가 없는 경우
      setStartDate(date);
      setEndDate(null); // 새 시작 날짜가 설정되면 종료 날짜는 null로 초기화
    } else if (startDate && !endDate) {
      // 시작 날짜가 설정되어 있고 종료 날짜가 없는 경우
      if (isAfter(date, startDate)) {
        setEndDate(date);
      } else {
        // 새로운 시작 날짜가 이전 시작 날짜보다 이른 경우
        setStartDate(date);
        setEndDate(null);
      }
    } else if (startDate && endDate) {
      // 시작 날짜와 종료 날짜가 모두 설정된 경우
      setStartDate(date);
      setEndDate(() => null);
    }
  };

  return (
    <div className={` ${isModal ? `flex items-center justify-center` : ``}`}>
      <div className={`flex flex-col ${isModal ? 'h-[284px] w-[382px] justify-center' : ''}`}>
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))} className="rounded px-2 py-1">
            &lt;
          </button>
          <div className={`text-center font-semibold ${isModal ? 'text-[21px]' : 'text-[13px]'}`}>
            {format(selectedMonth, 'MMMM yyyy')}
          </div>
          <button onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))} className="rounded px-2 py-1">
            &gt;
          </button>
        </div>

        <div className="my-4 grid grid-cols-7 place-items-center gap-4 text-[13px] font-medium text-[#7A7A7A]">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
            <div key={day} className="text-center">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 place-items-center gap-4">
          {daysInCalendar.map((day) => (
            <button
              key={day.toDateString()}
              onClick={() => handleDateClick(day)}
              className={`flex h-[24px] w-[24px] items-center justify-center rounded-full p-1.5 text-[13px] font-semibold ${
                startDate && day.toDateString() === startDate.toDateString()
                  ? 'bg-[#B95FAB] text-white'
                  : endDate && day.toDateString() === endDate.toDateString()
                    ? 'bg-[#B95FAB] text-white'
                    : isDateInRange(day)
                      ? 'bg-[#B95FAB] text-white'
                      : 'bg-white text-black'
              } ${isDateDisabled(day) ? 'cursor-not-allowed bg-gray-200 text-gray-400' : ''}`}
              disabled={isDateDisabled(day)}
            >
              {format(day, 'd')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DaySelect;
