import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { signOut, getUser } from '@okta/okta-react-native';

import { useAuthStore } from '../store/useAuthStore';

export const HomeScreen = () => {
  const clearTokens = useAuthStore(state => state.clearTokens);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getUser();
        setUserInfo(user);
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      clearTokens();
    } catch (error) {
      console.error('Logout failed', error);
      clearTokens();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      {userInfo && (
        <View style={styles.infoContainer}>
          <Text>Name: {userInfo.name}</Text>
          <Text>Email: {userInfo.preferred_username}</Text>
        </View>
      )}
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
});
