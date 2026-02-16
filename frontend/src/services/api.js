import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response, //if responds succeed, return it
  (error) => {
    const errorStatus = error.response ? error.response.status : null;

    // Token expired or invalid
    if (errorStatus === 401) {
      localStorage.removeItem("userInfo");
      window.location.replace("/login");
    }

    if (errorStatus === 403) {
      localStorage.removeItem("userInfo");
      window.location.replace("/login?message=blocked");
    }

    return Promise.reject(error);
  },
);

export default api;
