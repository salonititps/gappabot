import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import api from '../../../api';
import { requestStoragePermission } from '../../../services/permissions';

interface MediaItem {
  id: string;
  uri: string;
  type: 'photo' | 'video';
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export const useHome = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);

  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [photosPagination, setPhotosPagination] =
    useState<PaginationInfo | null>(null);
  const [videosPagination, setVideosPagination] =
    useState<PaginationInfo | null>(null);

  const fetchInitialMedia = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchPhotos(1, true), fetchVideos(1, true)]);
    setIsLoading(false);
  }, []);

  // Fetch media when component mounts
  useEffect(() => {
    fetchInitialMedia();
  }, [fetchInitialMedia]);

  const fetchPhotos = async (page: number = 1, isInitial: boolean = false) => {
    try {
      if (!isInitial) setIsLoadingMore(true);

      console.log(`📥 Fetching photos - Page ${page}`);

      const response = await api.MEDIA.getMedia('image', page, 50);

      console.log('✅ Photos response:', response);

      if (response?.data) {
        const fetchedPhotos = response.data.map((item: any) => ({
          id: item._id || item.id,
          uri: item.url || item.uri,
          type: 'photo' as const,
        }));

        if (isInitial || page === 1) {
          setPhotos(fetchedPhotos);
        } else {
          setPhotos(prev => [...prev, ...fetchedPhotos]);
        }

        setPhotosPagination(response.pagination);
      }
    } catch (error: any) {
      console.error('❌ Error fetching photos:', error);
      if (error.response?.status !== 404) {
        Alert.alert('Error', 'Failed to load photos');
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  const fetchVideos = async (page: number = 1, isInitial: boolean = false) => {
    try {
      if (!isInitial) setIsLoadingMore(true);

      console.log(`📥 Fetching videos - Page ${page}`);

      const response = await api.MEDIA.getMedia('video', page, 50);

      console.log('✅ Videos response:', response);

      if (response?.data) {
        const fetchedVideos = response.data.map((item: any) => ({
          id: item._id || item.id,
          uri: item.url || item.uri,
          type: 'video' as const,
        }));

        if (isInitial || page === 1) {
          setVideos(fetchedVideos);
        } else {
          setVideos(prev => [...prev, ...fetchedVideos]);
        }

        setVideosPagination(response.pagination);
      }
    } catch (error: any) {
      console.error('❌ Error fetching videos:', error);
      if (error.response?.status !== 404) {
        Alert.alert('Error', 'Failed to load videos');
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadMorePhotos = () => {
    if (photosPagination?.hasNextPage && !isLoadingMore) {
      const nextPage =
        photosPagination.nextPage || photosPagination.currentPage + 1;
      fetchPhotos(nextPage);
    }
  };

  const loadMoreVideos = () => {
    if (videosPagination?.hasNextPage && !isLoadingMore) {
      const nextPage =
        videosPagination.nextPage || videosPagination.currentPage + 1;
      fetchVideos(nextPage);
    }
  };

  const refreshPhotos = async () => {
    setIsRefreshing(true);
    await fetchPhotos(1, true);
    setIsRefreshing(false);
  };

  const refreshVideos = async () => {
    setIsRefreshing(true);
    await fetchVideos(1, true);
    setIsRefreshing(false);
  };

  const handlePhotoUpload = async () => {
    try {
      console.log('📸 Starting photo upload process...');

      const hasPermission = await requestStoragePermission();
      console.log('🔐 Permission result:', hasPermission);

      if (!hasPermission) {
        console.log('❌ Photo upload cancelled: Permission denied');
        return;
      }

      console.log('✅ Permission granted, opening image picker...');

      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      });

      console.log('📋 Image picker result:', {
        didCancel: result.didCancel,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        assetsLength: result.assets?.length,
      });

      if (result.didCancel) {
        console.log('ℹ️ User cancelled image picker');
        return;
      }

      if (result.errorCode) {
        console.error(
          '❌ Image picker error:',
          result.errorCode,
          result.errorMessage,
        );
        Alert.alert('Error', result.errorMessage || 'Failed to pick image');
        return;
      }

      const asset = result.assets?.[0];
      if (!asset || !asset.uri) {
        console.error('❌ No image selected or invalid asset');
        Alert.alert('Error', 'No image selected');
        return;
      }

      console.log('✅ Image selected:', {
        uri: asset.uri,
        type: asset.type,
        fileName: asset.fileName,
        fileSize: asset.fileSize,
      });

      await uploadMedia(asset, 'image');
    } catch (error: any) {
      console.error('❌ Photo upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Something went wrong');
    }
  };

  const handleVideoUpload = async () => {
    try {
      console.log('🎥 Starting video upload process...');

      const hasPermission = await requestStoragePermission();
      console.log('🔐 Permission result:', hasPermission);

      if (!hasPermission) {
        console.log('❌ Video upload cancelled: Permission denied');
        return;
      }

      console.log('✅ Permission granted, opening video picker...');

      const result = await launchImageLibrary({
        mediaType: 'video',
        selectionLimit: 1,
      });

      console.log('📋 Video picker result:', {
        didCancel: result.didCancel,
        errorCode: result.errorCode,
        assetsLength: result.assets?.length,
      });

      if (result.didCancel) {
        console.log('ℹ️ User cancelled video picker');
        return;
      }

      if (result.errorCode) {
        console.error(
          '❌ Video picker error:',
          result.errorCode,
          result.errorMessage,
        );
        Alert.alert('Error', result.errorMessage || 'Failed to pick video');
        return;
      }

      const asset = result.assets?.[0];
      if (!asset || !asset.uri) {
        console.error('❌ No video selected or invalid asset');
        Alert.alert('Error', 'No video selected');
        return;
      }

      console.log('✅ Video selected:', {
        uri: asset.uri,
        duration: asset.duration,
        fileSize: asset.fileSize,
      });

      await uploadMedia(asset, 'video');
    } catch (error: any) {
      console.error('❌ Video upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Something went wrong');
    }
  };

  const uploadMedia = async (asset: Asset, type: 'image' | 'video') => {
    try {
      setIsUploading(true);
      console.log('📤 Starting upload...');

      const formData = new FormData();

      const file: any = {
        uri:
          Platform.OS === 'ios' ? asset.uri?.replace('file://', '') : asset.uri,
        type: asset.type || (type === 'image' ? 'image/jpeg' : 'video/mp4'),
        name:
          asset.fileName ||
          `${type}_${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`,
      };

      formData.append('file', file);
      formData.append('type', type);

      console.log('📦 FormData prepared:', {
        fileName: file.name,
        fileType: file.type,
        fileUri: file.uri,
        uploadType: type,
      });

      console.log('🌐 Calling API...');
      const response = await api.MEDIA.uploadMedia(formData);

      console.log('✅ Upload successful:', response);

      Alert.alert(
        'Success',
        `${type === 'image' ? 'Photo' : 'Video'} uploaded successfully!`,
        [{ text: 'OK' }],
      );

      // Refresh the appropriate list
      if (type === 'image') {
        await refreshPhotos();
      } else {
        await refreshVideos();
      }
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      let errorMessage = 'Something went wrong';
      if (error.message === 'Network Error') {
        errorMessage =
          'Cannot connect to server. Please check:\n' +
          '1. Backend is running\n' +
          '2. BASE_URL is correct\n' +
          '3. Network connection is active';
      } else if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
      }

      Alert.alert('Upload Failed', errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
      console.log('📥 Upload process completed');
    }
  };

  // Selection handlers
  const handleLongPress = (id: string, type: 'photo' | 'video') => {
    setIsSelectionMode(true);
    if (type === 'photo') {
      setSelectedPhotos([id]);
    } else {
      setSelectedVideos([id]);
    }
  };

  const handlePress = (id: string, type: 'photo' | 'video') => {
    if (!isSelectionMode) return;

    if (type === 'photo') {
      setSelectedPhotos(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
      );
    } else {
      setSelectedVideos(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
      );
    }
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedPhotos([]);
    setSelectedVideos([]);
  };

  const deleteSelectedItems = async (type: 'photo' | 'video') => {
    const selectedIds = type === 'photo' ? selectedPhotos : selectedVideos;

    if (selectedIds.length === 0) {
      Alert.alert('No Selection', 'Please select items to delete');
      return;
    }

    Alert.alert(
      'Delete Items',
      `Are you sure you want to delete ${selectedIds.length} ${
        type === 'photo' ? 'photo' : 'video'
      }${selectedIds.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              console.log(`🗑️ Deleting ${selectedIds.length} items...`);

              // Delete all selected items
              const deletePromises = selectedIds.map(id =>
                api.MEDIA.deleteMedia(id),
              );

              await Promise.all(deletePromises);

              console.log('✅ All items deleted successfully');

              Alert.alert(
                'Success',
                `${selectedIds.length} ${type === 'photo' ? 'photo' : 'video'}${
                  selectedIds.length > 1 ? 's' : ''
                } deleted successfully`,
              );

              // Refresh the list
              if (type === 'photo') {
                await refreshPhotos();
              } else {
                await refreshVideos();
              }

              // Exit selection mode
              cancelSelection();
            } catch (error: any) {
              console.error('❌ Delete error:', error);
              Alert.alert(
                'Delete Failed',
                error.response?.data?.message || 'Failed to delete items',
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  return {
    isUploading,
    isLoading,
    isLoadingMore,
    isRefreshing,
    isDeleting,
    photos,
    videos,
    hasMorePhotos: photosPagination?.hasNextPage || false,
    hasMoreVideos: videosPagination?.hasNextPage || false,
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
  };
};
