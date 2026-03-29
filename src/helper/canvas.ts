import { ArrowType, Arrowheads, Corner, CornerSlug, DrawElement, FocusDemention, FocuseCorners, FontSize, FONT_SIZE_MAP, Point, TextAlign } from "../types";
import { elbowBendRadius, elbowCornerVertices, elbowPolylinePoints } from "./element";

export const imageCache = new Map<string, HTMLImageElement>();
let textWriting: string | null = null;

export const excalifontReady: Promise<void> =
  typeof document !== 'undefined'
    ? document.fonts.load("30px Excalifont").then(() => {}).catch(() => {})
    : Promise.resolve();

export const writing = (id: string | null): void => {
  textWriting = id;
};

/** Opaque paper + dots on the bitmap (matches prior look; avoids html/canvas grid misalignment seams). */
export function drawWorkspaceBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  const step = 14;
  ctx.fillStyle = "#f0f0f0";
  const dotR = 1.4;
  for (let x = 0; x <= width + step; x += step) {
    for (let y = 0; y <= height + step; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

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
  midpoints?: Point[];
  roughness?: number;
  arrowType?: ArrowType;
  arrowheads?: Arrowheads;
  fontSize?: FontSize;
  textAlign?: TextAlign;
}

type ShapeFunction = (params: ShapeParams, ctx: CanvasRenderingContext2D) => void;

// --- Shared drawing helpers ---

function seededRandom(seed: number) {
  return (i: number) => {
    const x = Math.sin(seed + i * 9999) * 10000;
    return x - Math.floor(x);
  };
}

function coordSeed(x1: number, y1: number, x2: number, y2: number) {
  return (x1 * 1000 + y1 * 100 + x2 * 10 + y2) % 1000;
}

function perp(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  return { px: -dy / len, py: dx / len };
}

function drawWobblySegment(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number, ex: number, ey: number,
  random: (i: number) => number,
  factor: number,
  seedOffset: number,
  move: boolean
) {
  const dist = Math.hypot(ex - sx, ey - sy);
  const segments = Math.max(Math.floor(dist / 20), 2);
  const { px, py } = perp(sx, sy, ex, ey);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const bx = sx + (ex - sx) * t;
    const by = sy + (ey - sy) * t;
    const w = factor * Math.sin(t * Math.PI) * (random(seedOffset + i) - 0.5) * 2;

    if (i === 0 && move) ctx.moveTo(bx + px * w, by + py * w);
    else ctx.lineTo(bx + px * w, by + py * w);
  }
}

function drawCartoonSegment(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number, ex: number, ey: number,
  random: (i: number) => number,
  maxOffset: number,
  seedOffset: number,
  move: boolean
) {
  const dist = Math.hypot(ex - sx, ey - sy);
  const segments = Math.max(Math.floor(dist / 25), 3);
  const { px, py } = perp(sx, sy, ex, ey);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const bx = sx + (ex - sx) * t;
    const by = sy + (ey - sy) * t;
    const w = maxOffset * Math.sin(t * Math.PI) * (random(seedOffset + i) - 0.5) * 1.4;
    const jx = (random(seedOffset + i + 50) - 0.5) * maxOffset * 0.3;
    const jy = (random(seedOffset + i + 60) - 0.5) * maxOffset * 0.3;

    if (i === 0 && move) ctx.moveTo(bx + px * w + jx, by + py * w + jy);
    else ctx.lineTo(bx + px * w + jx, by + py * w + jy);
  }
}

function drawWobblyAlongPolyline(
  ctx: CanvasRenderingContext2D,
  pts: Point[],
  random: (i: number) => number,
  rf: number,
  seedBase: number
) {
  if (pts.length < 2) return;
  drawWobblySegment(ctx, pts[0].x, pts[0].y, pts[1].x, pts[1].y, random, rf, seedBase, true);
  for (let i = 1; i < pts.length - 1; i++) {
    drawWobblySegment(
      ctx,
      pts[i].x,
      pts[i].y,
      pts[i + 1].x,
      pts[i + 1].y,
      random,
      rf,
      seedBase + i * 5,
      false
    );
  }
}

function drawCartoonAlongPolyline(
  ctx: CanvasRenderingContext2D,
  pts: Point[],
  random: (i: number) => number,
  maxOff: number,
  seedBase: number
) {
  if (pts.length < 2) return;
  drawCartoonSegment(ctx, pts[0].x, pts[0].y, pts[1].x, pts[1].y, random, maxOff, seedBase, true);
  for (let i = 1; i < pts.length - 1; i++) {
    drawCartoonSegment(
      ctx,
      pts[i].x,
      pts[i].y,
      pts[i + 1].x,
      pts[i + 1].y,
      random,
      maxOff,
      seedBase + i * 12,
      false
    );
  }
}

