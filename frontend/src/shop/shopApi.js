// API riêng cho shop - dùng shop_access_token thay vì access_token
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const shopApi = axios.create({ baseURL: API_URL });

shopApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('shop_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

shopApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('shop_refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_URL}/users/token/refresh/`, { refresh });
          localStorage.setItem('shop_access_token', res.data.access);
          error.config.headers.Authorization = `Bearer ${res.data.access}`;
          return shopApi(error.config);
        } catch {
          localStorage.removeItem('shop_access_token');
          localStorage.removeItem('shop_refresh_token');
          localStorage.removeItem('shop_user');
          window.location.href = '/shop/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default shopApi;
