'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EventApplication } from '@/hooks/use-events';

export function EventApplicationForm({
  onSubmit,
  submitting,
  onCancel,
  initial,
}: {
  onSubmit: (app: EventApplication) => void;
  submitting: boolean;
  onCancel?: () => void;
  initial?: {
    height?: number | null;
    weight?: number | null;
    age?: number | null;
    highlightUrl?: string | null;
    instagram?: string | null;
  } | null;
}) {
  const [height, setHeight] = useState(initial?.height?.toString() ?? '');
  const [weight, setWeight] = useState(initial?.weight?.toString() ?? '');
  const [age, setAge] = useState(initial?.age?.toString() ?? '');
  const [highlightUrl, setHighlightUrl] = useState(initial?.highlightUrl ?? '');
  const [instagram, setInstagram] = useState(initial?.instagram ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!height || !weight || !age) {
      toast.error('Заполни рост, вес и возраст');
      return;
    }
    if (!highlightUrl.trim() && !instagram.trim()) {
      toast.error('Добавь ссылку на видео-хайлайт или свой Instagram');
      return;
    }

    onSubmit({
      height: parseInt(height, 10),
      weight: parseInt(weight, 10),
      age: parseInt(age, 10),
      highlightUrl: highlightUrl.trim() || undefined,
      instagram: instagram.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Рост, см *</Label>
          <Input
            type="number"
            inputMode="numeric"
            min={100}
            max={250}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="185"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Вес, кг *</Label>
          <Input
            type="number"
            inputMode="numeric"
            min={30}
            max={200}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="80"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Возраст *</Label>
          <Input
            type="number"
            inputMode="numeric"
            min={10}
            max={80}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="21"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Видео-хайлайт (ссылка)</Label>
        <Input
          type="url"
          value={highlightUrl}
          onChange={(e) => setHighlightUrl(e.target.value)}
          placeholder="https://youtube.com/... или Instagram Reels"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Instagram</Label>
        <Input
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="@username"
        />
        <p className="text-[11px] text-muted-foreground">
          Нужно хотя бы одно: видео-хайлайт или Instagram — по ним мы оцениваем уровень игры
        </p>
      </div>

      <div className="flex gap-2">
        <Button type="submit" variant="gold" className="flex-1" disabled={submitting}>
          {submitting ? 'Отправляем…' : 'Отправить заявку'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}
