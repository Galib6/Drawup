import { SaveIcon } from "../assets/icons";
import { useCanvasSaveAction } from "../hooks/useCanvasSaveAction";
import { useAppContext } from "../provider/AppStates";

export default function ToolBar(): JSX.Element {
  const { tools: toolCols, selectedTool, lockTool } = useAppContext();
  const { save, busy: saveBusy, disabled: saveDisabled } = useCanvasSaveAction();

  return (
    <section className="sectionStyle toolbar">
      {toolCols.map((tools, index) => (
        <div key={index}>
          {tools.map((tool, index_) => (
            <button
              key={index_}
              className={
                "toolbutton" +
                ` ${tool.slug}` +
                (selectedTool === tool.slug ? " selected" : "")
              }
              data-lock={lockTool}
              onClick={() => tool.toolAction(tool.slug)}
              title={tool.title}
            >
              <tool.icon />
            </button>
          ))}
        </div>
      ))}
      <div>
        <button
          className="toolbutton toolbarSave"
          type="button"
          title="Save (Ctrl+S when a diagram is open)"
          aria-label="Save"
          aria-busy={saveBusy}
          disabled={saveDisabled}
          onClick={() => void save()}
        >
          <SaveIcon />
        </button>
      </div>
    </section>
  );
}
