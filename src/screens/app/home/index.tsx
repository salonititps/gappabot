import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  PhotoIcon,
  VideoCameraIcon,
  PlusIcon,
} from 'react-native-heroicons/solid';
import { styles } from './style';
import { colors } from '../../../utils/colors';
import { useHome } from './useHome';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const rotateValue = useState(new Animated.Value(0))[0];
  const scalePhoto = useState(new Animated.Value(0))[0];
  const scaleVideo = useState(new Animated.Value(0))[0];
  const slideAnimation = useState(new Animated.Value(0))[0];

  // Use custom hook for media handling
  const { isUploading, photos, videos, handlePhotoUpload, handleVideoUpload } =
    useHome();

  const toggleMenu = () => {
    const toValue = isMenuOpen ? 0 : 1;

    Animated.parallel([
      Animated.spring(rotateValue, {
        toValue,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
      Animated.stagger(50, [
        Animated.spring(scalePhoto, {
          toValue,
          useNativeDriver: true,
          tension: 40,
          friction: 7,
        }),
        Animated.spring(scaleVideo, {
          toValue,
          useNativeDriver: true,
          tension: 40,
          friction: 7,
        }),
      ]),
    ]).start();

    setIsMenuOpen(!isMenuOpen);
  };

  const switchTab = (tab: 'photos' | 'videos') => {
    setActiveTab(tab);
    Animated.spring(slideAnimation, {
      toValue: tab === 'photos' ? 0 : 1,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
  };

  const rotation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const slideIndicator = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180], // Adjust based on tab width
  });

  const handlePhotoPress = () => {
    handlePhotoUpload();
    toggleMenu();
  };

  const handleVideoPress = () => {
    handleVideoUpload();
    toggleMenu();
  };

  const renderMediaItem = ({ item }: any) => (
    <TouchableOpacity style={styles.mediaItem} activeOpacity={0.8}>
      <Image source={{ uri: item.uri }} style={styles.mediaImage} />
      {item.type === 'video' && (
        <View style={styles.playIconContainer}>
          <VideoCameraIcon size={32} color={colors.white} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {activeTab === 'photos' ? (
        <PhotoIcon size={64} color={colors.gray300} />
      ) : (
        <VideoCameraIcon size={64} color={colors.gray300} />
      )}
      <Text style={styles.emptyTitle}>
        No {activeTab === 'photos' ? 'Photos' : 'Videos'} Yet
      </Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to upload your first{' '}
        {activeTab === 'photos' ? 'photo' : 'video'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <View style={styles.tabButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'photos' && styles.tabButtonActive,
            ]}
            onPress={() => switchTab('photos')}
            activeOpacity={0.7}
          >
            <PhotoIcon
              size={20}
              color={activeTab === 'photos' ? colors.primary : colors.gray400}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'photos' && styles.tabButtonTextActive,
              ]}
            >
              Photos
            </Text>
            {activeTab === 'photos' && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{photos.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'videos' && styles.tabButtonActive,
            ]}
            onPress={() => switchTab('videos')}
            activeOpacity={0.7}
          >
            <VideoCameraIcon
              size={20}
              color={activeTab === 'videos' ? colors.primary : colors.gray400}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'videos' && styles.tabButtonTextActive,
              ]}
            >
              Videos
            </Text>
            {activeTab === 'videos' && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{videos.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Animated Indicator */}
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              transform: [{ translateX: slideIndicator }],
            },
          ]}
        />
      </View>

      {/* Content */}
      <FlatList
        data={activeTab === 'photos' ? photos : videos}
        renderItem={renderMediaItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Overlay when menu is open */}
      {isMenuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      {/* Loading Indicator */}
      {isUploading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Uploading...</Text>
          </View>
        </View>
      )}

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        {/* Photo Button */}
        <Animated.View
          style={[
            styles.optionButton,
            {
              transform: [{ scale: scalePhoto }],
              opacity: scalePhoto,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.optionButtonInner, styles.photoButton]}
            onPress={handlePhotoPress}
            activeOpacity={0.8}
          >
            <PhotoIcon size={26} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.optionLabel}>Photo</Text>
        </Animated.View>

        {/* Video Button */}
        <Animated.View
          style={[
            styles.optionButton,
            {
              transform: [{ scale: scaleVideo }],
              opacity: scaleVideo,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.optionButtonInner, styles.videoButton]}
            onPress={handleVideoPress}
            activeOpacity={0.8}
          >
            <VideoCameraIcon size={26} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.optionLabel}>Video</Text>
        </Animated.View>

        {/* Main FAB Button */}
        <Animated.View
          style={[
            styles.fab,
            {
              transform: [{ rotate: rotation }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.fabButton}
            onPress={toggleMenu}
            activeOpacity={0.8}
          >
            <PlusIcon size={26} color={colors.white} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default Home;
