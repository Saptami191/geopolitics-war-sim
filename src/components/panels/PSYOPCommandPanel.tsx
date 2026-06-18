import React, { useState } from 'react';
import { usePsyopStore } from '../../store/psyopStore';
import { useWorldStore } from '../../store/worldStore';
import { useLeaderStore } from '../../store/leaderStore';
import { NarrativeCampaignBuilder } from './NarrativeCampaignBuilder';
import { KomprómatModal } from '../popups/KomprómatModal';

export const PSYOPCommandPanel: React.FC = () => {
  const { 
    narrativeCampaigns, botNetworks, mediaCutouts, komprómatOps, publicOpinionData,
    advanceCampaignPhase, buildNewBotNetwork, establishMediaCutout, manipulatePollSource
  } = usePsyopStore();
  
  const worldCountries = useWorldStore(s => s.world.countriesById);
  const leaders = useLeaderStore(s => s.leadersByCountryId);

  const [activeTab, setActiveTab] = useState<'NARRATIVE' | 'BOT_NETWORKS' | 'CUTOUTS' | 'KOMPROMAT' | 'POLLING'>('NARRATIVE');
  
  const [showBuilder, setShowBuilder] = useState(false);
  const [showKompromat, setShowKompromat] = useState(false);

  if (showBuilder) return <NarrativeCampaignBuilder onClose={() => setShowBuilder(false)} />;
  if (showKompromat) return <KomprómatModal onClose={() => setShowKompromat(false)} />;

  return (
    <div className="h-full flex flex-col font-mono text-gray-300 p-4 overflow-hidden">
      <div className="flex gap-2 mb-4 border-b border-gray-800 pb-px">
        {['NARRATIVE', 'BOT_NETWORKS', 'CUTOUTS', 'KOMPROMAT', 'POLLING'].map(tab => (
           <button key={tab} onClick={() => setActiveTab(tab as any)}
             className={`px-4 py-2 text-xs font-bold tracking-wide transition-colors ${activeTab === tab ? 'border-b-2 border-green-500 text-green-400 bg-gray-900' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50'}`}>
             {tab.replace('_', ' ')}
           </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4 scrollbar-thin">
        {activeTab === 'NARRATIVE' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg text-white">ACTIVE CAMPAIGNS</h2>
              <button onClick={() => setShowBuilder(true)} className="bg-green-900/50 text-green-400 border border-green-500 px-4 py-2 text-sm hover:bg-green-800/80">NEW CAMPAIGN</button>
            </div>
            
            {Object.values(narrativeCampaigns).filter(c => c.phase !== 'COMPLETE' && c.phase !== 'BURNED').map(camp => (
              <div key={camp.id} className="bg-black border border-gray-800 p-4 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                     <span className="text-2xl">{(worldCountries[camp.targetCountryId] as any)?.flagEmoji}</span>
                     <div>
                       <div className="text-white font-bold">{camp.codename}</div>
                       <div className="text-xs text-gray-500">{camp.theme.replace('_', ' ')} → {worldCountries[camp.targetCountryId]?.name}</div>
                     </div>
                   </div>
                   <div className="px-2 py-1 text-xs border border-green-500 text-green-400 bg-green-900/20">{camp.phase}</div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-4">
                   <div>
                     <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">PENETRATION</span> <span className="text-amber-500">{Math.floor(camp.narrativePenetration)}%</span></div>
                     <div className="h-1 bg-gray-800"><div className="h-full bg-amber-500" style={{width: `${camp.narrativePenetration}%`}}/></div>
                   </div>
                   <div>
                     <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">BELIEF ADOPTION</span> <span className="text-red-500">{Math.floor(camp.beliefAdoption)}%</span></div>
                     <div className="h-1 bg-gray-800"><div className="h-full bg-red-500" style={{width: `${camp.beliefAdoption}%`}}/></div>
                   </div>
                   <div>
                     <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">DISCOVERY RISK</span> <span className="text-gray-300">{Math.floor(camp.discoveryRisk)}%</span></div>
                     <div className="h-1 bg-gray-800"><div className="h-full bg-gradient-to-r from-green-500 to-red-500" style={{width: `${camp.discoveryRisk}%`}}/></div>
                   </div>
                </div>
                
                <div className="flex justify-end gap-2 border-t border-gray-800 pt-3">
                  <button onClick={() => advanceCampaignPhase(camp.id)} className="px-3 py-1 bg-gray-900 text-xs border border-gray-700 hover:border-gray-500 text-white transition-colors">
                    ADVANCE PHASE →
                  </button>
                  {camp.phase === 'WEAPONIZATION' && (
                    <button className="px-3 py-1 bg-red-900/50 text-xs border border-red-500 text-red-100 hover:bg-red-800 transition-colors">
                      WEAPONIZE // TRIGGER
                    </button>
                  )}
                </div>
              </div>
            ))}
            {Object.values(narrativeCampaigns).filter(c => c.phase !== 'COMPLETE' && c.phase !== 'BURNED').length === 0 && (
              <div className="text-center py-12 text-gray-600 border border-gray-800 border-dashed">No active campaigns.</div>
            )}
          </div>
        )}

        {activeTab === 'BOT_NETWORKS' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg text-white">BOT NETWORKS</h2>
              <div className="flex gap-2">
                <button onClick={() => buildNewBotNetwork('GLOBAL', 'MICRO', null)} className="px-3 py-1 text-xs border border-blue-500 text-blue-400 hover:bg-blue-900/30">+ MICRO (10K)</button>
                <button onClick={() => buildNewBotNetwork('GLOBAL', 'REGIONAL', null)} className="px-3 py-1 text-xs border border-blue-500 text-blue-400 hover:bg-blue-900/30">+ REGIONAL (500K)</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.values(botNetworks).map(net => (
                <div key={net.id} className={`p-4 border ${net.isBurned ? 'border-red-800 bg-red-900/10' : 'border-gray-800 bg-black'}`}>
                  <div className="flex justify-between mb-2">
                    <div className="font-bold text-blue-400">{net.codename}</div>
                    {net.isBurned ? (
                      <span className="text-xs text-red-500 border border-red-800 px-1">BURNED</span>
                    ) : (
                      <span className={`text-xs ${net.isActive ? 'text-green-500' : 'text-gray-500'}`}>{net.isActive ? 'ACTIVE' : 'IDLE'}</span>
                    )}
                  </div>
                  <div className="text-sm text-white mb-4">{Math.floor(net.size/1000)}K Accounts</div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs text-gray-500"><span>Sophistication</span><span>{net.sophisticationLevel}/100</span></div>
                    <div className="flex justify-between text-xs text-gray-500"><span>Detectability</span><span className="text-amber-500">{Math.floor(net.detectability)}%</span></div>
                  </div>

                  {!net.isBurned && (
                     <div className="text-xs text-gray-400 mt-4 border-t border-gray-800 pt-2">
                       <div className="flex justify-between">
                         <span>Attrition:</span>
                         <span className="text-white">{Math.floor(net.accountsRemaining/1000)}K remaining</span>
                       </div>
                     </div>
                  )}
                </div>
              ))}
            </div>
            {Object.keys(botNetworks).length === 0 && (
              <div className="text-center py-12 text-gray-600 border border-gray-800 border-dashed">No bot networks constructed.</div>
            )}
          </div>
        )}

        {activeTab === 'CUTOUTS' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg text-white">MEDIA CUTOUTS</h2>
              <button onClick={() => establishMediaCutout({ outletName: 'Global Observer', registrationCountry: 'CH', appearsAs: 'NEWS_OUTLET', initialFunding: 1 })} className="px-3 py-1 text-xs border border-blue-500 text-blue-400 hover:bg-blue-900/30">+ ESTABLISH OUTLET</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.values(mediaCutouts).map(cutout => (
                <div key={cutout.id} className="bg-black border border-gray-800 p-4 relative">
                  {cutout.isExposed && (
                    <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center z-10">
                       <div className="text-3xl font-bold text-red-500 border-4 border-red-500 px-4 py-2 transform -rotate-12">EXPOSED</div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="text-lg font-serif font-bold text-white">{cutout.outletName}</h3>
                     {cutout.citedByMainstreamMedia && <span className="bg-yellow-600 text-white text-[10px] px-2 py-1 font-bold">MAINSTREAM</span>}
                  </div>
                  <div className="text-xs text-gray-500 mb-4">{cutout.appearsAs.replace('_', ' ')} • Reg: {cutout.registrationCountry}</div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                     <div className="bg-gray-900 p-2 border border-gray-800 text-center">
                        <div className="text-[10px] text-gray-500">CREDIBILITY</div>
                        <div className="text-white">{Math.floor(cutout.credibilityScore)}</div>
                     </div>
                     <div className="bg-gray-900 p-2 border border-gray-800 text-center">
                        <div className="text-[10px] text-gray-500">REACH</div>
                        <div className="text-white">{Math.floor(cutout.reachScore)}</div>
                     </div>
                  </div>

                  <div className="text-xs text-gray-500">Published: {cutout.totalArticlesPublished} articles</div>
                </div>
              ))}
            </div>
            {Object.keys(mediaCutouts).length === 0 && (
              <div className="text-center py-12 text-gray-600 border border-gray-800 border-dashed">No media cutouts established.</div>
            )}
          </div>
        )}

        {activeTab === 'KOMPROMAT' && (
          <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg text-white">ACTIVE KOMPRÓMAT OPERATIONS</h2>
              <button onClick={() => setShowKompromat(true)} className="bg-red-900/30 text-red-400 border border-red-500 px-4 py-2 text-sm hover:bg-red-900/60">INITIATE OPERATION</button>
            </div>

            <div className="space-y-3">
              {Object.values(komprómatOps).map(op => {
                 const leader = leaders[op.targetLeaderId];
                 return (
                   <div key={op.id} className={`p-4 border relative ${op.isDebunked ? 'border-red-800 bg-red-900/10' : 'border-gray-800 bg-black'}`}>
                      {op.isDebunked && (
                        <div className="absolute top-4 right-4 text-xs font-bold text-red-500 border border-red-500 px-2 py-1">DEBUNKED BY: {op.debunkedBy}</div>
                      )}
                      <div className="text-xs text-red-500 mb-1">{op.codename}</div>
                      <div className="text-lg text-white font-bold mb-1">{leader?.name} • {op.komprómatType.replace('_', ' ')}</div>
                      
                      <div className="flex gap-2 text-xs mb-4">
                         {op.isFabricated ? (
                           <span className="bg-yellow-900/30 text-yellow-500 px-2 py-1 border border-yellow-800">FABRICATED ({Math.floor(op.fabricationQuality)}%)</span>
                         ) : (
                           <span className="bg-green-900/30 text-green-500 px-2 py-1 border border-green-800">AUTHENTIC INTEL</span>
                         )}
                         <span className="bg-gray-800 text-gray-300 px-2 py-1 border border-gray-700">PHASE: {op.phase}</span>
                      </div>

                      {['PRODUCTION', 'VALIDATION', 'PLACEMENT'].includes(op.phase) && (
                        <div className="text-right border-t border-gray-800 pt-3">
                           <button className="px-3 py-1 text-xs border border-gray-600 text-gray-300 hover:bg-gray-800">ADVANCE PHASE →</button>
                        </div>
                      )}
                      
                      {['DETONATION', 'AFTERMATH'].includes(op.phase) && (
                        <div className="mt-3 bg-red-950/20 p-2 border border-red-900/30 flex items-center justify-between">
                           <span className="text-xs text-red-500">Debunk Probability</span>
                           <span className="text-red-400 font-bold">{Math.floor(op.debunkProbability)}%</span>
                        </div>
                      )}
                   </div>
                 );
              })}
              {Object.keys(komprómatOps).length === 0 && (
                <div className="text-center py-12 text-gray-600 border border-gray-800 border-dashed">No active komprómat operations.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'POLLING' && (
          <div className="space-y-4">
             <div className="text-sm text-gray-400 mb-4">Select the map view from the main HUD to see full global opinion projection. This panel displays high-level data only.</div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.values(publicOpinionData).map(poll => (
                  <div key={poll.countryId} className="bg-black border border-gray-800 p-4">
                     <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{(worldCountries[poll.countryId] as any)?.flagEmoji}</span>
                          <span className="font-bold text-white uppercase">{worldCountries[poll.countryId]?.name}</span>
                        </div>
                        <div className="text-xs px-2 py-1 bg-gray-900 border border-gray-700 text-gray-500">CONF: {poll.pollConfidence}%</div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-gray-900 p-2 border border-gray-800 text-center">
                           <div className="text-[10px] text-gray-500 mb-1">APPROVAL</div>
                           <div className="text-xl font-bold text-white">{Math.floor(poll.leaderApprovalRating)}%</div>
                        </div>
                        <div className="bg-gray-900 p-2 border border-gray-800 text-center">
                           <div className="text-[10px] text-gray-500 mb-1">UNREST</div>
                           <div className="text-xl font-bold text-red-400">{Math.floor(poll.protestLikelihood)}%</div>
                        </div>
                     </div>

                     <div className="text-right">
                       <button onClick={() => manipulatePollSource(poll.countryId, 'approval', -5)} className="text-[10px] text-gray-500 hover:text-white underline">MANIPULATE DATA</button>
                     </div>
                  </div>
                ))}
             </div>
             {Object.keys(publicOpinionData).length === 0 && (
               <div className="text-center py-12 text-gray-600 border border-gray-800 border-dashed">No polling intelligence available yet. Ticks required.</div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
