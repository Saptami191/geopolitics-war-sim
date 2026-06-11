import React, { useState } from 'react';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { useFogOfWarStore } from '../../store/fogOfWarStore';
import { useClockStore } from '../../store/clockStore';
import { getLeaderProfile } from '../../data/leaders';
import { LeaderPortrait } from './LeaderPortrait';
import { fmtB, fmtDate, fmtPop } from '../../utils/format';
import { audio } from '../../utils/audio';

interface DossierCardProps {
  countryId: string;
  onClose: () => void;
}

export const DossierCard: React.FC<DossierCardProps> = ({ countryId, onClose }) => {
  const [flipped, setFlipped] = useState(false);
  const [activeTab, setActiveTab ] = useState<'GENERAL' | 'MILITARY' | 'COVERT'>('GENERAL');
  
  const country = useWorldStore((state) => state.countries[countryId]);
  const playerCountryId = usePlayerStore((state) => state.countryId);
  const hudMode = usePlayerStore((state) => state.hudMode);
  
  // Fog of war check
  const fogEntry = useFogOfWarStore((state) => state.fog[countryId]);
  const currentTick = useWorldStore((state) => state.currentTick);
  const calendarDate = useClockStore((state) => state.currentCalendarDate);

  if (!country) return null;

  const intelLevel = fogEntry ? fogEntry.intelLevel : 0;
  const leader = getLeaderProfile(countryId);

  // Redacted helpers
  const isRedacted = (requiredLevel: number) => intelLevel < requiredLevel;

  const renderValueOrRedacted = (requiredLevel: number, displayValue: string | React.ReactNode) => {
    if (isRedacted(requiredLevel)) {
      return (
        <span className="bg-[#ff2244]/15 text-[#ff2244] border border-[#ff2244]/30 px-1 py-0.5 rounded text-[8px] tracking-wide font-bold uppercase select-none blink" title="CLASSIFIED - SIGNAL PENETRATION LEVEL TOO LOW">
          [CLASSIFIED]
        </span>
      );
    }
    return displayValue;
  };

  const handleProposeAlliance = () => {
    audio.sfxUNVote();
    useWorldStore.getState().addGlobalEvent(`Alliance Proposal sent from ${playerCountryId} to ${countryId}`, 'INFO');
    // Drift opinion
    useWorldStore.getState().updateCountry(countryId, (draft) => {
      draft.opinions[playerCountryId] = Math.min(100, (draft.opinions[playerCountryId] || 0) + 15);
    });
  };

  const handleSendAid = () => {
    audio.sfxUNVote();
    const aidAmount = 5.0; // $5B
    useWorldStore.getState().updateCountry(playerCountryId, (draft) => {
      draft.economic.treasuryCashB = Math.max(0, draft.economic.treasuryCashB - aidAmount);
    });
    useWorldStore.getState().updateCountry(countryId, (draft) => {
      draft.economic.treasuryCashB += aidAmount;
      draft.opinions[playerCountryId] = Math.min(100, (draft.opinions[playerCountryId] || 0) + 20);
    });
    usePlayerStore.getState().syncCashFromCountry();
    useWorldStore.getState().addGlobalEvent(`Economic Aid dispatch of ${fmtB(aidAmount)} sent to ${country.name}`, 'INFO');
  };

  const handleImposeSanctions = () => {
    audio.sfxKlaxon();
    useWorldStore.getState().updateCountry(countryId, (draft) => {
      if (!draft.economic.sanctionedBy.includes(playerCountryId)) {
        draft.economic.sanctionedBy.push(playerCountryId);
      }
      draft.opinions[playerCountryId] = Math.max(-100, (draft.opinions[playerCountryId] || 0) - 25);
    });
    useWorldStore.getState().addGlobalEvent(`${playerCountryId} has imposed full unilateral sanctions on ${country.name}`, 'WARNING');
  };

  const handleSetTarget = () => {
    audio.sfxRadarPing();
    usePlayerStore.getState().setTargetCountry(countryId);
    useWorldStore.getState().addGlobalEvent(`Strike target locked: ${country.name}`, 'WARNING');
  };

  const handleCovertOp = () => {
    audio.sfxFactionAlert();
    useWorldStore.getState().addGlobalEvent(`Covert Operational Network established in ${countryId}. Signals scanning initiated.`, 'INFO');
    useFogOfWarStore.getState().setIntelLevel(countryId, Math.min(3, intelLevel + 1) as any, currentTick);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none font-mono">
      <div className="dossier-wrapper w-full max-w-[540px] min-h-[500px]">
        {/* flip transition wrappers */}
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              audio.sfxKeyClick();
              setFlipped(!flipped);
            }
          }}
          className={`dossier-card-3d relative w-full min-h-[500px] rounded text-green-400 cursor-pointer ${flipped ? 'dir-flipped' : ''}`}
        >
          
          {/* DOSSIER FRONT SHEET: Manila folder classified folder look */}
          <div className="dossier-front absolute inset-0 backface-hidden p-6 rounded flex flex-col justify-between cursor-default border border-[#5c4a30]">
            <div>
              <div className="border-b-2 border-red-700/80 pb-2 mb-4 flex justify-between items-center text-[10px] font-bold text-red-500">
                <span className="tracking-widest">⚠️ TOP SECRET // COGNITIVE RECON // C1-Z9</span>
                <span>NO FORN / ORCON</span>
              </div>

              <div className="bg-[#120e07] border border-[#5c4a30]/60 p-4 rounded text-center my-6 relative overflow-hidden">
                <div className="text-[28px] font-bold text-[#ffb300] tracking-wide mb-1 select-all relative z-10">
                  CLASSIFIED DOSSIER
                </div>
                <div className="text-[10px] text-gray-500 tracking-widest uppercase relative z-10">
                  CENTRAL INTELLIGENCE AGENCY DIRECTORY
                </div>
              </div>

              {/* Tilted custom physical stamp */}
              <div className="classified-stamp">
                CLASSIFIED
              </div>

              <div className="space-y-3 text-xs text-[#dfba88] py-4">
                <div className="flex justify-between border-b border-[#5c4a30]/30 pb-1">
                  <span>SUBJECT DIRECTIVE ID:</span>
                  <span className="font-bold text-white tracking-widest">{countryId}</span>
                </div>
                <div className="flex justify-between border-b border-[#5c4a30]/30 pb-1">
                  <span>NATION NAME STATE:</span>
                  <span className="font-bold text-white uppercase">{country.name}</span>
                </div>
                <div className="flex justify-between border-b border-[#5c4a30]/30 pb-1">
                  <span>RECORDING CHRONO:</span>
                  <span className="font-bold text-white">{fmtDate(calendarDate)}</span>
                </div>
                <div className="flex justify-between border-b border-[#5c4a30]/30 pb-1">
                  <span>INTELLIGENCE RELIABILTY:</span>
                  <span className="font-bold text-white uppercase">LEVEL {intelLevel}/3 // {intelLevel === 3 ? 'FULL INTEGRITY' : intelLevel === 2 ? 'PARTIAL SCAN' : 'RESTRICTED REDACTED'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-[#5c4a30]/50 pt-4 mt-2">
              <span className="text-[8px] text-gray-500 uppercase">
                CRIM PROTOCOL 14A. ACC SUB TO CODE REVEAL.
              </span>
              <button
                onClick={() => { audio.sfxKeyClick(); setFlipped(true); }}
                className="px-4 py-1.5 bg-[#4c3a1e] hover:bg-[#ffb300] hover:text-black border border-[#ffb300] text-[10px] text-[#ffb300] font-bold uppercase rounded cursor-pointer transition-all"
              >
                OPEN DOSSIER FOLDER &gt;&gt;
              </button>
            </div>
          </div>

          {/* DOSSIER BACK SHEET: Geopolitical, Military, and Covert multi-tab dossier dossier-card */}
          <div className="dossier-back dossier-card absolute inset-0 rotate-y-180 backface-hidden bg-[#050c05] border-2 border-[#1a5c1a] p-4 rounded flex flex-col justify-between cursor-default">
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Dossier Header */}
              <div className="flex justify-between items-start border-b border-[#1a5c1a] pb-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{country.flagEmoji}</span>
                    <h2 className="text-[#00ff44] text-sm font-bold uppercase tracking-wider font-display">
                      {country.name}
                    </h2>
                  </div>
                  <div className="text-[9px] text-[#00e5ff] tracking-widest font-bold mt-0.5">
                    INTELLIGENCE COGNITIVE DOSSIER DATA
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => { audio.sfxKeyClick(); setFlipped(false); }}
                    className="border border-[#1a5c1a]/50 text-gray-400 hover:text-[#ffb300] hover:border-[#ffb300] text-[8px] px-2 py-1 rounded font-bold uppercase"
                    title="Flip back to front cover folder"
                  >
                    COVERS
                  </button>
                  <button
                    onClick={() => { audio.sfxKeyClick(); onClose(); }}
                    className="border-red-800 text-red-500 hover:bg-[#ff2244]/10 text-[9px] px-2 py-0.5 font-bold border rounded cursor-pointer"
                  >
                    CLOSE [X]
                  </button>
                </div>
              </div>

              {/* Multi-Tab Selector Header Row */}
              <div className="flex border-b border-[#113a11] pb-1.5 mb-2 gap-1.5 justify-center sm:justify-start">
                {(['GENERAL', 'MILITARY', 'COVERT'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { audio.sfxKeyClick(); setActiveTab(tab); }}
                    className={`px-3 py-1 text-[9px] font-bold border transition-all ${
                      activeTab === tab
                        ? 'bg-[#1a4a1a] text-[#00ff44] border-[#00ff44] text-shadow'
                        : 'text-gray-400 border-transparent hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Dossier Body with tab contents */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 min-h-0 overflow-y-auto custom-scrollbar flex-1 pr-1">
                
                {/* Left Column: Portrait & metadata */}
                <div className="sm:col-span-4 flex flex-col items-center border-r border-[#1a5c1a]/30 pr-2">
                  <LeaderPortrait countryId={countryId} />
                  <div className="text-center mt-2 w-full text-[10px]">
                    <span className="text-white block font-bold truncate leading-tight">
                      {renderValueOrRedacted(1, leader.name)}
                    </span>
                    <span className="text-gray-400 block text-[8px] uppercase">
                      {renderValueOrRedacted(1, `${leader.title} — AGE ${leader.age}`)}
                    </span>
                    <span className="text-[#ffb300] block text-[8px] tracking-wide mt-1 font-bold">
                      {renderValueOrRedacted(1, `POWER CHRONO: ${leader.yearsInPower} YRS`)}
                    </span>
                  </div>
                </div>

                {/* Right Column: Active Tab Details */}
                <div className="sm:col-span-8 text-[10px] space-y-2.5">
                  {activeTab === 'GENERAL' && (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2 border-b border-[#0d2e0d]/50 pb-1.5">
                        <div>
                          <span className="text-green-600 block text-[8px]">IDEOLOGY:</span>
                          <span className="text-white font-bold">{renderValueOrRedacted(1, country.political.ideology)}</span>
                        </div>
                        <div>
                          <span className="text-green-600 block text-[8px]">ALLIANCE BLOCK:</span>
                          <span className="text-[#00ff44] font-bold">{renderValueOrRedacted(1, country.allianceBlock)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-b border-[#0d2e0d]/50 pb-1.5">
                        <div>
                          <span className="text-green-600 block text-[8px]">GDP SIZE:</span>
                          <span className="text-[#00e5ff] font-bold">{renderValueOrRedacted(2, fmtB(country.economic.gdpB))}</span>
                        </div>
                        <div>
                          <span className="text-green-600 block text-[8px]">POPULATION:</span>
                          <span className="text-white">{renderValueOrRedacted(1, fmtPop(country.population))}</span>
                        </div>
                      </div>

                      {/* Gauges & Unrest metrics */}
                      <div className="space-y-1.5 bg-black/40 p-2 rounded border border-[#0d2e0d]">
                        <div className="flex justify-between text-[8px]">
                          <span>STABILITY INDEX:</span>
                          <span className="text-green-400 font-bold">{renderValueOrRedacted(2, `${country.political.stabilityIndex.toFixed(0)}%`)}</span>
                        </div>
                        {!isRedacted(2) && (
                          <div className="w-full h-1 bg-[#0d2e0d] rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${country.political.stabilityIndex}%` }} />
                          </div>
                        )}

                        <div className="flex justify-between text-[8px] mt-1">
                          <span>POPULAR UNREST FORCE:</span>
                          <span className="text-red-400 font-bold">{renderValueOrRedacted(2, `${country.political.popularUnrest.toFixed(0)}%`)}</span>
                        </div>
                        {!isRedacted(2) && (
                          <div className="w-full h-1 bg-[#0d2e0d] rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 animate-pulse" style={{ width: `${country.political.popularUnrest}%` }} />
                          </div>
                        )}

                        <div className="flex justify-between text-[8px] mt-1">
                          <span>LEADER APPROVAL RATIO:</span>
                          <span className="text-[#00e5ff] font-bold">{renderValueOrRedacted(2, `${country.political.leaderApprovalRating.toFixed(0)}%`)}</span>
                        </div>
                        {!isRedacted(2) && (
                          <div className="w-full h-1 bg-[#0d2e0d] rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400" style={{ width: `${country.political.leaderApprovalRating}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'MILITARY' && (
                    <div className="space-y-2.5">
                      {/* Hardware stats list */}
                      <div className="bg-black/35 p-2 rounded border border-[#0d2e0d] space-y-1">
                        <span className="text-green-600 block text-[8px] border-b border-[#0d2e0d] pb-1 uppercase tracking-wider font-bold">OPERATIONAL HARDWARE LEDGER:</span>
                        {isRedacted(2) ? (
                          <div className="py-1 text-center">{renderValueOrRedacted(2, null)}</div>
                        ) : (
                          <div className="space-y-1 text-[9.5px]">
                            {country.arsenal.units && country.arsenal.units.length > 0 ? (
                              country.arsenal.units.filter(u => u.count > 0).map((unit, uIdx) => (
                                <div key={uIdx} className="flex justify-between border-b border-[#0d1f0d]/35 pb-1">
                                  <span className="text-gray-400 font-bold uppercase">{unit.type.replace('_', ' ')}</span>
                                  <span className="text-white font-bold">{unit.operational} / {unit.count} <span className="text-gray-500 text-[8px] font-normal">OP</span></span>
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-500 italic py-1 text-center">No strategic weaponry registered.</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Shield & Readiness values */}
                      <div className="grid grid-cols-2 gap-2 border-t border-[#0d2e0d]/50 pt-2 text-[9.5px]">
                        <div>
                          <span className="text-gray-500 block text-[8px] uppercase">TROOP READINESS RATING:</span>
                          <span className="text-[#ffb300] font-bold">{renderValueOrRedacted(2, `${(country.arsenal.readinessLevel || 75).toFixed(0)}%`)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[8px] uppercase">ABM SHIELD CAPACITY:</span>
                          <span className="text-[#00e5ff] font-bold">{renderValueOrRedacted(2, `${(country.arsenal.abmShieldStrength || 0).toFixed(0)}%`)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'COVERT' && (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-1 gap-2 border-b border-[#0d2e0d]/50 pb-2">
                        <div>
                          <span className="text-cyan-500 block text-[8px] uppercase tracking-wider font-bold">CYBER INTERNET DEFENSIBILITIES:</span>
                          <span className="text-white font-bold">{renderValueOrRedacted(3, `FIREWALL CAPACITY LEVEL ${country.intelligence.cyberFirewallLevel || 1}`)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-b border-[#0d2e0d]/50 pb-2">
                        <div>
                          <span className="text-green-600 block text-[8px] uppercase">NUCLEAR ARSENAL ASSETS:</span>
                          <span className="text-[#ff2244] font-bold">{renderValueOrRedacted(3, country.arsenal.nuclearCapable ? 'CAPABLE ☢' : 'NONE')}</span>
                        </div>
                        <div>
                          <span className="text-green-600 block text-[8px] uppercase">INTELLIGENCE SCAN CONFIDENCE:</span>
                          <span className="text-[#ffb300] font-bold">{renderValueOrRedacted(2, `${(country.intelligence.intelReportConfidence || intelLevel * 33).toFixed(0)}%`)}</span>
                        </div>
                      </div>

                      {/* Active covert spy ops listings */}
                      <div className="space-y-1">
                        <span className="text-cyan-500 block text-[8px] font-bold uppercase tracking-wider">ACTIVE INFILTRATING OPERATIONS:</span>
                        {isRedacted(3) ? (
                          <div className="py-1">{renderValueOrRedacted(3, null)}</div>
                        ) : (
                          <div className="bg-[#020502] p-1.5 border border-[#1a3a1a] rounded max-h-16 overflow-y-auto">
                            {country.intelligence.activeCovertOps && country.intelligence.activeCovertOps.length > 0 ? (
                              country.intelligence.activeCovertOps.map((op, opI) => (
                                <div key={opI} className="text-[9px] text-[#00ff44] flex justify-between border-b border-[#0d1f0d] pb-0.5 mb-0.5">
                                  <span className="font-bold">{op.type.replace('_', ' ')}</span>
                                  <span className="text-gray-400">CHRONO: {op.remainingTicks}t</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-500 italic text-center py-1">No active clandestine missions traced.</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>
              
              {/* === SECTION 3.2: LIVE INTELLIGENCE LOGS SUB-WIDGET === */}
              <div className="mt-2.5 border-t border-[#1a5c1a]/40 pt-2 shrink-0">
                <div className="text-[8px] text-green-500 font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#00ff44] rounded-full animate-ping" />
                  <span>LIVE INTELLIGENCE FEED TELEMETRY</span>
                </div>
                <div className="space-y-1 max-h-[64px] overflow-y-auto custom-scrollbar">
                  {country.lastEventLog && country.lastEventLog.length > 0 ? (
                    country.lastEventLog.slice(0, 5).map((log, logIdx) => (
                      <div key={logIdx} className="text-[8.5px] text-[#00ff44] bg-[#020502] p-1 border border-[#122e12] rounded flex items-start gap-1">
                        <span className="text-[7.5px] text-red-500 font-bold bg-red-950/40 px-1 border border-red-900 rounded select-none uppercase scale-95 shrink-0 font-sans">INTEL</span>
                        <span className="flex-1 text-gray-300 font-mono truncate" title={log}>{log}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-[8px] text-gray-500 italic py-1 text-center bg-[#020502] rounded border border-[#122e12]/50">No strategic telemetry logged for this geographic sector.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Dossier Bottom Interactive Actions context row */}
            <div className="border-t border-[#1a5c1a] pt-2 mt-2 flex flex-wrap gap-2 shrink-0 select-none">
              {hudMode === 'STATE' && countryId !== playerCountryId && (
                <>
                  <button
                    onClick={handleProposeAlliance}
                    className="flex-1 min-w-[90px] py-1 border border-[#00ff44] text-[8px] font-bold text-[#00ff44] rounded uppercase hover:bg-[#00ff44]/15 cursor-pointer text-center"
                  >
                    PROPOSE ALLIANCE
                  </button>
                  <button
                    onClick={handleSendAid}
                    className="flex-1 min-w-[95px] py-1 border border-[#00e5ff] text-[8px] font-bold text-[#00e5ff] rounded uppercase hover:bg-[#00e5ff]/15 cursor-pointer text-center"
                  >
                    SEND AID $5B
                  </button>
                  <button
                    onClick={handleImposeSanctions}
                    className="flex-1 min-w-[90px] py-1 border border-[#ff2244] text-[8px] font-bold text-[#ff2244] rounded uppercase hover:bg-[#ff2244]/15 cursor-pointer text-center"
                  >
                    SANCTION
                  </button>
                </>
              )}

              {hudMode === 'WAR_ROOM' && countryId !== playerCountryId && (
                <>
                  <button
                    onClick={handleSetTarget}
                    className="flex-1 min-w-[120px] py-1.5 bg-red-950/45 border border-red-500 text-[9px] font-bold text-red-500 rounded uppercase hover:bg-[#ff2244]/20 cursor-pointer animate-pulse text-center"
                  >
                    LOCK AS MISSILE TARGET
                  </button>
                </>
              )}

              {hudMode === 'ANALYST' && countryId !== playerCountryId && (
                <>
                  <button
                    onClick={handleCovertOp}
                    className="flex-1 min-w-[120px] py-1 border border-[#ffb300] text-[9px] font-bold text-[#ffb300] rounded uppercase hover:bg-[#ffb300]/15 cursor-pointer text-center"
                  >
                    LAUNCH COVERT SPY EXPAND (+1 INTEL)
                  </button>
                </>
              )}

              <span className="text-[7px] text-gray-600 uppercase block w-full text-center mt-1">
                INTELLIGENT RECORD COMPILING SEC_M4. DO NOT RECORD TRACES.
              </span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default DossierCard;
