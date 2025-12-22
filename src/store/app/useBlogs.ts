import { create } from 'zustand';

import { createGenericInitialState, GenericState } from '../types';
import { useApiStore } from '../middleware/api';
import { apiRoutes, methods } from '../apiRoutes';

export interface BlogItem {
  id: string;
  name: string;
  imageUrl: string;
  details: string;
}

export interface BlogsProps {
  items: BlogItem[];
}

const initialBlogsData: BlogsProps = {
  items: [],
};

interface BlogsStore extends GenericState<BlogsProps> {
  getBlogs: () => Promise<void>;
  clearBlogs: () => void;
}

const useBlogs = create<BlogsStore>()((set, get) => {
  const initialState = createGenericInitialState<BlogsProps>({
    data: initialBlogsData,
    loading: true,
  });

  return {
    ...initialState,

    getBlogs: async () => {
      const { callApi } = useApiStore.getState();

      set({ data: undefined, loading: true, error: undefined });

      try {
        const data = await callApi({
          url: apiRoutes.blogs,
          method: methods.GET,
        });

        set({ data, loading: false, error: undefined });
      } catch (error: any) {
        set({ data: undefined, loading: false, error });
      }
    },

    clearBlogs: () => {
      set({ data: undefined, loading: false, error: null });
    },
  };
});

export default useBlogs;
