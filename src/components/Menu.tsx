import { useState } from "react";
import { Delete, Download, Folder, MenuIcon, Xmark } from "../assets/icons";
import { saveElements, uploadElements } from "../helper/element";
import { useAppContext } from "../provider/AppStates";
import { DrawElement } from "../types";

export default function Menu(): JSX.Element {
  const [show, setShow] = useState<boolean>(false);

  return (
    <div className="menu">
      <button
        className="menuBtn sectionStyle"
        type="button"
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
  
  const uploadJson = (): void => {
    uploadElements(setElements as (action: DrawElement[]) => void);
    close();
  };
  
  const downloadJson = (): void => {
    saveElements(elements);
    close();
  };
  
  const reset = (): void => {
    if (window.confirm("The entire canvas will be erased. Are you sure?")) {
      setToDefault();
      close();
    }
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
        {!session && (
          <button className="menuItem" type="button" onClick={reset}>
            <Delete /> <span>Reset the canvas</span>
          </button>
        )}
      </section>
    </>
  );
}
