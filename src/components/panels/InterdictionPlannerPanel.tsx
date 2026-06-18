import React, { useState, useEffect } from 'react';
import useCounterProliferationStore from '../../store/counterProliferationStore';
import { CounterProliferationAction, LegalBlowbackLevel } from '../../types';
import { Play, ShieldAlert, CheckCircle, Info, ChevronRight, Activity } from 'lucide-react';

const ACTIONS_INFO: Record<CounterProliferationAction, { label: string; desc: string; authReq: string; style: string }> = {
  'MONITOR': { 
    label: 'PROACTIVE SIGNAL MONITORING', 
    desc: 'Unobtrusively track cell communications, transshipment routes, and financial wires. Maintains lowest exposure.', 
    authReq: 'UNRESTRICTED',
    style: 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900'
  },
  'SANCTION': { 
    label: 'REPRESENTATIVE SANCTIONS', 
    desc: 'Formulate regulatory filings to seize assets and blackball associated banking entities.', 
    authReq: 'CORROBORATED',
    style: 'border-yellow-950/40 bg-yellow-950/10 hover:border-yellow-800'
  },
  'EXPOSE': { 
    label: 'PUBLIC CLASSIFIED EXPOSURE', 
    desc: 'Declassify shipping documentation and satellite imagery of centrifuge modules to international media.', 
    authReq: 'CORROBORATED',
    style: 'border-indigo-950/40 bg-indigo-950/10 hover:border-indigo-800'
  },
  'DENY_ACCESS': { 
    label: 'REGULATORY EMBARGO AND PORT REJECTION', 
    desc: 'Compel neutral coastal maritime jurisdictions to deny harbor entry permissions for suspected hulls.', 
    authReq: 'CORROBORATED',
    style: 'border-sky-950/40 bg-sky-950/10 hover:border-sky-800'
  },
  'DISRUPT': { 
    label: 'DIGITAL STRIKE / CYBER OPERATIONS', 
    desc: 'Deploy target-specific malware to trigger failures in facility enrichment rotor controls.', 
    authReq: 'STRONG',
    style: 'border-purple-950/40 bg-purple-950/10 hover:border-purple-800'
  },
  'FRAGMENT_NETWORK': { 
    label: 'COVERT LOGISTICS FRAGMENTATION', 
    desc: 'Manipulate bills of lading and split maritime transshippers. Force cellular fragmentation.', 
    authReq: 'STRONG',
    style: 'border-purple-950/40 bg-purple-950/10 hover:border-purple-850'
  },
  'DETAIN': { 
    label: 'LAW ENFORCEMENT INTERCEPTION', 
    desc: 'Coordinate with local law-enforcement conduits to arrest regional logistics brokers.', 
    authReq: 'STRONG',
    style: 'border-purple-950 bg-purple-950/20 hover:border-purple-700'
  },
  'SEIZE': { 
    label: 'OVERT PORT SEIZURE', 
    desc: 'Board and impound transshipment vessels under legal warrant files in allied port facilities.', 
    authReq: 'LEGAL_THRESHOLD_MET',
    style: 'border-sky-600 bg-sky-900/10 hover:border-sky-500'
  },
  'INTERDICT': { 
    label: 'MILITARY CARGO INTERDICTION', 
    desc: 'Deploy special warfare assault assets to conduct visit, board, search, and seizure in international waters.', 
    authReq: 'LEGAL_THRESHOLD_MET',
    style: 'border-orange-600 bg-orange-950/10 hover:border-orange-500'
  },
  'SABOTAGE': { 
    label: 'KINETIC SABOTAGE STRIKE', 
    desc: 'Conduct non-traceable, high-impact precision operations to physically neutralize facility centrifuges.', 
    authReq: 'OPERATIONALLY_ACTIONABLE',
    style: 'border-red-600 bg-red-950/10 hover:border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.15)]'
  }
};

