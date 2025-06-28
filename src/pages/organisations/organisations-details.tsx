import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Alert } from '@/components';
import { getAuth, useAuthContext } from '@/auth';
import ApiClient from '@/utils/ApiClient';

const initialValues = {
  organisationLocation: '',
  organisationDepartment: ''
};

type InputValueTypes = {
  organisationLocation: string;
  organisationDepartment: string;
};

const signupSchema = Yup.object().shape({
  organisationLocation: Yup.string()
    .min(3, 'Minimum 3 characters')
    .max(50, 'Maximum 100 characters')
    .required('Organisation Location is required'),
  organisationDepartment: Yup.string()
    .min(2, 'Minimum 2 characters')
    .max(50, 'Maximum 50 characters')
    .required('Organisation Department is required')
});
const API_URL = import.meta.env.VITE_APP_API_URL;
export const organisationPostURL = `${API_URL}/organisations`;

const OrganisationsDetail = () => {
  // ... existing state and hooks declarations remain the same ...
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const { currentUser } = useAuthContext();
  const [initialFormValues, setInitialFormValues] = useState(initialValues);

  const handleSubmit = (values: InputValueTypes) => {
    setLoading(true);

    const storedAuth = getAuth();
    if (!storedAuth?.access_token) {
      throw new Error('No auth token found');
    }
    const savedData = localStorage.getItem('organisationForm');
    const formData = savedData ? JSON.parse(savedData) : {};
    const data = {
      ...formData,
      organisationLocation: values.organisationLocation,
      organisationDepartment: values.organisationDepartment
    };
    ApiClient.post('/organisations', { data })
      .then(async (res) => {
        if (currentUser) {
          currentUser.organisationId = res.data?.id;
        }
        localStorage.setItem('organisationForm2', JSON.stringify(values));

        const { organisation } = res.data;
        addLocation(values, organisation.id);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  const addLocation = (values: InputValueTypes, organisationId: number) => {
    ApiClient.post('/location', { location: values.organisationLocation, organisationId })
      .then(async (res) => {
        const { LocationData } = res.data;
        addDepartment(values, LocationData.organisationId, LocationData.id);
      })
      .catch(() => {});
  };

  const addDepartment = (values: InputValueTypes, organisationId: number, locationId: number) => {
    ApiClient.post('/department', { department: values.organisationDepartment, organisationId })
      .then((response) => {
        const companyDepartmentData = {
          departmentId: response?.data?.department?.id,
          locationId,
          companyId: organisationId
        };
        addFinalDepartment(companyDepartmentData);
      })
      .catch(() => {});
  };

  const addFinalDepartment = (companyDepartmentData: any) => {
    ApiClient.post(`/department/company`, companyDepartmentData)
      .then(() => {
        localStorage.removeItem('organisationForm');
        localStorage.removeItem('organisationForm2');
        navigate('/dashboard', { state: { from } });
      })
      .catch(() => {});
  };

  useEffect(() => {
    const previousData = localStorage.getItem('organisationForm');

    if (currentUser) {
      if (currentUser.organisationId !== null) {
        navigate('/dashboard');
        return;
      }
    }
    if (currentUser && !previousData) {
      navigate('/organisations-step-1');
      return;
    }
    if (!currentUser && !previousData) {
      navigate('/auth/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const savedData = localStorage.getItem('organisationForm2');
    if (savedData) {
      setInitialFormValues(JSON.parse(savedData));
    }
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialFormValues,
    validationSchema: signupSchema,
    onSubmit: handleSubmit
  });

  const borderColor = (field: keyof InputValueTypes) => {
    if (formik.touched[field] && formik.errors[field]) {
      return 'border-red-500 focus:ring-red-500 hover:border-red-500';
    }
    return 'border-gray-300 focus:ring-gray-300 hover:border-gray-300';
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="items-center justify-center w-full">
      <div className="card flex items-center justify-center">
        <form
          className="card-body flex flex-col gap-5 p-10"
          noValidate
          onSubmit={formik.handleSubmit}
        >
          <img src="/media/app/newlogo.png" alt="logo" className="w-[400px] justify-center" />
          <div className="text-center mb-2.5">
            <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">
              Getting there...
            </h3>
            <div className="flex items-center justify-center font-medium">
              <span className="text-2sm text-gray-600 me-1.5">
                Please enter your Organisation location and department.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="border-t border-gray-200 w-full"></span>
            <span className="border-t border-gray-200 w-full"></span>
          </div>

          {formik.status && <Alert variant="danger">{formik.status}</Alert>}

          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900">
              Organisation Location<span className="text-red-500">*</span>
            </label>
            <label className={`input ${borderColor('organisationLocation')}`}>
              <input
                placeholder="Organisation Location"
                type="Organisation Location"
                autoComplete="off"
                {...formik.getFieldProps('organisationLocation')}
              />
            </label>
            {formik.touched.organisationLocation && formik.errors.organisationLocation && (
              <span role="alert" className="text-danger text-xs mt-1">
                {formik.errors.organisationLocation}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900">
              Organisation Department<span className="text-red-500">*</span>
            </label>
            <label className={`input ${borderColor('organisationDepartment')}`}>
              <input
                placeholder="Organisation Department"
                type="Organisation Department"
                autoComplete="off"
                {...formik.getFieldProps('organisationDepartment')}
              />
            </label>
            {formik.touched.organisationDepartment && formik.errors.organisationDepartment && (
              <span role="alert" className="text-danger text-xs mt-1">
                {formik.errors.organisationDepartment}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <button
              type="submit"
              className="btn btn-primary flex justify-center grow"
              disabled={loading || formik.isSubmitting}
            >
              {loading ? 'Please wait...' : 'Save'}
            </button>
          </div>
          {/* Existing terms checkbox and submit button remain the same */}
        </form>
      </div>
    </div>
  );
};
export { OrganisationsDetail };
