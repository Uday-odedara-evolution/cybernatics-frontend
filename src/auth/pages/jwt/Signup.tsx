import clsx from 'clsx';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuthContext } from '../../useAuthContext';
import { Alert, KeenIcon } from '@/components';
import { useLayout } from '@/providers';

const initialValues = {
  email: '',
  password: '',
  changepassword: '',
  name: '',
  jobTitle: '',
  referral: '',
  acceptTerms: false
};

const passwordValidation = Yup.string()
  .min(8, 'Minimum 8 characters')
  .max(64, 'Maximum 64 characters')
  .test(
    'password-strength',
    'Password must include at least 3 of the following: lowercase, uppercase, number, special character',
    (value) => {
      if (!value) return false;
      const hasLowercase = /[a-z]/.test(value);
      const hasUppercase = /[A-Z]/.test(value);
      const hasDigit = /\d/.test(value);
      const hasSpecialChar = /[\W_]/.test(value);
      // Count how many conditions are met
      const strengthCount = [hasLowercase, hasUppercase, hasDigit, hasSpecialChar].filter(
        Boolean
      ).length;
      return strengthCount >= 3;
    }
  )
  .required('Password is required');

const signupSchema = Yup.object().shape({
  email: Yup.string()
    .email('Must be a valid email address')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address')
    .required('Email is required'),
  password: passwordValidation,
  changepassword: Yup.string()
    .min(8, 'Minimum 8 characters')
    .max(30, 'Maximum 30 characters')
    .required('Password confirmation is required')
    .oneOf([Yup.ref('password')], "Password and Confirm Password didn't match"),
  name: Yup.string()
    .min(3, 'Minimum 3 characters')
    .max(50, 'Maximum 50 characters')
    .required('Name is required'),
  jobTitle: Yup.string()
    .min(2, 'Minimum 2 characters')
    .max(50, 'Maximum 50 characters')
    .required('Job title is required'),
  // referral: Yup.string()
  //   .required('Referral source is required'),
  acceptTerms: Yup.boolean().oneOf([true], 'You must accept the terms and conditions')
});

