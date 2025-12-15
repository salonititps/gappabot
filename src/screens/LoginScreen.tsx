import React from 'react';
import { View, Button, StyleSheet, Text, Alert } from 'react-native';
import {
  getAccessToken,
  getIdToken,
  signInWithBrowser,
} from '@okta/okta-react-native';
import { useAuthStore } from '../store/useAuthStore';

export const LoginScreen = () => {
  const setTokens = useAuthStore(state => state.setTokens);

  const handleLogin = async () => {
    try {
      await signInWithBrowser();

      const accessToken = await getAccessToken();
      const idToken = await getIdToken();

      if (accessToken && idToken) {
        setTokens(accessToken.access_token, idToken.id_token);
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      Alert.alert('Login Failed', error?.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Okta RN</Text>
      <Button title="Login with Okta" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
});
