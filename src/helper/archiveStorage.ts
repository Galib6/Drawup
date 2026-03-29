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
