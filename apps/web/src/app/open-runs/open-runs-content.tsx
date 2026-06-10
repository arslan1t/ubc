'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useOpenRuns } from '@/hooks/use-open-runs';
import { OpenRunCard } from '@/components/open-runs/open-run-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

export function OpenRunsPageContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const filters: Record<string, any> = { upcoming: true };
  searchParams.forEach((value, key) => { filters[key] = value; });

  const { data, isLoading } = useOpenRuns(filters);

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
            <span className="text-primary">Open Runs</span>
          </h1>
          <p className="text-muted-foreground">
            Открытые баскетбольные игры для всех
          </p>
        </div>
        {isAuthenticated && (
          <Button asChild variant="gold">
            <Link href="/open-runs/create">
              <Plus className="w-4 h-4 mr-2" />
              Создать
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : data?.data?.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((run: any) => (
              <OpenRunCard key={run.id} run={run} />
            ))}
          </div>
          {data.total > data.data.length && (
            <p className="text-center text-sm text-muted-foreground mt-8">
              Показано {data.data.length} из {data.total}
            </p>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card/30 p-16 text-center">
          <h3 className="font-display font-semibold text-xl mb-2">
            Нет предстоящих Open Runs
          </h3>
          <p className="text-muted-foreground mb-6">
            Будьте первым — создайте игру
          </p>
          {isAuthenticated ? (
            <Button asChild variant="gold">
              <Link href="/open-runs/create">Создать Open Run</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/auth/login">Войдите, чтобы создать</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
