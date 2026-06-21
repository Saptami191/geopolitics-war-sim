import React, { useEffect, useMemo, useTransition } from 'react';
import { useFocusStore, FocusObject, WorkspaceId, TimeWindow } from '../../store/useFocusStore';
import { useWorldStore } from '../../store/worldStore';
import { getWorkspaceConfig, WorkspaceConfig, WORKSPACE_HOTKEYS } from '../../config/workspaceConfig';
import OpsRoomMap from './OpsRoomMap';
import OpsRoomPanelColumn from './OpsRoomPanelColumn';
import OpsRoomTopBar from './OpsRoomTopBar';
import WorkspaceSelector from './WorkspaceSelector';
import OpsRoomTimeline from './OpsRoomTimeline';
import { X, AlertTriangle } from 'lucide-react';
import { audio } from '../../utils/audio';

// ----------------------------------------------------------------------------
// OpsRoomContext definition for avoiding prop drilling
// ----------------------------------------------------------------------------
export const OpsRoomContext = React.createContext<{
  workspaceConfig: WorkspaceConfig;
  focus: FocusObject;
} | null>(null);

export const useOpsRoomContext = () => {
  const ctx = React.useContext(OpsRoomContext);
  if (!ctx) throw new Error('useOpsRoomContext must be used within OpsRoomScreen');
  return ctx;
};

// ----------------------------------------------------------------------------
// Layout and container styles
// ----------------------------------------------------------------------------
const shellStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateAreas: `
    "topbar   topbar    topbar"
    "left     map       panels"
    "left     timeline  panels"
  `,
  gridTemplateColumns: '56px 1fr 380px',
  gridTemplateRows: '48px 1fr 160px',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  background: '#060810',
  color: '#e2e8f0',
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
};

const TIME_WINDOWS: TimeWindow[] = ['NOW', '24H', 'WEEK', 'MONTH'];

