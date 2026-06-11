import React, { CSSProperties } from 'react';

interface GlowSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  unit?: string;
  color?: 'green' | 'amber' | 'red' | 'cyan';
}

export default function GlowSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = '',
  color = 'green',
}: GlowSliderProps) {
  const percentage = max - min > 0 ? ((value - min) / (max - min)) * 100 : 0;

  const colorClasses = {
    green: 'text-phosphor-green',
    amber: 'text-phosphor-amber',
    red: 'text-phosphor-red',
    cyan: 'text-phosphor-cyan',
  };

  const textStyle = colorClasses[color] || 'text-phosphor-green';

  return (
    <div className="flex flex-col gap-1 w-full text-xs py-1">
      <div className="flex justify-between items-center text-[10px] tracking-wider uppercase font-bold">
        <span className={textStyle}>{label}</span>
        <span className="font-mono text-white text-shadow-sm">
          {value}
          {unit}
        </span>
      </div>
      <div className="flex items-center w-full">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="sovereign-slider w-full cursor-pointer"
          style={{ '--value-pct': `${percentage}%` } as CSSProperties}
        />
      </div>
    </div>
  );
}
