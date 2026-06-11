import React from 'react';

interface HexGaugeProps {
  label: string;
  value: number; // typically 0 - 100
  color?: 'green' | 'amber' | 'red' | 'cyan';
  size?: number;
}

export default function HexGauge({
  label,
  value,
  color = 'green',
  size = 80,
}: HexGaugeProps) {
  const max = 100;
  const currentVal = Math.min(max, Math.max(0, value));
  const radius = size * 0.38;
  const strokeWidth = size * 0.065;
  const center = size / 2;

  // Arc spans 240 degrees (from 210° to 90° going clockwise = -210deg to 30deg)
  const startAngle = -210 * (Math.PI / 180);
  const endAngle   = 30  * (Math.PI / 180);
  const valueAngle = startAngle + (currentVal / max) * (endAngle - startAngle);

  const arcPath = (start: number, end: number) => {
    const x1 = center + radius * Math.cos(start);
    const y1 = center + radius * Math.sin(start);
    const x2 = center + radius * Math.cos(end);
    const y2 = center + radius * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  // Ticks: 5 major, 20 minor
  const ticks = Array.from({ length: 21 }, (_, i) => {
    const angle = startAngle + (i / 20) * (endAngle - startAngle);
    const isMajor = i % 5 === 0;
    const inner = radius - (isMajor ? strokeWidth * 1.5 : strokeWidth * 0.8);
    return {
      x1: center + inner * Math.cos(angle),
      y1: center + inner * Math.sin(angle),
      x2: center + radius * Math.cos(angle),
      y2: center + radius * Math.sin(angle),
      isMajor,
    };
  });

  const colorMap = {
    green: 'var(--color-green)',
    amber: 'var(--color-amber)',
    red: 'var(--color-red)',
    cyan: 'var(--color-cyan)',
  };

  const activeColor = colorMap[color] || 'var(--color-green)';

  return (
    <div className="flex flex-col items-center select-none">
      <svg width={size} height={size} style={{ overflow: 'visible' }} className="block">
        {/* Background arc — dim track */}
        <path
          d={arcPath(startAngle, endAngle)}
          fill="none"
          stroke="var(--green-900)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Value arc — lit segment */}
        <path
          d={arcPath(startAngle, valueAngle)}
          fill="none"
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${activeColor})` }}
          className="transition-all duration-500 ease-out"
        />

        {/* Ticks representation */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.isMajor ? activeColor : 'var(--green-700)'}
            strokeWidth={t.isMajor ? 1.5 : 0.8}
            opacity={t.isMajor ? 0.95 : 0.4}
          />
        ))}

        {/* Center digit readouts */}
        <text
          x={center}
          y={center + size * 0.08}
          textAnchor="middle"
          fill="var(--color-green-bright)"
          fontSize={size * 0.18}
          fontWeight="bold"
          fontFamily="var(--font-mono)"
          style={{ textShadow: '0 0 5px var(--color-green)' }}
        >
          {Math.round(value)}
        </text>

        {/* Unit detail percent */}
        <text
          x={center + size * 0.18}
          y={center - size * 0.04}
          fill="var(--color-green-mid)"
          fontSize={size * 0.075}
          fontFamily="var(--font-mono)"
        >
          %
        </text>
      </svg>

      {/* Label beneath */}
      <span className="text-[9px] uppercase tracking-widest text-[#00cc33] font-mono text-center font-bold mt-1">
        {label}
      </span>
    </div>
  );
}
