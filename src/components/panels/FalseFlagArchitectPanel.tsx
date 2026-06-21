import React, { useState } from 'react';
import { useDeceptionStore } from '../../store/deceptionStore';
import { DeceptionSignatureFamily } from '../../types';

const SELECTABLE_FAMILIES: { value: DeceptionSignatureFamily; label: string; desc: string }[] = [
  { value: 'APT_STYLE', label: 'APT-STYLE TRACE', desc: 'Mimics highly sophisticated state-backed modern persistent threat actors. Focuses on zero-day headers.' },
  { value: 'STATE_ACTOR_STYLE', label: 'STANDARD STATE AGENCY', desc: 'Standard intelligence apparatus traces. Mimics institutional networks with high consistency.' },
  { value: 'CRIMINAL_STYLE', label: 'UNDERGROUND CRIME RINGS', desc: 'Low-soph sophistication traces. Mimics extortion syndicates, ransom locks, and noisy file dumps.' },
  { value: 'INSIDER_STYLE', label: 'INSIDER SUBVERSION', desc: 'Fakes credential leakage or subversion by a disgruntled staff member. Uses standard work log timestamps.' },
  { value: 'THIRD_PARTY_STYLE', label: 'OFFSHORE SPONSOR GROUPS', desc: 'Mimics non-governmental third-party proxies, local merchant cliques, or private contractors.' },
  { value: 'NATURAL_NOISE', label: 'ATMOSPHERIC & NATURAL NOISE', desc: 'Disguises signs as standard electrical static interference or hardware failures.' },
  { value: 'LANGUAGE_STYLE', label: 'FOREIGN DIALECT MARKERS', desc: 'Injects translated comment lines, system compiler flags, and localized string headers.' },
  { value: 'TIMING_STYLE', label: 'TIMING DELAY SIGNATURES', desc: 'Introduces offset transit loops reflecting foreign clocks and office work trends.' },
];

const SELECTABLE_TTPS = [
  { code: 'T1190', label: 'T1190 - Exploit Public-Facing Application' },
  { code: 'T1566.001', label: 'T1566.001 - Spearphishing Attachment' },
  { code: 'T1001.002', label: 'T1001.002 - Steganography Header Tracing' },
  { code: 'T1071.001', label: 'T1071.001 - Web Protocols Communication' },
  { code: 'T1027.002', label: 'T1027.002 - Software Packing Obfuscation' },
  { code: 'T1105', label: 'T1105 - Ingress Tool Transfer Core' },
  { code: 'T1078', label: 'T1078 - Valid Accounts Hijacking' },
];

const LANGUAGE_MARKERS = [
  'Cyrillic GCC compilers optimization flags',
  'Simplified Chinese dialect deadcode inline comments',
  'Arabic comment string offsets in binary loader',
  'German localized timestamps inside server headers',
  'Farsi dialect annotations in system debug fields',
];

const INFRASTRUCTURE_MARKERS = [
  'Eurasian proxy ranges (185.112.55.0/24)',
  'South-Asian transit routers (103.44.12.9)',
  'Swiss offshore encrypted VPN mail terminals',
  'Commercial Baltic cloud hosting node points',
  'Spoofed domestic telecom DNS resolvers',
];

const TIMING_MARKERS = [
  '2:00 AM UTC - 11:00 AM UTC office hours alignment',
  '12:00 PM - 8:00 PM East-Asian standard timezone delay',
  'Randomized burst logs at exact 2-hour offset blocks',
  'Staggered bi-weekly transport dispatch stamps',
];

