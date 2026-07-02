'use client';

export function HeroBallVideo() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster="/hero-poster.jpg"
      className="absolute inset-0 w-full h-full object-cover object-center"
    >
      <source src="/hero-video.mp4" type="video/mp4" />
    </video>
  );
}
