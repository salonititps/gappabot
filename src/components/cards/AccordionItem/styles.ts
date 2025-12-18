import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 1, // Separator
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contentContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  content: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  icon: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
});

export default styles;
