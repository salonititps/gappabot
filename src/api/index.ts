import client from './client';
import { constants } from '../utils/constants';

interface ApiOptions {
  useNitro?: boolean;
}

const api = {
  // ====== AUTH SECTION ======
  AUTH: {
    login: (data: any, options?: ApiOptions) =>
      client({
        method: constants.METHODS.POST,
        url: `/user/login`,
        data,
        ...options,
      }),

    register: (data: any, options?: ApiOptions) =>
      client({
        method: constants.METHODS.POST,
        url: `/user/register`,
        data,
        ...options,
      }),
  },

  // ====== MEDIA SECTION ======
  MEDIA: {
    uploadMedia: (data: any, options?: ApiOptions) =>
      client({
        method: constants.METHODS.POST,
        url: `/upload`,
        data,
        isFormData: true,
        // useNitro: true,
        ...options,
      }),

    getMedia: (
      type: 'image' | 'video',
      page: number = 1,
      limit: number = 50,
      options?: ApiOptions,
    ) =>
      client({
        method: constants.METHODS.GET,
        url: `/upload?type=${type}&page=${page}&limit=${limit}`,
        ...options,
      }),

    deleteMedia: (id: string, options?: ApiOptions) =>
      client({
        method: constants.METHODS.DELETE,
        url: `/upload/${id}`,
        ...options,
      }),
  },
};

export default api;
