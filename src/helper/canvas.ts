import { Corner, DrawElement, FocusDemention, FocuseCorners, Point } from "../types";

export const imageCache = new Map<string, HTMLImageElement>();
let textWriting: string | null = null;

export const writing = (id: string | null): void => {
  textWriting = id;
};

interface ShapeParams {
  id?: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  borderRadius?: number;
  points?: Point[];
  strokeWidth?: number;
  image?: string;
  text?: string;
}

type ShapeFunction = (params: ShapeParams, ctx: CanvasRenderingContext2D) => void;

export const shapes: Record<string, ShapeFunction> = {
  arrow: ({ x1, y1, x2, y2 }, ctx) => {
    const headlen = 5;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headlen * Math.cos(angle - Math.PI / 7),
      y2 - headlen * Math.sin(angle - Math.PI / 7)
    );

    ctx.lineTo(
      x2 - headlen * Math.cos(angle + Math.PI / 7),
      y2 - headlen * Math.sin(angle + Math.PI / 7)
    );

    ctx.lineTo(x2, y2);
    ctx.lineTo(
      x2 - headlen * Math.cos(angle - Math.PI / 7),
      y2 - headlen * Math.sin(angle - Math.PI / 7)
    );
  },

  line: ({ x1, y1, x2, y2 }, ctx) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  },

  rectangle: ({ x1, y1, x2, y2, borderRadius = 0 }, ctx) => {
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const top = Math.min(y1, y2);
    const bottom = Math.max(y1, y2);

    const width = right - left;
    const height = bottom - top;

    const r = Math.min(borderRadius, width / 2, height / 2);

    ctx.beginPath();
    ctx.moveTo(left + r, top); // top-left
    ctx.lineTo(right - r, top);
    ctx.quadraticCurveTo(right, top, right, top + r);
    ctx.lineTo(right, bottom - r);
    ctx.quadraticCurveTo(right, bottom, right - r, bottom); // bottom-right
    ctx.lineTo(left + r, bottom);
    ctx.quadraticCurveTo(left, bottom, left, bottom - r); // bottom-left
    ctx.lineTo(left, top + r);
    ctx.quadraticCurveTo(left, top, left + r, top); // back to top-left
    ctx.closePath();
  },

  diamond: ({ x1, y1, x2, y2 }, ctx) => {
    ctx.beginPath();
    const width = x2 - x1;
    const height = y2 - y1;
    ctx.moveTo(x1 + width / 2, y1);
    ctx.lineTo(x2, y1 + height / 2);
    ctx.lineTo(x1 + width / 2, y2);
    ctx.lineTo(x1, y1 + height / 2);
    ctx.closePath();
  },

  circle: ({ x1, y1, x2, y2 }, ctx) => {
    ctx.beginPath();
    const width = x2 - x1;
    const height = y2 - y1;
    ctx.ellipse(
      x1 + width / 2,
      y1 + height / 2,
      Math.abs(width) / 2,
      Math.abs(height) / 2,
      0,
      0,
      2 * Math.PI
    );
    ctx.closePath();
  },

  image: ({ id, x1, y1, x2, y2, image }, ctx) => {
    if (!id || !image) return;
    
    let cached = imageCache.get(id);

    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    if (cached) {
      ctx.drawImage(cached, left, top, width, height);
      return;
    }

    cached = new Image();
    cached.src = image;
    cached.onload = () => {
      ctx.drawImage(cached!, left, top, width, height);
      imageCache.set(id, cached!);
    };
  },

  pencil: ({ points = [], strokeWidth = 1 }, ctx) => {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }

    const lastpoint = points[points.length - 1];

    if (
      !(
        Math.abs(lastpoint.x - points[0].x) < strokeWidth &&
        Math.abs(lastpoint.y - points[0].y) < strokeWidth
      )
    ) {
      ctx.fillStyle = "transparent";
    }
    ctx.lineTo(lastpoint.x, lastpoint.y);
  },

  text: ({ id, x1, y1, text = "" }, ctx) => {
    if (id === textWriting) return;
    ctx.font = "30px Arial";
    ctx.textBaseline = "top";

    const textLines = text.split("\n");

    textLines.forEach((line, index) => {
      ctx.fillText(line, x1, y1 + 30 * index);
    });
  },
};

export function distance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function getFocuseDemention(
  element: DrawElement,
  padding: number
): FocusDemention {
  const { x1, y1, x2, y2 } = element;

  if (element.tool === "line" || element.tool === "arrow")
    return { fx: x1, fy: y1, fw: x2, fh: y2 };

  const p = { min: padding, max: padding * 2 };
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  return {
    fx: minX - p.min,
    fy: minY - p.min,
    fw: maxX - minX + p.max,
    fh: maxY - minY + p.max,
  };
}

