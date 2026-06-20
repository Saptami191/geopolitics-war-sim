import React, { useState } from 'react';
import { useMirrorStore } from '../../store/mirrorStore';
import { useWorldStore } from '../../store/worldStore';
import { SovereignAgent, SovereignDecision } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export default function SovereignMonitor() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const {
    sovereign_agents,
    sovereign_lastProcessedTick,
    mirror_advisoryLog,
    sovereign_crisesEmergent,
    sovereign_globalDecisionLog,
    sovereign_getDecisionsThisTick
  } = useMirrorStore();

  const currentTick = useWorldStore((s) => s.currentTick);

  if (!isOpen) {
    return (
      <div className="fixed bottom-32 left-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-900 border border-purple-500/50 text-purple-400 px-3 py-2 text-xs font-mono uppercase hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          SOVEREIGN_AI CORE
        </button>
      </div>
    );
  }

  const agents = Object.values(sovereign_agents) as SovereignAgent[];
  const agent = selectedAgent ? sovereign_agents[selectedAgent] : null;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-96 max-h-[80vh] flex flex-col bg-gray-950/95 border border-purple-500/30 text-purple-100 shadow-2xl backdrop-blur font-mono text-xs overflow-hidden">
      <div className="bg-gray-900/80 p-2 border-b border-purple-500/30 flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(false)}>
        <span className="font-bold tracking-widest text-purple-400">SOVEREIGN AI DIRECTIVE MONITOR</span>
        <button className="text-gray-400 hover:text-white border px-2 border-gray-700 bg-gray-800">MINIMIZE</button>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden p-2 gap-2">
        <div className="flex gap-2 mb-2 p-2 bg-gray-900/40 border border-gray-800">
          <div className="flex-1">
            <div className="text-gray-400 mb-1">SYSTEM STATUS</div>
            <div className="text-purple-300">ONLINE • ACTIVE</div>
          </div>
          <div className="flex-1 text-right">
            <div className="text-gray-400 mb-1">SYNC TICK</div>
            <div>{sovereign_lastProcessedTick} <span className="text-gray-500">/ {currentTick}</span></div>
          </div>
        </div>

        <div className="text-gray-400 uppercase text-[10px] mb-1 font-bold">SOVEREIGN AGENTS ({agents.length})</div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent">
          {agents.map((a) => (
            <button
              key={a.nationId}
              onClick={() => setSelectedAgent(a.nationId)}
              className={`flex-shrink-0 px-3 py-1 border transition-colors ${selectedAgent === a.nationId ? 'bg-purple-900/50 border-purple-400 text-white' : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-purple-500/50'}`}
            >
              {a.nationId}
            </button>
          ))}
        </div>

        {agent ? (
          <div className="p-3 bg-gray-900/60 border border-purple-900/50 mt-2 space-y-3 overflow-y-auto max-h-[40vh] custom-scrollbar">
            <div className="flex justify-between items-baseline border-b border-gray-800 pb-1">
              <span className="text-sm font-bold text-white">{agent.nationId} - {agent.leaderProfile.name}</span>
              <span className="text-[10px] text-gray-500">{agent.leaderProfile.archetype}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><span className="text-gray-500">POWER_ORIENT:</span> {agent.powerOrientation}</div>
              <div><span className="text-gray-500">RISK_PROFILE:</span> {agent.riskTolerance}</div>
              <div className="col-span-2 flex items-center justify-between">
                <span className="text-gray-500">DOMESTIC_APPROVAL:</span> 
                <div className="w-1/2 bg-gray-800 h-1"><div className="bg-purple-500 h-1" style={{width: `${agent.leaderProfile.domesticApprovalScore}%`}}/></div>
              </div>
            </div>

            <div>
              <div className="text-gray-500 mb-1">ACTIVE DIRECTIVES [{agent.activeObjectives.length}]</div>
              <ul className="space-y-1">
                {agent.activeObjectives.map((obj, i) => (
                  <li key={i} className="flex justify-between bg-gray-950 p-1 border border-gray-800">
                    <span className="truncate w-3/4">{obj.type}</span>
                    <span className={obj.progressScore > 50 ? 'text-green-400' : 'text-orange-400'}>{obj.progressScore}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-gray-500 mb-1">DOMINANT THREATS</div>
              <ul className="space-y-1">
                {[...agent.threatAssessments].sort((a,b)=>b.overallThreatScore - a.overallThreatScore).slice(0,2).map((t, i) => (
                  <li key={i} className="flex justify-between bg-gray-950 p-1 border border-gray-800">
                    <span>{t.targetNationId}</span>
                    <span className="text-red-400">{t.overallThreatScore.toFixed(0)} ({t.trendDirection})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-4 mt-2 text-center text-gray-600 bg-gray-900/30 border border-gray-800 border-dashed">
            SELECT AGENT FOR TELEMETRY
          </div>
        )}

        <div className="mt-2 text-gray-400 uppercase text-[10px] font-bold">RECENT DECISION LOG</div>
        <div className="flex-1 bg-gray-950 p-2 overflow-y-auto border border-gray-800 custom-scrollbar max-h-40">
          {sovereign_globalDecisionLog.slice(0, 10).map((dec, i) => (
            <div key={i} className="mb-2 pb-2 border-b border-gray-800/50 last:border-0 last:mb-0 last:pb-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-blue-400 font-bold">[{dec.nationId}]</span>
                <span className="text-gray-500 text-[9px]">T+{dec.decidedAtTick}</span>
              </div>
              <div className="text-purple-200">{dec.instrument} &rarr; {dec.targetNationId || 'REGIONAL'}</div>
              <div className="text-[10px] text-gray-400 mt-1 pl-2 border-l border-gray-700 italic">{dec.rationale}</div>
            </div>
          ))}
          {sovereign_globalDecisionLog.length === 0 && (
            <div className="text-center text-gray-600 py-4">NO DECISIONS LOGGED YET</div>
          )}
        </div>
      </div>
    </div>
  );
}
