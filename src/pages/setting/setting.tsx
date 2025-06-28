import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Container } from '@/components/container';
import { DepartmentLocation } from './blocks';
import ApiClient from '@/utils/ApiClient';
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid, KeenIcon } from '@/components';
import LocationModel from './LocationModel';
import DepartmentModel from './DepartmentModel';
import { useUser } from '@/store/store';

type Department = {
  id: number;
  location: string;
  department: string;
};

type Location = {
  id: number;
  location: string;
  organisationId: number;
};

const Setting = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'setting' | 'locations' | 'department'>('setting');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationData, SetLocationData] = useState<Location[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDepartmentModelOpen, setIsDepartmentModelOpen] = useState(false);
  const [departmentData, setDepartmentData] = useState<Department[]>([]);

  const [organisation, setOrganisation] = useState({
    org_name: '',
    name: '',
    address_one: '',
    address_two: '',
    postal_code: '',
    contact_number: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    address_one: '',
    address_two: '',
    postal_code: '',
    contact_number: ''
  });

  const getDepartment = (id: number) => {
    ApiClient.get(`/department/company/${id}`).then((res) => {
      const simplifiedData = res.data.map((item: any) => ({
        id: item.id,
        location: item.location.location,
        department: item.department.department
      }));
      setDepartmentData(simplifiedData);
    });
  };

  useEffect(() => {
    const handleRefresh = () => {
      if (user?.companyId) {
        getDepartment(user.companyId);
      }
    };

    window.addEventListener('departmentListShouldRefresh', handleRefresh);

    return () => {
      window.removeEventListener('departmentListShouldRefresh', handleRefresh);
    };
  }, [user]);

  const getLocations = (orgId: number) => {
    ApiClient.get(`/location/${orgId}`).then((res) => {
      SetLocationData(res.data);
    });
  };

  useEffect(() => {
    if (user) {
      getLocations(user.organisationId);
      getDepartment(user.companyId);
      fetchOrganization(user.org_uuid);
    }
  }, [user]);

  useEffect(() => {
    document.title = 'Setting';
  }, []);

  const validate = () => {
    let newErrors = {
      name: '',
      address_one: '',
      address_two: '',
      postal_code: '',
      contact_number: ''
    };
    let isValid = true;

    if (!organisation.name.trim()) {
      newErrors.name = 'Company name is required';
      isValid = false;
    }

    if (!organisation.address_one.trim()) {
      newErrors.address_one = 'Billing address 1 is required';
      isValid = false;
    }
    if (!organisation.address_two.trim()) {
      newErrors.address_two = 'Billing address 2 is required';
      isValid = false;
    }

    if (!/^\d{3,20}$/.test(organisation.postal_code)) {
      newErrors.postal_code = 'Postal code must be between 3–20 digits';
      isValid = false;
    }

    if (!organisation.contact_number || !isValidPhoneNumber(organisation.contact_number)) {
      newErrors.contact_number = 'Enter a valid phone number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  async function handleAddNewClick() {
    if (activeTab === 'locations') {
      setIsLocationModalOpen(true);
    }

    if (activeTab === 'department') {
      setIsDepartmentModelOpen(true);
    }
  }

  const fetchOrganization = async (uuid: string) => {
    // Fetch organization details from API
    await ApiClient.get(`/organisations/${uuid}`)
      .then((response) => {
        const orgData = response.data;
        // Extract first company (assuming at least one exists)
        const firstCompany = orgData.companies?.length > 0 ? orgData.companies[0] : {};

        // Set state with correct data structure
        setOrganisation({
          org_name: orgData.name || '',
          name: firstCompany.name || '',
          address_one: firstCompany.addressOne || '',
          address_two: firstCompany.addressTwo || '',
          postal_code: firstCompany.postalCode || '',
          contact_number: firstCompany.contactNumber || ''
        });
      })
      .catch(() => {});
  };

  const handleEditToggle = async () => {
    if (!user?.organisationId) return;
    if (isEditing) {
      const isValid = validate();
      if (!isValid) return;
      setLoading(true); // Start loader

      await ApiClient.put(`/organisations/${user.coy_uuid}`, organisation)
        .then(() => {
          toast.success('Company updated successfully');
        })
        .catch(() => {
          toast.error('An error occurred while saving the changes');
        })
        .finally(() => {
          setLoading(false); // Stop loader
        });
    }
    setIsEditing(!isEditing);
  };
  const handleDeleteUser = (locId: number) => {
    ApiClient.delete(`/location/${locId}`)
      .then((res) => {
        toast.success(res.data.message);
        if (user?.organisationId) {
          getLocations(user?.organisationId);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message ?? 'Unable to delete');
      });
  };

  const handleAddLocation = (locationData: any) => {
    const data = { location: locationData, organisationId: user?.organisationId };
    ApiClient.post(`/location`, data)
      .then(() => {
        if (user?.organisationId) {
          getLocations(user.organisationId);
        }
        toast.success('Location added successfully');
        setIsLocationModalOpen(false);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message ?? 'Unable to add the location');
      });
  };

  const handleAddDepartment = (departmentData: any) => {
    const data = { department: departmentData?.department, organisationId: user?.organisationId };
    ApiClient.post(`/department`, data)
      .then((response) => {
        const locationId = departmentData.location;
        const companyDepartmentData = {
          departmentId: response?.data?.department?.id,
          locationId,
          companyId: user?.companyId
        };

        ApiClient.post(`/department/company`, companyDepartmentData)
          .then((res) => {
            getDepartment(res?.data?.response.companyId);
            toast.success('Department Location Added Successfully');
          })
          .catch(() => {
            toast.error('Unable to add department!');
          });
      })
      .catch(() => {
        toast.error('Unable to add department');
      });
  };

  const columns: ColumnDef<Location>[] = [
    {
      accessorKey: 'location',
      header: 'Location'
    },
    {
      id: 'actions',
      header: 'Action',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            className="btn btn-sm btn-icon btn-clear btn-light"
            onClick={() => handleDeleteUser(row.original.id)}
          >
            <KeenIcon icon="trash" />
          </button>
        </div>
      )
      //  meta: { headerClassName: 'w-[150px]', cellClassName: 'text-center' }
    }
  ];

  return (
    <div className="relative w-full rounded-lg shadow-sm overflow-hidden">
      {/* Navigation */}
      <div className="flex items-center justify-between pb-2 p-3 mr-5">
        {/* Navigation Tabs (Left Aligned) */}
        <div className="flex space-x-6 ml-5">
          <span
            className={`cursor-pointer pb-2 text-lg font-medium ${
              activeTab === 'setting'
                ? 'border-b-2 border-primary text-primary'
                : 'text-black-100 hover:primary'
            }`}
            onClick={() => setActiveTab('setting')}
          >
            Settings
          </span>
          <span
            className={`cursor-pointer pb-2 text-lg font-medium ${
              activeTab === 'locations'
                ? 'border-b-2 border-primary text-primary'
                : 'text-black-100 hover:primary'
            }`}
            onClick={() => setActiveTab('locations')}
          >
            Locations
          </span>
          <span
            className={`cursor-pointer pb-2 text-lg font-medium ${
              activeTab === 'department'
                ? 'border-b-2 border-primary text-primary'
                : 'text-black-100 hover:primary'
            }`}
            onClick={() => setActiveTab('department')}
          >
            Location and Department Settings
          </span>
        </div>
        {/* Button (Only visible when 'department' tab is active) */}
        {(activeTab === 'department' || activeTab === 'locations') && (
          <button
            onClick={handleAddNewClick}
            className="btn btn-sm btn-primary w-32 h-10 flex items-center justify-center"
          >
            Add New
          </button>
        )}
      </div>
      {/* Content */}

      {activeTab === 'locations' && (
        <Container className="mt-7">
          <DataGrid data={locationData} columns={columns} />
        </Container>
      )}

      {isLocationModalOpen && (
        <LocationModel
          open={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onSubmit={handleAddLocation}
        />
      )}

      {isDepartmentModelOpen && (
        <DepartmentModel
          open={isDepartmentModelOpen}
          onClose={() => {
            setIsDepartmentModelOpen(false);
          }}
          onSubmit={handleAddDepartment}
          locationNewData={locationData}
        />
      )}

      {activeTab === 'setting' && (
        <Container>
          <div className="items-center w-full">
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4" noValidate>
              {/* Organisation Name (Read-Only) */}
              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Organisation Name</label>
                <input type="text" className="input" value={organisation.org_name} readOnly />
              </div>

              {/* Organisation Company */}
              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Company Name</label>
                <input
                  type="text"
                  className="input"
                  value={organisation.name}
                  readOnly={!isEditing}
                  onChange={(e) => setOrganisation({ ...organisation, name: e.target.value })}
                />
                {errors.name && <span className="text-danger text-xs mt-1">{errors.name}</span>}
              </div>

              {/* Billing Address 1 */}
              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Billing Address 1</label>
                <input
                  type="text"
                  className="input"
                  value={organisation.address_one}
                  readOnly={!isEditing}
                  onChange={(e) =>
                    setOrganisation({ ...organisation, address_one: e.target.value })
                  }
                />
                {errors.address_one && (
                  <span className="text-danger text-xs mt-1">{errors.address_one}</span>
                )}
              </div>

              {/* Billing Address 2 */}
              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Billing Address 2</label>
                <input
                  type="text"
                  className="input"
                  value={organisation.address_two}
                  readOnly={!isEditing}
                  onChange={(e) =>
                    setOrganisation({ ...organisation, address_two: e.target.value })
                  }
                />
                {errors.address_two && (
                  <span className="text-danger text-xs mt-1">{errors.address_two}</span>
                )}
              </div>

              {/* Postal Code */}
              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Postal Code</label>
                <input
                  type="text"
                  className="input"
                  value={organisation.postal_code}
                  readOnly={!isEditing}
                  onChange={(e) =>
                    setOrganisation({
                      ...organisation,
                      postal_code: e.target.value.replace(/[^0-9]/g, '')
                    })
                  }
                />
                {errors.postal_code && (
                  <span className="text-danger text-xs mt-1">{errors.postal_code}</span>
                )}
              </div>

              {/* Contact Number */}
              <div className="flex flex-col gap-1">
                <label className="form-label text-gray-900">Contact Number</label>
                <PhoneInput
                  international
                  defaultCountry="US" // or set dynamically
                  className="input"
                  value={organisation.contact_number}
                  disabled={!isEditing}
                  onChange={(value) =>
                    setOrganisation({ ...organisation, contact_number: value || '' })
                  }
                />
                {errors.contact_number && (
                  <span className="text-danger text-xs mt-1">{errors.contact_number}</span>
                )}
              </div>

              {/* Submit Button */}
              <div className="col-span-1 sm:col-span-2 flex max-w-[100px] mb-3">
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="btn btn-primary w-full h-10 flex items-center justify-center"
                >
                  {/* {isEditing ? "Save" : "Edit"} */}
                  {loading ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
                </button>
              </div>
            </form>
          </div>
        </Container>
      )}

      {activeTab === 'department' && (
        <Container>
          <DepartmentLocation department={departmentData} />
        </Container>
      )}
    </div>
  );
};

export { Setting };
