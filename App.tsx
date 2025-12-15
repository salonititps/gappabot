import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { createConfig } from '@okta/okta-react-native';

import { oktaConfig } from './src/utils/OktaConfig';
import { AppNavigator } from './src/navigation/AppNavigator';

const App = () => {
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    const initOkta = async () => {
      try {
        await createConfig(oktaConfig);
      } catch (error) {
        console.error('Okta Config Error:', error);
      } finally {
        setIsReady(true);
      }
    };
    initOkta();
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
