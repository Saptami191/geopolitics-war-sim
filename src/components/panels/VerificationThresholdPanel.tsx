import React from 'react';
import useCounterProliferationStore from '../../store/counterProliferationStore';
import { Shield, GitCommit, FileSpreadsheet, Eye, HelpCircle, AlertTriangle } from 'lucide-react';

const tierRules: Record<string, { desc: string; detail: string; status: string; statusColor: string }> = {
  'UNVERIFIED': { 
    desc: 'Unrefined, loose raw reports and unverified intelligence files.', 
    detail: 'Insufficient intelligence data to perform operational planning or issue legal sanction warrants.',
    status: 'AUTHORIZATION DENIED', 
    statusColor: 'text-red-500 border-red-900 bg-red-950/20'
  },
  'WEAK': { 
    desc: 'Fragmented data corroboration; signal noise index remains highly volatile.', 
    detail: 'High threat of diplomatic and sovereign collateral liability. Limited low-profile tracking permitted.',
    status: 'RESTRICTED PROFILE ONLY', 
    statusColor: 'text-orange-400 border-orange-950 bg-orange-950/20'
  },
  'CORROBORATED': { 
    desc: 'Signals intelligence matched with human broker operational trade loops.', 
    detail: 'Allows diplomatic disclosures and formal financial sanctions filing across neutral alliance blocks.',
    status: 'SANCTIONS FILE OPEN', 
    statusColor: 'text-yellow-400 border-yellow-950 bg-yellow-950/10'
  },
  'STRONG': { 
    desc: 'Multi-domain corroboration. Clear correlation of dual-use parts movement.', 
    detail: 'Legal compliance review initialized. Pre-authorized for tactical asset monitoring and cyber denial.',
    status: 'PREPARATION AUTHORIZED', 
    statusColor: 'text-purple-400 border-purple-950 bg-purple-950/20'
  },
  'LEGAL_THRESHOLD_MET': { 
    desc: 'Strict legal justification satisfied. Evidentiary files locked and documented.', 
    detail: 'Meets full regulatory threshold requirements for overt maritime cargo interdiction and seizure.',
    status: 'INTERDICTION LEGALized', 
    statusColor: 'text-sky-400 border-sky-500 bg-sky-950/30'
  },
  'OPERATIONALLY_ACTIONABLE': { 
    desc: 'Flawless near real-time tracking with verified tracking and shipping manifests.', 
    detail: 'Full unilateral authorization. Covert sabotage operations authorized to disrupt critical breakout targets.',
    status: 'UNRESTRICTED ACCESS', 
    statusColor: 'text-emerald-400 border-emerald-500 bg-emerald-950/30 animate-pulse'
  }
};

