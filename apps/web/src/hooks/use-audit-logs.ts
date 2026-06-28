import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  method: string;
  path: string;
  statusCode: number;
  metadata: any;
  createdAt: string;
  actor: { firstName: string; lastName: string; role: string } | null;
}

export function useAuditLogs(filters: { page?: number; method?: string } = {}) {
  return useQuery<{ data: AuditLogEntry[]; total: number; page: number; totalPages: number }>({
    queryKey: ['audit-logs', filters],
    queryFn: async () => (await api.get('/audit-logs', { params: filters })).data,
  });
}
