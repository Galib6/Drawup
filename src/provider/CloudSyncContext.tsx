import { createContext, type ReactNode, useContext } from "react";
import { useCloudSync, type CloudSyncApi } from "@/hooks/useCloudSync";

const CloudSyncContext = createContext<CloudSyncApi | null>(null);

export function CloudSyncProvider({ children }: { children: ReactNode }): JSX.Element {
  const api = useCloudSync();
  return <CloudSyncContext.Provider value={api}>{children}</CloudSyncContext.Provider>;
}

export function useCloudSyncContext(): CloudSyncApi {
  const ctx = useContext(CloudSyncContext);
  if (!ctx) {
    throw new Error("useCloudSyncContext must be used within CloudSyncProvider");
  }
  return ctx;
}
