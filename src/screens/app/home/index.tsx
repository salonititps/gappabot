import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  PhotoIcon,
  VideoCameraIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from 'react-native-heroicons/solid';
import { styles } from './style';
import { colors } from '../../../utils/colors';
import { useHome } from './useHome';
import { MediaGallery } from '../../../components/MediaGallery';

const { width } = Dimensions.get('window');

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const scalePhoto = useRef(new Animated.Value(0)).current;
  const scaleVideo = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const {
    isUploading,
    isLoading,
    isLoadingMore,
    isRefreshing,
    isDeleting,
    photos,
    videos,
    hasMorePhotos,
    hasMoreVideos,
    handlePhotoUpload,
    handleVideoUpload,
    loadMorePhotos,
    loadMoreVideos,
    refreshPhotos,
    refreshVideos,
    selectedPhotos,
    selectedVideos,
    isSelectionMode,
    handleLongPress,
    handlePress,
    cancelSelection,
    deleteSelectedItems,
  } = useHome();

  const toggleMenu = () => {
    const toValue = isMenuOpen ? 0 : 1;

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

  const tabWidth = (width - 16 - 16 - 60 - 12 - 12) / 2;
  const slideIndicator = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth + 60 + 12 + 12],
  });

  const handlePhotoPress = () => {
    handlePhotoUpload();
    toggleMenu();
  };

  const handleVideoPress = () => {
    handleVideoUpload();
    toggleMenu();
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <View style={styles.headerRow}>
          {/* Photos Tab */}
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'photos' && styles.tabButtonActive,
            ]}
            onPress={() => switchTab('photos')}
            activeOpacity={0.7}
          >
            <PhotoIcon
              size={22}
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
            <View
              style={[
                styles.tabBadge,
                activeTab === 'photos' && styles.tabBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === 'photos' && styles.tabBadgeTextActive,
                ]}
              >
                {photos.length}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Center Add Button */}
          <TouchableOpacity
            style={styles.centerAddButton}
            onPress={toggleMenu}
            activeOpacity={0.8}
          >
            <PlusIcon size={28} color={colors.white} />
          </TouchableOpacity>

          {/* Videos Tab */}
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'videos' && styles.tabButtonActive,
            ]}
            onPress={() => switchTab('videos')}
            activeOpacity={0.7}
          >
            <VideoCameraIcon
              size={22}
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
            <View
              style={[
                styles.tabBadge,
                activeTab === 'videos' && styles.tabBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === 'videos' && styles.tabBadgeTextActive,
                ]}
              >
                {videos.length}
              </Text>
            </View>
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

      {/* Media Gallery */}
      {activeTab === 'photos' ? (
        <MediaGallery
          data={photos}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMorePhotos}
          onEndReached={loadMorePhotos}
          onRefresh={refreshPhotos}
          isRefreshing={isRefreshing}
          emptyIcon={<PhotoIcon size={64} color={colors.gray300} />}
          emptyTitle="No Photos Yet"
          emptySubtitle="Tap the + button to upload your first photo"
          selectedItems={selectedPhotos}
          isSelectionMode={isSelectionMode}
          onLongPress={id => handleLongPress(id, 'photo')}
          onPress={id => handlePress(id, 'photo')}
        />
      ) : (
        <MediaGallery
          data={videos}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMoreVideos}
          onEndReached={loadMoreVideos}
          onRefresh={refreshVideos}
          isRefreshing={isRefreshing}
          emptyIcon={<VideoCameraIcon size={64} color={colors.gray300} />}
          emptyTitle="No Videos Yet"
          emptySubtitle="Tap the + button to upload your first video"
          selectedItems={selectedVideos}
          isSelectionMode={isSelectionMode}
          onLongPress={id => handleLongPress(id, 'video')}
          onPress={id => handlePress(id, 'video')}
        />
      )}

      {/* Selection Action Bar */}
      {isSelectionMode && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.actionBarButton}
            onPress={cancelSelection}
            activeOpacity={0.8}
          >
            <XMarkIcon size={24} color={colors.textPrimary} />
            <Text style={styles.actionBarButtonText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.actionBarText}>
            {activeTab === 'photos'
              ? `${selectedPhotos.length} selected`
              : `${selectedVideos.length} selected`}
          </Text>

          <TouchableOpacity
            style={[
              styles.actionBarButton,
              styles.deleteButton,
              (activeTab === 'photos'
                ? selectedPhotos.length === 0
                : selectedVideos.length === 0) && styles.deleteButtonDisabled,
            ]}
            onPress={() =>
              deleteSelectedItems(activeTab === 'photos' ? 'photo' : 'video')
            }
            activeOpacity={0.8}
            disabled={
              activeTab === 'photos'
                ? selectedPhotos.length === 0
                : selectedVideos.length === 0
            }
          >
            <TrashIcon size={24} color={colors.white} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Overlay when menu is open */}
      {isMenuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      {/* Loading Indicator */}
      {(isUploading || isDeleting) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {isUploading ? 'Uploading...' : 'Deleting...'}
            </Text>
          </View>
        </View>
      )}

      {/* Dropdown Menu Options */}
      {isMenuOpen && (
        <View style={styles.dropdownMenu}>
          {/* Photo Option */}
          <Animated.View
            style={[
              styles.dropdownOption,
              {
                transform: [{ scale: scalePhoto }],
                opacity: scalePhoto,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.dropdownButton, styles.photoButton]}
              onPress={handlePhotoPress}
              activeOpacity={0.8}
            >
              <PhotoIcon size={20} color={colors.white} />
              <Text style={styles.dropdownButtonText}>Upload Photo</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Video Option */}
          <Animated.View
            style={[
              styles.dropdownOption,
              {
                transform: [{ scale: scaleVideo }],
                opacity: scaleVideo,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.dropdownButton, styles.videoButton]}
              onPress={handleVideoPress}
              activeOpacity={0.8}
            >
              <VideoCameraIcon size={20} color={colors.white} />
              <Text style={styles.dropdownButtonText}>Upload Video</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

export default Home;