const CARTOON_PASSES = 3;

// --- Shape definitions ---

export const shapes: Record<string, ShapeFunction> = {
  arrow: ({ x1, y1, x2, y2, curvePoint, midpoints, strokeWidth = 3, roughness = 1, arrowType = 'sharp', arrowheads = 'end', borderRadius = 0 }, ctx) => {
    const headlen = Math.max(10, strokeWidth * 3);
    const random = seededRandom(coordSeed(x1, y1, x2, y2));
    const { px, py } = perp(x1, y1, x2, y2);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const drawHead = (tipX: number, tipY: number, angle: number, rf: number, seedBase: number) => {
      const h1 = (random(seedBase) - 0.5) * rf * 0.5;
      const h2 = (random(seedBase + 1) - 0.5) * rf * 0.5;
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX - headlen * Math.cos(angle - Math.PI / 7) + h1, tipY - headlen * Math.sin(angle - Math.PI / 7) + h1);
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX - headlen * Math.cos(angle + Math.PI / 7) + h2, tipY - headlen * Math.sin(angle + Math.PI / 7) + h2);
    };

    let endAngle: number;
    let startAngle: number;

    if (arrowType === 'elbowed') {
      const mids = midpoints && midpoints.length > 0 ? midpoints : [];
      const rf = roughness * Math.min(strokeWidth * 0.4, 3);
      let elbowPts = elbowPolylinePoints(x1, y1, x2, y2, borderRadius, 18, 4, mids);
      // Degenerate elbow (e.g. identical endpoints) can yield <2 polyline points; cartoon path then reads elbowPts[n-2].
      if (elbowPts.length < 2) {
        elbowPts = [
          { x: x1, y: y1 },
          { x: x2, y: y2 },
        ];
      }
      const verts = elbowCornerVertices(x1, y1, x2, y2, mids);

      if (roughness >= 2) {
        const maxOff = Math.min(strokeWidth * 0.7, 3);
        for (let pass = 0; pass < CARTOON_PASSES; pass++) {
          ctx.beginPath();
          const po = pass * 100;
          drawCartoonAlongPolyline(ctx, elbowPts, (i) => random(po + i), maxOff, 0);

          const n = elbowPts.length;
          const pTip = elbowPts[n - 1];
          const pBefore = elbowPts[n - 2];
          const pStart = elbowPts[0];
          const pAfterStart = elbowPts[1];
          endAngle = Math.atan2(pTip.y - pBefore.y, pTip.x - pBefore.x);
          startAngle = Math.atan2(pStart.y - pAfterStart.y, pStart.x - pAfterStart.x);
          drawHead(x2, y2, endAngle, 0, po + 60);
          if (arrowheads === 'both') {
            drawHead(x1, y1, startAngle, 0, po + 70);
          }
          ctx.stroke();
        }
        return;
      }

      if (roughness > 0) {
        ctx.beginPath();
        drawWobblyAlongPolyline(ctx, elbowPts, random, rf, 0);
      } else {
        ctx.beginPath();
        ctx.moveTo(elbowPts[0].x, elbowPts[0].y);
        for (let i = 1; i < elbowPts.length; i++) {
          ctx.lineTo(elbowPts[i].x, elbowPts[i].y);
        }
      }

      const lastV = verts[verts.length - 1];
      const prevV = verts.length >= 2 ? verts[verts.length - 2] : lastV;
      const firstV = verts[0];
      const secondV = verts.length >= 2 ? verts[1] : firstV;
      endAngle = Math.atan2(lastV.y - prevV.y, lastV.x - prevV.x);
      startAngle = Math.atan2(firstV.y - secondV.y, firstV.x - secondV.x);

      drawHead(x2, y2, endAngle, rf, 10);
      if (arrowheads === 'both') {
        drawHead(x1, y1, startAngle, rf, 20);
      }

    } else if (arrowType === 'curved') {
      const cp = curvePoint || { x: (x1 + x2) / 2, y: Math.min(y1, y2) - Math.abs(x2 - x1) * 0.25 };
      const rf = roughness * Math.min(strokeWidth * 0.4, 3);

      if (roughness >= 2) {
        const maxOff = Math.min(strokeWidth * 0.7, 3);
        for (let pass = 0; pass < CARTOON_PASSES; pass++) {
          ctx.beginPath();
          const po = pass * 100;
          ctx.moveTo(
            x1 + (random(po) - 0.5) * maxOff,
            y1 + (random(po + 1) - 0.5) * maxOff
          );
          ctx.quadraticCurveTo(
            cp.x + (random(po + 2) - 0.5) * maxOff * 1.4,
            cp.y + (random(po + 3) - 0.5) * maxOff * 1.4,
            x2, y2
          );
          endAngle = Math.atan2(y2 - cp.y, x2 - cp.x);
          startAngle = Math.atan2(y1 - cp.y, x1 - cp.x);

          drawHead(x2, y2, endAngle, 0, po + 30);
          if (arrowheads === 'both') {
            drawHead(x1, y1, startAngle, 0, po + 40);
          }
          ctx.stroke();
        }
        return;
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(
        cp.x + (random(0) - 0.5) * rf * 2,
        cp.y + (random(1) - 0.5) * rf * 2,
        x2, y2
      );
      endAngle = Math.atan2(y2 - cp.y, x2 - cp.x);
      startAngle = Math.atan2(y1 - cp.y, x1 - cp.x);

      drawHead(x2, y2, endAngle, rf, 10);
      if (arrowheads === 'both') {
        drawHead(x1, y1, startAngle, rf, 20);
      }

    } else {
      const mids = midpoints && midpoints.length > 0 ? midpoints : (curvePoint ? [curvePoint] : []);
      const nodes = [{ x: x1, y: y1 }, ...mids, { x: x2, y: y2 }];
      const rf = roughness * Math.min(strokeWidth * 0.4, 3);

      if (roughness >= 2) {
        const maxOff = Math.min(strokeWidth * 0.7, 3);
        for (let pass = 0; pass < CARTOON_PASSES; pass++) {
          ctx.beginPath();
          const po = pass * 100;
          ctx.moveTo(
            nodes[0].x + (random(po) - 0.5) * maxOff,
            nodes[0].y + (random(po + 1) - 0.5) * maxOff
          );

          for (let s = 0; s < nodes.length - 1; s++) {
            const from = nodes[s];
            const to = nodes[s + 1];
            const segPerp = perp(from.x, from.y, to.x, to.y);
            const dist = Math.hypot(to.x - from.x, to.y - from.y);
            const segs = Math.max(Math.floor(dist / 20), 3);
            for (let i = 1; i <= segs; i++) {
              const t = i / segs;
              const w = maxOff * Math.sin(t * Math.PI) * (random(po + s * 30 + 10 + i) - 0.5) * 1.4;
              if (i === segs) ctx.lineTo(to.x, to.y);
              else ctx.lineTo(from.x + (to.x - from.x) * t + segPerp.px * w, from.y + (to.y - from.y) * t + segPerp.py * w);
            }
          }

          const last = nodes[nodes.length - 1];
          const prev = nodes[nodes.length - 2];
          const first = nodes[0];
          const second = nodes[1];
          endAngle = Math.atan2(last.y - prev.y, last.x - prev.x);
          startAngle = Math.atan2(first.y - second.y, first.x - second.x);

          drawHead(x2, y2, endAngle, 0, po + 30);
          if (arrowheads === 'both') {
            drawHead(x1, y1, startAngle, 0, po + 40);
          }
          ctx.stroke();
        }
        return;
      }

      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);

      if (roughness > 0) {
        for (let s = 0; s < nodes.length - 1; s++) {
          const from = nodes[s];
          const to = nodes[s + 1];
          const segRandom = seededRandom(coordSeed(from.x, from.y, to.x, to.y));
          const dist = Math.hypot(to.x - from.x, to.y - from.y);
          const segs = Math.max(Math.floor(dist / 15), 3);
          const segPerp = perp(from.x, from.y, to.x, to.y);
          for (let i = 1; i <= segs; i++) {
            const t = i / segs;
            const w = rf * Math.sin(t * Math.PI) * (segRandom(i) - 0.5) * 2;
            if (i === segs) ctx.lineTo(to.x, to.y);
            else ctx.lineTo(from.x + (to.x - from.x) * t + segPerp.px * w, from.y + (to.y - from.y) * t + segPerp.py * w);
          }
        }
      } else {
        for (let s = 1; s < nodes.length; s++) {
          ctx.lineTo(nodes[s].x, nodes[s].y);
        }
      }

      const last = nodes[nodes.length - 1];
      const prev = nodes[nodes.length - 2];
      const first = nodes[0];
      const second = nodes[1];
      endAngle = Math.atan2(last.y - prev.y, last.x - prev.x);
      startAngle = Math.atan2(first.y - second.y, first.x - second.x);

      drawHead(x2, y2, endAngle, rf, 10);
      if (arrowheads === 'both') {
        drawHead(x1, y1, startAngle, rf, 20);
      }
    }
  },

  line: ({ x1, y1, x2, y2, curvePoint, midpoints, strokeWidth = 3, roughness = 1 }, ctx) => {
    const mids = midpoints && midpoints.length > 0 ? midpoints : (curvePoint ? [curvePoint] : []);
    const nodes = [{ x: x1, y: y1 }, ...mids, { x: x2, y: y2 }];
    const random = seededRandom(coordSeed(x1, y1, x2, y2));

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (roughness >= 2) {
      const maxOff = Math.min(strokeWidth * 0.7, 3);

      for (let pass = 0; pass < CARTOON_PASSES; pass++) {
        ctx.beginPath();
        const po = pass * 100;
        ctx.moveTo(
          nodes[0].x + (random(po) - 0.5) * maxOff,
          nodes[0].y + (random(po + 1) - 0.5) * maxOff
        );

        for (let s = 0; s < nodes.length - 1; s++) {
          const from = nodes[s];
          const to = nodes[s + 1];
          const segPerp = perp(from.x, from.y, to.x, to.y);
          const dist = Math.hypot(to.x - from.x, to.y - from.y);
          const segs = Math.max(Math.floor(dist / 20), 3);
          for (let i = 1; i <= segs; i++) {
            const t = i / segs;
            const w = maxOff * Math.sin(t * Math.PI) * (random(po + s * 30 + 10 + i) - 0.5) * 1.4;
            if (i === segs) ctx.lineTo(to.x, to.y);
            else ctx.lineTo(from.x + (to.x - from.x) * t + segPerp.px * w, from.y + (to.y - from.y) * t + segPerp.py * w);
          }
        }
        ctx.stroke();
      }
    } else {
      const rf = roughness * Math.min(strokeWidth * 0.4, 3);
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);

      if (roughness > 0) {
        for (let s = 0; s < nodes.length - 1; s++) {
          const from = nodes[s];
          const to = nodes[s + 1];
          const segRandom = seededRandom(coordSeed(from.x, from.y, to.x, to.y));
          const dist = Math.hypot(to.x - from.x, to.y - from.y);
          const segs = Math.max(Math.floor(dist / 15), 3);
          const segPerp = perp(from.x, from.y, to.x, to.y);
          for (let i = 1; i <= segs; i++) {
            const t = i / segs;
            const w = rf * Math.sin(t * Math.PI) * (segRandom(i) - 0.5) * 2;
            if (i === segs) ctx.lineTo(to.x, to.y);
            else ctx.lineTo(from.x + (to.x - from.x) * t + segPerp.px * w, from.y + (to.y - from.y) * t + segPerp.py * w);
          }
        }
      } else {
        for (let s = 1; s < nodes.length; s++) {
          ctx.lineTo(nodes[s].x, nodes[s].y);
        }
      }
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
    const random = seededRandom(coordSeed(x1, y1, x2, y2));

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const drawCleanRoundedRect = () => {
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
    };

    if (roughness >= 2) {
      const maxOff = Math.min(strokeWidth * 0.7, 3);

      if (r > 0) {
        ctx.beginPath();
        drawCleanRoundedRect();
        ctx.fill();

        const anchors = {
          tl: { x: left + r, y: top },
          tr: { x: right - r, y: top },
          rt: { x: right, y: top + r },
          rb: { x: right, y: bottom - r },
          br: { x: right - r, y: bottom },
          bl: { x: left + r, y: bottom },
          lb: { x: left, y: bottom - r },
          lt: { x: left, y: top + r },
        };

        for (let pass = 0; pass < CARTOON_PASSES; pass++) {
          ctx.beginPath();
          const po = pass * 100;
          const j = (base: number, idx: number) =>
            base + (random(po + idx) - 0.5) * maxOff * 1.4;

          const wobblyEdge = (from: Point, to: Point, axis: 'h' | 'v', seedBase: number) => {
            const len = axis === 'h' ? Math.abs(to.x - from.x) : Math.abs(to.y - from.y);
            const segs = Math.max(Math.floor(len / 25), 2);
            for (let i = 1; i <= segs; i++) {
              const t = i / segs;
              const bx = from.x + (to.x - from.x) * t;
              const by = from.y + (to.y - from.y) * t;
              const w = maxOff * Math.sin(t * Math.PI) * (random(po + seedBase + i) - 0.5) * 1.4;
              if (axis === 'h') ctx.lineTo(j(bx, seedBase + i), by + w);
              else ctx.lineTo(bx + w, j(by, seedBase + i));
            }
          };

          ctx.moveTo(j(anchors.tl.x, 0), j(anchors.tl.y, 1));
          wobblyEdge(anchors.tl, anchors.tr, 'h', 10);
          ctx.quadraticCurveTo(j(right, 20), j(top, 21), j(anchors.rt.x, 22), j(anchors.rt.y, 23));
          wobblyEdge(anchors.rt, anchors.rb, 'v', 30);
          ctx.quadraticCurveTo(j(right, 40), j(bottom, 41), j(anchors.br.x, 42), j(anchors.br.y, 43));
          wobblyEdge(anchors.br, anchors.bl, 'h', 50);
          ctx.quadraticCurveTo(j(left, 60), j(bottom, 61), j(anchors.lb.x, 62), j(anchors.lb.y, 63));
          wobblyEdge(anchors.lb, anchors.lt, 'v', 70);
          ctx.quadraticCurveTo(j(left, 80), j(top, 81), j(anchors.tl.x, 82), j(anchors.tl.y, 83));
          ctx.closePath();
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.rect(left, top, width, height);
        ctx.closePath();
        ctx.fill();

        for (let pass = 0; pass < CARTOON_PASSES; pass++) {
          ctx.beginPath();
          const po = pass * 100;

          drawCartoonSegment(ctx, left, top, right, top, (i) => random(po + i), maxOff, 0, true);
          drawCartoonSegment(ctx, right, top, right, bottom, (i) => random(po + i), maxOff, 20, false);
          drawCartoonSegment(ctx, right, bottom, left, bottom, (i) => random(po + i), maxOff, 40, false);
          drawCartoonSegment(ctx, left, bottom, left, top, (i) => random(po + i), maxOff, 60, false);

          ctx.closePath();
          ctx.stroke();
        }
      }
    } else if (roughness > 0 && r > 0) {
      const rf = roughness * Math.min(strokeWidth * 0.3, 2);

      const anchors = {
        tl: { x: left + r, y: top },
        tr: { x: right - r, y: top },
        rt: { x: right, y: top + r },
        rb: { x: right, y: bottom - r },
        br: { x: right - r, y: bottom },
        bl: { x: left + r, y: bottom },
        lb: { x: left, y: bottom - r },
        lt: { x: left, y: top + r },
      };

      ctx.beginPath();
      ctx.moveTo(anchors.tl.x, anchors.tl.y);
      drawWobblySegment(ctx, anchors.tl.x, anchors.tl.y, anchors.tr.x, anchors.tr.y, random, rf, 0, false);
      ctx.quadraticCurveTo(right, top, anchors.rt.x, anchors.rt.y);
      drawWobblySegment(ctx, anchors.rt.x, anchors.rt.y, anchors.rb.x, anchors.rb.y, random, rf, 10, false);
      ctx.quadraticCurveTo(right, bottom, anchors.br.x, anchors.br.y);
      drawWobblySegment(ctx, anchors.br.x, anchors.br.y, anchors.bl.x, anchors.bl.y, random, rf, 20, false);
      ctx.quadraticCurveTo(left, bottom, anchors.lb.x, anchors.lb.y);
      drawWobblySegment(ctx, anchors.lb.x, anchors.lb.y, anchors.lt.x, anchors.lt.y, random, rf, 30, false);
      ctx.quadraticCurveTo(left, top, anchors.tl.x, anchors.tl.y);
      ctx.closePath();
    } else if (roughness > 0) {
      const rf = roughness * Math.min(strokeWidth * 0.3, 2);
      ctx.beginPath();
      drawWobblySegment(ctx, left, top, right, top, random, rf, 0, true);
      drawWobblySegment(ctx, right, top, right, bottom, random, rf, 10, false);
      drawWobblySegment(ctx, right, bottom, left, bottom, random, rf, 20, false);
      drawWobblySegment(ctx, left, bottom, left, top, random, rf, 30, false);
      ctx.closePath();
    } else {
      ctx.beginPath();
      drawCleanRoundedRect();
    }
  },

  diamond: ({ x1, y1, x2, y2, strokeWidth = 3, roughness = 1 }, ctx) => {
    const midX = x1 + (x2 - x1) / 2;
    const midY = y1 + (y2 - y1) / 2;
    const pts = [
      { x: midX, y: y1 },  // top
      { x: x2, y: midY },  // right
      { x: midX, y: y2 },  // bottom
      { x: x1, y: midY },  // left
    ];
    const random = seededRandom(coordSeed(x1, y1, x2, y2));

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (roughness >= 2) {
      const maxOff = Math.min(strokeWidth * 0.7, 3);

      // Fill clean diamond
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < 4; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      ctx.fill();

      for (let pass = 0; pass < CARTOON_PASSES; pass++) {
        const po = pass * 100;
        ctx.beginPath();
        for (let side = 0; side < 4; side++) {
          drawCartoonSegment(
            ctx, pts[side].x, pts[side].y,
            pts[(side + 1) % 4].x, pts[(side + 1) % 4].y,
            (i) => random(po + i), maxOff, side * 20, side === 0
          );
        }
        ctx.closePath();
        ctx.stroke();
      }
    } else if (roughness > 0) {
      const rf = roughness * Math.min(strokeWidth * 0.3, 2);
      ctx.beginPath();
      for (let side = 0; side < 4; side++) {
        drawWobblySegment(
          ctx, pts[side].x, pts[side].y,
          pts[(side + 1) % 4].x, pts[(side + 1) % 4].y,
          random, rf, side * 10, side === 0
        );
      }
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < 4; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
    }
  },

  circle: ({ x1, y1, x2, y2, strokeWidth = 3, roughness = 1 }, ctx) => {
    const cx = x1 + (x2 - x1) / 2;
    const cy = y1 + (y2 - y1) / 2;
    const rx = Math.abs(x2 - x1) / 2;
    const ry = Math.abs(y2 - y1) / 2;
    const random = seededRandom(coordSeed(x1, y1, x2, y2));

    if (roughness >= 2) {
      const maxOff = Math.min(strokeWidth * 0.7, 3);
      const segs = 48;

      // Fill clean ellipse
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();

      for (let pass = 0; pass < CARTOON_PASSES; pass++) {
        ctx.beginPath();
        const po = pass * 200;
        const jrx = (random(po) - 0.5) * maxOff;
        const jry = (random(po + 1) - 0.5) * maxOff;

        for (let i = 0; i <= segs; i++) {
          const a = (i / segs) * Math.PI * 2;
          const w = maxOff * (random(po + 10 + i) - 0.5) * 1.4;
          const px = cx + (rx + jrx + w) * Math.cos(a);
          const py = cy + (ry + jry + w) * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    } else if (roughness > 0) {
      const rf = roughness * Math.min(strokeWidth * 0.25, 2);
      const segs = 36;
      ctx.beginPath();
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        const w = rf * (random(i) - 0.5) * 2;
        const px = cx + (rx + w) * Math.cos(a);
        const py = cy + (ry + w) * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      ctx.closePath();
    }
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

    const last = points[points.length - 1];
    if (!(Math.abs(last.x - points[0].x) < strokeWidth && Math.abs(last.y - points[0].y) < strokeWidth)) {
      ctx.fillStyle = "transparent";
    }
    ctx.lineTo(last.x, last.y);
  },

  text: ({ id, x1, y1, x2, text = "", fontSize = 'M', textAlign = 'left' }, ctx) => {
    if (id === textWriting) return;
    const px = FONT_SIZE_MAP[fontSize] || 30;
    ctx.font = `${px}px Excalifont, cursive`;
    ctx.textBaseline = "top";
    ctx.textAlign = textAlign;
    const width = x2 - x1;
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      let drawX = x1;
      if (textAlign === 'center') drawX = x1 + width / 2;
      else if (textAlign === 'right') drawX = x2;
      ctx.fillText(line, drawX, y1 + px * i);
    });
  },
};

