import { ErrorHandler } from '@lib/utils/errorHandler';
import { AxiosInstance } from "@base/config";
import { IBaseResponse } from "@base/interfaces/interfaces";
import {
  IChangeGeneratedPass,
  IChangePass,
  IFlogin,
  ILoginResponse,
  ILoginSession,
  IResetPassReq,
  IResetPassVerify,
  ISendOtp,
  ISignup,
  ISignupResponse,
  IValidateResponse,
  IVerifyOtp,
  IVerifyOtpResponse,
} from './interfaces';
const END_POINT = '/auth';

export const AuthService = {
  async login(payload: IFlogin): Promise<ILoginResponse> {
    try {
      const data = await AxiosInstance.post(`${END_POINT}/login`, payload);
      return data?.data;
    } catch (error) {
      throw ErrorHandler(error);
    }
  },
  async signup(payload: ISignup): Promise<IVerifyOtpResponse> {
    try {
      const data = await AxiosInstance.post(`${END_POINT}/register`, payload);
      return data?.data;
    } catch (error) {
      throw ErrorHandler(error);
    }
  },
  async sendOtp(payload: ISendOtp): Promise<ISignupResponse> {
    try {
      const data = await AxiosInstance.post(`${END_POINT}/send-otp`, payload);
      return data?.data;
    } catch (error) {
      throw ErrorHandler(error);
    }
  },
  async verifyOtp(payload: IVerifyOtp): Promise<IVerifyOtpResponse> {
    try {
      const data = await AxiosInstance.post(`${END_POINT}/verify-otp`, payload);
      return data?.data;
    } catch (error) {
      throw ErrorHandler(error);
    }
  },
  async changePass(payload: IChangePass): Promise<IBaseResponse> {
    try {
      const data = await AxiosInstance.post(`${END_POINT}/change-password`, payload);
      return data?.data;
    } catch (error) {
      throw ErrorHandler(error);
    }
  },
  async changeGeneratedPass(payload: IChangeGeneratedPass): Promise<IBaseResponse<ILoginSession>> {
    try {
      const data = await AxiosInstance.post(`${END_POINT}/change-system-generated-password`, payload);
      return data?.data;
    } catch (error) {
      throw ErrorHandler(error);
    }
  },
  async resetPassReq(payload: IResetPassReq): Promise<ISignupResponse> {
    try {
      const data = await AxiosInstance.post(`${END_POINT}/reset-password-request`, payload);
      return data?.data;
    } catch (error) {
      throw ErrorHandler(error);
    }
  },
  async resetPassVerify(payload: IResetPassVerify): Promise<IBaseResponse<ILoginSession>> {
    try {
      const data = await AxiosInstance.post(`${END_POINT}/reset-password-verify`, payload);
      return data?.data;
    } catch (error) {
      throw ErrorHandler(error);
    }
  },
  async setEmail(payload: { token: string; email: string }): Promise<IBaseResponse<ILoginSession>> {
    try {
      const data = await AxiosInstance.post(`${END_POINT}/set-email`, payload);
      return data?.data;
    } catch (error) {
      throw ErrorHandler(error);
    }
  },
  async validate(payload: { token: string; provider: string }): Promise<IBaseResponse<IValidateResponse>> {
    try {
      const data = await AxiosInstance.post(`${END_POINT}/validate`, payload);
      return data?.data;
    } catch (error) {
      throw ErrorHandler(error);
    }
  },
};
