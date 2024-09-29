import { useEffect } from 'react';
import { useWakeLock as useScreenWakeLock } from 'react-screen-wake-lock';

export const useWakeLock = () => {
  const { isSupported, released, request, release } = useScreenWakeLock({
    onRequest: () => console.log('Screen Wake Lock: requested!'),
    onError: () => console.log('An error happened 💥'),
    onRelease: () => console.log('Screen Wake Lock: released!'),
  });

  useEffect(() => {
    if (isSupported && !released) {
      request();
    }

    return () => {
      release();
    };
  }, [isSupported, released, request, release]);
};