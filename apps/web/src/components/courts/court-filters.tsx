'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCallback, useState } from 'react';

const FILTER_OPTIONS = [
  { key: 'type', value: 'INDOOR', label: 'Крытый' },
  { key: 'type', value: 'OUTDOOR', label: 'Открытый' },
  { key: 'isFree', value: 'true', label: 'Бесплатный' },
  { key: 'isFree', value: 'false', label: 'Платный' },
  { key: 'hasLighting', value: 'true', label: 'Освещение' },
];

export function CourtFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get(key) === value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete('page');
      router.push(`/courts?${params.toString()}`);
    },
    [searchParams, router],
  );

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set('search', value);
      else params.delete('search');
      params.delete('page');
      router.push(`/courts?${params.toString()}`);
    },
    [searchParams, router],
  );

  const hasFilters = Array.from(searchParams.keys()).some((k) => k !== 'page');

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск кортов..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(search)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = searchParams.get(opt.key) === opt.value;
          return (
            <button
              key={`${opt.key}-${opt.value}`}
              onClick={() => updateFilter(opt.key, opt.value)}
              className={cn(
                'inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          );
        })}

        {hasFilters && (
          <button
            onClick={() => router.push('/courts')}
            className="inline-flex items-center rounded-md px-3 py-1 text-xs font-medium text-destructive hover:underline"
          >
            Сбросить
          </button>
        )}
      </div>
    </div>
  );
}
