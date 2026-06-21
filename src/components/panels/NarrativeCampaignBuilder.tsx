import React, { useState } from 'react';
import { usePsyopStore } from '../../store/psyopStore';
import { useWorldStore } from '../../store/worldStore';
import { useNationIdentityStore } from '../../store/nationIdentityStore';
import { useLeaderStore } from '../../store/leaderStore';
import { NarrativeTheme, DistributionChannel, BotNetwork, MediaCutout } from '../../types';

export const NarrativeCampaignBuilder: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { createNarrativeCampaign, addChannelToCampaign, botNetworks, mediaCutouts } = usePsyopStore();
  const worldCountries = useWorldStore((s) => s.world.countriesById);
  const leaders = useLeaderStore((s) => s.leadersByCountryId);
  const identities = useNationIdentityStore((s) => s.nationIdentities);

  const [step, setStep] = useState(1);
  
  // Step 1
  const [targetCountryId, setTargetCountryId] = useState<string>('');
  const [theme, setTheme] = useState<NarrativeTheme | ''>('');
  
  // Step 2
  const [coreMessage, setCoreMessage] = useState('');
  const [emotionalRegister, setEmotionalRegister] = useState<'FEAR' | 'ANGER' | 'PRIDE' | 'HOPE' | 'DISGUST' | 'GRIEF' | ''>('');
  const [targetDemographic, setTargetDemographic] = useState('');
  
  // Step 3
  const [selectedChannels, setSelectedChannels] = useState<DistributionChannel[]>([]);
  
  // Step 4
  const [selectedBotNetworkId, setSelectedBotNetworkId] = useState<string | null>(null);
  const [selectedCutoutId, setSelectedCutoutId] = useState<string | null>(null);

  const THEMES: { id: NarrativeTheme; label: string; desc: string; vs: string }[] = [
    { id: 'REGIME_CORRUPTION', label: 'Regime Corruption', desc: 'Their government is stealing from them', vs: 'Autocracies' },
    { id: 'FOREIGN_THREAT_INFLATION', label: 'Foreign Threat Inflation', desc: 'An external enemy threatens their way of life', vs: 'Nationalist states' },
    { id: 'ECONOMIC_GRIEVANCE', label: 'Economic Grievance', desc: 'Their leaders caused their poverty', vs: 'Developing states' },
    { id: 'ETHNIC_NATIONALIST', label: 'Ethnic Nationalist', desc: 'Their identity is under attack', vs: 'Diverse states' },
    { id: 'RELIGIOUS_PERSECUTION', label: 'Religious Persecution', desc: 'Their faith is being suppressed', vs: 'Theocracies' },
    { id: 'DEMOCRATIC_LEGITIMACY', label: 'Democratic Legitimacy', desc: 'The election was stolen', vs: 'Democracies' },
    { id: 'MILITARY_GLORIFICATION', label: 'Military Glorification', desc: 'Their military heroes are dishonored', vs: 'Militaristic states' },
    { id: 'ENVIRONMENTAL_FEAR', label: 'Environmental Fear', desc: 'Their government is poisoning them', vs: 'Industrial states' },
    { id: 'ANTI_PLAYER_REVERSAL', label: 'Anti-Player Reversal', desc: 'Counter narratives blaming you', vs: 'Hostile states' },
    { id: 'PEACE_NARRATIVE', label: 'Peace Narrative', desc: 'War benefits only the elite', vs: 'States in conflict' },
    { id: 'ALLY_BETRAYAL', label: 'Ally Betrayal', desc: 'Their closest ally betrays them', vs: 'Allied blocs' }
  ];

  const CHANNELS: { id: DistributionChannel; label: string; speed: number; cred: number; risk: number; fp: number; desc: string }[] = [
    { id: 'SOCIAL_MEDIA_ORGANIC', label: 'Organic Social Media', speed: 2, cred: 3, risk: 2, fp: 1, desc: 'Real-seeming accounts, slow build' },
    { id: 'BOT_NETWORK', label: 'Bot Network', speed: 5, cred: 1, risk: 4, fp: 3, desc: 'Requires active network. Fast, high detection.' },
    { id: 'STATE_MEDIA_CUTOUT', label: 'Media Cutout', speed: 3, cred: 4, risk: 3, fp: 2, desc: 'Requires established cutout. High credibility.' },
    { id: 'INFLUENCER_LAUNDERING', label: 'Influencer Laundering', speed: 4, cred: 3, risk: 3, fp: 2, desc: 'Pay real influencers.' },
    { id: 'ACADEMIC_CITATION', label: 'Academic Citation', speed: 1, cred: 5, risk: 2, fp: 3, desc: 'Fake think tanks.' },
    { id: 'LEAKED_DOCUMENT', label: 'Leaked Document', speed: 5, cred: 4, risk: 5, fp: 5, desc: 'Massive immediate spike. High risk.' },
    { id: 'ENCRYPTED_CHANNEL', label: 'Encrypted Whispers', speed: 1, cred: 5, risk: 1, fp: 1, desc: 'Signal/Telegram seeded rumoring.' },
    { id: 'DIPLOMATIC_WHISPERING', label: 'Diplomatic Whispers', speed: 1, cred: 5, risk: 1, fp: 1, desc: 'Elite targeted only.' }
  ];

  const EMOTIONS = ['FEAR', 'ANGER', 'PRIDE', 'HOPE', 'DISGUST', 'GRIEF'] as const;

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const getVulnerability = (cid: string) => {
    if (!cid) return null;
    const approval = leaders[cid] ? ((leaders[cid] as any).popularity || 50) : 50;
    const mediaFree = identities[cid] ? (100 - identities[cid].ideologyIndex) : 50;
    
    // approx
    const vs = (100 - mediaFree) * 0.4 + 50 * 0.3 + (approval < 40 ? 20 : 0);
    return vs;
  };

  const handleAuthorize = () => {
    if (!targetCountryId || !theme || !coreMessage || !emotionalRegister) return;
    const cId = createNarrativeCampaign({
      targetCountryId,
      theme,
      coreMessage,
      targetDemographic,
      emotionalRegister,
      initialFunding: 0.5
    });
    selectedChannels.forEach(ch => {
      addChannelToCampaign(cId, ch, 0.5, selectedBotNetworkId || undefined, selectedCutoutId || undefined);
    });
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/95 z-50 p-8 overflow-y-auto text-green-500 font-mono">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-green-800 pb-4">
          <h1 className="text-2xl font-bold tracking-widest text-white">NARRATIVE CAMPAIGN ARCHITECT</h1>
          <button onClick={onClose} className="px-4 py-2 border border-green-800 hover:bg-green-900/30">ABORT</button>
        </div>

        <div className="flex gap-4 mb-8">
          {[1,2,3,4,5].map(i => (
             <div key={i} className={`flex-1 h-2 ${step >= i ? 'bg-green-500' : 'bg-gray-800'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl text-white">STEP 1. TARGET SELECTION & THEME</h2>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Target Country</label>
              <select className="w-full bg-gray-900 border border-green-800 p-3 text-white focus:outline-none focus:border-green-500"
                      value={targetCountryId} onChange={e => setTargetCountryId(e.target.value)}>
                <option value="">Select Target...</option>
                {Object.values(worldCountries).map(c => (
                  <option key={c.id} value={c.id}>{c.name} {(c as any).flagEmoji}</option>
                ))}
              </select>
              {targetCountryId && (
                <div className="p-4 bg-gray-900/50 border border-gray-800 mt-2">
                  <div className="text-sm text-gray-400">TARGET VULNERABILITY SCORE</div>
                  <div className={`text-2xl font-bold ${(getVulnerability(targetCountryId)||0) > 60 ? 'text-red-500' : 'text-yellow-500'}`}>
                    {Math.floor(getVulnerability(targetCountryId)||0)}/100
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Strategic Theme</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(THEMES || []).map(t => (
                  <button key={t.id} onClick={() => setTheme(t.id)}
                          className={`p-4 border text-left transition-all ${theme === t.id ? 'border-green-500 bg-green-900/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'border-gray-800 hover:border-gray-600 bg-black'}`}>
                    <div className="font-bold text-white text-sm mb-1">{t.label}</div>
                    <div className="text-xs text-gray-500 mb-2">{t.desc}</div>
                    <div className="text-[10px] text-gray-600 uppercase tracking-wider mt-auto pt-2 border-t border-gray-800">
                      Best vs: {t.vs}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <button disabled={!targetCountryId || !theme} onClick={handleNext} className="bg-green-600 text-white px-8 py-3 font-bold disabled:opacity-50">NEXT_STEP</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
             <h2 className="text-xl text-white">STEP 2. CORE MESSAGE & PSYCHOMETRICS</h2>
             
             <div className="space-y-2">
               <label className="text-sm text-gray-400">Core Narrative Message (The Single Idea)</label>
               <input type="text" className="w-full bg-gray-900 border border-green-800 p-4 text-white font-mono" 
                      placeholder="e.g. The elites sold our future to foreign interests..."
                      value={coreMessage} onChange={e => setCoreMessage(e.target.value)} />
             </div>

             <div className="space-y-2">
               <label className="text-sm text-gray-400">Target Demographic Segment</label>
               <input type="text" className="w-full bg-gray-900 border border-green-800 p-4 text-white font-mono" 
                      placeholder="e.g. rural working class, disaffected youth..."
                      value={targetDemographic} onChange={e => setTargetDemographic(e.target.value)} />
             </div>

             <div className="space-y-2">
               <label className="text-sm text-gray-400">Primary Emotional Register</label>
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                 {(EMOTIONS || []).map(e => {
                   let color = 'border-gray-700 text-gray-400';
                   if (e === 'FEAR') color = 'border-blue-800 text-blue-500';
                   if (e === 'ANGER') color = 'border-red-800 text-red-500';
                   if (e === 'PRIDE') color = 'border-yellow-600 text-yellow-500';
                   if (e === 'HOPE') color = 'border-green-600 text-green-500';
                   if (e === 'DISGUST') color = 'border-orange-800 text-orange-500';
                   if (e === 'GRIEF') color = 'border-slate-600 text-slate-400';

                   const isSel = emotionalRegister === e;
                   return (
                     <button key={e} onClick={() => setEmotionalRegister(e)}
                             className={`p-4 border-2 transition-all font-bold text-lg tracking-widest ${isSel ? `${color} bg-opacity-20 bg-current` : 'border-gray-800 bg-black hover:border-gray-600'}`}>
                       {e}
                     </button>
                   );
                 })}
               </div>
             </div>

             <div className="flex justify-between mt-8">
              <button onClick={handlePrev} className="px-8 py-3 border border-gray-600 text-white">BACK</button>
              <button disabled={!coreMessage || !emotionalRegister || !targetDemographic} onClick={handleNext} className="bg-green-600 text-white px-8 py-3 font-bold disabled:opacity-50">NEXT_STEP</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
             <h2 className="text-xl text-white">STEP 3. DISTRIBUTION CHANNELS</h2>
             <div className="text-sm text-gray-400 mb-4">Select the vectors used to seed and launder this narrative.</div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {(CHANNELS || []).map(ch => {
                 const isSel = selectedChannels.includes(ch.id);
                 return (
                   <div key={ch.id} 
                        className={`p-4 border cursor-pointer transition-all ${isSel ? 'border-green-500 bg-green-900/10' : 'border-gray-800 hover:border-gray-600 bg-black'}`}
                        onClick={() => {
                          if (isSel) setSelectedChannels(s => s.filter(id => id !== ch.id));
                          else setSelectedChannels(s => [...s, ch.id]);
                        }}>
                      <div className="flex justify-between items-center mb-2">
                        <div className={`font-bold ${isSel ? 'text-green-400' : 'text-gray-300'}`}>{ch.label}</div>
                        {isSel && <div className="text-green-500 font-bold">✓</div>}
                      </div>
                      <div className="text-xs text-gray-500 h-8 line-clamp-2 mb-3">{ch.desc}</div>
                      
                      <div className="flex justify-between text-[10px] text-gray-500 border-t border-gray-800 pt-2">
                        <span>SPD: {'■'.repeat(ch.speed)}{'□'.repeat(5-ch.speed)}</span>
                        <span>CRD: {'■'.repeat(ch.cred)}{'□'.repeat(5-ch.cred)}</span>
                        <span className="text-red-500/70">RSK: {'■'.repeat(ch.risk)}{'□'.repeat(5-ch.risk)}</span>
                      </div>
                   </div>
                 );
               })}
             </div>

             <div className="flex justify-between mt-8">
              <button onClick={handlePrev} className="px-8 py-3 border border-gray-600 text-white">BACK</button>
              <button disabled={selectedChannels.length === 0} onClick={handleNext} className="bg-green-600 text-white px-8 py-3 font-bold disabled:opacity-50">NEXT_STEP</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
             <h2 className="text-xl text-white">STEP 4. ASSET ALLOCATION</h2>
             
             {selectedChannels.includes('BOT_NETWORK') && (
               <div className="p-6 border border-gray-800 bg-black">
                 <h3 className="text-lg font-bold text-white mb-4">Required: Bot Network</h3>
                 {Object.values(botNetworks).filter(bn => !bn.isBurned).length > 0 ? (
                   <select className="w-full bg-gray-900 border border-green-800 p-3 text-white focus:outline-none"
                           value={selectedBotNetworkId || ''} onChange={e => setSelectedBotNetworkId(e.target.value)}>
                     <option value="">Select an active network...</option>
                     {Object.values(botNetworks).filter(bn => !bn.isBurned).map(bn => (
                       <option value={bn.id} key={bn.id}>{bn.codename} ({Math.floor(bn.size/1000)}K)</option>
                     ))}
                   </select>
                 ) : (
                   <div className="text-sm text-red-500">No active bot networks available. Will auto-create default array.</div>
                 )}
               </div>
             )}

             {selectedChannels.includes('STATE_MEDIA_CUTOUT') && (
               <div className="p-6 border border-gray-800 bg-black">
                 <h3 className="text-lg font-bold text-white mb-4">Required: Media Cutout</h3>
                 {Object.values(mediaCutouts).filter(mc => !mc.isExposed).length > 0 ? (
                   <select className="w-full bg-gray-900 border border-green-800 p-3 text-white focus:outline-none"
                           value={selectedCutoutId || ''} onChange={e => setSelectedCutoutId(e.target.value)}>
                     <option value="">Select an active cutout...</option>
                     {Object.values(mediaCutouts).filter(mc => !mc.isExposed).map(mc => (
                       <option value={mc.id} key={mc.id}>{mc.outletName} (Cred: {mc.credibilityScore})</option>
                     ))}
                   </select>
                 ) : (
                   <div className="text-sm text-red-500">No cutouts available. Will auto-spawn fresh shell outlet.</div>
                 )}
               </div>
             )}

             {(!selectedChannels.includes('BOT_NETWORK') && !selectedChannels.includes('STATE_MEDIA_CUTOUT')) && (
               <div className="text-gray-400">No dedicated external assets required for selected channels.</div>
             )}

             <div className="flex justify-between mt-8">
              <button onClick={handlePrev} className="px-8 py-3 border border-gray-600 text-white">BACK</button>
              <button 
                disabled={(selectedChannels.includes('BOT_NETWORK') && !selectedBotNetworkId && Object.values(botNetworks).length > 0) || 
                          (selectedChannels.includes('STATE_MEDIA_CUTOUT') && !selectedCutoutId && Object.values(mediaCutouts).length > 0)}
                onClick={handleNext} className="bg-green-600 text-white px-8 py-3 font-bold disabled:opacity-50">NEXT_STEP</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
             <h2 className="text-xl text-white border-b border-gray-800 pb-2">STEP 5. FINAL AUTHORIZATION</h2>
             
             <div className="grid grid-cols-2 gap-8 text-sm">
               <div>
                 <div className="text-gray-500 mb-1">TARGET</div>
                 <div className="text-white text-lg">{targetCountryId}</div>
               </div>
               <div>
                 <div className="text-gray-500 mb-1">THEME</div>
                 <div className="text-white text-lg">{THEMES.find(t=>t.id === theme)?.label}</div>
               </div>
               <div className="col-span-2">
                 <div className="text-gray-500 mb-1">CORE MESSAGE</div>
                 <div className="text-white text-xl font-bold bg-gray-900 p-4 border-l-4 border-green-500">"{coreMessage}"</div>
               </div>
               <div>
                 <div className="text-gray-500 mb-1">DEMOGRAPHIC</div>
                 <div className="text-white">{targetDemographic}</div>
               </div>
               <div>
                 <div className="text-gray-500 mb-1">EMOTION</div>
                 <div className="text-white">{emotionalRegister}</div>
               </div>
               <div className="col-span-2">
                 <div className="text-gray-500 mb-1">VECTORS</div>
                 <div className="flex gap-2 flex-wrap">
                   {(selectedChannels || []).map(ch => (
                     <span key={ch} className="px-2 py-1 bg-gray-800 border border-gray-700 font-mono text-xs text-white">{CHANNELS.find(c=>c.id===ch)?.label}</span>
                   ))}
                 </div>
               </div>
             </div>

             {selectedChannels.length > 2 && (
               <div className="p-4 bg-red-900/20 border border-red-800 mt-6">
                 <div className="text-red-500 font-bold tracking-widest text-lg mb-2">WARNING: HIGH EXPOSURE RISK</div>
                 <div className="text-red-400 text-sm">Deploying multi-channel synchronized narratives increases detection surface. RECOMMEND ADDITIONAL DENIABILITY MEASURES.</div>
               </div>
             )}

             <div className="flex justify-between mt-8">
              <button onClick={handlePrev} className="px-8 py-3 border border-gray-600 text-white">BACK</button>
              <button onClick={handleAuthorize} className="bg-red-600 hover:bg-red-700 text-white px-12 py-3 font-bold text-lg tracking-widest">AUTHORIZE CAMPAIGN</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
