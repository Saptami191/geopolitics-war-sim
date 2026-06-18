import React, { useState } from 'react';
import useCounterProliferationStore from '../../store/counterProliferationStore';
import { ProliferationNode, ProliferationEdge, ProliferationNodeType, ProliferationThreatLevel, VerificationTier } from '../../types';
import { Layers, GitBranch, ShieldAlert, CheckCircle, HelpCircle, HardHat, FileText, Anchor, Compass } from 'lucide-react';

const getNodeIcon = (type: ProliferationNodeType) => {
  switch (type) {
    case 'VESSEL': return <Anchor className="w-3.5 h-3.5 text-blue-400" />;
    case 'BROKER': return <Compass className="w-3.5 h-3.5 text-orange-400" />;
    case 'FACILITY': return <HardHat className="w-3.5 h-3.5 text-red-500" />;
    case 'BANK': return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
    default: return <Layers className="w-3.5 h-3.5 text-sky-400" />;
  }
};

const getThreatBadgeColor = (threat: ProliferationThreatLevel) => {
  switch (threat) {
    case 'CRITICAL': return 'bg-red-950/80 border-red-500 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse';
    case 'VERIFIED': return 'bg-orange-950/60 border-orange-600 text-orange-400';
    case 'PROBABLE': return 'bg-yellow-950/40 border-yellow-600 text-yellow-400';
    case 'SUSPECTED': return 'bg-sky-950/40 border-sky-600 text-sky-300';
    default: return 'bg-slate-900 border-slate-700 text-slate-400';
  }
};

const getVerificationTierColor = (vt: VerificationTier) => {
  switch (vt) {
    case 'OPERATIONALLY_ACTIONABLE': return 'text-emerald-400 border-emerald-500 bg-emerald-950/20';
    case 'LEGAL_THRESHOLD_MET': return 'text-sky-400 border-sky-500 bg-sky-950/20';
    case 'STRONG': return 'text-purple-400 border-purple-500 bg-purple-950/20';
    case 'CORROBORATED': return 'text-yellow-400 border-yellow-500 bg-yellow-950/20';
    default: return 'text-slate-400 border-slate-600 bg-slate-900';
  }
};

