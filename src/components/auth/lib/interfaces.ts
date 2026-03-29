import { IBaseResponse, IdType } from '../../../@base/interfaces/interfaces';

export interface IFlogin {
  email: string;
  password: string;
}

export interface ISignup {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface IChangePass {
  newPassword: string;
  oldPassword: string;
}

export interface IChangeGeneratedPass {
  identifier: string;
  newPassword: string;
  oldPassword: string;
}

export interface IResetPassReq {
  identifier: string;
}

export interface ISendOtp {
  identifier: string;
  verificationType: 'SIGN_UP' | 'RESET_PASSWORD';
}

export interface IVerifyOtp {
  identifier: string;
  hash: string;
  otp: number;
}

export interface IResetPassVerify {
  identifier: string;
  hash: string;
  otp: number;
  newPassword?: any;
}

export interface ILoginSession {
  token: string;
  refreshToken: string;
  user: {
    id: IdType;
  };
}

export interface ILoginResponse extends IBaseResponse {
  data: ILoginSession & {
    hash: string;
    identifier: string;
    isVerified: boolean;
    otp: number;
  } & {
    identifier: string;
    isPasswordSystemGenerated: boolean;
  };
}

export interface ISignupResponse extends IBaseResponse {
  data: {
    identifier: string;
    otp: number;
    hash: string;
  };
}
export interface IVerifyOtpResponse extends IBaseResponse {
  data: ILoginSession & {
    identifier: string;
    isPasswordSystemGenerated: boolean;
  };
}

export interface IValidateResponse extends ILoginSession {
  isEmailRequired: boolean;
}

export interface ISSOptions {
  callbackUrl: string;
  apiKey: string;
  apiSecret: string;
}

export interface ISSOResponse extends IBaseResponse {
  data: {
    webLoginUrl: string;
  };
}

export interface ITokenData {
  user: {
    id: IdType;
    email: string;
  };
  iat: number;
  exp: number;
}

export interface ISession {
  isLoading: boolean;
  isAuthenticate: boolean;
  user: {
    id: IdType;
    email: string;
    name?: string;
  };
  expires: Date;
  token: string;
}
