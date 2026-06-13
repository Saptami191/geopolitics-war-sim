import React from 'react';
import { useAnimatedValue } from '../../hooks/useAnimatedValue';

interface AnimatedValueProps {
  id?: string;
  target: number;
  duration?: number;
  formatter?: (val: number) => string;
  className?: string;
}

export default function AnimatedValue({
  id,
  target,
  duration = 400,
  formatter,
  className = '',
}: AnimatedValueProps) {
  const { displayValue, direction, flashKey } = useAnimatedValue(target, duration, formatter);

  const getFlashClass = () => {
    if (direction === 'up') return 'value-up';
    if (direction === 'down') return 'value-down';
    return '';
  };

  const flashClass = getFlashClass();

  return (
    <span
      id={id}
      key={`${direction}-${flashKey}`}
      className={`${className} ${flashClass} inline-block transition-colors duration-300`}
    >
      {displayValue}
    </span>
  );
}
