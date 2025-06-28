'use client';

import type React from 'react';

import { type ChangeEvent, useEffect, useState } from 'react';
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
import { useAuthContext } from '@/auth/useAuthContext';
import * as Yup from 'yup';

interface UpdateUserModalProps {
  isOpen: boolean;
  user: any;
  onClose: () => void;
  onUpdateSuccess: (updatedUser: any) => void;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Must be a valid email address')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address')
    .required('Email is required'),
  role: Yup.string().oneOf(['User', 'Admin'], 'Invalid role').required('Role is required')
});

const UpdateUserModal: React.FC<UpdateUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onUpdateSuccess
}) => {
  const [formData, setFormData] = useState(user);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { currentUser } = useAuthContext();

  // Check if this is the organization creator
  const isOrgCreator = user.email === currentUser?.email;

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // If this is the org creator and trying to change email, don't allow it
    if (isOrgCreator && e.target.name === 'email') {
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      setErrors({});
      await validationSchema.validate(formData, { abortEarly: false });

      setLoading(true);
      const response = await ApiClient.put(`/organisation-users/${formData.id}`, formData);
      toast.success('User updated successfully');
      const updatedUser = response.data;
      onUpdateSuccess(updatedUser);
      onClose();
    } catch (err: any) {
      setLoading(false);
      if (err.name === 'ValidationError') {
        const newErrors: { [key: string]: string } = {};
        err.inner.forEach((e: any) => {
          newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      } else {
        toast.error('Failed to update user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="w-full">
            <label className="form-label">Name</label>
            <input
              className="input"
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="w-full mt-3">
            <label className="form-label">Email</label>
            <input
              className="input"
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              disabled={isOrgCreator}
              style={isOrgCreator ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            {isOrgCreator && (
              <p className="text-gray-500 text-sm mt-1">
                Email cannot be changed for organization creator
              </p>
            )}
          </div>

          <div className="w-full mt-3">
            <label className="form-label">Role</label>
            <Select
              value={formData.role || ''}
              onValueChange={(value) => {
                if (!isOrgCreator) {
                  setFormData({ ...formData, role: value });
                }
              }}
              disabled={isOrgCreator}
            >
              <SelectTrigger
                style={isOrgCreator ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
            {isOrgCreator && (
              <p className="text-gray-500 text-sm mt-1">
                Role cannot be changed for organization creator
              </p>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <button className="btn btn-light" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleUpdate} disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="loader" /> Updating...
                </span>
              ) : (
                'Update'
              )}
            </button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateUserModal;
