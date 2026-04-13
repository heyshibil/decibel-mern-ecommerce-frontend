import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 60000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response, //if responds succeed, return it
  async (error) => {
    const errorStatus = error.response ? error.response.status : null;
    const originalRequest = error.config;

    if (errorStatus === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/users/refresh`, {
          withCredentials: true,
        });

        return api(originalRequest);
      } catch (refreshError) {
        // If the refresh fails (e.g., the 7-day token expired, or the user was deleted/blocked)
        localStorage.removeItem("userInfo");
        window.location.replace("/login?message=session_expired");
        return Promise.reject(refreshError);
      }
    }

    if (errorStatus === 403) {
      localStorage.removeItem("userInfo");
      window.location.replace("/login?message=blocked");
    }

    return Promise.reject(error);
  },
);

export default api;
