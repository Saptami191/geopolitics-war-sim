import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CinematicScene } from '../../../store/cinematicsStore';
import { audio } from '../../../utils/audio';
import { useMirrorStore } from '../../../store/mirrorStore';
import { useLeaderStore } from '../../../store/leaderStore';
import { useLeaderEmotionStore } from '../../../store/leaderEmotionStore';
import { getArchetypeForPersonality } from '../../../utils/psychologyGenerator';

export const MirrorAiWarningScene: React.FC<{ scene: CinematicScene; onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const mirrorState = useMirrorStore.getState();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === 0) {
      audio.playSIGINTIntercept('english_encrypted', 'flash');
      timer = setTimeout(() => setPhase(1), 2500);
    } else if (phase === 1) {
      audio.sfxCrisisWarning();
      timer = setTimeout(() => setPhase(2), 4000);
    } else if (phase === 2) {
      audio.playPhaseReveal();
      timer = setTimeout(() => onComplete(), 2000);
    }
    return () => clearTimeout(timer);
  }, [phase]);

  // key skip logic
  useEffect(() => {
    const handleKey = () => {
      if (phase >= 1 && phase < 2) setPhase(2);
      else if (phase >= 2) onComplete();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black text-white flex items-center justify-center font-mono overflow-hidden select-none">
      <AnimatePresence mode="wait">
        
        {phase === 0 && (
          <motion.div key="p0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 text-center max-w-2xl bg-[#0c0c0c] p-12 border border-zinc-800">
            <div className="text-xl tracking-[0.4em] font-bold text-red-500 mb-8 border-b border-zinc-800 pb-4">SIGNAL INTELLIGENCE REPORT</div>
            <div className="text-zinc-500 tracking-widest text-left">ORIGINATING UNIT: COUNTERINTELLIGENCE DIVISION</div>
            <div className="text-zinc-500 tracking-widest text-left mb-8">PRIORITY: FLASH</div>
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-amber-500 font-bold text-lg tracking-widest text-center mt-4">
              ANOMALOUS BEHAVIORAL PATTERN DETECTED — YOUR COMMAND
            </motion.div>
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-zinc-400 mt-4 leading-loose text-sm">
              Analysis indicates adversarial intelligence services have compiled sufficient behavioral data to predict your command decisions with {(mirrorState.confidence as any).generalConfidence || 85}% accuracy.
            </motion.div>
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-8">
               <div className="text-xs text-zinc-600 mb-1">ADVERSARIAL MODEL CONFIDENCE: {(mirrorState.confidence as any).generalConfidence || 85}%</div>
               <div className="w-full h-1 bg-zinc-900 overflow-hidden relative">
                 <motion.div className="h-full bg-amber-500" initial={{ width: 0 }} animate={{ width: `${(mirrorState.confidence as any).generalConfidence || 85}%` }} transition={{ duration: 1 }} />
               </div>
            </motion.div>
          </motion.div>
        )}

        {phase === 1 && (
          <motion.div key="p1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 max-w-2xl bg-[#0c0c0c] p-12 border border-zinc-800">
             <div className="text-red-500 font-bold mb-2">CURRENT ADVERSARIAL COUNTERMEASURE:</div>
             <div className="text-white text-lg tracking-widest bg-red-900/20 p-2 border-l-2 border-red-500 pl-4">{mirrorState.activeCounterCommitment?.name || 'MONITORING ONLY'}</div>
             <div className="text-zinc-500 text-sm italic border-l-2 border-zinc-800 pl-4 mb-8">{mirrorState.activeCounterCommitment?.description || 'Active collection ongoing'}</div>

             <div className="text-amber-500 font-bold mb-2 mt-4">YOUR ASSESSED STRATEGIC FINGERPRINT:</div>
             <div className="text-white text-xl tracking-widest bg-amber-900/20 p-4 border border-amber-900 mb-8">{mirrorState.fingerprint?.replace('_', ' ')}</div>

             <div className="text-zinc-300 font-bold border-t border-zinc-800 pt-8">
               RECOMMENDATION: Vary your strategic instruments. Change primary tool. Create uncertainty.
             </div>
          </motion.div>
        )}

        {phase === 2 && (
          <motion.div key="p2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 items-center justify-center">
             <div className="text-2xl text-white font-bold tracking-widest mb-12 border-b border-white pb-4">TO COUNTER ADVERSARIAL PROFILING:</div>
             <div className="flex flex-col gap-6 text-xl tracking-[0.2em] font-light text-zinc-300">
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>— Alter your primary instrument immediately</motion.div>
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>— Use unexpected escalation pathway</motion.div>
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>— Execute decoy action to corrupt their model</motion.div>
             </div>

             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-16 text-amber-500 font-bold text-sm tracking-widest">
               WARNING EXPIRES IN 30 SECONDS
             </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export const LeaderBreakdownScene: React.FC<{ scene: CinematicScene; onComplete: () => void }> = ({ scene, onComplete }) => {
  const [phase, setPhase] = useState(0);
  const payload = scene.payload || {};
  const countryId = payload.countryId || 'UNKNOWN';
  const leaders = useLeaderStore.getState().leadersByCountryId;
  const leader = leaders[countryId];
  const emotions = useLeaderEmotionStore.getState().getEmotion(countryId);

  // Highest emotion
  const maxEmotion = Object.entries(emotions).reduce((a, b) => a[1] > b[1] ? a : b, ['none', 0]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === 0) {
      audio.sfxCrisisWarning();
      timer = setTimeout(() => setPhase(1), 2000);
    } else if (phase === 1) {
      timer = setTimeout(() => setPhase(2), 3000);
    } else if (phase === 2) {
      audio.sfxIntelChime();
      timer = setTimeout(() => onComplete(), 2000);
    }
    return () => clearTimeout(timer);
  }, [phase]);

  // key skip logic
  useEffect(() => {
    const handleKey = () => {
      if (phase >= 1 && phase < 2) setPhase(2);
      else if (phase >= 2) onComplete();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase]);

  if (!leader) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black text-white flex items-center justify-center font-mono overflow-hidden select-none">
      <AnimatePresence mode="wait">
        
        {phase === 0 && (
          <motion.div key="p0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 text-center p-12 bg-red-900/20 border-2 border-red-900 max-w-2xl">
            <div className="text-xl tracking-[0.2em] font-bold text-red-500 mb-4 border-b border-red-900 pb-2">PSYCHOLOGICAL ASSESSMENT UPDATE — {leader.name.toUpperCase()}</div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-3xl font-black text-white tracking-widest my-8">
              CRITICAL THRESHOLD BREACHED
            </motion.div>
            <div className="text-zinc-300">
              {leader.name}'s stress index has reached 85/100.
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 text-amber-500 font-bold">
              Rational decision-making capacity: DEGRADED
            </motion.div>
          </motion.div>
        )}

        {phase === 1 && (
          <motion.div key="p1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-full max-w-4xl bg-[#0c0c0c] border border-zinc-800 h-[400px]">
             <div className="w-1/3 border-r border-zinc-800 p-8 flex flex-col justify-center items-center h-full relative">
               <img src={leader.portraitDataUrl} className="w-48 h-48 filter grayscale object-cover" alt={leader.name} />
               <div className="absolute inset-0 bg-red-900/20 mix-blend-overlay"></div>
             </div>
             <div className="w-2/3 p-12 flex flex-col justify-center gap-6">
                <div>
                  <div className="flex justify-between text-xs font-bold text-zinc-500 mb-1">CRISIS COMPOSURE</div>
                  <div className="w-full h-2 bg-zinc-900 overflow-hidden relative">
                    <motion.div className="absolute top-0 bottom-0 left-0 bg-red-600" initial={{ width: '100%' }} animate={{ width: '15%' }} transition={{ duration: 1 }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-zinc-500 mb-1">PATIENCE</div>
                  <div className="w-full h-2 bg-zinc-900 overflow-hidden relative">
                    <motion.div className="absolute top-0 bottom-0 left-0 bg-red-600" initial={{ width: '100%' }} animate={{ width: '5%' }} transition={{ duration: 1 }} />
                  </div>
                </div>

                <div className="mt-8 border-t border-zinc-800 pt-6">
                  <div className="text-amber-500 font-bold tracking-widest mb-2">BEHAVIORAL PREDICTION:</div>
                  <div className="text-zinc-300 italic text-sm">
                    "Subject likely to execute unpredictable escalation pathways based on extreme {maxEmotion[0].toUpperCase()} response."
                  </div>
                </div>
             </div>
          </motion.div>
        )}

        {phase === 2 && (
          <motion.div key="p2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6 text-center max-w-2xl bg-[#030303] p-12 border border-zinc-800 shadow-2xl">
            <div className="text-2xl text-green-500 font-black tracking-widest border-b border-zinc-900 pb-4 mb-4">INTELLIGENCE OPPORTUNITY WINDOW: OPEN</div>
            <div className="text-zinc-400 text-sm leading-relaxed text-left">
              A psychologically stressed leader presents exploitable decision patterns. Standard deterrence signals may be misread.
            </div>
            <div className="text-white text-left font-bold tracking-widest border-l-2 border-white pl-4 my-4">
              Recommended action: EXECUTE COVERT OR DIPLOMATIC PRESSURE NOW
            </div>
            <div className="bg-zinc-900 text-zinc-500 p-2 mt-4 text-xs font-bold flex justify-between px-4 items-center">
              <span>WINDOW CLOSES IN:</span>
              <span className="text-amber-500 animate-pulse">EST. 3-5 TICKS</span>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export const NationAgendaExposedScene: React.FC<{ scene: CinematicScene; onComplete: () => void }> = ({ scene, onComplete }) => {
  // Simple quick popup
  useEffect(() => {
    audio.sfxIntelChime();
    const t = setTimeout(() => onComplete(), 3000);
    return () => clearTimeout(t);
  }, []);

  const payload = scene.payload || {};

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm text-white flex items-center justify-center font-mono select-none">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#050505] border-2 border-red-900 p-8 max-w-xl text-center">
        <div className="text-red-500 font-bold tracking-[0.4em] mb-4">CLASSIFIED AGENDA EXPOSED</div>
        <div className="text-2xl font-black text-white tracking-widest mb-4">[{payload.countryId}] CLANDESTINE NUCLEAR GOAL</div>
        <div className="text-zinc-400 text-sm">{payload.description || 'Threshold Deterrence Processing'}</div>
        
        <div className="mt-8 text-xs text-zinc-600 animate-pulse font-bold tracking-widest">CONTINUING SIMULATION...</div>
      </motion.div>
    </div>
  );
};
