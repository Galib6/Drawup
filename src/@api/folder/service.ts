
import { AxiosInstance } from '@/@base/config';
import { IBaseFilter } from '@/@base/interfaces/interfaces';
import { Toolbox } from '@/lib/utils/_toolbox';
import { ErrorHandler } from '@/lib/utils/errorHandler';
import { IFolderCreate, IFolderResponse, IFoldersResponse, IFolderUpdate } from './interfaces';

const END_POINT: string = '/excali-folders';

export const FolderService = {
  NAME: END_POINT,
  async create(payload: IFolderCreate): Promise<IFolderResponse> {
    try {
      const data = await AxiosInstance.post(END_POINT, payload);
      return Promise.resolve(data?.data);
    } catch (error) {
      throw ErrorHandler(error);
    }
  },
  async filter(options: IBaseFilter): Promise<IFoldersResponse> {
    try {
      const data = await AxiosInstance.get(`${END_POINT}?${Toolbox.queryNormalizer(options)}`);
      return Promise.resolve(data?.data);
    } catch (error) {
      throw ErrorHandler(error);
    }
  },
  async filterById(id: string): Promise<IFolderResponse> {
    try {
      const data = await AxiosInstance.get(`${END_POINT}/${id}`);
      return Promise.resolve(data?.data);
    } catch (error) {
      throw ErrorHandler(error);
    }
  },
  async update(payload: IFolderUpdate): Promise<IFolderResponse> {
    try {
      const data = await AxiosInstance.patch(`${END_POINT}/${payload.id}`, payload.data);
      return Promise.resolve(data?.data);
    } catch (error) {
      throw ErrorHandler(error);
    }
  },
  async delete(id: string): Promise<IFolderResponse> {
    try {
      const data = await AxiosInstance.delete(`${END_POINT}/${id}`);
      return Promise.resolve(data?.data);
    } catch (error) {
      throw ErrorHandler(error);
    }
  },
};
