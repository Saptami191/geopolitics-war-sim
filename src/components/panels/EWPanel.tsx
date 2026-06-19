import React, { useState } from 'react';
import { useEWStore } from '../../store/ewStore';
import { useWorldStore } from '../../store/worldStore';
import { Radio, Crosshair, Map, Shield, Activity, Eye, Zap, AlertTriangle, List, ShieldAlert } from 'lucide-react';
import { EWOperationMode } from '../../types';
import { useDefconStore } from '../../store/defconStore';

export default function EWPanel() {
  const [activeTab, setActiveTab] = useState<'MAP' | 'ASSETS' | 'CAMPAIGNS' | 'ANTI_DRONE' | 'EOB'>('MAP');

  const {
    ewAssets,
    activeCampaigns,
    spectrumContention,
    antiDroneSystems,
    ewIntelProfiles,
    globalSpectrumNoise,
    changeAssetMode,
    setAssetPowerOutput
  } = useEWStore();

  const worldState = useWorldStore.getState();

  const currentDefcon = useDefconStore(s => s.currentDefconLevel);
  const isHostileEnv = currentDefcon <= 3;

  return (
    <div className="w-full h-full flex flex-col bg-black/90 text-slate-200 border-l border-amber-900/50 font-mono relative overflow-hidden">
      
      {/* SCANNING BACKGROUND ANIMATION (subtle) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="w-full h-full bg-[linear-gradient(to_bottom,transparent_0%,rgba(245,158,11,0.2)_50%,transparent_100%)] animate-[scan_4s_ease-in-out_infinite]" />
      </div>

      <div className="flex border-b border-white/10 px-2 text-[10px] sm:text-xs z-10 bg-black/50 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('MAP')} className={`px-2 py-2 flex items-center whitespace-nowrap border-b-2 ${activeTab === 'MAP' ? 'border-amber-500 text-amber-500' : 'border-transparent text-white/50 hover:text-white/80'} transition-colors`}>
          <Map className="w-3 h-3 mr-1" /> SPECTRUM MAP
        </button>
        <button onClick={() => setActiveTab('ASSETS')} className={`px-2 py-2 flex items-center whitespace-nowrap border-b-2 ${activeTab === 'ASSETS' ? 'border-blue-500 text-blue-500' : 'border-transparent text-white/50 hover:text-white/80'} transition-colors`}>
          <Radio className="w-3 h-3 mr-1" /> ASSETS
        </button>
        <button onClick={() => setActiveTab('CAMPAIGNS')} className={`px-2 py-2 flex items-center whitespace-nowrap border-b-2 ${activeTab === 'CAMPAIGNS' ? 'border-rose-500 text-rose-500' : 'border-transparent text-white/50 hover:text-white/80'} transition-colors`}>
          <Crosshair className="w-3 h-3 mr-1" /> CAMPAIGNS
        </button>
        <button onClick={() => setActiveTab('ANTI_DRONE')} className={`px-2 py-2 flex items-center whitespace-nowrap border-b-2 ${activeTab === 'ANTI_DRONE' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-white/50 hover:text-white/80'} transition-colors`}>
          <ShieldAlert className="w-3 h-3 mr-1" /> C-UAS
        </button>
        <button onClick={() => setActiveTab('EOB')} className={`px-2 py-2 flex items-center whitespace-nowrap border-b-2 ${activeTab === 'EOB' ? 'border-purple-500 text-purple-500' : 'border-transparent text-white/50 hover:text-white/80'} transition-colors`}>
          <Eye className="w-3 h-3 mr-1" /> E.O.B.
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 z-10">
        
        {/* GLOBAL HEADER HEADER */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 p-3 bg-white/5 border border-white/10 rounded">
            <div className="text-[10px] text-white/50 mb-1 flex items-center">
              <Activity className="w-3 h-3 justify-center text-amber-500 mr-1" /> GLOBAL NOISE
            </div>
            <div className="text-xl text-amber-400 font-bold">{globalSpectrumNoise.toFixed(0)} dB</div>
          </div>
          <div className="flex-1 p-3 bg-white/5 border border-white/10 rounded">
            <div className="text-[10px] text-white/50 mb-1 flex items-center">
              <AlertTriangle className="w-3 h-3 text-red-500 mr-1" /> THREAT ENV
            </div>
            <div className="text-xl text-red-400 font-bold">{isHostileEnv ? 'ELEVATED' : 'NOMINAL'}</div>
          </div>
        </div>

        {activeTab === 'MAP' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-500 border-b border-amber-500/20 pb-1 mb-3">REGIONAL CONTENTION MAP</h3>
            {spectrumContention.length === 0 ? (
              <div className="text-xs text-white/30 italic px-2">No active spectrum contention detected.</div>
            ) : (
              <div className="grid gap-2">
                {spectrumContention.map((entry, idx) => (
                  <div key={idx} className="bg-black/80 border border-white/10 p-3 flex justify-between items-center rounded">
                    <div>
                      <div className="text-xs text-amber-400 font-bold">{entry.regionId} — {entry.band} BAND</div>
                      <div className="text-[10px] text-white/50 mt-1">Dom: {entry.dominantCountryId || 'CONTESTED'} | LVL: {entry.contentionLevel.toFixed(0)}</div>
                    </div>
                    <div className="text-right">
                       {entry.effectsActive.slice(0, 2).map((eff, i) => (
                         <div key={i} className="text-[9px] bg-red-900/40 text-red-400 px-1 py-0.5 rounded mb-0.5 whitespace-nowrap">{eff.replace(/_/g, ' ')}</div>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ASSETS' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-500 border-b border-blue-500/20 pb-1 mb-3">ELECTRONIC WARFARE ASSETS</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {Object.values(ewAssets)
                .sort((a,b) => b.powerOutput - a.powerOutput)
                .map(asset => (
                <div key={asset.id} className={`bg-black/60 border p-3 rounded flex flex-col ${asset.detectedBy.length > 0 ? 'border-red-500/50' : 'border-white/10'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm font-bold text-blue-400">{asset.name}</div>
                      <div className="text-[10px] text-white/50">{asset.type.replace(/_/g, ' ')}</div>
                    </div>
                    {asset.detectedBy.length > 0 && <span className="text-[9px] bg-red-900/50 text-red-500 px-1 py-0.5 rounded border border-red-500/30 font-bold animate-pulse">DETECTED</span>}
                  </div>
                  
                  <div className="text-[10px] text-white/60 mb-3 grid grid-cols-2 gap-1">
                    <div>Bands: <span className="text-white">{asset.spectrumBands.join(', ')}</span></div>
                    <div>Sig: <span className="text-white bg-white/10 px-1 rounded">{asset.emissionProfile.toFixed(0)}</span></div>
                    <div className="col-span-2">Mode: <span className="text-amber-500 font-bold">{asset.currentMode.replace(/_/g, ' ')}</span></div>
                  </div>

                  <div className="mt-auto pt-2 border-t border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-white/40">POWER: {asset.powerOutput}%</span>
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={asset.powerOutput}
                        onChange={(e) => setAssetPowerOutput(asset.id, parseInt(e.target.value))}
                        className="w-24 accent-blue-500 h-1 bg-white/20 rounded appearance-none"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <button 
                        onClick={() => changeAssetMode(asset.id, 'EMISSION_CONTROL')}
                        className={`text-[9px] py-1 border rounded ${asset.currentMode === 'EMISSION_CONTROL' ? 'bg-white/20 text-white border-white' : 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white'}`}
                      >
                        EMCON
                      </button>
                      <button 
                        onClick={() => changeAssetMode(asset.id, 'BARRAGE_JAM')}
                        className={`text-[9px] py-1 border rounded ${asset.currentMode === 'BARRAGE_JAM' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white'}`}
                      >
                        BARRAGE
                      </button>
                      <button 
                        onClick={() => changeAssetMode(asset.id, 'SPOT_JAM')}
                        className={`text-[9px] py-1 border rounded ${asset.currentMode === 'SPOT_JAM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white'}`}
                      >
                        SPOT
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'CAMPAIGNS' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-rose-500 border-b border-rose-500/20 pb-1 mb-3">ACTIVE CAMPAIGNS</h3>
            {Object.keys(activeCampaigns).length === 0 ? (
              <div className="text-xs text-white/30 italic px-2">No active EW campaigns.</div>
            ) : (
              <div className="grid gap-3">
                {Object.values(activeCampaigns).map(camp => (
                  <div key={camp.id} className="bg-black/60 border border-rose-900/50 p-3 rounded">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <div className="text-sm font-bold text-rose-400">{camp.mode.replace(/_/g, ' ')}</div>
                         <div className="text-[10px] text-white/50">Target: {camp.targetCountryId} | Bands: {camp.targetedBands.join(', ')}</div>
                       </div>
                    </div>
                    <div className="bg-black/50 p-2 rounded border border-white/5 mb-2 h-2 overflow-hidden relative">
                       <div className="absolute top-0 bottom-0 left-0 bg-rose-600/50 animate-pulse" style={{ width: `${camp.intensity}%` }} />
                    </div>
                    <div className="text-[10px] text-white/60">
                      Proj. Success: {(camp.successProbability * 100).toFixed(0)}% | Form: {camp.activeEffects.length} Effects Active
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ANTI_DRONE' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-emerald-500 border-b border-emerald-500/20 pb-1 mb-3">COUNTER-UAS NETWORKS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {Object.values(antiDroneSystems).map(sys => (
                 <div key={sys.id} className="bg-black/60 border border-emerald-900/50 p-3 rounded relative">
                   <div className="flex justify-between">
                     <div className="text-xs font-bold text-emerald-400 font-mono">{sys.systemType.replace(/_/g, ' ')} ARRAY</div>
                     <Shield className="w-3 h-3 text-emerald-500" />
                   </div>
                   <div className="text-[10px] text-white/50 mb-2 mt-1">Region: {sys.regionId}</div>
                   <div className="flex gap-4 text-[10px]">
                     <div>RNG<br/><span className="text-white">{sys.effectiveRange}km</span></div>
                     <div>CAP<br/><span className="text-white">{sys.engagementCapacity}</span></div>
                     <div>LOAD<br/>
                       <span className={sys.currentLoad > sys.engagementCapacity * 0.8 ? 'text-red-400 font-bold' : 'text-white'}>
                         {((sys.currentLoad / sys.engagementCapacity) * 100).toFixed(0)}%
                       </span>
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'EOB' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-purple-500 border-b border-purple-500/20 pb-1 mb-3">ELECTRONIC ORDER OF BATTLE</h3>
            <div className="grid gap-3">
              {Object.values(ewIntelProfiles).map(prof => (
                <div key={prof.countryId} className="bg-black/60 border border-purple-900/50 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-bold text-purple-400">{prof.countryId} ADVERSARY PROFILE</div>
                    <div className="text-[10px] bg-purple-900/30 px-2 py-0.5 rounded border border-purple-500/20">
                      Adaptation: {prof.adaptationScore}
                    </div>
                  </div>
                  <div className="text-[10px] text-white/60 mb-1">SUSPECTED CAPABILITIES:</div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {prof.suspectedCapabilities.map((cap, idx) => (
                      <span key={idx} className="bg-white/5 border border-white/10 px-1 py-0.5 rounded text-[9px] text-white/70">
                        {cap.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] text-white/50 italic flex gap-1 items-start mt-2 border-t border-white/5 pt-2">
                    <div className="text-purple-400">SIG:</div>
                    <div>{prof.observedPatterns[prof.observedPatterns.length - 1] || 'No distinct signature derived.'}</div>
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
