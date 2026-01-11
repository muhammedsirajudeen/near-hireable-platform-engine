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

// Response interceptor
let isRefreshing = false;
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

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
         if (isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
               failedQueue.push({ resolve, reject });
            })
               .then(() => {
                  // When resolved, retry the original request
                  // We mark it as retried to prevent infinite loops if it fails again
                  originalRequest._retry = true;
                  return axiosInstance(originalRequest);
               })
               .catch((err) => {
                  return Promise.reject(err);
               });
         }

         originalRequest._retry = true;
         isRefreshing = true;

         try {
            // Try to refresh the token
            // We use the global axios instance to avoid circular interception, 
            // but ensure we send credentials (cookies)
            await axios.post("/api/auth/refresh", {}, {
               baseURL: process.env.NEXT_PUBLIC_API_URL || "", // Ensure absolute URL if needed, though usually relative works on client
               withCredentials: true
            });

            // If we get here, refresh was successful
            processQueue(null);
            isRefreshing = false;

            // Retry the original request
            return axiosInstance(originalRequest);
         } catch (refreshError) {
            // If refresh fails, reject all queued requests
            processQueue(refreshError as Error);
            isRefreshing = false;

            // Redirect to login if refresh fails and we are on client side
            if (typeof window !== "undefined") {
               // Optional: Clear any local state if needed
               window.location.href = "/signin";
            }

            return Promise.reject(refreshError);
         }
      }

      return Promise.reject(error);
   }
);

export default axiosInstance;
