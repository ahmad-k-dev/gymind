import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.0.108:7179/api', 
  timeout: 50000,
});

export const authApi = {
  login: async (dto: any) => {
    const response = await api.post('/auth/login', dto);
    return response.data; // TokenExchangeRequestDto
  },
  register: async (dto: any) => {
    // Maps exactly to your CreateUserDto.cs
    const response = await api.post('/auth/register', dto);
    return response.data;
  },
  refresh: async (dto: { token: string; refreshToken: string }) => {
    const response = await api.post('/auth/refresh', dto);
    return response.data;
  }
};

api.interceptors.request.use((config) => {
  // REQUIRE here instead of IMPORT at top to break circular dependency
  const { useAuth } = require('../../store/auth');
  const token = useAuth.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;