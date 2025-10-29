import React from 'react';

import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

import TabNavigator from './tabNavigator';

const Stack = createNativeStackNavigator();

const screenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_right',
};

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName={'tabRoot'}>
      <Stack.Screen name={'tabRoot'} component={TabNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
