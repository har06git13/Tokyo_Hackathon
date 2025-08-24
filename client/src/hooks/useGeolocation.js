import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { deviceLocationAtom, geolocationErrorAtom } from '../atoms/playerAtoms';
const DEFAULT_OPTIONS = { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 };

export const useGeolocation = (enable = true, options = DEFAULT_OPTIONS) => {
  const [, setDeviceLocation] = useAtom(deviceLocationAtom);
  const [, setGeoError] = useAtom(geolocationErrorAtom);
  const watchIdRef = useRef(null);
  const optionsRef = useRef(options);
  const retryRef = useRef({ count: 0, timer: null });

  // keep latest options without retriggering the geolocation subscription
  useEffect(() => {
    optionsRef.current = options || DEFAULT_OPTIONS;
  }, [options]);

  const clearRetry = () => {
    if (retryRef.current.timer) {
      clearTimeout(retryRef.current.timer);
      retryRef.current.timer = null;
      retryRef.current.count = 0;
    }
  };

  const startWatch = () => {
    try {
      if (watchIdRef.current !== null && navigator?.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    } catch (e) {}

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        console.debug('[useGeolocation] watchPosition update', { latitude, longitude, accuracy, timestamp: pos.timestamp });
        setDeviceLocation({ lat: latitude, lng: longitude, accuracy, timestamp: pos.timestamp });
        setGeoError(null);
        clearRetry();
      },
      (err) => {
        console.debug('[useGeolocation] watchPosition error', err);
        const msg = err?.message || 'Geolocation error';
        setGeoError(msg);

        // Don't retry on permission denied
        const isPermissionDenied = err && (err.code === 1 || (err.message && /permission/i.test(err.message)) );
        if (isPermissionDenied) {
          console.debug('[useGeolocation] permission denied - not retrying');
          return;
        }

        // For transient errors (位置不明など), schedule a re-attempt with backoff
        const maxRetries = 5;
        if (retryRef.current.count >= maxRetries) {
          console.debug('[useGeolocation] reached max retries for position');
          return;
        }
        retryRef.current.count += 1;
        const backoff = 1000 * Math.pow(2, retryRef.current.count - 1); // 1s,2s,4s,...
        console.debug('[useGeolocation] scheduling retry', { attempt: retryRef.current.count, backoff });
        retryRef.current.timer = setTimeout(() => {
          retryRef.current.timer = null;
          // try getCurrentPosition once with increased timeout
          try {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                console.debug('[useGeolocation] retry getCurrentPosition success', { latitude, longitude, accuracy, timestamp: pos.timestamp });
                setDeviceLocation({ lat: latitude, lng: longitude, accuracy, timestamp: pos.timestamp });
                setGeoError(null);
                // restart watch to ensure continuous updates
                try { startWatch(); } catch (e) { console.debug('[useGeolocation] startWatch error after retry', e); }
              },
              (e2) => {
                console.debug('[useGeolocation] retry getCurrentPosition failed', e2);
                setGeoError(e2?.message || 'Geolocation retry error');
                // will schedule next retry from watchPosition error handler if still failing
              },
              { ...optionsRef.current, timeout: Math.min(60000, optionsRef.current.timeout * 2) }
            );
          } catch (e) {
            console.debug('[useGeolocation] getCurrentPosition throw during retry', e);
          }
        }, backoff);
      },
      optionsRef.current
    );
  };

  useEffect(() => {
    if (!enable || typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setGeoError('Geolocation not available');
      return;
    }

    // initial getCurrentPosition to prompt permission and seed location
    try {
      console.debug('[useGeolocation] requesting initial currentPosition', optionsRef.current);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          console.debug('[useGeolocation] getCurrentPosition success', { latitude, longitude, accuracy, timestamp: pos.timestamp });
          setDeviceLocation({ lat: latitude, lng: longitude, accuracy, timestamp: pos.timestamp });
          setGeoError(null);
        },
        (err) => {
          console.debug('[useGeolocation] getCurrentPosition error', err);
          setGeoError(err?.message || 'Geolocation error');
        },
        optionsRef.current
      );
    } catch (e) {
      // ignore thrown errors
    }

    console.debug('[useGeolocation] starting watchPosition', optionsRef.current);
    startWatch();

    return () => {
      clearRetry();
      if (watchIdRef.current !== null && navigator?.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enable, setDeviceLocation, setGeoError]);
};
