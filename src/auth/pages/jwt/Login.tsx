import { type MouseEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { KeenIcon, Alert } from '@/components';
import { useAuthContext } from '@/auth';
import { useLayout } from '@/providers';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 characters')
    .max(50, 'Maximum 50 characters')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Minimum 8 characters')
    .max(30, 'Maximum 30 characters')
    .required('Password is required'),
  remember: Yup.boolean()
});

const initialValues = {
  email: '',
  password: '',
  remember: false
};

type FormikErrors = typeof initialValues;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login, loginGoogle } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/';
  const [showPassword, setShowPassword] = useState(false);
  const { currentLayout } = useLayout();
  const isDarkMode = document.documentElement.classList.contains('dark');

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      localStorage.removeItem('organisationForm');
      localStorage.removeItem('organisationForm2');
      try {
        if (!login) {
          throw new Error('JWTProvider is required for this form.');
        }
        await login(values.email, values.password, values.remember);
        localStorage.removeItem('organisationForm');
        localStorage.removeItem('organisationForm2');
        if (values.remember) {
          localStorage.setItem('userEmail', values.email);
        } else {
          localStorage.removeItem('userEmail');
        }
        navigate(from, { replace: true });
      } catch {
        setStatus('The login details are incorrect');
        setSubmitting(false);
      }
      setLoading(false);
    }
  });

  const togglePassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  const borderColor = (field: keyof FormikErrors) => {
    return formik.touched[field] && formik.errors[field] ? 'border-red-500' : '';
  };

  useEffect(() => {
    document.title = 'Login';
  }, []);

  return (
    <div className="card  max-w-[390px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        onSubmit={formik.handleSubmit}
        noValidate
      >
        <img src="/media/app/newlogo.png" alt="logo" />
        <div className="text-center mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">Sign in</h3>
          <div className="flex items-center justify-center font-medium">
            <span className="text-2sm text-gray-600 me-1.5">Need an account?</span>
            <Link
              to={currentLayout?.name === 'auth-branded' ? '/auth/signup' : '/auth/classic/signup'}
              className="text-2sm link"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <GoogleLogin
          width={310}
          theme={isDarkMode ? 'filled_black' : 'outline'}
          onSuccess={async (credentialResponse) => {
            if (credentialResponse.credential) {
              await loginGoogle(credentialResponse.credential);
              navigate('/dashboard', { replace: true });
            }
          }}
          onError={() => {
            toast.error('Failed to login with Google');
          }}
        />

        <div className="flex items-center gap-2">
          <span className="border-t border-gray-200 w-full"></span>
          <span className="text-2xs text-gray-500 font-medium uppercase">Or</span>
          <span className="border-t border-gray-200 w-full"></span>
        </div>

        {formik.status && <Alert variant="danger">{formik.status}</Alert>}

        <div className="flex flex-col gap-1">
          <label className={`form-label text-gray-900`}>Email</label>
          <label className={`input ${borderColor('email')}`}>
            <input
              placeholder="Enter Email"
              autoComplete="off"
              {...formik.getFieldProps('email')}
              className={clsx('form-control', {
                'is-invalid': formik.touched.email && formik.errors.email
              })}
            />
          </label>
          {formik.touched.email && formik.errors.email && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.email}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1">
            <label className={`form-label text-gray-900`}>Password</label>
            <Link
              to={
                currentLayout?.name === 'auth-branded'
                  ? '/auth/reset-password'
                  : '/auth/classic/reset-password'
              }
              className="text-2sm link shrink-0"
            >
              Forgot Password?
            </Link>
          </div>
          <label className={`input ${borderColor('password')}`}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter Password"
              autoComplete="off"
              {...formik.getFieldProps('password')}
              className={clsx('form-control', {
                'is-invalid': formik.touched.password && formik.errors.password
              })}
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

        <label className="checkbox-group">
          <input
            className="checkbox checkbox-sm"
            type="checkbox"
            {...formik.getFieldProps('remember')}
          />
          <span className="checkbox-label">Remember me</span>
        </label>

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? 'Please wait...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export { Login };
