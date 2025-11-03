import { StyleSheet } from 'react-native';
import { colors } from '../../../utils/colors';

export const styles = StyleSheet.create({
  button: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  googleIcon: {
    backgroundColor: '#DB4437',
  },
  appleIcon: {
    backgroundColor: colors.black,
  },
  facebookIcon: {
    backgroundColor: '#1877F2',
  },
});
