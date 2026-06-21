import React, { useState } from 'react';
import { useNuclearStore } from '../../store/nuclearStore';
import { useDefconStore } from '../../store/defconStore';
import { useWorldStore } from '../../store/worldStore';
import { useOversightStore } from '../../store/oversightStore';
import { PanelFxShell } from '../fx/PanelFxShell';
import { audio } from '../../utils/audio';
import { 
  NuclearTriadLeg, 
  TriadPostureLevel, 
  NC3Channel,
  FalseAlarmType,
  NuclearLaunchOption
} from '../../types';

export default function NuclearPosturePanel() {
  const currentDefconLevel = useDefconStore((s) => s.currentDefconLevel);
  const currentTick = useWorldStore((s) => s.currentTick);

  // Read and subscribe to all elements of our rich nuclearStore
  const {
    weapons,
    playerWeaponCount,
    playerMegaYieldTotal,
    triadPosture,
    postureConfig,
    launchAuthority,
    nc3System,
    availableLaunchOptions,
    selectedLaunchOption,
    tabooState,
    falseAlarmHistory,
    deadHand,
    detonationConsequences,
    decisionClockActive,
    decisionClockExpiryTick,
    
    setTriadPosture,
    initiateWarningAssessment,
    completeAssessmentPhase,
    completeCivilianConsultation,
    grantPresidentialAuthorization,
    completePALAuthentication,
    completeTwoManRule,
    selectLaunchOption,
    transmitExecutionOrder,
    standDownFromLaunch,
    activatePreDelegation,
    restoreNC3Channel,
    triggerFalseAlarm,
    resolveFalseAlarm,
    activateDeadHand,
    deactivateDeadHand
  } = useNuclearStore();

  const [activeTab, setActiveTab3] = useState<'COMMAND' | 'NC3' | 'TABOO' | 'PERIME'>('COMMAND');
  const [selectedAdversary, setSelectedAdversary] = useState<string>('RU');
  const [customYield, setCustomYield] = useState<number>(475);

  // Simultaneous verification keys state
  const [key1Rotated, setKey1Rotated] = useState(false);
  const [key2Rotated, setKey2Rotated] = useState(false);

  // Return custom styling helper for posture level
  const getPostureColor = (level: TriadPostureLevel) => {
    switch (level) {
      case 'PEACETIME': return 'text-slate-400 border-slate-700 bg-slate-900/40';
      case 'ELEVATED': return 'text-cyan-400 border-cyan-800/80 bg-cyan-950/20';
      case 'STRIP_ALERT': return 'text-yellow-500 border-yellow-800/80 bg-yellow-900/10';
      case 'SURGE': return 'text-orange-500 border-orange-800/80 bg-orange-950/20';
      case 'HAIR_TRIGGER': return 'text-red-500 border-red-500 bg-red-950/30 animate-pulse';
    }
  };

  const getChannelColor = (integrity: number) => {
    if (integrity > 75) return 'text-green-400 bg-green-950/20 border-green-800/40';
    if (integrity > 45) return 'text-yellow-500 bg-yellow-950/20 border-yellow-800/40';
    return 'text-red-500 bg-red-950/20 border-red-950/80 animate-pulse';
  };

  // Triggers mock warning/crisis for interactive testing of the checklists
  const handleTriggerSimulatedWarning = () => {
    initiateWarningAssessment(
      'Early Warning Satellite (DSP-4)',
      selectedAdversary,
      94,
      currentTick
    );
  };

  return (
    <PanelFxShell panelId="nuclear_posture" relevantFxTypes={['NUCLEAR_DETONATION','MISSILE_LAUNCH','MISSILE_INTERCEPT','DEFCON_ESCALATION','NUCLEAR_DETERRENCE_ACHIEVED']}>
      <div id="nuclear_postures_viewport" className="h-full flex flex-col p-6 animate-fade-in relative overflow-hidden font-sans bg-[#0c0404] text-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/30 via-transparent to-transparent pointer-events-none" />
        
        {/* Main Header */}
        <div className="flex justify-between items-center mb-5 border-b border-red-900/60 pb-4 relative z-10">
          <div className="flex items-center space-x-3">
            <span className="text-red-500 text-3xl animate-pulse">☢</span>
            <div>
              <h2 className="text-red-500 text-lg font-bold tracking-[0.3em] uppercase">
                Strategic Deterrence Headquarters
              </h2>
              <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                COGNITIVE SYSTEMS BRANCH // US STRATCOM LAUNCH AUTHORITY
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs font-mono px-3 py-1 bg-red-950/40 border border-red-500/20 text-red-400 uppercase rounded">
              DEFCON {currentDefconLevel}
            </div>
            {decisionClockActive && decisionClockExpiryTick && (
              <div className="text-xs font-mono px-3 py-1 bg-red-600 text-white font-bold animate-pulse uppercase rounded flex items-center space-x-1">
                <span>⏱ LIMIT DELTA:</span>
                <span>{decisionClockExpiryTick - currentTick}T</span>
              </div>
            )}
          </div>
        </div>

        {/* Top-Level Quick Inventory Stats */}
        <div className="grid grid-cols-4 gap-3 mb-5 relative z-10">
          <div className="border border-red-950 bg-[#120707] p-3 rounded">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">WARHEAD STOCK</span>
            <span className="text-xl font-bold font-mono text-red-500">{playerWeaponCount} Deployed</span>
          </div>
          <div className="border border-red-950 bg-[#120707] p-3 rounded">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">TOTAL INVENTORY</span>
            <span className="text-xl font-bold font-mono text-amber-500">{playerMegaYieldTotal.toFixed(2)} MT</span>
          </div>
          <div className="border border-red-950 bg-[#120707] p-3 rounded">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">NC3 METRIC</span>
            <span className={clsx("text-xl font-bold font-mono", nc3System.overallIntegrity > 60 ? 'text-green-500' : 'text-red-500')}>
              {nc3System.overallIntegrity}% integrity
            </span>
          </div>
          <div className="border border-red-950 bg-[#120707] p-3 rounded">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">WORLD TABOO INTENSITY</span>
            <span className="text-xl font-bold font-mono text-cyan-400">{tabooState.globalTabooIntactness}%</span>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex space-x-1 border-b border-red-950 mb-5 relative z-10 font-mono text-xs">
          <button 
            id="tab_opt_command"
            onClick={() => setActiveTab3('COMMAND')}
            className={clsx("px-4 py-2 border-t-2 transition-all uppercase tracking-wider", 
              activeTab === 'COMMAND' ? "border-red-500 text-red-500 bg-red-950/20" : "border-transparent text-slate-500 hover:text-slate-200"
            )}
          >
            Launch Authority Checklist
          </button>
          <button 
            id="tab_opt_nc3"
            onClick={() => setActiveTab3('NC3')}
            className={clsx("px-4 py-2 border-t-2 transition-all uppercase tracking-wider", 
              activeTab === 'NC3' ? "border-red-500 text-red-500 bg-red-950/20" : "border-transparent text-slate-500 hover:text-slate-200"
            )}
          >
            NC3 Communications ({Object.keys(nc3System.channels).length})
          </button>
          <button 
            id="tab_opt_taboo"
            onClick={() => setActiveTab3('TABOO')}
            className={clsx("px-4 py-2 border-t-2 transition-all uppercase tracking-wider", 
              activeTab === 'TABOO' ? "border-red-500 text-red-500 bg-red-950/20" : "border-transparent text-slate-500 hover:text-slate-200"
            )}
          >
            Nuclear Taboo & Scars ({detonationConsequences.length})
          </button>
          <button 
            id="tab_opt_perime"
            onClick={() => setActiveTab3('PERIME')}
            className={clsx("px-4 py-2 border-t-2 transition-all uppercase tracking-wider", 
              activeTab === 'PERIME' ? "border-red-500 text-red-500 bg-red-950/20" : "border-transparent text-slate-500 hover:text-slate-200"
            )}
          >
            Perimeter Dead Hand
          </button>
        </div>

        {/* Tab content area */}
        <div className="flex-1 min-h-0 overflow-y-auto relative z-10 space-y-4 pr-1">
          {activeTab === 'COMMAND' && (
            <div className="space-y-4">
              
              {/* Posture Config section */}
              <div className="bg-[#120707] border border-red-950/50 p-4 rounded-lg">
                <h3 className="text-xs font-bold text-red-400 font-mono tracking-widest uppercase mb-3">
                  Strategic Triad Alert Levels
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['ICBM', 'SLBM', 'BOMBER'] as NuclearTriadLeg[]).map((leg) => {
                    const currentLevel = triadPosture[leg];
                    return (
                      <div key={leg} className="border border-red-950/50 p-3 rounded bg-black/60 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1">{leg} LEG</div>
                          <div className={clsx("text-xs font-bold font-mono px-2 py-0.5 border rounded inline-block uppercase", getPostureColor(currentLevel))}>
                            {currentLevel}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {(['PEACETIME', 'ELEVATED', 'STRIP_ALERT', 'SURGE', 'HAIR_TRIGGER'] as TriadPostureLevel[]).map((level) => (
                            <button
                              key={level}
                              onClick={() => {
                                audio.sfxKeyClick();
                                setTriadPosture(leg, level);
                              }}
                              className={clsx("text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all uppercase", 
                                currentLevel === level ? "border-red-500 bg-red-950/40 text-red-400" : "border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-350"
                              )}
                            >
                              {level.replace('_', ' ').substring(0, 10)}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 border-t border-red-950/40 pt-3 flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>SYSTEM CRISIS RISK: <span className="text-amber-500 font-bold">{postureConfig.escalationRisk}%</span></span>
                  <span>ACCIDENTAL LAUNCH ODDS: <span className="text-red-400 font-bold">{(postureConfig.accidentProbability * 100).toFixed(3)}% per tick</span></span>
                  <span>SLBM BONUS: <span className="text-green-400 font-bold">+{postureConfig.survivabilityBonus}% survivability</span></span>
                </div>
              </div>

              {/* Checklist Command Workflow */}
              <div className="bg-[#120707] border border-red-950 p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center border-b border-red-950 pb-2">
                  <h3 className="text-xs font-bold text-red-500 font-mono tracking-widest uppercase">
                    Launch Authorization Sequence (NC3 Command Workflow)
                  </h3>
                  <div className="text-[10px] text-slate-500 font-mono">
                    STATUS: <span className="text-red-400 font-bold uppercase">{launchAuthority.status}</span>
                  </div>
                </div>

                {/* Simulated Warning Trigger */}
                {launchAuthority.status === 'DORMANT' && (
                  <div className="p-4 border border-red-950/50 bg-black/40 rounded flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-350 font-mono">DEBUG / STRATEGIC PRE-EMERGENCE PROTOCOL</h4>
                      <p className="text-[10px] text-slate-500">Simulate incoming early early satellite warning trigger to test the checklist sequence.</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-[10px] font-mono text-slate-400">Target adversary:</span>
                        <select 
                          value={selectedAdversary} 
                          onChange={(e) => setSelectedAdversary(e.target.value)}
                          className="bg-black border border-red-950 text-slate-300 font-mono text-[10px] rounded p-1"
                        >
                          <option value="RU">Russian Federation (Peer)</option>
                          <option value="CN">People's Republic of China (Peer)</option>
                          <option value="KP">Democratic People's Rep of Korea (Tactical)</option>
                          <option value="IR">Islamic Republic of Iran (Tactical)</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={handleTriggerSimulatedWarning}
                      className="px-3 py-2 bg-red-950 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase font-mono rounded"
                    >
                      Trigger Radar Alert
                    </button>
                  </div>
                )}

                {/* Step-by-Step interactive progress tracking */}
                {launchAuthority.status !== 'DORMANT' && (
                  <div className="space-y-3 font-mono text-xs">
                    
                    {/* STEP 1: Assessment */}
                    <div className={clsx("p-3 rounded border", 
                      launchAuthority.assessmentComplete ? "border-green-800/40 bg-green-950/5 text-green-300" : "border-red-900/60 bg-red-950/10 text-red-300"
                    )}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">STEP 1: CONFIRM RADAR THREAT ASSESSMENTS</span>
                        <span className="text-[10px] uppercase">{launchAuthority.assessmentComplete ? 'COMPLETE' : 'PENDING'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Sensor track: <span className="text-red-400">{launchAuthority.initiatedByWarning}</span> // Confidence: <span className="text-amber-500">{launchAuthority.warningConfidence}%</span>
                      </div>
                      {!launchAuthority.assessmentComplete && (
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => {
                              audio.sfxRadioIntercept();
                              completeAssessmentPhase(true, 98, currentTick);
                            }}
                            className="bg-red-950 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-2 py-1 text-[10px] uppercase rounded"
                          >
                            Isolate & Confirm Real Threat
                          </button>
                          <button
                            onClick={() => {
                              audio.sfxPeaceResolution();
                              completeAssessmentPhase(false, 0, currentTick);
                            }}
                            className="bg-slate-900 border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200 px-2 py-1 text-[10px] uppercase rounded"
                          >
                            Diagnose Sensor False Alarm
                          </button>
                        </div>
                      )}
                    </div>

                    {/* STEP 2: Civilian Consultation */}
                    <div className={clsx("p-3 rounded border", 
                      !launchAuthority.assessmentComplete ? "opacity-40 pointer-events-none border-slate-900 text-slate-600" :
                      launchAuthority.consultationComplete ? "border-green-800/40 bg-green-950/5 text-green-300" : "border-red-900/60 bg-red-950/10 text-red-300"
                    )}>
                      <div className="flex justify-between items-center font-bold">
                        <span>STEP 2: EXECUTIVE CIVILIAN BRIEFING</span>
                        <span className="text-[10px] uppercase">{launchAuthority.consultationComplete ? 'COMPLETE' : 'PENDING'}</span>
                      </div>
                      {!launchAuthority.consultationComplete && launchAuthority.assessmentComplete && (
                        <button
                          onClick={() => {
                            audio.sfxKeyClick();
                            completeCivilianConsultation(currentTick);
                          }}
                          className="mt-2 bg-red-950 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-2 py-1 text-[10px] uppercase rounded"
                        >
                          Convene Joint Chiefs Consultation
                        </button>
                      )}
                    </div>

                    {/* STEP 3: Presidential Authorization */}
                    <div className={clsx("p-3 rounded border", 
                      !launchAuthority.consultationComplete ? "opacity-40 pointer-events-none border-slate-900 text-slate-600" :
                      launchAuthority.authorizationGranted ? "border-green-800/40 bg-green-950/5 text-green-300" : "border-red-900/60 bg-red-950/10 text-red-300"
                    )}>
                      <div className="flex justify-between items-center font-bold">
                        <span>STEP 3: PRESIDENTIAL AUTHORIZATION CODE LOGGING</span>
                        <span className="text-[10px] uppercase">{launchAuthority.authorizationGranted ? 'COMPLETE' : 'PENDING'}</span>
                      </div>
                      {launchAuthority.authorizationGranted && (
                        <div className="text-[10px] text-green-500 mt-1">
                          SAC AUTH CODE: <span className="font-bold underline text-white">{launchAuthority.authorizationCode}</span>
                        </div>
                      )}
                      {!launchAuthority.authorizationGranted && launchAuthority.consultationComplete && (
                        <button
                          onClick={() => {
                            audio.sfxSuccessConfirmation();
                            grantPresidentialAuthorization(currentTick);
                          }}
                          className="mt-2 bg-red-950 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-2 py-1 text-[10px] uppercase rounded"
                        >
                          Unlock Gold Codes & Authorize Strike
                        </button>
                      )}
                    </div>

                    {/* STEP 4: Verification (Two Key Rotation Simulation) */}
                    <div className={clsx("p-3 rounded border", 
                      !launchAuthority.authorizationGranted ? "opacity-40 pointer-events-none border-slate-900 text-slate-600" :
                      (launchAuthority.palUnlockComplete && launchAuthority.twoManRuleComplete) ? "border-green-800/40 bg-green-950/5 text-green-300" : "border-red-900/60 bg-red-950/10 text-red-300"
                    )}>
                      <div className="flex justify-between items-center font-bold">
                        <span>STEP 4: PAL AUTHENTICATION & TWO-MAN RULE LOCK</span>
                        <span className="text-[10px] uppercase">{(launchAuthority.palUnlockComplete && launchAuthority.twoManRuleComplete) ? 'SYSTEM ARMED' : 'LOCKED'}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1">Simultaneously rotate launch keys in silo. Must trigger both locks to arm firing circuits.</p>
                      
                      {launchAuthority.authorizationGranted && !(launchAuthority.palUnlockComplete && launchAuthority.twoManRuleComplete) && (
                        <div className="mt-2 flex space-x-4">
                          <button
                            onClick={() => {
                              audio.sfxKeyClick();
                              setKey1Rotated(!key1Rotated);
                              if (!key1Rotated && key2Rotated) {
                                completePALAuthentication(currentTick);
                                completeTwoManRule(currentTick);
                              }
                            }}
                            className={clsx("px-2 py-1 text-[10px] uppercase rounded border transition-all",
                              key1Rotated ? "border-green-500 bg-green-950/30 text-green-400" : "border-red-500 bg-red-950/10 text-red-400"
                            )}
                          >
                            🔑 Key 1: {key1Rotated ? 'Armed & Rotated' : 'Unlock Safe'}
                          </button>
                          <button
                            onClick={() => {
                              audio.sfxKeyClick();
                              setKey2Rotated(!key2Rotated);
                              if (!key2Rotated && key1Rotated) {
                                completePALAuthentication(currentTick);
                                completeTwoManRule(currentTick);
                              }
                            }}
                            className={clsx("px-2 py-1 text-[10px] uppercase rounded border transition-all",
                              key2Rotated ? "border-green-500 bg-green-950/30 text-green-400" : "border-red-500 bg-red-950/10 text-red-400"
                            )}
                          >
                            🔑 Key 2: {key2Rotated ? 'Armed & Rotated' : 'Unlock Safe'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* STEP 5: Select Option */}
                    <div className={clsx("p-3 rounded border", 
                      !(launchAuthority.palUnlockComplete && launchAuthority.twoManRuleComplete) ? "opacity-40 pointer-events-none border-slate-900 text-slate-600" :
                      launchAuthority.selectedOption ? "border-green-800/40 bg-green-950/5 text-green-300" : "border-red-900/60 bg-red-950/10 text-red-300"
                    )}>
                      <div className="flex justify-between items-center font-bold mb-2">
                        <span>STEP 5: CHOOSE LAUNCH DOCTRINE</span>
                        <span className="text-[10px] uppercase">{launchAuthority.selectedOption ? launchAuthority.selectedOption : 'PENDING'}</span>
                      </div>
                      
                      {launchAuthority.palUnlockComplete && launchAuthority.twoManRuleComplete && (
                        <div className="space-y-2">
                          <select
                            value={launchAuthority.selectedOption || ''}
                            onChange={(e) => {
                              audio.sfxKeyClick();
                              selectLaunchOption(e.target.value as NuclearLaunchOption, currentTick);
                            }}
                            className="w-full bg-black border border-red-900 text-slate-200 p-2 rounded text-xs"
                          >
                            <option value="">-- Choose Option --</option>
                            {(availableLaunchOptions || []).map((o) => (
                              <option key={o.option} value={o.option}>
                                {o.label} ({o.weaponsRequired} warheads, Est: {o.estimatedCasualties.toLocaleString()} civilian casualties)
                              </option>
                            ))}
                          </select>
                          
                          {launchAuthority.selectedOption && (
                            <div className="p-2 border border-red-950 bg-black/40 rounded text-[10px] text-slate-400 space-y-1">
                              <div>{availableLaunchOptions.find(o => o.option === launchAuthority.selectedOption)?.description}</div>
                              <div className="flex justify-between border-t border-red-950/40 pt-1 mt-1">
                                <span>IHL Legal Status:</span>
                                <span className="font-bold underline text-amber-500">
                                  {availableLaunchOptions.find(o => o.option === launchAuthority.selectedOption)?.legalStatusUnderIHL}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* STEP 6: Execute EAM */}
                    <div className={clsx("p-3 rounded border", 
                      !launchAuthority.selectedOption ? "opacity-40 pointer-events-none border-slate-900 text-slate-600" :
                      "border-red-500 bg-red-950/10 text-red-500 animate-pulse"
                    )}>
                      <div className="flex justify-between items-center font-bold">
                        <span>STEP 6: TRANSMIT EMERGENCY ACTION MESSAGE (EAM)</span>
                        <span className="text-[10px] uppercase">READY FOR TRANSMIT</span>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1">Final commitment. Orders are digitized and sent through active communications arrays.</p>
                      
                      {launchAuthority.selectedOption && (
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => {
                              const success = transmitExecutionOrder(currentTick);
                              if (success) {
                                setKey1Rotated(false);
                                setKey2Rotated(false);
                              }
                            }}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1 text-[11px] uppercase rounded border border-red-400 shadow-lg"
                          >
                            🚀 Transmit Armed EAM Order
                          </button>
                          <button
                            onClick={() => {
                              audio.sfxPeaceResolution();
                              standDownFromLaunch('Strategic stand-down initiated by civilian override.', currentTick);
                              setKey1Rotated(false);
                              setKey2Rotated(false);
                            }}
                            className="bg-slate-900 border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200 px-3 py-1 text-[11px] uppercase rounded"
                          >
                            🛑 Terminate Alert & Stand Down
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'NC3' && (
            <div className="space-y-4">
              <div className="bg-[#120707] border border-red-950 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center border-b border-red-950 pb-2">
                  <h3 className="text-xs font-bold text-red-400 font-mono tracking-widest uppercase">
                    Miltary Communications Architecture (NC3)
                  </h3>
                  <div className="text-[10px] text-slate-500 font-mono">
                    DECAPITATION RISK: <span className={clsx("font-bold", nc3System.isDecapitationRisk ? "text-red-500 animate-pulse" : "text-green-500")}>
                      {nc3System.isDecapitationRisk ? 'CRITICAL RISK' : 'STABLE'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Our Emergency Action Message (EAM) delivery relies on the integrity of our six broadcast networks. Electromagnetic pulses (EMP) or severe cyber warfare degrade channel health. Manual repair is required to avoid radio transmission gridlock.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  {Object.values(nc3System.channels).map((channel) => (
                    <div key={channel.channel} className={clsx("border rounded p-3 font-mono text-xs flex flex-col justify-between space-y-2", getChannelColor(channel.integrity))}>
                      <div>
                        <div className="flex justify-between font-bold">
                          <span>{channel.channel.replace('_', ' ')}</span>
                          <span>{channel.integrity}%</span>
                        </div>
                        <div className="text-[9px] text-slate-500 mt-1">
                          RELIABILITY: {channel.reliabilityPct}% // DEGRADED BY: {
                            (channel.degradedByEW ? 'EW ' : '') + 
                            (channel.degradedByCyber ? 'CYBER ' : '') + 
                            (channel.degradedByNuclearEMP ? 'EMP' : '') || 'NONE'
                          }
                        </div>
                      </div>
                      
                      {channel.integrity < 100 && (
                        <button
                          onClick={() => {
                            audio.sfxKeyClick();
                            restoreNC3Channel(channel.channel as NC3Channel, 15);
                          }}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 py-1 text-[10px] uppercase rounded transition-all mt-2"
                        >
                          🛠 Run Signal Recovery (+15%)
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TABOO' && (
            <div className="space-y-4">
              <div className="bg-[#120707] border border-red-950 p-4 rounded-lg space-y-4">
                <div className="border-b border-red-950 pb-2 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-red-400 font-mono tracking-widest uppercase">
                    International Humanitarian Law & Nuclear Taboo Stability
                  </h3>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{tabooState.globalTabooIntactness}% Intactness</span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  The nuclear taboo is the absolute geopolitical norm against atomic usage. Each detonation inflicts severe taboo erosion, making adversary nations exponentially more trigger-happy and completely shattering alliances.
                </p>

                {/* Scars lists */}
                {detonationConsequences.length === 0 ? (
                  <div className="p-8 border border-red-950/40 text-center text-slate-600 uppercase tracking-wider text-xs rounded bg-black/40">
                    No active strategic scars logged in current timeline. Global nuclear taboo intact.
                  </div>
                ) : (
                  <div className="space-y-3 font-mono text-xs">
                    <h4 className="text-[10px] uppercase font-bold text-slate-400">Recorded Impact Events</h4>
                    {(detonationConsequences || []).map((c, i) => (
                      <div key={i} className="border border-red-950/80 bg-red-950/5 rounded p-3 space-y-2">
                        <div className="flex justify-between items-center font-bold text-red-500">
                          <span>DETONATION EVENT #{i+1}</span>
                          <span>{c.yieldKt} Kilotons</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                          <div>Target Nation: <span className="text-slate-200">{c.countryId}</span></div>
                          <div>Blast coordinates: <span className="text-slate-200">[{c.lat.toFixed(4)}, {c.lon.toFixed(4)}]</span></div>
                          <div>Immediate fatalities: <span className="text-red-400 font-bold">{c.immediateDeaths.toLocaleString()}</span></div>
                          <div>Injured casualties: <span className="text-amber-500">{c.injuredCasualties.toLocaleString()}</span></div>
                          <div>Radiation fallout range: <span className="text-slate-200">{c.nuclearFalloutRadiusKm} km</span></div>
                          <div>EMP shock range: <span className="text-slate-200">{c.electromagneticPulseRadiusKm} km</span></div>
                        </div>
                        <div className="text-[9px] text-slate-500 border-t border-red-950/40 pt-1 mt-1">
                          TABOO DEGRADED INDEX BY {c.tabooErosionDelta}% // CLIMATE FALLOUT PROBABILITY: {c.nuclearWinterProbability}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'PERIME' && (
            <div className="space-y-4">
              <div className="bg-[#120707] border border-red-950 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center border-b border-red-950 pb-2 font-mono">
                  <h3 className="text-xs font-bold text-red-400 tracking-widest uppercase">
                    Perimeter Auto-Retaliation System ("Dead Hand")
                  </h3>
                  <div className={clsx("text-[10px] font-bold px-2 py-0.5 rounded border uppercase", 
                    deadHand.isActive ? "border-red-500 bg-red-950/30 text-red-500 animate-pulse" : "border-slate-800 text-slate-500"
                  )}>
                    {deadHand.isActive ? 'ACTIVE & LISTENING' : 'OFFLINE'}
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Dead Hand is a redundant autolaunch network. If enabled, it listens for seismic shocks, communication lockups, and nuclear radiation spikes. In case our command centers are decapitated, the system automatically launches our entire remaining arsenal in one final, catastrophic counterstrike.
                </p>

                <div className="p-4 border border-red-950/30 bg-black/60 rounded flex justify-between items-center font-mono text-xs">
                  <div>
                    <h4 className="font-bold text-slate-350">AUTO-LAUNCH CIRCUIT KITS</h4>
                    <span className="text-[10px] text-slate-500">Autonomous loop triggered at 80% seismic decapitation</span>
                  </div>
                  
                  {deadHand.isActive ? (
                    <button
                      onClick={() => {
                        audio.sfxPeaceResolution();
                        deactivateDeadHand();
                      }}
                      className="bg-slate-900 border border-slate-705 text-slate-400 hover:bg-slate-800 hover:text-slate-200 px-3 py-1.5 rounded uppercase font-bold text-[10px]"
                    >
                      Safe the Auto-Circuit
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        audio.sfxWarKlaxon();
                        activateDeadHand(currentTick);
                      }}
                      className="bg-red-950 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded uppercase font-bold text-[10px] transition-all"
                    >
                      Arm & Listen Dead Hand
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PanelFxShell>
  );
}

// Utility class concatenator
function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
