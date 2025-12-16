import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mmkvZustandStorage } from './mmkvStorage';

export interface UserInfo {
  name?: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  sub?: string;
}

interface AuthState {
  accessToken: string | null;
  idToken: string | null;
  isAuthenticated: boolean;
  loginMethod: 'browser' | 'custom' | null;
  userInfo: UserInfo | null;
  setTokens: (
    accessToken: string,
    idToken: string,
    loginMethod?: 'browser' | 'custom',
  ) => void;
  setUserInfo: (userInfo: UserInfo) => void;
  clearTokens: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      accessToken: null,
      idToken: null,
      isAuthenticated: false,
      loginMethod: null,
      userInfo: null,
      setTokens: (accessToken, idToken, loginMethod = 'browser') =>
        set({ accessToken, idToken, isAuthenticated: true, loginMethod }),
      setUserInfo: userInfo => set({ userInfo }),
      clearTokens: () =>
        set({
          accessToken: null,
          idToken: null,
          isAuthenticated: false,
          loginMethod: null,
          userInfo: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: mmkvZustandStorage,
    },
  ),
);
