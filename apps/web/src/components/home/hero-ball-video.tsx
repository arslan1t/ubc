'use client';

export function HeroBallVideo() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster="/hero-poster.jpg"
      onCanPlay={(e) => {
        e.currentTarget.playbackRate = 0.5;
      }}
      className="absolute inset-0 w-full h-full object-cover object-center"
    >
      <source src="/hero-video.mp4" type="video/mp4" />
    </video>
  );
}
