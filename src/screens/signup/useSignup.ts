import { useState } from 'react';
import { Alert } from 'react-native';
import {
  signInWithBrowser,
  getAccessToken,
  getIdToken,
} from '@okta/okta-react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';

import { oktaConfig } from '../../utils/OktaConfig';
import { useAuthStore } from '../../store/useAuthStore';

import { signupSchema, SignupFormData } from '../../utils/validation';
import { API_BASE_URL, API_TOKEN } from '../../utils/constants';

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
};

const useSignup = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setTokens = useAuthStore(state => state.setTokens);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  // Custom signup using Okta User API with Axios
  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      // Step 1: Create user via Okta API
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/users?activate=true`,
        {
          profile: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            login: data.email,
          },
          credentials: {
            password: {
              value: data.password,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: API_TOKEN,
          },
        },
      );

      const result = response.data;

      // Step 2: Assign user to the application so they can login
      const userId = result.id;
      const appId = oktaConfig.clientId;

      try {
        await axios.post(
          `${API_BASE_URL}/api/v1/apps/${appId}/users`,
          {
            id: userId,
            scope: 'USER',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: API_TOKEN,
            },
          },
        );
      } catch (assignError) {
        console.warn(
          'Failed to assign user to app, user may need manual assignment',
        );
      }

      Alert.alert(
        'Registration Successful',
        'Your account has been created. Please sign in.',
        [
          {
            text: 'Sign In',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
    } catch (error: any) {
      console.error('Signup Error:', error);
      let errorMessage =
        error?.message || 'An unexpected error occurred. Please try again.';

      if (axios.isAxiosError(error) && error.response) {
        const result = error.response.data;
        errorMessage =
          result.errorCauses?.[0]?.errorSummary ||
          result.errorSummary ||
          errorMessage;
      }

      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Browser-based signup flow
  const handleBrowserSignup = async () => {
    setIsLoading(true);
    try {
      // Sign in with browser - Okta's hosted page allows registration if enabled
      await signInWithBrowser();
      const accessToken = await getAccessToken();
      const idToken = await getIdToken();

      if (accessToken && idToken) {
        setTokens(accessToken.access_token, idToken.id_token);
      }
    } catch (error: any) {
      console.error('Browser Signup Error:', error);
      if (!error?.message?.includes('cancelled')) {
        Alert.alert(
          'Signup Failed',
          error?.message || 'An error occurred during signup.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    control,
    handleSubmit,
    errors,
    isLoading,
    onSubmit,
    handleBrowserSignup,
    navigation,
  };
};

export default useSignup;
