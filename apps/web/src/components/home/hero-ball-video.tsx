'use client';

export function HeroBallVideo() {
  return (
    <div
      className="hidden md:block absolute right-[2%] top-1/2 -translate-y-1/2 pointer-events-none z-0"
      style={{ width: 'clamp(220px, 28vw, 460px)', aspectRatio: '1 / 1' }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-poster.jpg"
        onCanPlay={(e) => {
          e.currentTarget.playbackRate = 0.5;
        }}
        className="w-full h-full object-contain"
        style={{
          maskImage: 'radial-gradient(circle, black 58%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle, black 58%, transparent 80%)',
          opacity: 0.85,
        }}
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
