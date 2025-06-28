import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import React, { useState } from 'react';
import { DialogBody } from '@/components/ui/dialog';

type LocationModelProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (location: string) => void;
};
function LocationModel({ open, onClose, onSubmit }: LocationModelProps) {
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = () => {
    if (location.trim() !== '') {
      onSubmit(location);
      setLocation(''); // Clear after submit
      onClose(); // Close modal
    } else {
      setErrors({ location: 'Location is required' });
    }
  };

  const handleCancel = () => {
    setLocation('');
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    setErrors({ location: '' });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-3xl">
        <DialogTitle>Add Location</DialogTitle>
        <DialogBody>
          <label className="form-label text-gray-900">Location</label>
          <div className="flex flex-col gap-1 mb-5">
            <input
              type="text"
              className={`input ${errors.location ? 'border-red-500' : ''}`}
              value={location}
              onChange={handleChange}
            />
            {errors.location && <span className="text-red-500 text-sm">{errors.location}</span>}
          </div>
          <button className="btn btn-primary mr-3" onClick={handleSubmit}>
            Submit
          </button>
          <button className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export default LocationModel;
