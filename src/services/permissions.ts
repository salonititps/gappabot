import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';

export const requestStoragePermission = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking storage permission...');
    console.log('📱 Platform:', Platform.OS, 'Version:', Platform.Version);

    if (Platform.OS === 'android') {
      // Android 13+ (API 33+) uses granular media permissions
      if (Platform.Version >= 33) {
        console.log(
          '📱 Android 13+ detected, requesting READ_MEDIA permissions',
        );

        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);

        console.log('📋 Permission result:', result);

        const imagesGranted =
          result['android.permission.READ_MEDIA_IMAGES'] ===
          PermissionsAndroid.RESULTS.GRANTED;
        const videosGranted =
          result['android.permission.READ_MEDIA_VIDEO'] ===
          PermissionsAndroid.RESULTS.GRANTED;

        // Check if permission was permanently denied
        const imagesNeverAskAgain =
          result['android.permission.READ_MEDIA_IMAGES'] ===
          PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;
        const videosNeverAskAgain =
          result['android.permission.READ_MEDIA_VIDEO'] ===
          PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;

        console.log('✅ Images granted:', imagesGranted);
        console.log('✅ Videos granted:', videosGranted);
        console.log('🚫 Images never ask again:', imagesNeverAskAgain);
        console.log('🚫 Videos never ask again:', videosNeverAskAgain);

        // If permissions are permanently denied, show settings alert
        if (imagesNeverAskAgain || videosNeverAskAgain) {
          Alert.alert(
            'Permission Required',
            'You have previously denied media permissions. Please enable "Photos and videos" permission in app settings to continue.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
              },
            ],
          );
          return false;
        }

        // If permissions not granted but not permanently denied either
        if (!imagesGranted || !videosGranted) {
          Alert.alert(
            'Permission Required',
            'Please allow access to photos and videos to continue',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
              },
            ],
          );
          return false;
        }

        return true;
      } else {
        // Android 12 and below
        console.log(
          '📱 Android 12 and below, requesting READ_EXTERNAL_STORAGE',
        );

        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );

        console.log('📋 Permission result:', result);

        // Check if permanently denied
        if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Permission Required',
            'You have previously denied storage permission. Please enable "Storage" permission in app settings to continue.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
              },
            ],
          );
          return false;
        }

        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Required',
            'Please allow storage access to continue',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
              },
            ],
          );
          return false;
        }

        return true;
      }
    } else {
      // iOS
      console.log('📱 iOS detected, checking PHOTO_LIBRARY permission');

      const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      console.log('📋 Current permission status:', result);

      if (result === RESULTS.DENIED) {
        console.log('🔐 Permission denied, requesting...');
        const requestResult = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        console.log('📋 Request result:', requestResult);

        if (requestResult !== RESULTS.GRANTED) {
          Alert.alert(
            'Permission Required',
            'Please allow access to photos to continue',
            [{ text: 'OK' }],
          );
          return false;
        }
        return true;
      }

      if (result === RESULTS.BLOCKED) {
        console.log('🚫 Permission blocked');
        Alert.alert(
          'Permission Required',
          'Please enable photo library access in Settings',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
        return false;
      }

      if (result === RESULTS.GRANTED) {
        console.log('✅ Permission already granted');
        return true;
      }

      if (result === RESULTS.LIMITED) {
        console.log('⚠️ Permission limited, but we can proceed');
        return true;
      }

      console.log('❌ Unknown permission status:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Permission error:', error);
    Alert.alert('Error', 'Failed to check permissions. Please try again.');
    return false;
  }
};

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking camera permission...');

    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      console.log('📋 Camera permission result:', result);

      if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Permission Required',
          'Please enable camera permission in app settings',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
        return false;
      }

      return result === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const result = await check(PERMISSIONS.IOS.CAMERA);
      console.log('📋 Current camera permission:', result);

      if (result === RESULTS.DENIED) {
        const requestResult = await request(PERMISSIONS.IOS.CAMERA);
        console.log('📋 Camera request result:', requestResult);
        return requestResult === RESULTS.GRANTED;
      }

      if (result === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Required',
          'Please enable camera access in Settings',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
        return false;
      }

      return result === RESULTS.GRANTED;
    }
  } catch (error) {
    console.error('❌ Camera permission error:', error);
    return false;
  }
};
