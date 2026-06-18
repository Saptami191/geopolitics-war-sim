import React, { useState } from 'react';
import { usePsyopStore } from '../../store/psyopStore';
import { useWorldStore } from '../../store/worldStore';

interface PublicOpinionOverlayProps {
  onClose: () => void;
}

export const PublicOpinionOverlay: React.FC<PublicOpinionOverlayProps> = ({ onClose }) => {
  const { publicOpinionData, narrativeCampaigns, pollHistory } = usePsyopStore();
  const worldCountries = useWorldStore(s => s.world.countriesById);
  
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<'LEADER_APPROVAL' | 'WAR_SUPPORT' | 'POLARIZATION' | 'NARRATIVE_PENETRATION'>('LEADER_APPROVAL');
  
  const selectedPoll = selectedCountryId ? publicOpinionData[selectedCountryId] : null;

  return (
    <div className="absolute inset-0 bg-black/95 z-40 flex flex-col font-mono text-gray-300">
      <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900">
        <h1 className="text-xl font-bold tracking-widest text-white">INTELLIGENCE POLLING: PUBLIC OPINION MAP</h1>
        <div className="flex gap-2">
          {['LEADER_APPROVAL', 'WAR_SUPPORT', 'POLARIZATION', 'NARRATIVE_PENETRATION'].map(layer => (
            <button 
              key={layer}
              onClick={() => setActiveLayer(layer as any)}
              className={`px-3 py-1 text-xs font-bold border transition-colors ${activeLayer === layer ? 'bg-blue-900/50 border-blue-500 text-blue-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
            >
              {layer.replace('_', ' ')}
            </button>
          ))}
          <button onClick={onClose} className="ml-4 px-4 py-1 border border-red-800 text-red-500 hover:bg-red-900/30">CLOSE</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Map Placeholder: Reusing conceptual layout without external geo libraries */}
        <div className="flex-1 p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 overflow-y-auto content-start">
          {Object.values(worldCountries).map(country => {
            const poll = publicOpinionData[country.id];
            let bgColor = 'bg-gray-900';
            let borderColor = 'border-gray-800';
            let mainValue = '--';
            
            if (poll) {
              if (activeLayer === 'LEADER_APPROVAL') {
                mainValue = Math.floor(poll.leaderApprovalRating) + '%';
                if (poll.leaderApprovalRating > 60) bgColor = 'bg-green-900/30';
                else if (poll.leaderApprovalRating < 30) bgColor = 'bg-red-900/30';
              } else if (activeLayer === 'WAR_SUPPORT') {
                mainValue = Math.floor(poll.warSupportIndex) + '%';
                if (poll.warSupportIndex > 60) bgColor = 'bg-red-900/30';
              } else if (activeLayer === 'POLARIZATION') {
                mainValue = Math.floor(poll.polarizationIndex) + '%';
                if (poll.polarizationIndex > 60) bgColor = 'bg-amber-900/30';
              } else if (activeLayer === 'NARRATIVE_PENETRATION') {
                const maxPen = Object.values(narrativeCampaigns)
                   .filter(c => c.targetCountryId === country.id)
                   .reduce((max, c) => Math.max(max, c.beliefAdoption), 0);
                mainValue = Math.floor(maxPen) + '%';
                if (maxPen > 50) bgColor = 'bg-blue-900/30';
                if (maxPen > 0) borderColor = 'border-blue-800';
              }
            }

            return (
              <button 
                key={country.id}
                onClick={() => setSelectedCountryId(country.id)}
                className={`p-4 border ${borderColor} ${bgColor} flex flex-col items-center justify-center hover:border-gray-400 transition-colors ${selectedCountryId === country.id ? 'ring-2 ring-white' : ''}`}
              >
                <div className="text-2xl mb-2">{(country as any).flagEmoji}</div>
                <div className="font-bold text-white text-sm mb-1 text-center">{country.name}</div>
                <div className="text-xl font-bold font-mono">{mainValue}</div>
              </button>
            )
          })}
        </div>

        {selectedCountryId && selectedPoll && (
          <div className="w-96 border-l border-gray-800 bg-gray-900/80 p-6 overflow-y-auto">
            <div className="text-3xl mb-2">{(worldCountries[selectedCountryId] as any)?.flagEmoji}</div>
            <h2 className="text-2xl font-bold text-white mb-6 uppercase">{worldCountries[selectedCountryId]?.name}</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-black border border-gray-800">
                <div className="text-xs text-gray-500 mb-1">LEADER APPROVAL</div>
                <div className="flex items-end gap-2">
                  <div className="text-3xl font-bold text-white">{Math.floor(selectedPoll.leaderApprovalRating)}%</div>
                  <div className={`text-sm mb-1 ${selectedPoll.leaderApprovalTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedPoll.leaderApprovalTrend >= 0 ? '▲' : '▼'}{Math.abs(Math.floor(selectedPoll.leaderApprovalTrend))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-black border border-gray-800">
                <div className="text-xs text-gray-500 mb-1">WAR SUPPORT</div>
                <div className="text-3xl font-bold text-white">{Math.floor(selectedPoll.warSupportIndex)}%</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Social Cohesion</span><span>{Math.floor(selectedPoll.socialCohesionIndex)}/100</span></div>
                <div className="h-1 bg-gray-800"><div className="h-full bg-blue-500" style={{width: `${selectedPoll.socialCohesionIndex}%`}}/></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Polarization</span><span>{Math.floor(selectedPoll.polarizationIndex)}/100</span></div>
                <div className="h-1 bg-gray-800"><div className="h-full bg-amber-500" style={{width: `${selectedPoll.polarizationIndex}%`}}/></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="border border-red-900/50 bg-red-900/10 p-3">
                  <div className="text-[10px] text-red-500/70 mb-1">PROTEST LIKELIHOOD</div>
                  <div className="text-xl font-bold text-red-400">{Math.floor(selectedPoll.protestLikelihood)}%</div>
                </div>
                <div className="border border-red-900/50 bg-red-900/10 p-3">
                  <div className="text-[10px] text-red-500/70 mb-1">COUP LIKELIHOOD</div>
                  <div className="text-xl font-bold text-red-400">{Math.floor(selectedPoll.coupLikelihood)}%</div>
                </div>
            </div>

            <h3 className="text-sm font-bold text-gray-400 mb-4 border-b border-gray-800 pb-2">ACTIVE NARRATIVES</h3>
            {Object.keys(selectedPoll.activeNarrativeBeliefScores).length === 0 ? (
              <div className="text-sm text-gray-600 italic">No active operations detected in population.</div>
            ) : null}
            <div className="space-y-4">
              {Object.entries(selectedPoll.activeNarrativeBeliefScores).map(([campaignId, score]) => {
                const c = narrativeCampaigns[campaignId];
                if (!c) return null;
                return (
                  <div key={campaignId} className="bg-black border border-gray-800 p-3">
                    <div className="text-xs text-blue-400 mb-1">{c.codename}</div>
                    <div className="text-sm text-white font-bold mb-2">{c.theme.replace('_', ' ')}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-800"><div className="h-full bg-blue-500" style={{width: `${score}%`}}/></div>
                      <div className="text-xs font-bold w-8 text-right">{Math.floor(score)}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-800 text-center">
              <div className="inline-block px-3 py-1 bg-black border border-gray-700 text-xs text-gray-500">
                POLL CONFIDENCE: {selectedPoll.pollConfidence}%
              </div>
              {selectedPoll.isManipulatedPoll && (
                <div className="mt-2 text-xs text-amber-500 font-bold px-2 py-1 bg-amber-500/10 border border-amber-500/30">
                  DATA MAY BE MANIPULATED
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
