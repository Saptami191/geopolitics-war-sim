import React, { useState } from 'react';
import { useDiplomaticStore, diplo_generateTreatyCodename, diplo_generateCrisisResponseDescription } from '../../store/diplomaticStore';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { PanelFxShell } from '../fx/PanelFxShell';
import { 
  Globe, 
  BookOpen, 
  ShieldAlert, 
  Users, 
  MessageSquare, 
  AlertTriangle,
  FileText,
  Zap,
  Rss,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sliders,
  Send,
  Flag
} from 'lucide-react';
import { Treaty_Type, Diplo_CapitalType } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export default function DiplomacyPanel() {
  const { 
    diplo_relationships, 
    diplo_treaties, 
    diplo_crises, 
    diplo_unscResolutions,
    diplo_unscMembership,
    diplo_blocs,
    diplo_softPowerProgrammes,
    diplo_ambassadors,
    diplo_capitalPool,
    diplo_directorLog,
    diplo_deployInstrument,
    diplo2,
    diplo2_startNegotiation,
    diplo2_advanceNegotiationRound,
    diplo2_recordIncidentResponse,
    diplo2_exerciseLeverage,
    diplo2_launchPublicDiplomacyCampaign,
    diplo2_resolveAllianceStressor
  } = useDiplomaticStore();

  const countries = useWorldStore(s => s.countries);
  const currentTick = useWorldStore(s => s.currentTick);
  
  const [activeTab, setActiveTab] = useState<'RELATIONS' | 'TREATIES' | 'UNSC' | 'CRISES' | 'NEGOTIATIONS' | 'LEVERAGE' | 'CAMPAIGNS' | 'CORPS'>('RELATIONS');
  const [selectedNationId, setSelectedNationId] = useState<string | null>(null);

  // Form State for Starting Talk
  const [negotiationTactic, setNegotiationTactic] = useState<'COMPROMISE' | 'SALAMI_SLICING' | 'BRINKMANSHIP' | 'LEVERAGE_PRESSURE' | 'GOOD_COP_BAD_COP'>('COMPROMISE');
  const [isBackChannel, setIsBackChannel] = useState<boolean>(false);

  // Form State for Campaigns
  const [campaignChannel, setCampaignChannel] = useState<'BROADCAST_PROPAGANDA' | 'ACADEMIC_EXCHANGE' | 'FOREIGN_AID_ANNOUNCEMENT' | 'INFLUENCER_BRIEFING'>('BROADCAST_PROPAGANDA');
  const [campaignTheme, setCampaignTheme] = useState<'DEMOCRATIC_VALUES' | 'SECURITY_COOPERATION' | 'ECONOMIC_BENEFIT' | 'CIVIL_AID'>('SECURITY_COOPERATION');
  const [campaignBudget, setCampaignBudget] = useState<number>(10);
  const [campaignTargetId, setCampaignTargetId] = useState<string>('RU');

  const renderRelationsTab = () => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h3 className="text-xl font-serif text-slate-200">BILATERAL RELATIONS</h3>
          <span className="text-[10px] uppercase font-mono text-slate-500">Live Geopolitical Influence Grid</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-[#0a0a0d] border border-slate-800/80 rounded p-4 h-[600px] overflow-y-auto">
            <h4 className="text-[10px] font-mono text-slate-500 mb-4 tracking-wider uppercase">GLOBAL NATION MATRIX</h4>
            <div className="flex flex-col gap-2">
              {Object.keys(countries).map(countryId => {
                const key = ['US', countryId].sort().join(':');
                const rel = diplo_relationships[key];
                const score = rel ? rel.relationshipScore : 0;
                let bgState = 'bg-slate-700';
                if (score > 30) bgState = 'bg-emerald-500';
                else if (score < -30) bgState = 'bg-red-600';

                return (
                  <button 
                    key={countryId} 
                    onClick={() => setSelectedNationId(countryId)}
                    className={`flex items-center justify-between p-3 rounded border transition-all text-left ${selectedNationId === countryId ? 'bg-slate-900 border-red-700/60 ring-1 ring-red-800/30' : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-900/40 hover:border-slate-700'}`}
                  >
                    <span className="font-mono text-xs font-bold text-slate-300">{countries[countryId].name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] uppercase font-medium text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{rel?.posture || 'NEUTRAL'}</span>
                      <div className="w-16 h-1.5 bg-slate-950 roundedoverflow-hidden">
                        <div className={`h-full ${bgState}`} style={{ width: `${Math.min(100, Math.max(0, (score + 100) / 2))}%`}}></div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 bg-[#0a0a0d] border border-slate-800/80 rounded p-5 flex flex-col justify-between">
            {selectedNationId ? (
              <div className="flex flex-col gap-5 h-full justify-between">
                <div>
                  <div className="flex justify-between items-start border-b border-slate-900 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-10 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-500 rounded uppercase">
                        {selectedNationId}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold font-serif text-slate-100">{countries[selectedNationId].name}</h2>
                        <span className="text-[9px] uppercase bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                          CODENAME: PROX_STATE_{selectedNationId}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-900 rounded align-right">
                      <span className="block text-[8px] font-mono text-slate-500 text-right uppercase">Alignment</span>
                      <span className="font-bold text-xl font-mono text-red-500">
                        {diplo_relationships[['US', selectedNationId].sort().join(':')]?.relationshipScore || 0}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                    <div className="p-4 bg-slate-950/40 border border-slate-800/50 rounded flex flex-col justify-between">
                       <span className="text-[10px] font-mono text-slate-500 uppercase">Posture State</span>
                       <span className="text-sm font-bold font-mono text-slate-300 mt-1">
                          {diplo_relationships[['US', selectedNationId].sort().join(':')]?.posture || 'NOT DISCLOSED'}
                       </span>
                    </div>
                    <div className="p-4 bg-slate-950/40 border border-slate-800/50 rounded flex flex-col justify-between">
                       <span className="text-[10px] font-mono text-slate-500 uppercase">Ambassador Status</span>
                       <span className="text-sm font-bold font-mono text-slate-300 mt-1">
                          {diplo_ambassadors.find(a => a.assignedNationId === selectedNationId)?.status || 'NO ACCREDITATION'}
                       </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/40 border border-[#222] rounded mt-5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3">Core Diplomatic Instruments</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 text-xs font-mono rounded text-slate-200 transition-colors" onClick={() => diplo_deployInstrument('SUMMIT_REQUEST', 'US', selectedNationId, 0, null)}>Request Summit</button>
                      <button className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 text-xs font-mono rounded text-amber-500 transition-colors" onClick={() => diplo_deployInstrument('FORMAL_PROTEST', 'US', selectedNationId, 0, null)}>Formal Protest</button>
                      <button className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 text-xs font-mono rounded text-red-400 transition-colors" onClick={() => diplo_deployInstrument('AMBASSADOR_RECALL', 'US', selectedNationId, 0, null)}>Recall Ambassador</button>
                      <button className="bg-slate-900 hover:bg-slate-800 border border-[#300] p-2 text-xs font-mono rounded text-red-600 transition-colors" onClick={() => diplo_deployInstrument('AMBASSADOR_EXPULSION', 'US', selectedNationId, 0, null)}>Expel Ambassador</button>
                    </div>
                  </div>
                </div>

                {/* Treaty Negotiation Opener */}
                <div className="p-4 bg-red-950/10 border border-red-900/30 rounded mt-5">
                   <div className="flex justify-between items-center mb-3">
                      <h5 className="text-[10px] uppercase font-mono font-bold text-red-500">Initiate Treaty Talks</h5>
                      <span className="text-[8px] font-mono text-slate-500">MODULE 2 SIGNATURE SUITE</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div>
                         <label className="block text-[8px] font-mono text-slate-500 uppercase mb-1">Talk Tactic</label>
                         <select 
                            value={negotiationTactic}
                            onChange={(e) => setNegotiationTactic(e.target.value as any)}
                            className="bg-slate-950 text-slate-300 border border-slate-800 rounded p-1.5 text-xs w-full font-mono outline-none"
                         >
                            <option value="COMPROMISE">COMPROMISE (Fair)</option>
                            <option value="SALAMI_SLICING">SALAMI SLICING (Incremental)</option>
                            <option value="BRINKMANSHIP">BRINKMANSHIP (Urgent/ Risky)</option>
                            <option value="LEVERAGE_PRESSURE">LEVERAGE PRESSURE (Resource-Backed)</option>
                            <option value="GOOD_COP_BAD_COP">GOOD COP BAD COP</option>
                         </select>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-800 rounded p-1.5 h-9">
                         <input 
                            type="checkbox" 
                            id="backChannelCheck" 
                            checked={isBackChannel}
                            onChange={(e) => setIsBackChannel(e.target.checked)}
                            className="accent-red-700"
                         />
                         <label htmlFor="backChannelCheck" className="text-[9px] font-mono text-slate-400 uppercase select-none cursor-pointer">Back-Channel Lines</label>
                      </div>
                      <button 
                         className="bg-red-950 hover:bg-red-900/80 border border-red-700/50 text-red-200 p-2 text-xs font-mono rounded font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                         onClick={() => {
                            const customIssues = [
                               { id: 'trade', label: 'Maritime Trade Corridor Access', playerPosition: 100, counterpartPosition: 50, currentLandingZone: 75, isResolved: false, isSacrificeable: false, linkageTargetId: null },
                               { id: 'security', label: 'Regional Airway De-confliction', playerPosition: 80, counterpartPosition: 20, currentLandingZone: 50, isResolved: false, isSacrificeable: true, linkageTargetId: null }
                            ];
                            diplo2_startNegotiation(selectedNationId, customIssues, negotiationTactic, isBackChannel, currentTick + 25, currentTick);
                            setActiveTab('NEGOTIATIONS');
                         }}
                      >
                         <Send className="w-3.5 h-3.5" /> Start Talks
                      </button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 font-mono text-xs uppercase p-10 border border-dashed border-slate-800 rounded bg-[#07070a]">
                <Globe className="w-8 h-8 mb-3 text-slate-700 animate-pulse" />
                Select a nation from the matrix to view relationship and launch sovereign treaty actions
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTreatiesTab = () => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h3 className="text-xl font-serif text-slate-200">TREATY ARCHITECTURE</h3>
          <span className="text-[10px] uppercase font-mono text-slate-400">Standard & Secret Protocols</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-2">
              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">ACTIVE RATIFIED COVENANTS</h4>
              {Object.values(diplo_treaties).length === 0 ? (
                 <div className="text-xs font-mono text-slate-600 p-8 text-center bg-[#07070a] border border-slate-800 border-dashed rounded">
                    No verified treaties signed or ratified to track.
                 </div>
              ) : (
                 Object.values(diplo_treaties).map(treaty => (
                   <div key={treaty.id} className="bg-[#0a0a0d] border border-slate-800 p-4 rounded shadow-sm flex flex-col gap-2.5">
                     <div className="flex justify-between items-start">
                       <div>
                         <span className="text-[8px] uppercase bg-slate-900 border border-slate-800 font-mono text-slate-400 px-2 py-0.5 mr-2 rounded">{treaty.type}</span>
                         <h4 className="font-serif font-bold text-md text-slate-200 mt-1">{treaty.codename}</h4>
                       </div>
                       <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded ${treaty.status === 'RATIFIED' ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' : 'bg-amber-950 border border-amber-800 text-amber-500'}`}>
                         {treaty.status}
                       </span>
                     </div>
                     <div className="text-[10px] text-slate-400 font-mono bg-slate-950 p-2.5 rounded border border-slate-900/60 flex flex-col gap-1.5">
                       <span>Obligators: <strong className="text-slate-300">{treaty.partyNationIds.join(' ⟷ ')}</strong></span>
                       {treaty.terms && treaty.terms.length > 0 && (
                          <div className="mt-1 flex flex-col gap-1">
                             <span className="text-[8px] uppercase text-slate-500">Clauses & Compliance Checked (Tick):</span>
                             {(treaty.terms || []).map(t => (
                                <div key={t.id} className="flex justify-between items-center text-[9px] border-b border-slate-900 pb-1">
                                   <span className="text-slate-400">● {t.description} ({t.verificationMethod})</span>
                                   <span className={t.complianceScore > 70 ? "text-emerald-400 font-bold" : "text-amber-500 font-bold"}>{t.complianceScore.toFixed(0)}%</span>
                                </div>
                             ))}
                          </div>
                       )}
                     </div>
                   </div>
                 ))
              )}
           </div>

           <div className="bg-[#0a0a0d] border border-slate-800 rounded p-4">
              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-3">CONCLUDED SECRET ACTIONS & CLASSIFIED TRANSCRIPTS</h4>
              <div className="bg-slate-950 rounded border border-slate-900 p-4 text-xs font-mono text-slate-400 min-h-[300px] flex flex-col gap-3">
                 <span className="text-slate-500 text-[10px]">INTELLIGENCE SECURITY PROTOCOLS AUDITED:</span>
                 {Object.values(diplo_treaties)
                    .flatMap(t => t.secretProtocols || [])
                    .map(sec => (
                       <div key={sec.id} className="p-3 bg-red-950/10 border border-red-900/30 rounded flex flex-col gap-1">
                          <div className="flex justify-between">
                             <strong className="text-red-400 text-[10px] uppercase">SECRET PROTOCOL: {sec.codename}</strong>
                             <span className="text-[8px] bg-red-900/20 text-red-400 px-1.5 rounded">RISK: {(sec.unmaskProbability * 100).toFixed(0)}%</span>
                          </div>
                          <p className="text-[10px] text-slate-300 italic mt-1 bg-black p-2 rounded border border-red-900/10">{sec.clausePayload}</p>
                       </div>
                    ))}
                 {Object.values(diplo_treaties).flatMap(t => t.secretProtocols || []).length === 0 && (
                    <div className="h-full flex items-center justify-center text-slate-600 text-center uppercase text-[10px]">
                       No secret protocols generated or logged. Conclude premium talks with back-channels active to unlock.
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderUNSCTab = () => {
    return (
      <div className="flex flex-col gap-4">
         <div className="flex justify-between items-center border-b border-slate-800 pb-2">
           <h3 className="text-xl font-serif text-slate-200">SECURITY COUNCIL (UNSC)</h3>
           <span className="text-[10px] uppercase font-mono text-slate-400">P5 VETO SYSTEM ACTIVE</span>
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-[#0a0a0d] border border-slate-800 p-4 rounded flex flex-col gap-3">
               <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Chamber Composition & Powers</h4>
               <div className="flex flex-col gap-2">
                 <div className="text-[8px] text-amber-500 font-bold uppercase mb-1 font-mono tracking-wider">P5 PERMANENT MEMBERS</div>
                 {(diplo_unscMembership.permanentMembers || []).map(m => (
                    <div key={m} className="p-2 border border-slate-800 bg-slate-950 font-mono text-xs flex justify-between items-center rounded">
                      <span className="font-bold text-slate-300">{countries[m]?.name || m}</span>
                      <span className="text-[8px] font-bold shadow bg-amber-950/80 border border-amber-900/60 text-amber-500 px-2 py-0.5 rounded tracking-widest">P5_VETO</span>
                    </div>
                 ))}
               </div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-4">
               <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">UN RESOLUTION VOTING & LOBBY RESULTS</h4>
               {(diplo_unscResolutions || []).map(res => (
                 <div key={res.id} className="bg-[#0a0a0d] border border-slate-800 p-4 rounded shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                       <div>
                          <span className="text-[8px] uppercase bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">{res.type}</span>
                          <h4 className="font-serif font-bold text-md text-slate-200 mt-1.5">{res.codename}</h4>
                       </div>
                       <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${res.status === 'PASSED' ? 'bg-emerald-950 border-emerald-800 text-emerald-400' : 'bg-red-950 border-red-800 text-red-500'}`}>
                         STATUS: {res.status}
                       </span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-900 text-xs font-mono text-slate-400 flex flex-col gap-2">
                       <p>Target Sovereign Entity: <strong className="text-slate-300">{res.targetNationId}</strong></p>
                       {res.votes && res.votes.length > 0 && (
                          <div className="mt-2 text-[10px]">
                             <span className="text-slate-500 uppercase text-[8px] block mb-1">Detailed Member Tallies:</span>
                             <div className="grid grid-cols-2 gap-1.5 bg-black p-2 rounded max-h-[140px] overflow-y-auto">
                                {(res.votes || []).map((v, i) => (
                                   <div key={i} className="flex justify-between items-center border-b border-slate-900 pb-1 text-[9px]">
                                      <span className="text-slate-400">{v.nationId} ({v.role.slice(0, 5)})</span>
                                      <span className={`font-bold ${v.vote === 'YES' ? 'text-emerald-400' : v.vote === 'NO' ? 'text-red-400' : 'text-slate-500'}`}>{v.vote}</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                       )}
                    </div>
                 </div>
               ))}
               {diplo_unscResolutions.length === 0 && (
                  <div className="text-xs font-mono text-slate-600 p-10 bg-[#07070a] border border-dashed border-slate-800 rounded text-center">
                     No sovereign draft resolutions submitted for voting tallies yet.
                  </div>
               )}
            </div>
         </div>
      </div>
    );
  };

  const renderNegotiationsTab = () => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h3 className="text-xl font-serif text-slate-200">TREATY NEGOTIATOR</h3>
          <span className="text-[10px] uppercase font-mono text-slate-400">Live Strategic Bilateral Simulation</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Talks Lists */}
          <div className="lg:col-span-5 bg-[#0a0a0d] border border-slate-800 rounded p-4 h-[600px] overflow-y-auto flex flex-col gap-4">
             <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">ACTIVE NEGOTIATION CHANNELS</h4>
             {diplo2.activeNegotiations.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center uppercase text-[10px] p-5">
                   No ongoing treaty drafts actively simulated. 
                   <button 
                     className="mt-3 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-[9px] uppercase rounded"
                     onClick={() => setActiveTab('RELATIONS')}
                   >
                     Select Nation and Open Talks
                   </button>
                </div>
             ) : (
                (diplo2.activeNegotiations || []).map((neg) => {
                   const isLocked = neg.phase === 'CONCLUDED' || neg.phase === 'COLLAPSED';
                   return (
                      <div key={neg.id} className={`p-4 rounded border transition-all ${isLocked ? 'bg-slate-950 border-slate-900 opacity-70' : 'bg-[#0f0f12] border-red-900/30'}`}>
                         <div className="flex justify-between items-start mb-2">
                            <div>
                               <span className="text-[8px] uppercase bg-slate-900 border border-slate-800 font-mono text-red-400 px-1.5 py-0.5 rounded">US ⟷ {neg.counterpartNationId}</span>
                               <h5 className="font-serif font-bold text-sm text-slate-100 mt-2">{neg.isBackChannel ? 'Secret Back-Channel talks' : 'Official State talks'}</h5>
                            </div>
                            <span className="text-[8px] font-mono px-2 py-0.5 rounded uppercase bg-slate-900 border border-slate-800 text-slate-300">{neg.phase}</span>
                         </div>

                         {/* Issue Matrix */}
                         <div className="my-3 flex flex-col gap-1.5 p-2 bg-slate-950 rounded border border-slate-900/60 text-[10px] font-mono text-slate-400">
                            <strong>DRAFTED ARTICLES ({neg.wavesCount} waves):</strong>
                            {(neg.agreedIssues || []).map((iss, index) => (
                               <div key={index} className="flex justify-between border-b border-slate-900 pb-1">
                                  <span>{iss.label}</span>
                                  <span className="text-emerald-400">CONCLUDED</span>
                               </div>
                            ))}
                            {neg.agreedIssues.length === 0 && <span className="text-[9px] text-slate-600">Draft articles are currently under debate...</span>}
                         </div>

                         {/* Momentum & Trust meters */}
                         <div className="flex gap-4 mb-4 text-[10px] font-mono uppercase text-slate-500">
                            <div>Momentum: <strong className="text-blue-400">{neg.rawMomentumAccumulator.toFixed(0)}%</strong></div>
                            <div>Trust: <strong className="text-emerald-400">{neg.bilateralTrustScore.toFixed(0)}%</strong></div>
                            <div>Rounds: <strong className="text-slate-300">{neg.roundsCompleted}/6</strong></div>
                         </div>

                         {!isLocked && (
                            <div className="flex flex-col gap-2 mt-4 border-t border-slate-900 pt-3">
                               <label className="text-[8px] font-mono text-slate-500 uppercase">Apply Tactic round {neg.roundsCompleted + 1}:</label>
                               <div className="grid grid-cols-2 gap-1.5">
                                  {['COMPROMISE', 'SALAMI_SLICING', 'BRINKMANSHIP', 'LEVERAGE_PRESSURE'].map((tac) => (
                                     <button 
                                        key={tac}
                                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-1.5 text-[9px] font-mono uppercase text-slate-300 rounded text-left"
                                        onClick={() => diplo2_advanceNegotiationRound(neg.id, tac as any, currentTick)}
                                     >
                                        Deploy {tac.replace(/_/g, ' ')}
                                     </button>
                                  ))}
                               </div>
                            </div>
                         )}

                         {neg.phase === 'CONCLUDED' && (
                            <div className="text-[10px] font-mono text-emerald-500 mt-2 uppercase flex items-center gap-1">
                               <CheckCircle2 className="w-3.5 h-3.5" /> Outcome resolved: {neg.outcomeType}
                            </div>
                         )}
                         {neg.phase === 'COLLAPSED' && (
                            <div className="text-[10px] font-mono text-red-500 mt-2 uppercase flex items-center gap-1">
                               <AlertCircle className="w-3.5 h-3.5" /> Talks Collapsed: Critical Impasse
                            </div>
                         )}
                      </div>
                   );
                })
             )}
          </div>

          {/* Negotiator console & Event logs */}
          <div className="lg:col-span-7 bg-[#0a0a0d] border border-slate-800 rounded p-4 flex flex-col justify-between">
             <div>
                <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-3">SECURE DECLASSIFIED TRANSCRIPT LOGS</h4>
                <div className="bg-slate-950/40 border border-[#222] rounded p-4 h-[440px] overflow-y-auto font-mono text-xs text-slate-400 flex flex-col gap-2.5">
                   {(diplo2.negotiationEventLog || []).map((log, index) => (
                      <div key={index} className="border-b border-slate-900 pb-2 flex gap-2">
                         <span className="text-red-800">●</span>
                         <p>{log}</p>
                      </div>
                   ))}
                   {diplo2.negotiationEventLog.length === 0 && (
                      <div className="h-full flex items-center justify-center text-slate-600 uppercase text-[10px]">
                         Awaiting diplomatic exchange transcripts. Start discussions or deploy tactics.
                      </div>
                   )}
                </div>
             </div>

             <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-900 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase">
                <span>Negotiation Waves: {diplo2.activeNegotiations.reduce((acc, n) => acc + n.wavesCount, 0)} Total Waves</span>
                <span>Active talks: {diplo2.activeNegotiations.filter(n => n.phase !== 'CONCLUDED' && n.phase !== 'COLLAPSED').length} sessions</span>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLeverageTab = () => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h3 className="text-xl font-serif text-slate-200">LEVERAGE DECK</h3>
          <span className="text-[10px] uppercase font-mono text-slate-400">Tactical Compliance Cards</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {(diplo2.leverageRecords || []).map((lev) => (
              <div key={lev.id} className={`p-4 rounded border flex flex-col justify-between min-h-[220px] transition-all bg-[#0d0d10] border-slate-800/80`}>
                 <div>
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[8px] uppercase font-mono bg-red-950/40 border border-red-900/30 text-red-400 px-2 py-0.5 rounded">{lev.leverageType.replace(/_/g, ' ')}</span>
                       <span className="text-[9px] font-mono text-slate-500">HOLD: {lev.holderNationId}</span>
                    </div>
                    <strong className="block text-sm font-serif text-slate-100 mt-2">TARGET UNILATERAL INDEPENDENCE: {lev.targetNationId}</strong>
                    <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase">Decay Speed Coefficient: {lev.intensityScore > 50 ? 'FAST' : 'SLOW'}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">Exercise Efficacy: X{(lev.intensityScore / 100).toFixed(2)}</p>
                 </div>

                 <div className="mt-5 pt-3 border-t border-slate-900 flex justify-between items-center bg-transparent">
                    <span className="text-[9px] font-mono uppercase text-slate-400">
                       {lev.isBeingExercised ? 'EXERCISED LOCKED' : 'AVAILABLE'}
                    </span>
                    {!lev.isBeingExercised && (
                       <button 
                          className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 border border-red-800/40 text-red-200 text-[10px] font-mono font-bold uppercase rounded transition-colors"
                          onClick={() => diplo2_exerciseLeverage(lev.id, lev.targetNationId, currentTick)}
                       >
                          Play Compliance Card
                       </button>
                    )}
                 </div>
              </div>
           ))}
           {diplo2.leverageRecords.length === 0 && (
              <div className="col-span-3 text-xs font-mono text-slate-600 p-10 bg-[#07070a] border border-dashed border-slate-800 rounded text-center">
                 Compliance Inventory Empty. Generate bigger bilateral relationship scores to automatically unlock dependencies.
              </div>
           )}
        </div>
      </div>
    );
  };

  const renderCampaignsTab = () => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h3 className="text-xl font-serif text-slate-200">PUBLIC DIPLOMACY & INCIDENTS</h3>
          <span className="text-[10px] uppercase font-mono text-slate-400">Bilateral Messaging Campaigns</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* Campaign Launcher */}
           <div className="lg:col-span-5 bg-[#0a0a0d] border border-slate-800 rounded p-4 flex flex-col justify-between">
              <div>
                 <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-900 pb-2">LAUNCH SOFT POWER CAMPAIGN</h4>
                 <div className="flex flex-col gap-4">
                    <div>
                       <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Target State</label>
                       <select 
                          value={campaignTargetId} 
                          onChange={(e) => setCampaignTargetId(e.target.value)}
                          className="bg-slate-950 text-slate-300 border border-slate-800 rounded p-2 text-xs w-full font-mono outline-none"
                       >
                          {Object.keys(countries).map(cid => (
                             <option key={cid} value={cid}>{countries[cid].name}</option>
                          ))}
                       </select>
                    </div>

                    <div>
                       <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Broadcasting Channel</label>
                       <select 
                          value={campaignChannel} 
                          onChange={(e) => setCampaignChannel(e.target.value as any)}
                          className="bg-slate-950 text-slate-300 border border-slate-800 rounded p-2 text-xs w-full font-mono outline-none"
                       >
                          <option value="BROADCAST_PROPAGANDA">State Media Broadcast (Political cost)</option>
                          <option value="ACADEMIC_EXCHANGE">Institutional Exchange (Political cost)</option>
                          <option value="FOREIGN_AID_ANNOUNCEMENT">Foreign Aid Announcement (Economic cost)</option>
                          <option value="INFLUENCER_BRIEFING">Influencer Briefings (Political cost)</option>
                       </select>
                    </div>

                    <div>
                       <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Narrative Theme</label>
                       <select 
                          value={campaignTheme} 
                          onChange={(e) => setCampaignTheme(e.target.value as any)}
                          className="bg-slate-950 text-slate-300 border border-slate-800 rounded p-2 text-xs w-full font-mono outline-none"
                       >
                          <option value="DEMOCRATIC_VALUES">Promote Democratic Freedom</option>
                          <option value="SECURITY_COOPERATION">Sovereign Mutual Defence Cooperation</option>
                          <option value="ECONOMIC_BENEFIT">Synergist Tariff-Free Trade Cooperation</option>
                          <option value="CIVIL_AID">Civil Resilience Disaster Response Relief</option>
                       </select>
                    </div>

                    <div>
                       <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Capital Budget allocation</label>
                       <input 
                          type="number" 
                          value={campaignBudget}
                          onChange={(e) => setCampaignBudget(Number(e.target.value))}
                          className="bg-slate-950 text-slate-300 border border-slate-800 rounded p-2 text-xs w-full font-mono outline-none"
                          min="1" 
                          max="100"
                       />
                    </div>
                 </div>
              </div>

              <button 
                 className="mt-6 bg-[#0c2c1c] hover:bg-emerald-900 border border-emerald-800/60 text-emerald-200 p-2.5 text-xs font-mono rounded font-bold uppercase transition-colors"
                 onClick={() => {
                    diplo2_launchPublicDiplomacyCampaign(campaignTargetId, campaignChannel, campaignTheme, campaignBudget, currentTick);
                 }}
              >
                 Authorize Messaging Campaign
              </button>
           </div>

           {/* Active Campaigns list and Incident Alerts */}
           <div className="lg:col-span-7 flex flex-col gap-4">
              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">ACTIVE BROADCAST CHANNELS & ONGOING CAMPAIGNS</h4>
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                 {(diplo2.publicDiplomacyCampaigns || []).map((c) => (
                    <div key={c.id} className="p-3 bg-slate-950 rounded border border-slate-900 text-xs font-mono text-slate-400">
                       <div className="flex justify-between font-bold text-slate-300">
                          <span>Target ID: {c.targetNationId}</span>
                          <span className={c.isActive ? 'text-emerald-400' : 'text-slate-600'}>{c.isActive ? 'RUNNING' : 'EXPIRED'}</span>
                       </div>
                       <p className="mt-1">Theme: {c.narrativeTheme.replace(/_/g, ' ')} | Channel: {c.channel.replace(/_/g, ' ')}</p>
                       <p className="mt-1">Audience Reach Factor: {c.effectivenessScore}/100 | Yield: +{c.effectivenessScore} score</p>
                    </div>
                 ))}
                 {diplo2.publicDiplomacyCampaigns.length === 0 && (
                    <div className="text-xs font-mono text-slate-600 p-6 bg-[#07070a] border border-dashed border-slate-800 rounded text-center">
                       No broadcasts actively broadcasting. Use the launcher panel on the left to authorize.
                    </div>
                 )}
              </div>

              {/* Incidents response console */}
              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-3">Sovereign Crisis & Incidents Response alerts</h4>
              <div className="flex flex-col gap-3 overflow-y-auto">
                 {(diplo2.diplomaticIncidents || []).map((inc) => (
                    <div key={inc.id} className={`p-4 rounded border ${inc.consequenceApplied ? 'bg-slate-950 border-slate-900 opacity-60' : 'bg-red-950/20 border-red-900/40 text-red-200 animate-pulse'}`}>
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-mono bg-red-950 text-red-500 px-1.5 rounded uppercase">CRITICAL INCIDENT ALERT: {inc.type.replace(/_/g, ' ')}</span>
                          <span className="text-[9px] font-mono text-slate-400">Origin: {inc.affectedNationId}</span>
                       </div>
                       <p className="text-[10px] font-mono text-slate-300 italic mb-3">Geopolitical flashpoint: {inc.severity} Severity</p>
                       
                       {!inc.consequenceApplied ? (
                          <div className="flex flex-col gap-2 bg-[#050505] p-2 rounded border border-red-900/10">
                             <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Sovereign Command Response:</span>
                             {['DENIABILITY_DISSOCIATION', 'ASYMMETRIC_BREACH', 'LITERAL_CONFESSION', 'TACTICAL_DE_ESCALATION'].map((choice) => (
                                <button
                                   key={choice}
                                   className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-1.5 text-[9px] font-mono uppercase text-slate-300 rounded text-left"
                                   onClick={() => diplo2_recordIncidentResponse(inc.id, choice as any, currentTick)}
                                >
                                   Deploy {choice.replace(/_/g, ' ')}
                                </button>
                             ))}
                          </div>
                       ) : (
                          <div className="text-[9px] font-mono text-emerald-500 uppercase">
                             ✔ Logged choice: {inc.chosenResponse}
                          </div>
                       )}
                    </div>
                 ))}
                 {diplo2.diplomaticIncidents.length === 0 && (
                    <div className="text-xs font-mono text-slate-600 p-6 bg-[#07070a] border border-dashed border-slate-800 rounded text-center">
                       No diplomatic incidents logged. Tensions are standard.
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderCrisesTab = () => {
     return (
       <div className="flex flex-col gap-4">
          <h3 className="text-xl font-serif text-slate-200 border-b border-slate-800 pb-2">DIPLOMATIC CRISES</h3>
          <div className="grid grid-cols-1 gap-4">
            {diplo_crises.length === 0 ? (
              <div className="text-sm font-mono text-slate-500 p-4 text-center border border-slate-800 rounded bg-slate-900">
                NO ACTIVE CRISES
              </div>
            ) : (
              (diplo_crises || []).map(crisis => (
                 <div key={crisis.id} className="bg-slate-900 border-l-4 border-l-red-500 border-t border-b border-r border-slate-800 p-4 rounded-r">
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="font-serif font-bold text-red-400 text-lg uppercase">{crisis.type.replace(/_/g, ' ')}</h4>
                       <span className="text-xs font-mono bg-red-950 text-red-400 px-2 py-1 rounded">URGENCY: {crisis.urgencyScore}</span>
                    </div>
                    <div className="text-xs text-slate-400 mb-4 font-mono">Involving: {crisis.involvedNationIds.join(', ')}</div>
                    
                    {crisis.status === 'ACTIVE' && (
                      <div className="flex flex-col gap-2">
                        {(crisis.availableResponses || []).map(resp => (
                           <div key={resp.id} className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-600 transition-colors rounded flex justify-between items-center">
                              <div>
                                 <h5 className="font-xs font-bold font-mono text-slate-300">{resp.instrument}</h5>
                                 <p className="text-[10px] text-slate-500 mt-1 max-w-md">{diplo_generateCrisisResponseDescription(resp, crisis)}</p>
                              </div>
                              <button className="bg-slate-800 text-[10px] text-white px-3 py-1 font-mono hover:bg-slate-700 uppercase rounded">Deploy</button>
                           </div>
                        ))}
                      </div>
                    )}
                 </div>
              ))
            )}
          </div>
       </div>
     );
  };

  const renderBlocsTab = () => {
     return (
        <div className="flex flex-col gap-4">
           <h3 className="text-xl font-serif text-slate-200 border-b border-slate-800 pb-2">BLOC DYNAMICS</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {Object.values(diplo_blocs).map(bloc => (
                  <div key={bloc.id} className="bg-[#0a0a0d] border border-slate-850 p-4 rounded-sm shadow-sm flex flex-col gap-2.5">
                     <h4 className="font-serif font-bold text-md text-slate-100">{bloc.name}</h4>
                     <div className="flex items-center gap-4 mb-2 font-mono text-[10px]">
                        <span className="uppercase bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">{bloc.status}</span>
                        <div className="text-slate-500">Cohesion: <strong className="text-red-500 font-bold">{bloc.cohesionScore}%</strong></div>
                     </div>
                     <div className="flex flex-wrap gap-1.5 mt-2">
                        {(bloc.memberNationIds || []).map(mid => (
                           <span key={mid} className="px-2 py-1 bg-slate-950 border border-slate-800 text-[9px] rounded font-mono text-slate-400">{countries[mid]?.name || mid}</span>
                        ))}
                     </div>
                  </div>
               ))}
           </div>
        </div>
     );
  };

  const renderSoftPowerTab = () => {
     return (
        <div className="flex flex-col gap-4">
           <h3 className="text-xl font-serif text-slate-200 border-b border-slate-800 pb-2">SOFT POWER OPERATIONS</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(diplo_softPowerProgrammes || []).map(prog => (
                 <div key={prog.id} className="bg-slate-900 border border-slate-700 p-4 rounded">
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-500 px-2 py-0.5 uppercase mb-2 inline-block rounded">{prog.category.replace(/_/g, ' ')}</span>
                    <h4 className="font-mono text-xs text-slate-300 mb-2">Target: {prog.targetNationId}</h4>
                    <div className="text-[10px] text-slate-500 uppercase flex gap-4">
                       <span>Budget: ${prog.budgetAllocated}M</span>
                       <span>Yield: +{prog.cumulativeEffect} Total</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>
     );
  };

  const renderCorpsTab = () => {
     return (
        <div className="flex flex-col gap-4">
           <h3 className="text-xl font-serif text-slate-200 border-b border-slate-800 pb-2">AMBASSADOR NETWORK</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(diplo_ambassadors || []).map(amb => (
                 <div key={amb.id} className="bg-[#0a0a0d] border border-slate-800/80 p-3.5 rounded flex justify-between items-center">
                    <div>
                      <div className="font-serif font-bold text-slate-200">{amb.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">{amb.specialisation} | POSTED: {amb.assignedNationId}</div>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded ${amb.status === 'POSTED' ? 'bg-emerald-950 border border-emerald-850 text-emerald-500' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>
                      {amb.status}
                    </span>
                 </div>
              ))}
           </div>

           <div className="mt-8">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-500 mb-2 tracking-wider">Director Briefing Log</h4>
              <div className="bg-[#050505] p-4 text-[10px] font-mono overflow-y-auto max-h-[300px] border border-[#222]">
                 {(diplo_directorLog || []).map((log, i) => (
                    <div key={i} className="mb-2 text-slate-400 border-b border-slate-900/60 pb-2 flex gap-2">
                       <span className="text-slate-600">»</span>
                       <span>{log}</span>
                    </div>
                 ))}
                 {diplo_directorLog.length === 0 && <span className="text-slate-600">No recent diplomatic dispatches logged in main buffer.</span>}
              </div>
           </div>
        </div>
     );
  };

  return (
    <PanelFxShell panelId="diplomacy" relevantFxTypes={[]}>
      <div className="bg-[#0f0f12] h-[800px] flex flex-col font-sans relative overflow-hidden">
         {/* Top nav */}
         <div className="flex bg-[#050505] border-b border-[#222] overflow-x-auto">
           {[
             { id: 'RELATIONS', label: 'RELATIONS' },
             { id: 'TREATIES', label: 'TREATIES' },
             { id: 'NEGOTIATIONS', label: 'NEGOTIATOR' },
             { id: 'LEVERAGE', label: 'LEVERAGE CARDS' },
             { id: 'CAMPAIGNS', label: 'CAMPAIGNS / ALERTS' },
             { id: 'UNSC', label: 'UNSC' },
             { id: 'CRISES', label: 'CRISES' },
             { id: 'BLOCS', label: 'BLOCS' },
             { id: 'SOFT_POWER', label: 'SOFT PWR' },
             { id: 'CORPS', label: 'CORPS' },
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`px-4 py-3 text-xs font-mono font-bold uppercase transition-colors shrink-0 ${
                 activeTab === tab.id 
                   ? 'border-b-2 border-red-800 text-red-100 bg-red-950/20 font-bold' 
                   : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
               }`}
             >
               {tab.label}
             </button>
           ))}
         </div>

         {/* Capital Pool Strip */}
         <div className="bg-slate-900/40 border-b border-[#222] p-2 px-4 flex items-center justify-between font-mono text-[10px] uppercase text-slate-500">
            <span className="font-bold border-r border-[#333] pr-4 flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-red-500" /> Capital Reserves</span>
            <div className="flex gap-6 pr-4">
               <div>POL <strong className="text-blue-400 font-bold">{diplo_capitalPool.political}</strong></div>
               <div>ECO <strong className="text-emerald-400 font-bold">{diplo_capitalPool.economic}</strong></div>
               <div>MIL <strong className="text-red-400 font-bold">{diplo_capitalPool.military}</strong></div>
               <div>INF <strong className="text-purple-400 font-bold">{diplo_capitalPool.informational}</strong></div>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[#0f0f12] to-[#0a0a0c]">
            {activeTab === 'RELATIONS' && renderRelationsTab()}
            {activeTab === 'TREATIES' && renderTreatiesTab()}
            {activeTab === 'NEGOTIATIONS' && renderNegotiationsTab()}
            {activeTab === 'LEVERAGE' && renderLeverageTab()}
            {activeTab === 'CAMPAIGNS' && renderCampaignsTab()}
            {activeTab === 'UNSC' && renderUNSCTab()}
            {activeTab === 'CRISES' && renderCrisesTab()}
            {activeTab === 'BLOCS' && renderBlocsTab()}
            {activeTab === 'SOFT_POWER' && renderSoftPowerTab()}
            {activeTab === 'CORPS' && renderCorpsTab()}
         </div>
      </div>
    </PanelFxShell>
  );
}