export default function ProliferationNetworkPanel() {
  const { networks, selectedNetworkId, updateNodeConfidence } = useCounterProliferationStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const net = selectedNetworkId ? networks[selectedNetworkId] : null;

  if (!net) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border border-slate-900/60 rounded bg-slate-950/30 font-mono text-center p-8 select-none">
        <Layers className="w-12 h-12 text-slate-700 mb-2" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600">NO ACTIVE NETWORK CHOSEN</span>
      </div>
    );
  }

  const nodes = Object.values(net.nodes);
  const edges = Object.values(net.edges);
  const selectedNode = selectedNodeId ? net.nodes[selectedNodeId] : null;

  return (
    <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
      {/* Network Overview Screen */}
      <div className="col-span-8 flex flex-col border border-sky-900/30 bg-slate-950/50 rounded-lg p-4 font-mono overflow-auto scrollbar-none">
        <div className="flex justify-between items-start border-b border-sky-900/40 pb-3 mb-3">
          <div>
            <h2 className="text-sm font-bold text-sky-300 uppercase tracking-wider">{net.label}</h2>
            <div className="flex gap-2 items-center mt-1 text-[9.5px]">
              <span className="text-slate-500">THREAT DESIGNATION:</span>
              <span className={`px-2 py-0.5 border text-[9px] font-bold rounded ${getThreatBadgeColor(net.threatLevel)}`}>
                {net.threatLevel}
              </span>
              <span className="text-slate-500">// VERIFICATION:</span>
              <span className={`px-2 py-0.5 border text-[9px] font-bold rounded ${getVerificationTierColor(net.verificationTier)}`}>
                {net.verificationTier}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-sky-500 font-extrabold tracking-widest uppercase">READINESS_LEVEL</span>
            <div className="text-lg font-black text-lime-400 mt-0.5">{net.operationalReadiness}%</div>
          </div>
        </div>

        {/* Tactical Alerts Feed */}
        {net.activeAlerts.length > 0 && (
          <div className="bg-red-950/40 border border-red-500/20 rounded p-2.5 mb-4 text-red-300 text-[10px] animate-pulse">
            <div className="flex items-center gap-2 font-black uppercase text-[10.5px] text-red-400 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              PRIORITY PROLIFERATION ALERTS
            </div>
            {net.activeAlerts.map((alert, i) => (
              <div key={i} className="font-mono mt-0.5 leading-relaxed">• {alert}</div>
            ))}
          </div>
        )}

        {/* Network Nodes Grid */}
        <h3 className="text-[10.5px] font-bold text-sky-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-sky-400" />
          MAPPED INTEL NODES ({nodes.length})
        </h3>
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.nodeId;
            return (
              <div
                key={node.nodeId}
                onClick={() => setSelectedNodeId(node.nodeId)}
                className={`border p-2.5 rounded cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'border-sky-400 bg-sky-950/40 shadow-[0_0_12px_rgba(56,189,248,0.15)] text-sky-100' 
                    : 'border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5 font-bold text-[10.5px] tracking-wide max-w-[80%] truncate">
                    {getNodeIcon(node.nodeType)}
                    <span className="truncate">{node.label}</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.2 border border-slate-800 bg-slate-950/80 text-slate-500 uppercase font-black tracking-widest">
                    {node.nodeType}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mt-3 text-[9px] border-t border-slate-800/40 pt-1.5 text-slate-400 select-none">
                  <div className="flex items-center gap-1">
                    <span>CONFIDENCE:</span>
                    <span className="font-bold text-sky-400">{node.confidence}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>RELEVANCE:</span>
                    <span className="font-bold text-emerald-400">{node.materialRelevance}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Critical Edge Paths Table */}
        <h3 className="text-[10.5px] font-bold text-sky-400 uppercase tracking-widest mb-2">
          MATERIAL & FINANCIAL SHIPMENT CHANNELS
        </h3>
        <div className="border border-slate-900 bg-slate-900/40 rounded overflow-hidden">
          <table className="w-full text-left text-[9px]">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-500 uppercase font-black">
              <tr>
                <th className="p-2">CHANNEL ORIGIN ({net.rootNodes.length} ROOT)</th>
                <th className="p-2">DESTINATION (TRAFFIC)</th>
                <th className="p-2">TYPE</th>
                <th className="p-2 text-right">CONFIDENCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300 select-none">
              {edges.map((edge) => {
                const routeFrom = net.nodes[edge.fromNodeId]?.label || edge.fromNodeId;
                const routeTo = net.nodes[edge.toNodeId]?.label || edge.toNodeId;
                return (
                  <tr key={edge.edgeId} className="hover:bg-slate-950/30">
                    <td className="p-2 font-bold max-w-[150px] truncate">{routeFrom}</td>
                    <td className="p-2 truncate">{routeTo}</td>
                    <td className="p-2 font-semibold text-slate-400">{edge.relationshipType}</td>
                    <td className="p-2 text-right text-sky-400 font-bold">{edge.confidence}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Node Details Sidecar */}
      <div className="col-span-4 flex flex-col border border-sky-900/30 bg-slate-950/65 rounded-lg p-3 font-mono overflow-auto scrollbar-none select-none">
        {selectedNode ? (
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
                {getNodeIcon(selectedNode.nodeType)}
                <div>
                  <h4 className="text-[11px] font-bold text-sky-200 uppercase leading-snug">{selectedNode.label}</h4>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{selectedNode.nodeType} NODE</span>
                </div>
              </div>

              {/* Node Stats Block */}
              <div className="grid grid-cols-2 gap-2 text-[9px] mb-3 bg-slate-900/25 border border-slate-800/40 p-2 rounded">
                <div>
                  <span className="text-slate-500 uppercase">THREAT INDEX:</span>
                  <div className="font-extrabold text-red-400 mt-0.5">{selectedNode.threatLevel}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase">LEGAL SENSITIVITY:</span>
                  <div className="font-extrabold text-purple-400 mt-0.5">{selectedNode.legalSensitivity}%</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase">OP SENSITIVITY:</span>
                  <div className="font-extrabold text-[#00ffcc] mt-0.5">{selectedNode.operationalSensitivity}%</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase">EXPOSURE RISK:</span>
                  <div className="font-extrabold text-yellow-400 mt-0.5">{selectedNode.exposureRisk}%</div>
                </div>
              </div>

              {/* Confidence Increment/Decrement control */}
              <div className="mb-4">
                <span className="text-[9.5px] text-indigo-400 font-bold uppercase tracking-wider block mb-1.5">Intel Verification Booster</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateNodeConfidence(net.networkId, selectedNode.nodeId, Math.max(10, selectedNode.confidence - 10))}
                    className="flex-1 opacity-80 hover:opacity-100 hover:bg-slate-800 text-[10px] py-1 border border-slate-800 text-slate-400 text-center font-black cursor-pointer transition-all"
                  >
                    -10% DEC
                  </button>
                  <div className="text-center w-12 font-black text-sky-400 text-xs">{selectedNode.confidence}%</div>
                  <button 
                    onClick={() => updateNodeConfidence(net.networkId, selectedNode.nodeId, Math.min(100, selectedNode.confidence + 10))}
                    className="flex-1 opacity-80 hover:opacity-100 hover:bg-slate-800 text-[10px] py-1 border border-slate-800 text-sky-400 text-center font-black cursor-pointer transition-all"
                  >
                    +10% INC
                  </button>
                </div>
              </div>

              {/* Analyst Intelligence Notes */}
              <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider block mb-1">RAW INTEL DATA LOGS</span>
              <div className="space-y-1.5 max-h-[160px] overflow-auto pr-1">
                {selectedNode.notes.map((note, index) => (
                  <div key={index} className="bg-slate-900/60 p-1.5 border border-slate-800/40 rounded text-[9.5px] text-slate-300 leading-relaxed font-mono">
                    {note}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 mt-4 text-[8px] text-slate-500 text-center uppercase tracking-widest font-black">
              LAST RECORDED UPDATE: TICK {selectedNode.lastObservedTick}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 font-mono text-center select-none">
            <HelpCircle className="w-10 h-10 text-slate-800 mb-2" />
            <span className="text-[9.5px] uppercase font-bold tracking-wider">SELECT INTEL NODE FOR REAL-TIME ANALYTICS</span>
          </div>
        )}
      </div>
    </div>
  );
}
