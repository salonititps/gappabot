import { create } from 'zustand';

import { createGenericInitialState, GenericState } from '../types';
import { useApiStore } from '../middleware/api';
import { apiRoutes, methods } from '../apiRoutes';

export interface FaqItem {
  id: string;
  title: string;
  content: string;
}

export interface FaqsProps {
  accordionItems: FaqItem[];
}

const initialFaqsData: FaqsProps = {
  accordionItems: [],
};

interface FaqsStore extends GenericState<FaqsProps> {
  getFaqs: () => Promise<void>;
  clearFaqs: () => void;
}

const useFaqs = create<FaqsStore>()((set, get) => {
  const initialState = createGenericInitialState<FaqsProps>({
    data: initialFaqsData,
    loading: true,
  });

  return {
    ...initialState,

    getFaqs: async () => {
      const { callApi } = useApiStore.getState();

      set({ data: undefined, loading: true, error: undefined });

      try {
        const data = await callApi({
          url: apiRoutes.faqs,
          method: methods.GET,
        });

        set({ data, loading: false, error: undefined });
      } catch (error: any) {
        set({ data: undefined, loading: false, error });
      }
    },

    clearFaqs: () => {
      set({ data: undefined, loading: false, error: null });
    },
  };
});

export default useFaqs;
