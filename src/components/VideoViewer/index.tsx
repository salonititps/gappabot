import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/solid';
import Video from 'react-native-video';
import { colors } from '../../utils/colors';
import { styles } from './style';
import { HEIGHT, WIDTH } from '../../utils/helper';

interface VideoViewerProps {
  visible: boolean;
  videoUri: string;
  onClose: () => void;
}

export const VideoViewer: React.FC<VideoViewerProps> = ({
  visible,
  videoUri,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<any>(null);

  // Reset state when modal opens or videoUri changes
  useEffect(() => {
    if (visible) {
      console.log('📹 VideoViewer opened with URI:', videoUri);
      setLoading(true);
      setPaused(true);
      setHasError(false);
    }
  }, [visible, videoUri]);

  const handleLoad = (data: any) => {
    console.log('✅ Video loaded successfully:', data);
    setLoading(false);
    setHasError(false);
    // Auto-play after loading
    setPaused(false);
  };

  const handleLoadStart = () => {
    console.log('📥 Video loading started...');
    setLoading(true);
    setHasError(false);
  };

  const handleError = (err: any) => {
    console.error('❌ Video playback error:', err);
    setLoading(false);
    setHasError(true);
    Alert.alert('Error', 'Failed to load video. Please try again.');
  };

  const handleClose = () => {
    console.log('🚪 Closing video viewer');
    setPaused(true);
    setLoading(true);
    setHasError(false);
    onClose();
  };

  const togglePlayPause = () => {
    if (!loading && !hasError) {
      setPaused(!paused);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="rgba(0, 0, 0, 1)"
        translucent={true}
      />
      <View style={styles.container}>
        {/* Video Player */}
        {visible && videoUri ? (
          <TouchableOpacity
            style={styles.videoContainer}
            activeOpacity={1}
            onPress={togglePlayPause}
          >
            <Video
              ref={videoRef}
              source={{ uri: videoUri }}
              style={[
                styles.video,
                {
                  width: WIDTH,
                  height: HEIGHT,
                },
              ]}
              controls={true}
              resizeMode="contain"
              paused={paused}
              onLoad={handleLoad}
              onLoadStart={handleLoadStart}
              onError={handleError}
              onEnd={() => {
                console.log('🎬 Video ended');
                setPaused(true);
              }}
              repeat={false}
              playInBackground={false}
              playWhenInactive={false}
              ignoreSilentSwitch="ignore"
              mixWithOthers="duck"
            />

            {/* Loading Indicator */}
            {loading && !hasError && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.white} />
                <Text style={styles.loadingText}>Loading video...</Text>
              </View>
            )}

            {/* Error State */}
            {hasError && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Failed to load video</Text>
                <TouchableOpacity
                  onPress={() => {
                    setHasError(false);
                    setLoading(true);
                    setPaused(false);
                  }}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ) : null}

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.8}
        >
          <View style={styles.closeButtonInner}>
            <XMarkIcon size={18} color={colors.white} />
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
