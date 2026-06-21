import React, { useState } from 'react';
import { 
  useRegimePressureStore 
} from '../../store/regimePressureStore';
import { useWorldStore } from '../../store/worldStore';
import { useNationIdentityStore } from '../../store/nationIdentityStore';
import { CoupPlanningModal } from '../popups/CoupPlanningModal';
import { RemovalWorkflowModal } from '../popups/RemovalWorkflowModal';
import { EliteSplitMapOverlay } from './EliteSplitMapOverlay';

export const RegimePressurePanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'OPS' | 'ELITE' | 'OPPOSITION' | 'BLOWBACK'>('OPS');
  
  const { 
    activeProtestCampaigns, 
    activeCoupOps, 
    activeElectionOps, 
    activeOppositionAssets,
    eliteFactions,
    blowbackLog,
    activeBlowbackCrises,
    playerExposureScore,
    concludeProtestCampaign,
    fundOppositionAsset,
    regimeCounterOp,
    cultivateEliteSplit,
    advanceRemovalPhase,
    playerRespondToBlowback
  } = useRegimePressureStore();

  const [showCoupModal, setShowCoupModal] = useState(false);
  const [showRemovalModal, setShowRemovalModal] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [inspectEliteCountry, setInspectEliteCountry] = useState<string | null>(null);

  const renderOpsTab = () => {
    return (
      <div className="space-y-4">
        {Object.values(activeProtestCampaigns).map(op => (
          <div key={op.id} className="bg-gray-800 p-4 border-l-4 border-yellow-500">
             <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-yellow-500">PROTEST: {op.id}</span>
                <span className="text-xs text-gray-400">Target: {op.countryId}</span>
             </div>
             <div className="text-sm">Phase: <span className="text-white">{op.phase}</span></div>
             <div className="text-sm">Intensity: <span className="text-white">{Math.floor(op.currentIntensity)}%</span></div>
             <div className="text-sm">Risk Meter: <span className={op.detectionRisk > 60 ? 'text-red-500' : 'text-green-500'}>{Math.floor(op.detectionRisk)}%</span></div>
             <div className="text-sm">Funding: <span className="text-green-400">${op.playerFundingAmount}B</span></div>
             
             <div className="mt-3 flex space-x-2">
                <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 text-xs" onClick={() => useRegimePressureStore.getState().escalateProtest(op.id, 1)}>ADVANCE ($1B)</button>
                <button className="bg-red-900 hover:bg-red-800 px-3 py-1 text-xs" onClick={() => concludeProtestCampaign(op.id)}>ABORT</button>
             </div>
             {/* Progress bar mock */}
             <div className="w-full h-1 bg-gray-700 mt-3 absolute top-0 left-0"><div className="h-full bg-yellow-500 w-1/3"></div></div>
          </div>
        ))}

        {Object.values(activeCoupOps).map(op => (
          <div key={op.id} className="bg-gray-800 p-4 border-l-4 border-orange-500 relative">
             <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-orange-500">COUP: {op.id}</span>
                <span className="text-xs text-gray-400">Target: {op.targetCountryId}</span>
             </div>
             <div className="text-sm">Phase: <span className="text-white">{op.phase}</span></div>
             <div className="text-sm">Funding: <span className="text-green-400">${op.fundingCommitted}B</span></div>
             <div className="text-sm">Risk Meter: <span className={op.currentDetectionRisk > 60 ? 'text-red-500' : 'text-green-500'}>{Math.floor(op.currentDetectionRisk)}%</span></div>
             <button className="bg-red-900 hover:bg-red-800 px-3 py-1 text-xs mt-3">ABORT</button>
             <div className="w-full h-1 bg-gray-700 mt-3 absolute top-0 left-0"><div className="h-full bg-orange-500 w-1/2"></div></div>
          </div>
        ))}
        {Object.values(activeElectionOps).map(op => (
          <div key={op.id} className="bg-gray-800 p-4 border-l-4 border-blue-500 relative">
             <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-blue-500">ELECTION: {op.id}</span>
                <span className="text-xs text-gray-400">Target: {op.countryId}</span>
             </div>
             <div className="text-sm">Phase: <span className="text-white">{op.phase}</span></div>
             <div className="text-sm">Margin Shift: <span className="text-white">+{Math.floor(op.projectedMarginShift)}%</span></div>
             <div className="text-sm">Risk Meter: <span className={op.detectionRisk > 60 ? 'text-red-500' : 'text-green-500'}>{Math.floor(op.detectionRisk)}%</span></div>
             <div className="mt-3 flex flex-wrap gap-2">
                <button className="bg-gray-700 hover:bg-gray-600 px-2 py-1 text-xs" onClick={() => useRegimePressureStore.getState().addElectionMethod(op.id, 'DARK_MONEY_FUNDING', 1)}>+ MONEY</button>
                <button className="bg-gray-700 hover:bg-gray-600 px-2 py-1 text-xs" onClick={() => useRegimePressureStore.getState().addElectionMethod(op.id, 'DISINFORMATION_CAMPAIGN', 0)}>+ DISINFO</button>
             </div>
             <button className="bg-red-900 hover:bg-red-800 px-3 py-1 text-xs mt-3">ABORT</button>
             <div className="w-full h-1 bg-gray-700 mt-3 absolute top-0 left-0"><div className="h-full bg-blue-500 w-3/4"></div></div>
          </div>
        ))}

        <div className="border border-gray-700 flex flex-col items-center justify-center p-6 bg-gray-800/50 hover:bg-gray-800 cursor-pointer" onClick={() => setShowCoupModal(true)}>
           <span className="text-gray-400 font-bold">+ PLAN NEW OPERATION</span>
        </div>
      </div>
    );
  };

  const renderEliteTab = () => {
    return (
      <div className="space-y-6">
        {Object.entries(eliteFactions).map(([countryId, factions]) => (
          <div key={countryId} className="border border-gray-700 p-4">
             <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
               <div className="font-bold text-gray-300">TARGET: {countryId}</div>
               <button className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-2 py-1" onClick={() => setInspectEliteCountry(countryId)}>VIEW TOPOLOGY MAP</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {(factions || []).map(f => {
                  if (!f.playerContactEstablished) {
                     return (
                       <div key={f.id} className="bg-gray-900 p-3 border border-gray-800 blur-sm flex items-center justify-center relative">
                         <div className="absolute inset-0 flex items-center justify-center z-10 z-[100] blur-none">
                            <span className="text-red-600 font-bold text-center border-y border-red-600 w-full bg-black/80 py-1">[IDENTITY UNKNOWN]</span>
                         </div>
                         <div>UNKNOWN FACTION</div>
                       </div>
                     )
                  }

                  let loyaltyColor = 'bg-green-500';
                  if (f.loyaltyToLeader < 50) loyaltyColor = 'bg-yellow-500';
                  if (f.loyaltyToLeader < f.defectionThreshold) loyaltyColor = 'bg-red-500';

                  return (
                    <div key={f.id} className="bg-gray-800 p-3 relative">
                       <div className="text-xs text-gray-500 mb-1">{f.contactOperativeId ? `HANDLER: ${f.contactOperativeId}` : 'NO HANDLER'}</div>
                       <div className="font-bold flex justify-between">
                         <span className="text-white">{f.name}</span>
                         <span className="text-blue-400">{f.powerShare}% PWR</span>
                       </div>
                       
                       <div className="mt-3">
                         <div className="text-[10px] text-gray-400 mb-1">LOYALTY TO LEADER ({Math.floor(f.loyaltyToLeader)}%)</div>
                         <div className="w-full h-1 bg-gray-700"><div className={`h-full ${loyaltyColor}`} style={{width: `${Math.floor(f.loyaltyToLeader)}%`}}></div></div>
                       </div>

                       <div className="mt-2 flex justify-between items-center">
                         <div className="text-xs text-orange-400">GRIEVANCE: {Math.floor(f.grievanceLevel)}</div>
                         <button className="bg-gray-700 hover:bg-gray-600 px-2 py-1 text-xs" onClick={() => cultivateEliteSplit(countryId, f.id, 1)}>CULTIVATE</button>
                       </div>
                    </div>
                  );
               })}
             </div>
          </div>
        ))}
      </div>
    );
  };

  const renderOppositionTab = () => {
    return (
      <div className="space-y-4">
        {Object.values(activeOppositionAssets).map(asset => (
          <div key={asset.id} className={`bg-gray-800 p-4 border-l-4 ${asset.isCompromised ? 'border-red-600' : 'border-indigo-500'} relative overflow-hidden`}>
             {asset.isCompromised && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                 <div className="transform -rotate-12 border-4 border-red-600 text-red-600 font-bold text-xl py-1 px-4">
                    COMPROMISED
                 </div>
               </div>
             )}
             <div className="flex justify-between items-center mb-2">
                <span className={`font-bold ${asset.isCompromised ? 'text-red-500' : 'text-indigo-400'}`}>{asset.assetName}</span>
                <span className="text-xs bg-gray-900 px-2 py-0.5">{asset.assetType} • {asset.countryId}</span>
             </div>
             
             <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
               <div>CAPACITY: <span className="text-white">{Math.floor(asset.capacityScore)}</span></div>
               <div>PROFILE: <span className="text-white">{Math.floor(asset.publicProfile)}</span></div>
               <div>FINGERPRINT: <span className="text-white">{Math.floor(asset.playerFingerprint)}</span></div>
               <div>SUSPICION: <span className="text-yellow-500">{Math.floor(asset.regimeSuspicion)}</span></div>
             </div>

             <div className="mt-4 flex space-x-2 relative z-20">
                <button className="bg-indigo-900 hover:bg-indigo-800 px-4 py-1 text-xs text-white" disabled={asset.isCompromised} onClick={() => fundOppositionAsset(asset.id, 1)}>
                  FUND ($1B)
                </button>
             </div>
             {asset.isCompromised && (
               <div className="text-xs text-red-400 mt-3 font-bold">ASSET INTEGRITY COMPROMISED — INTEL MAY BE TAINTED</div>
             )}
          </div>
        ))}
      </div>
    );
  };

  const renderBlowbackTab = () => {
    return (
      <div className="space-y-2">
        {(blowbackLog || []).map(log => {
          let badgeColor = 'bg-gray-600';
          if (log.severity === 'RUMOR') badgeColor = 'bg-yellow-600';
          if (log.severity === 'ACCUSATION') badgeColor = 'bg-orange-600';
          if (log.severity === 'PROOF') badgeColor = 'bg-red-600';
          if (log.severity === 'CRISIS') badgeColor = 'bg-red-800 animate-pulse';

          const isActiveAlert = activeBlowbackCrises.includes(log.id);

          return (
            <div key={log.id} className={`p-4 border ${isActiveAlert && log.mediaStormActive ? 'border-red-500 bg-red-900/20' : 'border-gray-700 bg-gray-800'}`}>
               <div className="flex justify-between mb-2">
                 <span className={`text-[10px] font-bold px-2 py-0.5 text-white ${badgeColor}`}>
                   {log.severity}
                 </span>
                 <span className="text-xs text-gray-400">TICK {log.tickOccurred}</span>
               </div>
               <div className="font-mono text-sm text-gray-200 mb-2">{log.worldReactionText}</div>
               <div className="text-xs text-gray-500 mb-4">TARGET: {log.targetCountryId} | OP: {log.opName}</div>
               
               {isActiveAlert && log.mediaStormActive && (
                 <div className="text-red-400 text-xs font-bold mb-3">MEDIA STORM ACTIVE — {log.mediaStormTicksRemaining} TICKS REMAINING</div>
               )}

               {!log.hasBeenAddressedByPlayer && isActiveAlert && (
                 <div className="flex flex-wrap gap-2 mt-2">
                   <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 text-xs" onClick={() => playerRespondToBlowback(log.id, 'DENY')}>DENY</button>
                   <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 text-xs" onClick={() => playerRespondToBlowback(log.id, 'ACKNOWLEDGE')}>ACKNOWLEDGE</button>
                   <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 text-xs" onClick={() => playerRespondToBlowback(log.id, 'BLAME_THIRD_PARTY')}>BLAME THIRD PARTY</button>
                   <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 text-xs" onClick={() => playerRespondToBlowback(log.id, 'OFFER_INVESTIGATION')}>OFFER INVESTIGATION</button>
                 </div>
               )}
            </div>
          );
        })}
        {blowbackLog.length === 0 && <div className="text-center text-gray-500 py-10">NO BLOWBACK ON RECORD</div>}
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[450px] bg-black border-l border-gray-800 shadow-2xl flex flex-col z-[100] font-sans">
      <div className="bg-red-900 text-white font-bold p-3 text-sm flex justify-between items-center tracking-widest border-b-4 border-red-950">
        <div className="flex items-center gap-2">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
           <span>TOP SECRET // COVERT ACTION</span>
        </div>
        <button className="text-gray-300 hover:text-white" onClick={onClose}>✕</button>
      </div>

      <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
         <div className="text-xs text-gray-400">GLOBAL EXPOSURE SCORE</div>
         <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-gray-800">
               <div className={`h-full ${playerExposureScore > 75 ? 'bg-red-500' : playerExposureScore > 50 ? 'bg-orange-500' : playerExposureScore > 25 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: `${Math.floor(playerExposureScore)}%`}}></div>
            </div>
            <div className="text-sm font-bold text-white">{Math.floor(playerExposureScore)} / 100</div>
         </div>
      </div>

      <div className="flex bg-gray-950 text-xs font-bold text-gray-500 border-b border-gray-800">
        <button className={`flex-1 py-3 text-center ${activeTab === 'OPS' ? 'text-white border-b-2 border-red-500 bg-gray-900' : 'hover:text-gray-300'}`} onClick={() => setActiveTab('OPS')}>ACTIVE OPS</button>
        <button className={`flex-1 py-3 text-center ${activeTab === 'ELITE' ? 'text-white border-b-2 border-red-500 bg-gray-900' : 'hover:text-gray-300'}`} onClick={() => setActiveTab('ELITE')}>ELITE FRACTURE</button>
        <button className={`flex-1 py-3 text-center ${activeTab === 'OPPOSITION' ? 'text-white border-b-2 border-red-500 bg-gray-900' : 'hover:text-gray-300'}`} onClick={() => setActiveTab('OPPOSITION')}>OPPOSITION</button>
        <button className={`flex-1 py-3 text-center flex items-center justify-center gap-1 ${activeTab === 'BLOWBACK' ? 'text-white border-b-2 border-red-500 bg-gray-900' : 'hover:text-gray-300'}`} onClick={() => setActiveTab('BLOWBACK')}>
           BLOWBACK {activeBlowbackCrises.length > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-black">
         {activeTab === 'OPS' && renderOpsTab()}
         {activeTab === 'ELITE' && renderEliteTab()}
         {activeTab === 'OPPOSITION' && renderOppositionTab()}
         {activeTab === 'BLOWBACK' && renderBlowbackTab()}
      </div>

      {showCoupModal && <CoupPlanningModal onClose={() => setShowCoupModal(false)} />}
      {showRemovalModal && selectedTargetId && <RemovalWorkflowModal targetLeaderId={selectedTargetId} onClose={() => setShowRemovalModal(false)} />}
      {inspectEliteCountry && <EliteSplitMapOverlay countryId={inspectEliteCountry} onClose={() => setInspectEliteCountry(null)} />}
    </div>
  );
};
