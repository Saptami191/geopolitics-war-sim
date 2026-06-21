import React, { useState } from 'react';
import { useModesStore, PREDEFINED_SCENARIOS } from '../../store/modesStore';
import { usePlayerStore } from '../../store/playerStore';
import { PanelFxShell } from '../fx/PanelFxShell';
import { useWorldStore } from '../../store/worldStore';
import { Role_Type, Mode_ToneMode } from '../../types';
import { 
  ShieldAlert, User, Layers, Crosshair, Users, Map, Key, Eye, CircleDot, AlertTriangle, Play, Lock, CheckCircle2, ChevronRight, FileText, ArrowRight
} from 'lucide-react';

export default function ModesPanel() {
  const { 
    modes_scenarios,
    modes_activeSession,
    modes_debriefs,
    modes_startSession,
    modes_getPrimaryObjectiveProgress,
    modes_getActiveObjectives
  } = useModesStore();

  const {
    player_role,
    player_toneMode,
    player_domesticApproval,
    player_setRole,
    player_setToneMode,
    player_unlockedScenarioIds,
    player_completedScenarioIds,
    player_roleAccessProfile,
    player_endScenario
  } = usePlayerStore();

  const currentTick = useWorldStore(s => s.currentTick);
  
  const [activeTab, setActiveTab] = useState<'COMMAND_IDENTITY' | 'TONE_MODE' | 'SCENARIO_SELECTION' | 'ACTIVE_SESSION' | 'DEBRIEF'>('COMMAND_IDENTITY');

  const [confirmScenarioId, setConfirmScenarioId] = useState<string | null>(null);

  const renderCommandIdentity = () => {
    return (
      <div className="flex flex-col gap-6 p-4 h-[75vh] overflow-y-auto">
        <h3 className="text-xl font-serif text-slate-200 border-b border-slate-800 pb-2">ESTABLISH COMMAND IDENTITY</h3>
        
        <div className="flex flex-col gap-4">
          <div 
            className={`border rounded p-4 flex flex-col gap-2 transition-colors cursor-pointer ${player_role === 'SHADOW_DIRECTOR' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'}`}
            onClick={() => player_setRole('SHADOW_DIRECTOR')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-mono text-slate-200 font-bold tracking-wider">SHADOW DIRECTOR</h4>
                <p className="text-xs text-slate-400 font-mono">The architect of plausible deniability</p>
              </div>
              <div className="bg-red-900 text-red-200 text-[10px] font-mono px-2 py-0.5 rounded font-bold">TOP SECRET / SCI</div>
            </div>
            <p className="text-sm text-slate-300 italic mt-2">
              You are not elected. You are not confirmed by any senate. You do not brief the press... You shape events. You are never the face of events.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1">
                <div className="text-green-400">✓ Covert Operations — AMPLIFIED (1.5×)</div>
                <div className="text-green-400">✓ Cyber Operations — FULL ACCESS</div>
                <div className="text-green-400">✓ SIGINT Direction — FULL ACCESS</div>
                <div className="text-green-400">✓ Financial Weapons — FULL ACCESS</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-red-400">✗ Kinetic Strike Auth — DENIED</div>
                <div className="text-red-400">✗ Treaty Ratification — DENIED</div>
                <div className="text-red-400">✗ UNSC Vote Authority — DENIED</div>
                <div className="text-amber-400 mt-2">Approval Decay: MINIMAL</div>
              </div>
            </div>
            {player_role !== 'SHADOW_DIRECTOR' && (
              <button className="mt-4 bg-slate-800 text-slate-300 py-1 font-mono text-xs hover:bg-slate-700 transition">SELECT ROLE</button>
            )}
            {player_role === 'SHADOW_DIRECTOR' && (
              <div className="mt-4 bg-amber-500/20 text-amber-500 py-1 font-mono text-xs text-center border border-amber-500/30">CURRENTLY SELECTED</div>
            )}
          </div>

          <div 
            className={`border rounded p-4 flex flex-col gap-2 transition-colors cursor-pointer ${player_role === 'SUPREME_COMMANDER' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'}`}
            onClick={() => player_setRole('SUPREME_COMMANDER')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-mono text-slate-200 font-bold tracking-wider">SUPREME COMMANDER</h4>
                <p className="text-xs text-slate-400 font-mono">The weight of command</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1">
                <div className="text-green-400">✓ Military Posture — FULL AUTHORITY</div>
                <div className="text-green-400">✓ Nuclear Release — WITH CHAIN</div>
                <div className="text-green-400">✓ Treaty Ratification — FULL AUTHORITY</div>
                <div className="text-green-400">✓ UNSC Vote — FULL AUTHORITY</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-red-400">✗ CIA Operations — ADVISORY ONLY</div>
                <div className="text-red-400">✗ Financial Weapons — DENIED</div>
                <div className="text-red-400">✗ SIGINT Collection — ADVISORY ONLY</div>
                <div className="text-amber-400 mt-2">Approval Decay: HIGH (Visible)</div>
              </div>
            </div>
            {player_role !== 'SUPREME_COMMANDER' && (
              <button className="mt-4 bg-slate-800 text-slate-300 py-1 font-mono text-xs hover:bg-slate-700 transition">SELECT ROLE</button>
            )}
            {player_role === 'SUPREME_COMMANDER' && (
              <div className="mt-4 bg-amber-500/20 text-amber-500 py-1 font-mono text-xs text-center border border-amber-500/30">CURRENTLY SELECTED</div>
            )}
          </div>

          <div 
            className={`border rounded p-4 flex flex-col gap-2 transition-colors cursor-pointer ${player_role === 'CHIEF_OF_INTELLIGENCE' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'}`}
            onClick={() => player_setRole('CHIEF_OF_INTELLIGENCE')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-mono text-slate-200 font-bold tracking-wider">CHIEF OF INTELLIGENCE</h4>
                <p className="text-xs text-slate-400 font-mono">The tradecraft supremo</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1">
                <div className="text-green-400">✓ Intelligence Collection — SUPERIOR</div>
                <div className="text-green-400">✓ Covert Operations — MAXIMUM (12 Ops)</div>
                <div className="text-green-400">✓ FININT Operations — FULL ACCESS</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-red-400">✗ Military Operations — DENIED</div>
                <div className="text-red-400">✗ Public Attribution — NEVER</div>
                <div className="text-red-400">✗ Diplomatic Instruments — ADVISORY</div>
                <div className="text-amber-400 mt-2">Approval Decay: MINIMAL</div>
              </div>
            </div>
            {player_role !== 'CHIEF_OF_INTELLIGENCE' && (
              <button className="mt-4 bg-slate-800 text-slate-300 py-1 font-mono text-xs hover:bg-slate-700 transition">SELECT ROLE</button>
            )}
            {player_role === 'CHIEF_OF_INTELLIGENCE' && (
              <div className="mt-4 bg-amber-500/20 text-amber-500 py-1 font-mono text-xs text-center border border-amber-500/30">CURRENTLY SELECTED</div>
            )}
          </div>
        </div>
        
        <div className="border border-slate-800 p-4 mt-4">
          <h4 className="text-xs font-mono text-slate-400 mb-2">ACCESS PROFILE COMPARISON</h4>
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="py-1">CAPABILITY</th>
                <th className="py-1">SHADOW DIR</th>
                <th className="py-1">SUPREME CMD</th>
                <th className="py-1">CHIEF INTEL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 text-slate-300">Covert Ops Multiplier</td>
                <td className="text-green-400">1.5x</td>
                <td className="text-red-400">0.6x</td>
                <td className="text-green-400 font-bold">1.8x</td>
              </tr>
              <tr className="bg-slate-900/50">
                <td className="py-1 text-slate-300">Max CIA Ops</td>
                <td className="text-green-400">8</td>
                <td className="text-red-400">3</td>
                <td className="text-green-400 font-bold">12</td>
              </tr>
              <tr>
                <td className="py-1 text-slate-300">Military Readiness</td>
                <td className="text-red-400">None</td>
                <td className="text-green-400 font-bold">+20</td>
                <td className="text-red-400">None</td>
              </tr>
              <tr className="bg-slate-900/50">
                <td className="py-1 text-slate-300">Approval Decay / Tick</td>
                <td className="text-green-400">0.1</td>
                <td className="text-red-400">0.25</td>
                <td className="text-green-400 font-bold">0.05</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderToneMode = () => {
    return (
      <div className="flex flex-col gap-6 p-4 h-[75vh] overflow-y-auto">
        <h3 className="text-xl font-serif text-slate-200 border-b border-slate-800 pb-2">ESTABLISH OPERATIONAL REALITY</h3>
        
        <div className="flex flex-col gap-4">
          <div 
            className={`border rounded p-4 flex flex-col gap-2 transition-colors cursor-pointer ${player_toneMode === 'REALISM' ? 'border-emerald-500 bg-emerald-900/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'}`}
            onClick={() => { if (!modes_activeSession) player_setToneMode('REALISM') }}
          >
            <h4 className="text-lg font-mono text-slate-200 font-bold tracking-wider">REALISM</h4>
            <p className="text-xs text-slate-400 font-mono italic">The world as it actually is</p>
            <p className="text-sm text-slate-300 mt-2">For players who want the full weight of consequence.</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div>Intelligence: <span className="text-amber-400">AMBIGUOUS (35%)</span></div>
              <div>HUMINT Success: <span className="text-amber-400">70%</span></div>
              <div>Op Discovery: <span className="text-red-400">18% / tick</span></div>
              <div>Ally Reliability: <span className="text-amber-400">60%</span></div>
              <div>Collateral Damage: <span className="text-red-400">TRACKED & CONSEQUENTIAL</span></div>
              <div>Media Scrutiny: <span className="text-red-400">85%</span></div>
              <div>Election Cycle: <span className="text-red-400">ACTIVE (40%+ required)</span></div>
              <div>Law: <span className="text-red-400">CONSTRAINING</span></div>
            </div>
            {player_toneMode === 'REALISM' && <div className="mt-2 text-emerald-400 font-mono text-xs text-center border border-emerald-500/30 bg-emerald-500/10 py-1">ACTIVE TONE</div>}
          </div>

          <div 
            className={`border rounded p-4 flex flex-col gap-2 transition-colors cursor-pointer ${player_toneMode === 'TECHNO_THRILLER' ? 'border-emerald-500 bg-emerald-900/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'}`}
            onClick={() => { if (!modes_activeSession) player_setToneMode('TECHNO_THRILLER') }}
          >
            <h4 className="text-lg font-mono text-slate-200 font-bold tracking-wider">TECHNO-THRILLER</h4>
            <p className="text-xs text-slate-400 font-mono italic">The world as Clancy imagined it</p>
            <p className="text-sm text-slate-300 mt-2">Strategic depth without bureaucratic friction.</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div>Intelligence: <span className="text-green-400">CLEANER (55%)</span></div>
              <div>Op Discovery: <span className="text-green-400">10% / tick</span></div>
              <div>Ally Reliability: <span className="text-green-400">80%</span></div>
              <div>Collateral Damage: <span className="text-amber-400">MANAGEABLE</span></div>
              <div>Media Scrutiny: <span className="text-green-400">50%</span></div>
              <div>Law: <span className="text-amber-400">ADVISORY</span></div>
            </div>
            {player_toneMode === 'TECHNO_THRILLER' && <div className="mt-2 text-emerald-400 font-mono text-xs text-center border border-emerald-500/30 bg-emerald-500/10 py-1">ACTIVE TONE</div>}
          </div>

          <div 
            className={`border rounded p-4 flex flex-col gap-2 transition-colors cursor-pointer ${player_toneMode === 'ALTERNATE_HISTORY' ? 'border-emerald-500 bg-emerald-900/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'}`}
            onClick={() => { if (!modes_activeSession) player_setToneMode('ALTERNATE_HISTORY') }}
          >
            <h4 className="text-lg font-mono text-slate-200 font-bold tracking-wider">ALTERNATE HISTORY</h4>
            <p className="text-xs text-slate-400 font-mono italic">A world that diverged. Manage what it became.</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300">
              <div>Intelligence: MODERATE (45%)</div>
              <div>Modified International Order</div>
              <div>Historical References: DISABLED</div>
              <div>Operation Codenames: WORLD-SPECIFIC</div>
            </div>
            {player_toneMode === 'ALTERNATE_HISTORY' && <div className="mt-2 text-emerald-400 font-mono text-xs text-center border border-emerald-500/30 bg-emerald-500/10 py-1">ACTIVE TONE</div>}
          </div>
        </div>
        {modes_activeSession && (
          <p className="text-xs font-mono text-amber-500 mt-2">Note: Tone mode cannot be changed once a scenario begins.</p>
        )}
      </div>
    );
  };

  const renderScenarioSelection = () => {
    if (confirmScenarioId) {
       const scen = modes_scenarios[confirmScenarioId];
       return (
         <div className="flex flex-col gap-4 p-4">
           <h3 className="text-xl font-serif text-amber-400 pb-2">CONFIRM OPERATIONAL BRIEF</h3>
           <div className="bg-slate-900 p-4 border border-slate-700">
              <h4 className="font-mono text-slate-300 text-lg">{scen.title}</h4>
              <p className="font-mono text-xs text-slate-500 mb-4">{scen.subtitle}</p>
              
              <div className="flex gap-4 mb-4">
                <div className="bg-slate-800 px-2 py-1 text-xs font-mono text-slate-300">ROLE: {player_role.replace(/_/g, ' ')}</div>
                <div className="bg-slate-800 px-2 py-1 text-xs font-mono text-slate-300">TONE: {player_toneMode.replace(/_/g, ' ')}</div>
              </div>
              
              <div className="text-sm text-slate-300 font-serif whitespace-pre-wrap leading-relaxed border-l-2 border-amber-500/50 pl-4 py-2">
                {scen.briefingText || scen.executiveSummaryText}
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-mono py-2 text-sm"
                  onClick={() => {
                     modes_startSession(confirmScenarioId, player_role, player_toneMode, currentTick);
                     setConfirmScenarioId(null);
                     setActiveTab('ACTIVE_SESSION');
                  }}
                >
                  CONFIRM AND BEGIN
                </button>
                <button 
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono py-2 text-sm border border-slate-600"
                  onClick={() => setConfirmScenarioId(null)}
                >
                  ABORT
                </button>
              </div>
           </div>
         </div>
       );
    }

    return (
      <div className="flex flex-col gap-4 p-4 h-[75vh] overflow-y-auto">
        <h3 className="text-xl font-serif text-slate-200 border-b border-slate-800 pb-2">SELECT OPERATIONAL BRIEF</h3>
        
        {Object.values(modes_scenarios).map(scen => {
           const isUnlocked = player_unlockedScenarioIds.includes(scen.id) || scen.isUnlocked;
           const isSandbox = scen.type === 'SANDBOX';

           return (
             <div key={scen.id} className={`border p-4 flex flex-col gap-2 relative overflow-hidden ${isSandbox ? 'border-emerald-800 bg-slate-900/80 mt-4' : (isUnlocked ? 'border-slate-700 bg-slate-900/50' : 'border-slate-800 bg-slate-950/50 opacity-60')}`}>
               {!isUnlocked && (
                 <div className="absolute inset-0 bg-slate-950/80 z-10 flex flex-col items-center justify-center p-4 text-center">
                    <Lock className="w-8 h-8 text-slate-600 mb-2" />
                    <span className="text-xs font-mono text-slate-400 px-4">LOCKED: {scen.unlockCondition}</span>
                 </div>
               )}
               
               <div className="flex items-center justify-between">
                 <div className="flex gap-2 items-center">
                    {!isSandbox && <div className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${scen.classificationLevel === 'UMBRA' ? 'bg-red-900 text-red-200' : 'bg-amber-900 text-amber-200'}`}>{scen.classificationLevel}</div>}
                    <h4 className={`text-lg font-mono font-bold tracking-wider ${isSandbox ? 'text-emerald-400' : 'text-slate-200'}`}>{scen.title}</h4>
                 </div>
                 {player_completedScenarioIds.includes(scen.id) && <div className="text-xs font-mono text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> COMPLETED</div>}
               </div>
               
               <p className="text-xs text-slate-400 font-mono">{scen.subtitle}</p>
               
               {!isSandbox && (
                 <div className="flex gap-2 text-[10px] font-mono text-slate-500 mt-2">
                    <span className="text-slate-300">{scen.type.replace(/_/g, ' ')}</span>
                    <span>•</span>
                    <span>{scen.tickLimit} TICKS</span>
                 </div>
               )}
               
               <div className="text-sm text-slate-300 mt-2 italic border-l-2 border-slate-700 pl-3">
                 {scen.executiveSummaryText}
               </div>
               
               {!isSandbox && (
                  <div className="mt-2 text-xs font-mono text-slate-400">
                    <span className="text-slate-300">Objectives:</span> 1 PRIMARY, {scen.objectives.filter(o=>o.type==='SECONDARY').length} SECONDARY, {scen.objectives.filter(o=>o.type==='COVERT').length} COVERT
                  </div>
               )}

               {isUnlocked && (
                 <button 
                  className={`mt-4 py-1.5 font-mono text-xs w-full transition ${isSandbox ? 'bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-800' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                  onClick={() => setConfirmScenarioId(scen.id)}
                 >
                   BEGIN SCENARIO
                 </button>
               )}
             </div>
           );
        })}
      </div>
    );
  };

  const renderActiveSession = () => {
    if (!modes_activeSession || !modes_activeSession.isActive) {
       return (
         <div className="flex items-center justify-center h-64 border border-dashed border-slate-800 p-8 text-center text-slate-500 font-mono text-sm">
           NO ACTIVE BRIEF.<br/>SELECT A SCENARIO FROM THE SELECTION TAB.
         </div>
       );
    }
    const scen = modes_scenarios[modes_activeSession.scenarioId];
    if (!scen) return null;

    const ticksElapsed = currentTick - modes_activeSession.startedAtTick;
    const isSandbox = scen.type === 'SANDBOX';
    const primaryProgress = modes_getPrimaryObjectiveProgress();

    return (
      <div className="flex flex-col gap-4 p-4 h-[75vh] overflow-y-auto">
        <h3 className="text-xl font-serif text-emerald-400 border-b border-slate-800 pb-2 flex justify-between items-end">
           <span>OPERATIONAL STATUS</span>
           <span className="text-sm font-mono text-slate-400">{isSandbox ? 'NO LIMIT' : `${ticksElapsed} / ${scen.tickLimit} TICKS`}</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-slate-900 border border-slate-800 p-3">
              <div className="text-[10px] text-slate-500 font-mono mb-1">COMMAND IDENTITY</div>
              <div className="text-sm text-slate-200 font-mono">{modes_activeSession.role.replace(/_/g, ' ')}</div>
           </div>
           <div className="bg-slate-900 border border-slate-800 p-3">
              <div className="text-[10px] text-slate-500 font-mono mb-1">OPERATIONAL REALITY</div>
              <div className="text-sm text-slate-200 font-mono">{modes_activeSession.toneMode.replace(/_/g, ' ')}</div>
           </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 p-4 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4">
              <div className="text-4xl font-mono text-slate-800 opacity-30">{player_domesticApproval?.currentApproval}%</div>
           </div>
           <h4 className="text-xs font-mono text-slate-400 mb-4">DOMESTIC APPROVAL</h4>
           <div className="flex items-center gap-4">
              <div className={`text-4xl font-serif ${player_domesticApproval?.crisisMode ? 'text-red-500' : 'text-slate-200'}`}>
                 {player_domesticApproval?.currentApproval}%
              </div>
              <div className={`text-xs font-mono px-2 py-0.5 rounded ${player_domesticApproval?.trend === 'RISING' ? 'bg-green-900/50 text-green-400' : player_domesticApproval?.trend === 'FALLING' ? 'bg-red-900/50 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                 TREND: {player_domesticApproval?.trend}
              </div>
           </div>
           {player_domesticApproval?.crisisMode && (
             <div className="mt-2 text-xs font-mono text-red-400 border border-red-900/50 bg-red-900/20 p-2">
                CRITICAL WARNING: APPROVAL BELOW THRESHOLD. LOSS OF MANDATE IMMINENT.
             </div>
           )}
        </div>

        {!isSandbox && (
          <div className="border border-slate-800 p-4 mt-2">
             <h4 className="text-xs font-mono text-slate-400 mb-4">OBJECTIVE PROGRESS</h4>
             
             {/* Primary */}
             <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                   <div className="text-sm text-slate-200 font-bold font-mono">PRIMARY</div>
                   <div className="text-xs text-emerald-400 font-mono">{primaryProgress}%</div>
                </div>
                <div className="w-full bg-slate-900 h-2">
                   <div className="bg-emerald-500 h-2 transition-all duration-1000" style={{ width: `${primaryProgress}%`}}></div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-2">
                   {scen.objectives.find(o=>o.type==='PRIMARY')?.description}
                </div>
             </div>

             <div className="flex flex-col gap-3">
                {scen.objectives.filter(o=>o.type==='SECONDARY' || o.type==='COVERT').map(obj => {
                   if (obj.isHidden && obj.status !== 'ACHIEVED') {
                      return (
                         <div key={obj.id} className="text-xs font-mono text-slate-600 flex items-center gap-2">
                            <Eye className="w-3 h-3" /> CLASSIFIED COVERT OBJECTIVE (ACTIVE)
                         </div>
                      );
                   }
                   return (
                     <div key={obj.id} className="text-xs font-mono">
                        <div className="flex justify-between text-slate-400 mb-1">
                           <span>{obj.type === 'COVERT' ? '[COVERT] ' : ''}{obj.description}</span>
                           <span className={obj.status === 'ACHIEVED' ? 'text-emerald-400' : obj.status === 'FAILED' ? 'text-red-400' : 'text-slate-500'}>
                              {obj.status}
                           </span>
                        </div>
                        {obj.status === 'ACTIVE' && (
                           <div className="w-full bg-slate-900 h-1">
                              <div className="bg-slate-600 h-1" style={{width: `${obj.currentProgress}%`}}></div>
                           </div>
                        )}
                     </div>
                   );
                })}
             </div>
          </div>
        )}

        <div className="mt-8 flex gap-4">
           <button 
             className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 font-mono py-2 text-xs transition"
             onClick={() => player_endScenario('FAILURE', currentTick)}
           >
             ABANDON SCENARIO
           </button>
           {isSandbox && (
             <button 
               className="flex-1 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-900/50 font-mono py-2 text-xs transition"
               onClick={() => player_endScenario('SUCCESS', currentTick)}
             >
               CONCLUDE EXERCISE
             </button>
           )}
        </div>
      </div>
    );
  };

  const renderDebrief = () => {
    // If no debrief exists, use the latest one or show empty
    const debriefId = usePlayerStore.getState().player_lastDebriefId;
    const debrief = modes_debriefs.length > 0 ? modes_debriefs[modes_debriefs.length - 1] : null;

    if (!debrief) {
       return (
         <div className="flex items-center justify-center h-64 border border-dashed border-slate-800 p-8 text-center text-slate-500 font-mono text-sm">
           NO DEBRIEF ON RECORD.<br/>COMPLETE A SCENARIO FIRST.
         </div>
       );
    }

    const isSuccess = debrief.status === 'SUCCESS' || debrief.status === 'PARTIAL_SUCCESS';
    const isCatastrophic = debrief.status === 'CATASTROPHIC_FAILURE';

    return (
      <div className="flex flex-col gap-6 p-4 h-[75vh] overflow-y-auto">
        <div className={`p-4 border ${isCatastrophic ? 'border-red-900 bg-red-950/80 text-red-500' : isSuccess ? 'border-emerald-800 bg-emerald-900/20 text-emerald-400' : 'border-amber-800 bg-amber-900/20 text-amber-500'}`}>
           <h3 className="text-xl font-mono font-bold tracking-wider mb-1">AFTER-ACTION REPORT</h3>
           <h4 className="text-sm font-mono opacity-80">OUTCOME: {debrief.status.replace(/_/g, ' ')}</h4>
        </div>

        <div className="flex gap-4 mb-4 font-mono text-xs text-slate-400">
           <div>ROLE: <span className="text-slate-200">{debrief.role.replace(/_/g, ' ')}</span></div>
           <div>TONE: <span className="text-slate-200">{debrief.toneMode.replace(/_/g, ' ')}</span></div>
        </div>

        <div className="border border-slate-800 p-4 bg-slate-900/50">
           <h4 className="text-xs font-mono text-slate-500 mb-2">DIRECTOR ASSESSMENT</h4>
           <p className="text-sm text-slate-300 font-serif leading-relaxed italic border-l-2 border-slate-700 pl-3">
              {debrief.directorAssessment}
           </p>
        </div>

        {debrief.alternativePathways.length > 0 && (
           <div className="border border-slate-800 p-4">
              <h4 className="text-xs font-mono text-slate-500 mb-2">ALTERNATIVE PATHWAYS</h4>
              <ul className="text-xs text-slate-400 font-mono list-disc pl-4 space-y-1">
                 {(debrief.alternativePathways || []).map((path, idx) => (
                    <li key={idx}>{path}</li>
                 ))}
              </ul>
           </div>
        )}

        <div className="border border-slate-800 p-4">
           <h4 className="text-xs font-mono text-slate-500 mb-2">HISTORICAL COMPARISON</h4>
           <p className="text-xs text-slate-300 font-serif leading-relaxed">
              {debrief.historicalComparison}
           </p>
        </div>

        <div className="border-t border-slate-800 pt-4 text-center pb-8">
           <div className="text-[10px] text-slate-500 font-mono mb-2">RECORD SEALED.</div>
        </div>
      </div>
    );
  };

  return (
    <PanelFxShell panelId="modes_panel" relevantFxTypes={['CYBER_ATTACK' as any]}>
      <div className="w-[800px] h-[85vh] bg-slate-950 flex shadow-2xl overflow-hidden border border-slate-800 text-slate-200 pointer-events-auto">
        <div className="w-56 bg-slate-900/50 border-r border-slate-800 flex flex-col p-2 space-y-1">
          <div className="p-4 mb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold font-mono text-slate-300 flex items-center gap-2"><Map className="w-4 h-4 text-amber-500" /> IRON THRONE</h2>
            <div className="text-[10px] text-slate-500 font-mono tracking-widest mt-1">SOVEREIGN FRAMEWORK</div>
          </div>
          
          <button 
            className={`flex items-center gap-3 px-3 py-2 text-xs font-mono tracking-widest transition-colors text-left ${activeTab === 'COMMAND_IDENTITY' ? 'bg-amber-900/20 text-amber-500 border-l-2 border-amber-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent'}`}
            onClick={() => setActiveTab('COMMAND_IDENTITY')}
          >
            <User className="w-4 h-4" /> COMMAND IDENTITY
          </button>
          
          <button 
            className={`flex items-center gap-3 px-3 py-2 text-xs font-mono tracking-widest transition-colors text-left ${activeTab === 'TONE_MODE' ? 'bg-amber-900/20 text-amber-500 border-l-2 border-amber-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent'}`}
            onClick={() => setActiveTab('TONE_MODE')}
          >
            <Layers className="w-4 h-4" /> TONE MODE
          </button>

          <button 
            className={`flex items-center gap-3 px-3 py-2 text-xs font-mono tracking-widest transition-colors text-left ${activeTab === 'SCENARIO_SELECTION' ? 'bg-amber-900/20 text-amber-500 border-l-2 border-amber-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent'}`}
            onClick={() => setActiveTab('SCENARIO_SELECTION')}
          >
            <Crosshair className="w-4 h-4" /> SCENARIOS
          </button>

          <button 
            className={`flex items-center gap-3 px-3 py-2 text-xs font-mono tracking-widest transition-colors text-left ${activeTab === 'ACTIVE_SESSION' ? 'bg-emerald-900/20 text-emerald-500 border-l-2 border-emerald-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent'}`}
            onClick={() => setActiveTab('ACTIVE_SESSION')}
          >
            <Play className="w-4 h-4" /> ACTIVE SESSION
          </button>

          <button 
            className={`flex items-center gap-3 px-3 py-2 text-xs font-mono tracking-widest transition-colors text-left ${activeTab === 'DEBRIEF' ? 'bg-amber-900/20 text-amber-500 border-l-2 border-amber-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-l-2 border-transparent'}`}
            onClick={() => setActiveTab('DEBRIEF')}
          >
            <FileText className="w-4 h-4" /> DEBRIEF HISTORY
          </button>

          <div className="mt-auto px-4 py-6 border-t border-slate-800">
             <div className="text-[10px] text-slate-600 font-mono">SOVEREIGN FRAMEWORK V1.0</div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden">
          {activeTab === 'COMMAND_IDENTITY' && renderCommandIdentity()}
          {activeTab === 'TONE_MODE' && renderToneMode()}
          {activeTab === 'SCENARIO_SELECTION' && renderScenarioSelection()}
          {activeTab === 'ACTIVE_SESSION' && renderActiveSession()}
          {activeTab === 'DEBRIEF' && renderDebrief()}
        </div>
      </div>
    </PanelFxShell>
  );
}
