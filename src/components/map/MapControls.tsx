import React from 'react';

export type MapLayer = 'POLITICAL' | 'MILITARY' | 'ECONOMIC' | 'CYBER' | 'WEATHER' | 'PROPAGANDA';

interface MapControlsProps {
  activeLayer: MapLayer;
  setActiveLayer: (layer: MapLayer) => void;
}

export default function MapControls({
  activeLayer,
  setActiveLayer,
}: MapControlsProps) {
  const layers: MapLayer[] = ['POLITICAL', 'MILITARY', 'ECONOMIC', 'CYBER', 'WEATHER', 'PROPAGANDA'];

  return (
    <div className="w-full bg-[#040804] border-b border-[#1a3a1a] h-9 p-1 flex justify-between items-center text-[10px] font-mono shrink-0 select-none">
      {/* Information Header */}
      <div className="flex gap-1 items-center pl-1 font-bold text-gray-500">
        <span>📶 SYSTEM DATA LAYERS</span>
      </div>

      {/* Layer Toggles */}
      <div className="flex gap-1 items-center overflow-x-auto">
        <span className="text-gray-500 font-bold uppercase mr-1">DATA LAYER:</span>
        {layers.map((lay) => (
          <button
            key={lay}
            onClick={() => setActiveLayer(lay)}
            className={`px-2 py-1 border border-[#1a3a1a] text-[9px] uppercase tracking-wider cursor-pointer transition-all ${
              activeLayer === lay
                ? 'bg-[#1a4a1a] text-[#00ff44] font-bold border-[#00ff44] text-shadow-sm'
                : 'text-gray-400 hover:bg-[#081508]'
            }`}
          >
            {lay}
          </button>
        ))}
      </div>
    </div>
  );
}

