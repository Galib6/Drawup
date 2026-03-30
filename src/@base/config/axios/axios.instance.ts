
import { authTokenKey } from "@/components/auth/lib/constant";
import { getAuthToken } from "@/components/auth/lib/utils";
import { ENV } from "@/environments";
import { appToast } from "@/lib/appToast";
import { cookies } from "@lib/utils/cookies";
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import type { IBaseResponse } from "@base/interfaces/interfaces";

function isAuthPath(pathname: string): boolean {
  return pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
}

export const AxiosInstance = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 15000,
});

AxiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.baseURL = ENV.apiUrl;
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

AxiosInstance.interceptors.response.use(
  (response: AxiosResponse<IBaseResponse>) => response,
  (error: AxiosError<IBaseResponse>) => {
    if (!error.response) return Promise.reject(error);
    if (typeof window === "undefined") return Promise.reject(error);
    if (error.response.status === 401) {
      cookies.removeData(authTokenKey);
      window.location.reload();
      return Promise.reject(error);
    }
    if (error.response.data?.success === false) {
      const placement = isAuthPath(window.location.pathname) ? "top-center" : undefined;
      error.response.data.errorMessages?.forEach((x) => {
        appToast.error(x, { placement });
      });
      (error as AxiosError & { __appToastHandled?: boolean }).__appToastHandled = true;
    }
    return Promise.reject(error);
  },
);
