import { useCanvass, useCreateCanvas, useDeleteCanvas, useUpdateCanvas } from "@/@api/canvas/hooks";
import type { ICanvas } from "@/@api/canvas/interfaces";
import { ICanvasCreate } from "@/@api/canvas/interfaces";
import { useCreateFolder, useDeleteFolder, useFolders, useUpdateFolder } from "@/@api/folder/hooks";
import type { IFolder } from "@/@api/folder/interfaces";
import {
  addDesign as addLocalDesign,
  addFolder as addLocalFolder,
  applyLocalCanvasUpdate,
  readArchive,
  removeDesign as removeLocalDesign,
  removeFolder as removeLocalFolder,
  renameFolder as renameLocalFolder,
} from "@/helper/archiveStorage";
import type { ActiveArchiveDiagram, DrawElement } from "@/types";
import { useAuthSession } from "@components/auth/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Unified folder type that works for both local and API
export interface UnifiedFolder {
  id: string;
  name: string;
  designs: UnifiedDesign[];
}

export interface UnifiedDesign {
  id: string;
  name: string;
  updatedAt: number;
  elements: DrawElement[];
}

/** Build unified archive tree from API folder + canvas lists (after refetch). */
export function unifyApiFoldersWithCanvases(
  folders: IFolder[] | undefined,
  canvases: ICanvas[] | undefined
): UnifiedFolder[] {
  if (!folders?.length) return [];
  const list = canvases ?? [];
  const canvasByFolder = list.reduce((acc, canvas) => {
    const folderId = String(canvas.folderId);
    if (!acc[folderId]) acc[folderId] = [];
    acc[folderId].push({
      id: String(canvas.id),
      name: canvas.name,
      updatedAt: canvas.updatedAt ? new Date(canvas.updatedAt).getTime() : Date.now(),
      elements: (canvas.canvasData || []) as DrawElement[],
    });
    return acc;
  }, {} as Record<string, UnifiedDesign[]>);

  return folders.map((folder) => ({
    id: String(folder.id),
    name: folder.name,
    designs: canvasByFolder[String(folder.id)] || [],
  }));
}

/** True when the active diagram still exists under its folder in the archive list. */
export function activeArchiveExistsInFolders(
  folders: UnifiedFolder[],
  active: { folderId: string; designId: string } | null
): boolean {
  if (!active) return false;
  const folder = folders.find((f) => f.id === active.folderId);
  if (!folder) return false;
  return folder.designs.some((d) => d.id === active.designId);
}

/**
 * Hook to fetch all folders with their designs
 */
export function useArchiveFolders() {
  const { isAuthenticate: isLoggedIn } = useAuthSession();
  const queryClient = useQueryClient();

  // API-based queries for logged-in users
  const foldersQuery = useFolders({
    options: { limit: 100, page: 1 },
    config: { enabled: isLoggedIn } as never,
  });

  const canvasesQuery = useCanvass({
    options: { limit: 1000, page: 1 },
    config: { enabled: isLoggedIn } as never,
  });

  // LocalStorage query for non-logged-in users
  const localQuery = useQuery({
    queryKey: ['archive-local'],
    queryFn: (): UnifiedFolder[] => {
      const data = readArchive();
      return data.folders.map(folder => ({
        id: folder.id,
        name: folder.name,
        designs: folder.designs.map(design => ({
          id: design.id,
          name: design.name,
          updatedAt: design.updatedAt,
          elements: design.elements
        }))
      }));
    },
    enabled: !isLoggedIn,
  });

  // Transform API data to unified format
  const transformedData =
    isLoggedIn && foldersQuery.data?.data
      ? unifyApiFoldersWithCanvases(foldersQuery.data.data, canvasesQuery.data?.data)
      : localQuery.data || [];

  return {
    data: transformedData,
    isLoading: isLoggedIn ? (foldersQuery.isLoading || canvasesQuery.isLoading) : localQuery.isLoading,
    isError: isLoggedIn ? (foldersQuery.isError || canvasesQuery.isError) : localQuery.isError,
    error: isLoggedIn ? (foldersQuery.error || canvasesQuery.error) : localQuery.error,
    refetch: () => {
      if (isLoggedIn) {
        foldersQuery.refetch();
        return canvasesQuery.refetch();
      } else {
        return localQuery.refetch();
      }
    },
    /** Refetch and return fresh unified folders (for save flow before update vs create). */
    refetchUnified: async (): Promise<UnifiedFolder[]> => {
      if (isLoggedIn) {
        const [fRes, cRes] = await Promise.all([foldersQuery.refetch(), canvasesQuery.refetch()]);
        return unifyApiFoldersWithCanvases(fRes.data?.data, cRes.data?.data);
      }
      const r = await localQuery.refetch();
      return r.data ?? [];
    },
  };
}

/**
 * Hook to create a folder
 */
