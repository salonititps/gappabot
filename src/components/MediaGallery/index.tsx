import React, { useRef } from 'react';
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
import { styles } from './style';
import { colors } from '../../utils/colors';

interface MediaItem {
  id: string;
  uri: string;
  type: 'photo' | 'video';
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

  const renderMediaItem = ({ item }: { item: MediaItem }) => {
    const isSelected = selectedItems.includes(item.id);

    return (
      <View style={styles.mediaItemWrapper}>
        <TouchableOpacity
          style={styles.mediaItem}
          activeOpacity={0.8}
          onLongPress={() => onLongPress(item.id)}
          onPress={() => (isSelectionMode ? onPress(item.id) : null)}
        >
          <Image source={{ uri: item.uri }} style={styles.mediaImage} />
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
      />
    </View>
  );
};
