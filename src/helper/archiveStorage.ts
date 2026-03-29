import { v4 as uuid } from "uuid";
import type { ArchiveData, ArchiveDesign, ArchiveFolder } from "../types/archive";
import type { DrawElement } from "../types";

const STORAGE_KEY = "drawup-archive";

function defaultData(): ArchiveData {
  return { folders: [] };
}

export function readArchive(): ArchiveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as ArchiveData;
    if (!parsed || !Array.isArray(parsed.folders)) return defaultData();
    return parsed;
  } catch {
    return defaultData();
  }
}

export function writeArchive(data: ArchiveData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addFolder(name: string): ArchiveFolder {
  const data = readArchive();
  const folder: ArchiveFolder = {
    id: uuid(),
    name: name.trim() || "Untitled folder",
    designs: [],
  };
  data.folders.push(folder);
  writeArchive(data);
  return folder;
}

export function removeFolder(folderId: string): void {
  const data = readArchive();
  data.folders = data.folders.filter((f) => f.id !== folderId);
  writeArchive(data);
}

export function renameFolder(folderId: string, name: string): boolean {
  const data = readArchive();
  const folder = data.folders.find((f) => f.id === folderId);
  if (!folder) return false;
  folder.name = name.trim() || "Untitled folder";
  writeArchive(data);
  return true;
}

/** Move a design to another folder; keeps the same design id. */
export function moveDesign(fromFolderId: string, designId: string, toFolderId: string): boolean {
  if (fromFolderId === toFolderId) return true;
  const data = readArchive();
  const from = data.folders.find((f) => f.id === fromFolderId);
  const to = data.folders.find((f) => f.id === toFolderId);
  if (!from || !to) return false;
  const idx = from.designs.findIndex((d) => d.id === designId);
  if (idx === -1) return false;
  const [design] = from.designs.splice(idx, 1);
  design.updatedAt = Date.now();
  to.designs.push(design);
  writeArchive(data);
  return true;
}

/** Update canvas name, elements, and optionally folder (local archive only). */
export function applyLocalCanvasUpdate(params: {
  sourceFolderId: string;
  canvasId: string;
  name: string;
  elements: DrawElement[];
  targetFolderId?: string;
}): boolean {
  const dest = params.targetFolderId ?? params.sourceFolderId;
  let folderId = params.sourceFolderId;
  if (dest !== params.sourceFolderId) {
    if (!moveDesign(params.sourceFolderId, params.canvasId, dest)) return false;
    folderId = dest;
  }
  const data = readArchive();
  const folder = data.folders.find((f) => f.id === folderId);
  const design = folder?.designs.find((d) => d.id === params.canvasId);
  if (!design) return false;
  design.name = params.name.trim() || "Untitled";
  design.elements = JSON.parse(JSON.stringify(params.elements)) as DrawElement[];
  design.updatedAt = Date.now();
  writeArchive(data);
  return true;
}

export function addDesign(
  folderId: string,
  name: string,
  elements: DrawElement[]
): ArchiveDesign | null {
  const data = readArchive();
  const folder = data.folders.find((f) => f.id === folderId);
  if (!folder) return null;

  const design: ArchiveDesign = {
    id: uuid(),
    name: name.trim() || "Untitled",
    updatedAt: Date.now(),
    elements: JSON.parse(JSON.stringify(elements)) as DrawElement[],
  };
  folder.designs.push(design);
  writeArchive(data);
  return design;
}

export function removeDesign(folderId: string, designId: string): void {
  const data = readArchive();
  const folder = data.folders.find((f) => f.id === folderId);
  if (!folder) return;
  folder.designs = folder.designs.filter((d) => d.id !== designId);
  writeArchive(data);
}

/** Overwrite an archived diagram’s elements (e.g. canvas matches this archive entry). */
export function updateDesign(folderId: string, designId: string, elements: DrawElement[]): boolean {
  const data = readArchive();
  const folder = data.folders.find((f) => f.id === folderId);
  const design = folder?.designs.find((d) => d.id === designId);
  if (!design) return false;
  design.elements = JSON.parse(JSON.stringify(elements)) as DrawElement[];
  design.updatedAt = Date.now();
  writeArchive(data);
  return true;
}
