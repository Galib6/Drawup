import { useAuthSession } from "@components/auth/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArchiveBox,
  Delete,
  Download,
  Folder,
  MenuIcon,
  Plus,
  Xmark,
} from "../assets/icons";
import { saveElements, uploadElements } from "../helper/element";
import { persistCurrentCanvas } from "../helper/persistCurrentCanvas";
import { canvasNeedsSavePrompt, saveNewDiagramThroughForm } from "../helper/saveNewToArchive";
import { useGoToArchivePage } from "../hooks/useArchiveNavigation";
import {
  useArchiveFolders,
  useCreateArchiveCanvas,
  useCreateArchiveFolder,
  useUpdateArchiveCanvas,
} from "../hooks/useArchiveService";
import { appToast } from "../lib/appToast";
import { useAppContext } from "../provider/AppStates";
import { useCloudSyncContext } from "../provider/CloudSyncContext";
import { useModal } from "../provider/ModalContext";
import type { DrawElement } from "../types";

export default function Menu(): JSX.Element {
  const [show, setShow] = useState(false);
  const closeMenu = (): void => setShow(false);
  const goToArchivePage = useGoToArchivePage();

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
        <button
          className="menuBtn menuArchiveSidebarBtn"
          type="button"
          aria-label="Open archive"
          onClick={() => void goToArchivePage()}
        >
          <ArchiveBox />
        </button>
      </div>

      {show && (
        <>
          <div className="menuBlur" onClick={closeMenu}></div>
          <div className="menuSurfaces">
            <MenuBox
              close={closeMenu}
              goToArchivePage={() => goToArchivePage({ beforeNavigate: closeMenu })}
            />
          </div>
        </>
      )}
    </div>
  );
}

interface MenuBoxProps {
  close: () => void;
  goToArchivePage: () => Promise<void>;
}

function MenuBox({ close, goToArchivePage }: MenuBoxProps): JSX.Element {
  const navigate = useNavigate();
  const { isAuthenticate: isLoggedIn } = useAuthSession();
  const {
    elements,
    setElements,
    setToDefault,
    session,
    canUndo,
    setActiveArchiveDiagram,
    activeArchiveDiagram,
  } = useAppContext();
  const modal = useModal();
  const { canSync, hasUnsavedChanges, syncToCloud, setSyncBaseline } = useCloudSyncContext();
  const { refetch, refetchUnified } = useArchiveFolders();
  const createCanvas = useCreateArchiveCanvas();
  const createFolder = useCreateArchiveFolder();
  const updateCanvas = useUpdateArchiveCanvas();

  const uploadJson = (): void => {
    uploadElements(setElements as (action: DrawElement[]) => void);
    close();
  };

  const downloadJson = (): void => {
    saveElements(elements);
    close();
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

  const startNewCanvas = async (): Promise<void> => {
    close();
    if (canvasNeedsSavePrompt(session, elements, canUndo, canSync, hasUnsavedChanges)) {
      const saveFirst = await modal.confirm({
        title: "Unsaved changes",
        message: "Save your work before starting a new canvas? You can leave without saving.",
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
    }

    const latest = await refetchUnified();
    const info = await saveNewDiagramThroughForm({
      modal,
      folders: latest,
      elements: [],
      createFolderAsync: createFolder.mutateAsync,
      createCanvasAsync: createCanvas.mutateAsync,
      formTitle: "New canvas",
      submitLabel: "Create",
      diagramNameLabel: "Canvas name",
      diagramNamePlaceholder: "Untitled",
      diagramNameDefault: "Untitled",
    });
    if (!info) return;

    setToDefault();
    setActiveArchiveDiagram(info);
    setSyncBaseline([]);
    void refetch();
    navigate("/", { replace: true });
    appToast.success("New canvas ready");
  };

  return (
    <section className="menuItems">
      <button className="menuItem" type="button" onClick={uploadJson}>
        <Folder /> <span>Open</span>
      </button>
      <button className="menuItem" type="button" onClick={() => void startNewCanvas()}>
        <Plus /> <span>New canvas</span>
      </button>
      <button className="menuItem" type="button" onClick={downloadJson}>
        <Download /> <span>Save</span>
      </button>
      <button className="menuItem" type="button" onClick={() => void goToArchivePage()}>
        <ArchiveBox /> <span>Archive</span>
      </button>
      {!session && (
        <button className="menuItem" type="button" onClick={() => void reset()}>
          <Delete /> <span>Reset the canvas</span>
        </button>
      )}
    </section>
  );
}
