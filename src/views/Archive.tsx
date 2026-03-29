import { useAuthSession } from "@components/auth/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { ArchiveBox, ChevronLeft, Delete, Pencil, Project } from "../assets/icons";
import { ArchiveLoadingSkeleton } from "../components/ArchiveSkeleton";
import AuthHeaderAccount from "../components/AuthHeaderAccount";
import {
  formatDiagramTimestamp,
  loadArchivedDiagramWithPrompts,
} from "../helper/archiveLoadFlow";
import { saveNewDiagramThroughForm } from "../helper/saveNewToArchive";
import type { UnifiedDesign, UnifiedFolder } from "../hooks/useArchiveService";
import {
  useArchiveFolders,
  useCreateArchiveCanvas,
  useCreateArchiveFolder,
  useDeleteArchiveCanvas,
  useDeleteArchiveFolder,
  useUpdateArchiveCanvas,
  useUpdateArchiveFolder,
} from "../hooks/useArchiveService";
import { appToast } from "../lib/appToast";
import { useAppContext } from "../provider/AppStates";
import { useCloudSyncContext } from "../provider/CloudSyncContext";
import { useModal } from "../provider/ModalContext";

export default function Archive(): JSX.Element {
  const navigate = useNavigate();
  const modal = useModal();
  const { isAuthenticate: isLoggedIn } = useAuthSession();
  const {
    setElements,
    elements,
    canUndo,
    session,
    activeArchiveDiagram,
    setActiveArchiveDiagram,
  } = useAppContext();
  const { canSync, hasUnsavedChanges, syncToCloud } = useCloudSyncContext();

  // Use unified hooks for data fetching and mutations
  const { data: folders, isLoading, refetch } = useArchiveFolders();
  const createFolder = useCreateArchiveFolder();
  const deleteFolder = useDeleteArchiveFolder();
  const createCanvas = useCreateArchiveCanvas();
  const deleteCanvas = useDeleteArchiveCanvas();
  const updateCanvas = useUpdateArchiveCanvas();
  const updateFolder = useUpdateArchiveFolder();

  const handleSaveCurrentCanvas = async (): Promise<void> => {
    if (canSync) {
      await syncToCloud();
      void refetch();
      return;
    }
    const info = await saveNewDiagramThroughForm({
      modal,
      folders,
      elements,
      createFolderAsync: createFolder.mutateAsync,
      createCanvasAsync: createCanvas.mutateAsync,
    });
    if (!info) return;
    setActiveArchiveDiagram(info);
    appToast.success("Saved to archive");
    refetch();
  };

  const handleNewFolder = async (): Promise<void> => {
    const result = await modal.openForm({
      title: "New project",
      fields: [
        {
          id: "name",
          label: "Project name",
          type: "text",
          placeholder: "My project",
          defaultValue: "My project",
        },
      ],
      submitLabel: "Create",
    });
    if (!result) return;
    const name = result.name?.trim();
    if (!name) return;
    createFolder.mutate(name);
    refetch();
  };

  const handleRenameFolder = async (folder: UnifiedFolder): Promise<void> => {
    const result = await modal.openForm({
      title: "Rename project",
      fields: [
        {
          id: "name",
          label: "Project name",
          type: "text",
          placeholder: "Project name",
          defaultValue: folder.name,
        },
      ],
      submitLabel: "Save",
    });
    if (!result) return;
    const name = result.name?.trim();
    if (!name) return;
    updateFolder.mutate({ folderId: folder.id, name });
    refetch();
  };

  const handleDeleteFolder = async (folder: UnifiedFolder): Promise<void> => {
    const message =
      folder.designs.length > 0
        ? `Delete project "${folder.name}" and its ${folder.designs.length} saved diagram(s)?`
        : `Delete project "${folder.name}"?`;
    const ok = await modal.confirm({
      title: "Delete project",
      message,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    deleteFolder.mutate(folder.id);
    refetch();
  };

  const handleOpenDiagram = async (folderId: string, designId: string): Promise<void> => {
    const folder = folders.find((f) => f.id === folderId);
    const diagram = folder?.designs.find((d) => d.id === designId);
    if (!diagram) return;
    await loadArchivedDiagramWithPrompts(
      modal,
      elements,
      canUndo,
      session,
      folderId,
      diagram,
      setElements,
      (info) => {
        setActiveArchiveDiagram(info);
        navigate("/");
      },
      { canSync, hasCloudUnsaved: hasUnsavedChanges }
    );
    refetch();
  };

  const handleUpdateArchivedDiagram = (folderId: string, designId: string, diagramName: string): void => {
    updateCanvas.mutate({
      folderId,
      canvasId: designId,
      name: diagramName,
      elements,
    });
    refetch();
  };

  const handleEditCanvasMeta = async (folderId: string, diagram: UnifiedDesign): Promise<void> => {
    const result = await modal.openForm({
      title: "Edit canvas",
      fields: [
        {
          id: "diagramName",
          label: "Canvas name",
          type: "text",
          placeholder: "My diagram",
          defaultValue: diagram.name,
        },
        {
          id: "folderId",
          label: "Project",
          type: "select",
          options: folders.map((f) => ({ value: f.id, label: f.name })),
          defaultValue: folderId,
        },
      ],
      submitLabel: "Save",
    });
    if (!result) return;
    const name = result.diagramName?.trim();
    const newFolderId = result.folderId?.trim();
    if (!name || !newFolderId) return;

    updateCanvas.mutate({
      folderId,
      canvasId: diagram.id,
      name,
      elements: diagram.elements,
      targetFolderId: newFolderId !== folderId ? newFolderId : undefined,
    });

    if (activeArchiveDiagram?.designId === diagram.id) {
      setActiveArchiveDiagram({
        folderId: newFolderId,
        designId: diagram.id,
        name,
      });
    }
    refetch();
  };

  const handleDeleteDiagram = async (folderId: string, designId: string): Promise<void> => {
    const ok = await modal.confirm({
      title: "Remove diagram",
      message: "Remove this diagram from the archive?",
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    deleteCanvas.mutate({ folderId, canvasId: designId });
    if (
      activeArchiveDiagram?.folderId === folderId &&
      activeArchiveDiagram?.designId === designId
    ) {
      setActiveArchiveDiagram(null);
    }
    refetch();
  };

  const archiveHint = isLoggedIn
    ? "Projects and diagrams stay synced to the cloud. On the canvas, use Ctrl+S to save the open diagram."
    : "Stored in this browser only. Save new work from here or from the menu on the canvas.";

  return (
    <div className="archivePage">
      <div className="archiveInner">
        <header className="archiveHeader">
          <div className="archiveHeaderLeft">
            <div className="archiveChromePill">
              <Link className="archiveBack" to="/">
                <span className="archiveBackIcon" aria-hidden>
                  <ChevronLeft />
                </span>
                <span className="archiveBackLabel">Back to canvas</span>
              </Link>
            </div>
          </div>
          <div className="archiveHeaderCenter">
            <div className="archiveChromePill archiveTitlePill">
              <h1 className="archiveTitle">
                <ArchiveBox /> Archive
              </h1>
            </div>
          </div>
          <div className="archiveHeaderRight">
            <div className="archiveChromePill archiveChromePillActions">
              <button
                className="archiveSaveCanvas"
                type="button"
                onClick={() => void handleSaveCurrentCanvas()}
                disabled={createCanvas.isPending}
              >
                {createCanvas.isPending ? "Saving…" : "Save current canvas"}
              </button>
              <button
                className="archiveNewFolder"
                type="button"
                onClick={() => void handleNewFolder()}
                disabled={createFolder.isPending}
              >
                <span className="archiveNewFolderInner" aria-hidden>
                  <Project />
                </span>
                {createFolder.isPending ? "Creating…" : "New project"}
              </button>
              <AuthHeaderAccount />
            </div>
          </div>
        </header>

        <div className="archiveHintWrap">
          <div className="archiveHintBar canvasTopHintBar">
            <p className="canvasTopHintText">{archiveHint}</p>
          </div>
        </div>

        {isLoading ? (
          <ArchiveLoadingSkeleton />
        ) : (
          <div className="archiveBoard">
            {folders.length === 0 ? (
              isLoggedIn ? (
                <div className="archiveEmptyOnboarding">
                  <h3>Welcome to your Archive</h3>
                  <p>Looks like you don't have any projects yet. Let's create your first project and canvas!</p>
                  <div className="archiveEmptyActions">
                    <button
                      className="archiveNewFolder"
                      type="button"
                      onClick={() => void handleNewFolder()}
                      disabled={createFolder.isPending}
                    >
                      <span className="archiveNewFolderInner" aria-hidden>
                        <Project />
                      </span>
                      {createFolder.isPending ? "Creating..." : "Create your first project"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="archiveBoardEmpty">
                  No projects yet. Use <strong>New project</strong>, then on the canvas use the menu →{" "}
                  <strong>Save to archive</strong>.
                </p>
              )
            ) : (
              folders.map((folder) => (
                <article key={folder.id} className="archiveFolderCard">
                  <div className="archiveFolderCardHead">
                    <h2 className="archiveFolderCardTitle">{folder.name}</h2>
                    <div className="archiveFolderCardHeadActions">
                      <button
                        className="archiveFolderCardIconBtn"
                        type="button"
                        title="Rename project"
                        onClick={() => void handleRenameFolder(folder)}
                        disabled={updateFolder.isPending}
                      >
                        <Pencil />
                      </button>
                      <button
                        className="archiveFolderCardIconBtn archiveFolderCardIconBtnDanger"
                        type="button"
                        title="Delete project"
                        onClick={() => void handleDeleteFolder(folder)}
                        disabled={deleteFolder.isPending}
                      >
                        <Delete />
                      </button>
                    </div>
                  </div>

                  <ul className="archiveDiagramStack">
                    {folder.designs.length === 0 ? (
                      <li className="archiveDiagramPlaceholder">No diagrams yet</li>
                    ) : (
                      folder.designs.map((diagram) => {
                        const isCanvasSameDiagram =
                          activeArchiveDiagram?.folderId === folder.id &&
                          activeArchiveDiagram?.designId === diagram.id;
                        return (
                          <li key={diagram.id} className="archiveDiagramTile">
                            <div className="archiveDiagramTileLogo" aria-hidden>
                              <ArchiveBox />
                            </div>
                            <div className="archiveDiagramTileMain">
                              <span className="archiveDiagramTileName">{diagram.name}</span>
                              <span className="archiveDiagramTileMeta">
                                {diagram.elements.length} elements · {formatDiagramTimestamp(diagram.updatedAt)}
                              </span>
                            </div>
                            <div className="archiveDiagramTileActions">
                              <button
                                className="archiveBtnSave"
                                type="button"
                                title={
                                  isCanvasSameDiagram
                                    ? "Save the open canvas to this diagram in the cloud"
                                    : "Open this diagram on the canvas first; then Save syncs your edits here"
                                }
                                onClick={() => {
                                  if (!isCanvasSameDiagram) return;
                                  handleUpdateArchivedDiagram(folder.id, diagram.id, diagram.name);
                                }}
                                disabled={!isCanvasSameDiagram || updateCanvas.isPending}
                              >
                                {updateCanvas.isPending && isCanvasSameDiagram ? "Saving…" : "Save"}
                              </button>
                              <button
                                className="archiveBtnEdit"
                                type="button"
                                title="Rename or move to another folder"
                                onClick={() => void handleEditCanvasMeta(folder.id, diagram)}
                                disabled={updateCanvas.isPending}
                              >
                                <Pencil />
                                <span className="archiveBtnEditLabel">Edit</span>
                              </button>
                              <button
                                className="archiveBtnOpen"
                                type="button"
                                onClick={() => void handleOpenDiagram(folder.id, diagram.id)}
                              >
                                Open
                              </button>
                              <button
                                className="archiveTileDelete"
                                type="button"
                                title="Remove diagram"
                                onClick={() => void handleDeleteDiagram(folder.id, diagram.id)}
                                disabled={deleteCanvas.isPending}
                              >
                                <Delete />
                              </button>
                            </div>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
