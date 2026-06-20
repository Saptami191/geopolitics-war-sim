import React, { useMemo, useState } from 'react';
import { PanelFxShell } from '../fx/PanelFxShell';
import { useArachneStore } from '../../store/arachneStore';
import { useWorldStore } from '../../store/worldStore';
import { useFinintStore } from '../../store/finintStore';
import { audio } from '../../utils/audio';

export default function ArachnePanel() {
  const {
    arachne_feeds,
    arachne_nodes,
    arachne_links,
    arachne_fusionProducts,
    arachne_budget,
    arachne_activeTab,
    arachne_setActiveTab,
    arachne_deployFeed,
    arachne_retractFeed
  } = useArachneStore();

  const {
    finint_flags,
    finint_shellProfiles,
    finint_oligarchProfiles,
    finint_markFlagActedUpon
  } = useFinintStore();

  const countries = useWorldStore((s) => s.countries);
  
  // Tab 1: Map State
  const [mapNationFilter, setMapNationFilter] = useState<string>('ALL');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Tab 2: Feeds State
  const [newFeedSource, setNewFeedSource] = useState<string>('CORPORATE_REGISTRY');
  const [newFeedNation, setNewFeedNation] = useState<string>(Object.keys(countries)[0] || 'US');
  const [newFeedDepth, setNewFeedDepth] = useState<number>(50);

  // Tab 4: Finint Filter State
  const [finintFilter, setFinintFilter] = useState<string>('ALL');

  const selectedNode = selectedNodeId ? arachne_nodes.find(n => n.id === selectedNodeId) : null;
  const selectedNodeLinks = selectedNodeId ? arachne_links.filter(l => l.sourceNodeId === selectedNodeId || l.targetNodeId === selectedNodeId) : [];

  const handleDeployFeed = () => {
    audio.sfxKeyClick();
    arachne_deployFeed({
      sourceType: newFeedSource as any,
      targetNationId: newFeedNation,
      isActive: true,
      dailyCost: Math.floor(newFeedDepth * 3),
      coverageDepth: newFeedDepth
    }, useWorldStore.getState().currentTick);
  };

  const getNodeColor = (type: string, expLevel: string) => {
    if (expLevel === 'BURNED') return 'border-red-600 bg-red-900/30';
    switch(type) {
      case 'PERSON': return 'border-blue-500 bg-blue-900/30';
      case 'ORGANISATION': return 'border-amber-500 bg-amber-900/30';
      case 'FINANCIAL_ENTITY': return 'border-yellow-500 bg-yellow-900/30';
      case 'VESSEL': return 'border-cyan-500 bg-cyan-900/30';
      case 'STATE_ENTITY': return 'border-red-500 bg-red-900/30';
      case 'FACILITY': return 'border-gray-500 bg-gray-900/30';
      case 'PROXY_GROUP': return 'border-purple-500 bg-purple-900/30';
      default: return 'border-gray-500 bg-gray-900/30';
    }
  };

  const getSeverityStyle = (sev: string) => {
    if (sev === 'LOW') return 'text-gray-400 border-gray-700';
    if (sev === 'MEDIUM') return 'text-amber-500 border-amber-500/50';
    if (sev === 'HIGH') return 'text-orange-500 border-orange-500/50';
    if (sev === 'CRITICAL') return 'text-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    return '';
  };

  return (
    <PanelFxShell panelId="ARACHNE_OSINT" relevantFxTypes={['CYBER_ATTACK', 'CYBER_BLACKOUT']}>
      <div className="flex flex-col h-full bg-[#080808] text-gray-300 font-mono text-sm leading-relaxed overflow-hidden" 
           style={{ backgroundImage: 'linear-gradient(rgba(217, 119, 6, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(217, 119, 6, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        
        {/* Header Tabs */}
        <div className="flex shrink-0 border-b border-[#333] tracking-widest text-[#aaa] uppercase text-xs">
          {[
            { id: 'MAP', label: 'NETWORK MAP' },
            { id: 'FEEDS', label: 'OSINT FEEDS' },
            { id: 'FUSION', label: 'FUSION PRODUCTS' },
            { id: 'FININT', label: 'FININT FLAGS' },
            { id: 'SHELLS', label: 'BENEFICIAL OWNERSHIP' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { audio.sfxKeyClick(); arachne_setActiveTab(tab.id as any); }}
              className={`px-4 py-3 border-r border-[#333] transition-colors ${
                arachne_activeTab === tab.id 
                  ? 'bg-[#1a1a1a] text-amber-500 border-t-2 border-t-amber-500' 
                  : 'hover:bg-[#111] hover:text-white border-t-2 border-t-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto relative">
          
          {/* TAB 1: NETWORK MAP */}
          {arachne_activeTab === 'MAP' && (
            <div className="absolute inset-0 flex">
              <div className="flex-1 relative p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-amber-500 tracking-widest">ARACHNE — ENTITY NETWORK</div>
                  <select 
                    className="bg-black border border-[#444] text-[#ccc] py-1 px-2 uppercase text-xs"
                    value={mapNationFilter}
                    onChange={(e) => { audio.sfxKeyClick(); setMapNationFilter(e.target.value); }}
                  >
                    <option value="ALL">ALL NATIONS</option>
                    {Object.keys(countries).map(c => <option key={c} value={c}>{countries[c].name.toUpperCase()}</option>)}
                  </select>
                </div>
                
                <div className="flex-1 bg-black/50 border border-[#222] rounded relative overflow-hidden flex items-center justify-center p-4">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {arachne_links.map((link, idx) => {
                      // Simplified mock SVG graph for now, randomized positions purely visual
                      const sn = arachne_nodes.findIndex(n => n.id === link.sourceNodeId);
                      const tn = arachne_nodes.findIndex(n => n.id === link.targetNodeId);
                      if (sn < 0 || tn < 0) return null;
                      const x1 = 10 + (sn * 17) % 80;
                      const y1 = 10 + (sn * 43) % 80;
                      const x2 = 10 + (tn * 17) % 80;
                      const y2 = 10 + (tn * 43) % 80;
                      
                      const linkColor = link.linkType === 'FINANCIAL_FLOW' ? '#eab308' : 
                                        link.linkType === 'OWNERSHIP' ? '#f59e0b' : 
                                        link.linkType === 'CONTROL' ? '#ef4444' : '#444';

                      return (
                        <line key={link.id} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke={linkColor} strokeWidth={Math.max(1, link.confidence/20)} opacity={0.6} />
                      );
                    })}
                  </svg>
                  
                  <div className="absolute inset-0">
                    {arachne_nodes.filter(n => mapNationFilter === 'ALL' || n.nationId === mapNationFilter).map((node, idx) => {
                      const x = 10 + (idx * 17) % 80;
                      const y = 10 + (idx * 43) % 80;
                      const isSelected = selectedNodeId === node.id;
                      
                      return (
                        <button
                          key={node.id}
                          className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 transition-all cursor-crosshair group ${getNodeColor(node.type, node.exposureLevel)} ${isSelected ? 'ring-2 ring-white scale-125' : 'hover:scale-110'}`}
                          style={{ left: `${x}%`, top: `${y}%`, borderStyle: node.exposureLevel === 'MAPPED' ? 'solid' : node.exposureLevel === 'IDENTIFIED' ? 'dashed' : node.exposureLevel === 'SUSPECTED' ? 'dotted' : 'none' }}
                          onClick={() => { audio.sfxKeyClick(); setSelectedNodeId(node.id); }}
                        >
                          {node.isBurned && <span className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-xs pointer-events-none">×</span>}
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-[10px] px-1 py-[2px] opacity-0 group-hover:opacity-100 pointer-events-none text-white border border-[#444] z-10 w-max max-w-[200px] overflow-hidden text-ellipsis">
                            {node.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Node Detail Drawer */}
              {selectedNode && (
                <div className="w-80 border-l border-[#333] bg-[#0c0c0c] p-4 flex flex-col shrink-0">
                  <div className="flex justify-between items-start mb-4">
                    <div className="font-bold text-amber-500 text-base leading-tight uppercase pr-4 break-words">{selectedNode.label}</div>
                    <button onClick={() => setSelectedNodeId(null)} className="text-gray-500 hover:text-white">✕</button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-6">
                    <div className="text-gray-500 uppercase">Type</div>
                    <div className="text-white">{selectedNode.type}</div>
                    <div className="text-gray-500 uppercase">Nation</div>
                    <div className="text-white">{countries[selectedNode.nationId]?.name || selectedNode.nationId}</div>
                    <div className="text-gray-500 uppercase">Exposure</div>
                    <div className={`${selectedNode.exposureLevel === 'BURNED' ? 'text-red-500' : 'text-cyan-400'}`}>{selectedNode.exposureLevel}</div>
                  </div>

                  <div className="mb-6">
                    <div className="text-gray-500 uppercase text-[10px] mb-1">Risk Score ({selectedNode.riskScore.toFixed(0)})</div>
                    <div className="bg-[#222] h-2 w-full rounded-sm overflow-hidden">
                      <div className={`h-full ${selectedNode.riskScore >= 75 ? 'bg-red-500' : selectedNode.riskScore >= 40 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${selectedNode.riskScore}%` }}></div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {selectedNode.sanctionedFlag && <span className="bg-red-900/40 text-red-400 px-2 py-0.5 text-[10px] uppercase border border-red-800">OFAC SANCTIONED</span>}
                      {selectedNode.proliferationFlag && <span className="bg-orange-900/40 text-orange-400 px-2 py-0.5 text-[10px] uppercase border border-orange-800">PROLIF RISK</span>}
                    </div>
                  </div>

                  <div className="mb-4 flex-1">
                    <div className="text-gray-500 uppercase border-b border-[#333] pb-1 mb-2">Network Links ({selectedNodeLinks.length})</div>
                    <div className="space-y-2 overflow-y-auto max-h-[250px] pr-2">
                      {selectedNodeLinks.map(l => (
                        <div key={l.id} className="text-[10px] bg-[#111] border border-[#222] p-2 leading-tight">
                          <span className="text-amber-500">{l.linkType}</span>
                          <span className="text-gray-400 ml-2">CONF: {l.confidence}%</span>
                          <div className="text-gray-300 mt-1 truncate">
                             {l.sourceNodeId === selectedNode.id ? '► ' : '◄ '} 
                             {arachne_nodes.find(n => n.id === (l.sourceNodeId === selectedNode.id ? l.targetNodeId : l.sourceNodeId))?.label || 'Unknown'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-500 italic mt-auto pt-4 border-t border-[#333]">
                    First isolated tick {selectedNode.firstObservedTick} via {selectedNode.sourceTypes.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FEEDS */}
          {arachne_activeTab === 'FEEDS' && (
            <div className="p-6 flex flex-col h-full max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-2">
                <div className="text-lg text-amber-500 tracking-widest uppercase">OSINT Collection Feeds</div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">ARACHNE BUDGET:</span>
                  <span className="text-cyan-400 font-bold">{arachne_budget.remaining} / {arachne_budget.totalAllocated} USD/T</span>
                </div>
              </div>

              <div className="bg-[#111] border border-[#333] p-4 mb-6 rounded flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] uppercase text-gray-500 mb-1">Source Target Config</label>
                  <select className="w-full bg-black border border-[#444] text-[#ccc] py-1.5 px-2 text-sm" value={newFeedSource} onChange={e => setNewFeedSource(e.target.value)}>
                    <option value="CORPORATE_REGISTRY">Corporate Registries</option>
                    <option value="SHIPPING_MANIFEST">Shipping & Port Manifests</option>
                    <option value="PROCUREMENT_DATABASE">Procurement & Tenders</option>
                    <option value="FINANCIAL_FILING">Bank / Financial Filings</option>
                    <option value="SOCIAL_NETWORK">Social Network Probes</option>
                    <option value="NEWS_AGGREGATOR">Media Aggregators</option>
                    <option value="SATELLITE_METADATA">Satellite / Imagery Metadata</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] uppercase text-gray-500 mb-1">Nation Filter</label>
                  <select className="w-full bg-black border border-[#444] text-[#ccc] py-1.5 px-2 text-sm" value={newFeedNation} onChange={e => setNewFeedNation(e.target.value)}>
                    {Object.keys(countries).map(c => <option key={c} value={c}>{countries[c].name}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] uppercase text-gray-500 mb-1">Coverage Depth / Cost ({newFeedDepth}%)</label>
                  <input type="range" min="10" max="100" step="10" className="w-full" value={newFeedDepth} onChange={e => setNewFeedDepth(Number(e.target.value))} />
                </div>
                <button onClick={handleDeployFeed} className="bg-amber-600 hover:bg-amber-500 text-black font-bold uppercase tracking-widest px-6 py-1.5 text-sm transition-colors">
                  Deploy
                </button>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#333] text-gray-500 text-[10px] uppercase bg-black">
                      <th className="py-2 px-2 font-normal">Source Type</th>
                      <th className="py-2 px-2 font-normal">Target Nation</th>
                      <th className="py-2 px-2 font-normal">Depth</th>
                      <th className="py-2 px-2 font-normal">Daily Cost</th>
                      <th className="py-2 px-2 font-normal">Yield (Nodes)</th>
                      <th className="py-2 px-2 font-normal text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arachne_feeds.map(f => (
                      <tr key={f.id} className="border-b border-[#222] hover:bg-[#111]">
                        <td className="py-3 px-2 text-white">{f.sourceType.replace('_', ' ')}</td>
                        <td className="py-3 px-2 text-gray-300">{countries[f.targetNationId]?.name || f.targetNationId}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-[#222]"><div className="h-full bg-cyan-500" style={{width: `${f.coverageDepth}%`}}></div></div>
                            <span className="text-[10px] text-gray-400">{f.coverageDepth}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-amber-500">{f.dailyCost}</td>
                        <td className="py-3 px-2 text-cyan-400 font-bold">{f.nodesDiscoveredTotal}</td>
                        <td className="py-3 px-2 text-right">
                          {f.isActive ? (
                            <button onClick={() => { audio.sfxKeyClick(); arachne_retractFeed(f.id); }} className="text-red-400 hover:text-red-300 text-xs uppercase border border-red-900/50 hover:bg-red-900/30 px-2 py-0.5">Retract</button>
                          ) : (
                            <span className="text-gray-600 text-xs uppercase">Inactive</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {arachne_feeds.length === 0 && (
                      <tr><td colSpan={6} className="py-8 text-center text-gray-600 italic">No feeds actively deployed.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FUSION PRODUCTS */}
          {arachne_activeTab === 'FUSION' && (
            <div className="p-6 max-w-5xl mx-auto">
              <div className="text-lg text-amber-500 tracking-widest uppercase mb-6 border-b border-[#333] pb-2">[CLASSIFIED // SOVEREIGN COMMAND // EYES ONLY]</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {arachne_fusionProducts.slice().reverse().map(prod => (
                  <div key={prod.id} className="bg-black border border-[#333] relative p-4 flex flex-col">
                    <div className="absolute top-0 right-0 bg-[#333] text-gray-300 text-[9px] uppercase px-2 py-0.5">TICK {prod.producedAtTick}</div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-amber-500 p-1 border border-amber-900/50 bg-amber-900/20 text-[10px] font-bold uppercase">{prod.fusionType.replace(/_/g, ' ')}</span>
                      {prod.actionableFlag && <span className="bg-red-600 text-white px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">ACTIONABLE</span>}
                      <span className="ml-auto text-gray-500 text-[10px] uppercase">CONFIDENCE {prod.confidence}%</span>
                    </div>

                    <div className="text-xs text-gray-300 uppercase tracking-widest border-b border-[#222] pb-1 mb-2">
                       TARGET: {prod.involvedNationIds.map(nid => countries[nid]?.name || nid).join(', ')}
                    </div>

                    <div className="text-sm font-serif text-gray-200 mt-2 flex-1 leading-relaxed">
                      {prod.summary}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#222] flex gap-4 text-[10px] uppercase text-gray-500">
                      <div><span className="text-cyan-500">{prod.involvedNodeIds.length}</span> Entities Linked</div>
                      {prod.linkedSignalIds.length > 0 && <div><span className="text-orange-500">{prod.linkedSignalIds.length}</span> Signals Intercepts</div>}
                      {prod.linkedFinintFlags.length > 0 && <div><span className="text-yellow-500">{prod.linkedFinintFlags.length}</span> FININT Corroborations</div>}
                    </div>
                  </div>
                ))}
                {arachne_fusionProducts.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-600 italic border border-[#333] border-dashed">
                    No intelligence fusion products generated. Insufficient OSINT coverage or node mapping density.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FININT FLAGS */}
          {arachne_activeTab === 'FININT' && (
            <div className="p-6 max-w-5xl mx-auto h-full flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-2 shrink-0">
                <div className="text-lg text-amber-500 tracking-widest uppercase">Financial Intelligence</div>
                <div className="flex gap-2 text-xs">
                  {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'CORROBORATED'].map(f => (
                    <button 
                      key={f} 
                      onClick={() => { audio.sfxKeyClick(); setFinintFilter(f); }}
                      className={`px-3 py-1 border ${finintFilter === f ? 'border-amber-500 text-amber-400 bg-amber-900/20' : 'border-[#444] text-gray-500 hover:text-white'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {finint_flags.filter(f => 
                   finintFilter === 'ALL' ? true : 
                   finintFilter === 'CORROBORATED' ? f.isCorroborated : 
                   f.severity === finintFilter
                ).slice().reverse().map(flag => (
                  <div key={flag.id} className={`p-4 border bg-black ${getSeverityStyle(flag.severity)} transition-all ${flag.isActedUpon ? 'opacity-50 grayscale' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${getSeverityStyle(flag.severity)}`}>{flag.severity} RISK</span>
                        <span className="text-gray-300 font-bold uppercase text-sm tracking-wider">{flag.flowType.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-green-500 font-mono text-base font-bold">${flag.estimatedValueUSD.toLocaleString()}M</div>
                        <div className="text-[10px] text-gray-500 uppercase">TICK {flag.detectedAtTick} • EXP {flag.expiresAtTick}</div>
                      </div>
                    </div>
                    
                    <div className="text-gray-300 text-sm mb-3">
                      {flag.narrativeSummary}
                    </div>

                    {flag.sanctionEvasionRoute.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 bg-[#111] p-2 border border-[#222]">
                        <span className="text-gray-500 uppercase text-[10px]">Route:</span>
                        {flag.sanctionEvasionRoute.map((stop, i) => (
                          <React.Fragment key={i}>
                            <span className="text-cyan-400 font-bold">{stop}</span>
                            {i < flag.sanctionEvasionRoute.length - 1 && <span className="text-[#444]">→</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#222]/50">
                      <div className="flex items-center gap-4 text-xs">
                        {flag.isCorroborated ? (
                          <span className="text-green-500 font-bold flex items-center gap-1">✓ SIGINT CORROBORATED</span>
                        ) : (
                          <span className="text-gray-600">UNVERIFIED FLOW</span>
                        )}
                        <span className="text-gray-500">Nodes: {flag.linkedArachneNodeIds.length}</span>
                      </div>

                      {!flag.isActedUpon && (
                        <button onClick={() => { audio.sfxKeyClick(); finint_markFlagActedUpon(flag.id); }} className="text-xs uppercase px-4 py-1 border border-[#444] text-gray-400 hover:text-white hover:border-white transition-colors">
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {finint_flags.length === 0 && (
                  <div className="py-12 text-center text-gray-600 italic">No anomalous financial flows detected.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SHELL COMPANIES & OLIGARCHS */}
          {arachne_activeTab === 'SHELLS' && (
            <div className="p-6 max-w-5xl mx-auto h-full flex flex-col gap-6">
              
              {/* Shell Companies section */}
              <div className="flex-1 flex flex-col">
                <div className="text-lg text-amber-500 tracking-widest uppercase mb-4 border-b border-[#333] pb-2">Shell Entities & Proxies</div>
                <div className="flex-1 overflow-auto border border-[#333] bg-black">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#444] text-gray-500 uppercase bg-[#111]">
                        <th className="py-2 px-3 font-normal">Entity Name</th>
                        <th className="py-2 px-3 font-normal">Jurisdiction</th>
                        <th className="py-2 px-3 font-normal">Estimated Assets</th>
                        <th className="py-2 px-3 font-normal w-1/4">Unmask Progress</th>
                        <th className="py-2 px-3 font-normal text-right">UBO / Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finint_shellProfiles.map(shell => (
                        <tr key={shell.id} className="border-b border-[#222] hover:bg-[#111]">
                          <td className="py-2 px-3 text-white font-mono">{shell.registeredName}</td>
                          <td className="py-2 px-3 text-cyan-400">{shell.registeredJurisdiction}</td>
                          <td className="py-2 px-3 text-green-500">${shell.estimatedAssetsUSD.toLocaleString()}M</td>
                          <td className="py-2 px-3">
                            <div className="w-full h-1.5 bg-[#222]">
                              <div className={`h-full transition-all ${shell.isFullyUnmasked ? 'bg-green-500' : 'bg-amber-500'}`} style={{width: `${shell.unmaskConfidence}%`}}></div>
                            </div>
                            <div className="text-[9px] text-gray-500 mt-0.5 text-right">{shell.unmaskConfidence}% conf</div>
                          </td>
                          <td className="py-2 px-3 text-right">
                            {shell.isFullyUnmasked ? (
                              <span className="text-red-400 font-bold uppercase">{arachne_nodes.find(n => n.id === shell.ultimateBeneficialOwner)?.label || 'EXPOSED'}</span>
                            ) : (
                              <span className="text-gray-600 uppercase">OBSCURED</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {finint_shellProfiles.length === 0 && (
                        <tr><td colSpan={5} className="py-6 text-center text-gray-600 italic">No suspected shell companies under active analysis.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Oligarch / HNW section */}
              <div className="h-[250px] shrink-0 flex flex-col">
                <div className="text-md text-amber-500 tracking-widest uppercase mb-4 border-b border-[#333] pb-2">High Net-Worth / Oligarch Risk Profiles</div>
                <div className="flex-1 overflow-x-auto flex gap-4 pr-4">
                  {finint_oligarchProfiles.map(op => (
                    <div key={op.id} className="w-72 bg-black border border-[#444] p-4 shrink-0 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-gray-200 uppercase truncate" title={arachne_nodes.find(n => n.id === op.linkedArachneNodeId)?.label}>{arachne_nodes.find(n => n.id === op.linkedArachneNodeId)?.label || 'Unknown Figure'}</div>
                        {op.sanctionedFlag && <span className="text-[9px] px-1 bg-red-900/50 text-red-500 border border-red-800">SANCTIONED</span>}
                      </div>
                      <div className="text-xs text-gray-500 mb-4">{countries[op.nationId]?.name || op.nationId} • <span className="text-green-500 font-mono">${op.estimatedNetWorthUSD}B</span></div>
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-[10px] text-gray-500 uppercase mb-1"><span>Pol Leverage</span><span>{op.politicalLeverageScore}/100</span></div>
                        <div className="h-1 bg-[#222]"><div className="h-full bg-blue-500" style={{width: `${op.politicalLeverageScore}%`}}></div></div>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between text-[10px] text-gray-500 uppercase mb-1"><span>Freeze Risk</span><span>{op.assetFreezeRisk}/100</span></div>
                        <div className="h-1 bg-[#222]"><div className="h-full bg-red-500" style={{width: `${op.assetFreezeRisk}%`}}></div></div>
                      </div>

                      <div className="mt-auto text-[10px] text-gray-400">
                        {op.knownVehicles.length} known front vehicles identified.
                      </div>
                    </div>
                  ))}
                  {finint_oligarchProfiles.length === 0 && (
                    <div className="w-full h-full flex items-center justify-center border border-[#333] border-dashed text-gray-600 italic">No oligarch profiles compiled.</div>
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
