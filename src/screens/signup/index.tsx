import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Controller } from 'react-hook-form';

import { TextInput } from '../../components/forms/TextInput/TextInput';
import useSignup from './useSignup';
import styles from './styles';

const SignupScreen = () => {
  const {
    control,
    handleSubmit,
    errors,
    isLoading,
    onSubmit,
    handleBrowserSignup,
    navigation,
  } = useSignup();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="First Name"
                    placeholder="John"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.firstName?.message}
                    autoCapitalize="words"
                    autoComplete="given-name"
                    required
                  />
                )}
              />
            </View>
            <View style={styles.nameFieldSpacer} />
            <View style={styles.nameField}>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Last Name"
                    placeholder="Doe"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.lastName?.message}
                    autoCapitalize="words"
                    autoComplete="family-name"
                    required
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email"
                placeholder="john.doe@example.com"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                placeholder="Create a strong password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
                secureTextEntry
                showPasswordToggle
                autoComplete="new-password"
                helperText="Min 8 chars, uppercase, lowercase, number & special char"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirm Password"
                placeholder="Re-enter your password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.confirmPassword?.message}
                secureTextEntry
                showPasswordToggle
                autoComplete="new-password"
                required
              />
            )}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.browserButton]}
            onPress={handleBrowserSignup}
            disabled={isLoading}>
            <Text style={[styles.buttonText, styles.browserButtonText]}>
              Sign In with Browser
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;
