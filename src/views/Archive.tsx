import { useAuthSession } from "@components/auth/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { ArchiveBox, ChevronLeft, Delete } from "../assets/icons";
import { ArchiveLoadingSkeleton } from "../components/ArchiveSkeleton";
import AuthHeaderAccount from "../components/AuthHeaderAccount";
import {
  formatDiagramTimestamp,
  loadArchivedDiagramWithPrompts,
} from "../helper/archiveLoadFlow";
import type { UnifiedFolder } from "../hooks/useArchiveService";
import {
  useArchiveFolders,
  useCreateArchiveCanvas,
  useCreateArchiveFolder,
  useDeleteArchiveCanvas,
  useDeleteArchiveFolder,
  useUpdateArchiveCanvas,
} from "../hooks/useArchiveService";
import { useAppContext } from "../provider/AppStates";
import { useModal } from "../provider/ModalContext";

export default function Archive(): JSX.Element {
  const navigate = useNavigate();
  const modal = useModal();
  const { isAuthenticate: isLoggedIn } = useAuthSession();
  const { setElements, elements, canUndo, session, activeArchiveDiagram, setActiveArchiveDiagram } =
    useAppContext();

  // Use unified hooks for data fetching and mutations
  const { data: folders, isLoading, refetch } = useArchiveFolders();
  const createFolder = useCreateArchiveFolder();
  const deleteFolder = useDeleteArchiveFolder();
  const createCanvas = useCreateArchiveCanvas();
  const deleteCanvas = useDeleteArchiveCanvas();
  const updateCanvas = useUpdateArchiveCanvas();

  const handleSaveCurrentCanvas = async (): Promise<void> => {
    if (folders.length === 0) {
      await modal.alert({
        title: "No folders",
        message: "Create a folder first, then try saving your canvas.",
      });
      return;
    }

    const result = await modal.openForm({
      title: "Save to archive",
      fields: [
        {
          id: "folderId",
          label: "Folder",
          type: "select",
          options: folders.map((f) => ({ value: f.id, label: f.name })),
          defaultValue: folders[0]?.id,
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

    if (!result) return;
    const folderId = result.folderId?.trim();
    const diagramName = result.diagramName?.trim();
    if (!folderId || !diagramName) return;

    createCanvas.mutate({ folderId, name: diagramName, elements });
    refetch();
  };

  const handleNewFolder = async (): Promise<void> => {
    const result = await modal.openForm({
      title: "New folder",
      fields: [
        {
          id: "name",
          label: "Folder name",
          type: "text",
          placeholder: "My folder",
          defaultValue: "My folder",
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

  const handleDeleteFolder = async (folder: UnifiedFolder): Promise<void> => {
    const message =
      folder.designs.length > 0
        ? `Delete folder "${folder.name}" and its ${folder.designs.length} saved diagram(s)?`
        : `Delete folder "${folder.name}"?`;
    const ok = await modal.confirm({
      title: "Delete folder",
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
      }
    );
    refetch();
  };

  const handleUpdateArchivedDiagram = (folderId: string, designId: string, diagramName: string): void => {
    updateCanvas.mutate({
      folderId,
      canvasId: designId,
      name: diagramName,
      elements
    });
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

  return (
    <div className="archivePage">
      <div className="archiveInner">
        <div className="archiveChrome">
          <header className="archiveTopBar">
            <div className="archiveTopLeft">
              <Link className="archiveBack" to="/">
                <span className="archiveBackIcon" aria-hidden>
                  <ChevronLeft />
                </span>
                <span className="archiveBackLabel">Canvas</span>
              </Link>
              <div className="archiveTitleBlock">
                <h1 className="archiveTitle">
                  <ArchiveBox /> Archive
                </h1>
                <p className="archiveHint">
                  {isLoggedIn
                    ? "Your folders and canvases are synced to the cloud. Use Ctrl+S to save changes."
                    : "Stored in this browser only (local storage). Use Save current canvas here or Save to archive in the menu."}
                </p>
              </div>
            </div>
            <div className="archiveTopActions">
              <button
                className="archiveSaveCanvas"
                type="button"
                onClick={() => void handleSaveCurrentCanvas()}
                disabled={createCanvas.isPending}
              >
                {createCanvas.isPending ? "Saving..." : "Save current canvas"}
              </button>
              <button
                className="archiveNewFolder"
                type="button"
                onClick={() => void handleNewFolder()}
                disabled={createFolder.isPending}
              >
                {createFolder.isPending ? "Creating..." : "New folder"}
              </button>
              <AuthHeaderAccount />
            </div>
          </header>
        </div>

        {isLoading ? (
          <ArchiveLoadingSkeleton />
        ) : (
          <div className="archiveBoard">
            {folders.length === 0 ? (
              isLoggedIn ? (
                <div className="archiveBoardEmpty archiveEmptyOnboarding">
                  <h3>Welcome to your Archive</h3>
                  <p>Looks like you don't have any folders yet. Let's create your first folder and canvas!</p>
                  <div className="archiveEmptyActions">
                    <button
                      className="archiveNewFolder"
                      type="button"
                      onClick={() => void handleNewFolder()}
                      disabled={createFolder.isPending}
                    >
                      {createFolder.isPending ? "Creating..." : "Create your first folder"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="archiveBoardEmpty">
                  No folders yet. Use <strong>New folder</strong>, then on the canvas use the menu →{" "}
                  <strong>Save to archive</strong>.
                </p>
              )
            ) : (
              folders.map((folder) => (
                <article key={folder.id} className="archiveFolderCard">
                  <div className="archiveFolderCardHead">
                    <h2 className="archiveFolderCardTitle">{folder.name}</h2>
                    <button
                      className="archiveFolderCardDelete"
                      type="button"
                      title="Delete folder"
                      onClick={() => void handleDeleteFolder(folder)}
                      disabled={deleteFolder.isPending}
                    >
                      <Delete />
                    </button>
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
                              {isCanvasSameDiagram ? (
                                <button
                                  className="archiveBtnSave"
                                  type="button"
                                  title="Update archive with current canvas"
                                  onClick={() => handleUpdateArchivedDiagram(folder.id, diagram.id, diagram.name)}
                                  disabled={updateCanvas.isPending}
                                >
                                  {updateCanvas.isPending ? "Saving..." : "Save"}
                                </button>
                              ) : null}
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
