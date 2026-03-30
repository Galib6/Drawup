import { writing } from "../helper/canvas";
import { updateElement } from "../helper/element";
import { useAppContext } from "../provider/AppStates";
import { DrawElement, FontSize, FONT_SIZE_MAP, TextAlign } from "../types";

interface TextAreaElement {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  text: string;
  strokeColor: string;
  fontSize?: FontSize;
  textAlign?: TextAlign;
}

export default function useTextArea(): (
  element: TextAreaElement,
  update?: boolean,
  embedded?: boolean
) => void {
  const { elements, setElements, scale, translate, scaleOffset, setRerender } =
    useAppContext();

  const canvasToWindow = (
    clientX: number,
    clientY: number
  ): { x: number; y: number } => {
    const x = clientX * scale + translate.x * scale - scaleOffset.x;
    const y = clientY * scale + translate.y * scale - scaleOffset.y;
    return { x, y };
  };

  function createTextArea(
    element: TextAreaElement,
    update = false,
    embedded = false
  ): void {
    const { id, x1, y1, text, strokeColor } = element;
    const fontSizeKey = element.fontSize || "M";
    const align = element.textAlign || "left";
    const fontPx = FONT_SIZE_MAP[fontSizeKey] || 30;
    writing(id);

    const xy = { x2: element.x2, y2: element.y2 };
    const textarea = document.createElement("textarea");
    textarea.id = id;
    textarea.className = "textBox";
    textarea.style.fontSize = fontPx * scale + "px";
    textarea.style.textAlign = align;
    textarea.style.color = strokeColor;
    textarea.value = text;

    textarea.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    const setElementsTyped = setElements as (
      action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
      overwrite?: boolean
    ) => void;

    if (embedded) {
      const left = Math.min(x1, element.x2);
      const top = Math.min(y1, element.y2);
      const w = Math.abs(element.x2 - x1);
      const h = Math.abs(element.y2 - y1);
      const pos = canvasToWindow(left, top);
      const hostW = Math.max(w, 4) * scale;
      const hostH = Math.max(h, fontPx * 0.5) * scale;

      const host = document.createElement("div");
      host.style.position = "absolute";
      host.style.left = pos.x + "px";
      host.style.top = pos.y + "px";
      host.style.width = hostW + "px";
      host.style.height = hostH + "px";
      host.style.pointerEvents = "auto";
      host.style.zIndex = "30";
      host.style.boxSizing = "border-box";
      host.style.overflow = "hidden";

      textarea.style.position = "absolute";
      textarea.style.left = "0";
      textarea.style.width = "100%";
      textarea.style.margin = "0";
      textarea.style.padding = "0";
      textarea.style.border = "none";
      textarea.style.background = "transparent";
      textarea.style.outline = "none";
      textarea.style.overflow = "auto";
      textarea.style.overflowWrap = "break-word";
      textarea.style.whiteSpace = "pre-wrap";
      textarea.style.resize = "none";
      textarea.style.boxSizing = "border-box";
      textarea.style.textAlign = "center";
      textarea.style.fontFamily = "Excalifont, cursive";
      textarea.style.lineHeight = "1.15";

      // Match `drawShapeEmbeddedLabel` in helper/canvas.ts: vertical block is
      // centered using lineHeight = px * 1.15, not by centering scrollHeight
      // (which can sit a few pixels off and look higher than the canvas text).
      const syncEmbeddedLayout = (): void => {
        textarea.style.height = "auto";
        const maxH = host.clientHeight;
        const lineHeightCanvas = fontPx * 1.15;
        const logicalLines = textarea.value.split("\n");
        const totalHCanvas = logicalLines.length * lineHeightCanvas;
        const startY = Math.max(top, top + (h - totalHCanvas) / 2);
        const topPx = Math.max(0, (startY - top) * scale);

        const minLine = fontPx * scale * 1.15;
        const sh = Math.max(textarea.scrollHeight, minLine);
        const avail = Math.max(0, maxH - topPx);
        const boxH = avail > 0 ? Math.min(sh, avail) : Math.min(sh, maxH);
        textarea.style.height = boxH + "px";
        textarea.style.top = topPx + "px";
      };

      host.appendChild(textarea);
      document.body.appendChild(host);
      textarea.focus();

      requestAnimationFrame(() => {
        syncEmbeddedLayout();
        if (update) {
          // Place caret in the middle for a more predictable edit experience.
          const mid = Math.floor(textarea.value.length / 2);
          textarea.setSelectionRange(mid, mid);
        }
      });

      textarea.addEventListener("input", () => {
        updateElement(
          id,
          { text: textarea.value },
          setElementsTyped,
          elements,
          true
        );
        syncEmbeddedLayout();
      });

      textarea.addEventListener("focusout", () => {
        writing(null);
        setRerender((state) => !state);
        document.body.removeChild(host);
      });
      return;
    }

    document.body.appendChild(textarea);
    textarea.focus();

    if (update) {
      // Place caret in the middle for a more predictable edit experience.
      const mid = Math.floor(text.length / 2);
      textarea.setSelectionRange(mid, mid);
    }

    textarea.style.top = canvasToWindow(x1, y1).y + "px";
    textarea.style.left = canvasToWindow(x1, y1).x + "px";

    function getTextWidth(text: string): number {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return 0;
      ctx.font = `${fontPx}px Excalifont, cursive`;
      return ctx.measureText(text).width;
    }

    const { right, bottom } = textarea.getBoundingClientRect();

    const lines = textarea.value.split("\n");

    const longest = Math.max(...lines.map((line) => getTextWidth(line)));

    const width = longest;
    const height = textarea.scrollHeight;

    if (bottom >= window.innerHeight) {
      textarea.style.top = "auto";
      textarea.style.bottom = "0";
    } else {
      textarea.style.height = height * scale + "px";
    }
    if (right >= window.innerWidth) {
      textarea.style.left = "auto";
      textarea.style.right = "0";
    } else {
      textarea.style.width = (width || 1) * scale + "px";
    }

    xy.x2 = x1 + width;
    xy.y2 = y1 + height;

    textarea.addEventListener("input", (e) => {
      const target = e.target as HTMLTextAreaElement;
      const { right, bottom } = textarea.getBoundingClientRect();

      const lines = target.value.split("\n");

      const longest = Math.max(...lines.map((line) => getTextWidth(line)));

      const width = longest;
      const height = textarea.scrollHeight;

      if (bottom >= window.innerHeight) {
        textarea.style.top = "auto";
        textarea.style.bottom = "0";
      } else {
        textarea.style.height = height * scale + "px";
      }
      if (right >= window.innerWidth) {
        textarea.style.left = "auto";
        textarea.style.right = "0";
      } else {
        textarea.style.width = (width || 1) * scale + "px";
      }

      xy.x2 = x1 + width;
      xy.y2 = y1 + height;
      updateElement(
        id,
        { text: target.value, ...xy },
        setElementsTyped,
        elements,
        true
      );
    });

    textarea.addEventListener("focusout", () => {
      writing(null);
      setRerender((state) => !state);
      document.body.removeChild(textarea);
    });
  }

  return createTextArea;
}
