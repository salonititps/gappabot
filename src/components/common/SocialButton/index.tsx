import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { styles } from './style';

interface SocialButtonProps {
  type: 'google' | 'apple' | 'facebook';
  onPress: () => void;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  type,
  onPress,
}) => {
  const getIcon = () => {
    // Using SVG placeholders that match the brand colors
    // In production, you would use actual brand icons from react-native-svg or custom assets
    switch (type) {
      case 'google':
        return <View style={[styles.iconPlaceholder, styles.googleIcon]} />;
      case 'apple':
        return <View style={[styles.iconPlaceholder, styles.appleIcon]} />;
      case 'facebook':
        return <View style={[styles.iconPlaceholder, styles.facebookIcon]} />;
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      {getIcon()}
    </TouchableOpacity>
  );
};
