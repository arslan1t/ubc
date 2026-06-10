'use client';

import { useEffect, useRef } from 'react';

interface Court {
  id: string;
  name: string;
  address: string;
  slug: string;
  latitude: number;
  longitude: number;
  isFree: boolean;
  rating: number;
}

interface YandexMapProps {
  courts: Court[];
  center?: [number, number];
  zoom?: number;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export function YandexMap({
  courts,
  center = [41.2995, 69.2401],
  zoom = 11,
}: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
    const scriptId = 'yandex-maps-script';
    let cancelled = false;

    const buildMap = () => {
      // Double-check: cancelled by cleanup or container gone or map already exists
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      // Clear any residual Yandex DOM left by a previous destroyed instance
      mapRef.current.innerHTML = '';

      const map = new window.ymaps.Map(mapRef.current, {
        center,
        zoom,
        controls: ['zoomControl', 'geolocationControl'],
      });

      if (cancelled) {
        map.destroy();
        return;
      }

      mapInstanceRef.current = map;

      courts.forEach((court) => {
        const placemark = new window.ymaps.Placemark(
          [court.latitude, court.longitude],
          {
            balloonContentHeader: `<strong>${court.name}</strong>`,
            balloonContentBody: `
              <p style="margin:4px 0;color:#888;font-size:12px;">${court.address}</p>
              ${court.isFree
                ? '<span style="color:#4ade80;font-size:12px;">● Бесплатный</span>'
                : '<span style="color:#facc15;font-size:12px;">● Платный</span>'}
              <br/><a href="/courts/${court.slug}" style="color:#C9A227;font-size:12px;">Подробнее →</a>
            `,
            hintContent: court.name,
          },
          {
            preset: court.isFree
              ? 'islands#greenCircleDotIcon'
              : 'islands#orangeCircleDotIcon',
          },
        );
        map.geoObjects.add(placemark);
      });

      // Авто-подгонка: показать все маркеры
      if (courts.length > 1) {
        const bounds = map.geoObjects.getBounds();
        if (bounds) {
          map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 60 });
        }
      } else if (courts.length === 1) {
        map.setCenter([courts[0].latitude, courts[0].longitude], 16);
      }
    };

    const initMap = () => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;
      window.ymaps.ready(buildMap);
    };

    if (window.ymaps) {
      initMap();
    } else if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.ymaps) {
          clearInterval(interval);
          initMap();
        }
      }, 100);
    }

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [courts, center, zoom]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full bg-secondary/30 flex items-center justify-center"
    >
      <p className="text-muted-foreground text-sm">Загрузка карты...</p>
    </div>
  );
}
