import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import ApiClient from '@/utils/ApiClient';
import { useAuthContext } from '@/auth/useAuthContext';
import React, { useEffect } from 'react';

interface BasicSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: (newUser: any) => void;
}

const API_URL = import.meta.env.VITE_APP_API_URL;
const ORGANISATION_URL = `${API_URL}/organisation-users`;

type FormValues = typeof initialValues;

const initialValues = {
  name: '',
  email: '',
  role: 'User',
  resetPasswordOnLogin: true
};

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Must be a valid email address')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address')
    .required('Email is required'),
  role: Yup.string().oneOf(['User', 'Admin'], 'Invalid role').required('Role is required'),
  resetPasswordOnLogin: Yup.boolean().required('Reset Password is required')
});

const BasicSettings: React.FC<BasicSettingsProps> = ({ isOpen, onClose, onUserAdded }) => {
  const { currentUser } = useAuthContext();
  useEffect(() => {
    if (isOpen) {
      formik.resetForm();
    }
  }, [isOpen]);

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const userData = {
          name: values.name,
          email: values.email,
          role: values.role,
          companyId: currentUser?.companyId || null,
          resetPasswordOnLogin: !!values.resetPasswordOnLogin
        };

        const response = await ApiClient.post(ORGANISATION_URL, userData);
        toast.success('User added successfully');
        onUserAdded(response.data);
        onClose();
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to add user';
        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const borderColor = (field: keyof FormValues) => {
    if (formik.touched[field] && formik.errors[field]) {
      return 'border-red-500 focus:ring-red-500 hover:border-red-500';
    }
    return 'border-gray-300 focus:ring-gray-300 hover:border-gray-300';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={formik.handleSubmit} noValidate>
            <div className="w-full">
              <label className={`form-label ${borderColor('name')}`}>Name</label>
              <input
                className={`input ${borderColor('name')}`}
                type="text"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name && (
                <span className="text-red-500 text-sm">{formik.errors.name}</span>
              )}
            </div>

            <div className="w-full mt-3">
              <label className={`form-label ${borderColor('email')}`}>Email</label>
              <input
                className={`input ${borderColor('email')}`}
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <span className="text-red-500 text-sm">{formik.errors.email}</span>
              )}
            </div>

            <div className="w-full mt-3">
              <label className={`form-label ${borderColor('role')}`}>Role</label>
              <Select
                value={formik.values.role}
                onValueChange={(value) => formik.setFieldValue('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {formik.touched.role && formik.errors.role && (
                <span className="text-red-500 text-sm">{formik.errors.role}</span>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default BasicSettings;
