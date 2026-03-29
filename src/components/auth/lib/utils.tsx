import { cookies } from '@lib/utils/cookies';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { authTokenKey } from './constant';
import { ILoginSession, ISession, ITokenData } from './interfaces';

/** Fired after `setAuthSession` / `clearAuthSession` so UI can re-sync. */
export const AUTH_SESSION_CHANGED_EVENT = 'drawup-auth-session-changed';

const unAuthorizedSession: ISession = {
  isLoading: false,
  isAuthenticate: false,
  user: null,
  expires: null,
  token: null,
};

export const setAuthSession = (session: ILoginSession): ISession => {
  if (typeof window === 'undefined') {
    return { ...unAuthorizedSession, isLoading: true };
  }
  try {
    if (!session.token) return unAuthorizedSession;

    const tokenData: ITokenData = jwtDecode(session.token);
    cookies.setData(authTokenKey, session.token, new Date(tokenData.exp * 1000));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
    }

    return {
      isLoading: false,
      isAuthenticate: true,
      user: tokenData.user,
      expires: new Date(tokenData.exp * 1000),
      token: session.token,
    };
  } catch (error) {
    console.error(error);
    return unAuthorizedSession;
  }
};

export const clearAuthSession = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    cookies.removeData(authTokenKey);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const token = cookies.getData(authTokenKey);
    return token ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getServerAuthSession = (req: { cookies: Record<string, any> }): ISession => {
  try {
    const token = req.cookies[authTokenKey] || req.cookies?.get(authTokenKey)?.value;
    if (!token) return unAuthorizedSession;
    const isExpired = isJwtExpired(token);
    if (isExpired) return unAuthorizedSession;

    const tokenData: ITokenData = jwtDecode(token);
    return {
      isLoading: false,
      isAuthenticate: true,
      user: tokenData.user,
      expires: new Date(tokenData.exp * 1000),
      token: token,
    };
  } catch (error) {
    console.error(error);
    return unAuthorizedSession;
  }
};

export const getAuthSession = (): ISession => {
  if (typeof window === 'undefined') {
    return { ...unAuthorizedSession, isLoading: true };
  }
  try {
    const token = cookies.getData(authTokenKey);
    if (!token) return unAuthorizedSession;
    const isExpired = isJwtExpired(token);
    if (isExpired) return unAuthorizedSession;

    const tokenData: ITokenData = jwtDecode(token);
    return {
      isLoading: false,
      isAuthenticate: true,
      user: tokenData.user,
      expires: new Date(tokenData.exp * 1000),
      token: token,
    };
  } catch (error) {
    console.error(error);
    return unAuthorizedSession;
  }
};

export const useAuthSession = (): ISession => {
  const [session, setSession] = useState<ISession>({ ...unAuthorizedSession, isLoading: true });

  useEffect(() => {
    const sync = (): void => {
      setSession(getAuthSession());
    };
    sync();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, sync);
    return () => window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, sync);
  }, []);

  return session;
};

export function isJwtExpired(token: string): boolean {
  if (!token) return true;
  try {
    const tokenData = jwtDecode<ITokenData>(token);
    if (!tokenData?.exp) return true;
    const expDate = new Date(tokenData.exp * 1000);
    return expDate <= new Date();
  } catch {
    return true;
  }
}
