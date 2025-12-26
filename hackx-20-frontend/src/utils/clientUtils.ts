import axios from "axios";
import axiosRetry from "axios-retry";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

export const getLocation = async () => {
  const res = await axios.get("https://ipinfo.io/json?token=884af11fe95b92");
  if (res.status === 200) {
    return res.data;
  }
};
// dfce8ea553294447a3e3466f2ccbba1c

export const axiosInstance = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error),
});

// -------------
// Toast lock
// -------------
let isShowingError = false;
let errorTimeout: NodeJS.Timeout;

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("__chatLegis__");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.clear();
      sessionStorage.clear();
      Cookies.remove("__chatLegis__");
      if (!isShowingError) {
        isShowingError = true;
        toast.error("Session expired. Please log in again.");
        setTimeout(() => (isShowingError = false), 2000); // reset lock after 2s
      }
      location.reload();
    } else {
      const message =
        error?.response?.data?.message || "Something went wrong. Try again.";

      if (!isShowingError) {
        isShowingError = true;
        toast.error(message);
        clearTimeout(errorTimeout);
        errorTimeout = setTimeout(() => {
          isShowingError = false;
        }, 2000); // lock duration (2s)
      }
    }

    return Promise.reject(error);
  }
);
