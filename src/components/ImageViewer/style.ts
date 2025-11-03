import { StyleSheet, Platform } from 'react-native';
import { WIDTH, HEIGHT } from '../../utils/helper';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  image: {
    width: WIDTH,
    height: HEIGHT,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 20,
    zIndex: 3,
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
});
