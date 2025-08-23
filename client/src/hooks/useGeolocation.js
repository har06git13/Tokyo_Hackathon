import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { deviceLocationAtom, geolocationErrorAtom } from '../atoms/playerAtoms';
const DEFAULT_OPTIONS = { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 };

export const useGeolocation = (enable = true, options = DEFAULT_OPTIONS) => {
  const [, setDeviceLocation] = useAtom(deviceLocationAtom);
  const [, setGeoError] = useAtom(geolocationErrorAtom);
  const watchIdRef = useRef(null);
  const optionsRef = useRef(options);

  // keep latest options without retriggering the geolocation subscription
  useEffect(() => {
    optionsRef.current = options || DEFAULT_OPTIONS;
  }, [options]);

  useEffect(() => {
    if (!enable || typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setGeoError('Geolocation not available');
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setDeviceLocation({ lat: latitude, lng: longitude, accuracy, timestamp: pos.timestamp });
        setGeoError(null);
      },
      (err) => {
        setGeoError(err?.message || 'Geolocation error');
      },
      optionsRef.current
    );
    return () => {
      if (watchIdRef.current !== null && navigator?.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [enable, setDeviceLocation, setGeoError]);
};
