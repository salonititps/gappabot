import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { ApolloProvider } from '@apollo/client/react';
import client from './src/apolloClient';
import UserList from './src/UserList';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <UserList />
      </SafeAreaView>
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
