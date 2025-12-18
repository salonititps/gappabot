import React from 'react';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import useHome from './useHome';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 10,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  infoContainer: {
    marginBottom: 20,
  },
});

// HomeScreen menu to access dynamic pages
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { TouchableOpacity } from 'react-native';

const HomeScreen = () => {
  const { userInfo, loading, handleLogout } = useHome();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const menuItems = [
    { id: 'about', title: 'About Us', color: '#4CAF50' },
    { id: 'blogs', title: 'Blogs', color: '#2196F3' },
    { id: 'faqs', title: 'FAQs', color: '#FF9800' },
    { id: 'news', title: 'News', color: '#9C27B0' },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Existing Header/Logout Logic */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome!</Text>
        {userInfo && (
          <View>
            <Text style={styles.subtitle}>Hello, {userInfo.name}</Text>
          </View>
        )}
        <Button title="Logout" onPress={handleLogout} color="red" />
      </View>

      <View style={{ padding: 16 }}>
        <Text style={styles.subtitle}>Main Menu</Text>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={{
              backgroundColor: item.color,
              padding: 20,
              borderRadius: 12,
              marginBottom: 16,
              alignItems: 'center',
            }}
            onPress={() =>
              navigation.navigate('Dynamic', { screenId: item.id })
            }>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;
