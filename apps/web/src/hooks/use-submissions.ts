import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Submission } from '@/hooks/use-moderation';

export interface CreateSubmissionInput {
  type: 'COURT' | 'NEWS' | 'EVENT' | 'PHOTO' | 'REPORT' | 'RESULT';
  payload: Record<string, any>;
  targetType?: string;
  targetId?: string;
}

export function useCreateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubmissionInput) =>
      api.post('/submissions', input).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['submissions', 'mine'] }),
  });
}

export interface SubmissionImage {
  url: string;
  mediumUrl: string;
  thumbnailUrl: string;
  key: string;
}

export function useUploadSubmissionImage() {
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return api
        .post<SubmissionImage>('/submissions/upload-image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    },
  });
}

export function useMySubmissions() {
  return useQuery<Submission[]>({
    queryKey: ['submissions', 'mine'],
    queryFn: async () => (await api.get('/submissions/mine')).data,
  });
}

export function useResubmit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, any> }) =>
      api.patch(`/submissions/${id}/resubmit`, { payload }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['submissions', 'mine'] }),
  });
}
