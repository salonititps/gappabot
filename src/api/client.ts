import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Alert } from 'react-native';
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
  (error: { response: { status: any; data: any } }) => {
    const status = error?.response?.status;
    const errorData = error?.response?.data;

    if (status >= 400 && status < 410) {
      Alert.alert(errorData?.message || 'Client Error');
    } else {
      Alert.alert('Something went wrong');
    }

    return error;
  },
);

interface ClientParams {
  method?: string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  isFormData?: boolean;
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

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    const fetchOptions: RequestInit = {
      method: (method || 'GET').toUpperCase(),
      headers: requestHeaders,
    };

    if (
      data &&
      ['POST', 'PUT', 'PATCH'].includes((method || 'GET').toUpperCase())
    ) {
      if (data instanceof FormData) {
        fetchOptions.body = data;
        delete requestHeaders['Content-Type'];
      } else {
        fetchOptions.body = JSON.stringify(data);
      }
    }

    const response = await nitroFetch(fullUrl, fetchOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const status = response.status;

      if (status >= 400 && status < 410) {
        Alert.alert(errorData?.message || 'Client Error');
      } else {
        Alert.alert('Something went wrong');
      }

      throw new Error(errorData?.message || 'Request failed');
    }

    return await response.json();
  } catch (error: any) {
    Alert.alert(error?.message || 'Network Error');
    throw error;
  }
};

// ====== MAIN ROUTER ======
const client = ({
  method = 'get',
  url,
  data,
  headers = {},
  // requiresAuth = false,
  isFormData = false,
  useNitro = false,
  ...otherParams
}: ClientParams) => {
  // If useNitro is true, use Nitro-Fetch for media/heavy data
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
  console.log('📝 Using Axios for:', url);
  const requestHeaders = { ...headers };

  if (isFormData || data instanceof FormData) {
    delete requestHeaders['Content-Type'];
  }

  return api({
    method,
    url,
    data,
    headers: requestHeaders,
    ...otherParams,
  });
};

export default client;
