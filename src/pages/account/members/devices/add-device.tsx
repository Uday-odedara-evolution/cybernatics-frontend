import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle
} from '@/components/ui/dialog';
import ApiClient from '@/utils/ApiClient';
import { AddDevice, Department, Location, User } from '@/interface';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddedSuccess: (data: any) => void;
  locations: Location[] | null;
  user: User | null;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  isOpen,
  onClose,
  onAddedSuccess,
  locations,
  user
}) => {
  const [loading, setLoading] = useState(false);

  const initialFormData = {
    name: '',
    email: '',
    additionalDetail: '',
    companyLocationDepartmentId: 0
  };
  const [departmentData, setDepartmentData] = useState<Department[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const [formData, setFormData] = useState<AddDevice>(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
    } else {
      setFormData(initialFormData);
      setSelectedLocation('');
    }
  }, [isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Device name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!selectedLocation) {
      newErrors.location = 'Location is required';
    }
    if (formData.companyLocationDepartmentId === 0) {
      newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDeviceAdd = async () => {
    if (!validateForm()) return;

    const payload = {
      name: formData.name,
      email: formData.email,
      additionalDetail: formData.additionalDetail,
      companyId: user?.companyId,
      createdBy: user?.id,
      companyLocationDepartmentId: formData.companyLocationDepartmentId,
      orgUuid: user?.org_uuid,
      coyUuid: user?.coy_uuid
    };

    setLoading(true);
    ApiClient.post('/device', payload)
      .then((response) => {
        toast.success('Device added successfully');
        onAddedSuccess(response.data);
        onClose();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message ?? 'Failed to add device.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchDepartmentsForLocation = (locationId: string) => {
    ApiClient.get(`/department/byLocation/${locationId}`)
      .then((response) => {
        setDepartmentData(response.data);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch departments:', error);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Device</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-2 gap-4">
            {/* Device Name */}
            <div>
              <label className="form-label">Device Name</label>
              <input
                className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="form-label">Email Address</label>
              <input
                className={`input w-full ${errors.email ? 'border-red-500' : ''}`}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Additional Details */}
            <div className="col-span-2">
              <label className="form-label">Additional Details</label>
              <textarea
                className="input w-full h-20 p-3"
                name="additionalDetail"
                value={formData.additionalDetail}
                onChange={handleChange}
              />
            </div>

            {/* Location Dropdown */}
            <div>
              <label className="form-label">Location</label>
              <Select
                value={selectedLocation}
                onValueChange={(locationId) => {
                  setSelectedLocation(locationId);
                  fetchDepartmentsForLocation(locationId);
                }}
              >
                <SelectTrigger className={errors.location ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations?.map((item) => (
                    <SelectItem key={`add-device-location-${item.id}`} value={item.id.toString()}>
                      {item.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Department Dropdown */}
            <div>
              <label className="form-label">Department</label>
              <Select
                disabled={!selectedLocation}
                value={formData.companyLocationDepartmentId.toString()}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    companyLocationDepartmentId: Number(value)
                  }));
                }}
              >
                <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentData.map((item) => (
                    <SelectItem
                      key={`add-device-department-${item.department.id}`}
                      value={item.id.toString()}
                    >
                      {item.department.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-red-500 text-sm mt-1">{errors.department}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-4">
            <button className="btn btn-light" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={handleDeviceAdd}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default AddDeviceModal;
