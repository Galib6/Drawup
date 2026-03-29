import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArchiveBox, ChevronLeft, Delete } from "../assets/icons";
import ArchiveUserAvatar from "../components/ArchiveUserAvatar";
import { addFolder, readArchive, removeDesign, removeFolder } from "../helper/archiveStorage";
import { useAppContext } from "../provider/AppStates";
import { useModal } from "../provider/ModalContext";
import type { ArchiveFolder } from "../types/archive";
import type { DrawElement } from "../types";

export default function Archive(): JSX.Element {
  const navigate = useNavigate();
  const modal = useModal();
  const { setElements } = useAppContext();
  const [data, setData] = useState(readArchive);

  const refresh = useCallback((): void => {
    setData(readArchive());
  }, []);

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

  const handleOpenDiagram = (folderId: string, designId: string): void => {
    const folder = data.folders.find((f) => f.id === folderId);
    const diagram = folder?.designs.find((d) => d.id === designId);
    if (!diagram) return;
    setElements(JSON.parse(JSON.stringify(diagram.elements)) as DrawElement[], true);
    navigate("/");
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
    refresh();
  };

  const formatDate = (ts: number): string => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(ts));
    } catch {
      return new Date(ts).toLocaleString();
    }
  };

  return (
    <div className="archivePage">
      <div className="archiveInner">
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
                Stored in this browser only (local storage). Save from the canvas menu:{" "}
                <strong>Save to archive</strong> — pick folder and diagram name in the popup.
              </p>
            </div>
          </div>
          <div className="archiveTopActions">
            <button className="archiveNewFolder" type="button" onClick={() => void handleNewFolder()}>
              New folder
            </button>
            <ArchiveUserAvatar />
          </div>
        </header>

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
                    folder.designs.map((diagram) => (
                      <li key={diagram.id} className="archiveDiagramTile">
                        <div className="archiveDiagramTileMain">
                          <span className="archiveDiagramTileName">{diagram.name}</span>
                          <span className="archiveDiagramTileMeta">
                            {diagram.elements.length} elements · {formatDate(diagram.updatedAt)}
                          </span>
                        </div>
                        <div className="archiveDiagramTileActions">
                          <button
                            className="archiveBtnOpen"
                            type="button"
                            onClick={() => handleOpenDiagram(folder.id, diagram.id)}
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
                    ))
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
