import React, { useEffect } from 'react';
import { useNuclearStore } from '../../store/nuclearStore';

export const WhiteFlashOverlay: React.FC = () => {
  const flashOpacity = useNuclearStore((state) => state.flashOpacity);
  const decrementFlash = useNuclearStore((state) => state.decrementFlash);

  useEffect(() => {
    if (flashOpacity <= 0) return;

    let lastTime = performance.now();
    let id: number;

    const decay = (now: number) => {
      // Decay rate: decay 1.0 down to 0.0 over 300ms
      // delta time in milliseconds / 300ms = percentage representing step size
      const elapsed = now - lastTime;
      lastTime = now;

      const step = elapsed / 300;
      decrementFlash(step);

      if (useNuclearStore.getState().flashOpacity > 0) {
        id = requestAnimationFrame(decay);
      }
    };

    id = requestAnimationFrame(decay);
    return () => cancelAnimationFrame(id);
  }, [flashOpacity, decrementFlash]);

  if (flashOpacity <= 0) return null;

  return (
    <div
      id="nuclear-flash-overlay"
      className="fixed inset-0 bg-white pointer-events-none transition-opacity"
      style={{
        zIndex: 9999,
        opacity: flashOpacity,
        mixBlendMode: 'normal',
      }}
    />
  );
};

export default WhiteFlashOverlay;
