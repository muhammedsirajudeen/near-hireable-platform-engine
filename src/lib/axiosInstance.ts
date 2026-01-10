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

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
         if (isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
               failedQueue.push({ resolve, reject });
            })
               .then(() => {
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
            await axios.post("/api/auth/refresh", {}, { withCredentials: true });

            processQueue(null);
            isRefreshing = false;

            // Retry the original request
            return axiosInstance(originalRequest);
         } catch (refreshError) {
            processQueue(refreshError as Error);
            isRefreshing = false;

            // Redirect to login if refresh fails
            if (typeof window !== "undefined") {
               window.location.href = "/signin";
            }

            return Promise.reject(refreshError);
         }
      }

      return Promise.reject(error);
   }
);

export default axiosInstance;
