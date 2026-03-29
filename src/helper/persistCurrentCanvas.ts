import { saveNewDiagramThroughForm, type SaveNewToArchiveDeps } from "@/helper/saveNewToArchive";
import {
  activeArchiveExistsInFolders,
  type UnifiedFolder,
} from "@/hooks/useArchiveService";
import { appToast } from "@/lib/appToast";
import type { ActiveArchiveDiagram, DrawElement } from "@/types";
import type { AppModalApi } from "@/provider/ModalContext";

export type PersistCurrentCanvasInput = Omit<SaveNewToArchiveDeps, "folders"> & {
  modal: AppModalApi;
  elements: DrawElement[];
  refetchUnified: () => Promise<UnifiedFolder[]>;
  refetch: () => void;
  activeArchiveDiagram: ActiveArchiveDiagram | null;
  hasUnsavedChanges: boolean;
  isLoggedIn: boolean;
  canSync: boolean;
  syncToCloud: () => Promise<boolean>;
  setActiveArchiveDiagram: (v: ActiveArchiveDiagram | null) => void;
  setSyncBaseline: (els: DrawElement[]) => void;
  updateCanvasAsync: (p: {
    folderId: string;
    canvasId: string;
    name: string;
    elements: DrawElement[];
  }) => Promise<unknown>;
};

export type PersistCurrentCanvasResult = "saved" | "nothing" | "cancelled";

/** Persists the current canvas (same rules as toolbar Save / Ctrl+S). */
export async function persistCurrentCanvas(
  input: PersistCurrentCanvasInput
): Promise<PersistCurrentCanvasResult> {
  const {
    modal,
    elements,
    refetchUnified,
    refetch,
    activeArchiveDiagram,
    hasUnsavedChanges,
    isLoggedIn,
    canSync,
    syncToCloud,
    setActiveArchiveDiagram,
    setSyncBaseline,
    createFolderAsync,
    createCanvasAsync,
    updateCanvasAsync,
  } = input;

  const latest = await refetchUnified();

  if (latest.length === 0) {
    const info = await saveNewDiagramThroughForm({
      modal,
      folders: latest,
      elements,
      createFolderAsync,
      createCanvasAsync,
    });
    if (!info) return "cancelled";
    setActiveArchiveDiagram(info);
    setSyncBaseline(elements);
    appToast.success("Saved to archive");
    void refetch();
    return "saved";
  }

  if (activeArchiveDiagram && activeArchiveExistsInFolders(latest, activeArchiveDiagram)) {
    if (!hasUnsavedChanges) {
      return "nothing";
    }
    if (isLoggedIn && canSync) {
      const ok = await syncToCloud();
      return ok ? "saved" : "cancelled";
    }
    await updateCanvasAsync({
      folderId: activeArchiveDiagram.folderId,
      canvasId: activeArchiveDiagram.designId,
      name: activeArchiveDiagram.name ?? "Untitled",
      elements,
    });
    setSyncBaseline(elements);
    appToast.success("Saved to archive");
    void refetch();
    return "saved";
  }

  if (activeArchiveDiagram && !activeArchiveExistsInFolders(latest, activeArchiveDiagram)) {
    setActiveArchiveDiagram(null);
    await modal.alert({
      title: "Archive entry missing",
      message:
        "That project or diagram is no longer in your archive. Choose a project and name to save a new copy.",
    });
  }

  const info = await saveNewDiagramThroughForm({
    modal,
    folders: latest,
    elements,
    createFolderAsync,
    createCanvasAsync,
  });
  if (!info) return "cancelled";
  setActiveArchiveDiagram(info);
  setSyncBaseline(elements);
  appToast.success("Saved to archive");
  void refetch();
  return "saved";
}
