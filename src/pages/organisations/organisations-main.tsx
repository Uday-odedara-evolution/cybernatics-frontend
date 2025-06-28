import clsx from 'clsx';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Alert } from '@/components';
import { useAuthContext } from '@/auth';
import { countries } from './country';
import { countryCode } from './country-code';
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';

const initialValues = {
  organisationName: '',
  companyName: '',
  email: '',
  orgAddressOne: '',
  orgAddressTwo: '',
  postalCode: '',
  country: '',
  contact: '',
  countryCode: '+65'
};

const OrganisationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Must be a valid email address')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address')
    .required('Email is required'),
  organisationName: Yup.string()
    .min(3, 'Minimum 3 characters')
    .max(50, 'Maximum 50 characters')
    .required('Organisation name is required'),
  companyName: Yup.string()
    .min(3, 'Minimum 3 characters')
    .max(50, 'Maximum 50 characters')
    .required('Company name is required'),
  orgAddressOne: Yup.string()
    .min(3, 'Minimum 3 characters')
    .max(50, 'Maximum 100 characters')
    .required('Organisation address one is required'),
  // orgAddressTwo: Yup.string()
  //     .min(3, 'Minimum 3 characters')
  //     .max(50, 'Maximum 100 characters')
  //     .required('Organisation Address two is required'),
  postalCode: Yup.string()
    .matches(/^[0-9]+$/, 'Postal code must contain only numbers')
    .required('Postal code is required'),
  country: Yup.string().required('Country is required'),
  contact: Yup.string()
    .test('is-valid-phone', 'Please enter a valid phone number', (value) => {
      // Import the isValidPhoneNumber function at the top of your file

      // If empty, return false (required is handled by .required())
      if (!value) return false;
      // Check if the phone number is valid
      return isValidPhoneNumber(value);
    })
    .required('Contact number is required'),
  countryCode: Yup.string().required('Country code is required')
});

type FormValues = typeof initialValues;

