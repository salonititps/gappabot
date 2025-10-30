import * as Yup from 'yup';
import { useState } from 'react';
import api from '../../../api';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setStateKey } from '../../../redux/reducers/auth.slice';

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
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleRegister = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
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

      // store token & user data in redux
      if (response?.success === true) {
        dispatch(setStateKey({ key: 'token', value: response.data.token }));
        dispatch(setStateKey({ key: 'userData', value: response.data.user }));
      } else {
        return;
      }
    } catch (err: any) {
      // Handle error
      const errorMessage =
        err?.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.popToTop();
  };

  return {
    handleRegister,
    handleLogin,
    loading,
    error,
  };
};
