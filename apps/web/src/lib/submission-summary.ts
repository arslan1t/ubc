import type { Submission, SubmissionType } from '@/hooks/use-moderation';

export const SUBMISSION_TYPE_LABEL: Record<SubmissionType, string> = {
  COURT: 'Корт',
  NEWS: 'Новость',
  PHOTO: 'Фото',
  REPORT: 'Жалоба',
  EVENT: 'Событие',
  RESULT: 'Результат',
};

export function payloadSummary(s: Submission): { title: string; lines: string[] } {
  const p = s.payload ?? {};
  switch (s.type) {
    case 'COURT':
      return { title: p.name ?? 'Без названия', lines: [p.address, p.type, p.isFree ? 'Бесплатно' : 'Платный'].filter(Boolean) };
    case 'NEWS':
      return { title: p.title ?? 'Без заголовка', lines: [p.category, p.excerpt].filter(Boolean) };
    case 'REPORT':
      return { title: 'Жалоба', lines: [p.reason, p.message].filter(Boolean) };
    default:
      return { title: SUBMISSION_TYPE_LABEL[s.type], lines: [JSON.stringify(p).slice(0, 120)] };
  }
}