export default function FalseFlagArchitectPanel() {
  const decStore = useDeceptionStore();
  const selectedCampaign = decStore.selectedCampaignId ? decStore.campaigns[decStore.selectedCampaignId] : null;

  const [selectedFamily, setSelectedFamily] = useState<DeceptionSignatureFamily>('APT_STYLE');
  const [selectedTtps, setSelectedTtps] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedInfras, setSelectedInfras] = useState<string[]>([]);
  const [selectedTimings, setSelectedTimings] = useState<string[]>([]);

  // Sync state whenever selected campaign changes
  React.useEffect(() => {
    if (selectedCampaign) {
      const sig = selectedCampaign.signature;
      setSelectedFamily(sig.family);
      setSelectedTtps(sig.mimickedTTPs || []);
      setSelectedLanguages(sig.narrativeMarkers || []);
      setSelectedInfras(sig.infrastructureMarkers || []);
      setSelectedTimings(sig.timingMarkers || []);
    }
  }, [decStore.selectedCampaignId, selectedCampaign?.signature.signatureId]);

  const toggleTtp = (code: string) => {
    setSelectedTtps(prev => 
      prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code]
    );
  };

  const toggleLanguage = (item: string) => {
    setSelectedLanguages(prev => 
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const toggleInfra = (item: string) => {
    setSelectedInfras(prev => 
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const toggleTiming = (item: string) => {
    setSelectedTimings(prev => 
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const handleApplySignature = () => {
    if (!selectedCampaign) return;

    decStore.buildFalseFlagArchitecture({
      campaignId: selectedCampaign.deceptionId,
      family: selectedFamily,
      ttpList: selectedTtps,
      languageMarkers: selectedLanguages,
      infrastructureMarkers: selectedInfras,
      timingMarkers: selectedTimings
    });
  };

  // Compute warning highlights
  const totalCluesCount = selectedTtps.length + selectedLanguages.length + selectedInfras.length + selectedTimings.length;
  const showBreadcrumbWarning = totalCluesCount > 6;
  const showWeakSignatureWarning = totalCluesCount < 3 && totalCluesCount > 0;

  return (
    <div className="flex flex-col h-full text-cyan-400 font-mono select-none">
      {selectedCampaign ? (
        <div className="grid grid-cols-12 gap-4 h-full min-h-0 flex-1">
          
          {/* Main composition board */}
          <div className="col-span-8 border border-cyan-900/40 bg-slate-950/90 rounded-lg p-3.5 flex flex-col justify-between h-full min-h-0">
            <div className="space-y-4 overflow-y-auto scrollbar-thin pr-1 flex-1">
              {/* Header Title */}
              <div>
                <h3 className="text-xs font-extrabold text-cyan-100 uppercase tracking-widest">
                  // FALSE FLAG ARCHITECT CONSOLE (OPERATION: {selectedCampaign.label})
                </h3>
                <p className="text-[10px] text-cyan-500/50 mt-0.5 uppercase">
                  Design dynamic forensic layouts mimicking specific state or asymmetric clusters.
                </p>
              </div>

              {/* Step 1: Mimicry Family Selector */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold tracking-wider text-cyan-400 block">// STEP 1: CHOOSE TARGET ACTOR CORE FAMILY</span>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {(SELECTABLE_FAMILIES || []).map(fam => {
                    const active = selectedFamily === fam.value;
                    return (
                      <button
                        key={fam.value}
                        type="button"
                        onClick={() => setSelectedFamily(fam.value)}
                        className={`text-left p-2 border rounded transition-all cursor-pointer flex flex-col gap-1
                          ${active 
                            ? 'bg-cyan-950/40 border-cyan-400 text-cyan-100 shadow-[0_0_10px_rgba(0,255,255,0.1)]' 
                            : 'border-cyan-950 bg-[#071018]/50 text-cyan-600 hover:border-cyan-800'}`}
                      >
                        <span className="font-extrabold tracking-wide uppercase">{fam.label}</span>
                        <span className="text-[8.5px] text-cyan-500/60 leading-relaxed font-light">{fam.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Mimic TTP Indicators */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold tracking-wider text-cyan-400 block">// STEP 2: MITRE TTP MIMICRY MODEL</span>
                <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                  {(SELECTABLE_TTPS || []).map(t => {
                    const selected = selectedTtps.includes(t.code);
                    return (
                      <button
                        key={t.code}
                        type="button"
                        onClick={() => toggleTtp(t.code)}
                        className={`text-left p-2 border rounded transition-all cursor-pointer flex items-center justify-between
                          ${selected 
                            ? 'bg-cyan-950/30 border-cyan-400 text-cyan-200' 
                            : 'border-cyan-950/40 bg-[#050c12]/40 text-cyan-600 hover:border-cyan-800'}`}
                      >
                        <span>{t.label}</span>
                        <span className={`w-2.5 h-2.5 border rounded-sm ${selected ? 'bg-cyan-500 border-cyan-400' : 'border-cyan-700'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Forensic Artifact Blends */}
              <div className="grid grid-cols-3 gap-3 text-[9.5px]">
                {/* Language Markers */}
                <div className="space-y-2">
                  <span className="font-extrabold tracking-wider text-cyan-400 uppercase block">// LANGUAGE MARKERS</span>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-thin">
                    {(LANGUAGE_MARKERS || []).map(m => {
                      const sel = selectedLanguages.includes(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => toggleLanguage(m)}
                          className={`w-full text-left p-1.5 border rounded text-[8.5px] transition-all cursor-pointer
                            ${sel ? 'bg-cyan-950/30 border-cyan-400 text-cyan-200' : 'border-cyan-950/20 bg-black/40 text-cyan-600'}`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Infrastructure Traces */}
                <div className="space-y-2">
                  <span className="font-extrabold tracking-wider text-cyan-400 uppercase block">// INFRASTRUCTURE SPOOFS</span>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-thin">
                    {(INFRASTRUCTURE_MARKERS || []).map(m => {
                      const sel = selectedInfras.includes(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => toggleInfra(m)}
                          className={`w-full text-left p-1.5 border rounded text-[8.5px] transition-all cursor-pointer
                            ${sel ? 'bg-cyan-950/30 border-cyan-400 text-cyan-200' : 'border-cyan-950/20 bg-black/40 text-cyan-600'}`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Timing Alignments */}
                <div className="space-y-2">
                  <span className="font-extrabold tracking-wider text-cyan-400 uppercase block">// TIMING MARKERS</span>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-thin">
                    {(TIMING_MARKERS || []).map(m => {
                      const sel = selectedTimings.includes(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => toggleTiming(m)}
                          className={`w-full text-left p-1.5 border rounded text-[8.5px] transition-all cursor-pointer
                            ${sel ? 'bg-cyan-950/30 border-cyan-400 text-cyan-200' : 'border-cyan-950/20 bg-black/40 text-cyan-600'}`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Commit Actions */}
            <div className="border-t border-cyan-900/30 pt-3.5 mt-3">
              <button
                type="button"
                onClick={handleApplySignature}
                className="w-full py-2 bg-cyan-950/40 hover:bg-cyan-400 hover:text-black border border-cyan-400 text-cyan-200 rounded font-extrabold text-[10px] cursor-pointer tracking-widest transition-all uppercase"
              >
                COMMIT FALSE FLAG ARCHITECTURAL SIGNATURE
              </button>
            </div>
          </div>

          {/* Indicators analysis and warnings */}
          <div className="col-span-4 border border-cyan-900/40 bg-slate-950/90 rounded-lg p-3.5 flex flex-col justify-between h-full min-h-0">
            <div className="space-y-4">
              <h3 className="text-[11px] font-extrabold text-cyan-100 uppercase tracking-widest border-b border-cyan-900/20 pb-2">
                // ACTIVE SIGNATURE METRICS
              </h3>

              {/* Score displays */}
              <div className="space-y-3 text-[10px]">
                <div className="bg-[#0b131e]/80 border border-cyan-950/50 p-2.5 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span>COHERENCE RATING:</span>
                    <span className="text-cyan-200 font-bold">{selectedCampaign.confidence.signatureCoherence}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black rounded overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${selectedCampaign.confidence.signatureCoherence}%` }} />
                  </div>
                  <span className="text-[8.5px] text-cyan-500/50 mt-1 block">Measures structural alignment with typical {selectedFamily.replace('_STYLE', '')} trace trends.</span>
                </div>

                <div className="bg-[#0b131e]/80 border border-cyan-950/50 p-2.5 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span>FORENSIC BELIEVABILITY:</span>
                    <span className="text-emerald-400 font-bold">{selectedCampaign.confidence.believabilityScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black rounded overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${selectedCampaign.confidence.believabilityScore}%` }} />
                  </div>
                  <span className="text-[8.5px] text-cyan-500/50 mt-1 block">Expected purchase probability by adversary central analytical squads.</span>
                </div>

                <div className="bg-[#0b131e]/80 border border-cyan-950/50 p-2.5 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span>CONTAMINATION PENALTY:</span>
                    <span className="text-amber-500 font-bold">{decStore.signaturePenalties[selectedFamily] * 15} POINTS</span>
                  </div>
                  <span className="text-[8.5px] text-cyan-500/50 block">Repeatedly using the same actor template decays future trace credibility. Active count: {decStore.signaturePenalties[selectedFamily]} times.</span>
                </div>
              </div>

              {/* Dynamic Warning Blocks */}
              <div className="space-y-2 text-[9px]">
                {showBreadcrumbWarning && (
                  <div className="border border-red-950 bg-red-950/20 text-red-400 rounded p-2.5 leading-relaxed">
                    <span className="font-extrabold uppercase block text-red-250 mb-0.5 font-sans">⚠️ BREADCRUMB RISK EXTREME</span>
                    Too many obvious trails attached ({totalCluesCount}/6). The trace looks highly structured and is highly likely to trigger counter-deception alarms. Consider trimming minor markers.
                  </div>
                )}

                {showWeakSignatureWarning && (
                  <div className="border border-amber-950 bg-amber-950/20 text-amber-500 rounded p-2.5 leading-relaxed">
                    <span className="font-extrabold uppercase block text-amber-450 mb-0.5 font-sans">⚠️ WEAK SIGNATURE PROFILE</span>
                    Not enough markers deployed. The false flag lacks diagnostic weight and may be filtered out as ambient noise or dismissed immediately.
                  </div>
                )}

                {!showBreadcrumbWarning && !showWeakSignatureWarning && totalCluesCount > 0 && (
                  <div className="border border-emerald-950 bg-emerald-950/10 text-emerald-400 rounded p-2.5 leading-relaxed">
                    <span className="font-extrabold uppercase block text-emerald-350 mb-0.5 font-sans">✓ NOMINAL POSTURE COMPLIANT</span>
                    Excellent indicator balance. High authenticity profiling achieved without leaving excessive forensic fingerprints.
                  </div>
                )}
              </div>
            </div>

            {/* Bottom active state indicator */}
            <div className="text-[9.5px] text-cyan-500/40 text-center leading-relaxed border-t border-cyan-900/20 pt-3">
              SIGNED: SOVEREIGN OPERATIONAL COMMAND<br />
              COGNITIVE DEFLECT SECURITY DIVISION
            </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-full text-cyan-800/60 uppercase text-[11px] font-bold">
          NO DECEPTION WORKSPACE LOADED. SELECT A CAMPAIGN TO ARCHITECT CORRESPONDING FALSE FLAGS.
        </div>
      )}
    </div>
  );
}
