import { useCanvass, useCreateCanvas, useDeleteCanvas, useUpdateCanvas } from "@/@api/canvas/hooks";
import { ICanvasCreate } from "@/@api/canvas/interfaces";
import { useCreateFolder, useDeleteFolder, useFolders } from "@/@api/folder/hooks";
import { IFolderCreate } from "@/@api/folder/interfaces";
import { addDesign as addLocalDesign, addFolder as addLocalFolder, readArchive, removeDesign as removeLocalDesign, removeFolder as removeLocalFolder, updateDesign as updateLocalDesign } from "@/helper/archiveStorage";
import type { DrawElement } from "@/types";
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

/**
 * Hook to fetch all folders with their designs
 */
export function useArchiveFolders() {
  const { isAuthenticate: isLoggedIn } = useAuthSession();
  const queryClient = useQueryClient();

  // API-based queries for logged-in users
  const foldersQuery = useFolders({
    options: { limit: 100, page: 1 },
    config: { enabled: isLoggedIn }
  });

  const canvasesQuery = useCanvass({
    options: { limit: 1000, page: 1 },
    config: { enabled: isLoggedIn }
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
  const transformedData = isLoggedIn && foldersQuery.data?.data
    ? (() => {
      const folders = foldersQuery.data.data;
      const canvases = canvasesQuery.data?.data || [];

      // Group canvases by folderId
      const canvasByFolder = canvases.reduce((acc, canvas) => {
        const folderId = String(canvas.folderId);
        if (!acc[folderId]) acc[folderId] = [];
        acc[folderId].push({
          id: String(canvas.id),
          name: canvas.name,
          updatedAt: canvas.updatedAt ? new Date(canvas.updatedAt).getTime() : Date.now(),
          elements: canvas.canvasData || []
        });
        return acc;
      }, {} as Record<string, UnifiedDesign[]>);

      return folders.map(folder => ({
        id: String(folder.id),
        name: folder.name,
        designs: canvasByFolder[String(folder.id)] || []
      }));
    })()
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
    }
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

  return {
    mutate: (name: string) => {
      if (isLoggedIn) {
        // Only send name when creating a folder, not canvases
        apiCreate.mutate({ name } as IFolderCreate);
      } else {
        localCreate.mutate(name);
      }
    },
    isPending: isLoggedIn ? apiCreate.isPending : localCreate.isPending,
    isSuccess: isLoggedIn ? apiCreate.isSuccess : localCreate.isSuccess,
    isError: isLoggedIn ? apiCreate.isError : localCreate.isError,
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

  return {
    mutate: ({ folderId, name, elements }: { folderId: string; name: string; elements: DrawElement[] }) => {
      if (isLoggedIn) {
        const canvasData: ICanvasCreate = {
          folderId: Number(folderId),
          name,
          canvasData: elements
        };
        apiCreate.mutate(canvasData);
      } else {
        localCreate.mutate({ folderId, name, elements });
      }
    },
    isPending: isLoggedIn ? apiCreate.isPending : localCreate.isPending,
    isSuccess: isLoggedIn ? apiCreate.isSuccess : localCreate.isSuccess,
    isError: isLoggedIn ? apiCreate.isError : localCreate.isError,
  };
}

/**
 * Hook to update a canvas (design)
 */
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
    mutationFn: ({ folderId, designId, elements }: { folderId: string; designId: string; elements: DrawElement[] }) => {
      const success = updateLocalDesign(folderId, designId, elements);
      return Promise.resolve(success);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['archive-local'] });
    }
  });

  return {
    mutate: ({
      folderId,
      canvasId,
      name,
      elements
    }: {
      folderId: string;
      canvasId: string;
      name: string;
      elements: DrawElement[]
    }) => {
      if (isLoggedIn) {
        apiUpdate.mutate({
          id: canvasId,
          data: {
            folderId: Number(folderId),
            name,
            canvasData: elements
          }
        });
      } else {
        localUpdate.mutate({ folderId, designId: canvasId, elements });
      }
    },
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
