import { getElementById } from "../helper/element";
import { useAppContext } from "../provider/AppStates";
import Collaboration from "./Collaboration";
import Credits from "./Credits";
import Menu from "./Menu";
import Style from "./Style";
import ToolBar from "./ToolBar";
import UndoRedo from "./UndoRedo";
import Zoom from "./Zoom";

export default function Ui(): JSX.Element {
  const { selectedElement, selectedTool, style, selectedIds, elements } =
    useAppContext();

  const primaryForStyle =
    selectedIds.length > 0
      ? getElementById(selectedIds[0], elements)
      : selectedElement;

  return (
    <main className="ui">
      <header>
        <Menu />
        <ToolBar />
        <Collaboration />
      </header>
      {(!["selection", "hand"].includes(selectedTool) ||
        selectedIds.length > 0 ||
        selectedElement) && (
        <Style selectedElement={primaryForStyle || style} />
      )}

      <footer>
        <div>
          <Zoom />
          <UndoRedo />
        </div>
        <div>
          <Credits />
        </div>
      </footer>
    </main>
  );
}
