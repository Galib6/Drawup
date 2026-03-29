import { IBaseEntity, IBaseResponse, IdType } from "@/@base/interfaces/interfaces";
import { IFolder } from "../folder/interfaces";


export interface ICanvas extends IBaseEntity {
  folderId: 3,
  folder: IFolder,
  name: string,
  canvasData: any
}

export interface ICanvasCreate {
  folderId: IdType;
  name: string;
  canvasData: any;
}

export interface ICanvasUpdate {
  id: IdType;
  data: ICanvasCreate;
}

export interface ICanvasResponse extends IBaseResponse {
  data: ICanvas;
}

export interface ICanvassResponse extends IBaseResponse {
  data: ICanvas[];
}
