import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mmkvZustandStorage } from '../mmkvStorage';

interface LoginData {
  accessToken: string;
  refreshToken: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

interface LocalStateStore {
  loginData?: LoginData;
  setUserLoggedIn: (data?: LoginData) => void;
  resetOnLogout: () => void;
}

const useLocalStateStore = create<LocalStateStore>()(
  persist(
    (set, get) => ({
      loginData: undefined,

      setUserLoggedIn: data =>
        set({
          loginData: data,
        }),

      resetOnLogout: () => {
        set({
          loginData: undefined,
        });
      },
    }),
    {
      name: 'local-state',
      storage: mmkvZustandStorage,
    },
  ),
);

export default useLocalStateStore;
