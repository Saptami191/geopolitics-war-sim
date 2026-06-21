import React, { useState } from 'react';
import { useHumintStore } from '../../store/humintStore';
import { useWorldStore } from '../../store/worldStore';

export default function DiscoveryRiskPanel() {
  const humStore = useHumintStore();
  const graph = humStore.discoveryGraph;
  const nodes = Object.values(graph.nodes);
  const edges = Object.values(graph.edges);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const activeNode = selectedNodeId ? graph.nodes[selectedNodeId] : null;

  // Visual offsets for a pristine dynamic visual map inside SVG
  // Simple deterministic circular layout for nodes to prevent overlapping
  const nodePositions = (() => {
    const list = Object.keys(graph.nodes);
    const posRecord: Record<string, { x: number; y: number }> = {};
    const radius = 100;
    const centerX = 200;
    const centerY = 135;

    list.forEach((nId, idx) => {
      // Place source nodes in center, handlers and targets circular
      if (graph.nodes[nId].nodeType === 'SOURCE') {
        posRecord[nId] = { x: centerX + (idx * 20 - 20), y: centerY - 15 };
      } else {
        const angle = (idx / (list.length - 1 || 1)) * 2 * Math.PI;
        posRecord[nId] = {
          x: centerX + Math.cos(angle) * radius * 1.3,
          y: centerY + Math.sin(angle) * radius * 0.9
        };
      }
    });
    return posRecord;
  })();

  const handleDiagnose = (nodeId: string) => {
    if (graph.nodes[nodeId]?.sourceId) {
      humStore.revealAncillaryExposure(graph.nodes[nodeId].sourceId!);
    }
  };

  const handlePurge = (nodeId: string) => {
    if (graph.nodes[nodeId]?.sourceId) {
      humStore.markCompromiseChain(graph.nodes[nodeId].sourceId!);
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'SOURCE': return '#00ffcc';
      case 'HANDLER': return '#00a0ff';
      case 'TARGET': return '#ff2a55';
      case 'OPERATION': return '#f59e0b';
      default: return '#10b981';
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-full overflow-hidden text-[#00ffcc] font-mono">
      {/* Visual SVG Network Graph Screen */}
      <div className="col-span-7 border border-cyan-900/60 bg-black/80 rounded-lg p-3 flex flex-col justify-between h-full min-h-0 relative">
        <h3 className="text-[11px] font-extrabold text-cyan-400 bg-cyan-950/20 p-2 border border-cyan-900/40 rounded uppercase tracking-widest shrink-0 mb-2">
          // CYBERNETIC COVERT FORENSIC LINK GRID [SVG]
        </h3>

        {/* Visual Map rendering area */}
        <div className="flex-1 bg-black/40 border border-cyan-950/60 rounded flex items-center justify-center relative overflow-hidden min-h-0">
          <svg className="w-full h-full min-h-[220px]" viewBox="0 0 400 270">
            {/* Draw Relationship edges */}
            {(edges || []).map((e, idx) => {
              const start = nodePositions[e.fromNodeId];
              const end = nodePositions[e.toNodeId];
              if (!start || !end) return null;
              return (
                <g key={e.edgeId}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={e.weight > 50 ? '#ef4444' : '#00ffd1'}
                    strokeWidth="0.8"
                    strokeDasharray={e.weight > 50 ? "3,3" : "none"}
                    opacity="0.5"
                  />
                  {/* Decorative pulsating center coordinate indicator */}
                  <circle
                    cx={(start.x + end.x) / 2}
                    cy={(start.y + end.y) / 2}
                    r="2"
                    fill={e.weight > 50 ? '#ef4444' : '#00ffd1'}
                    opacity="0.75"
                  />
                </g>
              );
            })}

            {/* Draw Nodes */}
            {(nodes || []).map((n) => {
              const pos = nodePositions[n.nodeId];
              if (!pos) return null;
              const isSelected = selectedNodeId === n.nodeId;
              const color = getNodeColor(n.nodeType);
              return (
                <g 
                  key={n.nodeId}
                  className="cursor-pointer group"
                  onClick={() => setSelectedNodeId(n.nodeId)}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? "11" : "8"}
                    fill="#022a30"
                    stroke={color}
                    strokeWidth={isSelected ? "2" : "1"}
                    className="transition-all duration-150"
                  />
                  {/* Glowing core indicator */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="3.5"
                    fill={color}
                    className="animate-pulse"
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 14}
                    fill={isSelected ? '#ffffff' : color}
                    fontSize="7"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="font-bold uppercase select-none tracking-widest opacity-80 group-hover:opacity-100"
                  >
                    {n.label.replace('SOURCE: ', '').replace('HANDLER: ', '').replace('TARGET: ', '').slice(0, 11)}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-2 left-2 flex gap-3 text-[8.5px] text-cyan-600 uppercase font-semibold bg-black/60 px-2 py-0.5 rounded leading-relaxed border border-cyan-950/40">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#00ffcc] rounded-full" />SOURCE</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#00a0ff] rounded-full" />HANDLER</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#ff2a55] rounded-full" />TARGET</span>
          </div>
        </div>
      </div>

      {/* Forensic Metadata & Action Center Controls */}
      <div className="col-span-5 border border-cyan-900/60 bg-black/95 p-4 rounded-lg flex flex-col justify-between h-full min-h-0">
        <div className="space-y-4">
          <header className="border-b border-cyan-900/40 pb-2">
            <h4 className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider">
              DYNAMIC TRACE FORENSICS
            </h4>
            <div className="flex justify-between text-[9px] text-[#00b0ff] uppercase mt-1">
              <span>ROOT EXPOSURE: <span className="text-red-400 font-bold">{graph.rootExposureRisk}%</span></span>
              <span>TOTAL TRACE: <span className="text-cyan-400 font-bold">{graph.totalTraceability}</span></span>
            </div>
          </header>

          {activeNode ? (
            <div className="space-y-3.5 text-[10px]">
              <div className="border border-cyan-950 bg-[#020b0b]/60 p-2.5 rounded text-[10px] space-y-1.5 leading-relaxed">
                <span className="font-extrabold text-cyan-300 uppercase tracking-widest block font-mono border-b border-cyan-950 pb-0.5">// NODE SUMMARY CARD</span>
                <div>NODE ID: <span className="text-[#00ffcc]">{activeNode.nodeId}</span></div>
                <div>TYPE: <span className="text-cyan-400 font-bold uppercase">{activeNode.nodeType}</span></div>
                <div>RISK WEIGHT: <span className="text-red-400 font-extrabold">{activeNode.riskWeight}%</span></div>
                <div>LOCAL TRACEABILITY: <span className="text-cyan-400 font-bold">{activeNode.traceability}%</span></div>
                <div>COMPARTMENTATION GAP: <span className="text-cyan-400 font-bold">{100 - activeNode.compartmentationPenalty}%</span></div>
              </div>

              {/* Actions */}
              {activeNode.sourceId && (
                <div className="space-y-2">
                  <span className="text-cyan-600 block text-[9px] font-extrabold pb-0.5 border-b border-cyan-950 uppercase tracking-widest">// NODE SECURITY PROTOCOLS</span>
                  <button
                    onClick={() => handleDiagnose(activeNode.nodeId)}
                    className="w-full bg-cyan-950/20 hover:bg-cyan-900/40 border border-cyan-800 text-cyan-300 text-[9px] font-bold py-1.5 uppercase transition-all rounded"
                  >
                    RUN ANCILLARY CORRELATION SWEEP
                  </button>
                  <button
                    onClick={() => handlePurge(activeNode.nodeId)}
                    className="w-full bg-red-950/20 hover:bg-red-900/40 border border-red-800 text-red-400 text-[9px] font-bold py-1.5 uppercase transition-all rounded mt-1.5"
                  >
                    COVERTLY INJECT SECURITY COVER TRACE
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-6 border border-cyan-950/30 text-cyan-700 font-bold bg-[#010808]/50 text-[10.5px] rounded select-none">
              SELECT A NETWORK NODE FROM PLOTTED TOPOLOGY SCHEMATIC TO RUN TARGETED EXPOSURE SWEEPS AND AUDITS.
            </div>
          )}
        </div>

        {/* Global risk bar graph summary */}
        <div className="border border-cyan-950 bg-black/60 p-2.5 rounded text-[9.5px] shrink-0 uppercase">
          <span className="text-cyan-600 block pb-1 border-b border-cyan-950 mb-1.5 tracking-wider font-extrabold">// EXPOSURE HAZARD WARNINGS</span>
          <div className="flex justify-between mb-1 text-[9px]">
            <span>CASCADE EXPOSURE DEPTH:</span>
            <span className="text-cyan-400 font-bold">{graph.cascadeDepth} NODES MAX</span>
          </div>
          <div className="w-full bg-cyan-950/40 h-1 rounded overflow-hidden">
            <div className="bg-cyan-400 h-full" style={{ width: `${graph.rootExposureRisk}%` }} />
          </div>
          <p className="text-[8px] text-cyan-700/80 mt-1.5 leading-relaxed">
            * EXPOSURE COEFFICIENT INDICATES PROBABILITY OF SYSTEMATIC COVET FAILURE IN ADJACENT INTERSTICES. MINIMIZE COMM LOOPS TO DECAY TRACES.
          </p>
        </div>
      </div>
    </div>
  );
}
