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
  curvePoint?: Point;
  roughness?: number;
}

type ShapeFunction = (params: ShapeParams, ctx: CanvasRenderingContext2D) => void;

export const shapes: Record<string, ShapeFunction> = {
  arrow: ({ x1, y1, x2, y2, curvePoint, strokeWidth = 3, roughness = 1 }, ctx) => {
    // Scale arrow head based on stroke width
    const headlen = Math.max(10, strokeWidth * 3);
    
    // Seed based on coordinates for consistent wobble
    const seed = (x1 * 1000 + y1 * 100 + x2 * 10 + y2) % 1000;
    const random = (i: number) => {
      const x = Math.sin(seed + i * 9999) * 10000;
      return x - Math.floor(x);
    };
    
    // Roughness factor - 0 means straight lines
    const roughFactor = roughness * Math.min(strokeWidth * 0.4, 3);
    
    // Calculate perpendicular direction for wobble
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const perpX = -dy / len;
    const perpY = dx / len;
    
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(x1, y1);
    
    let angle: number;
    
    if (curvePoint) {
      // Curved arrow with optional wobble on control point
      const wobbledCurve = {
        x: curvePoint.x + (random(0) - 0.5) * roughFactor * 2,
        y: curvePoint.y + (random(1) - 0.5) * roughFactor * 2
      };
      ctx.quadraticCurveTo(wobbledCurve.x, wobbledCurve.y, x2, y2);
      
      // Calculate angle at the end point (tangent of curve at end)
      angle = Math.atan2(y2 - curvePoint.y, x2 - curvePoint.x);
    } else if (roughness > 0) {
      // Hand-drawn straight arrow with natural wobble
      const distance = Math.hypot(x2 - x1, y2 - y1);
      const segments = Math.max(Math.floor(distance / 15), 3);
      
      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const baseX = x1 + (x2 - x1) * t;
        const baseY = y1 + (y2 - y1) * t;
        
        // Add wobble perpendicular to line direction (less at endpoints)
        const wobbleAmount = roughFactor * Math.sin(t * Math.PI) * (random(i) - 0.5) * 2;
        const px = baseX + perpX * wobbleAmount;
        const py = baseY + perpY * wobbleAmount;
        
        if (i === segments) {
          ctx.lineTo(x2, y2);
        } else {
          ctx.lineTo(px, py);
        }
      }
      
      angle = Math.atan2(y2 - y1, x2 - x1);
    } else {
      // Straight clean arrow
      ctx.lineTo(x2, y2);
      angle = Math.atan2(y2 - y1, x2 - x1);
    }
    
    // Draw arrow head with optional variation
    const headWobble1 = (random(10) - 0.5) * roughFactor * 0.5;
    const headWobble2 = (random(11) - 0.5) * roughFactor * 0.5;
    
    const arrowX1 = x2 - headlen * Math.cos(angle - Math.PI / 7);
    const arrowY1 = y2 - headlen * Math.sin(angle - Math.PI / 7);
    const arrowX2 = x2 - headlen * Math.cos(angle + Math.PI / 7);
    const arrowY2 = y2 - headlen * Math.sin(angle + Math.PI / 7);
    
    ctx.moveTo(x2, y2);
    ctx.lineTo(arrowX1 + headWobble1, arrowY1 + headWobble1);
    ctx.moveTo(x2, y2);
    ctx.lineTo(arrowX2 + headWobble2, arrowY2 + headWobble2);
  },

  line: ({ x1, y1, x2, y2, curvePoint, strokeWidth = 3, roughness = 1 }, ctx) => {
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    // Roughness factor - 0 means straight lines
    const roughFactor = roughness * Math.min(strokeWidth * 0.4, 3);
    
    // Seed based on coordinates for consistent wobble
    const seed = (x1 * 1000 + y1 * 100 + x2 * 10 + y2) % 1000;
    const random = (i: number) => {
      const x = Math.sin(seed + i * 9999) * 10000;
      return x - Math.floor(x);
    };
    
    // Calculate perpendicular direction for wobble
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const perpX = -dy / len;
    const perpY = dx / len;
    
    ctx.moveTo(x1, y1);
    
    if (curvePoint) {
      // Curved line with optional wobble
      const wobbledCurve = {
        x: curvePoint.x + (random(0) - 0.5) * roughFactor * 2,
        y: curvePoint.y + (random(1) - 0.5) * roughFactor * 2
      };
      ctx.quadraticCurveTo(wobbledCurve.x, wobbledCurve.y, x2, y2);
    } else if (roughness > 0) {
      // Hand-drawn straight line with natural wobble
      const distance = Math.hypot(x2 - x1, y2 - y1);
      const segments = Math.max(Math.floor(distance / 15), 3);
      
      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const baseX = x1 + (x2 - x1) * t;
        const baseY = y1 + (y2 - y1) * t;
        
        // Add wobble perpendicular to line direction (less at endpoints)
        const wobbleAmount = roughFactor * Math.sin(t * Math.PI) * (random(i) - 0.5) * 2;
        const px = baseX + perpX * wobbleAmount;
        const py = baseY + perpY * wobbleAmount;
        
        if (i === segments) {
          ctx.lineTo(x2, y2); // End exactly at endpoint
        } else {
          ctx.lineTo(px, py);
        }
      }
    } else {
      // Straight clean line
      ctx.lineTo(x2, y2);
    }
  },

  rectangle: ({ x1, y1, x2, y2, borderRadius = 0, strokeWidth = 3, roughness = 1 }, ctx) => {
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const top = Math.min(y1, y2);
    const bottom = Math.max(y1, y2);

    const width = right - left;
    const height = bottom - top;

    const r = Math.min(borderRadius, width / 2, height / 2);
    
    // Roughness factor - 0 means straight lines
    const roughFactor = roughness * Math.min(strokeWidth * 0.3, 2);
    
    // Seed for consistent wobble
    const seed = (x1 * 1000 + y1 * 100 + x2 * 10 + y2) % 1000;
    const random = (i: number) => {
      const x = Math.sin(seed + i * 9999) * 10000;
      return x - Math.floor(x);
    };
    
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    if (roughness > 0 && r === 0) {
      // Hand-drawn rectangle without border radius
      const drawWobblyLine = (sx: number, sy: number, ex: number, ey: number, seedOffset: number) => {
        const dist = Math.hypot(ex - sx, ey - sy);
        const segments = Math.max(Math.floor(dist / 20), 2);
        const dx = ex - sx;
        const dy = ey - sy;
        const len = Math.hypot(dx, dy) || 1;
        const perpX = -dy / len;
        const perpY = dx / len;
        
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const baseX = sx + (ex - sx) * t;
          const baseY = sy + (ey - sy) * t;
          const wobble = roughFactor * Math.sin(t * Math.PI) * (random(seedOffset + i) - 0.5) * 2;
          
          if (i === 0) {
            ctx.moveTo(baseX + perpX * wobble, baseY + perpY * wobble);
          } else {
            ctx.lineTo(baseX + perpX * wobble, baseY + perpY * wobble);
          }
        }
      };
      
      // Draw 4 sides with wobble
      drawWobblyLine(left, top, right, top, 0);      // top
      drawWobblyLine(right, top, right, bottom, 10); // right
      drawWobblyLine(right, bottom, left, bottom, 20); // bottom
      drawWobblyLine(left, bottom, left, top, 30);   // left
      ctx.closePath();
    } else {
      // Clean rectangle or with border radius
      ctx.moveTo(left + r, top);
      ctx.lineTo(right - r, top);
      ctx.quadraticCurveTo(right, top, right, top + r);
      ctx.lineTo(right, bottom - r);
      ctx.quadraticCurveTo(right, bottom, right - r, bottom);
      ctx.lineTo(left + r, bottom);
      ctx.quadraticCurveTo(left, bottom, left, bottom - r);
      ctx.lineTo(left, top + r);
      ctx.quadraticCurveTo(left, top, left + r, top);
      ctx.closePath();
    }
  },

  diamond: ({ x1, y1, x2, y2, strokeWidth = 3, roughness = 1 }, ctx) => {
    const width = x2 - x1;
    const height = y2 - y1;
    
    const midX = x1 + width / 2;
    const midY = y1 + height / 2;
    const topPoint = { x: midX, y: y1 };
    const rightPoint = { x: x2, y: midY };
    const bottomPoint = { x: midX, y: y2 };
    const leftPoint = { x: x1, y: midY };
    
    // Roughness factor
    const roughFactor = roughness * Math.min(strokeWidth * 0.3, 2);
    
    // Seed for consistent wobble
    const seed = (x1 * 1000 + y1 * 100 + x2 * 10 + y2) % 1000;
    const random = (i: number) => {
      const x = Math.sin(seed + i * 9999) * 10000;
      return x - Math.floor(x);
    };
    
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    if (roughness > 0) {
      // Hand-drawn diamond
      const drawWobblyLine = (sx: number, sy: number, ex: number, ey: number, seedOffset: number, isFirst: boolean) => {
        const dist = Math.hypot(ex - sx, ey - sy);
        const segments = Math.max(Math.floor(dist / 20), 2);
        const dx = ex - sx;
        const dy = ey - sy;
        const len = Math.hypot(dx, dy) || 1;
        const perpX = -dy / len;
        const perpY = dx / len;
        
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const baseX = sx + (ex - sx) * t;
          const baseY = sy + (ey - sy) * t;
          const wobble = roughFactor * Math.sin(t * Math.PI) * (random(seedOffset + i) - 0.5) * 2;
          
          if (i === 0 && isFirst) {
            ctx.moveTo(baseX + perpX * wobble, baseY + perpY * wobble);
          } else {
            ctx.lineTo(baseX + perpX * wobble, baseY + perpY * wobble);
          }
        }
      };
      
      drawWobblyLine(topPoint.x, topPoint.y, rightPoint.x, rightPoint.y, 0, true);
      drawWobblyLine(rightPoint.x, rightPoint.y, bottomPoint.x, bottomPoint.y, 10, false);
      drawWobblyLine(bottomPoint.x, bottomPoint.y, leftPoint.x, leftPoint.y, 20, false);
      drawWobblyLine(leftPoint.x, leftPoint.y, topPoint.x, topPoint.y, 30, false);
    } else {
      // Clean diamond
      ctx.moveTo(topPoint.x, topPoint.y);
      ctx.lineTo(rightPoint.x, rightPoint.y);
      ctx.lineTo(bottomPoint.x, bottomPoint.y);
      ctx.lineTo(leftPoint.x, leftPoint.y);
    }
    ctx.closePath();
  },

  circle: ({ x1, y1, x2, y2, strokeWidth = 3, roughness = 1 }, ctx) => {
    const width = x2 - x1;
    const height = y2 - y1;
    const centerX = x1 + width / 2;
    const centerY = y1 + height / 2;
    const radiusX = Math.abs(width) / 2;
    const radiusY = Math.abs(height) / 2;
    
    // Roughness factor
    const roughFactor = roughness * Math.min(strokeWidth * 0.25, 2);
    
    // Seed for consistent wobble
    const seed = (x1 * 1000 + y1 * 100 + x2 * 10 + y2) % 1000;
    const random = (i: number) => {
      const x = Math.sin(seed + i * 9999) * 10000;
      return x - Math.floor(x);
    };
    
    ctx.beginPath();
    
    if (roughness > 0) {
      // Hand-drawn ellipse/circle
      const segments = 36; // More segments for smoother circle
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const wobble = roughFactor * (random(i) - 0.5) * 2;
        const px = centerX + (radiusX + wobble) * Math.cos(angle);
        const py = centerY + (radiusY + wobble) * Math.sin(angle);
        
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
    } else {
      // Clean ellipse
      ctx.ellipse(
        centerX,
        centerY,
        radiusX,
        radiusY,
        0,
        0,
        2 * Math.PI
      );
    }
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
    // Get curve point or calculate default midpoint
    const curvePoint = 'curvePoint' in element && element.curvePoint 
      ? element.curvePoint 
      : { x: (fx + fw) / 2, y: (fy + fh) / 2 };
    
    return {
      line: { fx, fy, fw, fh },
      corners: [
        {
          slug: "l1",
          x: fx - position,
          y: fy - position,
        },
        {
          slug: "l3",
          x: curvePoint.x - position,
          y: curvePoint.y - position,
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
  if ('curvePoint' in element) {
    shapeParams.curvePoint = element.curvePoint;
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
    case "l3":
      return "move";
    default:
      return "default";
  }
}
