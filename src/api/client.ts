import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { fetch as nitroFetch } from 'react-native-nitro-fetch';
import { store } from '../redux/store';
import { constants } from '../utils/constants';

// ====== AXIOS CLIENT (For Text APIs) ======
const api = axios.create({
  baseURL: constants.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      config.headers['Content-Type'] = 'multipart/form-data';
    }

    return config;
  },
  (error: any) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response?.data;
  },
  (error: any) => {
    return Promise.reject(error);
  },
);

interface ClientParams {
  method?: string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  useNitro?: boolean;
  [key: string]: any;
}

// ====== NITRO CLIENT (For Media APIs) ======
const nitroClient = async ({
  method = 'GET',
  url,
  data,
  headers = {},
}: ClientParams) => {
  try {
    const state = store.getState();
    const token = state.auth.token;

    const fullUrl = url.startsWith('http')
      ? url
      : `${constants.BASE_URL}${url}`;
    console.log('fullUrl: ', fullUrl);

    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    const fetchOptions: any = {
      method: (method || 'GET').toUpperCase(),
      headers: requestHeaders,
    };

    // Handle FormData for Nitro-Fetch
    if (data && data instanceof FormData) {
      console.log('📦 Converting FormData for Nitro-Fetch...');

      // Nitro-Fetch requires body as FormData without Content-Type header
      // The browser/native layer will set the correct Content-Type with boundary
      fetchOptions.body = data;

      // Don't set Content-Type manually - let the native layer handle it
      delete requestHeaders['Content-Type'];
    } else if (
      data &&
      ['POST', 'PUT', 'PATCH'].includes((method || 'GET').toUpperCase())
    ) {
      fetchOptions.body = JSON.stringify(data);
      requestHeaders['Content-Type'] = 'application/json';
    }

    console.log('🚀 Nitro-Fetch options:', {
      url: fullUrl,
      method: fetchOptions.method,
      hasBody: !!fetchOptions.body,
      isFormData: data instanceof FormData,
    });

    const response = await nitroFetch(fullUrl, fetchOptions);

    console.log('✅ Nitro-Fetch response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.message || `Request failed with status ${response.status}`,
      );
    }

    return await response.json();
  } catch (error: any) {
    console.error('❌ Nitro-Fetch error:', error);
    throw error;
  }
};

// ====== MAIN ROUTER ======
const client = ({
  method = 'get',
  url,
  data,
  headers = {},
  useNitro = false,
  ...otherParams
}: ClientParams) => {
  if (useNitro) {
    console.log('🚀 Using Nitro-Fetch for:', url);
    return nitroClient({
      method,
      url,
      data,
      headers,
      ...otherParams,
    });
  }

  // Otherwise, use Axios (default for text APIs)
  return api({
    method,
    url,
    data,
    headers,
    ...otherParams,
  });
};

export default client;
