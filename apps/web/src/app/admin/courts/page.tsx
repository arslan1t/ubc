'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ShieldCheck, Search } from 'lucide-react';
import {
  useAdminCourts,
  useCreateCourt,
  useUpdateCourt,
  useDeleteCourt,
  type CourtFormValues,
} from '@/hooks/use-courts';
import { cn } from '@/lib/utils';

const EMPTY_FORM: CourtFormValues = {
  name: '',
  address: '',
  district: '',
  city: 'Ташкент',
  latitude: 41.3111,
  longitude: 69.2797,
  type: 'OUTDOOR',
  surface: 'ASPHALT',
  isFree: true,
  hasLighting: false,
  hasChangingRooms: false,
  hoops: 2,
  description: '',
  isVerified: false,
  isActive: true,
};

function CourtForm({
  initial,
  onCancel,
  onSubmit,
  pending,
}: {
  initial: CourtFormValues;
  onCancel: () => void;
  onSubmit: (values: CourtFormValues) => void;
  pending: boolean;
}) {
  const [values, setValues] = useState(initial);
  const set = <K extends keyof CourtFormValues>(key: K, v: CourtFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(values); }}
      className="rounded-xl border border-border bg-card p-4 space-y-3 mb-4"
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Название *</label>
          <input required value={values.name} onChange={(e) => set('name', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Адрес *</label>
          <input required value={values.address} onChange={(e) => set('address', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Район</label>
          <input value={values.district ?? ''} onChange={(e) => set('district', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Город</label>
          <input value={values.city ?? ''} onChange={(e) => set('city', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Широта *</label>
          <input required type="number" step="any" value={values.latitude}
            onChange={(e) => set('latitude', parseFloat(e.target.value))}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Долгота *</label>
          <input required type="number" step="any" value={values.longitude}
            onChange={(e) => set('longitude', parseFloat(e.target.value))}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Тип</label>
          <select value={values.type} onChange={(e) => set('type', e.target.value as CourtFormValues['type'])}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50">
            <option value="OUTDOOR">Открытая</option>
            <option value="INDOOR">Закрытая</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Покрытие</label>
          <select value={values.surface} onChange={(e) => set('surface', e.target.value as CourtFormValues['surface'])}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50">
            {['HARDWOOD', 'ASPHALT', 'CONCRETE', 'RUBBER', 'OTHER'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Колец</label>
          <input type="number" min={1} max={20} value={values.hoops ?? 2}
            onChange={(e) => set('hoops', parseInt(e.target.value, 10))}
            className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {([
          ['isFree', 'Бесплатно'],
          ['hasLighting', 'Освещение'],
          ['hasChangingRooms', 'Раздевалки'],
          ['isVerified', 'Проверено'],
          ['isActive', 'Активен'],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!values[key]} onChange={(e) => set(key, e.target.checked)} />
            {label}
          </label>
        ))}
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Описание</label>
        <textarea rows={2} value={values.description ?? ''} onChange={(e) => set('description', e.target.value)}
          className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50" />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={pending}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
          {pending ? 'Сохраняем...' : 'Сохранить'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium">
          Отмена
        </button>
      </div>
    </form>
  );
}

export default function AdminCourtsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminCourts(search ? { search } : {});
  const create = useCreateCourt();
  const update = useUpdateCourt();
  const remove = useDeleteCourt();
  const [mode, setMode] = useState<'none' | 'create' | string>('none');

  const courts = data?.data ?? [];
  const editingCourt = typeof mode === 'string' && mode !== 'none' && mode !== 'create'
    ? courts.find((c: any) => c.id === mode)
    : undefined;

  const handleDelete = (court: any) => {
    if (!window.confirm(`Удалить корт "${court.name}"?`)) return;
    remove.mutate(court.id);
  };

  const toggleVerified = (court: any) => {
    update.mutate({ id: court.id, dto: { isVerified: !court.isVerified } });
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl">Корты</h1>
          <p className="text-muted-foreground text-sm mt-1">Управление баскетбольными площадками</p>
        </div>
        {mode === 'none' && (
          <button onClick={() => setMode('create')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
            <Plus className="w-4 h-4" /> Создать
          </button>
        )}
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию или адресу..."
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:border-primary/50"
        />
      </div>

      {mode === 'create' && (
        <CourtForm initial={EMPTY_FORM} pending={create.isPending} onCancel={() => setMode('none')}
          onSubmit={(values) => create.mutate(values, { onSuccess: () => setMode('none') })} />
      )}

      {editingCourt && (
        <CourtForm
          initial={{
            name: editingCourt.name,
            address: editingCourt.address,
            district: editingCourt.district ?? '',
            city: editingCourt.city,
            latitude: editingCourt.latitude,
            longitude: editingCourt.longitude,
            type: editingCourt.type,
            surface: editingCourt.surface,
            isFree: editingCourt.isFree,
            hasLighting: editingCourt.hasLighting,
            hasChangingRooms: editingCourt.hasChangingRooms,
            hoops: editingCourt.hoops,
            description: editingCourt.description ?? '',
            isVerified: editingCourt.isVerified,
            isActive: editingCourt.isActive,
          }}
          pending={update.isPending}
          onCancel={() => setMode('none')}
          onSubmit={(values) => update.mutate({ id: editingCourt.id, dto: values }, { onSuccess: () => setMode('none') })}
        />
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-secondary/40 animate-pulse" />)}
        </div>
      ) : courts.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-12">Кортов пока нет</p>
      ) : (
        <div className="space-y-2">
          {courts.map((court: any) => (
            <div key={court.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate flex items-center gap-1.5">
                  {court.name}
                  {!court.isActive && <span className="text-[10px] text-destructive">(скрыт)</span>}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {court.address} · {court.reviewCount} отзывов
                </div>
              </div>
              <button onClick={() => toggleVerified(court)}
                className={cn('inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  court.isVerified ? 'bg-emerald-500/15 text-emerald-400' : 'bg-secondary/50 text-muted-foreground hover:text-foreground')}>
                <ShieldCheck className="w-3.5 h-3.5" /> {court.isVerified ? 'Проверено' : 'Подтвердить'}
              </button>
              <button onClick={() => setMode(court.id)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => handleDelete(court)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