// --- Utility functions ---

export function distance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function getFocuseDemention(element: DrawElement, padding: number): FocusDemention {
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

export function getFocuseCorners(element: DrawElement, padding: number, position: number): FocuseCorners {
  const { fx, fy, fw, fh } = getFocuseDemention(element, padding);

  if (element.tool === "line" || element.tool === "arrow") {
    const isElbowed = element.tool === "arrow" && element.arrowType === "elbowed";
    const isCurved = element.tool === "arrow" && element.arrowType === "curved";
    const midpoints = ('midpoints' in element && element.midpoints) ? element.midpoints : [];
    let curvePoint = ('curvePoint' in element && element.curvePoint) ? element.curvePoint : null;
    const start = { x: fx, y: fy };
    const end = { x: fw, y: fh };

    const corners: Corner[] = [
      { slug: "l1", x: start.x - position, y: start.y - position },
    ];

    if (isElbowed) {
      const elbowMids = midpoints.length > 0 ? midpoints : [];
      for (let i = 0; i < elbowMids.length; i++) {
        corners.push({ slug: `lm-${i}` as CornerSlug, x: elbowMids[i].x - position, y: elbowMids[i].y - position });
      }

      const elbowNodes = [start, ...elbowMids, end];
      for (let i = 0; i < elbowNodes.length - 1; i++) {
        const a = elbowNodes[i];
        const b = elbowNodes[i + 1];
        const isLast = i === elbowNodes.length - 2;

        let hx: number, hy: number;
        if (isLast) {
          // Determine if the movement is more horizontal or vertical
          const dx = Math.abs(b.x - a.x);
          const dy = Math.abs(b.y - a.y);
          const isMoreHorizontal = dx >= dy;

          if (isMoreHorizontal) {
            // Horizontal-dominant: H-V pattern (original)
            const midX = a.x + (b.x - a.x) / 2;
            hx = midX;
            hy = (a.y + b.y) / 2;
          } else {
            // Vertical-dominant: V-H pattern (new for up/down arrows)
            const midY = a.y + (b.y - a.y) / 2;
            hx = (a.x + b.x) / 2;
            hy = midY;
          }
        } else {
          hx = (a.x + b.x) / 2;
          hy = a.y;
        }
        corners.push({ slug: `la-${i}` as CornerSlug, x: hx - position, y: hy - position });
      }

      corners.push({ slug: "l2", x: end.x - position, y: end.y - position });
    } else if (isCurved) {
      // For curved arrows, generate default curve point if it doesn't exist
      if (!curvePoint) {
        curvePoint = { x: (fx + fw) / 2, y: Math.min(fy, fh) - Math.abs(fw - fx) * 0.25 };
      }
      corners.push({ slug: "l3", x: curvePoint.x - position, y: curvePoint.y - position });
      corners.push({ slug: "l2", x: end.x - position, y: end.y - position });
    } else {
      const nodes = [start, ...midpoints, end];

      // Check if there's a curvePoint but no midpoints (for lines/arrows with curve)
      if (curvePoint && midpoints.length === 0) {
        corners.push({ slug: "l3", x: curvePoint.x - position, y: curvePoint.y - position });
      } else {
        // Show midpoint handles
        for (let i = 0; i < midpoints.length; i++) {
          corners.push({ slug: `lm-${i}` as CornerSlug, x: midpoints[i].x - position, y: midpoints[i].y - position });
        }
      }

      // Add "add point" handles between segments
      for (let i = 0; i < nodes.length - 1; i++) {
        const mx = (nodes[i].x + nodes[i + 1].x) / 2;
        const my = (nodes[i].y + nodes[i + 1].y) / 2;
        corners.push({ slug: `la-${i}` as CornerSlug, x: mx - position, y: my - position });
      }

      corners.push({ slug: "l2", x: end.x - position, y: end.y - position });
    }

    return {
      line: { fx, fy, fw, fh },
      corners,
    };
  }

  return {
    line: { fx, fy, fw, fh },
    corners: [
      { slug: "tl", x: fx - position, y: fy - position },
      { slug: "tr", x: fx + fw - position, y: fy - position },
      { slug: "bl", x: fx - position, y: fy + fh - position },
      { slug: "br", x: fx + fw - position, y: fy + fh - position },
      { slug: "tt", x: fx + fw / 2 - position, y: fy - position },
      { slug: "rr", x: fx + fw - position, y: fy + fh / 2 - position },
      { slug: "ll", x: fx - position, y: fy + fh / 2 - position },
      { slug: "bb", x: fx + fw / 2 - position, y: fy + fh - position },
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

  const normalCorners = corners.filter(c => !c.slug.startsWith("la-"));
  const addCorners = corners.filter(c => c.slug.startsWith("la-"));

  context.beginPath();
  normalCorners.forEach((corner) => {
    context.roundRect(corner.x, corner.y, square, square, round);
  });
  context.fill();
  context.stroke();
  context.closePath();

  if (addCorners.length > 0) {
    const smallSquare = square * 0.7;
    const offset = (square - smallSquare) / 2;
    context.save();
    context.globalAlpha = 0.45;
    context.fillStyle = "#c8d0ff";
    context.strokeStyle = "#6965db";
    context.beginPath();
    addCorners.forEach((corner) => {
      context.roundRect(corner.x + offset, corner.y + offset, smallSquare, smallSquare, smallSquare);
    });
    context.fill();
    context.stroke();
    context.closePath();
    context.restore();
  }
}

export function draw(element: DrawElement, context: CanvasRenderingContext2D): void {
  const { tool, strokeWidth, strokeColor, strokeStyle, fill, opacity } = element;

  context.beginPath();
  context.lineWidth = strokeWidth;
  context.strokeStyle = strokeColor;
  context.fillStyle = tool === "text" ? strokeColor : fill;
  context.globalAlpha = opacity * 0.01;

  if (strokeStyle === "dashed") context.setLineDash([strokeWidth * 2, strokeWidth * 2]);
  else if (strokeStyle === "dotted") context.setLineDash([strokeWidth, strokeWidth]);
  else context.setLineDash([0, 0]);

  const shapeParams: ShapeParams = {
    id: element.id,
    x1: element.x1, y1: element.y1,
    x2: element.x2, y2: element.y2,
    borderRadius: element.borderRadius,
    strokeWidth: element.strokeWidth,
    roughness: element.roughness,
  };

  if ('points' in element) shapeParams.points = element.points;
  if ('image' in element) shapeParams.image = element.image;
  if ('text' in element) shapeParams.text = element.text;
  if ('curvePoint' in element) shapeParams.curvePoint = element.curvePoint;
  if ('midpoints' in element) shapeParams.midpoints = element.midpoints;
  shapeParams.arrowType = element.arrowType;
  shapeParams.arrowheads = element.arrowheads;
  shapeParams.fontSize = element.fontSize;
  shapeParams.textAlign = element.textAlign;

  const isCartoonist = element.roughness >= 2 &&
    (tool === 'rectangle' || tool === 'diamond' || tool === 'circle' || tool === 'arrow' || tool === 'line');

  shapes[tool](shapeParams, context);

  if (!isCartoonist) {
    context.fill();
    if (strokeWidth > 0) context.stroke();
  }

  drawShapeEmbeddedLabel(element, context);

  context.closePath();
}

function drawShapeEmbeddedLabel(
  element: DrawElement,
  context: CanvasRenderingContext2D
): void {
  if (element.tool === "text" || element.tool === "pencil") return;
  const label = element.text;
  if (label === undefined || label === "") return;
  if (element.id === textWriting) return;

  const left = Math.min(element.x1, element.x2);
  const right = Math.max(element.x1, element.x2);
  const top = Math.min(element.y1, element.y2);
  const bottom = Math.max(element.y1, element.y2);
  const width = right - left;
  const height = bottom - top;
  if (width < 4 || height < 4) return;

  const fontSizeKey = element.fontSize || "M";
  const px = FONT_SIZE_MAP[fontSizeKey] || 30;
  const lines = label.split("\n");
  const lineHeight = px * 1.15;
  const totalH = lines.length * lineHeight;
  const centerX = left + width / 2;
  const startY = Math.max(top, top + (height - totalH) / 2);

  context.save();
  context.font = `${px}px Excalifont, cursive`;
  context.textBaseline = "top";
  context.fillStyle = element.strokeColor;
  context.textAlign = "center";

  lines.forEach((line, i) => {
    context.fillText(line, centerX, startY + i * lineHeight);
  });
  context.restore();
}

export function inSelectedCorner(
  element: DrawElement | null | undefined,
  x: number, y: number,
  padding: number, scale: number
): Corner | null {
  if (!element) return null;

  const adjustedPadding = element.tool === "line" || element.tool === "arrow" ? 0 : padding;
  const square = 10 / scale;
  const position = square / 2;
  const corners = getFocuseCorners(element, adjustedPadding, position).corners;

  return corners.find(
    (c) => x - c.x <= square && x - c.x >= 0 && y - c.y <= square && y - c.y >= 0
  ) || null;
}

export function cornerCursor(corner: string): string {
  if (corner.startsWith("lm-")) return "move";
  if (corner.startsWith("la-")) return "pointer";
  switch (corner) {
    case "tt": case "bb": return "s-resize";
    case "ll": case "rr": return "e-resize";
    case "tl": case "br": return "se-resize";
    case "tr": case "bl": return "ne-resize";
    case "l1": case "l2": return "pointer";
    case "l3": return "move";
    default: return "default";
  }
}