const Signup = () => {
  // ... existing state and hooks declarations remain the same ...
  const [loading, setLoading] = useState(false);
  const { register } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { currentLayout } = useLayout();

  useEffect(() => {
    document.title = 'Sign Up';
  }, []);

  const formik = useFormik({
    initialValues,
    validationSchema: signupSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        if (!register) {
          throw new Error('JWTProvider is required for this form.');
        }
        // Update register call to include new fields if needed
        await register(
          values.email,
          values.password,
          values.changepassword,
          values.name,
          values.jobTitle,
          values.referral
        );
        // navigate(from, { replace: true });
        localStorage.removeItem('organisationForm');
        localStorage.removeItem('organisationForm2');

        navigate('/auth/verify-otp', { state: { from } });
      } catch (error: any) {
        setStatus(error.message);
        setSubmitting(false);
        setLoading(false);
      }
    }
  });

  // ... existing toggle functions remain the same ...
  const togglePassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  const borderColor = (field: keyof typeof initialValues) => {
    return formik.touched[field] && formik.errors[field] ? 'border-red-500' : '';
  };

  const toggleConfirmPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };
  return (
    <div className="card max-w-[370px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        noValidate
        onSubmit={formik.handleSubmit}
      >
        <img src="/media/app/newlogo.png" alt="logo" />
        <div className="text-center mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">Sign up</h3>
          <div className="flex items-center justify-center font-medium">
            <span className="text-2sm text-gray-600 me-1.5">Already have an Account ?</span>
            <Link
              to={currentLayout?.name === 'auth-branded' ? '/auth/login' : '/auth/classic/login'}
              // to={currentLayout?.name === 'auth-branded' ? '/auth/verify-otp' : '/auth/classic/login'}
              className="text-2sm link"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="border-t border-gray-200 w-full"></span>
          <span className="text-2xs text-gray-500 font-medium uppercase">Or</span>
          <span className="border-t border-gray-200 w-full"></span>
        </div>

        {formik.status && <Alert variant="danger">{formik.status}</Alert>}

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">
            Email<span className="text-red-500">*</span>
          </label>
          <label className={`input ${borderColor('email')}`}>
            <input
              placeholder="email@email.com"
              type="email"
              autoComplete="off"
              {...formik.getFieldProps('email')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.email && formik.errors.email },
                {
                  'is-valid': formik.touched.email && !formik.errors.email
                }
              )}
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
            Password<span className="text-red-500">*</span>
          </label>
          <label className={`input ${borderColor('password')}`}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter Password"
              autoComplete="off"
              {...formik.getFieldProps('password')}
              className={clsx(
                'form-control bg-transparent',
                {
                  'is-invalid': formik.touched.password && formik.errors.password
                },
                {
                  'is-valid': formik.touched.password && !formik.errors.password
                }
              )}
            />
            <button className="btn btn-icon" onClick={togglePassword}>
              <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showPassword })} />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showPassword })}
              />
            </button>
          </label>
          {formik.touched.password && formik.errors.password && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.password}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">
            Confirm Password<span className="text-red-500">*</span>
          </label>
          <label className={`input ${borderColor('changepassword')}`}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter Password"
              autoComplete="off"
              {...formik.getFieldProps('changepassword')}
              className={clsx(
                'form-control bg-transparent',
                {
                  'is-invalid': formik.touched.changepassword && formik.errors.changepassword
                },
                {
                  'is-valid': formik.touched.changepassword && !formik.errors.changepassword
                }
              )}
            />
            <button className="btn btn-icon" onClick={toggleConfirmPassword}>
              <KeenIcon
                icon="eye"
                className={clsx('text-gray-500', { hidden: showConfirmPassword })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showConfirmPassword })}
              />
            </button>
          </label>
          {formik.touched.changepassword && formik.errors.changepassword && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.changepassword}
            </span>
          )}
        </div>

        {/* New Name Field */}
        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">
            Name<span className="text-red-500">*</span>
          </label>
          <label className={`input ${borderColor('name')}`}>
            <input
              placeholder="John Doe"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps('name')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.name && formik.errors.name },
                { 'is-valid': formik.touched.name && !formik.errors.name }
              )}
            />
          </label>
          {formik.touched.name && formik.errors.name && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.name}
            </span>
          )}
        </div>

        {/* New Job Title Field */}
        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">
            Job Title<span className="text-red-500">*</span>
          </label>
          <label className={`input ${borderColor('jobTitle')}`}>
            <input
              placeholder="Software Developer"
              type="text"
              autoComplete="off"
              {...formik.getFieldProps('jobTitle')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.jobTitle && formik.errors.jobTitle },
                { 'is-valid': formik.touched.jobTitle && !formik.errors.jobTitle }
              )}
            />
          </label>
          {formik.touched.jobTitle && formik.errors.jobTitle && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.jobTitle}
            </span>
          )}
        </div>

        {/* New Referral Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="checkbox-group">
            <input
              className="checkbox checkbox-sm"
              type="checkbox"
              {...formik.getFieldProps('acceptTerms')}
            />
            <span className="checkbox-label">
              I accept{' '}
              <Link to="#" className="text-2sm link">
                Terms & Conditions
              </Link>
            </span>
          </label>

          {formik.touched.acceptTerms && formik.errors.acceptTerms && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.acceptTerms}
            </span>
          )}
          <button
            type="submit"
            className="btn btn-primary flex justify-center grow mt-1"
            disabled={loading || formik.isSubmitting}
          >
            {loading ? 'Please wait...' : 'Sign Up'}
          </button>
          {formik.touched.referral && formik.errors.referral && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.referral}
            </span>
          )}
        </div>

        {/* Existing terms checkbox and submit button remain the same */}
      </form>
    </div>
  );
};

export { Signup };
