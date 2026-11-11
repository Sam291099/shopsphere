
import axios from "axios";
import authService from "./authService";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the current JWT to every API request.
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Clear the session when the backend rejects an expired
// or invalid authentication token.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    if (
      status === 401 &&
      !requestUrl.includes("/auth/login") &&
      !requestUrl.includes("/auth/register") &&
      authService.getToken()
    ) {
      authService.logout();

      window.dispatchEvent(
        new Event("shopsphere:auth-expired")
      );
    }

    return Promise.reject(error);
  }
);

export default api;
