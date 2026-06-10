import { cn } from '@/lib/utils';

interface UBCLogoProps {
  className?: string;
}

export function UBCLogo({ className }: UBCLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-primary', className)}
    >
      {/* Outer ornamental frame - Uzbek geometric pattern */}
      <g stroke="currentColor" strokeWidth="2.5" fill="none">
        {/* Outer octagonal star frame */}
        <path d="M50 4 L60 14 L73 10 L77 23 L90 27 L86 40 L96 50 L86 60 L90 73 L77 77 L73 90 L60 86 L50 96 L40 86 L27 90 L23 77 L10 73 L14 60 L4 50 L14 40 L10 27 L23 23 L27 10 L40 14 Z" />
        {/* Diamond accents at corners */}
        <rect x="47" y="1" width="6" height="6" transform="rotate(45 50 4)" />
        <rect x="47" y="93" width="6" height="6" transform="rotate(45 50 96)" />
        <rect x="1" y="47" width="6" height="6" transform="rotate(45 4 50)" />
        <rect x="93" y="47" width="6" height="6" transform="rotate(45 96 50)" />
        {/* Inner connecting lines */}
        <path d="M50 18 L62 26 L70 38 L70 62 L62 74 L50 82 L38 74 L30 62 L30 38 L38 26 Z" />
        {/* Basketball circle */}
        <circle cx="50" cy="50" r="18" />
        {/* Basketball seam lines */}
        <path d="M32 50 Q50 42 68 50" />
        <path d="M32 50 Q50 58 68 50" />
        <line x1="50" y1="32" x2="50" y2="68" />
      </g>
    </svg>
  );
}
