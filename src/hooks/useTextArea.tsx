import { writing } from "../helper/canvas";
import { updateElement } from "../helper/element";
import { useAppContext } from "../provider/AppStates";
import { DrawElement } from "../types";

interface TextAreaElement {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  text: string;
  strokeColor: string;
}

export default function useTextArea(): (
  element: TextAreaElement,
  update?: boolean
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

  function createTextArea(element: TextAreaElement, update = false): void {
    const { id, x1, y1, text, strokeColor } = element;
    writing(id);

    const xy = { x2: element.x2, y2: element.y2 };
    const textarea = document.createElement("textarea");
    textarea.id = id;
    textarea.className = "textBox";
    textarea.style.top = canvasToWindow(x1, y1).y + "px";
    textarea.style.left = canvasToWindow(x1, y1).x + "px";
    textarea.style.fontSize = 30 * scale + "px";
    textarea.style.color = strokeColor;
    textarea.textContent = text;
    document.body.appendChild(textarea);
    textarea.focus();

    if (update) textarea.setSelectionRange(0, text.length);

    textarea.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    function getTextWidth(text: string): number {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return 0;
      ctx.font = "30px Arial";
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
        setElements as (
          action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]),
          overwrite?: boolean
        ) => void,
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
