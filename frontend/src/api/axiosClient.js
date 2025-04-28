import axios from 'axios';
import {store } from '../redux/store';
import { logout, login } from '../redux/Reducer/authSlice';
import { refreshToken } from '../service/apiService';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_REACT_API,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

apiClient.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => apiClient(originalRequest))
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshTokenValue = localStorage.getItem('refresh_token');
                if (!refreshTokenValue) {
                    throw new Error('No refresh token available');
                }

                const response = await refreshToken(refreshTokenValue);
                
                if (response.access) {
                    store.dispatch(login(response.access));
                    processQueue();
                    
                    originalRequest.headers.Authorization = `Bearer ${response.access}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError);
                store.dispatch(logout());
                // window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;