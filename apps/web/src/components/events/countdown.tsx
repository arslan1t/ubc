'use client';

import { useEffect, useState } from 'react';

function getRemaining(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  const clamped = Math.max(0, diff);
  return {
    days: Math.floor(clamped / 86_400_000),
    hours: Math.floor((clamped % 86_400_000) / 3_600_000),
    minutes: Math.floor((clamped % 3_600_000) / 60_000),
    seconds: Math.floor((clamped % 60_000) / 1000),
    done: diff <= 0,
  };
}

export function Countdown({ target, className }: { target: string; className?: string }) {
  const [remaining, setRemaining] = useState(() => getRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (remaining.done) {
    return (
      <div className={className}>
        <span className="font-display font-black text-lg text-primary">Турнир начался</span>
      </div>
    );
  }

  const units = [
    { label: 'дней', value: remaining.days },
    { label: 'час', value: remaining.hours },
    { label: 'мин', value: remaining.minutes },
    { label: 'сек', value: remaining.seconds },
  ];

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className ?? ''}`}>
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center min-w-[44px]">
          <span className="font-display font-black tabular-nums text-2xl sm:text-3xl text-white leading-none">
            {String(unit.value).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-white/40 mt-1">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
