import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const API = axios.create({
  baseURL,
  withCredentials: true,
});

async function refreshAccessToken() {
  const { data } = await axios.post(
    `${baseURL}/auth/refresh`,
    {},
    { withCredentials: true }
  );
  return data.token;
}

API.interceptors.response.use(
  (r) => r,
  async (error) => {
    const cfg = error.config;
    if (!cfg || cfg._didRefresh) return Promise.reject(error);
    const status = error.response?.status;
    if (status !== 401 && status !== 403) return Promise.reject(error);
    const url = String(cfg.url || '');
    if (
      url.includes('/auth/refresh') ||
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/magic-link') ||
      url.includes('/auth/passkeys/auth/verify') ||
      url.includes('/auth/passkeys/register/verify')
    ) {
      return Promise.reject(error);
    }
    cfg._didRefresh = true;
    try {
      const newToken = await refreshAccessToken();
      localStorage.setItem('token', newToken);
      cfg.headers.Authorization = `Bearer ${newToken}`;
      return API(cfg);
    } catch {
      localStorage.removeItem('token');
      return Promise.reject(error);
    }
  }
);

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: true,

      checkAuth: async () => {
        const applyUser = async (token) => {
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await API.get('/auth/me');
          set({ user: res.data, token });
        };

        try {
          let token = localStorage.getItem('token');
          if (token) {
            try {
              await applyUser(token);
            } catch {
              token = await refreshAccessToken();
              localStorage.setItem('token', token);
              await applyUser(token);
            }
          } else {
            token = await refreshAccessToken();
            localStorage.setItem('token', token);
            await applyUser(token);
          }
        } catch {
          localStorage.removeItem('token');
          delete API.defaults.headers.common['Authorization'];
          set({ user: null, token: null });
        } finally {
          set({ loading: false });
        }
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

      requestMagicLink: async (email) => {
        const res = await API.post('/auth/magic-link/request', { email });
        return res.data;
      },

      verifyMagicLink: async (token) => {
        const res = await API.post('/auth/magic-link/verify', { token });
        const { user, token: jwtToken } = res.data;
        API.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        localStorage.setItem('token', jwtToken);
        set({ user, token: jwtToken });
        return user;
      },

      passkeyAuthOptions: async (email) => {
        const res = await API.post('/auth/passkeys/auth/options', email ? { email } : {});
        return res.data;
      },

      passkeyAuthVerify: async (credential) => {
        const res = await API.post('/auth/passkeys/auth/verify', { credential });
        const { user, token: jwtToken } = res.data;
        API.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
        localStorage.setItem('token', jwtToken);
        set({ user, token: jwtToken });
        return user;
      },

      passkeyRegisterOptions: async () => {
        const res = await API.post('/auth/passkeys/register/options', {});
        return res.data;
      },

      passkeyRegisterVerify: async (credential) => {
        const res = await API.post('/auth/passkeys/register/verify', { credential });
        return res.data;
      },

      logout: () => {
        API.post('/auth/logout', {}, { withCredentials: true }).catch(() => {});
        localStorage.removeItem('token');
        delete API.defaults.headers.common['Authorization'];
        set({ user: null, token: null });
      },
    }),
    { name: 'auth-storage' }
  )
);

export default API;
