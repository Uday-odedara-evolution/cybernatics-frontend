import { AuthModel, getAuth, removeAuth, setAuth } from '@/auth';
import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_API_URL;
// Create an Axios instance
const ApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Function to get access token
const getAccessToken = () => getAuth()?.access_token;
// Function to get refresh token
const getRefreshToken = () => getAuth()?.refreshToken;
const saveAuth = (auth: AuthModel | undefined) => {
  if (auth) {
    setAuth(auth);
  } else {
    removeAuth();
  }
};
// Function to refresh the token
const refreshToken = async () => {
  try {
    const refresh_token = getRefreshToken();
    if (!refresh_token) {
      return null;
    }
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken: refresh_token
    });
    const newAuth = {
      access_token: response.data.accessToken,
      refreshToken: response.data.refreshToken || refresh_token, // Keep old refresh token if new one not provided
      api_token: response.data.api_token || getAuth()?.api_token || ''
    };

    saveAuth(newAuth);
    return newAuth.access_token;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Refresh token failed', error);
    saveAuth(undefined);
    localStorage.clear();
    return null;
  }
};

// Request interceptor to add access token
ApiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry
ApiClient.interceptors.response.use(
  (response) => response, // Return response if successful
  async (error) => {
    let originalRequest = error.config;

    // If 401 Unauthorized and request is not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken();
      if (newToken) {
        ApiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return ApiClient(originalRequest); // Retry the request with new token
      }
    }
    return Promise.reject(error);
  }
);

export default ApiClient;
