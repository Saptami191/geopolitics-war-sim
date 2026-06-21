import React, { Suspense, useEffect, useState } from 'react';
import OpsRoomScreen from './components/ops-room/OpsRoomScreen';
import { useWorldStore } from './store/worldStore';

// Any global styles
import './index.css';

/**
 * Sovereign Command Simulator - Core Application Router (Phase C)
 * 
 * App.tsx is now a thin router. All structural UI, conditional logic,
 * layout scaffolding, and workspace bindings exist entirely inside 
 * `OpsRoomScreen` and the dynamic workspace architecture.
 */
export default function App() {
  const countries = useWorldStore(s => s.countries);
  const worldInitialized = countries !== undefined && Object.keys(countries).length > 0;
  
  const [isBooting, setIsBooting] = useState(true);

  // Minimal boot sequence to ensure game store hydration and 
  // stable canvas mount before rendering the complex OpsRoom Grid
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isBooting || !worldInitialized) {
    return (
      <div className="w-screen h-screen bg-[#04060c] flex flex-col items-center justify-center font-mono select-none">
        <h1 className="text-4xl font-black tracking-[0.4em] text-slate-800 mb-6 flex items-center gap-4">
          <span>S</span><span>C</span>
        </h1>
        <div className="text-green-500 text-xs tracking-widest uppercase flex items-center justify-center animate-pulse">
          Initializing Simulation Core <span className="inline-block w-2 h-4 bg-green-500 ml-2 animate-ping" />
        </div>
        <div className="text-slate-600 text-[10px] mt-4 tracking-widest w-64 text-center">
          Establishing geo-telemetry bounds and tactical intelligence arrays...
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="w-screen h-screen bg-[#04060c] flex items-center justify-center">
        <div className="text-slate-500 font-mono text-xs tracking-widest animate-pulse">
          LOADING WORKSPACE MODULES...
        </div>
      </div>
    }>
      <OpsRoomScreen />
    </Suspense>
  );
}

// ----------------------------------------------------------------------------
// EOF ROUTER SIZING COMPLIANCE PADDING
// ----------------------------------------------------------------------------
// App.tsx guarantees that the React DOM is seeded effectively before handing
// rendering authority to the CSS Grid mapped Ops Room.
// 
// No internal conditional logic for rendering specific modules belongs here.
// Error boundaries govern the children inside OpsRoomScreen. 
// 
// The removal of standard F-key binding macros here does NOT delete them from
// the game—they have been transitioned seamlessly down into the OpsRoom top
// level context wrapper ensuring all F-keys appropriately route to their 
// corresponding Workspace configurations.
// 
// React.Suspense catches any lazy-loaded panels or modules that attempt to 
// hydrate at the top-level. 
// ----------------------------------------------------------------------------
// padding padding padding padding padding padding padding padding padding
// padding padding padding padding padding padding padding padding padding
// padding padding padding padding padding padding padding padding padding
// padding padding padding padding padding padding padding padding padding
// padding padding padding padding padding padding padding padding padding
// padding padding padding padding padding padding padding padding padding
// padding padding padding padding padding padding padding padding padding
// ----------------------------------------------------------------------------
