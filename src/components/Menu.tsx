import { useAuthSession } from "@components/auth/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArchiveBox,
  ChevronDown,
  ChevronRight,
  Delete,
  Download,
  Folder,
  MenuIcon,
  Plus,
  SidebarPanelIcon,
  Xmark,
} from "../assets/icons";
import {
  formatDiagramTimestamp,
  loadArchivedDiagramWithPrompts,
  saveCurrentDiagramToArchive,
} from "../helper/archiveLoadFlow";
import { addDesign, addFolder, readArchive, removeDesign, updateDesign } from "../helper/archiveStorage";
import { saveElements, uploadElements } from "../helper/element";
import { useAppContext } from "../provider/AppStates";
import { useModal } from "../provider/ModalContext";
import type { ArchiveData } from "../types/archive";
import { DrawElement } from "../types";

export default function Menu(): JSX.Element {
  const [show, setShow] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const { isAuthenticate: isLoggedIn } = useAuthSession();

  const openArchiveFromMenu = (): void => {
    setArchiveOpen(true);
    setShow(false);
  };

  const toggleArchiveFromToolbar = (): void => {
    setArchiveOpen((o) => !o);
  };

  return (
    <div className="menu">
      <div className="menuToolbar">
        <button
          className="menuBtn"
          type="button"
          aria-label={show ? "Close menu" : "Open menu"}
          aria-expanded={show}
          onClick={() => setShow((prev) => !prev)}
        >
          {show ? <Xmark /> : <MenuIcon />}
        </button>
        {isLoggedIn ? (
          <button
            className={`menuBtn menuArchiveSidebarBtn ${archiveOpen ? "menuArchiveSidebarBtnActive" : ""}`}
            type="button"
            aria-label={archiveOpen ? "Close archive panel" : "Open archive"}
            aria-expanded={archiveOpen}
            onClick={toggleArchiveFromToolbar}
          >
            <SidebarPanelIcon />
          </button>
        ) : null}
      </div>

      {show && (
        <>
          <div className="menuBlur" onClick={() => setShow(false)}></div>
          <div className="menuSurfaces">
            <MenuBox
              close={() => setShow(false)}
              archiveOpen={archiveOpen}
              onOpenArchive={openArchiveFromMenu}
            />
          </div>
        </>
      )}

      {archiveOpen && <ArchivePanel onClose={() => setArchiveOpen(false)} />}
    </div>
  );
}

interface MenuBoxProps {
  close: () => void;
  archiveOpen: boolean;
  onOpenArchive: () => void;
}

