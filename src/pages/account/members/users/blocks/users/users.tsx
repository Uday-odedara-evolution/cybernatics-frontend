import { useEffect, useMemo, useState } from 'react';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
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
import ApiClient from '@/utils/ApiClient';
import DeleteModal from '../../delete-model';
import UpdateUserModal from '../../update-user';
import { Tooltip } from 'react-tooltip';
import { useUser } from '@/store/store';
interface ITeamData {
  id: number;
  name: string;
  email: string;
  role: string;
  organisations?: { role: string }[];
}

const Users = ({ refetch }: { refetch: any }) => {
  // const storageFilterId = 'teams-filter';
  const [userData, setUserData] = useState<ITeamData[]>([]);
  // const [filteredData, setFilteredData] = useState<ITeamData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // const [searchTerm, setSearchTerm] = useState(localStorage.getItem(storageFilterId) || '');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ITeamData | null>(null);
  const { user } = useUser();

  const fetchUsers = async (companyId: number) => {
    setLoading(true);
    try {
      const response = await ApiClient.get(`/organisation-users/${companyId}`);
      const [formattedData] = response.data.map((item: any) => {
        const { users } = item;
        return users.map((item2: any, index: number) => ({
          ...item2.user,
          role: users[index].role
        }));
      });
      setUserData(formattedData);
      // console.log('formattedData', formattedData);
      // setFilteredData(formattedData);
    } catch {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Users';
  }, []);

  useEffect(() => {
    if (user?.companyId) {
      fetchUsers(user.companyId);
    }
  }, [user?.companyId, refetch]);

  const handleEditUser = (user: ITeamData) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUpdateSuccess = (updatedUser: any) => {
    if (user?.companyId) {
      fetchUsers(user.companyId);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (user: ITeamData) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (selectedUser === null) return;

    try {
      await ApiClient.delete(`/organisation-users/${selectedUser.id}`);
      toast.success('User deleted successfully');
      setUserData((prevData) => prevData.filter((user) => user.id !== selectedUser.id));
    } catch {
      toast.error('Failed to delete user');
    }
    setIsDeleteModalOpen(false);
  };

  const handleInviteUser = (email: string) => {
    ApiClient.post('/organisation-users/invite', { email })
      .then((res) => {
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const columns = useMemo<ColumnDef<ITeamData>[]>(
    () => [
      {
        accessorKey: 'id',
        header: () => <DataGridRowSelectAll />,
        cell: ({ row }) => <DataGridRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: 'w-0' }
      },
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => <DataGridColumnHeader title="Name" column={column} />,
        enableSorting: true,
        cell: ({ row }) => (
          <span className="leading-none font-medium text-sm text-gray-900">
            {row.original.name}
          </span>
        ),
        meta: { headerClassName: 'min-w-[200px]' }
      },
      {
        accessorKey: 'email',
        id: 'email',
        header: ({ column }) => <DataGridColumnHeader title="Email Address" column={column} />,
        enableSorting: true,
        cell: ({ row }) => <p className="text-gray-900 hover:text-primary">{row.original.email}</p>,
        meta: { headerClassName: 'w-[200px]' }
      },
      {
        accessorKey: 'role',
        id: 'role',
        header: ({ column }) => <DataGridColumnHeader title="User Role" column={column} />,
        enableSorting: true,
        cell: ({ row }) => <span className="text-gray-700">{row.original.role}</span>,
        meta: { headerClassName: 'w-[150px]' }
      },
      {
        id: 'actions',
        header: 'Action',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              onClick={() => handleInviteUser(row.original.email)}
              data-tooltip-id="notification"
              data-tooltip-content="Invite user"
            >
              <KeenIcon icon="notification-status" />
              <Tooltip id="notification" />
            </button>
            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              onClick={() => handleEditUser(row.original)}
              data-tooltip-id="edit"
              data-tooltip-content="Edit"
            >
              <KeenIcon icon="notepad-edit" />
              <Tooltip id="edit" />
            </button>
            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              onClick={() => handleDeleteClick(row.original)}
              disabled={row.original.id === user?.id}
              style={row.original.id === user?.id ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              data-tooltip-id="trash"
              data-tooltip-content="Delete"
            >
              <KeenIcon icon="trash" />
              <Tooltip id="trash" />
            </button>
          </div>
        ),
        meta: { headerClassName: 'w-[150px]', cellClassName: 'text-center' }
      }
    ],
    []
  );

  const handleRowSelection = (state: RowSelectionState) => {
    const selectedRowIds = Object.keys(state);
    if (selectedRowIds.length > 0) {
      toast(`Total ${selectedRowIds.length} users selected.`, {
        description: `Selected row IDs: ${selectedRowIds.join(', ')}`,
        action: { label: 'Undo', onClick: () => {} }
      });
    }
  };

  const Toolbar = () => {
    const { table } = useDataGrid();

    return (
      <div className="card-header flex-wrap px-5 py-5 border-b-0">
        <h3 className="card-title">Users</h3>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex gap-6">
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3"
              />
              <input
                type="text"
                placeholder="Search User"
                className="input input-sm ps-8"
                value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
              />
            </div>
          </div>
          <DataGridColumnVisibility table={table} />
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteUser}
          message={`Are you sure you want to delete ${selectedUser?.name} (${selectedUser?.email})?`}
        />
        {isModalOpen && selectedUser && (
          <UpdateUserModal
            isOpen={isModalOpen}
            user={selectedUser}
            onClose={() => setIsModalOpen(false)}
            onUpdateSuccess={handleUpdateSuccess}
          />
        )}
      </div>
    );
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <DataGrid
      columns={columns}
      data={userData}
      rowSelection
      onRowSelectionChange={handleRowSelection}
      pagination={{ size: 10 }}
      sorting={[{ id: 'name', desc: false }]}
      toolbar={<Toolbar />}
      layout={{ card: true }}
    />
  );
};
export { Users };
