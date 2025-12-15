import { create } from 'zustand';
import MMKVStorage from 'react-native-mmkv-storage';
import { persist, PersistStorage } from 'zustand/middleware';

const MMKV = new MMKVStorage.Loader().initialize();

export const mmkvZustandStorage: PersistStorage<any> = {
  getItem: (name: string) => {
    const value = MMKV.getString(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: any) => {
    MMKV.setString(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    MMKV.removeItem(name);
  },
};

interface AuthState {
  accessToken: string | null;
  idToken: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, idToken: string) => void;
  clearTokens: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      accessToken: null,
      idToken: null,
      isAuthenticated: false,
      setTokens: (accessToken, idToken) =>
        set({ accessToken, idToken, isAuthenticated: true }),
      clearTokens: () =>
        set({ accessToken: null, idToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: mmkvZustandStorage,
    },
  ),
);
