import type { ReactNode } from "react";
import {
  patchNotification,
  pushNotification,
  type NotificationPlacement,
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

type AppToastOptions = {
  placement?: NotificationPlacement;
};

type AppToastPromiseOptions = {
  pendingPlacement?: NotificationPlacement;
  successPlacement?: NotificationPlacement;
  errorPlacement?: NotificationPlacement;
};

export const appToast = {
  error(message: string, options: AppToastOptions = {}): void {
    pushNotification({
      variant: "error",
      message,
      durationMs: APP_TOAST_DURATION_MS,
      placement: options.placement,
    });
  },

  success(message: string, options: AppToastOptions = {}): void {
    pushNotification({
      variant: "success",
      message,
      durationMs: APP_TOAST_DURATION_MS,
      placement: options.placement,
    });
  },

  info(message: string, options: AppToastOptions = {}): void {
    pushNotification({
      variant: "info",
      message,
      durationMs: APP_TOAST_DURATION_MS,
      placement: options.placement,
    });
  },

  warning(message: string, options: AppToastOptions = {}): void {
    pushNotification({
      variant: "warning",
      message,
      durationMs: APP_TOAST_DURATION_MS,
      placement: options.placement,
    });
  },

  promise<T>(
    promise: Promise<T>,
    messages: AppToastPromiseMessages,
    options: AppToastPromiseOptions = {}
  ): Promise<T> {
    const id = pushNotification({
      variant: "loading",
      message: messages.pending,
      durationMs: 0,
      icon: messages.pendingIcon,
      placement: options.pendingPlacement,
    });
    return promise
      .then((value) => {
        patchNotification(id, {
          variant: "success",
          message: messages.success,
          durationMs: APP_TOAST_DURATION_MS,
          icon: messages.successIcon,
          placement: options.successPlacement,
        });
        return value;
      })
      .catch((err: unknown) => {
        patchNotification(id, {
          variant: "error",
          message: messages.error,
          durationMs: APP_TOAST_DURATION_MS,
          placement: options.errorPlacement,
        });
        throw err;
      });
  },
};
