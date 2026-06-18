import React, { useState, useMemo } from 'react';
import { usePsyopStore } from '../../store/psyopStore';
import { useLeaderStore } from '../../store/leaderStore';
import { useWorldStore } from '../../store/worldStore';
import { KomprómatType, DistributionChannel } from '../../types';

export const KomprómatModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { initiateKomprómatOp, mediaCutouts } = usePsyopStore();
  const leaders = useLeaderStore(s => s.leadersByCountryId);
  const countries = useWorldStore(s => s.world.countriesById);

  const [step, setStep] = useState(1);
  const [targetCountryId, setTargetCountryId] = useState('');
  const [kompromatType, setKompromatType] = useState<KomprómatType | ''>('');
  const [isFabricated, setIsFabricated] = useState(true);
  const [selectedChannels, setSelectedChannels] = useState<DistributionChannel[]>([]);
  const [primaryOutletId, setPrimaryOutletId] = useState<string | null>(null);

  const selectedLeader = targetCountryId ? leaders[targetCountryId] : null;

  const TYPES: { id: KomprómatType; label: string; risk: number; eff: number }[] = [
    { id: 'FINANCIAL_CORRUPTION', label: 'Financial Corruption', risk: 2, eff: 3 },
    { id: 'SEXUAL_SCANDAL', label: 'Sexual Scandal', risk: 3, eff: 4 },
    { id: 'IDEOLOGICAL_BETRAYAL', label: 'Ideological Betrayal', risk: 4, eff: 5 },
    { id: 'WAR_CRIMES', label: 'War Crimes', risk: 5, eff: 5 },
    { id: 'HEALTH_INCAPACITY', label: 'Health Incapacity', risk: 2, eff: 2 },
    { id: 'FAMILY_CRIMINALITY', label: 'Family Criminality', risk: 2, eff: 3 },
    { id: 'DEEPFAKE_VIDEO', label: 'Deepfake Video', risk: 5, eff: 5 },
    { id: 'FABRICATED_INTERCEPT', label: 'Fabricated Intercept', risk: 4, eff: 4 },
  ];

  const CHANNELS: { id: DistributionChannel; label: string }[] = [
    { id: 'SOCIAL_MEDIA_ORGANIC', label: 'Organic Social Media' },
    { id: 'BOT_NETWORK', label: 'Bot Network' },
    { id: 'STATE_MEDIA_CUTOUT', label: 'Media Cutout' },
    { id: 'LEAKED_DOCUMENT', label: 'Leaked Document' },
    { id: 'ENCRYPTED_CHANNEL', label: 'Encrypted Whispers' }
  ];

  const handleAuthorize = () => {
    if (!selectedLeader || !kompromatType || selectedChannels.length === 0) return;
    initiateKomprómatOp({
      targetLeaderId: selectedLeader.id,
      komprómatType: kompromatType,
      isFabricated,
      placementChannels: selectedChannels,
      primaryOutletId
    });
    onClose();
  };

  // Generate SVG Path for debunk probability
  const svgPath = useMemo(() => {
    // start at 10%, goes up by ~3% per tick for 20 ticks
    let pts = [];
    const w = 400; const h = 100;
    for (let i=0; i<=20; i++) {
       const x = (i/20) * w;
       let yval = 10 + (i * 3); // max ~ 70
       if (yval > 100) yval = 100;
       const y = h - ((yval/100) * h);
       pts.push(`${x},${y}`);
    }
    return `M 0,${h - (10/100)*h} L ${pts.join(' L ')}`;
  }, [isFabricated]);

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-mono">
      <div className="bg-gray-900 border border-red-800 w-full max-w-4xl shadow-2xl shadow-red-900/20">
        
        <div className="bg-red-900/20 border-b border-red-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
             <h2 className="text-xl font-bold text-red-500 tracking-widest">KOMPRÓMAT OPERATION</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6">
            {[1,2,3].map(i => (
               <div key={i} className={`h-1 flex-1 ${step >= i ? 'bg-red-500' : 'bg-gray-800'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg text-white">STEP 1: TARGET & VECTOR</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Target Leader</label>
                  <select className="w-full bg-black border border-gray-700 p-3 text-white focus:border-red-500"
                          value={targetCountryId} onChange={e => setTargetCountryId(e.target.value)}>
                    <option value="">Select Target...</option>
                    {Object.values(leaders).map(l => (
                      <option key={l.id} value={l.countryId}>{l.name} ({countries[l.countryId]?.name})</option>
                    ))}
                  </select>
                  {selectedLeader && (
                    <div className="mt-4 p-4 bg-black border border-gray-800 flex justify-between items-center">
                       <div>
                         <div className="text-xs text-gray-500">CURRENT APPROVAL</div>
                         <div className="text-xl font-bold text-white">{Math.floor((selectedLeader as any).popularity || 50)}%</div>
                       </div>
                       <div className="text-right">
                         <div className="text-xs text-gray-500">VULNERABILITY</div>
                         <div className="text-xl font-bold text-red-400">HIGH</div>
                       </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Intel Source</label>
                  <div className="flex gap-2 mb-4">
                    <button className={`flex-1 p-3 border text-sm font-bold ${isFabricated ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-black border-gray-800 text-gray-500 hover:border-gray-600'}`}
                            onClick={() => setIsFabricated(true)}>
                      FABRICATED (AI/FORGERY)
                    </button>
                    <button className={`flex-1 p-3 border text-sm font-bold ${!isFabricated ? 'bg-green-900/20 border-green-500 text-green-400' : 'bg-black border-gray-800 text-gray-500 hover:border-gray-600'}`}
                            onClick={() => setIsFabricated(false)}>
                      AUTHENTIC INTEL
                    </button>
                  </div>

                  <label className="text-xs text-gray-400 mb-1 block">Vector Type</label>
                  <div className="grid grid-cols-2 gap-2 h-64 overflow-y-auto pr-2">
                    {TYPES.map(t => (
                      <button key={t.id} onClick={() => setKompromatType(t.id)}
                              className={`p-3 border text-left flex flex-col ${kompromatType === t.id ? 'border-red-500 bg-red-900/10' : 'border-gray-800 bg-black hover:border-gray-600'}`}>
                        <span className={`text-xs font-bold mb-1 ${kompromatType === t.id ? 'text-red-400' : 'text-gray-300'}`}>{t.label}</span>
                        <div className="flex justify-between text-[10px] mt-auto border-t border-gray-800 pt-1 text-gray-500">
                          <span>EFF: {'■'.repeat(t.eff)}{'□'.repeat(5-t.eff)}</span>
                          <span>RSK: {'■'.repeat(t.risk)}{'□'.repeat(5-t.risk)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button disabled={!targetCountryId || !kompromatType} onClick={() => setStep(2)} className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 font-bold disabled:opacity-50">NEXT</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg text-white">STEP 2: PLACEMENT STRATEGY</h3>

              {kompromatType === 'DEEPFAKE_VIDEO' && (
                <div className="p-4 bg-orange-900/20 border border-orange-500/50 text-orange-400 text-sm">
                  <div className="font-bold mb-1">WARNING: AI DETECTION IMPROVES CONSTANTLY</div>
                  Delaying detonation increases the chance this asset is debunked before or immediately after release. Detection risk compounds +3% per tick.
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Placement Channels</label>
                  <div className="space-y-2">
                    {CHANNELS.map(ch => {
                      const isSel = selectedChannels.includes(ch.id);
                      return (
                        <button key={ch.id} onClick={() => {
                           if (isSel) setSelectedChannels(s => s.filter(x => x !== ch.id));
                           else setSelectedChannels(s => [...s, ch.id]);
                        }}
                        className={`w-full p-3 border text-left ${isSel ? 'border-red-500 bg-red-900/10 text-white' : 'border-gray-800 text-gray-400 bg-black'}`}>
                           {ch.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Primary Breaking Outlet (Optional)</label>
                  <select className="w-full bg-black border border-gray-700 p-3 text-white focus:border-red-500"
                          value={primaryOutletId || ''} onChange={e => setPrimaryOutletId(e.target.value)}>
                    <option value="">None (Organic Spread)</option>
                    {Object.values(mediaCutouts).filter(mc => !mc.isExposed).map(mc => (
                      <option key={mc.id} value={mc.id}>{mc.outletName} (Cutout)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-800">
                <button onClick={() => setStep(1)} className="px-6 py-2 border border-gray-600 text-white hover:bg-gray-800">BACK</button>
                <button disabled={selectedChannels.length === 0} onClick={() => setStep(3)} className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 font-bold disabled:opacity-50">NEXT</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg text-white">STEP 3: RISK & IMPACT ASSESSMENT</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <h4 className="text-xs text-gray-500 mb-2 font-bold">PROJECTED AT DETONATION</h4>
                   <div className="space-y-3">
                     <div className="bg-black border border-gray-800 p-3 flex justify-between items-center">
                        <span className="text-sm text-gray-400">Approval Rating Drop</span>
                        <span className="text-xl font-bold text-white">-15%</span>
                     </div>
                     <div className="bg-black border border-gray-800 p-3 flex justify-between items-center">
                        <span className="text-sm text-gray-400">Legitimacy Damage</span>
                        <span className="text-xl font-bold text-red-400">SEVERE</span>
                     </div>
                     {isFabricated && (
                        <div className="bg-black border border-gray-800 p-3 flex justify-between items-center">
                           <span className="text-sm text-gray-400">Fabrication Confidence</span>
                           <span className="text-xl font-bold text-amber-500">~75%</span>
                        </div>
                     )}
                   </div>
                </div>

                <div>
                   <h4 className="text-xs text-gray-500 mb-2 font-bold">DEBUNK PROBABILITY CURVE</h4>
                   <div className="bg-black border border-gray-800 p-4 h-40 relative">
                     <div className="absolute left-0 bottom-0 text-[9px] text-gray-600 p-1">Time (Ticks) →</div>
                     <div className="absolute left-0 top-0 text-[9px] text-gray-600 p-1">Risk %</div>
                     <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none" className="overflow-visible">
                        <path d={svgPath} fill="none" stroke="rgba(239, 68, 68, 0.8)" strokeWidth="2" strokeDasharray="4 2" />
                     </svg>
                   </div>
                </div>
              </div>

              <div className="flex justify-between pt-8 border-t border-gray-800">
                <button onClick={() => setStep(2)} className="px-6 py-2 border border-gray-600 text-white hover:bg-gray-800">BACK</button>
                <button onClick={handleAuthorize} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 font-bold text-lg tracking-widest">INITIATE OPERATION</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
