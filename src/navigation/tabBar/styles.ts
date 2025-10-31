import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../utils/colors';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
  },
  wrapper: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    textTransform: 'capitalize',
    fontSize: 12,
    fontWeight: '500',
  },
});
