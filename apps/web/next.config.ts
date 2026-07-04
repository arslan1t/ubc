import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    // Local, repo-controlled SVG icons (not user-uploaded) — safe to allow.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Images are already optimally processed server-side by Sharp (q85-90,
    // 4:4:4). Allow the high qualities so next/image doesn't force a lossy
    // second pass at the default 75 — that double-compression is what made
    // uploaded photos look muddy.
    qualities: [75, 85, 90, 100],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  transpilePackages: ['@ubc/shared'],
};

export default nextConfig;
