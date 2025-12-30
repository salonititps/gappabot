import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://192.168.1.175:4000/' }), // Android Emulator
  // uri: 'http://localhost:4000/', // iOS Simulator
  cache: new InMemoryCache(),
});

export default client;
