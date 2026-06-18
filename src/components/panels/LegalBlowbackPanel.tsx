import React from 'react';
import useCounterProliferationStore from '../../store/counterProliferationStore';
import { Gavel, Globe, EyeOff, ShieldAlert, CheckCircle, Award } from 'lucide-react';
import { LegalBlowbackLevel } from '../../types';

const getBlowbackColor = (lvl: LegalBlowbackLevel) => {
  switch (lvl) {
    case 'INTERNATIONAL_CRISIS': return 'text-red-500 border-red-500 bg-red-950/20 shadow-[0_0_12px_rgba(239,68,68,0.25)] animate-pulse';
    case 'SEVERE': return 'text-orange-500 border-orange-500 bg-orange-950/20';
    case 'HIGH': return 'text-yellow-500 border-yellow-500 bg-yellow-950/10';
    case 'MODERATE': return 'text-purple-400 border-purple-500 bg-purple-950/25';
    case 'LOW': return 'text-sky-400 border-sky-500 bg-sky-950/20';
    default: return 'text-slate-400 border-slate-700 bg-slate-900';
  }
};

const getBlowbackDescription = (lvl: LegalBlowbackLevel) => {
  switch (lvl) {
    case 'INTERNATIONAL_CRISIS': return 'A formal maritime territorial dispute or neutral shipping boarding has caused a massive global rift. Several alliances stand on the verge of suspension or termination.';
    case 'SEVERE': return 'Highly contentious. Sovereign nations have lodged official protests, and a security council inquiry is being assembled to audit covert intelligence directives.';
    case 'HIGH': return 'High domestic sensitivity. Significant leaks are triggering congressional hearings, restricting future operational freedom.';
    case 'MODERATE': return 'Moderate diplomatic static found in international channels. Embargo actions are closely scrutinized.';
    case 'LOW': return 'Minor press coverage, mostly contained within domestic oversight committee archives.';
    default: return 'No significant legal or diplomatic blowback active. Clean operational status.';
  }
};

export default function LegalBlowbackPanel() {
  const { networks, selectedNetworkId, assessInternationalResponse, assessDomesticOversight } = useCounterProliferationStore();
  const net = selectedNetworkId ? networks[selectedNetworkId] : null;

  if (!net) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border border-slate-900/60 rounded bg-slate-950/30 font-mono text-center p-8 select-none">
        <Gavel className="w-12 h-12 text-slate-700 mb-2" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600">NO ACTIVE NETWORK CHOSEN</span>
      </div>
    );
  }

  const actualBlowback = net.legalBlowbackLevel;
  const internationalText = assessInternationalResponse(net.networkId);
  const domesticText = assessDomesticOversight(net.networkId);

  return (
    <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden select-none">
      {/* Legal Oversight Dashboard (Left) */}
      <div className="col-span-7 flex flex-col border border-sky-900/30 bg-slate-950/50 rounded-lg p-4 font-mono overflow-auto scrollbar-none">
        <h2 className="text-xs font-bold text-sky-400 uppercase tracking-widest border-b border-sky-900/30 pb-2 mb-3 flex items-center gap-2">
          <Gavel className="w-4 h-4 text-sky-400" />
          JUDICIAL & DIPLOMATIC FALLOUT TRACKER
        </h2>

        {/* Big Blowback Level Banner */}
        <div className={`border p-4 rounded-lg mb-4 flex flex-col items-center text-center ${getBlowbackColor(actualBlowback)}`}>
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 border border-slate-800 px-3 py-0.5 rounded bg-slate-950 mb-1.5">
            CURRENT FALLOUT SEVERITY
          </span>
          <div className="text-lg font-black tracking-[0.1em] uppercase mb-1">{actualBlowback}</div>
          <p className="text-[9.5px] max-w-md my-1 leading-relaxed text-slate-300">
            {getBlowbackDescription(actualBlowback)}
          </p>
        </div>

        {/* International Alliance Response Summary */}
        <h3 className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 mt-2">
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          INTERNATIONAL & BLOC RESPONSE ESTIMATES
        </h3>
        <div className="bg-slate-900/40 border border-slate-900 p-3 rounded mb-4 text-[9.5px] text-slate-300 font-mono leading-relaxed">
          {internationalText}
        </div>

        {/* Domestic Oversight Response Summary */}
        <h3 className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <EyeOff className="w-3.5 h-3.5 text-sky-400" />
          DOMESTIC LEGISLATIVE COMMITTEES STATUTS
        </h3>
        <div className="bg-slate-900/40 border border-slate-900 p-3 rounded text-[9.5px] text-slate-300 font-mono leading-relaxed">
          {domesticText}
        </div>
      </div>

      {/* Diplomatic Defense & Escalation Risk Index (Right) */}
      <div className="col-span-5 flex flex-col border border-sky-900/30 bg-slate-950/65 rounded-lg p-4 font-mono overflow-auto scrollbar-none justify-between">
        <div>
          <h2 className="text-xs font-bold text-sky-400 uppercase tracking-widest border-b border-sky-900/30 pb-2 mb-3">
            LEGAL DEFENSE SUMMARY
          </h2>

          <div className="space-y-4">
            {/* Legal Defense Framework Accordion / Box */}
            <div className="bg-slate-900/30 border border-slate-800 p-3 rounded">
              <span className="text-indigo-400 font-black text-[9px] uppercase tracking-wide block mb-1.5">
                Vandenberg Resolution Sanctions File
              </span>
              <p className="text-[9px] text-slate-400 leading-normal font-mono">
                Sanctions filings require CORROBORATED level intelligence or higher. Current evidentiary profile secures regulatory filings across G7 banking clearings.
              </p>
              <div className="flex items-center gap-1.5 text-[8.5px] text-emerald-400 font-bold mt-2">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                FILE COMPLIANCE VERIFIED
              </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-800 p-3 rounded">
              <span className="text-indigo-400 font-black text-[9px] uppercase tracking-wide block mb-1.5">
                Overt Maritime Interdiction (UNCLOS Art. 110)
              </span>
              <p className="text-[9px] text-slate-400 leading-normal font-mono">
                Vessels moving dual-use material require LEGAL_THRESHOLD_MET or higher verification to board and seize cargo legally. Acting premature triggers Severe maritime dispute filings.
              </p>
              <div className="flex items-center gap-1.5 text-[8.5px] text-orange-400 font-bold mt-2">
                <ShieldAlert className="w-3 h-3 text-orange-400" />
                BORDER LIABILITY WARNING SIGNALS ACTIVE
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-900 p-3 rounded flex items-center gap-2 text-[9px] text-slate-500 uppercase font-black tracking-widest text-center justify-center">
          <Award className="w-4 h-4 text-slate-700" />
          IRON VEIL TREATY STANDBY
        </div>
      </div>
    </div>
  );
}
