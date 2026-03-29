export interface IBaseFilter {
  query?: string;
  searchTerm?: string | string[];
  page?: number;
  limit?: number;
  isActive?: boolean;
  sortOrder?: 'ASC' | 'DESC';
  user?: IdType;
  sort?: MultiSortType;
  sortBy?: string;
}

export interface IMetaResponse {
  total: number;
  page: number;
  limit: number;
  skip: number;
}
export interface IBaseResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  errorMessages: string[];
  meta: IMetaResponse;
  data: T;
}

export interface IBaseEntity {
  id: IdType;
  isActive: boolean;
  deletedBy: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export interface IBaseMetaData {
  title?: string;
  description?: string;
  keywords?: string;
  isFollow?: boolean;
  isIndex?: boolean;
}

export type MultiSortType = { by: string; order?: 'ASC' | 'DESC' }[];

export type IdType = string | number;
