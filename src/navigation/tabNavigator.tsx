import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import Home from '../screens/app/home';
import Settings from '../screens/app/settings';
import TabBar from './tabBar';

const Tab = createBottomTabNavigator();

const screenOptions: BottomTabNavigationOptions = {
  headerShown: false,
};

const TabNavigator = () => {
  const tabBar = (props: BottomTabBarProps) => <TabBar {...props} />;

  return (
    <Tab.Navigator
      screenOptions={screenOptions}
      initialRouteName={'home'}
      tabBar={tabBar}
    >
      <Tab.Screen name={'home'} component={Home} />
      <Tab.Screen name={'settings'} component={Settings} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
