import React, { useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthNavigator from './authNavigator';
import AppNavigator from './homeNavigator';
import { useSelector } from 'react-redux';

const Navigation = () => {
  const { token } = useSelector((state: any) => state.auth);
  const backgroundColor = useMemo(() => {
    return '#FFFFFF';
  }, []);

  const wrapperStyles = {
    flex: 1,
    backgroundColor,
  };
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <GestureHandlerRootView style={wrapperStyles}>
          {token ? <AppNavigator /> : <AuthNavigator />}
        </GestureHandlerRootView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default Navigation;
