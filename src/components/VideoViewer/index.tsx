import React, { useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Text,
  Linking,
  Alert,
} from 'react-native';
import { XMarkIcon, PlayIcon } from 'react-native-heroicons/solid';
import { colors } from '../../utils/colors';
import { styles } from './style';

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
  const [loading, setLoading] = useState(false);

  const openVideo = async () => {
    try {
      setLoading(true);
      const supported = await Linking.canOpenURL(videoUri);

      if (supported) {
        await Linking.openURL(videoUri);
        // Close the modal after opening
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        Alert.alert('Error', 'Cannot open this video URL');
      }
    } catch (error) {
      console.error('Error opening video:', error);
      Alert.alert('Error', 'Failed to open video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="rgba(0, 0, 0, 0.95)"
        translucent={true}
      />
      <View style={styles.container}>
        {/* Background - Tap to close */}
        <TouchableOpacity
          style={styles.background}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Video Container */}
        <View style={styles.videoContainer}>
          <View style={styles.playButtonContainer}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={openVideo}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="large" color={colors.white} />
              ) : (
                <>
                  <PlayIcon size={48} color={colors.white} />
                  <Text style={styles.playText}>Play Video</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.hintText}>
              Opens in your device's native video player
            </Text>
          </View>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
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
