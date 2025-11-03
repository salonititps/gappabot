import React from 'react';
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
import { styles } from './style';
import {
  registerValidationSchema,
  initialValues,
  useRegister,
} from './useRegister';

const RegisterScreen: React.FC = () => {
  const { handleRegister, handleLogin, loading, error } = useRegister();

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
            <Text style={styles.title}>Create account </Text>
            <Text style={styles.waveEmoji}>👋</Text>
          </View>
          <Text style={styles.subtitle}>
            Please fill in the form to continue.
          </Text>
        </View>

        {/* Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={registerValidationSchema}
          onSubmit={handleRegister}
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

              {/* Name Row */}
              <View style={styles.nameRow}>
                {/* First Name Input */}
                <View style={styles.nameInput}>
                  <Input
                    label="First Name"
                    placeholder="First Name"
                    value={values.firstName}
                    onChangeText={handleChange('firstName')}
                    onBlur={() => handleBlur('firstName')}
                    error={errors.firstName}
                    touched={touched.firstName}
                    autoCapitalize="words"
                  />
                </View>

                {/* Last Name Input */}
                <View style={styles.nameInput}>
                  <Input
                    label="Last Name"
                    placeholder="Last Name"
                    value={values.lastName}
                    onChangeText={handleChange('lastName')}
                    onBlur={() => handleBlur('lastName')}
                    error={errors.lastName}
                    touched={touched.lastName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

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

              {/* Confirm Password Input */}
              <Input
                label="Confirm Password"
                placeholder="Confirm Password"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={() => handleBlur('confirmPassword')}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
                secureTextEntry
                showPasswordToggle
              />

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={handleLogin}>
                  <Text style={styles.loginLink}>Log in</Text>
                </TouchableOpacity>
              </View>

              {/* Register Button */}
              <Button
                title="Sign up"
                onPress={handleSubmit}
                loading={loading}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
