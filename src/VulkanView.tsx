import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  NativeModules,
  findNodeHandle,
  Platform,
  Button,
  Text,
  requireNativeComponent,
  View,
} from 'react-native';

const { VulkanModule } = NativeModules;
const NativeVulkanView = requireNativeComponent('VulkanView');

interface VulkanViewProps {
  style?: any;
}

export const VulkanView: React.FC<VulkanViewProps> = ({ style }) => {
  const surfaceRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android' && surfaceRef.current) {
      // Wait longer for surface to be ready
      const timer = setTimeout(() => {
        const viewTag = findNodeHandle(surfaceRef.current);
        if (viewTag) {
          VulkanModule.initVulkan(viewTag);
          // Don't set initialized immediately, let the native code confirm
          setTimeout(() => setIsInitialized(true), 500);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (isInitialized) {
        VulkanModule.cleanup();
      }
    };
  }, [isInitialized]);

  const changeColor = () => {
    const r = Math.random();
    const g = Math.random();
    const b = Math.random();
    VulkanModule.render(r, g, b);
  };

  return (
    <View style={[styles.container, style]}>
      <NativeVulkanView ref={surfaceRef} style={styles.surface} />
      <View style={styles.controls}>
        <Text style={styles.status}>
          {isInitialized ? 'Vulkan Initialized ✓' : 'Initializing...'}
        </Text>
        <Button
          title="Change Color"
          onPress={changeColor}
          disabled={!isInitialized}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  surface: {
    flex: 1,
  },
  controls: {
    padding: 20,
    backgroundColor: 'white',
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
});
