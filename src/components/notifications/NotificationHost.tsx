import { useSyncExternalStore, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  getNotificationSnapshot,
  removeNotification,
  subscribeNotifications,
  type AppNotificationItem,
} from "@/lib/notifications/store";

function NotificationItem({ item }: { item: AppNotificationItem }): JSX.Element {
  useEffect(() => {
    if (item.durationMs <= 0) return;
    const t = window.setTimeout(() => removeNotification(item.id), item.durationMs);
    return () => window.clearTimeout(t);
  }, [item.id, item.durationMs, item.message, item.variant]);

  const showDefaultSpinner = item.variant === "loading" && !item.icon;

  return (
    <div
      className={`appNotification appNotification--${item.variant}`}
      role="status"
    >
      <div className="appNotificationInner">
        {showDefaultSpinner ? <span className="appNotificationSpinner" aria-hidden /> : null}
        {item.icon ? <span className="appNotificationIcon">{item.icon}</span> : null}
        <span className="appNotificationMessage">{item.message}</span>
        <button
          type="button"
          className="appNotificationClose"
          aria-label="Dismiss"
          onClick={() => removeNotification(item.id)}
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function NotificationHost(): JSX.Element | null {
  const list = useSyncExternalStore(
    subscribeNotifications,
    () => getNotificationSnapshot(),
    () => getNotificationSnapshot()
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="appNotificationStack" aria-live="polite">
      {[...list].reverse().map((item) => (
        <NotificationItem key={item.id} item={item} />
      ))}
    </div>,
    document.body
  );
}
