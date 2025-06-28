import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import ApiClient from '@/utils/ApiClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle
} from '@/components/ui/dialog';
import { Department, DeviceType } from '@/interface';
import { useLocation } from '@/store/store';

interface UpdateDeviceModalProps {
  isOpen: boolean;
  device: DeviceType;
  onClose: () => void;
  onUpdateSuccess: (data: DeviceType) => void;
}

const UpdateDeviceModal: React.FC<UpdateDeviceModalProps> = ({
  isOpen,
  device,
  onClose,
  onUpdateSuccess
}) => {
  const [formData, setFormData] = useState(device);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [departmentData, setDepartmentData] = useState<Department[]>([]);
  const { locations } = useLocation();

  useEffect(() => {
    setErrors({});
  }, [device]);

  useEffect(() => {
    if (isOpen) {
      setLocationAndDepartment();
    }
  }, [isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setLocationAndDepartment = () => {
    ApiClient.get(`/department/company/${device.companyId}`).then((res) => {
      if (res.data.length > 0) {
        const result = res.data.find((item: any) => item.id === device.companyLocationDepartmentId);
        if (result) {
          const { location } = result;
          setSelectedLocation(location.id.toString());
          fetchDepartmentsForLocation(location.id.toString(), true);
        }
      }
    });
  };

  const fetchDepartmentsForLocation = (locationId: string, setDefault: boolean = false) => {
    ApiClient.get(`/department/byLocation/${locationId}`)
      .then((response) => {
        setDepartmentData(response.data);
        if (setDefault) {
          setFormData((prev) => ({
            ...prev,
            companyLocationDepartmentId: device.companyLocationDepartmentId
          }));
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch departments:', error);
      });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) newErrors.name = 'Device name is required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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

  const handleUpdate = async () => {
    if (!validateForm()) return;

    const payload = {
      name: formData.name,
      email: formData.email,
      additionalDetail: formData.additionalDetail,
      companyLocationDepartmentId: formData.companyLocationDepartmentId
    };

    try {
      setLoading(true);
      const response = await ApiClient.put(`/device/${device.id}`, payload);
      toast.success('Device updated successfully');
      onUpdateSuccess(response.data);
      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Failed to update device', error);
      toast.error('Failed to update device');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Device</DialogTitle>
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
                value={formData.name || ''}
                onChange={handleChange}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Agent ID */}
            <div>
              <label className="form-label">Agent ID</label>
              <input
                className="input w-full"
                type="text"
                name="agentId"
                value={formData.id || ''}
                onChange={handleChange}
                readOnly
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="form-label">Email Address</label>
              <input
                className={`input w-full ${errors.email ? 'border-red-500' : ''}`}
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Download Link (Read-only) */}
            <div>
              <label className="form-label">Download Link</label>
              <input
                className="input w-full bg-gray-100"
                type="text"
                value={`https://s3dev.cybernatics.dev/${formData.id}.msi`}
                readOnly
              />
            </div>

            {/* Additional Details */}
            <div className="col-span-2">
              <label className="form-label">Additional Details</label>
              <textarea
                className="input w-full h-20 p-3"
                name="additionalDetail"
                value={formData.additionalDetail || ''}
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
                      key={`update-device-department-${item.department.id}`}
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
              onClick={handleUpdate}
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

export default UpdateDeviceModal;
