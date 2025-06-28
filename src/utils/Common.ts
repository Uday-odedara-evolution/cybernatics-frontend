import { SeverityDataItem } from '@/interface';

export const throttle = (func: (...args: any[]) => void, limit: number) => {
  let lastFunc: any;
  let lastRan: number;
  return function (this: any, ...args: any[]) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - lastRan)
      );
    }
  };
};

export const fillMissingWeekData = (
  startDate: string,
  endDate: string,
  data: SeverityDataItem[]
) => {
  const dataMap = Object.fromEntries(data.map((item) => [item.date, item]));
  const result = [];

  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];

    if (dataMap[dateStr]) {
      result.push(dataMap[dateStr]);
    } else {
      result.push({
        date: dateStr,
        low: 0,
        medium: 0,
        high: 0
      });
    }

    current.setDate(current.getDate() + 1);
  }

  return result;
};

export const fillMissingMonthlyData = (
  startMonth: string,
  endMonth: string,
  data: SeverityDataItem[]
) => {
  const dataMap = Object.fromEntries(data.map((item) => [item.date, item]));
  const result = [];

  const [startYear, startMon] = startMonth.split('-').map(Number);
  const [endYear, endMon] = endMonth.split('-').map(Number);

  let year = startYear;
  let month = startMon;

  while (year < endYear || (year === endYear && month <= endMon)) {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    if (dataMap[monthStr]) {
      result.push(dataMap[monthStr]);
    } else {
      result.push({ date: monthStr, low: 0, medium: 0, high: 0 });
    }

    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return result;
};

export const fillMissingWeeklyData = (
  startWeek: string,
  endWeek: string,
  data: SeverityDataItem[]
) => {
  const dataMap = Object.fromEntries(data.map((item) => [item.date, item]));
  const result = [];

  const [startYear, startWk] = startWeek.split('-').map(Number);
  const [endYear, endWk] = endWeek.split('-').map(Number);

  let year = startYear;
  let week = startWk;

  while (year < endYear || (year === endYear && week <= endWk)) {
    const weekStr = `${year}-${String(week).padStart(2, '0')}`;

    if (dataMap[weekStr]) {
      result.push(dataMap[weekStr]);
    } else {
      result.push({
        date: weekStr,
        low: 0,
        medium: 0,
        high: 0
      });
    }

    week++;
    if (week > 52) {
      // or 53 depending on ISO year, but 52 is safe enough for most use cases
      week = 1;
      year++;
    }
  }

  return result;
};

export const fillMissingYearlyData = (
  startYear: string,
  endYear: string,
  data: SeverityDataItem[]
) => {
  const dataMap = Object.fromEntries(data.map((item) => [item.date, item]));
  const result = [];

  for (let year = Number(startYear); year <= Number(endYear); year++) {
    const yearStr = year.toString();
    if (dataMap[yearStr]) {
      result.push(dataMap[yearStr]);
    } else {
      result.push({
        date: yearStr,
        low: 0,
        medium: 0,
        high: 0
      });
    }
  }

  return result;
};
