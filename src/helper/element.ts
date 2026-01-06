import { v4 as uuid } from "uuid";
import {
    BoundingBox,
    CreateElementParams,
    DrawElement,
    Point,
    SelectedElement,
} from "../types";
import { distance } from "./canvas";

const fileNameExtention = ".Draw Up";

function pointToSegmentDistance(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  const dx = bx - ax;
  const dy = by - ay;

  if (dx === 0 && dy === 0) {
    // A and B are the same point
    return Math.hypot(px - ax, py - ay);
  }

  // Project point P onto segment AB, normalized between 0 and 1
  let t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));

  // Find closest point
  const cx = ax + t * dx;
  const cy = ay + t * dy;

  return Math.hypot(px - cx, py - cy);
}

export function isWithinElement(
  x: number,
  y: number,
  element: DrawElement
): boolean {
  let { tool, x1, y1, x2, y2, strokeWidth } = element;
  const points = 'points' in element ? element.points : [];

  switch (tool) {
    case "arrow":
    case "line": {
      const a = { x: x1, y: y1 };
      const b = { x: x2, y: y2 };
      const c = { x, y };

      const offset = distance(a, b) - (distance(a, c) + distance(b, c));
      return Math.abs(offset) < (0.05 * strokeWidth || 1);
    }
    case "circle": {
      const width = x2 - x1 + strokeWidth;
      const height = y2 - y1 + strokeWidth;
      x1 -= strokeWidth / 2;
      y1 -= strokeWidth / 2;

      const centreX = x1 + width / 2;
      const centreY = y1 + height / 2;

      const mouseToCentreX = centreX - x;
      const mouseToCentreY = centreY - y;

      const radiusX = Math.abs(width) / 2;
      const radiusY = Math.abs(height) / 2;

      return (
        (mouseToCentreX * mouseToCentreX) / (radiusX * radiusX) +
          (mouseToCentreY * mouseToCentreY) / (radiusY * radiusY) <=
        1
      );
    }
    case "image":
    case "diamond":
    case "rectangle":
    case "text": {
      const minX = Math.min(x1, x2) - strokeWidth / 2;
      const maxX = Math.max(x1, x2) + strokeWidth / 2;
      const minY = Math.min(y1, y2) - strokeWidth / 2;
      const maxY = Math.max(y1, y2) + strokeWidth / 2;

      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    }
    case "pencil": {
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        const dist = pointToSegmentDistance(x, y, p1.x, p1.y, p2.x, p2.y);
        if (dist <= strokeWidth / 2 + 2) {
          return true;
        }
      }
      return false;
    }
    default:
      return false;
  }
}

export function getElementPosition(
  x: number,
  y: number,
  elements: DrawElement[]
): DrawElement | undefined {
  return elements.filter((element) => isWithinElement(x, y, element)).at(-1);
}

export function createElement(params: CreateElementParams): DrawElement {
  const { id = uuid(), x1, y1, x2, y2, style, tool, image, text } = params;

  switch (tool) {
    case "pencil":
      return { id, points: [{ x: x1, y: y1 }], x1, y1, x2, y2, ...style, tool };
    case "text":
      return { id, x1, y1, x2, y2, ...style, tool, text: text || "" };
    case "image":
      return { id, x1, y1, x2, y2, ...style, tool, image: image || "" };
    default:
      return { id, x1, y1, x2, y2, ...style, tool };
  }
}

export function updateElement(
  id: string,
  stateOption: Partial<DrawElement>,
  setState: (
    action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
    overwrite?: boolean
  ) => void,
  state: DrawElement[],
  overwrite = false
): void {
  const stateCopy = state.map((ele) => {
    if (ele.id === id) {
      return {
        ...ele,
        ...stateOption,
      } as DrawElement;
    }
    return ele;
  });

  console.log(stateCopy);

  setState(stateCopy, overwrite);
}

export function deleteElement(
  s_element: SelectedElement | null,
  setState: (action: (prev: DrawElement[]) => DrawElement[]) => void,
  setSelectedElement: React.Dispatch<React.SetStateAction<SelectedElement | null>>
): void {
  if (!s_element) return;

  const { id } = s_element;
  setState((prevState) => prevState.filter((element) => element.id !== id));
  setSelectedElement(null);
}

export function duplicateElement(
  s_element: SelectedElement | null,
  setState: (action: (prev: DrawElement[]) => DrawElement[]) => void,
  setSelected: React.Dispatch<React.SetStateAction<SelectedElement | null>>,
  factor: number,
  offsets: { offsetX?: number; offsetY?: number } = {}
): void {
  if (!s_element) return;

  const { id } = s_element;
  setState((prevState) =>
    prevState
      .map((element) => {
        if (element.id === id) {
          const duplicated = { ...moveElement(element, factor), id: uuid() };
          setSelected({ ...duplicated, ...offsets });
          return [element, duplicated];
        }
        return element;
      })
      .flat() as DrawElement[]
  );
}

export function moveElement(
  element: DrawElement,
  factorX: number,
  factorY: number | null = null
): DrawElement {
  return {
    ...element,
    x1: element.x1 + factorX,
    y1: element.y1 + (factorY ?? factorX),
    x2: element.x2 + factorX,
    y2: element.y2 + (factorY ?? factorX),
  };
}

