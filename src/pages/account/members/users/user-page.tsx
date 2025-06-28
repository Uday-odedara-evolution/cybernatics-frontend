import { Fragment, useState } from 'react';
import { Container } from '@/components/container';
import { Toolbar } from '@/partials/toolbar';
import { useLayout } from '@/providers';
import BasicSettings from './add-user-model';
import { Users } from './blocks/users';
import ImportUserModal from './components/import-user-modal';

const UserPage = () => {
  const { currentLayout } = useLayout();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refetchFlag, setRefetchFlag] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const handleAddUserClick = () => {
    setIsModalOpen(true);
  };
  const handleUserAdded = () => {
    setRefetchFlag((prev) => !prev); // Trigger a refetch
  };

  return (
    <Fragment>
      {/* <PageNavbar /> */}
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <div className="flex items-center gap-4.5 pt-2">
              {/* <button className="btn btn-sm btn-primary w-32 h-10 flex items-center justify-center">
                Export
              </button> 
              */}
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="btn btn-sm btn-primary w-32 h-10 flex items-center justify-center"
              >
                Import
              </button>
              <button
                onClick={handleAddUserClick}
                className="btn btn-sm btn-primary w-32 h-10 flex items-center justify-center"
              >
                Add New User
              </button>
            </div>
          </Toolbar>
        </Container>
      )}

      <Container>
        <div className="grid gap-5 lg:gap-7.5">
          <Users refetch={refetchFlag} />
        </div>
      </Container>

      {/* Modal for Adding a User */}
      <BasicSettings
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserAdded={handleUserAdded}
      />

      <ImportUserModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onUsersImported={handleUserAdded}
      />
    </Fragment>
  );
};

export { UserPage };
