import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { createConfig } from '@okta/okta-react-native';

import { oktaConfig } from './src/utils/OktaConfig';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useScreens } from './src/store/app';

const App = () => {
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          createConfig(oktaConfig),
          useScreens.getState().getScreens(),
        ]);
      } catch (error) {
        console.error('Initialization Error:', error);
      } finally {
        setIsReady(true);
      }
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading Configuration...</Text>
      </View>
    );
  }

  return <AppNavigator />;
};

export default App;