export function useCreateArchiveFolder() {
  const { isAuthenticate: isLoggedIn } = useAuthSession();
  const queryClient = useQueryClient();
  const apiCreate = useCreateFolder({
    config: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/excali-folders'] });
        queryClient.invalidateQueries({ queryKey: ['/excali-canvas'] });
      }
    }
  });

  // Local storage mutation
  const localCreate = useMutation({
    mutationFn: (name: string) => {
      const folder = addLocalFolder(name);
      return Promise.resolve(folder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archive-local'] });
    }
  });

  const mutateAsync = async (name: string): Promise<{ id: string }> => {
    if (isLoggedIn) {
      const res = await apiCreate.mutateAsync({ name });
      if (!res?.success || res.data == null) {
        throw new Error(res?.message ?? "Failed to create project");
      }
      return { id: String(res.data.id) };
    }
    const folder = await localCreate.mutateAsync(name);
    return { id: folder.id };
  };

  return {
    mutate: (name: string) => {
      if (isLoggedIn) {
        apiCreate.mutate({ name });
      } else {
        localCreate.mutate(name);
      }
    },
    mutateAsync,
    isPending: isLoggedIn ? apiCreate.isPending : localCreate.isPending,
    isSuccess: isLoggedIn ? apiCreate.isSuccess : localCreate.isSuccess,
    isError: isLoggedIn ? apiCreate.isError : localCreate.isError,
  };
}

/**
 * Rename a folder (cloud or local archive).
 */
export function useUpdateArchiveFolder() {
  const { isAuthenticate: isLoggedIn } = useAuthSession();
  const queryClient = useQueryClient();
  const apiUpdate = useUpdateFolder({
    config: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/excali-folders"] });
        queryClient.invalidateQueries({ queryKey: ["/excali-canvas"] });
      },
    },
  });

  const localRename = useMutation({
    mutationFn: ({ folderId, name }: { folderId: string; name: string }) => {
      renameLocalFolder(folderId, name);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archive-local"] });
    },
  });

  return {
    mutate: ({ folderId, name }: { folderId: string; name: string }) => {
      if (isLoggedIn) {
        apiUpdate.mutate({
          id: folderId,
          data: { name },
        });
      } else {
        localRename.mutate({ folderId, name });
      }
    },
    isPending: isLoggedIn ? apiUpdate.isPending : localRename.isPending,
    isSuccess: isLoggedIn ? apiUpdate.isSuccess : localRename.isSuccess,
    isError: isLoggedIn ? apiUpdate.isError : localRename.isError,
  };
}

/**
 * Hook to delete a folder
 */
export function useDeleteArchiveFolder() {
  const { isAuthenticate: isLoggedIn } = useAuthSession();
  const queryClient = useQueryClient();
  const apiDelete = useDeleteFolder({
    config: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/excali-folders'] });
        queryClient.invalidateQueries({ queryKey: ['/excali-canvas'] });
      }
    }
  });

  // Local storage mutation
  const localDelete = useMutation({
    mutationFn: (folderId: string) => {
      removeLocalFolder(folderId);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archive-local'] });
    }
  });

  return {
    mutate: (folderId: string) => {
      if (isLoggedIn) {
        apiDelete.mutate(folderId);
      } else {
        localDelete.mutate(folderId);
      }
    },
    isPending: isLoggedIn ? apiDelete.isPending : localDelete.isPending,
    isSuccess: isLoggedIn ? apiDelete.isSuccess : localDelete.isSuccess,
    isError: isLoggedIn ? apiDelete.isError : localDelete.isError,
  };
}

/**
 * Hook to create/save a canvas (design)
 */
export function useCreateArchiveCanvas() {
  const { isAuthenticate: isLoggedIn } = useAuthSession();
  const queryClient = useQueryClient();
  const apiCreate = useCreateCanvas({
    config: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/excali-folders'] });
        queryClient.invalidateQueries({ queryKey: ['/excali-canvas'] });
      }
    }
  });

  // Local storage mutation
  const localCreate = useMutation({
    mutationFn: ({ folderId, name, elements }: { folderId: string; name: string; elements: DrawElement[] }) => {
      const design = addLocalDesign(folderId, name, elements);
      return Promise.resolve(design);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archive-local'] });
    }
  });

  const mutateAsync = async (params: {
    folderId: string;
    name: string;
    elements: DrawElement[];
  }): Promise<ActiveArchiveDiagram> => {
    if (isLoggedIn) {
      const canvasData: ICanvasCreate = {
        folderId: Number(params.folderId),
        name: params.name,
        canvasData: params.elements,
      };
      const res = await apiCreate.mutateAsync(canvasData);
      if (!res?.success || res.data == null) {
        throw new Error(res?.message ?? "Failed to save diagram");
      }
      return {
        folderId: String(res.data.folderId),
        designId: String(res.data.id),
        name: res.data.name,
      };
    }
    const design = await localCreate.mutateAsync(params);
    if (!design) {
      throw new Error("Failed to save diagram");
    }
    return {
      folderId: params.folderId,
      designId: design.id,
      name: design.name,
    };
  };

  return {
    mutate: ({ folderId, name, elements }: { folderId: string; name: string; elements: DrawElement[] }) => {
      if (isLoggedIn) {
        const canvasData: ICanvasCreate = {
          folderId: Number(folderId),
          name,
          canvasData: elements,
        };
        apiCreate.mutate(canvasData);
      } else {
        localCreate.mutate({ folderId, name, elements });
      }
    },
    mutateAsync,
    isPending: isLoggedIn ? apiCreate.isPending : localCreate.isPending,
    isSuccess: isLoggedIn ? apiCreate.isSuccess : localCreate.isSuccess,
    isError: isLoggedIn ? apiCreate.isError : localCreate.isError,
  };
}

