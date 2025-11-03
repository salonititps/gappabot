import { StyleSheet } from 'react-native';
import { colors } from '../../utils/colors';
import { WIDTH } from '../../utils/helper';

const itemWidth = (WIDTH - 48) / 2;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  listContainer: {
    padding: 16,
  },
  mediaItemWrapper: {
    margin: 4,
  },
  mediaItem: {
    width: itemWidth,
    height: itemWidth * 1.2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.gray100,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  checkIconContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 2,
  },
  playIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
