import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const daysAgo = differenceInDays(now, date);

  if (daysAgo >= 7) {
    const weeksAgo = Math.floor(daysAgo / 7);
    return `${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
  } else if (daysAgo > 0) {
    return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
  } else {
    const hoursAgo = differenceInHours(now, date);
    if (hoursAgo > 0) {
      return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
    } else {
      const minutesAgo = differenceInMinutes(now, date);
      return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
    }
  }
};

export const averageRatings = (reviews: { rating: number }[]): number => {
  if (reviews.length === 0) return 0;
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return parseFloat(average.toFixed(2)); // 소수점 한 자리로 고정 후 숫자로 변환
};

export const formatDateRange = (startDate: string | null, endDate: string | null): string => {
  if (!startDate || !endDate) return 'N/A';

  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatMonthDay = (date: Date) => `${date.getMonth() + 1}.${date.getDate()}`;

  if (start.getFullYear() === end.getFullYear()) {
    return `${start.getFullYear().toString().slice(2)}.${formatMonthDay(start)} - ${formatMonthDay(end)}`;
  } else {
    return `${start.getFullYear().toString().slice(2)}.${formatMonthDay(start)} - ${end.getFullYear().toString().slice(2)}.${formatMonthDay(end)}`;
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
};
