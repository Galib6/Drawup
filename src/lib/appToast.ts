import type { ReactNode } from "react";
import {
  patchNotification,
  pushNotification,
} from "@/lib/notifications/store";

/** Default time before a notification is removed (ms). */
export const APP_TOAST_DURATION_MS = 3000;

export type AppToastPromiseMessages = {
  pending: string;
  success: string;
  error: string;
  pendingIcon?: ReactNode;
  successIcon?: ReactNode;
};

export const appToast = {
  error(message: string): void {
    pushNotification({
      variant: "error",
      message,
      durationMs: APP_TOAST_DURATION_MS,
    });
  },

  success(message: string): void {
    pushNotification({
      variant: "success",
      message,
      durationMs: APP_TOAST_DURATION_MS,
    });
  },

  info(message: string): void {
    pushNotification({
      variant: "info",
      message,
      durationMs: APP_TOAST_DURATION_MS,
    });
  },

  warning(message: string): void {
    pushNotification({
      variant: "warning",
      message,
      durationMs: APP_TOAST_DURATION_MS,
    });
  },

  promise<T>(promise: Promise<T>, messages: AppToastPromiseMessages): Promise<T> {
    const id = pushNotification({
      variant: "loading",
      message: messages.pending,
      durationMs: 0,
      icon: messages.pendingIcon,
    });
    return promise
      .then((value) => {
        patchNotification(id, {
          variant: "success",
          message: messages.success,
          durationMs: APP_TOAST_DURATION_MS,
          icon: messages.successIcon,
        });
        return value;
      })
      .catch((err: unknown) => {
        patchNotification(id, {
          variant: "error",
          message: messages.error,
          durationMs: APP_TOAST_DURATION_MS,
        });
        throw err;
      });
  },
};
