import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChannelStats } from './blocks';
import AlertActivity from './blocks/alert-activity';
import { AccountTeamsContent } from '@/pages/account/members/events';
import { Button } from '@/components/ui/button';
import ReactDatePicker from 'react-datepicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import 'react-datepicker/dist/react-datepicker.css';
import ApiClient from '@/utils/ApiClient';
import LoadingSpinner from '@/assets/svg/LoadingSpinner';
import { usePremium, useUser } from '@/store/store';
import useStateRef from 'react-usestateref';
import { SeverityData, TimeRange } from '@/interface';

interface EventCategoriesResponse {
  total: number;
  aggregations: {
    high: { doc_count: number };
    low: { doc_count: number };
    medium: { doc_count: number };
  };
}

const defaultFilters = {
  department: '',
  location: '',
  startDate: '',
  endDate: '',
  agent: '',
  eventType: ''
};

const Demo1LightSidebarContent = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events'>('dashboard');
  const { user } = useUser();
  const { isPremium } = usePremium();
  const navigate = useNavigate();
  const [agentData, setAgentData] = useState<[]>([]);

  const [filters, setFilters, filtersRef] = useStateRef(defaultFilters);
  const [departmentStatus, setDepartmentStatus] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateError, setDateError] = useState('');
  const [isDisable, setIsDisable] = useState(true);
  const [clearFilter, setClearFilter] = useState(false);
  const [locationData, setLocationData] = useState<[]>([]);
  const [departmentData, setDepartmentData] = useState<[]>([]);
  // const [eventData, setEventData] = useState<[]>([]);
  const [eventCategoriesData, setEventCategoriesData] = useState<EventCategoriesResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [severityData, setSeverityData] = useState<SeverityData>({ data: [], groupBy: 'daily' });
  const [timeRange, setTimeRange, timeRangeRef] = useStateRef<TimeRange>('daily');

  const handleTimeRangeChange = (value: TimeRange) => {
    setTimeRange(value);
    fetchSeverity();
  };

  useEffect(() => {
    setIsModalOpen(!isPremium);
  }, [isPremium]);

  const fetchSeverity = async () => {
    setIsLoading(true);
    const { agent, endDate, startDate, department } = filtersRef.current;

    const payload: any = {
      // agentId: 'afd73eb6-0b71-40e5-82de-189293eae807',
      companyId: user?.companyId,
      groupBy: timeRangeRef.current
    };

    if (agent) {
      payload.agentId = agent;
    }
    if (endDate) {
      payload.toDate = endDate;
    }
    if (startDate) {
      payload.fromDate = startDate;
    }

    if (department) {
      payload.departmentId = department;
    }

    await ApiClient.get('/dashboard/severity-by-date', {
      params: payload
    })
      .then((res) => {
        setSeverityData(res.data);
      })
      .catch(() => {
        setSeverityData((prev) => ({ ...prev, data: [] }));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Fetch events data from API
  // const fetchEvents = async ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
  //   setIsLoading(true);

  //   const { agent, endDate, startDate, department, eventType } = filtersRef.current;

  //   const payload: any = {
  //     // agentId: 'afd73eb6-0b71-40e5-82de-189293eae807',
  //     companyId: user?.companyId,
  //     page: pageIndex + 1,
  //     size: pageSize
  //   };

  //   if (agent) {
  //     payload.agentId = agent;
  //   }
  //   if (endDate) {
  //     payload.toDate = endDate;
  //   }
  //   if (startDate) {
  //     payload.fromDate = startDate;
  //   }

  //   if (department) {
  //     payload.departmentId = department;
  //   }

  //   if (eventType) {
  //     payload.eventType = eventType;
  //   }

  //   await ApiClient.get('/dashboard/events', { params: payload })
  //     .then((res) => {
  //       // Transform the data according to the specified mapping
  //       const formattedData = res.data.data.hits.hits.map((item: any) => {
  //         return {
  //           event: item._id,
  //           description: item._source.rule.description,
  //           device: item._source.agent.name,
  //           level: item._source.rule.level,
  //           dateAndTime: item._source['@timestamp']
  //         };
  //       });

  //       setEventData(formattedData);
  //     })
  //     .catch(() => {})
  //     .finally(() => {
  //       setIsLoading(false);
  //     });
  // };

  const fetchLocation = (organizationId: number) => {
    ApiClient.get(`/location/${organizationId}`).then((res) => {
      setLocationData(res.data);
    });
  };
  const fetchAgentForDepartment = (id: string) => {
    ApiClient.get(`/device/agentByDepartment/${id}`).then((res) => {
      const response = res.data.map((data: any) => {
        return {
          id: data.id,
          name: data.name
        };
      });
      setAgentData(response);
    });
  };

  const fetchDepartmentsForLocation = (locationId: string) => {
    ApiClient.get(`/department/byLocation/${locationId}`)
      .then((response) => {
        const filteredDepartment = response.data.map((res: any) => {
          return {
            compLocDepId: res.id,
            id: res.department.id,
            department: res.department.department
          };
        });
        if (filteredDepartment.length > 0) {
          setDepartmentData(filteredDepartment);
          setDepartmentStatus(true);
        }
      })
      .catch(() => {});
  };

  const handleClickEventCategory = (event: string) => {
    if (event === 'high' || event === 'medium' || event === 'low') {
      setFilters((prev) => ({ ...prev, eventType: event }));
      setActiveTab('events');
      // fetchEvents({ pageIndex: 0, pageSize: 10 });
    }
  };

  useEffect(() => {
    const { department, agent, endDate, location, startDate, eventType } = filters;

    if (eventType) {
      setIsDisable(false);
      return;
    }

    if (!department && !agent && !endDate && !location && !startDate) {
      setIsDisable(true);
      return;
    }

    if (department && location) {
      setIsDisable(false);
      return;
    }
    if (endDate && startDate) {
      if (department) {
        setIsDisable(true);
        return;
      }
      setIsDisable(false);
    }
  }, [filters]);

  useEffect(() => {
    document.title = 'Dashboard';
  }, []);

  useEffect(() => {
    if (user) {
      if (activeTab === 'events') {
        // fetchEvents({ pageIndex: 0, pageSize: 10 });
      } else {
        fetchSeverity();
      }
      fetchEventCategories();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (user && user.organisationId === null) {
      navigate('/organisations-step-1');
      return;
    }
    if (user) {
      fetchEventCategories();
      fetchLocation(user.organisationId);
    }
  }, [user]);

  const handleChange = async () => {
    const { startDate, endDate } = filtersRef.current;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setDateError('Start date must be before end date.');
      return;
    } else {
      setDateError('');
    }
    if (activeTab === 'events') {
      // fetchEvents({ pageIndex: 0, pageSize: 10 });
    } else {
      fetchSeverity();
    }
    fetchEventCategories();
  };

  const fetchEventCategories = async () => {
    setIsLoading(true);

    const { agent, endDate, startDate, department, eventType } = filtersRef.current;

    const payload: any = {
      // agentId: 'afd73eb6-0b71-40e5-82de-189293eae807',
      companyId: user?.companyId
    };

    if (agent) {
      payload.agentId = agent;
    }
    if (endDate) {
      payload.toDate = endDate;
    }
    if (startDate) {
      payload.fromDate = startDate;
    }

    if (department) {
      payload.departmentId = department;
    }

    if (eventType) {
      payload.eventType = eventType;
    }

    await ApiClient.get('/dashboard/event-categories', { params: payload })
      .then((response) => {
        if (!response.data) {
          return;
        }

        setEventCategoriesData(response.data);
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClickSubscribe = () => {
    navigate('/subscription');
  };

  const resetData = () => {
    setClearFilter(true);
    setDepartmentData([]);
    setAgentData([]);
    setDepartmentStatus(false);
    setDateError('');
    setFilters(defaultFilters);
    if (activeTab === 'events') {
      // fetchEvents({ pageIndex: 0, pageSize: 10 });
    } else {
      fetchSeverity();
    }
    fetchEventCategories();
    setTimeout(() => {
      setClearFilter(false);
    }, 1000);
  };

  const handleChangeTab = (tab: 'dashboard' | 'events') => {
    setFilters(defaultFilters);
    setActiveTab(tab);
  };

  if (!user || user?.organisationId === null) {
    return null;
  }

  return (
    <div className="relative w-full">
      {isModalOpen && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-[#0067b8] text-white p-8 rounded-lg max-w-md w-full text-center shadow-xl">
            <h2 className="text-xl font-semibold mb-3">Find out more and secure your devices.</h2>
            <p className="mb-6 text-lg">
              Prices start from <span className="font-bold">USD$4.99*</span> per device.
            </p>

            <button
              onClick={handleClickSubscribe}
              className="bg-[#0078d4] hover:bg-[#005fa3] text-white px-6 py-3 rounded font-semibold transition"
            >
              Subscribe now!
            </button>

            <p className="text-sm mt-4 opacity-80 text-left">*Terms and conditions apply</p>
          </div>
        </div>
      )}
      <div className={`${isModalOpen ? 'blur-[2px] overflow-hidden h-[80vh]' : ''}`}>
        {/* Navigation */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex space-x-6">
            <button
              className={`cursor-pointer pb-2 text-lg font-medium ${
                activeTab === 'dashboard'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-black-100 hover:text-primary'
              }`}
              onClick={() => handleChangeTab('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`cursor-pointer pb-2 text-lg font-medium ${
                activeTab === 'events'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-black-100 hover:text-primary'
              }`}
              onClick={() => handleChangeTab('events')}
            >
              Events
            </button>
          </div>
        </div>

        <div className="flex flex-nowrap justify-start items-end gap-2 w-full mb-4">
          {/* Start Date */}
          <div className="flex flex-col min-w-[160px]">
            <p className="text-xs text-gray-700 mb-1">Start Date</p>
            <ReactDatePicker
              selected={filters.startDate ? new Date(filters.startDate) : null}
              onChange={(date) =>
                handleSelectChange('startDate', date ? date.toLocaleDateString('en-CA') : '')
              }
              className="h-8 text-xs px-2 border rounded-md"
              placeholderText="Start date"
              isClearable
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col min-w-[160px]">
            <p className="text-xs text-gray-700 mb-1">End Date</p>
            <ReactDatePicker
              selected={filters.endDate ? new Date(filters.endDate) : null}
              onChange={(date) =>
                handleSelectChange('endDate', date ? date.toLocaleDateString('en-CA') : '')
              }
              className="h-8 text-xs px-2 border rounded-md"
              placeholderText="End date"
              isClearable
            />
          </div>

          {/* Location */}
          <div className="flex flex-col min-w-[160px]">
            <p className="text-xs text-gray-700 mb-1">Location</p>
            <Select
              value={filters.location}
              onValueChange={(value) => {
                fetchDepartmentsForLocation(value);
                handleSelectChange('location', value);
              }}
            >
              <SelectTrigger className="h-8 text-xs px-2">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {locationData.map((loc: any) => (
                  <SelectItem value={loc.id} key={loc.id}>
                    {loc.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="flex flex-col min-w-[160px]">
            <p className="text-xs text-gray-700 mb-1">Department</p>
            <Select
              disabled={!departmentStatus}
              value={filters.department}
              onValueChange={(value) => {
                handleSelectChange('department', value);
                fetchAgentForDepartment(value);
              }}
            >
              <SelectTrigger className="h-8 text-xs px-2">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departmentData.map((dep: any) => (
                  <SelectItem key={dep.id} value={dep.compLocDepId}>
                    {dep.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Agent */}
          <div className="flex flex-col min-w-[160px]">
            <p className="text-xs text-gray-700 mb-1">Agent</p>
            <Select
              disabled={!departmentStatus}
              value={filters.agent}
              onValueChange={(value) => handleSelectChange('agent', value)}
            >
              <SelectTrigger className="h-8 text-xs px-2">
                <SelectValue placeholder="Select Agent" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="all">All</SelectItem> */}
                {agentData.map((agent: any) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Event Type */}
          {activeTab === 'events' && (
            <div className="flex flex-col min-w-[160px]">
              <p className="text-xs text-gray-700 mb-1">Event Type</p>
              <Select
                // disabled={}
                value={filters.eventType}
                onValueChange={(value) => handleSelectChange('eventType', value)}
              >
                <SelectTrigger className="h-8 text-xs px-2">
                  <SelectValue placeholder="Select Event Type" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="all">All</SelectItem> */}
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="mb-4">
          {/* Buttons */}
          <div className="flex items-center gap-2">
            <Button
              className="h-8 px-3 text-xs"
              disabled={isLoading || isDisable}
              onClick={handleChange}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span>Filtering...</span>
                </>
              ) : (
                'Filter'
              )}
            </Button>
            <Button
              disabled={clearFilter}
              className="h-8 px-3 text-xs bg-gray-100 text-gray-800 hover:bg-gray-200"
              onClick={resetData}
            >
              {clearFilter ? (
                <>
                  <LoadingSpinner />
                  <span>Resetting...</span>
                </>
              ) : (
                'Reset Filter'
              )}
            </Button>
          </div>
        </div>

        {dateError && <p className="text-red-500 text-xs mt-2">{dateError}</p>}

        {/* Content */}
        {activeTab === 'dashboard' ? (
          <div className="items-center w-full">
            <ChannelStats
              activeTab="dashboard"
              eventData={eventCategoriesData}
              isLoading={isLoading}
              onClickCategory={handleClickEventCategory}
            />
            <AlertActivity
              data={severityData}
              isLoading={isLoading}
              onChangeRange={handleTimeRangeChange}
              selectedTimeRange={timeRange}
            />
          </div>
        ) : (
          <div className="grid gap-5 lg:gap-7.5">
            <ChannelStats
              activeTab="events"
              eventData={eventCategoriesData}
              onClickCategory={handleClickEventCategory}
              isLoading={isLoading}
            />
            {!isLoading && (
              <AccountTeamsContent
                key={!isLoading ? 'static' : JSON.stringify(filters)}
                isLoading={isLoading}
                filters={filters}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { Demo1LightSidebarContent };
