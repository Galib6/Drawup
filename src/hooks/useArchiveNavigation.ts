import { useAuthSession } from "@components/auth/lib/utils";
import { useNavigate } from "react-router-dom";
import { persistCurrentCanvas } from "@/helper/persistCurrentCanvas";
import { canvasNeedsSavePrompt } from "@/helper/saveNewToArchive";
import {
  useArchiveFolders,
  useCreateArchiveCanvas,
  useCreateArchiveFolder,
  useUpdateArchiveCanvas,
} from "@/hooks/useArchiveService";
import { useAppContext } from "@/provider/AppStates";
import { useCloudSyncContext } from "@/provider/CloudSyncContext";
import { useModal } from "@/provider/ModalContext";

export type GoToArchiveOptions = {
  /** e.g. close the hamburger menu before navigating */
  beforeNavigate?: () => void;
};

/**
 * Navigate to /archive, with the same unsaved prompt and Save branch as toolbar Save (Ctrl+S).
 */
export function useGoToArchivePage(): (opts?: GoToArchiveOptions) => Promise<void> {
  const navigate = useNavigate();
  const modal = useModal();
  const { isAuthenticate: isLoggedIn } = useAuthSession();
  const { session, elements, canUndo, setActiveArchiveDiagram, activeArchiveDiagram } =
    useAppContext();
  const { canSync, hasUnsavedChanges, syncToCloud, setSyncBaseline } = useCloudSyncContext();
  const { refetch, refetchUnified } = useArchiveFolders();
  const createCanvas = useCreateArchiveCanvas();
  const createFolder = useCreateArchiveFolder();
  const updateCanvas = useUpdateArchiveCanvas();

  return async (opts?: GoToArchiveOptions): Promise<void> => {
    opts?.beforeNavigate?.();

    if (!canvasNeedsSavePrompt(session, elements, canUndo, canSync, hasUnsavedChanges)) {
      navigate("/archive");
      return;
    }

    const saveFirst = await modal.confirm({
      title: "Unsaved changes",
      message: "Save to the archive before opening Archive? You can leave without saving.",
      confirmLabel: "Save",
      cancelLabel: "Leave without saving",
    });
    if (saveFirst) {
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
        canSync,
        syncToCloud,
        setActiveArchiveDiagram,
        setSyncBaseline,
        updateCanvasAsync: updateCanvas.mutateAsync,
      });
      if (result === "cancelled") return;
    }
    navigate("/archive");
  };
}
