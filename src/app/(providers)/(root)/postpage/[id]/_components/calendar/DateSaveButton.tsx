import { format, startOfDay } from 'date-fns';

interface DateSaveButtonProps {
  onClick: () => void;
  selectedMonth: Date;
  startDate: Date | null;
  endDate: Date | null;
}

const DateSaveButton = ({ onClick, startDate, endDate, selectedMonth }: DateSaveButtonProps) => {
  return (
    <>
      {startDate && endDate ? (
        <button
          className="mx-auto mb-5 h-14 w-[288px] rounded-2xl bg-primary-300 p-2 text-lg text-white web:w-4/5"
          onClick={onClick}
        >
          {`${format(startOfDay(startDate), 'yy. M. d')} - ${format(startOfDay(endDate), 'M. d')} Select`}
        </button>
      ) : (
        <button className="mx-auto mb-5 h-14 w-[288px] cursor-default rounded-2xl bg-primary-100 p-2 text-lg text-white web:w-4/5">
          {selectedMonth ? `${format(selectedMonth, 'yyyy MMM')} Select` : 'Select'}
        </button>
      )}
    </>
  );
};

export default DateSaveButton;
