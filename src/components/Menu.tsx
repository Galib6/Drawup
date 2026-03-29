import { Paths } from "@base/constants/paths";
import { useAuthSession } from "@components/auth/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArchiveBox, Delete, Download, Folder, MenuIcon, Xmark } from "../assets/icons";
import { addDesign, readArchive } from "../helper/archiveStorage";
import { saveElements, uploadElements } from "../helper/element";
import { useAppContext } from "../provider/AppStates";
import { useModal } from "../provider/ModalContext";
import { DrawElement } from "../types";

export default function Menu(): JSX.Element {
  const [show, setShow] = useState<boolean>(false);

  return (
    <div className="menu">
      <button
        className="menuBtn"
        type="button"
        aria-label={show ? "Close menu" : "Open menu"}
        aria-expanded={show}
        onClick={() => setShow((prev) => !prev)}
      >
        {show ? <Xmark /> : <MenuIcon />}
      </button>

      {show && <MenuBox close={() => setShow(false)} />}
    </div>
  );
}

interface MenuBoxProps {
  close: () => void;
}

function MenuBox({ close }: MenuBoxProps): JSX.Element {
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
        message: "Create a folder first: open Archive and use New folder.",
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
    <>
      <div className="menuBlur" onClick={close}></div>
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
            <Link className="menuItem" to={Paths.archive} onClick={close}>
              <Folder /> <span>Archive</span>
            </Link>
          </>
        ) : null}
        {!session && (
          <button className="menuItem" type="button" onClick={() => void reset()}>
            <Delete /> <span>Reset the canvas</span>
          </button>
        )}
      </section>
    </>
  );
}
