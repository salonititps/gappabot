import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import api from '../../../api';
import { requestStoragePermission } from '../../../services/permissions';

interface MediaItem {
  id: string;
  uri: string;
  type: 'photo' | 'video';
}

export const useHome = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);

  // Fetch media when component mounts
  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Fetching media from server...');

      // Fetch photos and videos in parallel
      const [photosResponse, videosResponse] = await Promise.all([
        api.MEDIA.getMedia('image'),
        api.MEDIA.getMedia('video'),
      ]);

      console.log('✅ Photos response:', photosResponse);
      console.log('✅ Videos response:', videosResponse);

      // Update state with fetched data
      // Adjust the mapping based on your API response structure
      if (photosResponse?.data) {
        const fetchedPhotos = photosResponse.data.map((item: any) => ({
          id: item._id || item.id,
          uri: item.url || item.uri,
          type: 'photo' as const,
        }));
        setPhotos(fetchedPhotos);
      }

      if (videosResponse?.data) {
        const fetchedVideos = videosResponse.data.map((item: any) => ({
          id: item._id || item.id,
          uri: item.url || item.uri,
          type: 'video' as const,
        }));
        setVideos(fetchedVideos);
      }

      console.log('✅ Media fetched successfully');
    } catch (error: any) {
      console.error('❌ Error fetching media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    try {
      console.log('📸 Starting photo upload process...');

      // Step 1: Request storage permission (will check & request if needed)
      const hasPermission = await requestStoragePermission();
      console.log('🔐 Permission result:', hasPermission);

      // If permission denied, stop here
      if (!hasPermission) {
        console.log('❌ Photo upload cancelled: Permission denied');
        return;
      }

      console.log('✅ Permission granted, opening image picker...');

      // Step 2: Permission granted, open image picker
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

      // Check if user cancelled
      if (result.didCancel) {
        console.log('ℹ️ User cancelled image picker');
        return;
      }

      // Check for errors
      if (result.errorCode) {
        console.error(
          '❌ Image picker error:',
          result.errorCode,
          result.errorMessage,
        );
        Alert.alert('Error', result.errorMessage || 'Failed to pick image');
        return;
      }

      // Get the selected image
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

      // Step 3: Upload to server
      await uploadMedia(asset, 'image');
    } catch (error: any) {
      console.error('❌ Photo upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Something went wrong');
    }
  };

  const handleVideoUpload = async () => {
    try {
      console.log('🎥 Starting video upload process...');

      // Step 1: Request storage permission
      const hasPermission = await requestStoragePermission();
      console.log('🔐 Permission result:', hasPermission);

      if (!hasPermission) {
        console.log('❌ Video upload cancelled: Permission denied');
        return;
      }

      console.log('✅ Permission granted, opening video picker...');

      // Step 2: Permission granted, open video picker
      const result = await launchImageLibrary({
        mediaType: 'video',
        selectionLimit: 1,
      });

      console.log('📋 Video picker result:', {
        didCancel: result.didCancel,
        errorCode: result.errorCode,
        assetsLength: result.assets?.length,
      });

      // Check if user cancelled
      if (result.didCancel) {
        console.log('ℹ️ User cancelled video picker');
        return;
      }

      // Check for errors
      if (result.errorCode) {
        console.error(
          '❌ Video picker error:',
          result.errorCode,
          result.errorMessage,
        );
        Alert.alert('Error', result.errorMessage || 'Failed to pick video');
        return;
      }

      // Get the selected video
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

      // Step 3: Upload to server
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

      // Create FormData
      const formData = new FormData();

      // Prepare file object for form data
      const file: any = {
        uri:
          Platform.OS === 'ios' ? asset.uri?.replace('file://', '') : asset.uri,
        type: asset.type || (type === 'image' ? 'image/jpeg' : 'video/mp4'),
        name:
          asset.fileName ||
          `${type}_${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`,
      };

      // Append data as per Postman structure
      formData.append('file', file);
      formData.append('type', type);

      console.log('📦 FormData prepared:', {
        fileName: file.name,
        fileType: file.type,
        fileUri: file.uri,
        uploadType: type,
      });

      // Call API
      console.log('🌐 Calling API...');
      const response = await api.MEDIA.uploadMedia(formData);

      console.log('✅ Upload successful:', response);

      // Update local state with uploaded media
      const newMedia: MediaItem = {
        id: response?.data?.id || Date.now().toString(),
        uri: asset.uri || '',
        type: type === 'image' ? 'photo' : 'video',
      };

      if (type === 'image') {
        setPhotos(prev => [newMedia, ...prev]);
      } else {
        setVideos(prev => [newMedia, ...prev]);
      }

      Alert.alert(
        'Success',
        `${type === 'image' ? 'Photo' : 'Video'} uploaded successfully!`,
        [{ text: 'OK' }],
      );

      // Refresh media list after upload
      await fetchMedia();
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Better error messages
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

  return {
    isUploading,
    isLoading,
    photos,
    videos,
    handlePhotoUpload,
    handleVideoUpload,
    refreshMedia: fetchMedia, // Export for manual refresh
  };
};
