import { hasDirtyCanvas } from "@/helper/archiveLoadFlow";
import type { UnifiedFolder } from "@/hooks/useArchiveService";
import type { AppModalApi, ModalFormField } from "@/provider/ModalContext";
import type { ActiveArchiveDiagram, DrawElement } from "@/types";

export function canvasNeedsSavePrompt(
  session: string | null,
  elements: DrawElement[],
  canUndo: boolean,
  canSync: boolean,
  hasCloudUnsaved: boolean
): boolean {
  if (canSync) return hasCloudUnsaved;
  return hasDirtyCanvas(session, elements, canUndo);
}

export type SaveNewToArchiveDeps = {
  modal: AppModalApi;
  folders: UnifiedFolder[];
  elements: DrawElement[];
  createFolderAsync: (name: string) => Promise<{ id: string }>;
  createCanvasAsync: (p: {
    folderId: string;
    name: string;
    elements: DrawElement[];
  }) => Promise<ActiveArchiveDiagram>;
  /** Modal title (default: Save to archive) */
  formTitle?: string;
  submitLabel?: string;
  diagramNameLabel?: string;
  diagramNamePlaceholder?: string;
  diagramNameDefault?: string;
};

/** Save-as-new flow: pick or create project and name the diagram. Returns new active archive info or null if cancelled/failed. */
export async function saveNewDiagramThroughForm(
  deps: SaveNewToArchiveDeps
): Promise<ActiveArchiveDiagram | null> {
  const {
    modal,
    folders,
    elements,
    createFolderAsync,
    createCanvasAsync,
    formTitle,
    submitLabel,
    diagramNameLabel,
    diagramNamePlaceholder,
    diagramNameDefault,
  } = deps;

  const fields: ModalFormField[] = [];
  if (folders.length > 0) {
    fields.push({
      id: "folderId",
      label: "Project",
      type: "select",
      options: folders.map((f) => ({ value: f.id, label: f.name })),
      defaultValue: folders[0]?.id,
    });
  } else {
    fields.push({
      id: "newProjectName",
      label: "New project name",
      type: "text",
      placeholder: "My project",
      defaultValue: "My project",
    });
  }

  fields.push({
    id: "diagramName",
    label: diagramNameLabel ?? "Diagram name",
    type: "text",
    placeholder: diagramNamePlaceholder ?? "My diagram",
    defaultValue: diagramNameDefault ?? "My diagram",
  });

  const result = await modal.openForm({
    title: formTitle ?? "Save to archive",
    fields,
    submitLabel: submitLabel ?? "Save",
  });
  if (!result) return null;

  const diagramName = result.diagramName?.trim();
  if (!diagramName) return null;

  let folderId = result.folderId?.trim();

  if (folders.length === 0) {
    const newProjectRaw = result.newProjectName?.trim() ?? "";
    if (!newProjectRaw) return null;
    try {
      const created = await createFolderAsync(newProjectRaw);
      folderId = created.id;
    } catch {
      await modal.alert({
        title: "Could not create project",
        message: "Check your connection and try again.",
      });
      return null;
    }
  }

  if (!folderId) {
    await modal.alert({
      title: "Choose a project",
      message: "Select a project to save this diagram into.",
    });
    return null;
  }

  try {
    return await createCanvasAsync({ folderId, name: diagramName, elements });
  } catch {
    await modal.alert({
      title: "Save failed",
      message: "Could not save this diagram. Try again.",
    });
    return null;
  }
}
