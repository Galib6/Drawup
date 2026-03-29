import { useState } from "react";
import { useAuthSession } from "@components/auth/lib/utils";
import { persistCurrentCanvas } from "@/helper/persistCurrentCanvas";
import {
  useArchiveFolders,
  useCreateArchiveCanvas,
  useCreateArchiveFolder,
  useUpdateArchiveCanvas,
} from "@/hooks/useArchiveService";
import { appToast } from "@/lib/appToast";
import { useAppContext } from "@/provider/AppStates";
import { useCloudSyncContext } from "@/provider/CloudSyncContext";
import { useModal } from "@/provider/ModalContext";

export function useCanvasSaveAction(): {
  save: () => Promise<void>;
  busy: boolean;
  disabled: boolean;
} {
  const [busy, setBusy] = useState(false);
  const { isAuthenticate: isLoggedIn } = useAuthSession();
  const { elements, activeArchiveDiagram, setActiveArchiveDiagram } = useAppContext();
  const { syncToCloud, hasUnsavedChanges, setSyncBaseline } = useCloudSyncContext();
  const modal = useModal();
  const { refetchUnified, refetch } = useArchiveFolders();
  const createCanvas = useCreateArchiveCanvas();
  const createFolder = useCreateArchiveFolder();
  const updateCanvas = useUpdateArchiveCanvas();

  const pendingMutation =
    createCanvas.isPending || createFolder.isPending || updateCanvas.isPending;
  const disabled = busy || pendingMutation;

  const save = async (): Promise<void> => {
    if (disabled) return;

    setBusy(true);
    try {
      const result = await persistCurrentCanvas({
        modal,
        elements,
        createFolderAsync: createFolder.mutateAsync,
        createCanvasAsync: createCanvas.mutateAsync,
        refetchUnified,
        refetch,
        activeArchiveDiagram,
        hasUnsavedChanges,
        isLoggedIn,
        canSync: isLoggedIn && !!activeArchiveDiagram,
        syncToCloud,
        setActiveArchiveDiagram,
        setSyncBaseline,
        updateCanvasAsync: updateCanvas.mutateAsync,
      });
      if (result === "nothing") {
        appToast.info("No changes to save.");
      }
    } finally {
      setBusy(false);
    }
  };

  return { save, busy, disabled };
}
