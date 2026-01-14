import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const axiosInstance = axios.create({
   baseURL: "/api",
   withCredentials: true,
   headers: {
      "Content-Type": "application/json",
   },
});

// Request interceptor
axiosInstance.interceptors.request.use(
   (config: InternalAxiosRequestConfig) => {
      // Cookies are automatically sent with withCredentials: true
      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
);

// Response interceptor for handling token refresh
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;
let failedQueue: Array<{
   resolve: (value?: unknown) => void;
   reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
   failedQueue.forEach((prom) => {
      if (error) {
         prom.reject(error);
      } else {
         prom.resolve();
      }
   });
   failedQueue = [];
};

// Endpoints that should not trigger refresh logic
const NO_REFRESH_ENDPOINTS = [
   "/auth/refresh",
   "/auth/signin",
   "/auth/signup",
   "/auth/logout",
   "/auth/admin/login",
   "/auth/google",
   "/auth/me", // Don't auto-refresh on /me - let AuthContext handle it
];

const shouldSkipRefresh = (url: string | undefined): boolean => {
   if (!url) return false;
   return NO_REFRESH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

axiosInstance.interceptors.response.use(
   (response) => {
      return response;
   },
   async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Ignore if no config (shouldn't happen)
      if (!originalRequest) {
         return Promise.reject(error);
      }

      // Don't retry for auth endpoints - they should fail normally
      if (shouldSkipRefresh(originalRequest.url)) {
         return Promise.reject(error);
      }

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
         if (isRefreshing && refreshPromise) {
            // If already refreshing, wait for the current refresh to complete
            try {
               await refreshPromise;
               // Refresh successful, retry the original request
               originalRequest._retry = true;
               return axiosInstance(originalRequest);
            } catch (refreshError) {
               return Promise.reject(refreshError);
            }
         }

         originalRequest._retry = true;
         isRefreshing = true;

         // Create a new refresh promise
         refreshPromise = (async () => {
            try {
               // Try to refresh the token using plain fetch to avoid interceptor loops
               const response = await fetch("/api/auth/refresh", {
                  method: "POST",
                  credentials: "include",
                  headers: {
                     "Content-Type": "application/json",
                  },
               });

               if (!response.ok) {
                  throw new Error("Refresh failed");
               }

               // Refresh successful, process queued requests
               processQueue(null);
            } catch (refreshError) {
               // Refresh failed, reject all queued requests
               processQueue(refreshError as Error);
               throw refreshError;
            } finally {
               isRefreshing = false;
               refreshPromise = null;
            }
         })();

         try {
            await refreshPromise;
            // Retry the original request after successful refresh
            return axiosInstance(originalRequest);
         } catch (refreshError) {
            // Redirect to appropriate login page based on current path
            if (typeof window !== "undefined") {
               const isAdminPath = window.location.pathname.startsWith("/admin");
               window.location.href = isAdminPath ? "/admin/login" : "/signin";
            }
            return Promise.reject(refreshError);
         }
      }

      return Promise.reject(error);
   }
);

export default axiosInstance;
