import { addMonths, format, subMonths } from 'date-fns';
import Image from 'next/image';

type MonthProp = {
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  startDate: Date | null;
  endDate: Date | null;
  handleDateClick: (date: Date) => void;
  daysInCalendar: Date[];
  isDateDisabled: (date: Date) => boolean;
};
export const MonthCalendar = ({
  selectedMonth,
  setSelectedMonth,
  startDate,
  endDate,
  handleDateClick,
  daysInCalendar,
  isDateDisabled
}: MonthProp) => {
  return (
    <div className="flex flex-col">
      <div className="mx-auto mb-2 flex items-center font-bold web:mb-5">
        <button onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))} className="mr-3">
          <Image
            src="/icons/tabler-icon-chevron-left.svg"
            alt="left"
            width={28}
            height={28}
            style={{ width: '28px', height: '28px' }}
          />
        </button>
        {format(selectedMonth, 'MMMM yyyy')}
        <button onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))} className="ml-3">
          <Image
            src="/icons/tabler-icon-chevron-right.svg"
            alt="left"
            width={28}
            height={28}
            style={{ width: '28px', height: '28px' }}
          />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center web:gap-5">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="font-medium text-gray-400">
            {day}
          </div>
        ))}
        {daysInCalendar.map((day) => {
          const isCurrentMonth = day.getMonth() === selectedMonth.getMonth();

          if (!isCurrentMonth) {
            return <div key={day.toDateString()} />; // 빈 div로 공간 유지
          }

          return (
            <button
              key={day.toDateString()}
              onClick={() => handleDateClick(day)}
              className={`ml-auto mr-auto w-10 rounded-full py-2 font-medium ${
                isDateDisabled(day)
                  ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                  : startDate && endDate && day >= startDate && day <= endDate
                    ? 'bg-primary-300 text-white'
                    : startDate && day.toDateString() === startDate.toDateString()
                      ? 'bg-primary-300 text-white'
                      : endDate && day.toDateString() === endDate.toDateString()
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-black'
              } ${isDateDisabled(day) ? 'cursor-not-allowed' : 'hover:bg-gray-100'}`}
              disabled={isDateDisabled(day)}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};
