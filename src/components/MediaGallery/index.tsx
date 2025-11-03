import React, { useRef, useState } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  RefreshControl,
} from 'react-native';
import { VideoCameraIcon, CheckCircleIcon } from 'react-native-heroicons/solid';
import { ImageViewer } from '../ImageViewer';
import { VideoViewer } from '../VideoViewer';
import { styles } from './style';
import { colors } from '../../utils/colors';

interface MediaItem {
  id: string;
  uri: string;
  type: 'photo' | 'video';
  thumbnail?: string;
}

interface MediaGalleryProps {
  data: MediaItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onEndReached: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptySubtitle: string;
  selectedItems: string[];
  isSelectionMode: boolean;
  onLongPress: (id: string) => void;
  onPress: (id: string) => void;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  data,
  isLoading,
  isLoadingMore,
  hasMore,
  onEndReached,
  onRefresh,
  isRefreshing,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  selectedItems,
  isSelectionMode,
  onLongPress,
  onPress,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState('');
  const [videoViewerVisible, setVideoViewerVisible] = useState(false);
  const [selectedVideoUri, setSelectedVideoUri] = useState('');

  const handleImagePress = (item: MediaItem) => {
    if (isSelectionMode) {
      onPress(item.id);
    } else {
      // Open full screen viewer for images
      if (item.type === 'photo') {
        setSelectedImageUri(item.uri);
        setViewerVisible(true);
      } else if (item.type === 'video') {
        // Open video viewer
        setSelectedVideoUri(item.uri);
        setVideoViewerVisible(true);
      }
    }
  };

  const closeViewer = () => {
    setViewerVisible(false);
    setSelectedImageUri('');
  };

  const closeVideoViewer = () => {
    setVideoViewerVisible(false);
    setSelectedVideoUri('');
  };

  const renderMediaItem = ({ item }: { item: MediaItem }) => {
    const isSelected = selectedItems.includes(item.id);
    // Use thumbnail for videos, otherwise use the uri
    const imageSource =
      item.type === 'video' && item.thumbnail ? item.thumbnail : item.uri;

    return (
      <View style={styles.mediaItemWrapper}>
        <TouchableOpacity
          style={styles.mediaItem}
          activeOpacity={0.8}
          onLongPress={() => onLongPress(item.id)}
          onPress={() => handleImagePress(item)}
        >
          <Image source={{ uri: imageSource }} style={styles.mediaImage} />
          {item.type === 'video' && (
            <View style={styles.playIconContainer}>
              <VideoCameraIcon size={32} color={colors.white} />
            </View>
          )}
          {isSelectionMode && isSelected && (
            <View style={styles.selectionOverlay}>
              <View style={styles.checkIconContainer}>
                <CheckCircleIcon size={32} color={colors.primary} />
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyTitle}>Loading...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        {emptyIcon}
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
      </View>
    );
  };

  const handleEndReached = () => {
    if (!isLoadingMore && !isLoading && hasMore) {
      onEndReached();
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderMediaItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        extraData={selectedItems}
      />

      <ImageViewer
        visible={viewerVisible}
        imageUri={selectedImageUri}
        onClose={closeViewer}
      />

      <VideoViewer
        visible={videoViewerVisible}
        videoUri={selectedVideoUri}
        onClose={closeVideoViewer}
      />
    </View>
  );
};
