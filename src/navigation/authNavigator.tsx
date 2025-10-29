import React from 'react';

import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/login';
import { RegisterScreen } from '../screens/auth/register';

const Stack = createNativeStackNavigator();

const screenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_right',
};

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName={'login'}>
      <Stack.Screen name={'login'} component={LoginScreen} />
      <Stack.Screen name={'register'} component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
