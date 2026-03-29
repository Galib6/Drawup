import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArchiveBox, ChevronLeft, Delete } from "../assets/icons";
import AuthHeaderAccount from "../components/AuthHeaderAccount";
import {
  formatDiagramTimestamp,
  loadArchivedDiagramWithPrompts,
  saveCurrentDiagramToArchive,
} from "../helper/archiveLoadFlow";
import { addFolder, readArchive, removeDesign, removeFolder, updateDesign } from "../helper/archiveStorage";
import { useAppContext } from "../provider/AppStates";
import { useModal } from "../provider/ModalContext";
import type { ArchiveFolder } from "../types/archive";

export default function Archive(): JSX.Element {
  const navigate = useNavigate();
  const modal = useModal();
  const { setElements, elements, canUndo, session, activeArchiveDiagram, setActiveArchiveDiagram } =
    useAppContext();
  const [data, setData] = useState(readArchive);

  const refresh = useCallback((): void => {
    setData(readArchive());
  }, []);

  const handleSaveCurrentCanvas = async (): Promise<void> => {
    const ok = await saveCurrentDiagramToArchive(modal, elements);
    if (ok) refresh();
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
    addFolder(name);
    refresh();
  };

  const handleDeleteFolder = async (folder: ArchiveFolder): Promise<void> => {
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
    removeFolder(folder.id);
    refresh();
  };

  const handleOpenDiagram = async (folderId: string, designId: string): Promise<void> => {
    const folder = data.folders.find((f) => f.id === folderId);
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
    refresh();
  };

  const handleUpdateArchivedDiagram = (folderId: string, designId: string): void => {
    if (!updateDesign(folderId, designId, elements)) return;
    refresh();
  };

  const handleDeleteDiagram = async (folderId: string, designId: string): Promise<void> => {
    const ok = await modal.confirm({
      title: "Remove diagram",
      message: "Remove this diagram from the archive?",
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    removeDesign(folderId, designId);
    if (
      activeArchiveDiagram?.folderId === folderId &&
      activeArchiveDiagram?.designId === designId
    ) {
      setActiveArchiveDiagram(null);
    }
    refresh();
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
                  Stored in this browser only (local storage). Use <strong>Save current canvas</strong> here or{" "}
                  <strong>Save to archive</strong> in the menu — then pick folder and name in the popup.
                </p>
              </div>
            </div>
            <div className="archiveTopActions">
              <button
                className="archiveSaveCanvas"
                type="button"
                onClick={() => void handleSaveCurrentCanvas()}
              >
                Save current canvas
              </button>
              <button className="archiveNewFolder" type="button" onClick={() => void handleNewFolder()}>
                New folder
              </button>
              <AuthHeaderAccount />
            </div>
          </header>
        </div>

        <div className="archiveBoard">
          {data.folders.length === 0 ? (
            <p className="archiveBoardEmpty">
              No folders yet. Use <strong>New folder</strong>, then on the canvas use the menu →{" "}
              <strong>Save to archive</strong>.
            </p>
          ) : (
            data.folders.map((folder) => (
              <article key={folder.id} className="archiveFolderCard">
                <div className="archiveFolderCardHead">
                  <h2 className="archiveFolderCardTitle">{folder.name}</h2>
                  <button
                    className="archiveFolderCardDelete"
                    type="button"
                    title="Delete folder"
                    onClick={() => void handleDeleteFolder(folder)}
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
                              onClick={() => handleUpdateArchivedDiagram(folder.id, diagram.id)}
                            >
                              Save
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
      </div>
    </div>
  );
}
