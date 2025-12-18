import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 24,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
    color: '#333',
  },
  menuButton: {
    padding: 16,
    backgroundColor: '#007AFF', // Theme color
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default styles;
