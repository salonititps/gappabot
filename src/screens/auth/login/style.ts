import { StyleSheet } from 'react-native';
import { colors } from '../../../utils/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  waveEmoji: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  formContainer: {
    gap: 12,
  },
  rememberForgot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPassword: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  signUpContainer: {
    marginVertical: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  signUpLink: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: colors.error + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
});
