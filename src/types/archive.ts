import type { DrawElement } from "./index";

export interface ArchiveDesign {
  id: string;
  name: string;
  updatedAt: number;
  elements: DrawElement[];
}

export interface ArchiveFolder {
  id: string;
  name: string;
  designs: ArchiveDesign[];
}

export interface ArchiveData {
  folders: ArchiveFolder[];
}
