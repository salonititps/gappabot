import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors } from '../../utils/colors';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 20,
    zIndex: 4,
  },
  closeButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  playButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  playText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
