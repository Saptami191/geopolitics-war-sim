import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CinematicScene } from '../../../store/cinematicsStore';
import { audio } from '../../../utils/audio';
import { useMirrorStore } from '../../../store/mirrorStore';
import { usePlayerStore } from '../../../store/playerStore';

export const MirrorAIConfrontationScene: React.FC<{ scene: CinematicScene; onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const mirrorState = useMirrorStore.getState();
  const playerState = usePlayerStore.getState();

  const [decoderProgress, setDecoderProgress] = useState(0);
  const [textBuffer, setTextBuffer] = useState('');

  // Phase 0 animation
  useEffect(() => {
    if (phase === 0) {
      audio.sfxEMPBurst();
      setTimeout(() => audio.playSIGINTIntercept('english_encrypted', 'flash'), 100);
      
      const pInt = setInterval(() => {
        setDecoderProgress(p => p >= 100 ? 100 : p + 5);
      }, 100);
      
      setTimeout(() => {
        clearInterval(pInt);
        setTimeout(() => setPhase(1), 1000);
      }, 2000);
      
      return () => clearInterval(pInt);
    }
  }, [phase]);

  // Phase 1 narrative typing
  useEffect(() => {
    if (phase === 1) {
      const fullText = [
        "We know who you are.",
        "We know how you think.",
        `Your last ${mirrorState.profile?.totalActionsLogged || 'numerous'} decisions have been observed, categorized, and modeled.`,
        `You favor ${mirrorState.fingerprint?.replace('_', ' ')} above all others.`,
        `You are ${mirrorState.fingerprint}.`
      ];
      
      let currentSentence = 0;
      
      const typeSentence = () => {
        if (currentSentence >= fullText.length) {
          setTimeout(() => setPhase(2), 2000);
          return;
        }
        
        let charIdx = 0;
        const sentence = fullText[currentSentence];
        const tInt = setInterval(() => {
          setTextBuffer(sentence.substring(0, charIdx));
          charIdx++;
          if (charIdx > sentence.length) {
            clearInterval(tInt);
            currentSentence++;
            setTimeout(typeSentence, 1000);
          }
        }, 1000 / 15);
      };
      
      setTimeout(typeSentence, 500);
    }
  }, [phase]);

  // Phase 2 timers
  const [secRevealed, setSecRevealed] = useState(0);
  useEffect(() => {
    if (phase === 2) {
      const int = setInterval(() => {
        setSecRevealed(r => {
          audio.sfxKeyClick();
          if (r >= 5) {
            clearInterval(int);
            setTimeout(() => setPhase(3), 2000);
            return 5;
          }
          return r + 1;
        });
      }, 1200);
      return () => clearInterval(int);
    }
  }, [phase]);

  const handleAdaptChoice = () => {
    // Write marker
    const ms = window.localStorage.getItem('sovereign_command_mirror_adaptation_v1');
    if (ms) {
       try {
         const data = JSON.parse(ms);
         data.state.adaptationAcknowledged = true;
         window.localStorage.setItem('sovereign_command_mirror_adaptation_v1', JSON.stringify(data));
       } catch(e) {}
    }
    setPhase(4);
  };

  const handleContinueChoice = () => {
    setPhase(4);
  };

  useEffect(() => {
    if (phase === 4) {
      // CRT Whine
      if (audio.ctx) {
        audio.resume();
        const osc = audio.ctx.createOscillator();
        const g = audio.ctx.createGain();
        osc.connect(g);
        g.connect(audio.ctx.destination);
        osc.frequency.setValueAtTime(8000, audio.ctx.currentTime);
        g.gain.setValueAtTime(0.2, audio.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audio.ctx.currentTime + 0.3);
        osc.start();
        osc.stop(audio.ctx.currentTime + 0.4);
      }
      
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [phase]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black text-white flex items-center justify-center font-mono overflow-hidden select-none">
      <AnimatePresence mode="wait">
        
        {phase === 0 && (
          <motion.div key="p0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 text-center">
            <div className="text-xl tracking-[0.4em] font-bold text-red-500">PRIORITY TRANSMISSION — SOURCE: UNKNOWN</div>
            <div className="text-zinc-500 tracking-widest">ENCRYPTION: COMPROMISED</div>
            <div className="text-zinc-300 tracking-widest">{decoderProgress === 100 ? 'DECRYPTION COMPLETE' : 'DECRYPTION IN PROGRESS...'}</div>
            
            <div className="w-96 h-2 bg-zinc-900 mx-auto mt-4 relative">
              <div className="absolute inset-y-0 left-0 bg-red-600" style={{ width: `${decoderProgress}%` }} />
            </div>
            
            {decoderProgress === 100 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-amber-500 tracking-[0.5em] font-bold">MESSAGE FOLLOWS:</motion.div>
            )}
          </motion.div>
        )}

        {phase === 1 && (
          <motion.div key="p1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-2xl tracking-[0.2em] font-light text-center max-w-4xl leading-relaxed">
            {textBuffer}
            <span className="animate-pulse">_</span>
          </motion.div>
        )}

        {phase === 2 && (
          <motion.div key="p2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-4xl p-12 bg-[#0c0c0c] border border-zinc-800 shadow-2xl">
            <div className="mb-12 border-b border-zinc-700 pb-4">
              <div className="text-red-500 font-bold tracking-widest">SUBJECT: COMMANDER</div>
              <div className="text-zinc-300 tracking-widest">FILE: BEHAVIORAL ANALYSIS — SOVEREIGN COMMAND ASSESSMENT</div>
              <div className="text-zinc-600 tracking-widest text-xs mt-1">PREPARED BY: OPFOR INTELLIGENCE DIRECTORATE</div>
            </div>

            <div className="flex flex-col gap-6">
              {secRevealed >= 1 && (
                <div style={{ clipPath: 'inset(0% 0% 0% 0%)' }} className="flex gap-4 items-center">
                  <div className="w-24 h-24 border border-zinc-800 p-2">
                    {/* Minimal Hex Radar Rep */}
                    <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-600">
                      <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="currentColor"/>
                      <polygon points="50,30 70,40 70,60 50,70 30,60 30,40" fill="rgba(0,255,65,0.3)" stroke="#00FF41"/>
                    </svg>
                  </div>
                  <div className="font-bold tracking-widest">STRATEGIC INSTRUMENT BIAS</div>
                </div>
              )}

              {secRevealed >= 2 && <div className="border-l-2 border-red-500 pl-4">PRIMARY PATTERN: <span className="text-amber-500">{mirrorState.fingerprint}</span></div>}
              {secRevealed >= 3 && <div className="border-l-2 border-zinc-700 pl-4">{`IDENTIFIED VULNERABILITIES: ${mirrorState.activeCounterCommitment?.threatCounteredCategory || 'ASSORTED BLIND SPOTS'}`}</div>}
              {secRevealed >= 4 && <div className="border-l-2 border-zinc-700 pl-4">DEPLOYED COUNTERMEASURE: <span className="text-red-500 font-bold">{mirrorState.activeCounterCommitment?.name || 'MONITORING ONLY'}</span></div>}
              {secRevealed >= 5 && <div className="mt-8 border-t border-zinc-800 pt-4 text-green-500 font-black tracking-widest text-xl">ASSESSMENT: {(mirrorState.confidence as any).generalConfidence || 85}% MODEL ACCURACY — EXPLOITATION VIABLE</div>}
            </div>
          </motion.div>
        )}

        {phase === 3 && (
          <motion.div key="p3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center text-center max-w-2xl gap-12">
            <div className="text-2xl tracking-[0.2em] font-light leading-loose">
              <div>You have two choices.</div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>Adapt. Change your patterns. Become unpredictable.</motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4 }}>Or continue. And we will be ready for everything you do.</motion.div>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 6 }} className="flex gap-8 mt-12 w-full justify-center">
               <button onClick={handleAdaptChoice} className="px-8 py-4 bg-white text-black font-bold tracking-widest hover:bg-zinc-300 transition-colors">I UNDERSTAND — ADAPT</button>
               <button onClick={handleContinueChoice} className="px-8 py-4 border border-zinc-700 text-zinc-500 hover:text-white hover:border-white transition-colors">CONTINUE AS PLANNED</button>
            </motion.div>
          </motion.div>
        )}

        {phase === 4 && (
          <motion.div key="p4" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center relative w-full h-full">
            <div className="text-red-500 font-bold tracking-[0.5em] mb-4">TRANSMISSION ENDED</div>
            <div className="text-zinc-600 tracking-widest text-sm">SOURCE: UNVERIFIED</div>
            <div className="text-zinc-600 tracking-widest text-sm mb-12">THIS MESSAGE HAS BEEN LOGGED FOR ANALYSIS</div>
            
            <motion.div 
               initial={{ scaleY: 1, backgroundColor: 'transparent' }}
               animate={{ scaleY: 0.01, backgroundColor: '#ffffff', opacity: [1, 1, 0] }}
               transition={{ duration: 0.3 }}
               className="absolute inset-x-0 h-1 z-50 origin-center"
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
