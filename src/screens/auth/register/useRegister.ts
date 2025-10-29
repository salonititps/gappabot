import * as Yup from 'yup';
import { useState } from 'react';
import api from '../../../api';

// Types
export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

// Initial Values
export const initialValues: RegisterFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

// Validation Schema
export const registerValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

// Logic Hook
export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare data without confirmPassword
      const registerData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      };

      // Call register API
      const response = await api.AUTH.register(registerData);

      // Handle success
      console.log('Registration successful:', response.data);

      // TODO: Navigate to login or home screen
      // TODO: Store user data if needed
      // Example: navigation.navigate('Login')

      return response.data as RegisterResponse;
    } catch (err: any) {
      // Handle error
      const errorMessage =
        err?.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // TODO: Navigate to login screen
    console.log('Login clicked');
  };

  return {
    handleRegister,
    handleLogin,
    loading,
    error,
  };
};
