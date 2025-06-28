import { useEffect, useMemo, useState } from 'react';
import { Column, ColumnDef, RowSelectionState } from '@tanstack/react-table';
import {
  DataGrid,
  DataGridColumnHeader,
  DataGridColumnVisibility,
  DataGridRowSelect,
  DataGridRowSelectAll,
  KeenIcon,
  useDataGrid
} from '@/components';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import DeleteModal from '../../../users/delete-model';
import ApiClient from '@/utils/ApiClient';
import UpdateDeviceModal from '../../update-device';
import { Tooltip } from 'react-tooltip';
import { DeviceType } from '@/interface';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

interface DevicePropsTypes {
  deviceList: DeviceType[];
  onUpdate: (updatedDevice: DeviceType) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const Cell = ({ val }: { val: string }) => {
  return (
    <span className="leading-none font-medium text-sm text-gray-900 hover:text-primary">{val}</span>
  );
};

const Device = ({ deviceList, onDelete, onRefresh, onUpdate }: DevicePropsTypes) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deviceIdToDelete, setDeviceIdToDelete] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);

  useEffect(() => {
    document.title = 'Devices';
  }, []);

  const sendDownloadLink = (uuId: string, email: string): void => {
    ApiClient.post(`/device/download-link`, {
      uuId,
      email
    })
      .then(() => {
        toast.success('Download link sent successfully');
      })
      .catch(() => {
        toast.error('An error occurred while sending the download link');
      });
  };

  const ColumnInputFilter = <TData, TValue>({ column }: IColumnFilterProps<TData, TValue>) => {
    return (
      <Input
        placeholder="Filter..."
        value={(column.getFilterValue() as string) ?? ''}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className="h-9 w-full max-w-40"
      />
    );
  };
  const handleEditDevice = (device: DeviceType) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  const handleUpdateSuccess = (updatedDevice: DeviceType) => {
    onUpdate(updatedDevice);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (userId: string) => {
    setDeviceIdToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (deviceIdToDelete === null) return;

    await ApiClient.delete(`/device/${deviceIdToDelete}`)
      .then(() => {
        toast.success('User deleted successfully');
        onDelete(deviceIdToDelete);
      })
      .catch(() => {
        toast.error('Failed to delete user');
      })
      .finally(() => {
        setIsDeleteModalOpen(false);
      });
  };

  const handleRefreshDevice = async (id: string) => {
    if (id === null) return;

    await ApiClient.get(`/device/${id}`)
      .then(() => {
        toast.success('Device refreshed successfully');
        onRefresh();
      })
      .catch(() => {
        toast.error('Device not refreshed successfully');
      })
      .finally(() => {
        setIsDeleteModalOpen(false);
      });
  };

  const columns = useMemo<ColumnDef<DeviceType>[]>(
    () => [
      {
        accessorKey: 'id',
        header: () => <DataGridRowSelectAll />,
        cell: ({ row }) => <DataGridRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: 'w-0'
        }
      },
      {
        accessorFn: (row) => row.name,
        id: 'device_name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Device Name"
            filter={<ColumnInputFilter column={column} />}
            column={column}
          />
        ),
        enableSorting: true,
        filterFn: (row, columnId, filterValue) => {
          const team = row.original.name; // Access the original row data
          const nameMatch = team?.toLowerCase().includes(filterValue.toLowerCase());
          return nameMatch;
        },
        cell: (info) => {
          return (
            <div className="flex flex-col gap-2">
              <span className="leading-none font-medium text-sm text-gray-900">
                {info.row.original.name}
              </span>
            </div>
          );
        },
        meta: {
          headerClassName: 'w-[250px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.email,
        id: 'email',
        header: ({ column }) => <DataGridColumnHeader title="Email Address" column={column} />,
        enableSorting: true,
        cell: ({ row }) => <Cell val={row.original.email} />,
        meta: {
          headerClassName: 'w-[200px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.CompanyLocationDepartment.location.location,
        id: 'location',
        header: ({ column }) => <DataGridColumnHeader title="Location" column={column} />,
        enableSorting: true,
        cell: ({ row }) => <Cell val={row.original.CompanyLocationDepartment.location.location} />,
        meta: {
          headerClassName: 'w-[200px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.CompanyLocationDepartment.department.department,
        id: 'department',
        header: ({ column }) => <DataGridColumnHeader title="Department" column={column} />,
        enableSorting: true,
        cell: ({ row }) => (
          <Cell val={row.original.CompanyLocationDepartment.department.department} />
        ),
        meta: {
          headerClassName: 'w-[200px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        enableSorting: true,
        header: ({ column }) => <DataGridColumnHeader title="Status" column={column} />,
        cell: (info) => {
          const status = info.getValue() as string;
          // const status = "Pending"; // Explicitly type as string
          const statusColors: Record<string, string> = {
            pending: 'bg-yellow-500',
            active: 'bg-green-500',
            disconnected: 'bg-red-500',
            never_connected: 'bg-gray-500'
          };
          return (
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-400'}`}
              ></span>
              <span className="text-gray-700 font-normal capitalize">{status}</span>
            </div>
          );
        },
        meta: {
          headerTitle: 'Status',
          headerClassName: 'w-[200px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.downloadLink,
        id: 'download_link',
        enableSorting: true,
        header: ({ column }) => <DataGridColumnHeader title="Download Link" column={column} />,
        cell: (info) => {
          const value = info.getValue();

          let displayText = 'Pending';
          let textColor = 'text-yellow-500';
          if (value == 1 || value == true) {
            displayText = 'Available';
            textColor = 'text-green-600';
          } else {
            displayText = 'Pending';
            textColor = 'text-yellow-500';
          }
          return <span className={`font-medium ${textColor}`}>{displayText}</span>;
        },
        meta: {
          headerTitle: 'Download Link',
          headerClassName: 'w-[200px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        id: 'actions',
        header: () => 'Action',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              onClick={() => handleRefreshDevice(row.original.id)}
              data-tooltip-id="refersh"
              data-tooltip-content="Refresh"
            >
              <KeenIcon icon="arrows-circle" />
              <Tooltip id="refersh" />
            </button>

            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              onClick={() => sendDownloadLink(row.original.id, row.original.email)}
              data-tooltip-id="downloadlink"
              data-tooltip-content="Send Download Link"
            >
              <KeenIcon icon="sms" />

              <Tooltip id="downloadlink" />
            </button>
            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              // onClick={() => alert(`Clicked on edit for ${row.original.email}`)}
              onClick={() => handleEditDevice(row.original)}
              data-tooltip-id="edit"
              data-tooltip-content="Edit"
            >
              <KeenIcon icon="notepad-edit" />
              <Tooltip id="edit" />
            </button>

            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              // onClick={() => alert(`Clicked on delete for ${row.original.email}`)}
              onClick={() => handleDeleteClick(row.original.id)}
              data-tooltip-id="delete"
              data-tooltip-content="Delete"
            >
              <KeenIcon icon="trash" />
              <Tooltip id="delete" />
            </button>
          </div>
        ),
        meta: {
          headerClassName: 'w-[150px] text-center',
          cellClassName: 'flex justify-center'
        }
      }
    ],
    []
  );

  const handleRowSelection = (state: RowSelectionState) => {
    const selectedRowIds = Object.keys(state);

    if (selectedRowIds.length > 0) {
      toast(`Total ${selectedRowIds.length} are selected.`, {
        description: `Selected row IDs: ${selectedRowIds}`,
        action: {
          label: 'Undo',
          onClick: () => {}
        }
      });
    }
  };

  const Toolbar = () => {
    const { table } = useDataGrid();

    return (
      <div className="card-header flex-wrap px-5 py-5 border-b-0">
        {/* <h3 className="card-title"></h3> */}

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex gap-6">
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3"
              />
              <input
                type="text"
                placeholder="Search device"
                className="input input-sm ps-8"
                value={(table.getColumn('device_name')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('device_name')?.setFilterValue(event.target.value)
                }
              />
            </div>
          </div>
          {/* <Button variant="light" size="sm">
            <KeenIcon icon="setting-4" />
            {'Filter'}
          </Button> */}
          <DataGridColumnVisibility table={table} />
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDeleteUser}
            message={`Are you sure you want to delete ${selectedDevice?.name}?`}
          />
          {isModalOpen && selectedDevice && (
            <UpdateDeviceModal
              isOpen={isModalOpen}
              device={selectedDevice}
              onClose={() => setIsModalOpen(false)}
              onUpdateSuccess={handleUpdateSuccess}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <DataGrid
      columns={columns}
      data={deviceList}
      rowSelection={true}
      onRowSelectionChange={handleRowSelection}
      pagination={{ size: 10 }}
      sorting={[{ id: 'device_name', desc: false }]}
      toolbar={<Toolbar />}
      layout={{ card: true }}
    />
  );
};

export { Device };
