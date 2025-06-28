import type { ApexOptions } from 'apexcharts';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, subDays, subWeeks, subMonths, subYears } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { SeverityData, SeverityDataItem, TimeRange } from '@/interface';
import {
  fillMissingMonthlyData,
  fillMissingWeekData,
  fillMissingWeeklyData,
  fillMissingYearlyData
} from '@/utils';

const ApexChart = lazy(() => import('react-apexcharts'));

type Props = {
  data: SeverityData;
  isLoading: boolean;
  onChangeRange: (val: TimeRange) => void;
  selectedTimeRange: string;
};

type Series = {
  name: string;
  data: number[];
  color: string;
};

interface TransformedDataTypes {
  categories: string[];
  series: Series[];
}

const defaultOptions: ApexOptions = {
  yaxis: {
    title: {
      text: 'Number of Events',
      style: {
        fontSize: '12px',
        fontWeight: 400,
        color: '#6b7280'
      }
    },
    labels: {
      style: {
        colors: '#6b7280',
        fontSize: '12px'
      },
      formatter: (value) => {
        return value.toLocaleString();
      }
    },
    // max: yAxisMax,
    tickAmount: 6
  },
  grid: {
    borderColor: '#e5e7eb',
    strokeDashArray: 4,
    xaxis: {
      lines: {
        show: false
      }
    },
    padding: {
      right: 0,
      left: 0
    }
  },
  legend: {
    show: false
  },
  fill: {
    opacity: 1
  },
  tooltip: {
    y: {
      formatter: (val) => val.toLocaleString() + ' events'
    }
  }
};

/**
 * Generates series data for the chart by mapping severity levels (High, Medium, Low) from the input data.
 */
const getSeries = (data: SeverityDataItem[]) => {
  return [
    {
      name: 'High',
      data: data.map((item) => item.high),
      color: '#ef4444'
    },
    {
      name: 'Medium',
      data: data.map((item) => item.medium),
      color: '#fbbf24'
    },
    {
      name: 'Low',
      data: data.map((item) => item.low),
      color: '#10b981'
    }
  ];
};

/**
 * Formats and returns date categories based on the specified time range grouping.
 */
const getCategories = (data: SeverityDataItem[], groupBy: TimeRange) => {
  const formatString = {
    daily: 'dd MMM',
    weekly: 'ww',
    monthly: 'MMM yyyy',
    yearly: 'yyyy'
  };

  if (groupBy === 'weekly') {
    const result = data.map((item) => item.date);
    return result;
  }

  const result = data.map((item) => format(parseISO(item.date), formatString[groupBy]));
  return result;
};

/**
 * Renders a responsive chart component displaying alert activity data with severity levels across different time ranges.
 */
const AlertActivity = ({ data, isLoading, onChangeRange, selectedTimeRange }: Props) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [transformedData, setTransformedData] = useState<TransformedDataTypes>({
    categories: [''],
    series: [{ name: '', data: [], color: '' }]
  });

  useEffect(() => {
    if (data) {
      let mockData = data.data;
      const today = new Date();
      if (data.groupBy === 'monthly') {
        const monthsAgo = subMonths(today, 12);

        const formatMonth = (date: Date) => {
          return format(date, 'yyyy-MM');
        };
        setStartDate(formatMonth(monthsAgo));
        setEndDate(formatMonth(today));
        mockData = fillMissingMonthlyData(formatMonth(monthsAgo), formatMonth(today), data.data);
      }
      if (data.groupBy === 'daily') {
        const oneWeekAgo = subDays(today, 7);

        const formattedToday = format(today, 'yyyy-MM-dd');
        const formattedOneWeekAgo = format(oneWeekAgo, 'yyyy-MM-dd');
        setStartDate(formattedOneWeekAgo);
        setEndDate(formattedToday);
        mockData = fillMissingWeekData(formattedOneWeekAgo, formattedToday, data.data);
      }

      if (data.groupBy === 'weekly') {
        const sevenWeeksAgo = subWeeks(today, 7);

        // Format as ISO week number (e.g., "2025-12")
        const formatWeek = (date: Date) => {
          return format(date, 'RRRR-II'); // RRRR = ISO year, II = ISO week number
        };
        setStartDate(formatWeek(sevenWeeksAgo));
        setEndDate(formatWeek(today));
        mockData = fillMissingWeeklyData(formatWeek(sevenWeeksAgo), formatWeek(today), data.data);
      }
      if (data.groupBy === 'yearly') {
        const threeYearsAgo = subYears(today, 3);

        // Format as year (e.g., "2025", "2022")
        const formatYear = (date: Date) => {
          return format(date, 'yyyy');
        };

        setStartDate(formatYear(threeYearsAgo));
        setEndDate(formatYear(today));
        mockData = fillMissingYearlyData('2022', '2025', data.data);
      }

      const result = {
        categories: getCategories(mockData, data.groupBy),
        series: getSeries(mockData)
      };

      setTransformedData(result);
    }
  }, [data]);

  // Find the maximum value to set appropriate y-axis scale
  // const maxValue =
  //   data.data.length > 0
  //     ? Math.max(...data.data.map((item) => Math.max(item.low, item.medium, item.high)))
  //     : 3000;

  // Round up to nearest thousand for better readability
  // const yAxisMax = Math.ceil(maxValue / 1000) * 1000;

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      // stacked: true,
      toolbar: {
        show: false
      },
      background: 'transparent',
      fontFamily: 'inherit',
      redrawOnWindowResize: true,
      redrawOnParentResize: true
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: '100%'
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%'
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: transformedData.categories,
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        },
        rotateAlways: false,
        hideOverlappingLabels: true
      }
    }
  };

  const lineChartOptions: ApexOptions = {
    chart: {
      height: 350,
      type: 'line',
      zoom: {
        enabled: false
      },
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: 'smooth'
    },
    xaxis: {
      categories: transformedData.categories,
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        },
        rotateAlways: false,
        hideOverlappingLabels: true
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-lg mt-2 overflow-hidden w-[99.9%]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Alert Activity</h2>
        <div className="space-y-1 w-full sm:w-auto">
          <Select value={selectedTimeRange} onValueChange={onChangeRange}>
            <SelectTrigger className="w-full sm:w-[210px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-500">
            {startDate && endDate && !isLoading
              ? `From ${startDate} To ${endDate}`
              : 'Loading date range...'}
          </div>
        </div>
      </div>

      {data.groupBy === 'daily' ? (
        <div className="w-full overflow-hidden">
          {isLoading ? (
            <Skeleton className="w-full h-[350px]" />
          ) : (
            <Suspense fallback={<Skeleton className="w-full h-[350px]" />}>
              <div className="w-full min-w-0">
                <ApexChart
                  options={{ ...lineChartOptions, ...defaultOptions }}
                  series={transformedData.series}
                  type="line"
                  height={350}
                  width="100%"
                />
              </div>
            </Suspense>
          )}
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          {isLoading ? (
            <Skeleton className="w-full h-[350px]" />
          ) : (
            <Suspense fallback={<Skeleton className="w-full h-[350px]" />}>
              <div className="w-full min-w-0">
                <ApexChart
                  options={{ ...defaultOptions, ...options }}
                  series={transformedData.series}
                  type="bar"
                  height={350}
                  width="100%"
                />
              </div>
            </Suspense>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertActivity;