function MenuBox({ close, archiveOpen, onOpenArchive }: MenuBoxProps): JSX.Element {
  const { elements, setElements, setToDefault, session } = useAppContext();
  const modal = useModal();
  const { isAuthenticate: isLoggedIn } = useAuthSession();

  const uploadJson = (): void => {
    uploadElements(setElements as (action: DrawElement[]) => void);
    close();
  };

  const downloadJson = (): void => {
    saveElements(elements);
    close();
  };

  const saveToArchive = async (): Promise<void> => {
    close();
    const data = readArchive();
    if (data.folders.length === 0) {
      await modal.alert({
        title: "No folders",
        message: "Create a folder first: use the archive panel button or menu → Archive → Add folder.",
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

    if (!result) return;
    const folderId = result.folderId?.trim();
    const diagramName = result.diagramName?.trim();
    if (!folderId || !diagramName) return;
    addDesign(folderId, diagramName, elements);
  };

  const reset = async (): Promise<void> => {
    const ok = await modal.confirm({
      title: "Reset canvas",
      message: "The entire canvas will be erased. Are you sure?",
      confirmLabel: "Reset",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    setToDefault();
    close();
  };

  return (
    <section className="menuItems">
      <button className="menuItem" type="button" onClick={uploadJson}>
        <Folder /> <span>Open</span>
      </button>
      <button className="menuItem" type="button" onClick={downloadJson}>
        <Download /> <span>Save</span>
      </button>
      {isLoggedIn ? (
        <>
          <button className="menuItem" type="button" onClick={() => void saveToArchive()}>
            <ArchiveBox /> <span>Save to archive</span>
          </button>
          <button
            className={`menuArchiveEntry ${archiveOpen ? "menuArchiveEntryActive" : ""}`}
            type="button"
            aria-expanded={archiveOpen}
            aria-haspopup="dialog"
            onClick={onOpenArchive}
          >
            <span className="menuArchiveEntryMain">
              <ArchiveBox /> <span>Archive</span>
            </span>
            <span className="menuArchiveEntryChevron">
              <ChevronRight />
            </span>
          </button>
        </>
      ) : null}
      {!session && (
        <button className="menuItem" type="button" onClick={() => void reset()}>
          <Delete /> <span>Reset the canvas</span>
        </button>
      )}
    </section>
  );
}

interface ArchivePanelProps {
  onClose: () => void;
}

function ArchivePanel({ onClose }: ArchivePanelProps): JSX.Element {
  const { setElements, elements, canUndo, session, activeArchiveDiagram, setActiveArchiveDiagram } =
    useAppContext();
  const modal = useModal();
  const navigate = useNavigate();
  const [archiveData, setArchiveData] = useState<ArchiveData>(() => readArchive());
  const [openFolderIds, setOpenFolderIds] = useState<Set<string>>(() => new Set());

  const refreshArchive = (): void => {
    setArchiveData(readArchive());
  };

  const handleSaveCurrentCanvas = async (): Promise<void> => {
    const ok = await saveCurrentDiagramToArchive(modal, elements);
    if (ok) refreshArchive();
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
    refreshArchive();
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
    refreshArchive();
  };

  const handleUpdateArchivedDiagram = (folderId: string, designId: string): void => {
    if (!updateDesign(folderId, designId, elements)) return;
    refreshArchive();
  };

  const toggleFolderOpen = (folderId: string): void => {
    setOpenFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const handleOpenDiagram = async (folderId: string, designId: string): Promise<void> => {
    const folder = archiveData.folders.find((f) => f.id === folderId);
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
        onClose();
        navigate("/");
      }
    );
    refreshArchive();
  };

  return (
    <section className="menuArchiveFlyout" role="dialog" aria-label="Archive">
      <header className="menuArchiveFlyoutHead">
        <span className="menuArchiveFlyoutTitle">
          <ArchiveBox /> Archive
        </span>
        <button
          className="menuArchiveFlyoutClose"
          type="button"
          aria-label="Close archive"
          onClick={onClose}
        >
          <Xmark />
        </button>
      </header>
      <div className="menuArchiveFlyoutBody">
        <button
          className="menuArchiveSaveCanvasRow"
          type="button"
          onClick={() => void handleSaveCurrentCanvas()}
        >
          <ArchiveBox /> <span>Save current canvas</span>
        </button>
        <button className="menuArchiveAddRow" type="button" onClick={() => void handleNewFolder()}>
          <Plus /> <span>Add folder</span>
        </button>
        {archiveData.folders.length === 0 ? (
          <p className="menuArchiveEmpty">
            No folders yet. Add a folder, then use Save current canvas or the menu → Save to archive.
          </p>
        ) : (
          <ul className="menuArchiveFolderList">
            {archiveData.folders.map((folder) => {
              const expanded = openFolderIds.has(folder.id);
              return (
                <li key={folder.id} className="menuArchiveFolderItem">
                  <button
                    className="menuArchiveFolderToggle"
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => toggleFolderOpen(folder.id)}
                  >
                    <Folder />
                    <span className="menuArchiveFolderName">{folder.name}</span>
                    <span className={`menuArchiveChevron ${expanded ? "menuArchiveChevronOpen" : ""}`}>
                      <ChevronDown />
                    </span>
                  </button>
                  {expanded && (
                    <ul className="menuArchiveFileList">
                      {folder.designs.length === 0 ? (
                        <li className="menuArchiveFilePlaceholder">No diagrams yet</li>
                      ) : (
                        folder.designs.map((d) => {
                          const isCanvasSameDiagram =
                            activeArchiveDiagram?.folderId === folder.id &&
                            activeArchiveDiagram?.designId === d.id;
                          return (
                          <li key={d.id} className="menuArchiveFileListItem">
                            <button
                              className="menuArchiveFileRow"
                              type="button"
                              onClick={() => void handleOpenDiagram(folder.id, d.id)}
                            >
                              <span className="menuArchiveFileRowLogo" aria-hidden>
                                <ArchiveBox />
                              </span>
                              <span className="menuArchiveFileRowInfo">
                                <span className="menuArchiveFileRowName">{d.name}</span>
                                <span className="menuArchiveFileRowTime">
                                  {formatDiagramTimestamp(d.updatedAt)}
                                </span>
                              </span>
                            </button>
                            {isCanvasSameDiagram ? (
                              <button
                                className="menuArchiveFileRowSave"
                                type="button"
                                title="Update archive with current canvas"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateArchivedDiagram(folder.id, d.id);
                                }}
                              >
                                Save
                              </button>
                            ) : null}
                            <button
                              className="menuArchiveFileRowDelete"
                              type="button"
                              title="Remove diagram"
                              aria-label={`Remove ${d.name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleDeleteDiagram(folder.id, d.id);
                              }}
                            >
                              <Delete />
                            </button>
                          </li>
                          );
                        })
                      )}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
