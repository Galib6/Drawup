import { useMutation } from '@tanstack/react-query';
import { MutationConfig } from "@base/config";
import { AuthService } from './service';
import { clearAuthSession } from './utils';

//---------------- useLogin hook ------------------------------------
type IUseLogin = {
  config?: MutationConfig<typeof AuthService.login>;
};
export const useLogin = ({ config }: IUseLogin = {}) => {
  return useMutation({
    ...config,
    mutationFn: AuthService.login,
  });
};

//---------------- useSignup hook ------------------------------------
type IUseSignup = {
  config?: MutationConfig<typeof AuthService.signup>;
};
export const useSignup = ({ config }: IUseSignup = {}) => {
  return useMutation({
    ...config,
    mutationFn: AuthService.signup,
  });
};

//---------------- useSendOtp hook ------------------------------------
type IUseSendOtp = {
  config?: MutationConfig<typeof AuthService.sendOtp>;
};
export const useSendOtp = ({ config }: IUseSendOtp = {}) => {
  return useMutation({
    ...config,
    mutationFn: AuthService.sendOtp,
  });
};

//---------------- useVerifyOtp hook ------------------------------------
type IUseVerifyOtp = {
  config?: MutationConfig<typeof AuthService.verifyOtp>;
};
export const useVerifyOtp = ({ config }: IUseVerifyOtp = {}) => {
  return useMutation({
    ...config,
    mutationFn: AuthService.verifyOtp,
  });
};

//---------------- useResetPassReqHook ------------------------------------
type IUseResetPassReq = {
  config?: MutationConfig<typeof AuthService.resetPassReq>;
};
export const useResetPassReq = ({ config }: IUseResetPassReq = {}) => {
  return useMutation({
    ...config,
    mutationFn: AuthService.resetPassReq,
  });
};

//---------------- useResetPassVerifyHook ------------------------------------
type IUseResetPassVerify = {
  config?: MutationConfig<typeof AuthService.resetPassVerify>;
};
export const useResetPassVerify = ({ config }: IUseResetPassVerify = {}) => {
  return useMutation({
    ...config,
    mutationFn: AuthService.resetPassVerify,
  });
};

//---------------- useChangePasswordHook ------------------------------------
type IUseChangePassword = {
  config?: MutationConfig<typeof AuthService.changePass>;
};
export const useChangePassword = ({ config }: IUseChangePassword = {}) => {
  return useMutation({
    ...config,
    mutationFn: AuthService.changePass,
  });
};

//---------------- useChangeGeneratedPasswordHook ------------------------------------
type IUseChangeGeneratedPassword = {
  config?: MutationConfig<typeof AuthService.changeGeneratedPass>;
};
export const useChangeGeneratedPassword = ({ config }: IUseChangeGeneratedPassword = {}) => {
  return useMutation({
    ...config,
    mutationFn: AuthService.changeGeneratedPass,
  });
};

export const useLogout = () => {
  clearAuthSession();
  window.location.reload();
};

//---------------- useSetEmail hook ------------------------------------
type IUseSetEmail = {
  config?: MutationConfig<typeof AuthService.setEmail>;
};
export const useSetEmail = ({ config }: IUseSetEmail = {}) => {
  return useMutation({
    ...config,
    mutationFn: AuthService.setEmail,
  });
};

//---------------- useValidate hook ------------------------------------
type IUseValidate = {
  config?: MutationConfig<typeof AuthService.validate>;
};
export const useValidate = ({ config }: IUseValidate = {}) => {
  return useMutation({
    ...config,
    mutationFn: AuthService.validate,
  });
};
