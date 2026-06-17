export type SkillLevel = 'ANY' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export const SKILL_META: Record<SkillLevel, { label: string; short: string; cls: string }> = {
  ANY: { label: 'Любой уровень', short: 'Любой', cls: 'text-muted-foreground bg-secondary' },
  BEGINNER: { label: 'Начинающий', short: 'Новичок', cls: 'text-emerald-400 bg-emerald-400/10' },
  INTERMEDIATE: { label: 'Средний уровень', short: 'Средний', cls: 'text-sky-400 bg-sky-400/10' },
  ADVANCED: { label: 'Продвинутый', short: 'Про', cls: 'text-primary bg-primary/10' },
};

export const SKILL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: 'ANY', label: 'Любой уровень' },
  { value: 'BEGINNER', label: 'Начинающий' },
  { value: 'INTERMEDIATE', label: 'Средний' },
  { value: 'ADVANCED', label: 'Продвинутый' },
];
