import React, { useState, useEffect } from 'react';
import { useRegimePressureStore } from '../../store/regimePressureStore';
import { useWorldStore } from '../../store/worldStore';
import { EliteFaction } from '../../types';

export const CoupPlanningModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [targetCountryId, setTargetCountryId] = useState<string>('');
  const [targetLeaderId, setTargetLeaderId] = useState<string>('');
  const [factions, setFactions] = useState<EliteFaction[]>([]);
  const [fundingOffers, setFundingOffers] = useState<Record<string, number>>({});
  const [alternateLeader, setAlternateLeader] = useState<string>('TBD');
  const [executionWindowTick, setExecutionWindowTick] = useState<number>(0);
  const [coupId, setCoupId] = useState<string>('');

  const { initiateCoupPlanning, recruitCoupFaction, designateCoupWindow, activeCoupOps } = useRegimePressureStore();
  const worldCountries = Object.values(useWorldStore.getState().world.countriesById);
  const currentTick = useWorldStore.getState().currentTick;

  useEffect(() => {
    setExecutionWindowTick(currentTick + 15);
  }, [currentTick]);

  const handleSelectTarget = () => {
    if (!targetCountryId) return;
    const country = worldCountries.find(c => c.id === targetCountryId);
    if (country) {
      setTargetLeaderId(country.leaderId);
      const contactableFactions = initiateCoupPlanning(targetCountryId, country.leaderId);
      setFactions(contactableFactions);
      
      // Get the ID of the op we just created
      const ops = useRegimePressureStore.getState().activeCoupOps;
      const latestOp = Object.values(ops).find(o => o.targetCountryId === targetCountryId && o.phase === 'PLANNING');
      if (latestOp) setCoupId(latestOp.id);
      
      setStep(2);
    }
  };

  const handleRecruit = (factionId: string, offer: number) => {
    recruitCoupFaction(coupId, factionId, offer);
    setFundingOffers({ ...fundingOffers, [factionId]: offer });
  };

  const currentOp = coupId ? activeCoupOps[coupId] : null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center font-sans">
      <div className="bg-gray-900 border border-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.3)] w-[600px] flex flex-col">
        <div className="bg-orange-900 text-white font-bold p-3 text-sm flex justify-between">
           <span>COVERT ACTION: COUP ARCHITECTURE (PHASE {step}/5)</span>
           <button onClick={onClose} className="hover:text-orange-300">✕</button>
        </div>
        
        <div className="p-6 text-gray-300">
           {step === 1 && (
             <div className="space-y-4">
               <h3 className="font-bold text-white mb-2">STEP 1: SELECT TARGET REGIME</h3>
               <p className="text-xs text-gray-400 mb-4">Select a sovereign state for destabilization. Higher instability regimes are easier to topple.</p>
               <select className="w-full bg-black border border-gray-700 p-2 text-white" value={targetCountryId} onChange={e => setTargetCountryId(e.target.value)}>
                 <option value="">-- SELECT TARGET --</option>
                 {worldCountries.map(c => (
                   <option key={c.id} value={c.id}>{c.name} (Stab: {Math.floor(c.regimeStability)})</option>
                 ))}
               </select>
               <div className="flex justify-end mt-6">
                 <button className="bg-orange-700 hover:bg-orange-600 text-white px-4 py-2 text-sm font-bold disabled:opacity-50" disabled={!targetCountryId} onClick={handleSelectTarget}>NEXT STEP</button>
               </div>
             </div>
           )}

           {step === 2 && currentOp && (
             <div className="space-y-4">
               <h3 className="font-bold text-white mb-2">STEP 2: RECRUIT CONSPIRATORS</h3>
               <p className="text-xs text-gray-400 mb-4">You must commit capital to flip elite factions. Military factions guarantee force but burn deniability.</p>
               
               <div className="space-y-3">
                 {factions.length === 0 && <div className="text-yellow-500">NO VULNERABLE FACTIONS IDENTIFIED.</div>}
                 {factions.map(f => {
                    const isRecruited = currentOp.conspiratorFactionIds.includes(f.id);
                    return (
                      <div key={f.id} className={`p-3 border ${isRecruited ? 'border-orange-500 bg-orange-900/20' : 'border-gray-700 bg-black'}`}>
                        <div className="flex justify-between font-bold mb-1">
                          <span>{f.name}</span>
                          <span className="text-blue-400">PWR: {f.powerShare}%</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-3">CORRUPTIBILITY: {f.corruptibilityScore} | PRICE TO FLIP: ${Math.floor(f.corruptibilityScore * 1.5)}B</div>
                        
                        {!isRecruited ? (
                          <div className="flex items-center gap-2">
                            <input type="number" min="0" className="bg-gray-800 border border-gray-600 w-24 p-1 text-white text-sm" placeholder="$B" id={`offer-${f.id}`} />
                            <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 text-xs" onClick={() => {
                               const ele = document.getElementById(`offer-${f.id}`) as HTMLInputElement;
                               if(ele && ele.value) handleRecruit(f.id, parseInt(ele.value));
                            }}>MAKE OFFER</button>
                          </div>
                        ) : (
                          <div className="text-orange-500 font-bold text-xs">✓ COMMITTED TO CONSPIRACY (PAID ${fundingOffers[f.id]}B)</div>
                        )}
                      </div>
                    );
                 })}
               </div>
               
               <div className="bg-black p-3 border border-gray-700 mt-4 text-xs font-mono">
                 <div>TOTAL CONSPIRATOR POWER: <span className="text-white">{currentOp.conspiratorFactionIds.reduce((acc, fid) => acc + (factions.find(fx => fx.id === fid)?.powerShare || 0), 0)}%</span> (TARGET: {currentOp.requiredPowerShareForSuccess}%)</div>
               </div>

               <div className="flex justify-between mt-6">
                 <button className="text-gray-500 hover:text-white px-4 py-2 text-sm" onClick={() => setStep(1)}>BACK</button>
                 <button className="bg-orange-700 hover:bg-orange-600 text-white px-4 py-2 text-sm font-bold" onClick={() => setStep(3)}>NEXT STEP</button>
               </div>
             </div>
           )}

           {step === 3 && currentOp && (
             <div className="space-y-4">
               <h3 className="font-bold text-white mb-2">STEP 3: DESIGNATE REPLACEMENT</h3>
               <p className="text-xs text-gray-400 mb-4">Select the leader to install upon execution.</p>
               <select className="w-full bg-black border border-gray-700 p-2 text-white" value={alternateLeader} onChange={e => setAlternateLeader(e.target.value)}>
                 <option value="TBD">COALITION COMMAND (UNDECIDED)</option>
                 <option value="EXILE_LEADER">EXILE OPPOSITION LEADER</option>
                 <option value="MILITARY_JUNTA">MILITARY TRIBUNAL</option>
               </select>
               <div className="flex justify-between mt-6">
                 <button className="text-gray-500 hover:text-white px-4 py-2 text-sm" onClick={() => setStep(2)}>BACK</button>
                 <button className="bg-orange-700 hover:bg-orange-600 text-white px-4 py-2 text-sm font-bold" onClick={() => setStep(4)}>NEXT STEP</button>
               </div>
             </div>
           )}

           {step === 4 && currentOp && (
             <div className="space-y-4">
               <h3 className="font-bold text-white mb-2">STEP 4: SET EXECUTION WINDOW</h3>
               <p className="text-xs text-gray-400 mb-4">Set the synchronized execution time. Longer waits increase preparation quality but dramatically raise the risk of exposure.</p>
               
               <div>
                  <label className="text-xs text-gray-400 block mb-1">EXECUTION TICK</label>
                  <input type="range" min={currentTick + 5} max={currentTick + 50} value={executionWindowTick} onChange={e => setExecutionWindowTick(parseInt(e.target.value))} className="w-full" />
                  <div className="text-center font-bold text-white mt-1">TICK {executionWindowTick} (IN {executionWindowTick - currentTick} TICKS)</div>
               </div>

               <div className="flex justify-between mt-6">
                 <button className="text-gray-500 hover:text-white px-4 py-2 text-sm" onClick={() => setStep(3)}>BACK</button>
                 <button className="bg-orange-700 hover:bg-orange-600 text-white px-4 py-2 text-sm font-bold" onClick={() => setStep(5)}>REVIEW</button>
               </div>
             </div>
           )}

           {step === 5 && currentOp && (
             <div className="space-y-4">
               <h3 className="font-bold text-white mb-2">STEP 5: REVIEW & AUTHORIZE</h3>
               
               <div className="bg-black p-4 border border-gray-700 space-y-2 text-sm font-mono text-gray-300">
                  <div>TARGET_ID: <span className="text-white">{currentOp.targetCountryId}</span></div>
                  <div>EXEC_TICK: <span className="text-white">{executionWindowTick}</span></div>
                  <div>FACTIONS_COMMITTED: <span className="text-white">{currentOp.conspiratorFactionIds.length}</span></div>
                  <div>MILITARY_SUPPORT: <span className={currentOp.militaryCommitted ? 'text-green-500' : 'text-red-500'}>{currentOp.militaryCommitted ? 'AFFIRMATIVE' : 'NEGATIVE'}</span></div>
                  <div>CAPITAL_COMMITTED: <span className="text-white">${currentOp.fundingCommitted}B</span></div>
                  <div>DENIABILITY_TRACES: <span className={currentOp.hasPlayerDeniability ? 'text-green-500' : 'text-red-500'}>{currentOp.hasPlayerDeniability ? 'CLEAN' : 'COMPROMISED'}</span></div>
               </div>

               <div className="bg-orange-900/20 text-orange-400 p-3 text-xs border border-orange-900 mt-2">
                 WARNING: AUTHORIZING OPERATION COMMITS FORCES. ABORTING POST-AUTHORIZATION INCURS MASSIVE FINANCIAL AND INTELLIGENCE PENALTIES.
               </div>

               <div className="flex justify-between mt-6">
                 <button className="text-gray-500 hover:text-white px-4 py-2 text-sm" onClick={() => setStep(4)}>BACK</button>
                 <button className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 text-sm font-bold tracking-widest" onClick={() => {
                   designateCoupWindow(coupId, executionWindowTick);
                   onClose();
                 }}>AUTHORIZE OP</button>
               </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};
