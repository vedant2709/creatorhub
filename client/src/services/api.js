import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true
});

const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/refresh-token"
];

const isAuthEndpoint = (url = "") =>
  AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

const emitLogout = () => {
  try {
    window.dispatchEvent(new CustomEvent("auth:logout"));
  } catch {
    // no-op (non-browser env)
  }
};

// 🔥 Track refresh state
let isRefreshing = false;
let failedQueue = [];

// 🔥 Process queued requests
const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const initialError = error;
    const originalRequest = error.config;

    // 🔥 If 401 and not retried
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthEndpoint(originalRequest?.url)
    ) {

      if (isRefreshing) {
        // 🔥 queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          "/api/auth/refresh-token",
          {},
          { withCredentials: true }
        );

        processQueue(null);
        return api(originalRequest); // 🔥 retry original request

      } catch (err) {
        processQueue(err);

        // 🔥 logout if refresh fails
        // Don't hard-redirect here (causes reload loops on public pages like `/`),
        // instead notify AuthProvider so protected routes can navigate naturally.
        emitLogout();
        // Surface the original 401 rather than the refresh-token error message.
        return Promise.reject(initialError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
