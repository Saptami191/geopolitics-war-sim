import React, { useState, useEffect } from 'react';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import GlowSlider from '../shared/GlowSlider';
import HexGauge from '../shared/HexGauge';
import { Ideology, CabinetMember, Cabinet } from '../../types';
import { audio } from '../../utils/audio';

const CABINET_NAMES = [
  'Hon. Christopher Vance', 'Dr. Aris Sterling', 'Elena Rostova', 'Linus Zhao', 
  'Rajesh Patel', 'Akira Takahashi', 'Arthur Pendelton', 'Fatima Al-Sayed', 
  'Marcus Aurel', 'Sarah Jenkins', 'Jin-Woo Park', 'Nadia Kowalski'
];

export default function GovernmentPanel() {
  const countryId = usePlayerStore((s) => s.countryId);
  const countries = useWorldStore((s) => s.countries);
  const updateCountry = useWorldStore((s) => s.updateCountry);

  const playerCountry = countries[countryId];
  if (!playerCountry) return <div className="text-red-500 font-mono">Error: Player Country not loaded.</div>;

  const pol = playerCountry.political;
  const econ = playerCountry.economic;
  const pop = playerCountry.populationSim;
  const cabinet = playerCountry.cabinet;

  // Sub-tab navigation
  const [govSubTab, setGovSubTab] = useState<'STRUGGLE' | 'LEGISLATURE'>('STRUGGLE');

  // Local state for budgeting sliders
  const [tax, setTax] = useState(econ.taxRate);
  const [corpTax, setCorpTax] = useState(econ.corporateTaxRate);
  const [military, setMilitary] = useState(econ.spendingAllocation.military);
  const [healthcare, setHealthcare] = useState(econ.spendingAllocation.healthcare);
  const [education, setEducation] = useState(econ.spendingAllocation.education);
  const [infra, setInfra] = useState(econ.spendingAllocation.infrastructure);
  const [intel, setIntel] = useState(econ.spendingAllocation.intelligence);
  const [prop, setProp] = useState(econ.spendingAllocation.propaganda);

  // Sync sliders to incoming state shifts on tick
  useEffect(() => {
    setTax(econ.taxRate);
    setCorpTax(econ.corporateTaxRate);
    setMilitary(econ.spendingAllocation.military);
    setHealthcare(econ.spendingAllocation.healthcare);
    setEducation(econ.spendingAllocation.education);
    setInfra(econ.spendingAllocation.infrastructure);
    setIntel(econ.spendingAllocation.intelligence);
    setProp(econ.spendingAllocation.propaganda);
  }, [econ]);

  // Compute total spending percentage
  const totalAlloc = Math.round((military + healthcare + education + infra + intel + prop) * 100);

  const handleApplyBudget = () => {
    if (totalAlloc !== 100) {
      alert(`Budget assignment rejected! Spending divisions must aggregate exactly to 100% (current: ${totalAlloc}%).`);
      return;
    }

    updateCountry(countryId, (draft) => {
      draft.economic.taxRate = tax;
      draft.economic.corporateTaxRate = corpTax;
      draft.economic.spendingAllocation = {
        military: military,
        healthcare: healthcare,
        education: education,
        infrastructure: infra,
        intelligence: intel,
        propaganda: prop,
        debtService: draft.economic.spendingAllocation.debtService,
      };
    });
    useWorldStore.getState().addGlobalEvent(`Fiscal Command: New budget plan approved in ${playerCountry.name}.`, 'INFO');
  };

  const handleShiftIdeology = (newIdeology: Ideology) => {
    updateCountry(countryId, (draft) => {
      draft.political.ideology = newIdeology;
      draft.political.stabilityIndex = Math.max(10, draft.political.stabilityIndex - 25);
      draft.political.popularUnrest = Math.min(100, draft.political.popularUnrest + 20);
    });
    useWorldStore.getState().addGlobalEvent(`Constitutional Core Focus shifted to ${newIdeology} in ${playerCountry.name}!`, 'CRITICAL');
  };

  const handleBribeOligarch = (olId: string, costB: number) => {
    if (econ.treasuryCashB < costB) {
      alert('Sovereign funds insufficient.');
      return;
    }

    updateCountry(countryId, (draft) => {
      draft.economic.treasuryCashB -= costB;
      const found = draft.economic.oligarchs.find((o) => o.id === olId);
      if (found) {
        found.loyalty = Math.min(100, found.loyalty + 25);
      }
    });
    useWorldStore.getState().addGlobalEvent(`Financial Desk: Dispatched Offshore retainer to co-opt oligarchs.`, 'INFO');
  };

  const handleExileOligarch = (olId: string) => {
    updateCountry(countryId, (draft) => {
      const idx = draft.economic.oligarchs.findIndex((o) => o.id === olId);
      if (idx !== -1) {
        draft.political.stabilityIndex = Math.max(10, draft.political.stabilityIndex - 12);
        draft.economic.treasuryCashB += Math.round(draft.economic.oligarchs[idx].wealthB * 0.4);
        draft.economic.oligarchs.splice(idx, 1);
      }
    });
    useWorldStore.getState().addGlobalEvent(`decree: State expels industry oligarch assets.`, 'WARNING');
  };

  const handleToggleMartialLaw = () => {
    updateCountry(countryId, (draft) => {
      if (draft.political.martialLawActive) {
        draft.political.martialLawActive = false;
        draft.political.martialLawTicksRemaining = 0;
      } else {
        draft.political.martialLawActive = true;
        draft.political.martialLawTicksRemaining = 25;
        draft.political.stabilityIndex = Math.min(100, draft.political.stabilityIndex + 15);
        draft.political.popularUnrest = Math.max(0, draft.political.popularUnrest - 20);
      }
    });
    useWorldStore.getState().addGlobalEvent(`Federal martial decree invoked in ${playerCountry.name}.`, 'WARNING');
  };

  const handleReappointMinister = (portfolio: keyof Cabinet) => {
    const cost = 5.0; // five billion dollars
    if (econ.treasuryCashB < cost) {
      alert('Insufficient cash in treasury to fund transition.');
      return;
    }

    const randomName = CABINET_NAMES[Math.floor(Math.random() * CABINET_NAMES.length)];
    const generated: CabinetMember = {
      name: randomName,
      competence: Math.round(60 + Math.random() * 40),
      loyalty: Math.round(65 + Math.random() * 35),
      corruption: Math.round(Math.random() * 20),
      ideology: pol.ideology
    };

    updateCountry(countryId, (draft) => {
      draft.economic.treasuryCashB -= cost;
      if (draft.cabinet) {
        draft.cabinet[portfolio] = generated;
      }
    });

    useWorldStore.getState().addGlobalEvent(`Cabinet reshuffle: New appointee ${generated.name} is now the target minister for ${portfolio}.`, 'INFO');
  };

  return (
    <div className="w-full text-xs flex flex-col gap-3 font-mono">
      {/* Sub tabs switches */}
      <div className="flex border-b border-[#1a3a1a] pb-2 mb-1 gap-2">
        <button
          onClick={() => { audio.sfxKeyClick(); setGovSubTab('STRUGGLE'); }}
          className={`px-3 py-1 text-[10px] uppercase font-bold border rounded transition-colors ${
            govSubTab === 'STRUGGLE' ? 'bg-[#1a4a1a] text-[#00ff44] border-[#00ff44]' : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          ⚔️ Struggle & Instability
        </button>
        <button
          onClick={() => { audio.sfxKeyClick(); setGovSubTab('LEGISLATURE'); }}
          className={`px-3 py-1 text-[10px] uppercase font-bold border rounded transition-colors ${
            govSubTab === 'LEGISLATURE' ? 'bg-[#1a4a1a] text-[#00ff44] border-[#00ff44]' : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          🏛️ Legislature & Policies
        </button>
      </div>

      {/* RENDER ACTIVE SUBTAB CONTENT */}
      {govSubTab === 'STRUGGLE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1: Popular Gauges */}
          <div className="space-y-4">
            <div className="combat-panel flex justify-around items-center h-[112px] py-2 px-4 border border-[#1a5c1a] bg-[#030603] rounded">
              <HexGauge label="Popular Unrest" value={pol.popularUnrest} color={pol.popularUnrest > 65 ? 'red' : 'amber'} />
              <HexGauge label="Sovereign Stability" value={pol.stabilityIndex} color={pol.stabilityIndex < 35 ? 'red' : 'green'} />
              <HexGauge label="Leader Approval" value={pol.leaderApprovalRating} color={pol.leaderApprovalRating < 40 ? 'amber' : 'green'} />
            </div>

            {/* Constitution Emergency */}
            <div id="constitutional-emergency-panel" className="combat-panel flex flex-col gap-2.5 border border-[#1a5c1a] bg-[#030603] p-4 rounded">
              <h3 className="font-bold border-b border-[#1a3a1a] pb-1 uppercase tracking-wider text-[#ffb300] text-[10px]/1">
                CONSTITUTIONAL EMERGENCY AUTHORITY
              </h3>

              <div id="martial-law-row" className="flex justify-between items-center pt-2">
                <div>
                  <div className="font-bold text-gray-300">Martial Decree Level:</div>
                  <div className="text-[10px] text-gray-500">
                    {pol.martialLawActive ? `ACTIVE EXPIRED CHRONO (${pol.martialLawTicksRemaining} ticks)` : 'STANDBY'}
                  </div>
                </div>
                <button
                  id="martial-law-toggle-btn"
                  onClick={handleToggleMartialLaw}
                  className={`w-[150px] py-1.5 border font-bold uppercase text-[10px] rounded cursor-pointer text-center ${
                    pol.martialLawActive
                      ? 'border-[#ff2244] text-[#ff2244] bg-[#220005] hover:bg-[#40000a]'
                      : 'border-[#ffb300] text-[#ffb300] bg-[#1d1400] hover:bg-[#352000]'
                  }`}
                >
                  {pol.martialLawActive ? 'DISABLE MARTIAL LAW' : 'ENACT MARTIAL LAW'}
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Oligarchs & Networks */}
          <div className="combat-panel flex flex-col gap-2 border border-[#1a5c1a] bg-[#030603] p-4 rounded">
            <h3 className="font-bold border-b border-[#1a3a1a] pb-1 uppercase tracking-wider text-[#00ff44] text-[10px]/1">
              INDUSTRIALS & OLIGARCH NETWORKS
            </h3>
            <div className="overflow-y-auto max-h-[180px] space-y-1 pr-1">
              {econ.oligarchs.map((o) => (
                <div key={o.id} className="border border-[#0d1f0d] bg-[#020402] p-2 flex justify-between items-center rounded text-[11px]">
                  <div>
                    <div className="font-bold text-[#00e5ff]">{o.name}</div>
                    <div className="text-[8px] text-gray-500 uppercase">
                      WEALTH: ${o.wealthB}B | sector: {o.sector}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="text-right text-[9px] mr-1 font-mono">
                      <span className="text-gray-500 uppercase">LOYAL:</span>{' '}
                      <span className={o.loyalty > 65 ? 'text-[#00ff44]' : o.loyalty < 35 ? 'text-[#ff2244]' : 'text-[#ffb300]'}>
                        {o.loyalty}%
                      </span>
                    </div>
                    <button
                      onClick={() => handleBribeOligarch(o.id, 5.0)}
                      className="px-2 py-0.5 border border-[#163a16] text-gray-400 hover:text-[#00ff44] hover:bg-[#071707] cursor-pointer text-[9px] rounded"
                    >
                      Bribe ($5B)
                    </button>
                    <button
                      onClick={() => handleExileOligarch(o.id)}
                      className="px-2 py-0.5 border border-red-950 text-red-500 hover:bg-[#ff2244]/15 cursor-pointer text-[9px] rounded"
                    >
                      Exile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {govSubTab === 'LEGISLATURE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1: Budget assignments & Ideology model */}
          <div className="space-y-4">
            <div className="combat-panel flex flex-col gap-3 border border-[#1a5c1a] bg-[#030603] p-4 rounded text-xs">
              <h3 className="font-bold border-b border-[#1a3a1a] pb-1 uppercase tracking-wider text-[#00ff44]">
                FISCAL DECREE BUDGET
              </h3>

              <div id="ideology-selector-row" className="flex justify-between items-center bg-[#071407]/40 p-2 border border-[#113211]/50 rounded">
                <span className="text-gray-400 font-bold">Ideology State model:</span>
                <select
                  id="ideology-state-select"
                  value={pol.ideology}
                  onChange={(e) => handleShiftIdeology(e.target.value as Ideology)}
                  className="bg-[#030503] border border-[#1a3a1a] text-[#00ff44] outline-none text-[11px] p-1 font-mono uppercase rounded w-[150px] text-center"
                >
                  <option value="DEMOCRACY">Democracy</option>
                  <option value="AUTOCRACY">Autocracy</option>
                  <option value="MILITARY_JUNTA">Military Junta</option>
                  <option value="THEOCRACY">Theocracy</option>
                  <option value="TECHNOCRACY">Technocracy</option>
                  <option value="OLIGARCHY">Oligarchy</option>
                </select>
              </div>

              <GlowSlider label="Income Tax Rate" value={tax} min={0} max={60} onChange={setTax} unit="%" color="green" />
              <GlowSlider label="Corporate Tax Rate" value={corpTax} min={0} max={40} onChange={setCorpTax} unit="%" color="green" />

              <div className="border-t border-[#1a3a1a] my-1 pt-1 opacity-80 uppercase text-[9px] font-bold text-gray-500">
                BUDGET DIVISIONS ({totalAlloc}% allocation):
              </div>

              <GlowSlider label="Military Allocation" value={Math.round(military * 100)} min={0} max={100} onChange={(v) => setMilitary(v / 100)} unit="%" color="amber" />
              <GlowSlider label="Healthcare Allocation" value={Math.round(healthcare * 100)} min={0} max={100} onChange={(v) => setHealthcare(v / 100)} unit="%" color="cyan" />
              <GlowSlider label="Education Allocation" value={Math.round(education * 100)} min={0} max={100} onChange={(v) => setEducation(v / 100)} unit="%" color="cyan" />
              <GlowSlider label="Infrastructure Allocation" value={Math.round(infra * 100)} min={0} max={100} onChange={(v) => setInfra(v / 100)} unit="%" color="green" />
              <GlowSlider label="Intelligence budget" value={Math.round(intel * 100)} min={0} max={100} onChange={(v) => setIntel(v / 100)} unit="%" color="amber" />
              <GlowSlider label="State Propaganda" value={Math.round(prop * 100)} min={0} max={100} onChange={(v) => setProp(v / 100)} unit="%" color="amber" />

              <div className="flex justify-between items-center mt-2 border-t border-[#162f16] pt-1">
                <span className={totalAlloc !== 100 ? 'text-[#ff2244] font-bold' : 'text-[#00ff44]'}>
                  ALLOCATED: {totalAlloc} / 100%
                </span>
                <button
                  onClick={handleApplyBudget}
                  className="px-4 py-1.5 bg-[#1a4a1a] border border-[#2aff4a] text-[#00ff44] rounded hover:bg-[#256525] font-bold uppercase cursor-pointer text-[10px]"
                >
                  APPLY BUDGET PLAN
                </button>
              </div>
            </div>

            {/* Demographics indicators info block */}
            <div className="combat-panel flex flex-col gap-2 border border-[#1a5c1a] bg-[#030603] p-4 rounded text-[11px] space-y-1">
              <h3 className="font-bold border-b border-[#1a3a1a] pb-1 uppercase tracking-wider text-[#00e5ff] text-[10px]">
                👥 LEGISLATIVE DEMOGRAPHIC COHESION
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-400">
                <div>HEADCOUNT: <span className="font-bold text-white">{playerCountry.population.toFixed(1)}M</span></div>
                <div>BIRTH RATE: <span className="font-bold text-white">{pop?.birthRate}/k</span></div>
                <div>DEATH RATE: <span className="font-bold text-red-500">{pop?.deathRate}/k</span></div>
                <div>NET MIGRATION: <span className={pop && pop.migration < 0 ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>{pop && pop.migration > 0 ? `+${pop.migration}` : pop?.migration}k</span></div>
                <div>URBANIZATION: <span className="font-bold text-white">{pop?.urbanization}%</span></div>
                <div>EDUCATION LEVEL: <span className="font-shadow font-bold text-white">{pop?.educationLevel}%</span></div>
              </div>
            </div>
          </div>

          {/* Column 2: State cabinet list */}
          <div className="combat-panel flex flex-col gap-3 border border-[#1a5c1a] bg-[#030603] p-4 rounded">
            <h3 className="font-bold border-b border-[#1a3a1a] pb-1.5 uppercase tracking-wider text-[#00ff44] text-[10px]/1">
              SOVEREIGN MINISTERIAL ASSEMBLY CABINET
            </h3>
            <p className="text-[9px] text-gray-500 leading-normal mb-1">
              Positions cause leakage based on competence. Spend $5B treasury order to reshuffle un-aligned administrators.
            </p>

            <div className="space-y-2 overflow-y-auto max-h-[340px] pr-1">
              {[
                { key: 'defenseMinister', tag: 'DEFENSE MINISTER', desc: 'Influences deployment speeds and troop maintenance.', icon: '🛡️' },
                { key: 'financeMinister', tag: 'FINANCE MINISTER', desc: 'Affects tax multipliers and corporate expansion ratios.', icon: '💼' },
                { key: 'foreignMinister', tag: 'FOREIGN MINISTER', desc: 'Drives opinion recovery and lowers tariff blockades.', icon: '🌍' },
                { key: 'intelligenceChief', tag: 'INTELLIGENCE CHIEF', desc: 'Improves cyber scan scores and lowers op leaks.', icon: '💾' },
                { key: 'centralBankGovernor', tag: 'CENTRAL BANK GOVERNOR', desc: 'Directs currency yields, margins, and printing presses.', icon: '🏛️' }
              ].map((min) => {
                const member = cabinet ? cabinet[min.key as keyof Cabinet] : null;
                if (!member) return null;

                return (
                  <div key={min.key} className="border border-[#1a3a1a] bg-[#020502] p-2.5 rounded flex flex-col justify-between gap-1.5">
                    <div>
                      <div className="flex justify-between items-center border-b border-[#0f240f] pb-1">
                        <span className="font-bold text-[#00ff44] tracking-wide text-shadow text-[9px]">
                          {min.icon} {min.tag}
                        </span>
                        <span className="text-[8px] uppercase bg-[#142814] px-1 py-0.5 border border-[#1a4a1a] text-[#00e5ff] font-bold">
                          {member.ideology}
                        </span>
                      </div>
                      <div className="mt-1 font-bold text-gray-300 text-[10px]">{member.name}</div>
                      <p className="text-[8.5px] text-gray-500 leading-normal">{min.desc}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[9px] bg-black/40 p-1 border border-[#0d1c0d] rounded text-center">
                      <div>
                        <div className="text-gray-500 text-[8px]">SKILL</div>
                        <span className={`font-bold ${member.competence > 75 ? 'text-[#00ff44]' : member.competence < 45 ? 'text-[#ff2244]' : 'text-amber-500'}`}>
                          {member.competence}%
                        </span>
                      </div>
                      <div>
                        <div className="text-gray-500 text-[8px]">LOYALTY</div>
                        <span className={`font-bold ${member.loyalty > 75 ? 'text-[#00ff44]' : member.loyalty < 45 ? 'text-[#ff2244]' : 'text-amber-500'}`}>
                          {member.loyalty}%
                        </span>
                      </div>
                      <div>
                        <div className="text-gray-500 text-[8px]">CORRUPT</div>
                        <span className={`font-bold ${member.corruption > 25 ? 'text-[#ff2244]' : 'text-gray-400'}`}>
                          {member.corruption}%
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleReappointMinister(min.key as keyof Cabinet)}
                      className="w-full text-center py-1 bg-[#102d10] hover:bg-[#1a4a1a] border border-[#1d4d1d] rounded text-[9px] font-bold uppercase transition-colors text-shadow cursor-pointer mt-1"
                    >
                      🔀 REAPPOINT CABINET OFFICER ($5B)
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
