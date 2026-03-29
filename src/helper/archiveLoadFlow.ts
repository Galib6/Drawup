import type { AppModalApi } from "../provider/ModalContext";
import type { ActiveArchiveDiagram } from "../types";
import type { ArchiveDesign } from "../types/archive";
import type { DrawElement } from "../types";
import { addDesign, readArchive } from "./archiveStorage";

export type ArchiveLoadedInfo = ActiveArchiveDiagram;

export type LoadArchivedDiagramOptions = {
  /** Logged in with an archived diagram open on the canvas (Ctrl+S applies). */
  canSync?: boolean;
  /** True when current elements differ from last cloud save baseline. */
  hasCloudUnsaved?: boolean;
};

function elementsEqual(a: DrawElement[], b: DrawElement[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Whether replacing the canvas could lose work worth offering to save first. */
export function shouldOfferSaveBeforeLoad(
  session: string | null,
  elements: DrawElement[],
  canUndo: boolean,
  options?: LoadArchivedDiagramOptions
): boolean {
  if (options?.canSync) {
    return Boolean(options.hasCloudUnsaved);
  }
  return hasDirtyCanvas(session, elements, canUndo);
}

export function hasDirtyCanvas(
  session: string | null,
  elements: DrawElement[],
  canUndo: boolean
): boolean {
  if (session) return elements.length > 0;
  return canUndo;
}

export async function saveCurrentDiagramToArchive(
  modal: AppModalApi,
  elements: DrawElement[]
): Promise<boolean> {
  const data = readArchive();
  if (data.folders.length === 0) {
    await modal.alert({
      title: "No projects",
      message: "Create a project in the archive first, then try again.",
    });
    return false;
  }

  const result = await modal.openForm({
    title: "Save to archive",
    fields: [
      {
        id: "folderId",
        label: "Project",
        type: "select",
        options: data.folders.map((f) => ({ value: f.id, label: f.name })),
        defaultValue: data.folders[0]?.id,
      },
      {
        id: "diagramName",
        label: "Diagram name",
        type: "text",
        placeholder: "My diagram",
        defaultValue: "My diagram",
      },
    ],
    submitLabel: "Save",
  });

  if (!result) return false;
  const folderId = result.folderId?.trim();
  const diagramName = result.diagramName?.trim();
  if (!folderId || !diagramName) return false;
  addDesign(folderId, diagramName, elements);
  return true;
}

export async function loadArchivedDiagramWithPrompts(
  modal: AppModalApi,
  elements: DrawElement[],
  canUndo: boolean,
  session: string | null,
  folderId: string,
  diagram: ArchiveDesign,
  setElements: (
    action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]) | "prevState",
    overwrite?: boolean,
    emit?: boolean
  ) => void,
  onLoaded?: (info: ArchiveLoadedInfo) => void,
  options?: LoadArchivedDiagramOptions
): Promise<void> {
  if (elementsEqual(elements, diagram.elements)) {
    onLoaded?.({ folderId, designId: diagram.id, name: diagram.name });
    return;
  }

  const ok = await modal.confirm({
    title: "Load diagram",
    message: `Load "${diagram.name}" onto the canvas? The current canvas will be replaced.`,
    confirmLabel: "Load",
    cancelLabel: "Cancel",
  });
  if (!ok) return;

  if (shouldOfferSaveBeforeLoad(session, elements, canUndo, options)) {
    const saveFirst = await modal.confirm({
      title: "Unsaved changes",
      message: "Save your current design to the archive before loading?",
      confirmLabel: "Save to archive",
      cancelLabel: "Discard",
    });
    if (saveFirst) {
      const saved = await saveCurrentDiagramToArchive(modal, elements);
      if (!saved) return;
    }
  }

  setElements(JSON.parse(JSON.stringify(diagram.elements)) as DrawElement[], true);
  onLoaded?.({ folderId, designId: diagram.id, name: diagram.name });
}

export function formatDiagramTimestamp(ts: number): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}
