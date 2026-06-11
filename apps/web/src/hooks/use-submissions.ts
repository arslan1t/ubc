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

export function useMySubmissions() {
  return useQuery<Submission[]>({
    queryKey: ['submissions', 'mine'],
    queryFn: async () => (await api.get('/submissions/mine')).data,
  });
}