/**
 * Hook to update a canvas (design)
 */
type ArchiveCanvasUpdateParams = {
  folderId: string;
  canvasId: string;
  name: string;
  elements: DrawElement[];
  /** When set, canvas is moved to this folder (API + local). */
  targetFolderId?: string;
};

export function useUpdateArchiveCanvas() {
  const { isAuthenticate: isLoggedIn } = useAuthSession();
  const queryClient = useQueryClient();
  const apiUpdate = useUpdateCanvas({
    config: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/excali-folders'] });
        queryClient.invalidateQueries({ queryKey: ['/excali-canvas'] });
      }
    }
  });

  // Local storage mutation
  const localUpdate = useMutation({
    mutationFn: (params: ArchiveCanvasUpdateParams) => {
      const success = applyLocalCanvasUpdate({
        sourceFolderId: params.folderId,
        canvasId: params.canvasId,
        name: params.name,
        elements: params.elements,
        targetFolderId: params.targetFolderId,
      });
      return Promise.resolve(success);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archive-local'] });
    }
  });

  const mutate = ({
    folderId,
    canvasId,
    name,
    elements,
    targetFolderId,
  }: ArchiveCanvasUpdateParams): void => {
    const destFolderId = targetFolderId ?? folderId;
    if (isLoggedIn) {
      apiUpdate.mutate({
        id: canvasId,
        data: {
          folderId: Number(destFolderId),
          name,
          canvasData: elements
        }
      });
    } else {
      localUpdate.mutate({ folderId, canvasId, name, elements, targetFolderId });
    }
  };

  const mutateAsync = async ({
    folderId,
    canvasId,
    name,
    elements,
    targetFolderId,
  }: ArchiveCanvasUpdateParams): Promise<unknown> => {
    const destFolderId = targetFolderId ?? folderId;
    if (isLoggedIn) {
      return apiUpdate.mutateAsync({
        id: canvasId,
        data: {
          folderId: Number(destFolderId),
          name,
          canvasData: elements
        }
      });
    }
    return localUpdate.mutateAsync({ folderId, canvasId, name, elements, targetFolderId });
  };

  return {
    mutate,
    mutateAsync,
    isPending: isLoggedIn ? apiUpdate.isPending : localUpdate.isPending,
    isSuccess: isLoggedIn ? apiUpdate.isSuccess : localUpdate.isSuccess,
    isError: isLoggedIn ? apiUpdate.isError : localUpdate.isError,
  };
}

/**
 * Hook to delete a canvas (design)
 */
export function useDeleteArchiveCanvas() {
  const { isAuthenticate: isLoggedIn } = useAuthSession();
  const queryClient = useQueryClient();
  const apiDelete = useDeleteCanvas({
    config: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/excali-folders'] });
        queryClient.invalidateQueries({ queryKey: ['/excali-canvas'] });
      }
    }
  });

  // Local storage mutation
  const localDelete = useMutation({
    mutationFn: ({ folderId, designId }: { folderId: string; designId: string }) => {
      removeLocalDesign(folderId, designId);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archive-local'] });
    }
  });

  return {
    mutate: ({ folderId, canvasId }: { folderId: string; canvasId: string }) => {
      if (isLoggedIn) {
        apiDelete.mutate(canvasId);
      } else {
        localDelete.mutate({ folderId, designId: canvasId });
      }
    },
    isPending: isLoggedIn ? apiDelete.isPending : localDelete.isPending,
    isSuccess: isLoggedIn ? apiDelete.isSuccess : localDelete.isSuccess,
    isError: isLoggedIn ? apiDelete.isError : localDelete.isError,
  };
}

/**
 * Utility to check if canvas data has changed
 */
export function hasCanvasChanged(
  oldElements: DrawElement[],
  newElements: DrawElement[]
): boolean {
  return JSON.stringify(oldElements) !== JSON.stringify(newElements);
}
