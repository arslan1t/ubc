'use client';

import { useEffect, useRef } from 'react';

interface Props {
  value: { latitude: number; longitude: number } | null;
  onChange: (coords: { latitude: number; longitude: number }) => void;
}

const TASHKENT: [number, number] = [41.2995, 69.2401];

export function CourtLocationPicker({ value, onChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const placemark = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
    const scriptId = 'yandex-maps-script';
    let cancelled = false;

    const setPoint = (coords: [number, number]) => {
      if (!placemark.current) {
        placemark.current = new window.ymaps.Placemark(
          coords,
          {},
          { preset: 'islands#redCircleDotIcon', draggable: true },
        );
        placemark.current.events.add('dragend', () => {
          const c = placemark.current.geometry.getCoordinates();
          onChangeRef.current({ latitude: c[0], longitude: c[1] });
        });
        mapInstance.current.geoObjects.add(placemark.current);
      } else {
        placemark.current.geometry.setCoordinates(coords);
      }
    };

    const build = () => {
      if (cancelled || !mapRef.current || mapInstance.current) return;
      mapRef.current.innerHTML = '';
      const center = value ? [value.latitude, value.longitude] : TASHKENT;
      const map = new window.ymaps.Map(mapRef.current, {
        center,
        zoom: value ? 15 : 11,
        controls: ['zoomControl', 'geolocationControl', 'searchControl'],
      });
      mapInstance.current = map;
      if (value) setPoint([value.latitude, value.longitude]);

      map.events.add('click', (e: any) => {
        const coords = e.get('coords') as [number, number];
        setPoint(coords);
        onChangeRef.current({ latitude: coords[0], longitude: coords[1] });
      });
    };

    const init = () => {
      if (cancelled) return;
      window.ymaps.ready(build);
    };

    if (window.ymaps) init();
    else if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
      s.async = true;
      s.onload = init;
      document.head.appendChild(s);
    } else {
      const t = setInterval(() => {
        if (window.ymaps) {
          clearInterval(t);
          init();
        }
      }, 100);
    }

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
        placemark.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-2">
      <div
        ref={mapRef}
        className="w-full h-64 rounded-xl overflow-hidden border border-border bg-secondary/30 flex items-center justify-center"
      >
        <p className="text-sm text-muted-foreground">Загрузка карты...</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Нажми на карту, чтобы отметить точку корта
        {value && ` · ${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`}
      </p>
    </div>
  );
}
