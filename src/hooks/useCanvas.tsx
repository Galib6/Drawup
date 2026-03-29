import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  cornerCursor,
  draw,
  drawFocuse,
  excalifontReady,
  imageCache,
  inSelectedCorner,
} from "../helper/canvas";
import { lockUI } from "../helper/ui";
import { useAppContext } from "../provider/AppStates";
import useDimension from "./useDimension";

import {
  adjustCoordinates,
  arrowMove,
  createElement,
  deleteElement,
  duplicateElement,
  getElementById,
  getElementPosition,
  minmax,
  resizeValue,
  saveElements,
  updateElement,
  uploadElements,
} from "../helper/element";
import {
  BoundingBox,
  Corner,
  DrawElement,
  MouseAction,
  Point,
  SelectedElement,
  UseCanvasReturn,
} from "../types";
import useKeys from "./useKeys";
import useTextArea from "./useTextArea";

export default function useCanvas(): UseCanvasReturn {
  const {
    selectedTool,
    setSelectedTool,
    action,
    setAction,
    elements,
    setElements,
    scale,
    onZoom,
    translate,
    setTranslate,
    scaleOffset,
    setScaleOffset,
    lockTool,
    style,
    selectedElement,
    setSelectedElement,
    undo,
    redo,
    rerender,
    setRerender,
  } = useAppContext();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useKeys();
  const dimension = useDimension();
  const [fontLoaded, setFontLoaded] = useState(false);
  const [isInElement, setIsInElement] = useState<boolean>(false);
  const [inCorner, setInCorner] = useState<Corner | null>(null);
  const [padding, setPadding] = useState<number>(minmax(10 / scale, [0.5, 50]));
  const [cursor, setCursor] = useState<string>("default");
  const [mouseAction, setMouseAction] = useState<MouseAction>({ x: 0, y: 0 });
  const [resizeOldDementions, setResizeOldDementions] =
    useState<DrawElement | null>(null);

  const createTextArea = useTextArea();

  useEffect(() => {
    excalifontReady.then(() => setFontLoaded(true));
  }, []);

  const mousePosition = ({
    clientX,
    clientY,
  }: {
    clientX: number;
    clientY: number;
  }): { clientX: number; clientY: number } => {
    clientX = (clientX - translate.x * scale + scaleOffset.x) / scale;
    clientY = (clientY - translate.y * scale + scaleOffset.y) / scale;
    return { clientX, clientY };
  };

  const handleDoubleClick = (
    event: React.MouseEvent<HTMLCanvasElement>
  ): void => {
    const { clientX, clientY } = mousePosition(event);
    const element = getElementPosition(clientX, clientY, elements);

    if (element?.tool === "text" && "text" in element) {
      createTextArea(element, true);
      setSelectedElement(null);
      setRerender((state) => !state);
    }
  };

  const handleMouseDown = (
    event: React.MouseEvent<HTMLCanvasElement>
  ): void => {
    const { clientX, clientY } = mousePosition(event);
    lockUI(true);

    if (inCorner) {
      setResizeOldDementions(
        getElementById(selectedElement?.id, elements) || null
      );
      setElements((prevState) => prevState);
      setMouseAction({ x: event.clientX, y: event.clientY });
      setCursor(cornerCursor(inCorner.slug));
      setAction(
        `resize-${inCorner.slug}${event.shiftKey ? "-shiftkey" : ""}`
      );
      return;
    }

    if (keys.has(" ") || selectedTool === "hand" || event.button === 1) {
      setTranslate((prevState) => ({
        ...prevState,
        sx: clientX,
        sy: clientY,
      }));
      setAction("translate");
      return;
    }

    if (selectedTool === "selection") {
      const element = getElementPosition(clientX, clientY, elements);

      if (element) {
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;

        if (event.altKey) {
          duplicateElement(
            element as SelectedElement,
            setElements as (
              action: (prev: DrawElement[]) => DrawElement[]
            ) => void,
            setSelectedElement,
            0,
            {
              offsetX,
              offsetY,
            }
          );
        } else {
          setElements((prevState) => prevState);
          setMouseAction({ x: event.clientX, y: event.clientY });
          setSelectedElement({
            ...element,
            offsetX,
            offsetY,
            lastPosX: clientX,
            lastPosY: clientY,
          });
        }
        setAction("move");
      } else {
        setSelectedElement(null);
      }

      return;
    }
    setAction("draw");

    const element = createElement({
      x1: clientX,
      y1: clientY,
      x2: clientX,
      y2: clientY,
      style,
      tool: selectedTool,
      text: "",
    });
    setElements((prevState) => [...prevState, element]);
  };

  function getBoundingBox(points: Point[]): BoundingBox {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    return {
      x1: Math.min(...xs),
      y1: Math.min(...ys),
      x2: Math.max(...xs),
      y2: Math.max(...ys),
    };
  }

  const handleMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement>
  ): void => {
    const { clientX, clientY } = mousePosition(event);

    if (selectedElement) {
      setInCorner(
        inSelectedCorner(
          getElementById(selectedElement.id, elements),
          clientX,
          clientY,
          padding,
          scale
        )
      );
    }

    if (getElementPosition(clientX, clientY, elements)) {
      setIsInElement(true);
    } else {
      setIsInElement(false);
    }

    if (action === "draw") {
      const currentDrawingElement = elements.at(-1);
      if (!currentDrawingElement) return;

      let newStateOptions: Partial<DrawElement> = { x2: clientX, y2: clientY };

      if (
        currentDrawingElement.tool === "pencil" &&
        "points" in currentDrawingElement
      ) {
        const points = [
          ...currentDrawingElement.points,
          { x: clientX, y: clientY },
        ];
        newStateOptions = {
          points,
          ...getBoundingBox(points),
        } as Partial<DrawElement>;
      }

      updateElement(
        currentDrawingElement.id,
        newStateOptions,
        setElements as (
          action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
          overwrite?: boolean
        ) => void,
        elements,
        true
      );
    } else if (action === "move" && selectedElement) {
      const {
        id,
        x1,
        y1,
        x2,
        y2,
        offsetX = 0,
        offsetY = 0,
        tool,
        lastPosX = 0,
        lastPosY = 0,
      } = selectedElement;
      const points = "points" in selectedElement ? selectedElement.points : [];
      const curvePoint = "curvePoint" in selectedElement ? selectedElement.curvePoint : undefined;
      const midpoints = "midpoints" in selectedElement ? selectedElement.midpoints : undefined;

      const width = x2 - x1;
      const height = y2 - y1;

      const nx = clientX - offsetX;
      const ny = clientY - offsetY;

      const deltaX = clientX - lastPosX;
      const deltaY = clientY - lastPosY;

      let newStateOptions: Partial<DrawElement> = {
        x1: nx,
        y1: ny,
        x2: nx + width,
        y2: ny + height,
      };

      if (tool === "pencil" && points) {
        (newStateOptions as { points: Point[] }).points = points.map((p) => ({
          x: p.x + deltaX,
          y: p.y + deltaY,
        }));
      }

      if ((tool === "arrow" || tool === "line") && curvePoint) {
        (newStateOptions as { curvePoint: Point }).curvePoint = {
          x: curvePoint.x + deltaX,
          y: curvePoint.y + deltaY,
        };
      }
      if ((tool === "arrow" || tool === "line") && midpoints && midpoints.length > 0) {
        (newStateOptions as { midpoints: Point[] }).midpoints = midpoints.map(p => ({
          x: p.x + deltaX,
          y: p.y + deltaY,
        }));
      }

      updateElement(
        id,
        newStateOptions,
        setElements as (
          action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
          overwrite?: boolean
        ) => void,
        elements,
        true
      );
    } else if (action === "translate") {
      const x = clientX - translate.sx;
      const y = clientY - translate.sy;

      setTranslate((prevState) => ({
        ...prevState,
        x: prevState.x + x,
        y: prevState.y + y,
      }));
    } else if (action.startsWith("resize") && selectedElement) {
      const resizePayload = action.slice(7);
      const shiftIdx = resizePayload.indexOf("-shiftkey");
      const resizeCorner = shiftIdx >= 0 ? resizePayload.slice(0, shiftIdx) : resizePayload;
      const resizeType = shiftIdx >= 0 ? "shiftkey" : "default";
      const s_element = getElementById(selectedElement.id, elements);

      if (s_element && resizeOldDementions) {
        updateElement(
          s_element.id,
          resizeValue(
            resizeCorner,
            resizeType,
            clientX,
            clientY,
            padding,
            s_element,
            mouseAction,
            resizeOldDementions
          ),
          setElements as (
            action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
            overwrite?: boolean
          ) => void,
          elements,
          true
        );
      }
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    setAction("none");
    lockUI(false);

    if (event.clientX === mouseAction.x && event.clientY === mouseAction.y) {
      setElements("prevState");
      return;
    }

    if (action === "draw") {
      const lastElement = elements.at(-1);
      if (!lastElement) return;

      const { id, x1, y1, x2, y2 } = adjustCoordinates(lastElement);
      updateElement(
        id,
        { x1, x2, y1, y2 },
        setElements as (
          action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
          overwrite?: boolean
        ) => void,
        elements,
        true
      );

      if (lastElement.tool === "text" && "text" in lastElement) {
        createTextArea(lastElement);
      }

      if (!lockTool && lastElement.tool !== "pencil") {
        setSelectedTool("selection");
        if (lastElement.tool !== "text") setSelectedElement(lastElement);
      }
      return;
    }

    if (action.startsWith("resize") && selectedElement) {
      const adjustedElement = getElementById(selectedElement.id, elements);
      if (adjustedElement) {
        const { id, x1, y1, x2, y2 } = adjustCoordinates(adjustedElement);
        updateElement(
          id,
          { x1, x2, y1, y2 },
          setElements as (
            action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
            overwrite?: boolean
          ) => void,
          elements,
          true
        );
      }
      return;
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>): void => {
    if (event.ctrlKey) {
      const factor = Math.abs(10 - scale);
      const step = event.deltaY < 0 ? scale / factor : -(scale / factor);
      onZoom(step);
      return;
    }

    setTranslate((prevState) => ({
      ...prevState,
      x: prevState.x - event.deltaX,
      y: prevState.y - event.deltaY,
    }));
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const zoomPositionX = 2;
    const zoomPositionY = 2;

    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;

    const scaleOffsetX = (scaledWidth - canvas.width) / zoomPositionX;
    const scaleOffsetY = (scaledHeight - canvas.height) / zoomPositionY;

    setScaleOffset({ x: scaleOffsetX, y: scaleOffsetY });

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();

    context.translate(
      translate.x * scale - scaleOffsetX,
      translate.y * scale - scaleOffsetY
    );
    context.scale(scale, scale);

    const pd = minmax(10 / scale, [0.5, 50]);

    elements.forEach((element) => {
      if (element.id === selectedElement?.id) {
        drawFocuse(element, context, pd, scale);
      }
      draw(element, context);
    });

    setPadding(pd);

    context.restore();
  }, [elements, selectedElement, scale, translate, dimension, rerender, fontLoaded]);

  useEffect(() => {
    const keyDownFunction = (event: KeyboardEvent): void => {
      const { key, ctrlKey, metaKey, shiftKey } = event;
      const prevent = (): void => event.preventDefault();
      if (selectedElement) {
        if (key === "Backspace" || key === "Delete") {
          prevent();
          deleteElement(
            selectedElement,
            setElements as (
              action: (prev: DrawElement[]) => DrawElement[]
            ) => void,
            setSelectedElement
          );
        }

        if (ctrlKey && key.toLowerCase() === "d") {
          prevent();
          duplicateElement(
            selectedElement,
            setElements as (
              action: (prev: DrawElement[]) => DrawElement[]
            ) => void,
            setSelectedElement,
            10
          );
        }

        if (key === "ArrowLeft") {
          prevent();
          arrowMove(
            selectedElement,
            -1,
            0,
            setElements as (
              action: (prev: DrawElement[]) => DrawElement[]
            ) => void
          );
        }
        if (key === "ArrowUp") {
          prevent();
          arrowMove(
            selectedElement,
            0,
            -1,
            setElements as (
              action: (prev: DrawElement[]) => DrawElement[]
            ) => void
          );
        }
        if (key === "ArrowRight") {
          prevent();
          arrowMove(
            selectedElement,
            1,
            0,
            setElements as (
              action: (prev: DrawElement[]) => DrawElement[]
            ) => void
          );
        }
        if (key === "ArrowDown") {
          prevent();
          arrowMove(
            selectedElement,
            0,
            1,
            setElements as (
              action: (prev: DrawElement[]) => DrawElement[]
            ) => void
          );
        }
      }

      if (ctrlKey || metaKey) {
        if (
          key.toLowerCase() === "y" ||
          (key.toLowerCase() === "z" && shiftKey)
        ) {
          prevent();
          redo();
        } else if (key.toLowerCase() === "z") {
          prevent();
          undo();
        } else if (key.toLowerCase() === "s") {
          prevent();
          saveElements(elements);
        } else if (key.toLowerCase() === "o") {
          prevent();
          uploadElements(
            setElements as (action: DrawElement[]) => void
          );
        }
      }
    };

    window.addEventListener("keydown", keyDownFunction, { passive: false });
    return () => {
      window.removeEventListener("keydown", keyDownFunction);
    };
  }, [undo, redo, selectedElement, elements, setElements, setSelectedElement]);

  useEffect(() => {
    if (selectedTool !== "selection") {
      setSelectedElement(null);
    }

    if (selectedTool === "image") {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.id = "fileInput";
      fileInput.click();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const fullWidth = canvas.width;
      const fullHeight = canvas.height;

      const { clientX, clientY } = mousePosition({
        clientX: fullWidth / 2,
        clientY: fullHeight / 2,
      });

      fileInput.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        const maxSize = 3 * 1024 * 1024; // 3MB
        if (file.size > maxSize) {
          alert("File is too big! Please select an image under 3MB.");
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;

          const img = new Image();
          img.src = base64;

          img.onload = () => {
            const maxW = fullWidth / scale / 1.5;
            const maxH = fullHeight / scale / 1.5;
            const w = img.width;
            const h = img.height;

            const img_scale = Math.min(maxW / w, maxH / h);
            const width = (w * img_scale) / 2;
            const height = (h * img_scale) / 2;

            const x1 = clientX - width;
            const y1 = clientY - height;
            const x2 = clientX + width;
            const y2 = clientY + height;

            const element = createElement({
              x1,
              y1,
              x2,
              y2,
              style: { ...style, strokeWidth: 0 },
              tool: selectedTool,
              image: base64,
            });

            imageCache.set(element.id, img);
            setElements((prevState) => [...prevState, element]);
          };
        };
        reader.readAsDataURL(file);
      });

      setSelectedTool("selection");
    }
  }, [selectedTool]);

  useEffect(() => {
    if (action === "translate") {
      document.documentElement.style.setProperty("--canvas-cursor", "grabbing");
    } else if (action.startsWith("resize")) {
      document.documentElement.style.setProperty("--canvas-cursor", cursor);
    } else if (
      (keys.has(" ") || selectedTool === "hand") &&
      action !== "move" &&
      !action.startsWith("resize")
    ) {
      document.documentElement.style.setProperty("--canvas-cursor", "grab");
    } else if (selectedTool !== "selection") {
      document.documentElement.style.setProperty(
        "--canvas-cursor",
        "crosshair"
      );
    } else if (inCorner) {
      document.documentElement.style.setProperty(
        "--canvas-cursor",
        cornerCursor(inCorner.slug)
      );
    } else if (isInElement) {
      document.documentElement.style.setProperty("--canvas-cursor", "move");
    } else {
      document.documentElement.style.setProperty("--canvas-cursor", "default");
    }
  }, [keys, selectedTool, action, isInElement, inCorner, cursor]);

  useEffect(() => {
    const fakeWheel = (event: WheelEvent): void => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };
    window.addEventListener("wheel", fakeWheel, {
      passive: false,
    });

    return () => {
      window.removeEventListener("wheel", fakeWheel);
    };
  }, []);

  return {
    canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleDoubleClick,
    dimension,
  };
}
