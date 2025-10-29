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
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
