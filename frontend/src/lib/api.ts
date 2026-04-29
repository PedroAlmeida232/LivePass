import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Token is now handled by httpOnly cookies and proxied on the server
api.interceptors.request.use((config) => {
  return config;
});

// Response interceptor: redirect to /login on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      error.response?.status === 401 && 
      !error.config.url.includes("/auth/login") &&
      typeof window !== "undefined"
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
