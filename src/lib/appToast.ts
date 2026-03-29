import { toast, type ToastPromiseParams, type ToastOptions } from "react-toastify";

/** Single set of options for every programmatic toast (matches ToastContainer defaults). */
export const appToastOptions: ToastOptions = {
  position: "top-center",
  hideProgressBar: true,
  autoClose: 5000,
  closeOnClick: true,
  pauseOnHover: true,
};

export const appToast = {
  error(message: string): void {
    toast.error(message, appToastOptions);
  },

  success(message: string): void {
    toast.success(message, appToastOptions);
  },

  info(message: string): void {
    toast.info(message, appToastOptions);
  },

  warning(message: string): void {
    toast.warning(message, appToastOptions);
  },

  promise<T>(promise: Promise<T>, messages: ToastPromiseParams<T>): Promise<T> {
    return toast.promise(promise, messages as ToastPromiseParams, appToastOptions);
  },
};
