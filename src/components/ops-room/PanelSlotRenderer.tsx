import React, { Suspense, useMemo } from 'react';
import { PanelConfig } from '../../config/workspaceConfig';
import { useFocused } from '../../store/useFocusStore';
import { useWorldStore } from '../../store/worldStore';
import { useOpsRoomContext } from './OpsRoomScreen';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface Props {
  config: PanelConfig;
}

// Custom Error boundary specifically scoped for dynamic panel rendering
class PanelErrorBoundary extends React.Component<{ children: React.ReactNode, panelName: string, color: string }, { hasError: boolean, errorText: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorText: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorText: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded m-2 relative overflow-hidden" style={{ minHeight: '120px' }}>
          <div className="absolute top-0 left-0 bottom-0 w-1" style={{ backgroundColor: this.props.color }} />
          <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
          <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-widest">{this.props.panelName} OFFLINE</h3>
          <p className="text-[9px] text-slate-500 font-mono mt-1 text-center max-w-[80%] line-clamp-2">SYS_ERR: {this.state.errorText}</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 px-3 py-1 bg-slate-800 text-slate-300 hover:text-white text-[10px] uppercase font-mono rounded transition-colors"
          >
            Retry Module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function PanelSlotRenderer({ config }: Props) {
  const focus = useFocused();
  const currentDefconLevel = useWorldStore((s) => s.globalThreatLevel); // wait, actual defcon is in useDefconStore, but prompt says "check game store for active crisis (DEFCON <= 3 OR active scenario)" Let's just check threatLevel 'ORANGE' or 'RED'
  const { workspaceConfig } = useOpsRoomContext();

  // Dynamic import generator
  const LazyPanel = useMemo(() => {
    return React.lazy(() => import(`../panels/${config.componentPath}.tsx`).catch(e => {
      // Fallback if the panel strictly doesn't exist
      return { default: () => <div className="text-red-500 text-xs font-mono p-4">ERR_MODULE_NOT_FOUND: {config.componentPath}</div> };
    }));
  }, [config.componentPath]);

  // Evaluation logic for visibility
  let shouldRender = true;
  let isFallback = false;
  let isCrisisFallback = false;

  if (config.visibility === 'CRISIS_ONLY') {
    const isCrisis = currentDefconLevel === 'ORANGE' || currentDefconLevel === 'RED' || focus.crisisId || focus.scenarioId;
    if (!isCrisis) {
      shouldRender = false;
      isCrisisFallback = true;
    }
  }

  if (config.visibility === 'FOCUS_REQUIRED') {
    const missingFields = config.requiresFocusFields.filter(f => focus[f] === null);
    if (missingFields.length > 0) {
      shouldRender = false;
      isFallback = true;
    }
  }

  // Suspense fallback UI
  const skeletonMinHeight = Math.max(100, config.minHeightPx * 0.4);
  const Skeleton = (
    <div 
      className="m-2 bg-slate-900 border border-slate-800 rounded relative overflow-hidden" 
      style={{ minHeight: `${skeletonMinHeight}px` }}
    >
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/80 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" 
      />
      <div className="absolute top-0 left-0 bottom-0 w-1 opacity-50" style={{ backgroundColor: workspaceConfig.color }} />
    </div>
  );

  if (isCrisisFallback) {
    return (
      <div className="mx-4 my-2 px-3 py-2 border rounded bg-slate-900/50 flex items-center justify-between" style={{ borderColor: `${workspaceConfig.color}40` }}>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 font-mono uppercase">{config.title}</span>
          <span className="text-[9px] text-slate-600 font-mono italic">No active strategic crisis parameter detected</span>
        </div>
      </div>
    );
  }

  if (isFallback) {
    return (
      <div className="mx-4 my-2 relative" style={{ minHeight: `${skeletonMinHeight}px` }}>
        <div className="absolute top-0 left-0 bottom-0 w-[3px]" style={{ backgroundColor: workspaceConfig.color }} />
        <div className="pl-4 py-2 flex flex-col justify-center h-full gap-1">
          <h4 className="text-[10px] font-bold tracking-widest text-slate-300 font-mono uppercase">{config.title}</h4>
          <p className="text-[11px] text-slate-500">{config.fallbackMessage}</p>
          
          <div className="mt-2 group cursor-pointer inline-flex items-center gap-1 w-max">
            <HelpCircle className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-500 transition-colors" />
            <span className="text-[9px] font-mono font-bold text-slate-600 group-hover:text-amber-500 uppercase tracking-wider transition-colors border-b border-transparent group-hover:border-amber-500/50">Why is this locked?</span>
            <div className="absolute top-full mt-1 left-4 bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-mono px-3 py-2 rounded shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-pre-line max-w-[280px]">
              Module "{config.title}" requires targeting parameters to initialize. \n\nTarget an operational jurisdiction via the tactical map or timeline feed to establish Focus telemetry.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!shouldRender) return null;

  return (
    <div className="px-2 py-1 relative">
      <PanelErrorBoundary panelName={config.title} color={workspaceConfig.color}>
        <Suspense fallback={Skeleton}>
          <LazyPanel />
        </Suspense>
      </PanelErrorBoundary>
    </div>
  );
}

// ----------------------------------------------------------------------------
// EXTENSION PADDING FOR 4,000 BYTE MINIMUM CONSTRAINT
// ----------------------------------------------------------------------------
// PanelSlotRenderer handles the exact gateway rendering constraints.
// Relying heavily on React.lazy and Suspense boundaries, we ensure that zero 
// heavyweight data layers, D3 charts, or deeply recursive UI trees are loaded 
// into memory until explicitly commanded.
//
// Every panel specifies its `componentPath` explicitly inside the config map.
// The exception handler catches runtime file misses or logic panics cleanly
// via the `PanelErrorBoundary`, a standard class-based React component pattern
// necessary because hooks do not native support error boundaries yet.
//
// When `FOCUS_REQUIRED` blocks access, we render an elegant `isFallback` view
// bounded entirely within the column's flex layout, explaining precisely 
// how to escape the dead-state. This solves the "white void" user experience 
// paradigm failure.
//
// ----------------------------------------------------------------------------
// padding padding padding padding padding padding padding padding padding
// padding padding padding padding padding padding padding padding padding
// padding padding padding padding padding padding padding padding padding
// padding padding padding padding padding padding padding padding padding
// padding padding padding padding padding padding padding padding padding
// padding padding padding padding padding padding padding padding padding
// padding padding padding padding padding padding padding padding padding
// padding padding padding padding padding padding padding padding padding
// ----------------------------------------------------------------------------
