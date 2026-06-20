import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useModesStore } from '../../store/modesStore';
import { usePlayerStore } from '../../store/playerStore';
import { audio } from '../../utils/audio';
import { Shield, Eye, Users, ChevronRight, Activity, Terminal, AlertTriangle, Cpu } from 'lucide-react';

export default function ModesOnboardingFlow() {
  const { 
    modes_onboardingStep, 
    modes_advanceOnboarding, 
    modes_completeOnboarding 
  } = useModesStore();

  const {
    player_role,
    player_toneMode,
    player_setRole,
    player_setToneMode
  } = usePlayerStore();

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "SYSTEM DECRYPTION & CALIBRATION",
      subtitle: "Welcome to Sovereign Command Simulator",
      icon: <Terminal className="w-12 h-12 text-green-400" />,
      content: (
        <div className="flex flex-col gap-4 text-slate-300 font-sans">
          <p>
            You are entering <span className="font-mono text-green-400 font-bold">SOVEREIGN COMMAND SIMULATOR</span>, a high-fidelity collective geopolitical simulation.
          </p>
          <p>
            Unlike typical sandbox simulations, you are bound by <span className="text-amber-400 font-mono">SOVEREIGN DIRECTIVES</span>. 
            Every module of state—from economic networks, conventional forces, signals intelligence, to cyberwarfare layers—is connected under a unified tick execution cycle.
          </p>
          <p className="border-l-2 border-green-500 pl-4 py-2 italic text-sm text-slate-400">
            "We do not predict the future. We calibrate the parameters of survival."
          </p>
          <div className="grid grid-cols-3 gap-4 mt-4 font-mono text-xs">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded">
              <span className="text-green-400 block mb-1">01 / REAL-TIME MUTATIONS</span>
              Every action triggers a cascade of feedback across international opinion, trade, and regional threat indices.
            </div>
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded">
              <span className="text-green-400 block mb-1">02 / INTERCONNECTED LAYERS</span>
              Cyber malware strikes degrade infrastructure, causing economic volatility which feeds domestic unrest.
            </div>
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded">
              <span className="text-green-400 block mb-1">03 / ACTIVE DIRECTIVES</span>
              Success is judged solely on objective accomplishment within the strict limit of the briefing parameters.
            </div>
          </div>
        </div>
      )
    },
    {
      title: "ESTABLISH COMMAND IDENTITY",
      subtitle: "Your profile alters available state instruments and approval decay rates",
      icon: <Users className="w-12 h-12 text-amber-500" />,
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-slate-300 text-sm">
            Select an operational role. Your identity controls what you can authorize, how quickly public opinion decays, and resource multipliers:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className={`p-4 rounded border text-left cursor-pointer transition-all ${player_role === 'SHADOW_DIRECTOR' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'}`}
              onClick={() => {
                try { audio.playPhaseReveal(); } catch(_) {}
                player_setRole('SHADOW_DIRECTOR');
              }}
            >
              <h4 className="font-mono text-base font-bold text-slate-200">SHADOW DIRECTOR</h4>
              <p className="text-[11px] text-amber-500 font-mono mt-0.5">TOP SECRET / SPECIAL INSIGHT</p>
              <p className="text-xs text-slate-400 mt-2">
                Plausible deniability expert. High amplification of covert networks, CIA agent operatives, and cyber weapon infiltration.
              </p>
              <div className="mt-3 text-[10px] font-mono text-slate-500">
                <div className="text-green-500">✓ Infiltration: +50%</div>
                <div className="text-red-500">✗ Kinetic Commands: Restructured</div>
              </div>
            </div>

            <div 
              className={`p-4 rounded border text-left cursor-pointer transition-all ${player_role === 'SUPREME_COMMANDER' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'}`}
              onClick={() => {
                try { audio.playPhaseReveal(); } catch(_) {}
                player_setRole('SUPREME_COMMANDER');
              }}
            >
              <h4 className="font-mono text-base font-bold text-slate-200">SUPREME COMMANDER</h4>
              <p className="text-[11px] text-amber-500 font-mono mt-0.5">MILITARY STRATEGIST</p>
              <p className="text-xs text-slate-400 mt-2">
                Conventional superiority master. Complete command of naval fleets, strategic air commands, and missile deployment profiles.
              </p>
              <div className="mt-3 text-[10px] font-mono text-slate-500">
                <div className="text-green-500">✓ Strike Effectiveness: +30%</div>
                <div className="text-red-500">✗ Covert Deniability: Restructured</div>
              </div>
            </div>

            <div 
              className={`p-4 rounded border text-left cursor-pointer transition-all ${player_role === 'CHIEF_OF_INTELLIGENCE' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'}`}
              onClick={() => {
                try { audio.playPhaseReveal(); } catch(_) {}
                player_setRole('CHIEF_OF_INTELLIGENCE');
              }}
            >
              <h4 className="font-mono text-base font-bold text-slate-200">CHIEF OF INTELLIGENCE</h4>
              <p className="text-[11px] text-amber-500 font-mono mt-0.5">TRADECRAFT CHIEF</p>
              <p className="text-xs text-slate-400 mt-2">
                Interception specialist. Extreme accuracy in signal intercepts, target identity resolve rates, and tracking rogue elements.
              </p>
              <div className="mt-3 text-[10px] font-mono text-slate-500">
                <div className="text-green-500">✓ SIGINT Efficiency: +45%</div>
                <div className="text-red-500">✗ Fleet Mobility: Unaltered</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "OPERATIONAL REALITIES",
      subtitle: "The rules of geopolitical friction, threat level, and public reaction",
      icon: <Cpu className="w-12 h-12 text-blue-400" />,
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-slate-300 text-sm">
            Select your tone mode. This determines the friction calculations, narrative shifts, and event triggers used inside the simulation engine:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className={`p-4 rounded border text-left cursor-pointer transition-all ${player_toneMode === 'REALISM' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'}`}
              onClick={() => {
                try { audio.playPhaseReveal(); } catch(_) {}
                player_setToneMode('REALISM');
              }}
            >
              <h4 className="font-mono text-base font-bold text-slate-200">REALISM</h4>
              <p className="text-[11px] text-blue-400 font-mono mt-0.5">THE FRICTION OF THE REAL</p>
              <p className="text-xs text-slate-400 mt-2">
                Strict geopolitical model. Diplomatic leverage decays logically. Actions have severe, unforgiving diplomatic backlash and economic blowback.
              </p>
              <div className="mt-3 text-[10px] font-mono text-blue-500">
                • Backlash Multiplier: 1.5×<br />
                • Escalation Dampener: 0.15
              </div>
            </div>

            <div 
              className={`p-4 rounded border text-left cursor-pointer transition-all ${player_toneMode === 'TECHNO_THRILLER' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'}`}
              onClick={() => {
                try { audio.playPhaseReveal(); } catch(_) {}
                player_setToneMode('TECHNO_THRILLER');
              }}
            >
              <h4 className="font-mono text-base font-bold text-slate-200">TECHNO-THRILLER</h4>
              <p className="text-[11px] text-blue-400 font-mono mt-0.5">HIGH TECH ESPIONAGE</p>
              <p className="text-xs text-slate-400 mt-2">
                Amplified cyber, sigint, and specialized military technology options. High-speed signals intelligence, active tactical sabotage.
              </p>
              <div className="mt-3 text-[10px] font-mono text-blue-500">
                • Signal Harvest Speed: +30%<br />
                • Cyber Sabotage Success: +25%
              </div>
            </div>

            <div 
              className={`p-4 rounded border text-left cursor-pointer transition-all ${player_toneMode === 'ALTERNATE_HISTORY' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'}`}
              onClick={() => {
                try { audio.playPhaseReveal(); } catch(_) {}
                player_setToneMode('ALTERNATE_HISTORY');
              }}
            >
              <h4 className="font-mono text-base font-bold text-slate-200">ALTERNATE HISTORY</h4>
              <p className="text-[11px] text-blue-400 font-mono mt-0.5">DIVERGENT REALITIES</p>
              <p className="text-xs text-slate-400 mt-2">
                Highly volatile starting alliances, unpredictable bloc moves, and non-canonical power alignments that diverge randomly from present-day expectations.
              </p>
              <div className="mt-3 text-[10px] font-mono text-blue-500">
                • Alliance Volatility: HIGH<br />
                • AI Expansion Pattern: Aggressive
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "AUTHORIZATION COMPLETED",
      subtitle: "Geopolitical sandbox systems synchronized",
      icon: <Activity className="w-12 h-12 text-emerald-400 animate-pulse" />,
      content: (
        <div className="flex flex-col gap-4 font-mono text-slate-300 text-sm">
          <p>
            The system core is fully calibrated and linked to your authority:
          </p>
          <div className="bg-slate-950 p-4 border border-emerald-950 rounded text-emerald-400 text-xs flex flex-col gap-2">
            <div>&gt; ROLE RATIFIED: <span className="font-bold text-white">{player_role}</span></div>
            <div>&gt; SIMULATION REALITY MODE: <span className="font-bold text-white">{player_toneMode}</span></div>
            <div>&gt; SYSTEM PERMISSIONS: L3 ENCRYPTION INGRESS TERMINATED</div>
            <div>&gt; ALLIANCE BLOCS CALIBRATED: NATO / SCO / BRICS / GCC / QUAD / TRI-LATERAL</div>
            <div>&gt; READY FOR DEPLOYMENT...</div>
          </div>
          <p className="text-slate-400 text-xs italic mt-4">
            Note: Play through the scenario directives, deploy agents, secure signal intercepts, alter cyber posture, and broker treaties. Any breach of DEFCON parameters or nuclear launch terminates simulation protocol.
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    try { audio.playPhaseReveal(); } catch(_) {}
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      modes_completeOnboarding();
    }
  };

  const handleBack = () => {
    try { audio.playPhaseReveal(); } catch(_) {}
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const activeStepConfig = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-center items-center p-6 bg-cover bg-center select-none" style={{ backgroundImage: 'radial-gradient(circle at center, #0F172A 0%, #020617 100%)' }}>
      {/* HUD Header Grid decoration */}
      <div className="absolute top-0 inset-x-0 h-16 border-b border-slate-900 px-6 flex justify-between items-center text-slate-500 pointer-events-none">
        <div className="font-mono text-xs flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-500/40 animate-pulse" />
          SYSTEM PROTOCOL: UNIFIED_TICK_CALIBRATION
        </div>
        <div className="font-mono text-xs text-right">
          INTELLIGENCE ENCLAVE V8.2.14
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-slate-950/90 border border-slate-800 rounded shadow-2xl p-8 flex flex-col min-h-[500px]"
      >
        <div className="flex items-start gap-6 border-b border-slate-900 pb-6 mb-6">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded">
            {activeStepConfig.icon}
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-mono text-green-400 tracking-widest font-bold">
              STEP {currentStep + 1} OF {steps.length}
            </div>
            <h1 className="text-2xl font-serif text-slate-100 tracking-wide mt-1">
              {activeStepConfig.title}
            </h1>
            <p className="text-sm font-mono text-slate-400 mt-1">
              {activeStepConfig.subtitle}
            </p>
          </div>
        </div>

        <div className="flex-1 my-4 min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeStepConfig.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controller Bar */}
        <div className="flex items-center justify-between border-t border-slate-900 pt-6 mt-6">
          <div>
            {currentStep > 0 ? (
              <button 
                onClick={handleBack}
                className="px-5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-300 font-mono text-xs transition"
              >
                PREVIOUS
              </button>
            ) : <div />}
          </div>

          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-colors ${i === currentStep ? 'bg-green-500' : 'bg-slate-800'}`}
              />
            ))}
          </div>

          <div>
            <button 
              onClick={handleNext}
              className="px-6 py-2 bg-green-950/20 hover:bg-green-950/40 border border-green-500 text-green-400 hover:text-green-300 font-mono text-xs transition flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'AUTHORIZE INITIALIZATION' : 'CONTINUE'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Decorative footer */}
      <div className="absolute bottom-4 text-center text-[10px] font-mono text-slate-600 pointer-events-none">
        SOVEREIGN INTENSE GEOPOLITICAL INTERFACE FRAMEWORK • TOP SECRET INSIGHT ACCESS PRIVILEGES ONLY
      </div>
    </div>
  );
}
