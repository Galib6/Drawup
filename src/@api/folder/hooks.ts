
import { MutationConfig, queryClient, QueryConfig } from '@/@base/config';
import { IBaseFilter } from '@/@base/interfaces/interfaces';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { IFoldersResponse } from './interfaces';
import { FolderService } from './service';

//---------------- useFolders hook ------------------------------------
type IUseFolders = {
  options: IBaseFilter;
  config?: QueryConfig<typeof FolderService.filter>;
};
export const useFolders = ({ options, config }: IUseFolders) => {
  return useQuery({
    ...config,
    queryKey: [FolderService.NAME, options],
    queryFn: () => FolderService.filter(options),
  });
};

//----------------------- useFolder hook --------------------------------------
type IUseFolder = {
  id: string;
  config?: QueryConfig<typeof FolderService.filterById>;
};

export const useFolder = ({ id, config }: IUseFolder) => {
  return useQuery({
    ...config,
    queryKey: [FolderService.NAME, id],
    queryFn: () => FolderService.filterById(id),
  });
};

//------------------ useCreateFolder hook ---------------------------------
type IUseCreateFolder = {
  config?: MutationConfig<typeof FolderService.create>;
};

export const useCreateFolder = ({ config }: IUseCreateFolder = {}) => {
  return useMutation({
    ...config,
    mutationFn: FolderService.create,
    onSettled: (res) => {
      if (!res?.success) return;
      queryClient.invalidateQueries({ queryKey: [FolderService.NAME] });
    },
  });
};

//------------------ useUpdateFolder hook ----------------------------------
type IUseUpdateFolder = {
  config?: MutationConfig<typeof FolderService.update>;
};

export const useUpdateFolder = ({ config }: IUseUpdateFolder = {}) => {
  return useMutation({
    ...config,
    mutationFn: FolderService.update,
    onSettled: (res) => {
      if (!res?.success) return;
      queryClient.invalidateQueries({ queryKey: [FolderService.NAME] });
    },
  });
};

//------------------ useDeleteFolder hook ----------------------------------
type IUseDeleteFolder = {
  config?: MutationConfig<typeof FolderService.delete>;
};

export const useDeleteFolder = ({ config }: IUseDeleteFolder = {}) => {
  return useMutation({
    ...config,
    mutationFn: FolderService.delete,
    onSuccess: (res) => {
      if (!res?.success) return;
      queryClient.invalidateQueries({ queryKey: [FolderService.NAME] });
    },
  });
};

//---------------- useInfiniteFolders hook ------------------------------------
type IUseInfiniteFolders = {
  options: IBaseFilter;
  config?: any;
};

export const useInfiniteFolders = ({ options, config }: IUseInfiniteFolders) => {
  return useInfiniteQuery<IFoldersResponse>({
    ...config,
    initialPageParam: 1,
    queryKey: [FolderService.NAME, 'infinite', options],
    queryFn: ({ pageParam = 1 }) => FolderService.filter({ ...options, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      return lastPage.meta.page < Math.ceil(lastPage.meta.total / lastPage.meta.limit)
        ? lastPage.meta.page + 1
        : undefined;
    },
  });
};
