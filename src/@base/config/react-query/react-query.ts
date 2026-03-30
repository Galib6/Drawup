import { MutationCache, QueryCache, QueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { appToast } from '@/lib/appToast';

type PromiseValue<T> = T extends Promise<infer R> ? R : T;
type ToastHandledError = Error & { __appToastHandled?: boolean };
function isAuthPath(pathname: string): boolean {
  return pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // useErrorBoundary: true,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error: Error) => {
      if ((error as ToastHandledError).__appToastHandled) return;
      const placement = typeof window !== "undefined" && isAuthPath(window.location.pathname)
        ? "top-center"
        : undefined;
      appToast.error(error?.message || "Something went wrong", { placement });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: Error) => {
      if ((error as ToastHandledError).__appToastHandled) return;
      const placement = typeof window !== "undefined" && isAuthPath(window.location.pathname)
        ? "top-center"
        : undefined;
      appToast.error(error?.message || "Something went wrong", { placement });
    },
  }),
});
export type QueryConfig<FetcherFnType extends (...args: any) => any> = UseQueryOptions<
  PromiseValue<ReturnType<FetcherFnType>>
>;

export type MutationConfig<FetcherFnType extends (...args: any) => any> = UseMutationOptions<
  PromiseValue<ReturnType<FetcherFnType>>,
  AxiosError,
  Parameters<FetcherFnType>[0]
>;
