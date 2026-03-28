import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";
import { socket } from "../api/socket";
import {
  Arrow,
  Circle,
  Diamond,
  Hand,
  Image,
  Line,
  Lock,
  Pencil,
  Rectangle,
  Selection,
  Text,
} from "../assets/icons";
import { BACKGROUND_COLORS, STROKE_COLORS, STROKE_STYLES } from "../global/var";
import { getElementById, minmax } from "../helper/element";
import useHistory from "../hooks/useHistory";
import {
  ActionType,
  AppContextType,
  DrawElement,
  ElementStyle,
  ScaleOffset,
  SelectedElement,
  Tool,
  ToolSlug,
  TranslateState,
} from "../types";

const AppContext = createContext<AppContextType | null>(null);

const defaultElements: DrawElement[] = [];
const defaultTranslate: TranslateState = {
  x: 0,
  y: 0,
  sx: 0,
  sy: 0,
};
const defaultSelectedTool: ToolSlug = "selection";
const defaultScale = 1;
const defaultSelectedElement: SelectedElement | null = null;
const defaultAction: ActionType = "none";
const defaultScaleOffset: ScaleOffset = { x: 0, y: 0 };
const defaultSession: string | null = null;
const defaultLockTool = false;
const defaultStyle: ElementStyle = {
  strokeWidth: 3,
  strokeColor: STROKE_COLORS[0],
  strokeStyle: STROKE_STYLES[0].slug,
  fill: BACKGROUND_COLORS[0],
  opacity: 100,
  borderRadius: 0,
  roughness: 1,
  arrowType: 'sharp',
  arrowheads: 'end',
};

const isElementsInLocal = (): DrawElement[] => {
  try {
    const stored = localStorage.getItem("elements");
    if (!stored) return defaultElements;
    const parsed = JSON.parse(stored) as DrawElement[];
    parsed.forEach(() => {}); // validate it's an array
    return parsed;
  } catch {
    return defaultElements;
  }
};

const initialElements = isElementsInLocal();

interface AppContextProviderProps {
  children: ReactNode;
}

export function AppContextProvider({ children }: AppContextProviderProps): JSX.Element {
  const [session, setSession] = useState<string | null>(defaultSession);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(
    defaultSelectedElement
  );
  const [action, setAction] = useState<ActionType>(defaultAction);
  const [selectedTool, setSelectedTool] = useState<ToolSlug>(defaultSelectedTool);
  const [translate, setTranslate] = useState<TranslateState>(defaultTranslate);
  const [scale, setScale] = useState<number>(defaultScale);
  const [scaleOffset, setScaleOffset] = useState<ScaleOffset>(defaultScaleOffset);
  const [lockTool, setLockTool] = useState<boolean>(defaultLockTool);
  const [style, setStyle] = useState<ElementStyle>(defaultStyle);
  const [elements, setElements, undo, redo] = useHistory(initialElements, session);

  const [rerender, setRerender] = useState<boolean>(true);

  useEffect(() => {
    try {
      localStorage.setItem("elements", JSON.stringify(elements));
    } catch {
      alert("We couldn't save your last action. Try again.");
      return;
    }

    if (!getElementById(selectedElement?.id, elements)) {
      setSelectedElement(null);
    }
  }, [elements, session, selectedElement]);

  const onZoom = (delta: number | "default"): void => {
    if (delta === "default") {
      setScale(1);
      return;
    }

    setScale((prevState) => minmax(prevState + delta, [0.1, 20]));
  };

  const toolAction = (slug: string): void => {
    if (slug === "lock") {
      setLockTool((prevState) => !prevState);
      return;
    }
    setSelectedTool(slug as ToolSlug);
  };

  const tools: Tool[][] = [
    [
      {
        slug: "lock",
        icon: Lock as FC,
        title: "Keep selected tool active after drawing",
        toolAction,
      },
    ],
    [
      {
        slug: "hand",
        icon: Hand as FC,
        title: "Hand",
        toolAction,
      },
      {
        slug: "selection",
        icon: Selection as FC,
        title: "Selection",
        toolAction,
      },
      {
        slug: "rectangle",
        icon: Rectangle as FC,
        title: "Rectangle",
        toolAction,
      },
      {
        slug: "diamond",
        icon: Diamond as FC,
        title: "Diamond",
        toolAction,
      },
      {
        slug: "circle",
        icon: Circle as FC,
        title: "Circle",
        toolAction,
      },
      {
        slug: "arrow",
        icon: Arrow as FC,
        title: "Arrow",
        toolAction,
      },
      {
        slug: "line",
        icon: Line as FC,
        title: "Line",
        toolAction,
      },
      {
        slug: "pencil",
        icon: Pencil as FC,
        title: "Pencil",
        toolAction,
      },
      {
        slug: "text",
        icon: Text as FC,
        title: "Text",
        toolAction,
      },
      {
        slug: "image",
        icon: Image as FC,
        title: "Image",
        toolAction,
      },
    ],
  ];

  useEffect(() => {
    if (session) {
      socket.on("setElements", (data: DrawElement[]) => {
        setElements(data, true, false);
      });
    }
  }, [session, setElements]);

  function setToDefault(): void {
    setSelectedTool(defaultSelectedTool);
    setAction(defaultAction);
    setElements(defaultElements);
    setTranslate(defaultTranslate);
    setLockTool(defaultLockTool);
    setScale(defaultScale);
    setScaleOffset(defaultScaleOffset);
    setStyle(defaultStyle);
    setSession(defaultSession);
  }

  return (
    <AppContext.Provider
      value={{
        action,
        setAction,
        tools,
        selectedTool,
        setSelectedTool,
        elements,
        setElements,
        translate,
        setTranslate,
        scale,
        setScale,
        onZoom,
        scaleOffset,
        setScaleOffset,
        lockTool,
        setLockTool,
        style,
        setStyle,
        selectedElement,
        setSelectedElement,
        undo,
        redo,
        session,
        setSession,
        setToDefault,
        rerender,
        setRerender,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
