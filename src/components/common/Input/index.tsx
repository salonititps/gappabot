import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { EnvelopeIcon } from 'react-native-heroicons/outline';
import { EyeIcon, EyeSlashIcon } from 'react-native-heroicons/solid';
import { styles } from './style';
import { colors } from '../../../utils/colors';

interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  error?: string;
  touched?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  rightIcon?: React.ReactNode;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  showEmailIcon?: boolean;
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  secureTextEntry = false,
  keyboardType = 'default',
  rightIcon,
  autoCapitalize = 'none',
  showEmailIcon = false,
  showPasswordToggle = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = () => setIsFocused(true);

  const handleBlur = () => {
    setIsFocused(false);
    onBlur();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const hasError = touched && error;
  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={styles.placeholder.color}
          value={value}
          onChangeText={onChangeText}
          onBlur={handleBlur}
          onFocus={handleFocus}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {showEmailIcon && (
          <View style={styles.iconContainer}>
            <EnvelopeIcon size={20} color={colors.gray400} />
          </View>
        )}
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={togglePasswordVisibility}
          >
            {isPasswordVisible ? (
              <EyeSlashIcon size={20} color={colors.primary} />
            ) : (
              <EyeIcon size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        )}
        {rightIcon && !showEmailIcon && !showPasswordToggle && (
          <TouchableOpacity style={styles.iconContainer}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
};
