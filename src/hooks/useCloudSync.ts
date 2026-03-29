import { useCallback, useEffect, useRef, createElement } from "react";
import { CloudToastIcon } from "@/components/CloudToastIcon";
import { useAuthSession } from "@components/auth/lib/utils";
import { useAppContext } from "@/provider/AppStates";
import { appToast } from "@/lib/appToast";
import { useUpdateArchiveCanvas, hasCanvasChanged } from "./useArchiveService";
import type { DrawElement } from "@/types";

export type CloudSyncApi = {
  syncToCloud: () => Promise<boolean>;
  canSync: boolean;
  hasUnsavedChanges: boolean;
  /** Call when server canvas is applied so “saved” baseline matches cloud. */
  setSyncBaseline: (next: DrawElement[]) => void;
};

export function useCloudSync(): CloudSyncApi {
  const { isAuthenticate: isLoggedIn } = useAuthSession();
  const { elements, activeArchiveDiagram } = useAppContext();
  const updateCanvas = useUpdateArchiveCanvas();
  const lastSyncedElementsRef = useRef<DrawElement[]>([]);

  useEffect(() => {
    if (activeArchiveDiagram) {
      lastSyncedElementsRef.current = JSON.parse(JSON.stringify(elements)) as DrawElement[];
    }
  }, [activeArchiveDiagram?.designId]);

  const setSyncBaseline = useCallback((next: DrawElement[]) => {
    lastSyncedElementsRef.current = JSON.parse(JSON.stringify(next)) as DrawElement[];
  }, []);

  const syncToCloud = async (): Promise<boolean> => {
    if (!isLoggedIn || !activeArchiveDiagram) {
      return false;
    }

    const { folderId, designId, name } = activeArchiveDiagram;

    if (!hasCanvasChanged(lastSyncedElementsRef.current, elements)) {
      appToast.info("No changes to save.");
      return false;
    }

    try {
      await appToast.promise(
        (async () => {
          await updateCanvas.mutateAsync({
            folderId,
            canvasId: designId,
            name: name ?? "Untitled",
            elements,
          });
          lastSyncedElementsRef.current = JSON.parse(JSON.stringify(elements)) as DrawElement[];
        })(),
        {
          pending: "Saving…",
          success: "Saved to cloud",
          error: "Save failed. Try again.",
          pendingIcon: createElement(CloudToastIcon),
          successIcon: createElement(CloudToastIcon),
        }
      );
      return true;
    } catch {
      return false;
    }
  };

  return {
    syncToCloud,
    canSync: isLoggedIn && !!activeArchiveDiagram,
    hasUnsavedChanges: hasCanvasChanged(lastSyncedElementsRef.current, elements),
    setSyncBaseline,
  };
}
