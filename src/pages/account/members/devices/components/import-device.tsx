import React, { useState } from 'react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ApiClient from '@/utils/ApiClient';
import LoadingSpinner from '@/assets/svg/LoadingSpinner';
import { User } from '@/interface';
import { Link } from 'react-router-dom';

interface ImportDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
  locations: Array<{ id: number; location: string }>;
  user: User | null;
}

const downloadUrl = `${import.meta.env.VITE_APP_API_URL}/device/sample-csv`;

export const ImportDeviceModal = ({
  isOpen,
  onClose,
  onImportSuccess,
  locations,
  user
}: ImportDeviceModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const fetchDepartmentsForLocation = (locationId: string) => {
    ApiClient.get(`/department/byLocation/${locationId}`)
      .then((response) => {
        setDepartments(response.data);
      })
      .catch(() => {
        toast.error('Failed to fetch departments');
      });
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    setSelectedDepartment('');
    fetchDepartmentsForLocation(value);
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedLocation || !selectedDepartment) {
      toast.error('Please select all required fields');
      return;
    }

    if (!user?.coy_uuid || !user?.companyId || !user?.id || !user?.org_uuid) {
      toast.error('User information not found');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('coyUuid', user.coy_uuid);
    formData.append('companyId', user.companyId.toString());
    formData.append('createdBy', user.id.toString());
    formData.append('orgUuid', user.org_uuid);
    formData.append('companyLocationDepartmentId', selectedDepartment);

    setIsLoading(true);
    try {
      await ApiClient.post('/device/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Devices imported successfully');
      onImportSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to import devices');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Devices</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div>
              <label className="form-label">Upload CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="input py-2.5 h-auto"
              />
            </div>

            <div className="flex items-center !mt-1">
              <Link
                to={downloadUrl}
                className="text-xs text-blue-500 hover:text-primary-active underline"
                download
              >
                Download sample CSV template
              </Link>
            </div>

            <div>
              <label className="form-label">Location</label>
              <Select value={selectedLocation} onValueChange={handleLocationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations?.map((item) => (
                    <SelectItem key={`location-${item.id}`} value={item.id.toString()}>
                      {item.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="form-label">Department</label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
                disabled={!selectedLocation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((item) => (
                    <SelectItem key={`department-${item.id}`} value={item.id.toString()}>
                      {item.department.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    <span>Importing...</span>
                  </>
                ) : (
                  'Import'
                )}
              </Button>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
