import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import styles from './styles';

interface HeaderProps {
  title: string;
  onBack: () => void;
}

const Header = ({ title, onBack }: HeaderProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
};

export default Header;