const Organisations = () => {
  // ... existing state and hooks declarations remain the same ...
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [initialFormValues, setInitialFormValues] = useState(initialValues);
  const { currentUser } = useAuthContext();

  useEffect(() => {
    const savedData = localStorage.getItem('organisationForm');
    const nextData = localStorage.getItem('organisationForm2');

    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    if (currentUser) {
      if (currentUser.organisationId !== null) {
        navigate('/dashboard');
        return;
      }
    }
    if (currentUser && savedData && !nextData) {
      navigate('/organisations-step-2');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const savedData = localStorage.getItem('organisationForm');
    if (savedData) {
      setInitialFormValues(JSON.parse(savedData));
    }
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialFormValues,
    validationSchema: OrganisationSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        localStorage.setItem('organisationForm', JSON.stringify(values));
        navigate('/organisations-step-2');
      } catch (error) {
        console.error(error);
        setStatus('The sign up details are incorrect');
        setSubmitting(false);
        setLoading(false);
      }
    }
  });

  const borderColor = (field: keyof FormValues) => {
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
              Let ’s Get Started
            </h3>
            <div className="flex items-center justify-center font-medium">
              <span className="text-2sm text-gray-600 me-1.5">
                We'll make sure you're set up correctly. Please enter your Organisation details.
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
              Organisation Name<span className="text-red-500">*</span>
            </label>
            <label className={`input ${borderColor('organisationName')}`}>
              <input
                placeholder="Organisation Name"
                type="Organisation Name"
                autoComplete="off"
                {...formik.getFieldProps('organisationName')}
              />
            </label>
            {formik.touched.organisationName && formik.errors.organisationName && (
              <span role="alert" className="text-danger text-xs mt-1">
                {formik.errors.organisationName}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900">
              Company Name<span className="text-red-500">*</span>
            </label>
            <label className={`input ${borderColor('companyName')}`}>
              <input
                placeholder="Company Name"
                type="Company Name"
                autoComplete="off"
                {...formik.getFieldProps('companyName')}
              />
            </label>
            {formik.touched.companyName && formik.errors.companyName && (
              <span role="alert" className="text-danger text-xs mt-1">
                {formik.errors.companyName}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900">
              Email Address<span className="text-red-500">*</span>
            </label>
            <label className={`input ${borderColor('email')}`}>
              <input
                placeholder="Email Address"
                type="Email Address"
                autoComplete="off"
                {...formik.getFieldProps('email')}
              />
            </label>
            {formik.touched.email && formik.errors.email && (
              <span role="alert" className="text-danger text-xs mt-1">
                {formik.errors.email}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900">
              Billing Address 1<span className="text-red-500">*</span>
            </label>
            <label className={`input ${borderColor('orgAddressOne')}`}>
              <input
                placeholder="Organisation Address 1"
                type="Organisation Address 1"
                autoComplete="off"
                {...formik.getFieldProps('orgAddressOne')}
                className={clsx(
                  'form-control bg-transparent',
                  { 'is-invalid': formik.touched.orgAddressOne && formik.errors.orgAddressOne },
                  { 'is-valid': formik.touched.orgAddressOne && !formik.errors.orgAddressOne }
                )}
              />
            </label>
            {formik.touched.orgAddressOne && formik.errors.orgAddressOne && (
              <span role="alert" className="text-danger text-xs mt-1">
                {formik.errors.orgAddressOne}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="form-label text-gray-900">Billing Address 2</label>
            <label className={`input ${borderColor('orgAddressTwo')}`}>
              <input
                placeholder="Organisation Address 2"
                type="Organisation Address 2"
                autoComplete="off"
                {...formik.getFieldProps('orgAddressTwo')}
                className={clsx(
                  'form-control bg-transparent',
                  { 'is-invalid': formik.touched.orgAddressTwo && formik.errors.orgAddressTwo },
                  { 'is-valid': formik.touched.orgAddressTwo && !formik.errors.orgAddressTwo }
                )}
              />
            </label>
            {/* {formik.touched.orgAddressTwo && formik.errors.orgAddressTwo && (
                            <span role="alert" className="text-danger text-xs mt-1">
                                {formik.errors.orgAddressTwo}
                            </span>
                        )} */}
          </div>
          <div className="flex gap-4">
            {/* Postal Code Field */}
            <div className="flex flex-col gap-1 w-1/3">
              <label className="form-label text-gray-900">
                Postal Code<span className="text-red-500">*</span>
              </label>
              <label className={`input ${borderColor('postalCode')}`}>
                <input
                  placeholder="Postal Code"
                  type="text"
                  autoComplete="off"
                  {...formik.getFieldProps('postalCode')}
                  onChange={(e) => {
                    // Only allow numeric input
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    formik.setFieldValue('postalCode', value);
                  }}
                />
              </label>
              {formik.touched.postalCode && formik.errors.postalCode && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.postalCode}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label className="form-label text-gray-900">
                Country<span className="text-red-500">*</span>
              </label>
              <select
                {...formik.getFieldProps('country')}
                className={`form-control bg-gray-50 text-sm text-gray-500 h-10 px-3 border rounded-md focus:ring-[0.5px] focus:ring-primary focus:outline-none ${borderColor('country')}`}
              >
                <option value="">Select a country</option>
                {countries.map((country) => (
                  <option key={country.value} value={country.value} className="!text-black">
                    {country.label}
                  </option>
                ))}
              </select>
              {formik.touched.country && formik.errors.country && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.country}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            {/* Country Dropdown */}
            <div className="flex flex-col gap-1 w-1/3 hidden">
              <label className="form-label text-gray-900">
                Country Code<span className="text-red-500">*</span>
              </label>
              <select
                {...formik.getFieldProps('countryCode')}
                className={`form-control bg-gray-50 text-sm text-gray-500 h-10 px-3 border rounded-md focus:ring-[0.5px] focus:ring-primary focus:outline-none ${borderColor('countryCode')}`}
              >
                <option value="">---</option>
                {countryCode.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
              {formik.touched.countryCode && formik.errors.countryCode && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.countryCode}
                </span>
              )}
            </div>
            {/*Contact Field */}
            {/* <div className="flex flex-col gap-1 w-full">
                            <label className="form-label text-gray-900">Contact Number<span className="text-red-500">*</span></label>
                            <label className="input">
                                <input
                                    placeholder="00000000"
                                    type="text"
                                    autoComplete="off"
                                    {...formik.getFieldProps('contact')}
                                    onChange={(e) => {
                                        // Only allow numeric input
                                        const value = e.target.value.replace(/[^0-9]/g, "")
                                        formik.setFieldValue("contact", value)
                                    }}
                                />
                            </label>
                            {formik.touched.contact && formik.errors.contact && (
                                <span role="alert" className="text-danger text-xs mt-1">
                                    {formik.errors.contact}
                                </span>
                            )}
                        </div> */}

            {/* new changes */}
            <div className="flex flex-col gap-1 w-full">
              <label className="form-label text-gray-900">
                Contact Number<span className="text-red-500">*</span>
              </label>
              <label className={`input ${borderColor('contact')}`}>
                {' '}
                {/* Remove inner padding from input */}
                <PhoneInput
                  international
                  // defaultCountry="IN" // You can set this to your preferred default
                  placeholder="Enter phone number"
                  value={formik.values.contact}
                  onChange={(value) => formik.setFieldValue('contact', value)}
                  onBlur={() => formik.setFieldTouched('contact', true)}
                  // className="w-full text-sm border-none focus:outline-none"
                />
              </label>
              {formik.touched.contact && formik.errors.contact && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.contact}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <button
              type="submit"
              className="btn btn-primary flex justify-center grow"
              disabled={loading || formik.isSubmitting}
            >
              {loading ? 'Please wait...' : 'Continue'}
            </button>
          </div>
          {/* Existing terms checkbox and submit button remain the same */}
        </form>
      </div>
    </div>
  );
};
export { Organisations };
