import React, { useMemo } from 'react';
import { usePsyopStore } from '../../store/psyopStore';

export const GlobalDisinfoTicker: React.FC = () => {
  const { botNetworks, narrativeCampaigns, mediaCutouts, komprómatOps } = usePsyopStore();

  const tickerItems = useMemo(() => {
    let items: string[] = [];
    
    // Assembling procedural ticker lines based on active things:
    Object.values(narrativeCampaigns).forEach(c => {
       if (c.phase === 'SATURATION') items.push(`Viral networks rapidly propagating unverified claims regarding ${c.targetCountryId}`);
       if (c.beliefAdoption > 60) items.push(`Public polling in ${c.targetCountryId} shows rising susceptibility to non-state narratives`);
    });

    Object.values(botNetworks).forEach(bn => {
       if (bn.isBurned) items.push(`Major platform removes coordinate inauthentic network of ${Math.floor(bn.size/1000)}K accounts`);
       else if (bn.isActive) items.push(`Cyber watchdogs flag anomalous social media volume targeting ${bn.targetCountryId}`);
    });

    Object.values(mediaCutouts).forEach(mc => {
       if (mc.isExposed) items.push(`Independent report traces ownership of ${mc.outletName} to obscure shell entities in ${mc.registrationCountry}`);
       else if (mc.citedByMainstreamMedia) items.push(`Mainstream outlets pick up provocative investigation originally published by ${mc.outletName}`);
    });

    Object.values(komprómatOps).forEach(op => {
       if (op.phase === 'DETONATION' || op.phase === 'AFTERMATH') items.push(`Explosive scandal continues to dominate headlines`);
       if (op.isDebunked) items.push(`${op.debunkedBy} releases forensic report questioning authenticity of viral leak`);
    });

    if (items.length === 0) {
       items.push('Information environment stable.', 'No significant coordinated inauthentic behavior detected in major sectors.');
    }

    // Duplicate array multiple times so the ticker loops smoothly
    // In CSS we just animate it right to left
    return [...items, ...items, ...items];
  }, [botNetworks, narrativeCampaigns, mediaCutouts, komprómatOps]);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-black border-t border-gray-800 flex items-center overflow-hidden z-20 pointer-events-none">
       <div className="bg-red-900/80 h-full flex items-center px-4 font-bold text-[10px] text-white tracking-widest border-r border-red-500 whitespace-nowrap z-10 shrink-0">
          GLOBAL INFO ENV
       </div>
       <div className="flex-1 overflow-hidden relative h-full">
         <div className="absolute top-0 bottom-0 flex items-center whitespace-nowrap animate-ticker text-[10px] font-mono text-gray-400">
            {tickerItems.map((item, idx) => (
              <span key={idx} className="mx-8 before:content-['■'] before:text-gray-800 before:mr-4">
                {item}
              </span>
            ))}
         </div>
       </div>
    </div>
  );
};
