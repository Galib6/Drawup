import { useAppContext } from "../provider/AppStates";
import Collaboration from "./Collaboration";
import Credits from "./Credits";
import Menu from "./Menu";
import Style from "./Style";
import ToolBar from "./ToolBar";
import UndoRedo from "./UndoRedo";
import Zoom from "./Zoom";

export default function Ui(): JSX.Element {
  const { selectedElement, selectedTool, style } = useAppContext();

  return (
    <main className="ui">
      <header>
        <Menu />
        <ToolBar />
        <Collaboration />
      </header>
      {(!["selection", "hand"].includes(selectedTool) || selectedElement) && (
        <Style selectedElement={selectedElement || style} />
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
