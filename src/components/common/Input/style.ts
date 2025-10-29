import { StyleSheet } from 'react-native';
import { colors } from '../../../utils/colors';

export const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  inputContainerFocused: {
    borderBottomColor: colors.borderActive,
  },
  inputContainerError: {
    borderBottomColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    padding: 0,
  },
  placeholder: {
    color: colors.textPlaceholder,
  },
  iconContainer: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    textAlign: 'right',
  },
});
