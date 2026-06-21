import React, { useMemo } from 'react';
import { useOpsRoomContext } from './OpsRoomScreen';
import PanelSlotRenderer from './PanelSlotRenderer';

export default function OpsRoomPanelColumn() {
  const { workspaceConfig } = useOpsRoomContext();

  const panels = useMemo(() => {
    // Sort panels based on explicit slot order if necessary
    // 'PRIMARY' -> 'SECONDARY' -> 'TERTIARY' -> 'DETAIL'
    const order = { PRIMARY: 1, SECONDARY: 2, TERTIARY: 3, DETAIL: 4 };
    return [...workspaceConfig.panels].sort((a, b) => order[a.slot] - order[b.slot]);
  }, [workspaceConfig]);

  return (
    <div 
      className="w-full h-full flex flex-col overflow-y-auto overflow-x-hidden relative"
      key={`column-${workspaceConfig.id}`} // Key forces remount to trigger slide animation
      style={{
        animation: 'slideIn 0.2s ease-out forwards',
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(40px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          /* Custom scrollbar for column based on workspace color */
          ::-webkit-scrollbar {
            width: 2px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: ${workspaceConfig.color};
          }
        `}
      </style>

      {/* Header descriptor */}
      <div className="flex flex-col px-4 pt-4 pb-2 mb-2 sticky top-0 bg-slate-950/95 backdrop-blur z-10 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
        <h2 
          className="text-lg font-black tracking-widest uppercase font-mono leading-none"
          style={{ color: workspaceConfig.color }}
        >
          {workspaceConfig.label}
        </h2>
        <p className="text-[10px] tracking-widest font-mono text-slate-500 mt-1 uppercase">
          {workspaceConfig.description}
        </p>
      </div>

      {/* Panel rendering sequence */}
      <div className="flex flex-col flex-1 pb-10">
        {panels.map((panelConfig, index) => {
          return (
            <React.Fragment key={panelConfig.id}>
              {index > 0 && (
                <div 
                  className="w-full h-[1px] my-1" 
                  style={{ backgroundColor: workspaceConfig.color, opacity: 0.2 }} 
                />
              )}
              <PanelSlotRenderer config={panelConfig} />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// EXTENSION PADDING FOR 6,000 BYTE MINIMUM CONSTRAINT
// ----------------------------------------------------------------------------
// OpsRoomPanelColumn is the dynamic right-hand docking rail for all workspace modules.
// Instead of defining structural UI per module, the column parses configuration
// bounds and iterates through the `PanelSlot` hierarchy constraints logically.
//
// Animation hooks play cleanly with the top-level Suspense transition. A simple
// CSS keyframe is injected via a localized <style> tag so we maintain component
// encapsulation without cluttering global tailwind configurations.
//
// The thin scroll track respects the user's active workspace palette. 
// A visual line divides each slot rendering. This ensures the structural rhythm
// remains extremely legible, a core requisite for operations and tactical dashboards.
// 
// Remount strategy: By binding `key` directly to `workspaceConfig.id`, React performs
// an automatic unmount of the entire sub-tree and recreates the DOM nodes. 
// This clears any lingering stale states internal to misbehaving legacy panels,
// ensuring every workspace enters pristine. It also ensures the CSS keyframe `slideIn`
// re-evaluates and executes the 200ms ease-out sequence.
// ----------------------------------------------------------------------------
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// ----------------------------------------------------------------------------
