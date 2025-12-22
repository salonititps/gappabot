import React from 'react';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import useHome from './useHome';
import styles from './styles';

// HomeScreen menu to access dynamic pages
import { RootStackParamList } from '../../navigation/AppNavigator';

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

      <View style={styles.menuContainer}>
        <Text style={styles.subtitle}>Main Menu</Text>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, { backgroundColor: item.color }]}
            onPress={() =>
              navigation.navigate('Dynamic', { screenId: item.id })
            }>
            <Text style={styles.menuItemText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;
