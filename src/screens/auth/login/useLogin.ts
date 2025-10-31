import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import api from '../../../api';
import { setStateKey } from '../../../redux/reducers/auth.slice';

// Types
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  };
}

// Initial Values
export const initialValues: LoginFormValues = {
  email: '',
  password: '',
};

// Validation Schema
export const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

// Logic Hook
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      setError(null);

      // Prepare login data
      const loginData = {
        email: values.email,
        password: values.password,
      };

      // Call login API
      const response = await api.AUTH.login(loginData);

      // store token & user data in redux
      if (response?.success === true) {
        dispatch(setStateKey({ key: 'token', value: response.data.token }));
        dispatch(setStateKey({ key: 'userData', value: response.data.user }));
      } else {
        return;
      }
    } catch (err: any) {
      console.error('err: ', err);
      // Handle error
      const errorMessage =
        err?.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Navigate to forgot password screen
    console.log('Forgot password clicked');
  };

  const handleSignUp = () => {
    navigation.push('register');
  };

  return {
    handleLogin,
    handleForgotPassword,
    handleSignUp,
    loading,
    error,
  };
};
