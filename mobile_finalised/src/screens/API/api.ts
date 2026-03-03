import axios from 'axios';
import { useAuth } from '../../store/auth'; // Path to your auth store

const api = axios.create({
  baseURL: 'http://192.168.0.108:7179/api', 
  timeout: 10000, // 10 seconds timeout helps debug hanging requests
});

// The authApi object that your Store was trying to import
export const authApi = {
  // Maps to [HttpPost("login")] in AuthController.cs
  login: async (dto: any) => {
    const response = await api.post('/auth/login', dto);
    return response.data; // Returns TokenExchangeRequestDto
  },

  // Maps to [HttpPost("refresh")] in AuthController.cs
  refresh: async (dto: { token: string; refreshToken: string }) => {
    const response = await api.post('/auth/refresh', dto);
    return response.data; // Returns rotated tokens
  }
};

// Request Interceptor: Attach JWT to every call
api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle the auto-refresh logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { token, refreshToken, setTokens, logout } = useAuth.getState();
        
        // This triggers the RefreshTokenAsync logic in your UserService.cs
        const res = await authApi.refresh({ token: token!, refreshToken: refreshToken! });

        await setTokens(res.token, res.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${res.token}`;
        return api(originalRequest);
      } catch (err) {
        useAuth.getState().logout();
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;