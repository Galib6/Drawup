import { FC } from 'react';

// Tool types
export type ToolSlug = 
  | 'lock'
  | 'hand'
  | 'selection'
  | 'rectangle'
  | 'diamond'
  | 'circle'
  | 'arrow'
  | 'line'
  | 'pencil'
  | 'text'
  | 'image';

export type ActionType = 
  | 'none'
  | 'draw'
  | 'move'
  | 'translate'
  | `resize-${string}`;

// Point type
export interface Point {
  x: number;
  y: number;
}

// Style types
export interface ElementStyle {
  strokeWidth: number;
  strokeColor: string;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  fill: string;
  opacity: number;
  borderRadius: number;
  roughness: number; // 0 = straight/clean, 1+ = hand-drawn/sketchy
}

// Element types
export interface BaseElement extends ElementStyle {
  id: string;
  tool: ToolSlug;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  curvePoint?: Point; // Control point for curved lines/arrows
}

export interface PencilElement extends BaseElement {
  tool: 'pencil';
  points: Point[];
}

export interface TextElement extends BaseElement {
  tool: 'text';
  text: string;
}

export interface ImageElement extends BaseElement {
  tool: 'image';
  image: string;
}

export type DrawElement = BaseElement | PencilElement | TextElement | ImageElement;

// Selected element with offset
export interface SelectedElement extends BaseElement {
  offsetX?: number;
  offsetY?: number;
  lastPosX?: number;
  lastPosY?: number;
  points?: Point[];
  text?: string;
  image?: string;
  curvePoint?: Point;
}

// Translate state
export interface TranslateState {
  x: number;
  y: number;
  sx: number;
  sy: number;
}

// Scale offset
export interface ScaleOffset {
  x: number;
  y: number;
}

// Tool definition
export interface Tool {
  slug: ToolSlug;
  icon: FC;
  title: string;
  toolAction: (slug: string) => void;
}

// Stroke style definition
export interface StrokeStyleDef {
  slug: 'solid' | 'dashed' | 'dotted';
  icon: FC;
}

// Dimension
export interface Dimension {
  width: number;
  height: number;
}

// Corner types for resize
export type CornerSlug = 'tl' | 'tr' | 'bl' | 'br' | 'tt' | 'bb' | 'll' | 'rr' | 'l1' | 'l2' | 'l3';

export interface Corner {
  slug: CornerSlug;
  x: number;
  y: number;
}

// Focus demention
export interface FocusDemention {
  fx: number;
  fy: number;
  fw: number;
  fh: number;
}

export interface FocuseCorners {
  line: FocusDemention;
  corners: Corner[];
}

// Bounding box
export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Mouse action
export interface MouseAction {
  x: number;
  y: number;
}

// Create element params
export interface CreateElementParams {
  id?: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  style: ElementStyle;
  tool: ToolSlug;
  image?: string;
  text?: string;
}

// App context type
export interface AppContextType {
  action: ActionType;
  setAction: React.Dispatch<React.SetStateAction<ActionType>>;
  tools: Tool[][];
  selectedTool: ToolSlug;
  setSelectedTool: React.Dispatch<React.SetStateAction<ToolSlug>>;
  elements: DrawElement[];
  setElements: (
    action: DrawElement[] | ((prev: DrawElement[]) => DrawElement[]) | 'prevState',
    overwrite?: boolean,
    emit?: boolean
  ) => void;
  translate: TranslateState;
  setTranslate: React.Dispatch<React.SetStateAction<TranslateState>>;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  onZoom: (delta: number | 'default') => void;
  scaleOffset: ScaleOffset;
  setScaleOffset: React.Dispatch<React.SetStateAction<ScaleOffset>>;
  lockTool: boolean;
  setLockTool: React.Dispatch<React.SetStateAction<boolean>>;
  style: ElementStyle;
  setStyle: React.Dispatch<React.SetStateAction<ElementStyle>>;
  selectedElement: SelectedElement | null;
  setSelectedElement: React.Dispatch<React.SetStateAction<SelectedElement | null>>;
  undo: () => void;
  redo: () => void;
  session: string | null;
  setSession: React.Dispatch<React.SetStateAction<string | null>>;
  setToDefault: () => void;
  rerender: boolean;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}

// Canvas hook return type
export interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  handleMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  handleWheel: (event: React.WheelEvent<HTMLCanvasElement>) => void;
  handleDoubleClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  dimension: Dimension;
}
