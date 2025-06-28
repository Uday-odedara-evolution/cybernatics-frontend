import { Fragment, useState, useEffect } from 'react';
import useStateRef from 'react-usestateref';
import { Container } from '@/components/container';
import {
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';

import { Device } from '.';
import AddDeviceModal from './add-device';
import { ImportDeviceModal } from './components/import-device';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useLocation, usePremium, useUser } from '@/store/store';
import { Department, DeviceType } from '@/interface';
import ApiClient from '@/utils/ApiClient';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/assets/svg/LoadingSpinner';
import { toast } from 'sonner';

const defaultFilters = {
  department: '',
  location: 'all',
  status: 'all',
  downloadLink: 'all'
};

const DevicePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { user } = useUser();
  const { isPremium, subscription } = usePremium();
  const { setLocation, locations } = useLocation();
  const [deviceList, setDeviceList] = useState<DeviceType[]>([]);
  const [totalDevice, setTotalDevice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters, filtersRef] = useStateRef(defaultFilters);
  const isAllowed = isPremium && subscription && subscription?.deviceNumOverride >= totalDevice;

  const fetchDevice = () => {
    const { department, downloadLink, location, status } = filtersRef.current;
    setIsLoading(true);
    const queryParams: {
      cldId?: string;
      status?: string;
      downloadLink?: string;
    } = {};

    if (department !== 'all' && location !== 'all') {
      queryParams.cldId = department;
    }
    if (status !== 'all') {
      queryParams.status = status;
    }
    if (downloadLink !== 'all') {
      queryParams.downloadLink = downloadLink;
    }

    const url = `/device/${user?.id}/${user?.companyId}`;
    ApiClient.get(url, {
      params: queryParams
    })
      .then((res) => {
        setDeviceList(res.data.list);
        setTotalDevice(res.data.total);
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getLocations = (organizationId: number) => {
    ApiClient.get(`/location/${organizationId}`).then((res) => {
      if (res.data) {
        setLocation(res.data);
      }
    });
  };

  const getDepartments = async (locationId: number) => {
    const result = await ApiClient.get(`/department/byLocation/${locationId}`);
    if (result.data) {
      setDepartments(result.data);
    }
  };

  const handleImportDevice = () => {
    if (subscription?.status === 'expired') {
      toast.error('Subscription expired. Please renew your plan to add new devices.');
      return;
    }
    if (isPremium) {
      if (subscription && subscription?.deviceNumOverride > totalDevice) {
        setIsImportModalOpen(true);
      } else {
        toast.error('Device limit reached!');
      }
    } else {
      toast.error(
        'You’ve reached the maximum number of licensed devices. Please upgrade your plan or purchase add-on seats.'
      );
    }
  };

  const handleAddDeviceClick = () => {
    if (subscription?.status === 'expired') {
      toast.error('Subscription expired. Please renew your plan to add new devices.');
      return;
    }
    if (isPremium) {
      if (subscription && subscription?.deviceNumOverride > totalDevice) {
        setIsModalOpen(true);
      } else {
        toast.error('Device limit reached!');
      }
    } else {
      toast.error(
        'You’ve reached the maximum number of licensed devices. Please upgrade your plan or purchase add-on seats.'
      );
    }
  };

  const handleDeviceAdded = () => {
    fetchDevice();
  };

  const handleSelectChange = (name: string, value: string) => {
    setFilters((prevFilters) => {
      if (name === 'location') {
        if (value === 'all') {
          return defaultFilters;
        }
        return {
          ...defaultFilters,
          location: value
        };
      }
      return {
        ...prevFilters,
        [name]: value
      };
    });
  };

  const handleUpdateDevice = (updatedDevice: DeviceType) => {
    const newDeviceList = JSON.parse(JSON.stringify(deviceList)) as DeviceType[];
    const findIndex = newDeviceList.findIndex((item) => item.id === updatedDevice.id);
    newDeviceList[findIndex] = updatedDevice;
    setDeviceList(newDeviceList);
  };
  const handleDeleteDevice = (deviceIdToDelete: string) => {
    setDeviceList((prevData) => prevData.filter((item) => item.id !== deviceIdToDelete));
    setTotalDevice((prev) => prev - 1);
  };
  const handleRefreshDevice = () => {
    fetchDevice();
  };

  const handleClickFilter = () => {
    fetchDevice();
  };
  const handleResetFilter = () => {
    setFilters(defaultFilters);
    fetchDevice();
  };

  useEffect(() => {
    if (user?.organisationId) {
      getLocations(user?.organisationId);
      fetchDevice();
    }
  }, [user]);

  useEffect(() => {
    if (filters.location && filters.location !== 'all') {
      getDepartments(Number(filters.location));
    }
  }, [filters.location]);

  return (
    <Fragment>
      <Container>
        <div className="flex flex-wrap items-center lg:items-end justify-between gap-5 pb-7.5">
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              Efficient device organization with real-time updates
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <div className="flex flex-col">
              <div className="flex gap-2 items-center justify-end">
                <span className="text-md">
                  <span>Utilized Licenses</span>
                  &nbsp;
                  <strong>{`${totalDevice}/${subscription?.deviceNumOverride ?? 0}`}</strong>
                </span>

                <button
                  onClick={handleAddDeviceClick}
                  className="btn btn-sm btn-primary w-32 h-10 flex items-center justify-center"
                  style={{ opacity: isAllowed ? 1 : 0.5 }}
                >
                  Add New Device
                </button>
              </div>
              {totalDevice > (subscription?.deviceNumOverride ?? 0) && (
                <span className="text-xs text-red-500">
                  You have utilized more seats than your current plan capacity.
                </span>
              )}
            </div>
          </ToolbarActions>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap justify-between w-full gap-4">
          {/* Location */}
          <div className="flex flex-col flex-1 min-w-[150px]">
            <p className="text-sm font-medium text-gray-700 mb-1">Location</p>
            <Select
              value={filters.location || 'all'}
              onValueChange={(value) => handleSelectChange('location', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {locations?.map((item) => {
                  return (
                    <SelectItem key={`location-${item.id}`} value={item.id.toString()}>
                      {item.location}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="flex flex-col flex-1 min-w-[150px]">
            <p className="text-sm font-medium text-gray-700 mb-1">Department</p>
            <Select
              value={filters.department}
              onValueChange={(value) => handleSelectChange('department', value)}
              disabled={filters.location === 'all'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="all">All</SelectItem> */}
                {departments?.map((item) => {
                  return (
                    <SelectItem key={`location-${item.id}`} value={item.id.toString()}>
                      {item.department.department}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="flex flex-col flex-1 min-w-[150px]">
            <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disconnected">Disconnected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Download Link */}
          <div className="flex flex-col flex-1 min-w-[150px]">
            <p className="text-sm font-medium text-gray-700 mb-1">Download Link</p>
            <Select
              value={filters.downloadLink || 'all'}
              onValueChange={(value) => handleSelectChange('downloadLink', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Available</SelectItem>
                <SelectItem value="false">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Button
            className="h-8 px-3 text-xs"
            disabled={isLoading || filters.location == 'all' || !filters.department}
            onClick={handleClickFilter}
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
            disabled={isLoading}
            className="h-8 px-3 text-xs bg-gray-100 text-gray-800 hover:bg-gray-200"
            onClick={handleResetFilter}
          >
            <span>Reset Filter</span>
          </Button>
          <Button
            disabled={isLoading || !isPremium}
            className="h-8 px-3 text-xs"
            onClick={handleImportDevice}
          >
            <span>Import</span>
          </Button>
        </div>

        {/* Device Table */}
        <div className="grid mt-3 gap-5 lg:gap-7.5">
          <Device
            deviceList={deviceList}
            onUpdate={handleUpdateDevice}
            onDelete={handleDeleteDevice}
            onRefresh={handleRefreshDevice}
          />
        </div>
      </Container>

      {/* Add Device Modal */}
      <AddDeviceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddedSuccess={handleDeviceAdded}
        locations={locations}
        user={user}
      />
      <ImportDeviceModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleDeviceAdded}
        locations={locations ?? []}
        user={user}
      />
    </Fragment>
  );
};

export { DevicePage };
