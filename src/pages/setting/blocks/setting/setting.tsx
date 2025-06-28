import { DataGrid, KeenIcon } from '@/components';
import ApiClient from '@/utils/ApiClient';
import { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const DepartmentLocation = (props: any) => {
  const [departmentData, setDepartmentData] = useState<Department[]>([]);

  const handleDelete = (id: number) => {
    ApiClient.delete(`/department/${id}`)
      .then((res) => {
        toast.success(res.data.message);
        window.dispatchEvent(new Event('departmentListShouldRefresh'));
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message ?? 'Unable to delete');
      });
  };

  useEffect(() => {
    setDepartmentData(props.department);
  }, [props.department, departmentData]);

  type Department = {
    id: number;
    location: string;
    department: string;
  };
  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: 'location',
      header: 'Location'
    },
    {
      accessorKey: 'department',
      header: 'Department'
    },
    {
      id: 'actions',
      header: 'Action',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            className="btn btn-sm btn-icon btn-clear btn-light"
            onClick={() => handleDelete(row.original.id)}
          >
            <KeenIcon icon="trash" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="mt-7">
      <DataGrid data={departmentData} columns={columns} />
    </div>
  );
};
export { DepartmentLocation };
