import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: true,

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await API.get('/auth/me');
            set({ user: res.data, token });
          } catch (error) {
            localStorage.removeItem('token');
            set({ user: null, token: null });
          }
        }
        set({ loading: false });
      },

      login: async (email, password) => {
        const res = await API.post('/auth/login', { email, password });
        const { user, token } = res.data;
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
        set({ user, token });
        return user;
      },

      register: async (email, username, password, fullName) => {
        const res = await API.post('/auth/register', {
          email,
          username,
          password,
          fullName,
        });
        const { user, token } = res.data;
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
        set({ user, token });
        return user;
      },

      logout: () => {
        localStorage.removeItem('token');
        delete API.defaults.headers.common['Authorization'];
        set({ user: null, token: null });
      },
    }),
    { name: 'auth-storage' }
  )
);

export default API;
