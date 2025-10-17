import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { VulkanView } from './src/VulkanView';
import { useStyle } from './styles.app';

function App(): React.JSX.Element {
  const styles = useStyle();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <VulkanView style={styles.vulkanView} />
    </SafeAreaView>
  );
}

export default App;
