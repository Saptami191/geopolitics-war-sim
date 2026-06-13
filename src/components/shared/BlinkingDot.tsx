import React from 'react';

interface BlinkingDotProps {
  id?: string;
  severity?: 'warning' | 'critical' | 'nominal';
  className?: string;
}

export default function BlinkingDot({ id, severity = 'nominal', className = '' }: BlinkingDotProps) {
  const getSeverityClass = () => {
    if (severity === 'warning') return 'blinking-dot--warning';
    if (severity === 'critical') return 'blinking-dot--critical';
    return '';
  };

  return (
    <span
      id={id}
      className={`blinking-dot ${getSeverityClass()} ${className}`}
      title={severity !== 'nominal' ? `${severity.toUpperCase()} ALERT ACTIVE` : undefined}
    />
  );
}
