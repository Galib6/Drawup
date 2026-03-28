import { FC } from 'react';
import { DashedLine, DottedLine, SolidLine } from "../assets/icons";
import { StrokeStyleDef } from "../types";

export const BACKGROUND_COLORS: string[] = [
  "transparent",
  "rgb(255, 201, 201)",
  "rgb(178, 242, 187)",
  "rgb(165, 216, 255)",
  "rgb(255, 236, 153)",
  "rgb(255, 255, 255)",
];

export const STROKE_COLORS: string[] = [
  "rgb(30, 30, 30)",
  "rgb(224, 49, 49)",
  "rgb(47, 158, 68)",
  "rgb(25, 113, 194)",
  "rgb(240, 140, 0)",
  "rgb(73, 80, 87)",
];

export const STROKE_STYLES: StrokeStyleDef[] = [
  {
    slug: "solid",
    icon: SolidLine as FC,
  },
  {
    slug: "dashed",
    icon: DashedLine as FC,
  },
  {
    slug: "dotted",
    icon: DottedLine as FC,
  },
];

export const CANVAS_BACKGROUND: string[] = [
  "rgb(255, 201, 201)",
  "rgb(178, 242, 187)",
  "rgb(165, 216, 255)",
  "rgb(255, 236, 153)",
];
