import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import OktaAuth from '@okta/okta-react-native';
import { mmkvZustandStorage } from '../mmkvStorage';
import { oktaConfig } from '../../config/oktaConfig';
import { GenericState, createGenericInitialState } from '../types';

interface UserProfile {
  name?: string;
  preferred_username?: string;
  sub?: string;
  [key: string]: any;
}

interface OktaAuthState extends GenericState<UserProfile> {
  accessToken: string | null;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkStatus: () => Promise<void>;
}

const initialOktaData: UserProfile = {};

const useOktaAuth = create<OktaAuthState>()(
  persist(
    (set, get) => ({
      ...createGenericInitialState<UserProfile>({ data: initialOktaData }),
      accessToken: null,
      isAuthenticated: false,

      initialize: async () => {
        try {
          await OktaAuth.createConfig({
            clientId: oktaConfig.clientId,
            redirectUri: oktaConfig.redirectUri,
            endSessionRedirectUri: oktaConfig.endSessionRedirectUri,
            discoveryUri: oktaConfig.issuer,
            scopes: oktaConfig.scopes,
            requireHardwareBackedKeyStore:
              oktaConfig.requireHardwareBackedKeyStore,
          });
          // Check initial status
          await get().checkStatus();
        } catch (error) {
          console.error('Okta initialization failed:', error);
        }
      },

      login: async () => {
        set({ loading: true, error: undefined });
        try {
          await OktaAuth.signIn();
          // After sign in, update status
          await get().checkStatus();
        } catch (error: any) {
          console.log('Login error', error);
          set({ loading: false, error: error.message || 'Login failed' });
        }
      },

      logout: async () => {
        set({ loading: true, error: undefined });
        try {
          await OktaAuth.signOut();
          set({
            isAuthenticated: false,
            accessToken: null,
            data: {},
            loading: false,
          });
        } catch (error: any) {
          console.error('Logout error:', error);
          set({ loading: false, error: error.message || 'Logout failed' });
        }
      },

      checkStatus: async () => {
        try {
          const token = await OktaAuth.getAccessToken();
          if (token) {
            const user = await OktaAuth.getUser();
            set({
              isAuthenticated: true,
              accessToken: token.access_token,
              data: user,
              loading: false,
              error: undefined,
            });
          } else {
            set({
              isAuthenticated: false,
              accessToken: null,
              data: {},
              loading: false,
            });
          }
        } catch (error) {
          // Token might be invalid or expired
          set({
            isAuthenticated: false,
            accessToken: null,
            data: {},
            loading: false,
          });
        }
      },
    }),
    {
      name: 'okta-auth-store',
      storage: mmkvZustandStorage,
    },
  ),
);

export default useOktaAuth;
