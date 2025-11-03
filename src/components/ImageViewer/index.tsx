import React, { useState } from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/solid';
import { colors } from '../../utils/colors';
import { styles } from './style';

interface ImageViewerProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  visible,
  imageUri,
  onClose,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

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

        {/* Image Container */}
        <View style={styles.imageContainer}>
          {!imageLoaded && (
            <ActivityIndicator size="large" color={colors.primary} />
          )}
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
            onLoadEnd={() => setImageLoaded(true)}
          />
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
