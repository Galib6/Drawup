import { IBaseEntity, IBaseResponse, IdType } from "@/@base/interfaces/interfaces";
import { ICanvas } from "../canvas/interfaces";


export interface IFolder extends IBaseEntity {
  name: string;
}

export interface IFolderCreate {
  name: string;
  canvases: ICanvas[];
}

export interface IFolderUpdate {
  id: IdType;
  data: IFolderCreate;
}

export interface IFolderResponse extends IBaseResponse {
  data: IFolder;
}

export interface IFoldersResponse extends IBaseResponse {
  data: IFolder[];
}
