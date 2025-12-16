import React from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';

import useHome from './useHome';
import styles from './styles';

const HomeScreen = () => {
  const { userInfo, loading, handleLogout } = useHome();

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
          <Text>Email: {userInfo.preferred_username || userInfo.email}</Text>
        </View>
      )}
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
};

export default HomeScreen;
