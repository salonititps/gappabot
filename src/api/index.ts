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
    uploadProfileImage: (data: any, options?: ApiOptions) =>
      client({
        method: constants.METHODS.POST,
        url: `/users/profile/upload-image`,
        data,
        isFormData: true,
        useNitro: true,
        ...options,
      }),

    uploadVideo: (data: any, options?: ApiOptions) =>
      client({
        method: constants.METHODS.POST,
        url: `/media/upload-video`,
        data,
        isFormData: true,
        useNitro: true,
        ...options,
      }),

    downloadVideo: (videoId: string, options?: ApiOptions) =>
      client({
        method: constants.METHODS.GET,
        url: `/media/download-video/${videoId}`,
        useNitro: true,
        ...options,
      }),

    uploadImage: (data: any, options?: ApiOptions) =>
      client({
        method: constants.METHODS.POST,
        url: `/media/upload-image`,
        data,
        isFormData: true,
        useNitro: true,
        ...options,
      }),
  },
};

export default api;
