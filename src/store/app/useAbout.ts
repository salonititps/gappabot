import { create } from 'zustand';

import { createGenericInitialState, GenericState } from '../types';
import { useApiStore } from '../middleware/api';
import { apiRoutes, methods } from '../apiRoutes';

export interface AboutProps {
  info: string;
  heroImage: {
    id: string;
    name: string;
    imageUrl: string;
    details: string;
  };
}

const initialAboutData: AboutProps = {
  info: '',
  heroImage: {
    id: '',
    name: '',
    imageUrl: '',
    details: '',
  },
};

interface AboutStore extends GenericState<AboutProps> {
  getAbout: () => Promise<void>;
  clearAbout: () => void;
}

const useAbout = create<AboutStore>()((set, get) => {
  const initialState = createGenericInitialState<AboutProps>({
    data: initialAboutData,
    loading: true,
  });

  return {
    ...initialState,

    getAbout: async () => {
      const { callApi } = useApiStore.getState();

      set({ data: undefined, loading: true, error: undefined });

      try {
        const data = await callApi({
          url: apiRoutes.about,
          method: methods.GET,
        });

        set({ data, loading: false, error: undefined });
      } catch (error: any) {
        set({ data: undefined, loading: false, error });
      }
    },

    clearAbout: () => {
      set({ data: undefined, loading: false, error: null });
    },
  };
});

export default useAbout;
