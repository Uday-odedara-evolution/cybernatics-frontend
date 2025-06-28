import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { DialogBody } from '@/components/ui/dialog';

type DepartmentModelProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  locationNewData: any;
};

export default function DepartmentModel({
  open,
  onClose,
  onSubmit,
  locationNewData
}: Readonly<DepartmentModelProps>) {
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState('');
  const [errors, setErrors] = useState({
    location: '',
    department: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      location: '',
      department: ''
    };

    if (!location) {
      newErrors.location = 'Please select a location';
      isValid = false;
    }

    if (!department.trim()) {
      newErrors.department = 'Please enter a department name';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      let data = { location: location, department: department };
      onSubmit(data);
      setLocation('');
      setDepartment('');
      setErrors({ location: '', department: '' });
      onClose();
    }
  };

  const handleCancel = () => {
    setLocation('');
    setDepartment('');
    setErrors({ location: '', department: '' });
    onClose();
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-3xl">
        <DialogTitle>Add Department</DialogTitle>
        <DialogBody>
          <div className="flex flex-col gap-3">
            <label className="form-label text-gray-900">Location</label>
            <select
              className={`input ${errors.location ? 'border-red-500' : ''}`}
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setErrors((prev) => ({ ...prev, location: '' }));
              }}
            >
              <option value="">Select a location</option>
              {locationNewData.map((loc: any) => (
                <option key={loc.id} value={loc.id}>
                  {loc.location}
                </option>
              ))}
            </select>
            {errors.location && <span className="text-red-500 text-sm">{errors.location}</span>}
          </div>
          <div className="flex flex-col gap-3 mt-2">
            <label className="form-label text-gray-900">Department</label>
            <input
              type="text"
              className={`input ${errors.department ? 'border-red-500' : ''}`}
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setErrors((prev) => ({ ...prev, department: '' }));
              }}
            />
            {errors.department && <span className="text-red-500 text-sm">{errors.department}</span>}
          </div>
          <div className="my-3">
            <button className="btn btn-primary mr-3" onClick={handleSubmit}>
              Submit
            </button>
            <button className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
