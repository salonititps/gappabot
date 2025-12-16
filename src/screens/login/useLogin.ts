import { useState } from 'react';
import { Alert } from 'react-native';
import {
  signIn,
  getAccessToken,
  getIdToken,
  signInWithBrowser,
} from '@okta/okta-react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuthStore } from '../../store/useAuthStore';
import { loginSchema, LoginFormData } from '../../utils/validation';

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
};

const useLogin = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setTokens = useAuthStore(state => state.setTokens);

  const [isLoading, setIsLoading] = useState(false);
  const [isBrowserLoading, setIsBrowserLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { username, password } = data;
      await signIn({ username, password });

      const accessToken = await getAccessToken();
      const idToken = await getIdToken();

      if (accessToken && idToken) {
        setTokens(accessToken.access_token, idToken.id_token, 'custom');
      } else {
        Alert.alert('Login Failed', 'Failed to retrieve tokens');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      Alert.alert(
        'Login Failed',
        error?.message || 'An unexpected error occurred',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowserLogin = async () => {
    setIsBrowserLoading(true);
    try {
      await signInWithBrowser();
      const accessToken = await getAccessToken();
      const idToken = await getIdToken();
      if (accessToken && idToken) {
        setTokens(accessToken.access_token, idToken.id_token, 'browser');
      }
    } catch (error: any) {
      console.error('Browser Login Error:', error);
      if (!error?.message?.includes('cancelled')) {
        Alert.alert('Login Failed', error?.message || 'An error occurred');
      }
    } finally {
      setIsBrowserLoading(false);
    }
  };

  return {
    control,
    handleSubmit,
    errors,
    isLoading,
    isBrowserLoading,
    onSubmit,
    handleBrowserLogin,
    navigation,
  };
};

export default useLogin;
