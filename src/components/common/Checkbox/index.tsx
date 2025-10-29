import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { styles } from './style';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onPress: () => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <View style={styles.checkmark} />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};
