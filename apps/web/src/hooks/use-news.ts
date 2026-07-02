import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const newsKeys = {
  all: ['news'] as const,
  list: (filters: any) => [...newsKeys.all, 'list', filters] as const,
  adminList: (filters: any) => [...newsKeys.all, 'admin', filters] as const,
  detail: (slug: string) => [...newsKeys.all, 'detail', slug] as const,
};

export function useNews(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: newsKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get('/news', { params: filters });
      return data;
    },
  });
}

export function useAdminNews(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: newsKeys.adminList(filters),
    queryFn: async () => {
      const { data } = await api.get('/news/admin/all', { params: filters });
      return data;
    },
  });
}

export function useNewsArticleById(id: string) {
  return useQuery({
    queryKey: [...newsKeys.all, 'by-id', id] as const,
    queryFn: async () => {
      const { data } = await api.get(`/news/admin/all`);
      return data.data?.find((a: any) => a.id === id) ?? null;
    },
    enabled: !!id,
  });
}

export function useNewsArticle(slug: string) {
  return useQuery({
    queryKey: newsKeys.detail(slug),
    queryFn: async () => {
      const { data } = await api.get(`/news/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useCreateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: {
      title: string;
      excerpt?: string;
      content: string;
      category: string;
      isPublished: boolean;
    }) => {
      const { data } = await api.post('/news', dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: newsKeys.all });
    },
  });
}

export function useUpdateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dto }: {
      id: string;
      title?: string;
      excerpt?: string;
      content?: string;
      category?: string;
      isPublished?: boolean;
    }) => {
      const { data } = await api.patch(`/news/${id}`, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: newsKeys.all });
    },
  });
}

export function useDeleteNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/news/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: newsKeys.all });
    },
  });
}

export function useUploadNewsCover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post(`/news/${id}/cover`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: newsKeys.all }),
  });
}

export function useAddNewsGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post(`/news/${id}/gallery`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: newsKeys.all }),
  });
}

export function useDeleteNewsGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (imageId: string) => {
      await api.delete(`/news/gallery/${imageId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: newsKeys.all }),
  });
}
