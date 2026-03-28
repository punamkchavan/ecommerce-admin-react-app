import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearError } from '../features/auth/authSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const resetSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const { isLoading, error, resetEmailSent } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: resetSchema,
    onSubmit: (values) => {
      dispatch(resetPassword(values.email));
    },
  });

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <div className="flex justify-center">
            <div className="bg-primary-100 p-3 rounded-full">
              <Mail className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            No worries, we'll send you reset instructions.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        {resetEmailSent ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-6 rounded-md text-center">
            <p className="font-medium mb-4">Reset link sent successfully!</p>
            <p className="text-sm">Please check your email inbox and follow the instructions to reset your password.</p>
            <Link to="/login" className="inline-flex items-center mt-6 text-sm font-medium text-primary-600 hover:text-primary-500">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
            <div className="space-y-4">
              <Input
                id="email"
                name="email"
                label="Email Address"
                type="email"
                placeholder="admin@example.com"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                error={formik.touched.email && formik.errors.email}
              />
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                Send reset link
              </Button>
              
              <Link to="/login" className="flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
