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

  // ====== NEW: MEDIA SECTION (Images/Videos) ======
  MEDIA: {
    uploadMedia: (data: any, options?: ApiOptions) =>
      client({
        method: constants.METHODS.POST,
        url: `/upload`,
        data,
        isFormData: true,
        useNitro: true,
        ...options,
      }),

    getMedia: (type: 'image' | 'video', options?: ApiOptions) =>
      client({
        method: constants.METHODS.GET,
        url: `/upload?type=${type}`,
        ...options,
      }),
  },
};

export default api;
