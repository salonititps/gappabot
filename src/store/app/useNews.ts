import { create } from 'zustand';

import { createGenericInitialState, GenericState } from '../types';
import { useApiStore } from '../middleware/api';
import { apiRoutes, methods } from '../apiRoutes';

export interface NewsAccordionItem {
  id: string;
  title: string;
  content: string;
}

export interface NewsCardItem {
  id: string;
  name: string;
  imageUrl: string;
  details: string;
}

export interface NewsProps {
  accordionItems: NewsAccordionItem[];
  items: NewsCardItem[];
}

const initialNewsData: NewsProps = {
  accordionItems: [],
  items: [],
};

interface NewsStore extends GenericState<NewsProps> {
  getNews: () => Promise<void>;
  clearNews: () => void;
}

const useNews = create<NewsStore>()((set, get) => {
  const initialState = createGenericInitialState<NewsProps>({
    data: initialNewsData,
    loading: true,
  });

  return {
    ...initialState,

    getNews: async () => {
      const { callApi } = useApiStore.getState();

      set({ data: undefined, loading: true, error: undefined });
      try {
        const data = await callApi({
          url: apiRoutes.news,
          method: methods.GET,
        });

        set({ data, loading: false, error: undefined });
      } catch (error: any) {
        set({ data: undefined, loading: false, error });
      }
    },

    clearNews: () => {
      set({ data: undefined, loading: false, error: null });
    },
  };
});

export default useNews;
