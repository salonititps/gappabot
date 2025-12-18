interface ImageCardProps {
  name: string;
  imageUrl: string;
  onPress?: () => void;
}

import { memo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from './styles';

const ImageCard = memo(({ name, imageUrl, onPress }: ImageCardProps) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={!onPress}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.text}>{name}</Text>
      </View>
    </TouchableOpacity>
  );
});

export default ImageCard;
