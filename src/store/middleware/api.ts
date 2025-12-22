import { create } from 'zustand';
import axios, { AxiosRequestConfig } from 'axios';
import useLogin from '../auth/useLogin';

// Store controllers for same requests
const pendingRequests = new Map<string, AbortController>();

export interface ApiCallPayload extends AxiosRequestConfig {
  formData?: boolean;
  isLogin?: boolean;
}

interface ApiStore {
  loading: boolean;
  error?: string | null;
  data?: any;
  lastExecutedRequest: string | null;
  callApi: (payload: ApiCallPayload) => Promise<any>;
}

export const useApiStore = create<ApiStore>((set, get) => ({
  loading: false,
  error: null,
  data: undefined,
  lastExecutedRequest: null,

  callApi: async ({
    url,
    method,
    data,
    params,
    formData = false,
    isLogin = false,
  }) => {
    if (!url) return;

    try {
      // Create unique request key
      const requestKey = `${method}-${url}-${JSON.stringify(data || {})}`;

      // Abort previous same request
      if (pendingRequests.has(requestKey)) {
        const previousController = pendingRequests.get(requestKey);
        previousController?.abort();
      }

      // Create new AbortController
      const controller = new AbortController();
      pendingRequests.set(requestKey, controller);

      // Log the latest active request
      console.log('Latest running Request:', requestKey);

      const headers: Record<string, string> = {
        'Content-Type': formData ? 'multipart/form-data' : 'application/json',
      };

      const accessToken = useLogin?.getState()?.getUserInfo()?.accessToken;

      if (!isLogin && accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const requestConfig: AxiosRequestConfig = {
        baseURL: 'http://192.168.1.177:1000/api/data/',
        url,
        method,
        data,
        params,
        headers,
        signal: controller.signal,
      };

      const response = await axios.request(requestConfig);

      pendingRequests.delete(requestKey);

      if (response?.data) {
        return response.data;
      }
    } catch (error: any) {
      const requestKey = `${method}-${url}-${JSON.stringify(data || {})}`;
      pendingRequests.delete(requestKey);

      // Ignore abort logs
      if (axios.isCancel(error) || error?.name === 'AbortError') {
        console.log('⛔ Request aborted:', url);
        return;
      }

      if (error?.response?.status === 401) {
        useLogin?.getState()?.logout();
      }

      const message =
        error?.response &&
        (error?.response?.data || error?.response?.data?.message)
          ? error?.response?.data
          : error?.message || 'Network error';

      throw message;
    }
  },
}));
