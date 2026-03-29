import { useEffect, useRef, useState } from "react";
import { useAuthSession } from "@components/auth/lib/utils";
import { useAppContext } from "@/provider/AppStates";
import { useModal } from "@/provider/ModalContext";
import { useUpdateArchiveCanvas, hasCanvasChanged } from "./useArchiveService";
import type { DrawElement } from "@/types";

export function useCloudSync() {
  const { isAuthenticate: isLoggedIn } = useAuthSession();
  const { elements, activeArchiveDiagram } = useAppContext();
  const modal = useModal();
  const updateCanvas = useUpdateArchiveCanvas();
  const [isSyncing, setIsSyncing] = useState(false);
  const lastSyncedElementsRef = useRef<DrawElement[]>([]);

  // Track the last synced state
  useEffect(() => {
    if (activeArchiveDiagram) {
      // Initialize with current elements when a diagram is loaded
      lastSyncedElementsRef.current = JSON.parse(JSON.stringify(elements));
    }
  }, [activeArchiveDiagram?.designId]);

  const syncToCloud = async (): Promise<boolean> => {
    // Only sync if user is logged in and has an active archive diagram
    if (!isLoggedIn || !activeArchiveDiagram) {
      return false;
    }

    const { folderId, designId, name } = activeArchiveDiagram;

    // Check if canvas has changed
    if (!hasCanvasChanged(lastSyncedElementsRef.current, elements)) {
      await modal.alert({
        title: "No changes",
        message: "Canvas hasn't been modified since last save."
      });
      return false;
    }

    // Show syncing toast
    setIsSyncing(true);

    return new Promise((resolve) => {
      updateCanvas.mutate(
        {
          folderId,
          canvasId: designId,
          name: name || "Untitled",
          elements
        }
      );

      // Wait for mutation to complete
      const checkComplete = setInterval(() => {
        if (!updateCanvas.isPending) {
          clearInterval(checkComplete);
          setIsSyncing(false);

          if (updateCanvas.isSuccess) {
            // Update the last synced state
            lastSyncedElementsRef.current = JSON.parse(JSON.stringify(elements));
            modal.alert({
              title: "Synced to cloud",
              message: "Your canvas has been successfully saved to the cloud."
            });
            resolve(true);
          } else if (updateCanvas.isError) {
            modal.alert({
              title: "Sync failed",
              message: "Failed to sync your canvas to the cloud. Please try again."
            });
            resolve(false);
          }
        }
      }, 100);
    });
  };

  return {
    syncToCloud,
    isSyncing,
    canSync: isLoggedIn && !!activeArchiveDiagram,
    hasUnsavedChanges: hasCanvasChanged(lastSyncedElementsRef.current, elements)
  };
}