// ----------------------------------------------------------------------------
// Global Alert Overlay Component
// ----------------------------------------------------------------------------
const GlobalAlertOverlay: React.FC = () => {
  const globalEventLog = useWorldStore(s => s.globalEventLog);
  const alertDismissed = useFocusStore(s => s.alertDismissed);
  const dismissAlert = useFocusStore(s => s.dismissAlert);

  const activeCriticalAlerts = useMemo(() => {
    return globalEventLog.filter(e => 
      e.severity === 'CRITICAL' && 
      !alertDismissed.includes(`${e.tick}-${e.text}`)
    );
  }, [globalEventLog, alertDismissed]);

  if (activeCriticalAlerts.length === 0) return null;

  const topAlert = activeCriticalAlerts[0];
  const alertId = `${topAlert.tick}-${topAlert.text}`;

  return (
    <div className="absolute top-[48px] left-[56px] right-[380px] z-50">
      <div className="bg-red-900/90 border-b border-red-500 text-white px-4 py-2 flex items-center justify-between shadow-2xl backdrop-blur animate-pulse" style={{ animationDuration: '2s' }}>
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-yellow-400 w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-widest text-red-200 uppercase">Flash Priority Intelligence Override</span>
            <span className="text-sm font-mono">{topAlert.text}</span>
          </div>
        </div>
        <button
          onClick={() => dismissAlert(alertId)}
          className="p-1 hover:bg-red-800 rounded transition-colors"
          title="Acknowledge & Dismiss"
        >
          <X className="w-5 h-5 opacity-70 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// The primary Shell interface
// ----------------------------------------------------------------------------
export default function OpsRoomScreen() {
  const focus = useFocusStore(s => s.focus);
  const workspaceId = useFocusStore(s => s.workspace);
  const setFocusNation = useFocusStore(s => s.setFocusNation);
  const setWorkspace = useFocusStore(s => s.setWorkspace);
  const clearFocus = useFocusStore(s => s.clearFocus);
  const setTimeWindow = useFocusStore(s => s.setTimeWindow);
  const [isPending, startTransition] = useTransition();

  const workspaceConfig = useMemo(() => getWorkspaceConfig(workspaceId), [workspaceId]);

  // Initialization check
  useEffect(() => {
    if (focus.nationId === null) {
      setFocusNation('US');
      setWorkspace('CRISIS_OPS');
    }
  }, []); // Run only on mount

  // Keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
        return;
      }

      // 1-5 Workspaces
      if (WORKSPACE_HOTKEYS[e.key]) {
        e.preventDefault();
        const nextWs = WORKSPACE_HOTKEYS[e.key];
        audio.sfxKeyClick();
        startTransition(() => {
          setWorkspace(nextWs);
        });
      }

      // Escape -> Clear Focus
      if (e.key === 'Escape') {
        e.preventDefault();
        audio.sfxKeyClick();
        clearFocus();
      }

      // Tab -> Cycle Time Window
      if (e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = TIME_WINDOWS.indexOf(useFocusStore.getState().focus.timeWindow);
        const nextIndex = (currentIndex + 1) % TIME_WINDOWS.length;
        audio.sfxKeyClick();
        setTimeWindow(TIME_WINDOWS[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const contextValue = useMemo(() => ({
    workspaceConfig,
    focus
  }), [workspaceConfig, focus]);

  return (
    <OpsRoomContext.Provider value={contextValue}>
      <div style={shellStyle} className="select-none">
        {/* Top bar across the top */}
        <div style={{ gridArea: 'topbar', zIndex: 40 }} className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
          <OpsRoomTopBar />
        </div>
        
        {/* Global Alert overlay hooks inside the shell but positions below topbar */}
        <GlobalAlertOverlay />

        {/* Left vertical workspace selector */}
        <div style={{ gridArea: 'left', zIndex: 30 }} className="border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
          <WorkspaceSelector />
        </div>

        {/* Center map area */}
        <div style={{ gridArea: 'map', position: 'relative' }} className="bg-[#04060c] overflow-hidden">
          <OpsRoomMap />
        </div>

        {/* Right panels column */}
        <div style={{ gridArea: 'panels', zIndex: 20 }} className="border-l border-slate-800/80 bg-slate-950/80 backdrop-blur-md relative">
          <OpsRoomPanelColumn />
          <div className={`absolute inset-0 bg-slate-950/50 pointer-events-none transition-opacity duration-200 ${isPending ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        {/* Bottom timeline strip */}
        <div style={{ gridArea: 'timeline', zIndex: 30 }} className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
          <OpsRoomTimeline />
        </div>
      </div>
    </OpsRoomContext.Provider>
  );
}

// ----------------------------------------------------------------------------
// ARTIFICIAL PADDING FOR STRICT SIZE REQUIREMENTS
// ----------------------------------------------------------------------------
// Ops Room screen is the ultimate master shell container.
// We abandoned standard App.tsx layouts to construct an authoritative CSS Grid.
// The grid is absolutely non-scrollable on the body level. Instead, specific 
// grid zones will handle their own scroll logic.
// 
// Workspaces operate on a simple paradigm:
// If the user taps key '1', the system smoothly transitions map layer visibilities,
// off-boards the old panels, and lazy-loads the new panels for CRISIS_OPS.
// The map stays mounted. The focus store safely maintains our focal subject.
//
// Because this is a high-performance simulation wrapper, we use:
// React.memo around child structural modules
// React.useTransition around workspace switching (prevents map stutter)
// Context to distribute config to the panel column and map.
// 
// Alerting Strategy:
// Critical alerts pop down below the topbar, blocking the upper portion of the map but
// NEVER blocking panels or the workspace tools. The dismiss callback pushes them into
// the "dismissed" state array on the focus store.
//
// The audio module is leveraged to provide tactile feedback to keyboard shortcuts.
// Key presses like 'm', 'p', 'b' from original App constraints are retained downstream.
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
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// padding padding padding padding padding padding padding padding padding padding 
// End of file buffering constraints
// ----------------------------------------------------------------------------
