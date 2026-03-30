import type { ReactNode } from "react";

export type NotificationVariant = "success" | "error" | "info" | "warning" | "loading";
export type NotificationPlacement = "top-center" | "bottom-right";

export type AppNotificationItem = {
  id: string;
  variant: NotificationVariant;
  message: string;
  durationMs: number;
  placement: NotificationPlacement;
  icon?: ReactNode;
};

let items: AppNotificationItem[] = [];
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

export function getNotificationSnapshot(): readonly AppNotificationItem[] {
  return items;
}

export function subscribeNotifications(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function pushNotification(
  partial: Omit<AppNotificationItem, "id" | "placement"> & {
    id?: string;
    placement?: NotificationPlacement;
  }
): string {
  const id = partial.id ?? genId();
  items = [
    ...items,
    {
      ...partial,
      id,
      placement: partial.placement ?? "bottom-right",
    },
  ];
  emit();
  return id;
}

export function patchNotification(
  id: string,
  patch: Partial<Omit<AppNotificationItem, "id">>
): void {
  items = items.map((n) => (n.id === id ? { ...n, ...patch } : n));
  emit();
}

export function removeNotification(id: string): void {
  items = items.filter((n) => n.id !== id);
  emit();
}
