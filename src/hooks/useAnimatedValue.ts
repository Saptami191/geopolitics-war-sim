import { useState, useEffect, useRef } from 'react';

type Formatter = (value: number) => string;

export function useAnimatedValue(
  target: number,
  duration = 400,
  formatter: Formatter = (v) => v.toFixed(0)
) {
  const [displayValue, setDisplayValue] = useState<string>(() => formatter(target));
  const [direction, setDirection] = useState<'up' | 'down' | 'none'>('none');
  const [flashKey, setFlashKey] = useState<number>(0); // Trigger re-render of flash animation on change
  
  const currentValRef = useRef<number>(target);
  const startValRef = useRef<number>(target);
  const targetValRef = useRef<number>(target);
  
  const startTimeRef = useRef<number | null>(null);
  const rAFRef = useRef<number | null>(null);
  const formatterRef = useRef<Formatter>(formatter);

  useEffect(() => {
    formatterRef.current = formatter;
  }, [formatter]);

  useEffect(() => {
    // If target is unchanged, do nothing
    if (target === targetValRef.current) {
      return;
    }

    // Determine direction
    const prevTarget = targetValRef.current;
    if (target > prevTarget) {
      setDirection('up');
      setFlashKey((k) => k + 1);
    } else if (target < prevTarget) {
      setDirection('down');
      setFlashKey((k) => k + 1);
    }

    // Cancel in-flight animation
    if (rAFRef.current !== null) {
      cancelAnimationFrame(rAFRef.current);
    }

    // Set up transition
    startValRef.current = currentValRef.current;
    targetValRef.current = target;
    startTimeRef.current = null;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const computedValue = startValRef.current + (targetValRef.current - startValRef.current) * easedProgress;
      currentValRef.current = computedValue;
      setDisplayValue(formatterRef.current(computedValue));

      if (progress < 1) {
        rAFRef.current = requestAnimationFrame(animate);
      } else {
        rAFRef.current = null;
        currentValRef.current = target;
        setDisplayValue(formatterRef.current(target));
        // Reset direction after animation completes
        setDirection('none');
      }
    };

    rAFRef.current = requestAnimationFrame(animate);

    return () => {
      if (rAFRef.current !== null) {
        cancelAnimationFrame(rAFRef.current);
      }
    };
  }, [target, duration]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (rAFRef.current !== null) {
        cancelAnimationFrame(rAFRef.current);
      }
    };
  }, []);

  return { displayValue, direction, flashKey };
}
