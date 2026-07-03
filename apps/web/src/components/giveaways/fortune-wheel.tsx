'use client';

import { useMemo, useState, useEffect, useRef } from 'react';

const COLORS = [
  'hsl(43 85% 53%)',   // gold
  'hsl(217 60% 45%)',  // blue
  'hsl(0 65% 50%)',    // red
  'hsl(150 50% 40%)',  // green
  'hsl(270 50% 55%)',  // violet
  'hsl(25 80% 50%)',   // orange
];

export interface WheelSegment {
  id: string;
  label: string;
}

/**
 * The draw itself happens on the server (crypto-random); the wheel is the show:
 * it spins ~6s with ease-out and lands exactly on the server-chosen segment.
 */
export function FortuneWheel({
  segments,
  spinning,
  targetIndex,
  onSpinEnd,
  size = 320,
}: {
  segments: WheelSegment[];
  spinning: boolean;
  targetIndex: number | null;
  onSpinEnd?: () => void;
  size?: number;
}) {
  const [rotation, setRotation] = useState(0);
  const [animating, setAnimating] = useState(false);

  const n = Math.max(segments.length, 1);
  const segAngle = 360 / n;
  const r = 150;
  const cx = 160;
  const cy = 160;

  const paths = useMemo(() => {
    if (n === 1) return null;
    return segments.map((seg, i) => {
      const start = (i * segAngle - 90) * (Math.PI / 180);
      const end = ((i + 1) * segAngle - 90) * (Math.PI / 180);
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end);
      const y2 = cy + r * Math.sin(end);
      const largeArc = segAngle > 180 ? 1 : 0;
      const mid = (i * segAngle + segAngle / 2 - 90) * (Math.PI / 180);
      const lx = cx + r * 0.62 * Math.cos(mid);
      const ly = cy + r * 0.62 * Math.sin(mid);
      const labelRotate = i * segAngle + segAngle / 2;
      return {
        d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
        fill: COLORS[i % COLORS.length],
        label: seg.label,
        lx,
        ly,
        labelRotate,
      };
    });
  }, [segments, n, segAngle]);

  // Kick off the animation once when the parent provides the winner index.
  const startedRef = useRef(false);
  useEffect(() => {
    if (!spinning || targetIndex === null || startedRef.current) return;
    startedRef.current = true;
    // Pointer is at the top (12 o'clock). Winner's segment centre must end up there.
    const winnerCentre = targetIndex * segAngle + segAngle / 2;
    const fullTurns = 6 * 360;
    const jitter = (Math.random() - 0.5) * segAngle * 0.6; // land off-centre, feels organic
    const final = fullTurns + (360 - winnerCentre) + jitter;
    setAnimating(true);
    // rAF so the browser paints rotation:0 before the transition starts
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setRotation(final)),
    );
  }, [spinning, targetIndex, segAngle]);

  if (!segments.length) return null;

  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: size }}>
      {/* Pointer */}
      <div className="absolute left-1/2 -top-1 -translate-x-1/2 z-10">
        <div
          className="w-0 h-0"
          style={{
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '20px solid hsl(43 85% 53%)',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
          }}
        />
      </div>

      <svg
        viewBox="0 0 320 320"
        className="w-full h-auto block"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: animating ? 'transform 6s cubic-bezier(0.12, 0.8, 0.16, 1)' : 'none',
        }}
        onTransitionEnd={() => {
          if (animating) {
            setAnimating(false);
            onSpinEnd?.();
          }
        }}
      >
        <circle cx={cx} cy={cy} r={r + 6} fill="hsl(0 0% 10%)" stroke="hsl(43 85% 53% / 0.4)" strokeWidth="2" />
        {n === 1 ? (
          <circle cx={cx} cy={cy} r={r} fill={COLORS[0]} />
        ) : (
          paths!.map((p, i) => <path key={i} d={p.d} fill={p.fill} stroke="hsl(0 0% 8%)" strokeWidth="1.5" />)
        )}
        {n === 1 ? (
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="16" fontWeight="700">
            {segments[0].label}
          </text>
        ) : (
          paths!.map((p, i) => (
            <text
              key={`t-${i}`}
              x={p.lx}
              y={p.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize={n > 16 ? 8 : n > 8 ? 10 : 12}
              fontWeight="700"
              transform={`rotate(${p.labelRotate} ${p.lx} ${p.ly})`}
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
            >
              {p.label.length > 14 ? `${p.label.slice(0, 13)}…` : p.label}
            </text>
          ))
        )}
        <circle cx={cx} cy={cy} r={22} fill="hsl(0 0% 8%)" stroke="hsl(43 85% 53%)" strokeWidth="2" />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="16">
          🏀
        </text>
      </svg>
    </div>
  );
}