export function getFocuseCorners(
  element: DrawElement,
  padding: number,
  position: number
): FocuseCorners {
  const { fx, fy, fw, fh } = getFocuseDemention(element, padding);

  if (element.tool === "line" || element.tool === "arrow") {
    return {
      line: { fx, fy, fw, fh },
      corners: [
        {
          slug: "l1",
          x: fx - position,
          y: fy - position,
        },
        {
          slug: "l2",
          x: fw - position,
          y: fh - position,
        },
      ],
    };
  }
  return {
    line: { fx, fy, fw, fh },
    corners: [
      {
        slug: "tl",
        x: fx - position,
        y: fy - position,
      },
      {
        slug: "tr",
        x: fx + fw - position,
        y: fy - position,
      },
      {
        slug: "bl",
        x: fx - position,
        y: fy + fh - position,
      },
      {
        slug: "br",
        x: fx + fw - position,
        y: fy + fh - position,
      },
      {
        slug: "tt",
        x: fx + fw / 2 - position,
        y: fy - position,
      },
      {
        slug: "rr",
        x: fx + fw - position,
        y: fy + fh / 2 - position,
      },
      {
        slug: "ll",
        x: fx - position,
        y: fy + fh / 2 - position,
      },
      {
        slug: "bb",
        x: fx + fw / 2 - position,
        y: fy + fh - position,
      },
    ],
  };
}

export function drawFocuse(
  element: DrawElement | null,
  context: CanvasRenderingContext2D,
  padding: number,
  scale: number
): void {
  if (!element) return;
  context.beginPath();
  const lineWidth = 1 / scale;
  const square = 10 / scale;
  let round = square;
  const position = square / 2;

  const demention = getFocuseCorners(element, padding, position);
  const { fx, fy, fw, fh } = demention.line;
  const corners = demention.corners;

  context.lineWidth = lineWidth;
  context.strokeStyle = "#211C6A";
  context.fillStyle = "#EEF5FF";

  if (element.tool !== "line" && element.tool !== "arrow") {
    context.beginPath();
    context.rect(fx, fy, fw, fh);
    context.setLineDash([0, 0]);
    context.stroke();
    context.closePath();
    round = 3 / scale;
  }

  context.beginPath();
  corners.forEach((corner) => {
    context.roundRect(corner.x, corner.y, square, square, round);
  });
  context.fill();
  context.stroke();
  context.closePath();
}

export function draw(
  element: DrawElement,
  context: CanvasRenderingContext2D
): void {
  const { tool, strokeWidth, strokeColor, strokeStyle, fill, opacity } = element;

  context.beginPath();
  context.lineWidth = strokeWidth;
  context.strokeStyle = strokeColor;
  context.fillStyle = tool === "text" ? strokeColor : fill;

  context.globalAlpha = opacity * 0.01;

  if (strokeStyle === "dashed")
    context.setLineDash([strokeWidth * 2, strokeWidth * 2]);
  else if (strokeStyle === "dotted")
    context.setLineDash([strokeWidth, strokeWidth]);
  else context.setLineDash([0, 0]);

  const shapeParams: ShapeParams = {
    id: element.id,
    x1: element.x1,
    y1: element.y1,
    x2: element.x2,
    y2: element.y2,
    borderRadius: element.borderRadius,
    strokeWidth: element.strokeWidth,
  };

  if ('points' in element) {
    shapeParams.points = element.points;
  }
  if ('image' in element) {
    shapeParams.image = element.image;
  }
  if ('text' in element) {
    shapeParams.text = element.text;
  }

  shapes[tool](shapeParams, context);
  context.fill();
  if (strokeWidth > 0) context.stroke();

  context.closePath();
}

export function inSelectedCorner(
  element: DrawElement | null | undefined,
  x: number,
  y: number,
  padding: number,
  scale: number
): Corner | null {
  if (!element) return null;
  const adjustedPadding =
    element.tool === "line" || element.tool === "arrow" ? 0 : padding;

  const square = 10 / scale;
  const position = square / 2;

  const corners = getFocuseCorners(element, adjustedPadding, position).corners;

  const hoveredCorner = corners.find(
    (corner) =>
      x - corner.x <= square &&
      x - corner.x >= 0 &&
      y - corner.y <= square &&
      y - corner.y >= 0
  );

  return hoveredCorner || null;
}

export function cornerCursor(corner: string): string {
  switch (corner) {
    case "tt":
    case "bb":
      return "s-resize";
    case "ll":
    case "rr":
      return "e-resize";
    case "tl":
    case "br":
      return "se-resize";
    case "tr":
    case "bl":
      return "ne-resize";
    case "l1":
    case "l2":
      return "pointer";
    default:
      return "default";
  }
}
