import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface CustomTextInputProps extends TextInputProps {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Helper text displayed below the input (when no error) */
  helperText?: string;
  /** Left icon component */
  leftIcon?: React.ReactNode;
  /** Right icon component */
  rightIcon?: React.ReactNode;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is required (shows asterisk) */
  required?: boolean;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Custom label style */
  labelStyle?: TextStyle;
  /** Custom input container style */
  inputContainerStyle?: ViewStyle;
  /** Show password toggle for secure text entry */
  showPasswordToggle?: boolean;
}

export const TextInput = forwardRef<RNTextInput, CustomTextInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      disabled = false,
      required = false,
      containerStyle,
      labelStyle,
      inputContainerStyle,
      showPasswordToggle = false,
      secureTextEntry,
      style,
      ...props
    },
    ref,
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleTogglePassword = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const handleFocus = (e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const isSecure = secureTextEntry && !isPasswordVisible;

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}
        <View
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            error && styles.inputContainerError,
            disabled && styles.inputContainerDisabled,
            inputContainerStyle,
          ]}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <RNTextInput
            ref={ref}
            style={[
              styles.input,
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
              disabled && styles.inputDisabled,
              style,
            ]}
            placeholderTextColor="#999"
            editable={!disabled}
            secureTextEntry={isSecure}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {showPasswordToggle && secureTextEntry && (
            <TouchableOpacity
              onPress={handleTogglePassword}
              style={styles.iconRight}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.toggleText}>
                {isPasswordVisible ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          )}
          {rightIcon && !showPasswordToggle && (
            <View style={styles.iconRight}>{rightIcon}</View>
          )}
        </View>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>
    );
  },
);

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  required: {
    color: '#d32f2f',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  inputContainerFocused: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: '#d32f2f',
    backgroundColor: '#fff0f0',
  },
  inputContainerDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  inputDisabled: {
    color: '#999',
  },
  iconLeft: {
    paddingLeft: 12,
  },
  iconRight: {
    paddingRight: 12,
  },
  toggleText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
