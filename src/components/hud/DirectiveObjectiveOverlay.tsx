import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useModesStore } from '../../store/modesStore';
import { useWorldStore } from '../../store/worldStore';
import { audio } from '../../utils/audio';
import { Target, AlertTriangle, CheckCircle, Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function DirectiveObjectiveOverlay() {
  const activeSession = useModesStore(s => s.modes_activeSession);
  const scenarios = useModesStore(s => s.modes_scenarios);
  const currentTick = useWorldStore(s => s.currentTick);

  const [notification, setNotification] = useState<{
    text: string;
    type: 'ACHIEVED' | 'FAILED';
    id: string;
  } | null>(null);

  // Track status of objectives to detect state transition
  const previousStatusesRef = useRef<Record<string, 'ACTIVE' | 'ACHIEVED' | 'FAILED'>>({});

  if (!activeSession || !activeSession.isActive) return null;

  const scenario = scenarios[activeSession.scenarioId];
  if (!scenario || scenario.type === 'SANDBOX') return null;

  const objectives = scenario.objectives || [];
  const ticksLeft = Math.max(0, (scenario.tickLimit || 0) - (currentTick - activeSession.startedAtTick));

  // Detect status changes to trigger majestic alerts
  useEffect(() => {
    objectives.forEach(obj => {
      const prevStatus = previousStatusesRef.current[obj.id];
      if (prevStatus && prevStatus === 'ACTIVE' && obj.status !== 'ACTIVE') {
        const text = `${obj.type} DIRECTIVE: ${obj.description}`;
        setNotification({
          text,
          type: obj.status as 'ACHIEVED' | 'FAILED',
          id: `${obj.id}-${Date.now()}`
        });

        // Trigger tactical audio cue
        try {
          if (obj.status === 'ACHIEVED') {
            audio.sfxIntelChime();
          } else {
            audio.sfxCrisisWarning();
          }
        } catch (_) {}

        // Clear notification after 4 seconds
        setTimeout(() => {
          setNotification(curr => curr && curr.id.startsWith(obj.id) ? null : curr);
        }, 4000);
      }
      previousStatusesRef.current[obj.id] = obj.status;
    });
  }, [objectives]);

  return (
    <>
      {/* Absolute overlay for flashing milestone alerts */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed inset-x-0 top-24 z-50 flex justify-center pointer-events-none"
          >
            <div className={`px-6 py-4 border rounded shadow-2xl flex items-center gap-4 max-w-xl font-mono text-xs ${
              notification.type === 'ACHIEVED' 
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-400 shadow-emerald-950/50' 
                : 'bg-red-950/90 border-red-500 text-red-400 shadow-red-950/50'
            }`}>
              {notification.type === 'ACHIEVED' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 animate-pulse shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce shrink-0" />
              )}
              <div>
                <div className="font-bold tracking-widest text-[10px] opacity-70">
                  {notification.type === 'ACHIEVED' ? 'DIRECTIVE SUCCESSFUL' : 'DIRECTIVE COMPROMISED'}
                </div>
                <div className="text-white mt-1 text-sm font-sans">{notification.text}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating HUD Widget */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 bg-slate-950/90 border border-slate-800 rounded p-4 shadow-xl flex flex-col gap-3 font-mono text-xs pointer-events-auto select-none"
      >
        <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-1">
          <div className="flex items-center gap-2 text-slate-400">
            <Target className="w-4 h-4 text-amber-500" />
            <span className="font-bold tracking-widest text-[10px]">SOVEREIGN DIRECTIVE</span>
          </div>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${ticksLeft <= 10 ? 'bg-red-950 text-red-400 font-bold animate-pulse' : 'bg-slate-900 text-slate-300'}`}>
            T-{ticksLeft}
          </span>
        </div>

        <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto">
          {objectives.map(obj => {
            const isCovert = obj.type === 'COVERT';
            const isHidden = obj.isHidden && obj.status !== 'ACHIEVED';

            return (
              <div key={obj.id} className="flex flex-col gap-1 border-b border-slate-900/50 pb-2 last:border-0 last:pb-0">
                <div className="flex justify-between items-start text-[10px] gap-2">
                  <span className={`font-bold tracking-wide ${
                    obj.type === 'PRIMARY' ? 'text-amber-500' : isCovert ? 'text-purple-400' : 'text-slate-400'
                  }`}>
                    {isHidden ? 'CLASSIFIED' : obj.type}
                  </span>
                  <span className={`font-bold ${
                    obj.status === 'ACHIEVED' ? 'text-emerald-400' : obj.status === 'FAILED' ? 'text-red-400' : 'text-slate-500'
                  }`}>
                    {obj.status}
                  </span>
                </div>

                <div className="text-slate-300 font-sans leading-snug mt-0.5">
                  {isHidden ? (
                    <span className="text-slate-600 flex items-center gap-1 italic text-[11px]">
                      <EyeOff className="w-3 h-3 text-slate-700" /> Covert directive parameters concealed.
                    </span>
                  ) : obj.description}
                </div>

                {!isHidden && obj.status === 'ACTIVE' && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-slate-900 h-1 rounded overflow-hidden">
                      <div 
                        className={`h-1 transition-all duration-1000 ${
                          obj.type === 'PRIMARY' ? 'bg-amber-500' : isCovert ? 'bg-purple-500' : 'bg-slate-600'
                        }`}
                        style={{ width: `${obj.currentProgress}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold">
                      {obj.currentProgress}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}
