import axios from 'axios';
import { clearToken } from './auth';

// Same-origin /api proxy sets auth cookie on the frontend domain (middleware can read it).
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearToken();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default api;
