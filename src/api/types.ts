export interface ClientParams {
  method?: string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  isFormData?: boolean;
  useNitro?: boolean;
  [key: string]: any;
}

export interface ApiResponse {
  data?: any;
  status?: number;
  message?: string;
  error?: any;
}
