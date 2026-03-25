import axios from 'axios';
import { authStore } from '@/store/authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
api.interceptors.request.use((config) => {
  const { accessToken } = authStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor: Handle 401 + token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const url = originalRequest.url || '';
      const isAuthEndpoint = url.includes('/api/auth/');

      // Skip refresh for auth endpoints (they handle their own errors)
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      try {
        const { refreshToken } = authStore.getState();
        if (!refreshToken) {
          authStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh`,
          { refreshToken }
        );

        // Update tokens in store
        authStore.getState().refreshTokens(
          response.data.accessToken,
          refreshToken
        );

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout and redirect
        authStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