export default function InterdictionPlannerPanel() {
  const { 
    networks, 
    selectedNetworkId, 
    planInterdiction, 
    executeInterdiction, 
    blockPrematureAction, 
    compareActionRisk, 
    calculateActionReadiness,
    calculateLegalBlowback,
    cases,
    selectedCaseId
  } = useCounterProliferationStore();

  const [selectedAction, setSelectedAction] = useState<CounterProliferationAction>('MONITOR');

  const net = selectedNetworkId ? networks[selectedNetworkId] : null;

  // Plan a case whenever action or network changes
  useEffect(() => {
    if (net) {
      planInterdiction(net.networkId, selectedAction);
    }
  }, [selectedAction, selectedNetworkId]);

  if (!net) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border border-slate-900/60 rounded bg-slate-950/30 font-mono text-center p-8 select-none">
        <ShieldAlert className="w-12 h-12 text-slate-700 mb-2" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600">NO ACTIVE NETWORK CHOSEN</span>
      </div>
    );
  }

  const activeCase = selectedCaseId ? cases[selectedCaseId] : null;
  const isBlocked = blockPrematureAction(net.networkId, selectedAction);
  const risk = compareActionRisk(net.networkId, selectedAction);
  const readiness = calculateActionReadiness(net.networkId, selectedAction);
  const projectedBlowback = calculateLegalBlowback(net.networkId, selectedAction);

  const handleExecute = () => {
    if (activeCase) {
      executeInterdiction(activeCase.caseId);
    }
  };

  return (
    <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden select-none">
      {/* List of tactical actions (Left) */}
      <div className="col-span-6 flex flex-col border border-sky-900/30 bg-slate-950/50 rounded-lg p-3 font-mono overflow-auto scrollbar-none">
        <h2 className="text-xs font-bold text-sky-400 uppercase tracking-widest border-b border-sky-900/30 pb-2 mb-2.5">
          TACTICAL COUNTER-PROLIFERATION CHARTER
        </h2>
        
        <div className="space-y-2 max-h-[460px] overflow-auto">
          {Object.entries(ACTIONS_INFO).map(([actionKey, actionVal]) => {
            const act = actionKey as CounterProliferationAction;
            const isCurrent = selectedAction === act;
            const isPremature = blockPrematureAction(net.networkId, act);
            
            return (
              <div
                key={actionKey}
                onClick={() => setSelectedAction(act)}
                className={`border p-2.5 rounded cursor-pointer transition-all ${actionVal.style} ${
                  isCurrent ? 'ring-1 ring-sky-400' : 'opacity-85'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="font-extrabold text-[10px] uppercase text-sky-200">
                    {actionVal.label}
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.2 border rounded ${
                    isPremature 
                      ? 'text-red-500 border-red-950 bg-red-950/25' 
                      : 'text-emerald-400 border-emerald-950 bg-emerald-950/15'
                  }`}>
                    {isPremature ? 'LOCKED (PROOF REQ)' : 'AVAILABLE'}
                  </span>
                </div>
                <div className="text-[9.2px] text-slate-400 font-mono mt-1 leading-normal">
                  {actionVal.desc}
                </div>
                <div className="text-[8.5px] text-indigo-400 mt-2 font-mono flex items-center justify-between">
                  <span>REQUIRED TIER: <span className="font-bold">{actionVal.authReq}</span></span>
                  <span>VERIFIED READINESS: <span className="font-bold">{calculateActionReadiness(net.networkId, act)}%</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Case analysis dashboard (Right) */}
      <div className="col-span-6 flex flex-col border border-sky-900/30 bg-slate-950/65 rounded-lg p-4 font-mono overflow-auto scrollbar-none justify-between">
        <div>
          <h2 className="text-xs font-bold text-sky-400 uppercase tracking-widest border-b border-sky-900/30 pb-2 mb-3">
            TACTICAL CASE BRIEFING
          </h2>

          {activeCase ? (
            <div className="space-y-4">
              <div className="bg-slate-900/40 border border-slate-800 p-2.5 rounded">
                <div className="text-[8.5px] text-slate-500 uppercase font-black">ACTIVE PLANNING CASE</div>
                <div className="text-[11px] font-bold text-sky-200 mt-1 uppercase tracking-wide">
                  {ACTIONS_INFO[activeCase.selectedAction].label}
                </div>
              </div>

              {/* Real-time Risk Matrices Grid */}
              <div>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mb-2">OPERATIONAL COMPLEXITY & RISK MATRIX</span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-slate-900/40 border border-slate-900 p-2 rounded text-center">
                    <span className="text-slate-500 text-[8px] uppercase block">COLLATERAL RISK</span>
                    <span className={`text-xs font-bold block mt-1 ${risk.collateral > 50 ? 'text-red-400' : 'text-slate-300'}`}>
                      {risk.collateral}%
                    </span>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-900 p-2 rounded text-center">
                    <span className="text-slate-500 text-[8px] uppercase block">DIPLOMATIC CRITICALTY</span>
                    <span className={`text-xs font-bold block mt-1 ${risk.diplomatic > 50 ? 'text-red-400' : 'text-slate-300'}`}>
                      {risk.diplomatic}%
                    </span>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-900 p-2 rounded text-center">
                    <span className="text-slate-500 text-[8px] uppercase block">OP SEC COMPROMISE</span>
                    <span className={`text-xs font-bold block mt-1 ${risk.operational > 50 ? 'text-red-400' : 'text-slate-300'}`}>
                      {risk.operational}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Projected Blowback levels & effectiveness */}
              <div className="space-y-2 bg-slate-900/20 border border-slate-900 p-3 rounded">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-bold">PROJECTED EFFECTIVENESS:</span>
                  <span className="font-extrabold text-emerald-400">{readiness}%</span>
                </div>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-1">
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${readiness}%` }} />
                </div>

                <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-800/60">
                  <span className="text-slate-500 font-bold">ANTICIPATED LEGAL BLOWBACK:</span>
                  <span className={`font-extrabold ${projectedBlowback === 'INTERNATIONAL_CRISIS' || projectedBlowback === 'SEVERE' ? 'text-red-500 animate-pulse' : 'text-slate-300'}`}>
                    {projectedBlowback}
                  </span>
                </div>
              </div>

              {/* Danger alerts on premature override */}
              {isBlocked && (
                <div className="bg-red-950/20 border border-red-500/20 rounded p-2.5 flex gap-2 text-red-300 text-[9px] leading-relaxed">
                  <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-[9.5px] text-red-400 block uppercase">PREMATURE CASE AUTHORIZATION BLOCKED</span>
                    <div>The available intelligence proof on {net.label} does not meet the legal requirement for this operation. Verification Tier must reach the designated levels to release case safety protocols!</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-500 text-[10px] text-center p-8 bg-slate-900/10 border border-dashed border-slate-900 rounded">
              FORMULATING TACTICAL CHARTER BRIEFING...
            </div>
          )}
        </div>

        {/* Execution triggers */}
        <div className="pt-4 border-t border-slate-800/40">
          <button
            onClick={handleExecute}
            disabled={isBlocked}
            className={`w-full py-2.5 font-bold uppercase text-[10px] tracking-widest border transition-all cursor-pointer flex items-center justify-center gap-2 rounded ${
              isBlocked
                ? 'border-slate-800/60 bg-slate-900/20 text-slate-500 cursor-not-allowed opacity-50'
                : 'border-red-500 bg-red-950/30 hover:bg-red-900/40 hover:text-white text-red-400 font-black shadow-[0_0_15px_rgba(239,68,68,0.1)]'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            EXECUTE DEFENSE OPERATION CHARTER
          </button>
        </div>
      </div>
    </div>
  );
}