export function moveElementLayer(
  id: string,
  to: number,
  setState: (action: DrawElement[]) => void,
  state: DrawElement[]
): void {
  const index = state.findIndex((ele) => ele.id === id);
  const stateCopy = [...state];
  const replace = stateCopy[index];
  stateCopy.splice(index, 1);

  let toReplaceIndex = index;
  if (to === 1 && index < state.length - 1) {
    toReplaceIndex = index + 1;
  } else if (to === -1 && index > 0) {
    toReplaceIndex = index - 1;
  } else if (to === 0) {
    toReplaceIndex = 0;
  } else if (to === 2) {
    toReplaceIndex = state.length - 1;
  }

  const firstPart = stateCopy.slice(0, toReplaceIndex);
  const lastPart = stateCopy.slice(toReplaceIndex);

  setState([...firstPart, replace, ...lastPart]);
}

export function arrowMove(
  s_element: SelectedElement | null,
  x: number,
  y: number,
  setState: (action: (prev: DrawElement[]) => DrawElement[]) => void
): void {
  if (!s_element) return;

  const { id } = s_element;
  setState((prevState) =>
    prevState.map((element) => {
      if (element.id === id) {
        return moveElement(element, x, y);
      }
      return element;
    })
  );
}

export function minmax(value: number, interval: [number, number]): number {
  return Math.max(interval[0], Math.min(value, interval[1]));
}

export function getElementById(
  id: string | undefined,
  elements: DrawElement[]
): DrawElement | undefined {
  return elements.find((element) => element.id === id);
}

export function adjustCoordinates(element: DrawElement): {
  id: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
} {
  const { id, x1, x2, y1, y2, tool } = element;
  if (tool === "line" || tool === "arrow") return { id, x1, x2, y1, y2 };

  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  return { id, x1: minX, y1: minY, x2: maxX, y2: maxY };
}

function resizeFreehand(
  element: DrawElement,
  newBox: BoundingBox
): BoundingBox & { points?: Point[] } {
  if (element.tool !== "pencil" || !('points' in element)) return newBox;

  const { x1, y1, x2, y2, points } = element;
  const oldW = x2 - x1;
  const oldH = y2 - y1;
  const newW = newBox.x2 - newBox.x1;
  const newH = newBox.y2 - newBox.y1;

  const scaleX = oldW !== 0 ? newW / oldW : 1;
  const scaleY = oldH !== 0 ? newH / oldH : 1;

  const newPoints = points.map((p) => ({
    x: newBox.x1 + (p.x - x1) * scaleX,
    y: newBox.y1 + (p.y - y1) * scaleY,
  }));

  return {
    points: newPoints,
    x1: newBox.x1,
    y1: newBox.y1,
    x2: newBox.x2,
    y2: newBox.y2,
  };
}

export function resizeValue(
  corner: string,
  _type: string,
  x: number,
  y: number,
  padding: number,
  { x1, x2, y1, y2 }: BoundingBox,
  _offset: { x: number; y: number },
  elementOffset: DrawElement
): Partial<DrawElement> {
  const getPadding = (condition: boolean): number => {
    return condition ? padding : padding * -1;
  };

  switch (corner) {
    case "tt":
      return resizeFreehand(elementOffset, {
        y1: y + getPadding(y < y2),
        x1,
        x2,
        y2,
      });
    case "bb":
      return resizeFreehand(elementOffset, {
        y2: y + getPadding(y < y1),
        x1,
        x2,
        y1,
      });
    case "rr":
      return resizeFreehand(elementOffset, {
        x2: x + getPadding(x < x1),
        x1,
        y1,
        y2,
      });
    case "ll":
      return resizeFreehand(elementOffset, {
        x1: x + getPadding(x < x2),
        x2,
        y1,
        y2,
      });
    case "tl":
      return resizeFreehand(elementOffset, {
        x1: x + getPadding(x < x2),
        y1: y + getPadding(y < y2),
        x2,
        y2,
      });
    case "tr":
      return resizeFreehand(elementOffset, {
        x2: x + getPadding(x < x1),
        y1: y + getPadding(y < y2),
        x1,
        y2,
      });
    case "bl":
      return resizeFreehand(elementOffset, {
        x1: x + getPadding(x < x2),
        y2: y + getPadding(y < y1),
        x2,
        y1,
      });
    case "br":
      return resizeFreehand(elementOffset, {
        x2: x + getPadding(x < x1),
        y2: y + getPadding(y < y1),
        x1,
        y1,
      });
    case "l1":
      return { x1: x, y1: y };
    case "l2":
      return { x2: x, y2: y };
    default:
      return {};
  }
}

export function saveElements(elements: DrawElement[]): void {
  const jsonString = JSON.stringify(elements);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.download = "canvas" + fileNameExtention;
  link.href = url;
  link.click();
}

export function uploadElements(
  setElements: (action: DrawElement[]) => void
): void {
  function uploadJSON(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as DrawElement[];
        setElements(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    reader.readAsText(file);
  }

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = fileNameExtention;
  fileInput.onchange = uploadJSON;
  fileInput.click();
}