export default function VerificationThresholdPanel() {
  const { networks, selectedNetworkId } = useCounterProliferationStore();
  const net = selectedNetworkId ? networks[selectedNetworkId] : null;

  if (!net) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border border-slate-900/60 rounded bg-slate-950/30 font-mono text-center p-8 select-none">
        <Shield className="w-12 h-12 text-slate-700 mb-2" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600">NO ACTIVE NETWORK CHOSEN</span>
      </div>
    );
  }

  const conf = net.confidence;
  const currentTier = net.verificationTier;
  const rule = tierRules[currentTier] || { desc: 'Evaluation in progress.', detail: 'Analyzing signals...', status: 'UNDER REVIEW', statusColor: 'text-slate-400 border-slate-800' };

  return (
    <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden select-none">
      {/* Ladder and Verification Levels */}
      <div className="col-span-7 flex flex-col border border-sky-900/30 bg-slate-950/50 rounded-lg p-4 font-mono overflow-auto scrollbar-none">
        <h2 className="text-xs font-bold text-sky-400 uppercase tracking-widest border-b border-sky-900/30 pb-2 mb-3">
          VERIFICATION CONFIDENCE LADDER
        </h2>

        {/* The 6-tier Confidence ladder */}
        <div className="flex flex-col gap-2 mb-4">
          {Object.entries(tierRules).reverse().map(([tierKey, tierVal]) => {
            const isActive = currentTier === tierKey;
            return (
              <div
                key={tierKey}
                className={`border p-2.5 rounded transition-all flex flex-col relative overflow-hidden ${
                  isActive
                    ? 'border-sky-400 bg-sky-950/40 shadow-[0_0_12px_rgba(56,189,248,0.1)]'
                    : 'border-slate-800/80 bg-slate-900/20 text-slate-400 opacity-60'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                )}
                <div className="flex justify-between items-center bg-slate-900/40 p-1 px-1.5 rounded text-[9.5px] mb-1 font-bold">
                  <span className={isActive ? 'text-sky-300' : 'text-slate-500'}>{tierKey}</span>
                  <span className={`text-[8.5px] uppercase font-bold border px-1.5 py-0.2 rounded ${tierVal.statusColor}`}>
                    {tierVal.status}
                  </span>
                </div>
                <div className="text-[9.5px] leading-relaxed text-slate-300 mt-0.5 px-0.5">
                  {tierVal.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confidence Gauges and Risk Assessment Sidecar */}
      <div className="col-span-5 flex flex-col border border-sky-900/30 bg-slate-950/65 rounded-lg p-4 font-mono overflow-auto scrollbar-none justify-between">
        <div>
          <h2 className="text-xs font-bold text-sky-400 uppercase tracking-widest border-b border-sky-900/30 pb-2 mb-3">
            EVIDENTIARY RISK ASSESSMENT
          </h2>

          <div className="text-[10px] text-sky-500 font-bold uppercase tracking-wider mb-2">VERIFICATION INDEX PROFILE</div>
          
          <div className="space-y-2.5 mb-4 bg-slate-900/20 border border-slate-900 p-2.5 rounded">
            {/* Verification Confidence */}
            <div>
              <div className="flex justify-between text-[9px] mb-1">
                <span className="text-slate-400 font-bold">VERIFICATION LEVEL</span>
                <span className="font-extrabold text-sky-400">{conf.verificationConfidence}%</span>
              </div>
              <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-sky-500 h-full transition-all duration-300" style={{ width: `${conf.verificationConfidence}%` }} />
              </div>
            </div>

            {/* Attribution Index */}
            <div>
              <div className="flex justify-between text-[9px] mb-1">
                <span className="text-slate-400 font-bold">ATTRIBUTION CERTAINTY</span>
                <span className="font-extrabold text-indigo-400">{conf.attributionConfidence}%</span>
              </div>
              <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${conf.attributionConfidence}%` }} />
              </div>
            </div>

            {/* Legal Defense Index */}
            <div>
              <div className="flex justify-between text-[9px] mb-1">
                <span className="text-slate-400 font-bold">LEGAL JUSTIFICATION</span>
                <span className="font-extrabold text-purple-400">{conf.legalConfidence}%</span>
              </div>
              <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${conf.legalConfidence}%` }} />
              </div>
            </div>

            {/* Tactical Actionability */}
            <div>
              <div className="flex justify-between text-[9px] mb-1">
                <span className="text-slate-400 font-bold">TACTICAL ACTIONABILITY</span>
                <span className="font-extrabold text-emerald-400">{conf.actionabilityConfidence}%</span>
              </div>
              <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${conf.actionabilityConfidence}%` }} />
              </div>
            </div>
          </div>

          <div className="text-[10px] text-sky-500 font-bold uppercase tracking-wider mb-2">ERROR & SOURCE LIABILITIES</div>
          
          <div className="grid grid-cols-2 gap-2 text-[9px] mb-4">
            <div className="bg-slate-900/40 border border-red-950 p-2 rounded">
              <span className="text-slate-500 uppercase">FALSE POSITIVE RISK</span>
              <div className={`mt-1 font-black text-xs ${conf.falsePositiveRisk > 30 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                {conf.falsePositiveRisk}%
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-2 rounded">
              <span className="text-slate-500 uppercase">FALSE NEGATIVE RISK</span>
              <div className="mt-1 font-black text-slate-400 text-xs">
                {conf.falseNegativeRisk}%
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-2 rounded col-span-2 flex justify-between items-center">
              <span className="text-slate-500 uppercase">COUNTER-INTELLIGENCE CONTAMINATION</span>
              <div className="font-black text-orange-400 text-xs text-right">
                {conf.contaminationRisk}%
              </div>
            </div>
          </div>
        </div>

        {/* Active warnings and critical threshold indicators */}
        {conf.falsePositiveRisk > 25 && (
          <div className="bg-red-950/20 border border-red-900/60 rounded p-2.5 flex items-start gap-2 text-red-300 text-[9px] leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[9.5px] text-red-400 uppercase">EVIDENTIARY DEVIATION DETECTED</span>
              <div>A high False Positive Risk indicates potential counter-intelligence decoys. Launching kinetic or overt interdiction operations carries a high risk of catastrophic legal blowback!</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
