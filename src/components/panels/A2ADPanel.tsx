import React, { useState } from 'react';
import { useA2ADStore } from '../../store/a2adStore';
import { useWorldStore } from '../../store/worldStore';
import { Shield, Target, Satellite, Radio, Plane, Zap, Crosshair } from 'lucide-react';
import { A2ADSystem } from '../../types';

export default function A2ADPanel() {
  const { 
    a2adSystems, 
    satellites,
    bomberForces,
    carrierStrikeGroups,
    gpsAccuracyByRegion,
    globalPrecisionMunitionsDegradation,
    globalC2Degradation,
    orderCarrierPosture
  } = useA2ADStore();

  const [activeTab, setActiveTab] = useState<'A2AD_ZONES' | 'SPACE_OPS' | 'CARRIERS' | 'BOMBERS'>('A2AD_ZONES');

  return (
    <div className="w-full h-full flex flex-col pt-1 bg-black/40 text-slate-200">
      <div className="flex border-b border-white/10 mb-2 px-2 text-xs">
        <button 
          onClick={() => setActiveTab('A2AD_ZONES')} 
          className={`px-3 py-2 border-b-2 font-mono ${activeTab === 'A2AD_ZONES' ? 'border-amber-500 text-amber-500' : 'border-transparent hover:bg-white/5'}`}
        >
          <Shield className="inline-block w-3 h-3 mr-1"/> SURF-TO-AIR
        </button>
        <button 
          onClick={() => setActiveTab('SPACE_OPS')} 
          className={`px-3 py-2 border-b-2 font-mono ${activeTab === 'SPACE_OPS' ? 'border-blue-500 text-blue-500' : 'border-transparent hover:bg-white/5'}`}
        >
          <Satellite className="inline-block w-3 h-3 mr-1"/> C4ISR ORBITAL
        </button>
        <button 
          onClick={() => setActiveTab('CARRIERS')} 
          className={`px-3 py-2 border-b-2 font-mono ${activeTab === 'CARRIERS' ? 'border-cyan-500 text-cyan-500' : 'border-transparent hover:bg-white/5'}`}
        >
          <Target className="inline-block w-3 h-3 mr-1"/> MARITIME STRIKE
        </button>
        <button 
          onClick={() => setActiveTab('BOMBERS')} 
          className={`px-3 py-2 border-b-2 font-mono ${activeTab === 'BOMBERS' ? 'border-rose-500 text-rose-500' : 'border-transparent hover:bg-white/5'}`}
        >
          <Plane className="inline-block w-3 h-3 mr-1"/> STRATEGIC BOMBERS
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        
        {/* Global Impact Header */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-red-950/30 border border-red-500/20 p-2 text-xs">
            <div className="text-red-500/70 mb-1">GLOBAL GPS DEGRADATION</div>
            <div className="text-xl text-red-500 font-mono">{(globalPrecisionMunitionsDegradation * 100).toFixed(0)}%</div>
          </div>
          <div className="bg-orange-950/30 border border-orange-500/20 p-2 text-xs">
            <div className="text-orange-500/70 mb-1">C2 FRAGMENTATION</div>
            <div className="text-xl text-orange-500 font-mono">{(globalC2Degradation * 100).toFixed(0)}%</div>
          </div>
        </div>

        {activeTab === 'A2AD_ZONES' && (
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-amber-500 border-b border-amber-500/20 pb-1">Integrated Air Defense Systems</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.values(a2adSystems).map(sys => (
                <div key={sys.id} className="bg-black/60 border border-white/10 p-3 relative">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xs font-mono text-cyan-400">{sys.id}</div>
                      <div className="text-[10px] text-white/50">{sys.category}</div>
                    </div>
                    <div className={`text-[10px] px-1 py-0.5 rounded font-bold ${
                      sys.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                      sys.status === 'DEGRADED' ? 'bg-yellow-500/20 text-yellow-400' :
                      sys.status === 'SUPPRESSED' ? 'bg-orange-500/20 text-orange-400' :
                      sys.status === 'REDEPLOYING' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {sys.status}
                    </div>
                  </div>
                  <div className="flex text-xs space-x-4 mb-2">
                    <div>Range: <span className="text-white">{sys.engagementRadiusKm} km</span></div>
                    <div>Salvo: <span className="text-white">{sys.salvoCapacity}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SPACE_OPS' && (
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-blue-500 border-b border-blue-500/20 pb-1">Orbital Assets</h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(satellites).map(sat => (
                <div key={sat.id} className="bg-black/60 border border-white/10 p-3 flex justify-between items-center group">
                  <div>
                    <div className="text-xs font-mono text-blue-400">{sat.function} - {sat.ownerNationId}</div>
                    <div className="text-[10px] text-white/50 font-mono">Orbit: {sat.orbitType} | Status: {sat.status}</div>
                  </div>
                  {sat.status !== 'DESTROYED' ? (
                    <button 
                      onClick={() => useA2ADStore.getState().launchASATStrike({
                        targetSatelliteId: sat.id,
                        initiatingNationId: 'US', // fallback
                        method: 'CO_ORBITAL_INTERCEPTOR',
                        launchedAtTick: useWorldStore.getState().currentTick,
                        successProbability: 0.85,
                        expectedImpactTick: useWorldStore.getState().currentTick + 20,
                        diplomaticExposureRisk: 0.9
                      })}
                      className="text-[10px] font-mono px-3 py-1 bg-red-950 hover:bg-red-900 text-red-500 border border-red-900 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ASAT STRIKE
                    </button>
                  ) : <span className="text-xs text-red-500">DESTROYED</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'CARRIERS' && (
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-cyan-500 border-b border-cyan-500/20 pb-1">Carrier Strike Groups</h3>
            <div className="grid grid-cols-1 gap-3">
              {Object.values(carrierStrikeGroups).map(csg => (
                <div key={csg.id} className="bg-black/60 border border-white/10 p-3">
                  <div className="flex justify-between items-start mb-2">
                     <div>
                       <div className="text-sm font-bold text-cyan-400">{csg.name}</div>
                       <div className="text-xs text-white/50 font-mono">LOC: {csg.lat.toFixed(2)}, {csg.lng.toFixed(2)}</div>
                     </div>
                     <span className="text-xs px-2 py-1 bg-white/5 border border-white/10 text-white shadow-sm font-mono">{csg.posture}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <button onClick={() => orderCarrierPosture(csg.id, 'SURGE')} className="text-[10px] p-1 border border-white/10 hover:bg-white/5 font-mono">SURGE</button>
                    <button onClick={() => orderCarrierPosture(csg.id, 'STANDARD')} className="text-[10px] p-1 border border-white/10 hover:bg-white/5 font-mono">STANDARD</button>
                    <button onClick={() => orderCarrierPosture(csg.id, 'DEFENSIVE')} className="text-[10px] p-1 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-mono">DEFENSIVE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'BOMBERS' && (
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-rose-500 border-b border-rose-500/20 pb-1">Strategic Bomber Forces</h3>
            <div className="grid grid-cols-1 gap-3">
              {Object.values(bomberForces).map(bomber => (
                <div key={bomber.id} className="bg-black/60 border border-white/10 p-3">
                  <div className="flex justify-between items-start">
                     <div>
                       <div className="text-xs font-bold text-rose-400">{bomber.name}</div>
                       <div className="text-[10px] text-white/50">{bomber.aircraftType} | Range: {bomber.combatRadiusKm}km</div>
                     </div>
                     <span className="text-[10px] font-mono px-2 py-0.5 border border-white/10 bg-white/5">{bomber.currentMission}</span>
                  </div>
                  <div className="mt-3">
                     <div className="text-[10px] text-white/40 mb-1">CAPACITY</div>
                     <div className="flex gap-2 text-xs font-mono">
                       Stealth: {bomber.stealthModifier.toFixed(2)} | PenProb: {(bomber.penetrationProbability * 100).toFixed(0)}%
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
