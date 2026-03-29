
import { MutationConfig, queryClient, QueryConfig } from '@/@base/config';
import { IBaseFilter } from '@/@base/interfaces/interfaces';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { ICanvassResponse } from './interfaces';
import { CanvasService } from './service';

//---------------- useCanvass hook ------------------------------------
type IUseCanvass = {
  options: IBaseFilter;
  config?: QueryConfig<typeof CanvasService.filter>;
};
export const useCanvass = ({ options, config }: IUseCanvass) => {
  return useQuery({
    ...config,
    queryKey: [CanvasService.NAME, options],
    queryFn: () => CanvasService.filter(options),
  });
};

//----------------------- useCanvas hook --------------------------------------
type IUseCanvas = {
  id: string;
  config?: QueryConfig<typeof CanvasService.filterById>;
};

export const useCanvas = ({ id, config }: IUseCanvas) => {
  return useQuery({
    ...config,
    queryKey: [CanvasService.NAME, id],
    queryFn: () => CanvasService.filterById(id),
  });
};

//------------------ useCreateCanvas hook ---------------------------------
type IUseCreateCanvas = {
  config?: MutationConfig<typeof CanvasService.create>;
};

export const useCreateCanvas = ({ config }: IUseCreateCanvas = {}) => {
  return useMutation({
    ...config,
    mutationFn: CanvasService.create,
    onSettled: (res) => {
      if (!res?.success) return;
      queryClient.invalidateQueries({ queryKey: [CanvasService.NAME] });
    },
  });
};

//------------------ useUpdateCanvas hook ----------------------------------
type IUseUpdateCanvas = {
  config?: MutationConfig<typeof CanvasService.update>;
};

export const useUpdateCanvas = ({ config }: IUseUpdateCanvas = {}) => {
  return useMutation({
    ...config,
    mutationFn: CanvasService.update,
    onSettled: (res) => {
      if (!res?.success) return;
      queryClient.invalidateQueries({ queryKey: [CanvasService.NAME] });
    },
  });
};

//------------------ useDeleteCanvas hook ----------------------------------
type IUseDeleteCanvas = {
  config?: MutationConfig<typeof CanvasService.delete>;
};

export const useDeleteCanvas = ({ config }: IUseDeleteCanvas = {}) => {
  return useMutation({
    ...config,
    mutationFn: CanvasService.delete,
    onSuccess: (res) => {
      if (!res?.success) return;
      queryClient.invalidateQueries({ queryKey: [CanvasService.NAME] });
    },
  });
};

//---------------- useInfiniteCanvass hook ------------------------------------
type IUseInfiniteCanvass = {
  options: IBaseFilter;
  config?: any;
};

export const useInfiniteCanvass = ({ options, config }: IUseInfiniteCanvass) => {
  return useInfiniteQuery<ICanvassResponse>({
    ...config,
    initialPageParam: 1,
    queryKey: [CanvasService.NAME, 'infinite', options],
    queryFn: ({ pageParam = 1 }) => CanvasService.filter({ ...options, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      return lastPage.meta.page < Math.ceil(lastPage.meta.total / lastPage.meta.limit)
        ? lastPage.meta.page + 1
        : undefined;
    },
  });
};
