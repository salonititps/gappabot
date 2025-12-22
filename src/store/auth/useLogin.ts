import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useApiStore } from '../middleware/api';
import { createGenericInitialState, GenericState } from '../types';
import { apiRoutes, methods } from '../apiRoutes';
import { mmkvZustandStorage } from '../mmkvStorage';

interface LoginProps {
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

const initialLoginData: LoginProps = {
  accessToken: '',
  refreshToken: '',
  id: 0,
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  gender: '',
  image: '',
};

interface LoginStore extends GenericState<LoginProps> {
  onLogin: (payload: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  getUserInfo: () => LoginProps | null;
}

const useLogin = create<LoginStore>()(
  persist(
    (set, get) => {
      const initialState = createGenericInitialState<LoginProps>({
        data: initialLoginData,
      });

      return {
        ...initialState,

        onLogin: async payload => {
          const { callApi } = useApiStore.getState();

          set({ loading: true, error: undefined });

          try {
            const data: LoginProps = await callApi({
              url: apiRoutes.authLogin,
              method: methods.POST,
              data: payload,
              isLogin: true,
            });

            set({
              data,
              loading: false,
              error: undefined,
            });
          } catch (err: any) {
            set({
              data: undefined,
              loading: false,
              error: err,
            });
          }
        },

        logout: () => {
          set({ data: undefined, loading: false, error: undefined });
        },

        clearError: () => {
          set({ data: undefined, loading: false, error: undefined });
        },

        getUserInfo: () => {
          const state = get();
          return state.data || null;
        },
      };
    },
    {
      name: 'login-store',
      storage: mmkvZustandStorage,
    },
  ),
);

export default useLogin;
