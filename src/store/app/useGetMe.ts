import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { createGenericInitialState, GenericState } from '../types';
import { useApiStore } from '../middleware/api';
import { apiRoutes, methods } from '../apiRoutes';

export interface MeProps {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

const initialGetMeData: MeProps = {
  id: 0,
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  gender: '',
  image: '',
};

interface MeStore extends GenericState<MeProps> {
  getMe: () => Promise<void>;
  clearGetMe: () => void;
}

const useGetMe = create<MeStore>()(
  devtools(
    set => {
      const initialState = createGenericInitialState<MeProps>({
        data: initialGetMeData,
      });

      return {
        ...initialState,

        getMe: async () => {
          const { callApi } = useApiStore.getState();

          set({ data: undefined, loading: true, error: undefined });

          try {
            const data = await callApi({
              url: apiRoutes.me,
              method: methods.GET,
            });

            set({ data, loading: false, error: undefined });
          } catch (error: any) {
            set({ data: undefined, loading: false, error });
          }
        },

        clearGetMe: () => {
          set({ data: undefined, loading: false, error: null });
        },
      };
    },
    { enabled: true, name: 'MeStore' },
  ),
);

export default useGetMe;
