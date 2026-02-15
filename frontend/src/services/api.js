import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Accept": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response, //if responds succeed, return it
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("userInfo");
      window.location.replace("/login");
    }
    return Promise.reject(error);
  },
);

export default api;
