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
  PanResponder,
} from 'react-native';

const { VulkanModule } = NativeModules;
const NativeVulkanView = requireNativeComponent('VulkanView');

interface VulkanViewProps {
  style?: any;
}

export const VulkanView: React.FC<VulkanViewProps> = ({ style }) => {
  const surfaceRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [scale, setScale] = useState(1);

  // Pan responder for touch controls
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (isInitialized) {
          VulkanModule.updateCamera(
            gestureState.dx * 0.5,
            gestureState.dy * 0.5,
          );
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (Platform.OS === 'android' && surfaceRef.current) {
      const timer = setTimeout(() => {
        const viewTag = findNodeHandle(surfaceRef.current);
        if (viewTag) {
          VulkanModule.initVulkan(viewTag);
          setTimeout(() => setIsInitialized(true), 500);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      // Render loop
      const interval = setInterval(() => {
        VulkanModule.render(0.1, 0.1, 0.15);
      }, 16); // ~60 FPS

      return () => clearInterval(interval);
    }
  }, [isInitialized]);

  useEffect(() => {
    return () => {
      if (isInitialized) {
        VulkanModule.cleanup();
      }
    };
  }, [isInitialized]);

  const zoomIn = () => {
    const newScale = Math.min(scale + 0.2, 3);
    setScale(newScale);
    VulkanModule.setScale(newScale);
  };

  const zoomOut = () => {
    const newScale = Math.max(scale - 0.2, 0.5);
    setScale(newScale);
    VulkanModule.setScale(newScale);
  };

  const resetView = () => {
    setScale(1);
    VulkanModule.setRotation(0, 0, 0);
    VulkanModule.setScale(1);
  };

  const changeBackgroundColor = () => {
    const r = Math.random();
    const g = Math.random();
    const b = Math.random();
    VulkanModule.render(r, g, b);
  };

  return (
    <View style={[styles.container, style]}>
      <View {...panResponder.panHandlers} style={styles.surface}>
        <NativeVulkanView ref={surfaceRef} style={StyleSheet.absoluteFill} />
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>
            {isInitialized ? '🎮 3D Cube - Drag to Rotate' : '⏳ Loading...'}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Text style={styles.title}>
          {isInitialized ? '✨ Vulkan Renderer' : '⏳ Initializing...'}
        </Text>

        <Text style={styles.label}>Scale: {scale.toFixed(1)}x</Text>

        <View style={styles.buttonGrid}>
          <View style={styles.buttonWrapper}>
            <Button
              title="Zoom In +"
              onPress={zoomIn}
              disabled={!isInitialized}
              color="#00ff88"
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              title="Zoom Out -"
              onPress={zoomOut}
              disabled={!isInitialized}
              color="#ff6b6b"
            />
          </View>
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="Reset View"
            onPress={resetView}
            disabled={!isInitialized}
            color="#4dabf7"
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="Change Background"
            onPress={changeBackgroundColor}
            disabled={!isInitialized}
            color="#ffd43b"
          />
        </View>

        <Text style={styles.info}>💡 Drag on cube to rotate it</Text>
        <Text style={styles.info}>🎨 Each face has a different color</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  surface: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  overlayText: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  controls: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 2,
    borderTopColor: '#00ff88',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#00ff88',
  },
  label: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  buttonWrapper: {
    flex: 1,
    marginBottom: 10,
  },
  info: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
});
