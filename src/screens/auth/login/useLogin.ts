import * as Yup from 'yup';

// Types
export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Initial Values
export const initialValues: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: false,
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
  const handleLogin = (values: LoginFormValues) => {
    // TODO: Implement actual login logic here
    console.log('Login with:', values);
  };

  const handleForgotPassword = () => {
    // TODO: Navigate to forgot password screen
    console.log('Forgot password clicked');
  };

  const handleSignUp = () => {
    // TODO: Navigate to sign up screen
    console.log('Sign up clicked');
  };

  const handleSocialLogin = (provider: 'google' | 'apple' | 'facebook') => {
    // TODO: Implement social login logic
    console.log(`Login with ${provider}`);
  };

  return {
    handleLogin,
    handleForgotPassword,
    handleSignUp,
    handleSocialLogin,
  };
};
