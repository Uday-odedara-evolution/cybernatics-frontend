import { Fragment, useState, useEffect } from 'react';
import { toAbsoluteUrl } from '@/utils/Assets';
import ApiClient from '@/utils/ApiClient';
import { useUser } from '@/store/store';

type CategoryType = 'high' | 'medium' | 'low' | 'blocked' | 'online' | 'total';

interface IChannelStatsItem {
  info: number | string;
  desc: string;
  category: CategoryType;
}

interface EventCategoriesResponse {
  total: number;
  aggregations: {
    high: { doc_count: number };
    low: { doc_count: number };
    medium: { doc_count: number };
  };
}

// Main component that displays statistics for events and assets categorized by severity and status
const ChannelStats = ({
  activeTab,
  eventData,
  isLoading,
  onClickCategory
}: {
  activeTab: 'dashboard' | 'events';
  eventData: EventCategoriesResponse | null;
  isLoading: boolean;
  onClickCategory: (val: CategoryType) => void;
}) => {
  const [assets, setAssets] = useState({
    total: 0,
    active: 0
  });
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (user?.id && user?.companyId) {
      fetchAssets();
    }
  }, [user?.id, user?.companyId]);

  // Fetches asset data from the API and updates the assets state with total and active counts
  const fetchAssets = () => {
    ApiClient.get(`/device/${user?.id}/${user?.companyId}`)
      .then((res) => {
        let total = 0;
        let active = 0;

        if (res.data?.list?.length > 0) {
          res.data?.list?.forEach((item: any) => {
            total += 1;
            if (item.status === 'active') {
              active += 1;
            }
          });
        }

        setAssets({ total, active });
      })
      .catch(() => {});
  };

  // Create dynamic items based on fetched data
  const itemsEvents: IChannelStatsItem[] = [
    {
      info: eventData ? eventData.aggregations.high.doc_count.toString() : '0',
      desc: 'HIGH',
      category: 'high'
    },
    {
      info: eventData ? eventData.aggregations.medium.doc_count.toString() : '0',
      desc: 'MEDIUM',
      category: 'medium'
    },
    {
      info: eventData ? eventData.aggregations.low.doc_count.toString() : '0',
      desc: 'LOW',
      category: 'low'
    },
    { info: '0', desc: 'BLOCKED', category: 'blocked' }
  ];

  const itemsAssets: IChannelStatsItem[] = [
    { info: assets.active, desc: 'ONLINE', category: 'online' },
    {
      info: assets.total,
      desc: 'TOTAL',
      category: 'total'
    }
  ];

  // Determines the text color class based on the category type
  const getCategoryColor = (category: IChannelStatsItem['category']) => {
    switch (category) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-green-500';
      case 'blocked':
      case 'total':
        return 'text-blue-500';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <Fragment>
      <style>
        {`
          .channel-stats-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-1.png')}');
          }
          .dark .channel-stats-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3-dark.png')}');
          }
        `}
      </style>

      <div className="space-y-6 w-full">
        <div className="flex justify-start items-start gap-x-4 w-full flex-wrap">
          {/* Events Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Events by Category
            </h2>
            {error ? (
              <div className="text-red-500 p-2">{error}</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {itemsEvents.map((item, index) => (
                  <div
                    key={`dash-event-${item.info}-${index}`}
                    className="card flex flex-col items-center justify-between gap-1 h-full p-1 bg-cover bg-no-repeat channel-stats-bg"
                  >
                    <button
                      onClick={() => onClickCategory(item.category)}
                      className="flex flex-col gap-1 p-4 px-8 w-[138px] items-center justify-between"
                    >
                      <span
                        className={`text-3xl font-semibold ${getCategoryColor(item.category)} ${isLoading ? 'animate-pulse' : ''}`}
                      >
                        {isLoading ? '...' : item.info}
                      </span>
                      <span className="text-sm font-normal text-gray-700 dark:text-gray-300">
                        {item.desc}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assets Section */}

          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Assets</h2>
            <div className="flex flex-wrap gap-2">
              {itemsAssets.map((item, index) => (
                <div
                  key={`dash-asset-${item.info}-${index}`}
                  className="card flex flex-col items-center justify-between gap-1 h-full p-1 bg-cover bg-no-repeat channel-stats-bg"
                >
                  <div className="flex flex-col gap-1 p-4 px-8 w-[138px] items-center justify-between">
                    <span
                      className={`text-3xl font-semibold ${getCategoryColor(item.category)} ${isLoading && item.category === 'total' ? 'animate-pulse' : ''}`}
                    >
                      {isLoading ? '...' : item.info}
                    </span>
                    <span className="text-sm font-normal text-gray-700 dark:text-gray-300">
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Filters (New Styled Dropdowns) */}
          {activeTab === 'events' && (
            <div className="grid grid-cols-3 gap-2 w-auto mt-12">
              {/* Event Level */}
              {/* <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-white mb-1">Event Level</label>
                <Select value={filters.level} onValueChange={(value) => handleSelectChange("level", value)}>
                  <SelectTrigger className="min-w-[157px] h-10">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {/* Event Status */}
              {/* <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-white mb-1">Event Status</label>
                <Select value={filters.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger className="min-w-[157px] h-10">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {/* Response */}
              {/* <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-white mb-1">Response</label>
                <Select value={filters.response} onValueChange={(value) => handleSelectChange("response", value)}>
                  <SelectTrigger className="min-w-[157px] h-10">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export { ChannelStats, type IChannelStatsItem };
