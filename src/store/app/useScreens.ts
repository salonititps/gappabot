import { create } from 'zustand';

import { createGenericInitialState, GenericState } from '../types';
import { useApiStore } from '../middleware/api';
import { apiRoutes, methods } from '../apiRoutes';
import { ScreenType } from '../../utils/constants';

interface ScreenData {
  id: string;
  type: ScreenType;
  title: string;
  data: any; // Flexible payload depending on type
  nestedScreens?: string[]; // IDs of screens linked from this one
}

export type ScreensData = Record<string, Omit<ScreenData, 'data'>>;

const initialScreensData: ScreensData = {};

interface ScreensStore extends GenericState<ScreensData> {
  getScreens: () => Promise<void>;
  clearScreens: () => void;
}

const useScreens = create<ScreensStore>()(set => {
  const initialState = createGenericInitialState<ScreensData>({
    data: initialScreensData,
  });

  return {
    ...initialState,

    getScreens: async () => {
      const { callApi } = useApiStore.getState();

      set({ loading: true, error: undefined });

      try {
        const data = await callApi({
          url: apiRoutes.screens,
          method: methods.GET,
        });

        set({ data, loading: false, error: undefined });
      } catch (error: any) {
        set({ loading: false, error });
      }
    },

    clearScreens: () => {
      set({ data: initialScreensData, loading: false, error: null });
    },
  };
});

export default useScreens;
