import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Formik } from 'formik';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Checkbox } from '../../../components/common/Checkbox';
import { styles } from './style';
import { loginValidationSchema, initialValues, useLogin } from './useLogin';

const LoginScreen: React.FC = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const { handleLogin, handleForgotPassword, handleSignUp, loading, error } =
    useLogin();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome back </Text>
            <Text style={styles.waveEmoji}>👋</Text>
          </View>
          <Text style={styles.subtitle}>
            Please enter your email & password to log in.
          </Text>
        </View>

        {/* Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={loginValidationSchema}
          onSubmit={handleLogin}
          validateOnChange={false}
          validateOnBlur={true}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.formContainer}>
              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Email Input */}
              <Input
                label="Email"
                placeholder="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={() => handleBlur('email')}
                error={errors.email}
                touched={touched.email}
                keyboardType="email-address"
                autoCapitalize="none"
                showEmailIcon
              />

              {/* Password Input */}
              <Input
                label="Password"
                placeholder="Password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={() => handleBlur('password')}
                error={errors.password}
                touched={touched.password}
                secureTextEntry
                showPasswordToggle
              />

              <View style={styles.rememberForgot}>
                {/* Remember Me */}
                <Checkbox
                  label="Remember me"
                  checked={rememberMe}
                  onPress={() => setRememberMe(!rememberMe)}
                />

                {/* Forgot Password */}
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signUpLink}>Sign up</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <Button title="Log in" onPress={handleSubmit} loading={loading} />
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
