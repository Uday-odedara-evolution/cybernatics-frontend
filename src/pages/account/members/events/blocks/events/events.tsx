import { useMemo } from 'react';
import type { Column, ColumnDef, RowSelectionState } from '@tanstack/react-table';
import {
  DataGrid,
  DataGridColumnHeader,
  DataGridColumnVisibility,
  DataGridRowSelect,
  DataGridRowSelectAll,
  KeenIcon,
  TDataGridRequestParams,
  useDataGrid
} from '@/components';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import ApiClient from '@/utils/ApiClient';
import { useUser } from '@/store/store';
// import { Skeleton } from '@/components/ui/skeleton';

// Transformed data structure for the table
interface IEventTableData {
  event: string;
  description: string;
  device: string;
  level: number;
  dateAndTime: string;
}

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

const Event = ({ filters }: any) => {
  const { user } = useUser();

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

  const columns = useMemo<ColumnDef<IEventTableData>[]>(
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
        accessorKey: 'event',
        id: 'event_name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Event"
            filter={<ColumnInputFilter column={column} />}
            column={column}
          />
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <span className="leading-none font-medium text-sm text-gray-900">
            {row.original.event}
          </span>
        ),

        // filterFn: (row, columnId, filterValue) => {
        //   return row.getValue<string>(columnId).toLowerCase().includes(filterValue.toLowerCase())
        // },
        // cell: (info) => {
        //   return (
        //     <div className="flex flex-col gap-2">
        //       <Link className="leading-none font-medium text-sm text-gray-900 hover:text-primary" to="#">
        //         {info.getValue()}
        //       </Link>
        //     </div>
        //   )
        // },
        meta: {
          headerClassName: 'min-w-[200px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorKey: 'description',
        id: 'eventDescription',
        header: ({ column }) => <DataGridColumnHeader title="Event Description" column={column} />,
        enableSorting: true,
        // cell: (info) => <span className="text-sm text-gray-700 font-normal">{info.getValue()}</span>,
        cell: ({ row }) => (
          <span className="leading-none font-medium text-sm text-gray-900">
            {row.original.description}
          </span>
        ),
        meta: {
          headerClassName: 'min-w-[300px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorKey: 'device',
        id: 'device',
        enableSorting: true,
        header: ({ column }) => <DataGridColumnHeader title="Device" column={column} />,
        cell: (info) => info.getValue(),
        meta: {
          headerTitle: 'Last Modified',
          headerClassName: 'w-[200px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorKey: 'type',
        id: 'level',
        enableSorting: true,
        header: ({ column }) => <DataGridColumnHeader title="Level" column={column} />,
        // cell: (info) => <span className="text-sm">{info.getValue()}</span>,
        cell: ({ row }) => (
          <span className="leading-none font-medium text-sm text-gray-900">
            {row.original.level}
          </span>
        ),
        headerClassName: 'w-[150px]',
        cellClassName: 'text-gray-700 font-normal'
      },
      {
        accessorKey: 'startTime',
        id: 'dateAndTime',
        enableSorting: true,
        header: ({ column }) => <DataGridColumnHeader title="Date And Time" column={column} />,
        // cell: ({ row }) => <span className="leading-none font-medium text-sm text-gray-900">{row.original.name}</span>,
        cell: ({ row }) => {
          const timestamp = row.original.dateAndTime;
          const date = new Date(timestamp);
          return date.toLocaleString(); // Converts milliseconds to local date string
        },
        meta: {
          headerClassName: 'w-[180px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorKey: 'action',
        id: 'action',
        header: () => 'Action',
        enableSorting: false,
        cell: () => (
          <div className="flex items-center gap-2">
            <button className="btn btn-sm btn-icon btn-clear btn-light">
              <KeenIcon icon="notepad-edit" />
            </button>
          </div>
        ),
        meta: {
          headerClassName: 'w-[100px] text-center',
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
        <h3 className="card-title">Events</h3>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* <div className="flex gap-6">
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3"
              />
              <input
                type="text"
                placeholder="Search Events..."
                className="input input-sm ps-8"
                value={(table.getColumn('event_name')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn('event_name')?.setFilterValue(event.target.value)
                }
              />
            </div>
          </div> */}
          <DataGridColumnVisibility table={table} />
        </div>
      </div>
    );
  };

  const handleFetchData = async (data: TDataGridRequestParams) => {
    // console.log('data', data);
    const { pageIndex, pageSize } = data;
    const { agent, endDate, startDate, department, eventType } = filters;
    const payload: any = {
      companyId: user?.companyId,
      page: pageIndex + 1,
      size: pageSize
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

    const response = await ApiClient.get('/dashboard/events', { params: payload });

    const formattedData = response.data.data.hits.hits.map((item: any) => {
      return {
        event: item._id,
        description: item._source.rule.description,
        device: item._source.agent.name,
        level: item._source.rule.level,
        dateAndTime: item._source['@timestamp']
      };
    });

    return {
      data: formattedData,
      totalCount: response.data.total
    };
  };

  return (
    <DataGrid
      columns={columns}
      rowSelection={true}
      onRowSelectionChange={handleRowSelection}
      serverSide={true}
      onFetchData={handleFetchData}
      // sorting={[{ id: 'event_name', desc: true }]}
      toolbar={<Toolbar />}
      layout={{ card: true }}
      messages={{ loading: 'Loading...' }}
    />
  );
};

export { Event };
