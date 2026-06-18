import React, { useState } from 'react';
import { useConventionalOpsStore } from '../../store/conventionalOpsStore';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { PanelFxShell } from '../fx/PanelFxShell';
import { 
  Crosshair, 
  Compass, 
  CloudRain, 
  Activity, 
  MapPin, 
  Terminal, 
  TrendingUp, 
  Users, 
  Layers, 
  Zap, 
  Gauge, 
  ShieldAlert, 
  TrendingDown, 
  Shield, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Play, 
  RefreshCw, 
  AlertTriangle,
  Info,
  Server,
  Droplet,
  CompassIcon,
  HelpCircle,
  Truck
} from 'lucide-react';
import { 
  OrderOfBattleUnit, 
  CampaignPlan, 
  CourseOfAction, 
  CampaignStatus, 
  ConventionalUnitStatus,
  CombatEngagement,
  SupportingFiresConfig,
  LogisticsConfig,
  RiskTolerance,
  ObjectiveType,
  TerrainType,
  WeatherCondition,
  GroundCondition,
  UnitFamily,
  UnitDomain,
  FireIntensity,
  FireTargetPriority,
  ROELevel
} from '../../types';

export default function ConventionalOpsPanel() {
  const [activeTab, setActiveTab] = useState<'orbat' | 'campaign' | 'wargame' | 'logistics' | 'terrain'>('orbat');
  const [selectedOrbatCountry, setSelectedOrbatCountry] = useState<string>('US');
  const [selectedLogisticsCountry, setSelectedLogisticsCountry] = useState<string>('US');
  
  // Zustand States
  const { 
    units, 
    campaignPlans, 
    sustainment, 
    supplyRoutes, 
    logisticsNodes, 
    terrainProfiles, 
    weatherStates, 
    combatEngagements,
    addCampaignPlan, 
    startCampaign, 
    abortCampaign,
    reconstituteUnit,
    runWargameCOASimulation 
  } = useConventionalOpsStore();

  const currentTick = useWorldStore((s) => s.currentTick);
  const countries = useWorldStore((s) => s.countries);
  const playerCountryId = usePlayerStore((s) => s.countryId);

  // New Campaign Build Form State
  const [campaignName, setCampaignName] = useState('OPERATION INHERENT FREEDOM');
  const [targetRegion, setTargetRegion] = useState('TW');
  const [objectiveType, setObjectiveType] = useState<ObjectiveType>('SEIZE_TERRITORY');
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('MODERATE');
  
  // supporting fires state
  const [airSupport, setAirSupport] = useState(true);
  const [navalSupport, setNavalSupport] = useState(true);
  const [artillerySupport, setArtillerySupport] = useState(true);
  const [cyberSupport, setCyberSupport] = useState(false);
  const [fireIntensity, setFireIntensity] = useState<FireIntensity>('DELIBERATE');
  const [roeLevel, setRoeLevel] = useState<ROELevel>('NORMAL');

  // Interactive COA Sandbox State
  const [wargameTarget, setWargameTarget] = useState('TW');
  const [wargameUnits, setWargameUnits] = useState<string[]>([]);
  const [wargameRisk, setWargameRisk] = useState<RiskTolerance>('MODERATE');
  const [wargameResult, setWargameResult] = useState<CourseOfAction | null>(null);

  // Helper arrays
  const countriesKeys = Object.keys(countries);

  // Filter units
  const filteredUnits = units.filter(u => u.countryId === selectedOrbatCountry);

  const handleToggleUnitSelection = (unitId: string) => {
    if (selectedUnitIds.includes(unitId)) {
      setSelectedUnitIds(selectedUnitIds.filter(id => id !== unitId));
    } else {
      setSelectedUnitIds([...selectedUnitIds, unitId]);
    }
  };

  const handleToggleWargameUnitSelection = (unitId: string) => {
    if (wargameUnits.includes(unitId)) {
      setWargameUnits(wargameUnits.filter(id => id !== unitId));
    } else {
      setWargameUnits([...wargameUnits, unitId]);
    }
  };

  const handleLaunchCampaign = () => {
    if (selectedUnitIds.length === 0) {
      alert("Please assign at least 1 Order of Battle unit to launch this campaign plan.");
      return;
    }

    const newCampaignId = `CAMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newCampaign: CampaignPlan = {
      id: newCampaignId,
      name: campaignName.toUpperCase(),
      plannerCountryId: playerCountryId,
      status: 'APPROVED',
      objective: {
        id: `OBJ-${Date.now()}`,
        type: objectiveType,
        targetRegionId: targetRegion,
        targetEntityId: null,
        description: `Seize or establish operational authority in the ${targetRegion} theater.`,
        priority: 1,
        isAchieved: false,
        achievedTick: null
      },
      assignedUnitIds: selectedUnitIds,
      phases: [
        { phaseNumber: 1, name: 'Phase I: Air Infiltration & SEAD', description: 'neutralize early detection warning networks and establish airspace security.', duration: 3, primaryObjectiveId: `OBJ-${Date.now()}`, unitIdsActive: selectedUnitIds, firesConfig: { airSupportEnabled: airSupport, navalFiresEnabled: false, artilleryEnabled: false, cyberFiresEnabled: cyberSupport, spaceBasedISREnabled: true, airDefenseSuppressionEnabled: true, intensityLevel: fireIntensity, targetPriority: 'MILITARY_ONLY', rulesOfEngagement: roeLevel }, logisticsConfig: { primarySupplyRouteId: 'ROUTE-US-TW', alternateSupplyRouteIds: [], fuelAllocationPerTick: 30, ammoAllocationPerTick: 40, maintenanceAllocationPerTick: 10, portCapacityUsed: 3000, railCapacityUsed: 0, airCapacityUsed: 1000, supplyPriorityUnits: selectedUnitIds, contestedLogisticsRisk: 0.1, a2adThreatLevel: 0.2 }, entryConditions: [], exitConditions: [], isComplete: false },
        { phaseNumber: 2, name: 'Phase II: Joint Forced Entry', description: 'secure coastal beachheads and land hubs.', duration: 5, primaryObjectiveId: `OBJ-${Date.now()}`, unitIdsActive: selectedUnitIds, firesConfig: { airSupportEnabled: airSupport, navalFiresEnabled: navalSupport, artilleryEnabled: artillerySupport, cyberFiresEnabled: cyberSupport, spaceBasedISREnabled: true, airDefenseSuppressionEnabled: true, intensityLevel: 'INTENSE', targetPriority: 'MILITARY_ONLY', rulesOfEngagement: roeLevel }, logisticsConfig: { primarySupplyRouteId: 'ROUTE-US-TW', alternateSupplyRouteIds: [], fuelAllocationPerTick: 50, ammoAllocationPerTick: 60, maintenanceAllocationPerTick: 20, portCapacityUsed: 5000, railCapacityUsed: 0, airCapacityUsed: 2000, supplyPriorityUnits: selectedUnitIds, contestedLogisticsRisk: 0.25, a2adThreatLevel: 0.4 }, entryConditions: [], exitConditions: [], isComplete: false }
      ],
      currentPhaseIndex: 0,
      supportingFiresConfig: {
        airSupportEnabled: airSupport,
        navalFiresEnabled: navalSupport,
        artilleryEnabled: artillerySupport,
        cyberFiresEnabled: cyberSupport,
        spaceBasedISREnabled: true,
        airDefenseSuppressionEnabled: true,
        intensityLevel: fireIntensity,
        targetPriority: 'MILITARY_ONLY',
        rulesOfEngagement: roeLevel
      },
      logisticsConfig: {
        primarySupplyRouteId: 'ROUTE-US-TW',
        alternateSupplyRouteIds: [],
        fuelAllocationPerTick: 60,
        ammoAllocationPerTick: 80,
        maintenanceAllocationPerTick: 30,
        portCapacityUsed: 5000,
        railCapacityUsed: 0,
        airCapacityUsed: 2000,
        supplyPriorityUnits: selectedUnitIds,
        contestedLogisticsRisk: 0.15,
        a2adThreatLevel: 0.2
      },
      riskTolerance,
      sigintOverlaysApplied: [],
      deceptionPlansApplied: [],
      weatherAssessment: { forecastTicks: 8, currentRisk: 'LOW', movementImpact: 'Excellent visibility expected', firesImpact: 'Fires accurate with slight crosswind deviations', isrImpact: 'Satellite sweeps unimpeded' },
      terrainAssessment: { overallDifficulty: 'MODERATE', keyObstacles: ['Rivers', 'Fortified beach sectors'], approachRoutes: 2, defensiveAdvantage: 'DEFENDER' },
      successCriteria: { primaryObjectiveComplete: false, casualtyThresholdNotExceeded: true, timelineAdhered: true, escalationContained: true, logisticsIntact: true },
      casualtyEstimate: { ownForcesLight: 50, ownForcesModerate: 200, ownForcesHeavy: 500, enemyForces: 400, civilianEstimate: 10, equipmentLoss: 12 },
      createdTick: currentTick,
      launchedTick: null,
      completedTick: null,
      outcome: null
    };

    addCampaignPlan(newCampaign);
    startCampaign(newCampaignId);
    
    // reset build form
    setCampaignName('OPERATION INTEGRATED HARPOON');
    setSelectedUnitIds([]);
  };

  const handleWargameCOA = () => {
    if (wargameUnits.length === 0) {
      alert("Please select at least 1 unit to wargame COA feasibility.");
      return;
    }

    const planId = 'WARGAME-PLAN';
    const tempCOA: Omit<CourseOfAction, 'id'> = {
      campaignId: planId,
      name: `CONSECUTIVE STORM OVER ${wargameTarget}`,
      description: `Rapid amphibious and airborne tactical envelopment of key military depots inside the region.`,
      assignedUnits: wargameUnits,
      projectedDurationTicks: 8,
      successProbability: 0,
      casualtyEstimate: { ownForcesLight: 0, ownForcesModerate: 0, ownForcesHeavy: 0, enemyForces: 0, civilianEstimate: 0, equipmentLoss: 0 },
      logisticsFeasibility: 0,
      weatherRisk: wargameRisk === 'MINIMAL' ? 0.1 : (wargameRisk === 'MODERATE' ? 0.3 : 0.5),
      terrainRisk: wargameRisk === 'MINIMAL' ? 0.15 : (wargameRisk === 'MODERATE' ? 0.45 : 0.65),
      a2adRisk: wargameRisk === 'MINIMAL' ? 0.2 : (wargameRisk === 'MODERATE' ? 0.5 : 0.8),
      strategicRisk: wargameRisk === 'MINIMAL' ? 0.1 : (wargameRisk === 'MODERATE' ? 0.4 : 0.75),
      escalationRisk: wargameRisk === 'MINIMAL' ? 0.2 : (wargameRisk === 'MODERATE' ? 0.55 : 0.9),
      advantages: ['Maximum operational surprise', 'Deep fires cohesion', 'Strong air coverage'],
      disadvantages: ['Severe supply line strain', 'Risk of triggering adversary nuclear alert response'],
      isSelected: true
    };

    const simulatedCOA = runWargameCOASimulation(planId, tempCOA);
    setWargameResult(simulatedCOA);
  };

  return (
    <PanelFxShell 
      panelId="conventional_operations" 
      relevantFxTypes={['CYBER_WAR_DECLARATION' as any]}
    >
      <div className="flex flex-col h-full text-gray-100 bg-[#0c0f12] border border-gray-800 rounded shadow-2xl overflow-hidden font-mono text-sm">
        
        {/* TOP CLASSIFICATION BANNER */}
        <div className="flex justify-between items-center px-4 py-1.5 bg-[#1a0a0a] border-b border-red-950 text-red-500 text-xs font-bold tracking-widest uppercase">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>LEVEL 1 JOINT CHIEFS COMMAND CONTROLS</span>
          </div>
          <span>SECRET // NOFORN // CONVENTIONAL WWMCCS</span>
        </div>

        {/* METADATA BAR */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#101419] border-b border-gray-800 text-xs text-gray-400">
          <div className="flex space-x-6">
            <span>COMMANDER: <strong className="text-gray-100">{playerCountryId} GENERAL STAFF</strong></span>
            <span>SYSTEM CHANNELS: <strong className="text-emerald-500">OPERATIONAL</strong></span>
            <span>SIM TACTICAL METRIC: <strong className="text-gray-200">TICK {currentTick}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="text-emerald-500 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30 text-[10px] font-bold">KINETIC GRIDS LIVE</span>
          </div>
        </div>

        {/* COMPONENT NAVIGATION TABS */}
        <div className="flex border-b border-gray-800 bg-[#0a0d10]">
          <button 
            onClick={() => setActiveTab('orbat')}
            className={`flex-1 py-2.5 px-3 border-r border-gray-800 font-bold transition-all text-xs tracking-wider uppercase text-center flex justify-center items-center space-x-1.5 ${activeTab === 'orbat' ? 'bg-[#151a21] text-sky-400 border-b-2 border-b-sky-500' : 'text-gray-400 hover:bg-[#11161d] hover:text-gray-200'}`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Force Generation</span>
          </button>
          <button 
            onClick={() => setActiveTab('campaign')}
            className={`flex-1 py-2.5 px-3 border-r border-gray-800 font-bold transition-all text-xs tracking-wider uppercase text-center flex justify-center items-center space-x-1.5 ${activeTab === 'campaign' ? 'bg-[#151a21] text-sky-400 border-b-2 border-b-sky-500' : 'text-gray-400 hover:bg-[#11161d] hover:text-gray-200'}`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Campaign Planner</span>
          </button>
          <button 
            onClick={() => setActiveTab('wargame')}
            className={`flex-1 py-2.5 px-3 border-r border-gray-800 font-bold transition-all text-xs tracking-wider uppercase text-center flex justify-center items-center space-x-1.5 ${activeTab === 'wargame' ? 'bg-[#151a21] text-sky-400 border-b-2 border-b-sky-500' : 'text-gray-400 hover:bg-[#11161d] hover:text-gray-200'}`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>COA Wargaming</span>
          </button>
          <button 
            onClick={() => setActiveTab('logistics')}
            className={`flex-1 py-2.5 px-3 border-r border-gray-800 font-bold transition-all text-xs tracking-wider uppercase text-center flex justify-center items-center space-x-1.5 ${activeTab === 'logistics' ? 'bg-[#151a21] text-sky-400 border-b-2 border-b-sky-500' : 'text-gray-400 hover:bg-[#11161d] hover:text-gray-200'}`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Sustainment</span>
          </button>
          <button 
            onClick={() => setActiveTab('terrain')}
            className={`flex-1 py-2.5 px-3 font-bold transition-all text-xs tracking-wider uppercase text-center flex justify-center items-center space-x-1.5 ${activeTab === 'terrain' ? 'bg-[#151a21] text-sky-400 border-b-2 border-b-sky-500' : 'text-gray-400 hover:bg-[#11161d] hover:text-gray-200'}`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Terrain & Weather</span>
          </button>
        </div>

        {/* CONTAINER CONTENT LAYER */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: FORCE GENERATION */}
          {activeTab === 'orbat' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <div>
                  <h3 className="font-bold text-sky-400 uppercase text-sm">National Order of Battle (ORBATS)</h3>
                  <p className="text-xs text-gray-400">Inspect tactical rosters, attribute groupings, and signal footprints.</p>
                </div>
                
                {/* STATE ROSTER POINTER */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">SELECT STATE:</span>
                  <select 
                    value={selectedOrbatCountry}
                    onChange={(e) => setSelectedOrbatCountry(e.target.value)}
                    className="p-1.5 bg-[#151a21] border border-gray-700 text-gray-100 rounded text-xs uppercase"
                  >
                    {countriesKeys.map((cid) => (
                      <option key={cid} value={cid}>{countries[cid]?.name || cid}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* STATS MATRIX SUMMARY */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-[#12161b] border border-gray-800 p-3 rounded flex flex-col justify-between">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Total Battle Ready units</span>
                  <span className="text-xl font-bold text-sky-400 mt-1">{filteredUnits.filter(u => u.currentStatus === 'READY' || u.currentStatus === 'DEPLOYED').length}</span>
                </div>
                <div className="bg-[#12161b] border border-gray-800 p-3 rounded flex flex-col justify-between">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Average Readiness level</span>
                  <span className="text-xl font-bold text-emerald-500 mt-1">
                    {Math.round(filteredUnits.reduce((acc, u) => acc + u.attributes.readiness, 0) / Math.max(1, filteredUnits.length))}%
                  </span>
                </div>
                <div className="bg-[#12161b] border border-gray-800 p-3 rounded flex flex-col justify-between">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Average Attrition State</span>
                  <span className="text-xl font-bold text-amber-500 mt-1">
                    {Math.round(filteredUnits.reduce((acc, u) => acc + u.attritionLevel, 0) * 100 / Math.max(1, filteredUnits.length))}%
                  </span>
                </div>
                <div className="bg-[#12161b] border border-gray-800 p-3 rounded flex flex-col justify-between">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">SIGINT exposure threat</span>
                  <span className="text-xl font-bold text-indigo-400 mt-1">
                     {Math.round(filteredUnits.reduce((acc, u) => acc + u.sigintExposure, 0) * 100 / Math.max(1, filteredUnits.length))}%
                  </span>
                </div>
              </div>

              {/* COMPREHENSIVE COMBAT ROSTER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUnits.map((unit) => {
                  const hasExposure = unit.sigintExposure > 0.4;
                  return (
                    <div 
                      key={unit.id}
                      className="bg-[#12161b] border border-gray-800 hover:border-gray-700 rounded p-4 flex flex-col justify-between space-y-3 relative"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] bg-sky-950 text-sky-300 font-bold px-1.5 py-0.5 rounded uppercase border border-sky-900/60">
                              {unit.domain}
                            </span>
                            <span className="text-[10px] bg-gray-850 text-gray-300 font-bold px-1.5 py-0.5 rounded uppercase border border-gray-700/55">
                              {unit.family.replace('_', ' ')}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-100 text-sm mt-1.5">{unit.designation}</h4>
                          <div className="flex items-center space-x-1 mt-1 text-[11px] text-gray-400">
                            <MapPin className="w-3 h-3 text-gray-500" />
                            <span>STATIONED REGION: <strong className="text-gray-200">{countries[unit.currentRegion]?.name || unit.currentRegion}</strong></span>
                          </div>
                        </div>

                        {/* STATUS BADGE */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          unit.currentStatus === 'READY' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900/60' :
                          unit.currentStatus === 'DEPLOYED' ? 'bg-sky-950/60 text-sky-400 border-sky-900/60 animate-pulse' :
                          unit.currentStatus === 'ENGAGED' ? 'bg-red-950/60 text-red-400 border-red-900/60 animate-pulse' :
                          'bg-amber-950/60 text-amber-400 border-amber-900/60'
                        }`}>
                          {unit.currentStatus}
                        </span>
                      </div>

                      {/* SKILLS AND ATTRIBUTES */}
                      <div className="grid grid-cols-3 gap-2 bg-[#090b0e] p-2 rounded text-xs">
                        <div>
                          <span className="text-[9px] text-gray-500 uppercase block">FIREPOWER</span>
                          <span className="font-bold text-red-400">{unit.attributes.firepower}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 uppercase block">MANEUVER</span>
                          <span className="font-bold text-gray-300">{unit.attributes.maneuver}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 uppercase block">READINESS</span>
                          <span className="font-bold text-emerald-400">{unit.attributes.readiness}%</span>
                        </div>
                      </div>

                      {/* INTEGRATED SPECIAL CAPABILITIES MAPPING */}
                      <div className="flex flex-wrap gap-1 text-[9px]">
                        {unit.attributes.specialCapabilities.map((sc) => (
                          <span key={sc} className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded border border-gray-700">
                            {sc}
                          </span>
                        ))}
                      </div>

                      {/* PROGRESS BAR RATIOS */}
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between font-mono text-[10px] text-gray-400">
                          <span>Combat Attrition Integrity</span>
                          <span className={unit.attritionLevel > 0.4 ? 'text-red-400' : 'text-gray-300'}>{Math.round((1 - unit.attritionLevel) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${unit.attritionLevel > 0.4 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${(1 - unit.attritionLevel) * 100}%` }} 
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-900">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Info className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-[10px] text-gray-400">SIGINT: 
                              <strong className={hasExposure ? 'text-amber-400 ml-1' : 'text-emerald-400 ml-1'}>
                                {Math.round(unit.sigintExposure * 100)}%
                              </strong>
                            </span>
                          </div>
                          {unit.deceptionCover && (
                            <span className="text-[9px] bg-purple-950/60 text-purple-400 border border-purple-900/60 px-1 py-0.2 rounded font-bold animate-pulse">
                              SHROUD ACTIVE
                            </span>
                          )}
                        </div>

                        {/* RECONSTITUTE ACTION BUTTON */}
                        {unit.countryId === playerCountryId && (
                          <button
                            onClick={() => reconstituteUnit(unit.id)}
                            disabled={unit.currentStatus === 'DESTROYED' || unit.attritionLevel === 0}
                            className="px-2.5 py-1 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-400 rounded text-[10px] font-bold flex items-center space-x-1 font-mono transition-all disabled:opacity-40"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>REFIT</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CAMPAIGN PLANNER */}
          {activeTab === 'campaign' && (
            <div className="space-y-4">
              
              {/* LAUNCHED / ACTIVE CAMPAIGNS ROSTER */}
              <div>
                <h4 className="font-bold text-sky-400 uppercase text-xs mb-2 flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>C3 CENTRAL CONTROL: ACTIVE OR APPROVED CAMPAIGNS</span>
                </h4>
                {campaignPlans.length === 0 ? (
                  <div className="bg-[#12161b] border border-gray-800 rounded p-6 text-center">
                    <p className="text-gray-400 text-xs font-mono">NO ACTIVE OR PLANNED CONVENTIONAL GEOPOLITICAL CAMPAIGNS REGISTERED.</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-mono">Select Force assets and objectives below to launch a joint warfare initiative.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaignPlans.map((plan) => (
                      <div key={plan.id} className="bg-[#12161b] border border-gray-800 rounded p-4 relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-gray-100 flex items-center space-x-2">
                              <span>{plan.name}</span>
                              <span className="text-[10px] text-gray-500 font-mono">({plan.id})</span>
                            </h5>
                            <p className="text-xs text-gray-400 mt-1">Planner State: <strong className="text-sky-300 font-bold uppercase">{countries[plan.plannerCountryId]?.name || plan.plannerCountryId}</strong> | Combat Objective: <strong className="text-gray-200">{plan.objective.type.replace('_', ' ')}</strong></p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                              plan.status === 'EXECUTING' ? 'bg-sky-950 text-sky-400 border-sky-800 animate-pulse' :
                              plan.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                              'bg-amber-950 text-amber-500 border-amber-800'
                            }`}>
                              {plan.status}
                            </span>
                            
                            {plan.status === 'EXECUTING' && (
                              <button
                                onClick={() => abortCampaign(plan.id)}
                                className="px-2 py-0.5 bg-red-950 border border-red-800 hover:bg-red-900 hover:border-red-700 text-red-400 rounded text-[10px] font-bold font-mono transition-all"
                              >
                                ABORT
                              </button>
                            )}
                          </div>
                        </div>

                        {/* ENGAGEMENT DETAILS */}
                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs bg-[#090b0e] p-2.5 rounded border border-gray-900 font-mono">
                          <div>
                            <span className="text-[10px] text-gray-500 block uppercase">Target Region</span>
                            <span className="font-bold text-sky-400 uppercase">{countries[plan.objective.targetRegionId]?.name || plan.objective.targetRegionId}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 block uppercase">Current Active Phase</span>
                            <span className="font-bold text-gray-100">Phase {plan.currentPhaseIndex + 1}/{plan.phases.length}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 block uppercase">Assigned Combat Units</span>
                            <span className="font-bold text-gray-300">{plan.assignedUnitIds.length} assets deployed</span>
                          </div>
                        </div>

                        {/* LIVE PROGRESS STATS BAR */}
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-gray-400">
                            <span>Primary phase timeline objective completion status</span>
                            <span>{plan.phases[plan.currentPhaseIndex]?.isComplete ? '100' : '45'}%</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="h-full bg-sky-500 rounded-full transition-all duration-300" 
                              style={{ width: plan.phases[plan.currentPhaseIndex]?.isComplete ? '100%' : '45%' }} 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CONSTRUCT JOINT CAMPAIGN INTERFACE */}
              <div className="bg-[#12161b] border border-gray-800 rounded p-4 space-y-4">
                <div className="border-b border-gray-850 pb-2">
                  <h4 className="font-bold text-sky-400 uppercase text-xs flex items-center space-x-1.5">
                    <Crosshair className="w-4 h-4 text-sky-400" />
                    <span>DRAFT NEW OPERATIONS PLAN (OPLAN)</span>
                  </h4>
                  <p className="text-[11px] text-gray-400">Configure parameters, assign units, and launch target-focused conventional campaigns.</p>
                </div>

                {/* FIELDS FOR THE CAMPAIGN CONFIG */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase font-bold">Campaign Name</label>
                      <input 
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        className="p-2 bg-[#19202a] border border-gray-700 text-gray-100 rounded text-xs font-mono focus:border-sky-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Target Region</label>
                        <select 
                          value={targetRegion}
                          onChange={(e) => setTargetRegion(e.target.value)}
                          className="p-2 bg-[#19202a] border border-gray-700 text-gray-100 rounded text-xs uppercase"
                        >
                          <option value="TW">Taiwan (TW)</option>
                          <option value="CN">China (CN)</option>
                          <option value="RU">Russia (RU)</option>
                          <option value="IR">Iran (IR)</option>
                          <option value="IL">Israel (IL)</option>
                        </select>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Objective Type</label>
                        <select 
                          value={objectiveType}
                          onChange={(e) => setObjectiveType(e.target.value as ObjectiveType)}
                          className="p-2 bg-[#19202a] border border-gray-700 text-gray-100 rounded text-xs"
                        >
                          <option value="SEIZE_TERRITORY">Seize Territory</option>
                          <option value="ESTABLISH_NO_FLY_ZONE">No Fly Zone</option>
                          <option value="NAVAL_BLOCKADE">Naval Blockade</option>
                          <option value="DEFEAT_FORCE">Defeat Force</option>
                        </select>
                      </div>
                    </div>

                    {/* FIRES SUPPORT CONFIGURATION */}
                    <div className="bg-[#0c0f12] border border-gray-850 p-3 rounded space-y-3">
                      <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block border-b border-gray-900 pb-1">SUPPORTING FIRES CAPABILITIES</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex items-center space-x-2 cursor-pointer text-gray-300">
                          <input type="checkbox" checked={airSupport} onChange={(e) => setAirSupport(e.target.checked)} className="rounded text-sky-500 bg-[#12161b]" />
                          <span>Close Air Support</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer text-gray-300">
                          <input type="checkbox" checked={navalSupport} onChange={(e) => setNavalSupport(e.target.checked)} className="rounded text-sky-500 bg-[#12161b]" />
                          <span>Naval Fire Barrage</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer text-gray-300">
                          <input type="checkbox" checked={artillerySupport} onChange={(e) => setArtillerySupport(e.target.checked)} className="rounded text-sky-500 bg-[#12161b]" />
                          <span>Field Artillery support</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer text-gray-300">
                          <input type="checkbox" checked={cyberSupport} onChange={(e) => setCyberSupport(e.target.checked)} className="rounded text-sky-500 bg-[#12161b]" />
                          <span>CEMA support</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-900">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-gray-550 uppercase font-bold">Fires intensity</label>
                          <select 
                            value={fireIntensity}
                            onChange={(e) => setFireIntensity(e.target.value as FireIntensity)}
                            className="p-1 bg-[#19202a] border border-gray-700 text-gray-100 rounded text-[11px] font-mono"
                          >
                            <option value="MINIMAL">Minimal</option>
                            <option value="DELIBERATE">Deliberate</option>
                            <option value="INTENSE">Intense</option>
                            <option value="MAXIMUM">Maximum</option>
                          </select>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] text-gray-550 uppercase font-bold">Rules of engagement</label>
                          <select 
                            value={roeLevel}
                            onChange={(e) => setRoeLevel(e.target.value as ROELevel)}
                            className="p-1 bg-[#19202a] border border-gray-700 text-gray-100 rounded text-[11px]"
                          >
                            <option value="PEACETIME">Peacetime Restrictions</option>
                            <option value="RESTRICTIVE">Restrictive</option>
                            <option value="NORMAL">Standard Military</option>
                            <option value="UNRESTRICTED">Unrestricted</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SELECT FORCE UNITS TO COMMIT */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">ASSIGN FORCE SHIELD ASSETS ({selectedUnitIds.length} SELECTED)</label>
                      <div className="bg-[#0c0f12] border border-gray-800 rounded p-2 overflow-y-auto max-h-[175px] space-y-1 text-xs">
                        {units.filter(u => u.countryId === playerCountryId && u.currentStatus !== 'DESTROYED').map((unit) => {
                          const isAssigned = selectedUnitIds.includes(unit.id);
                          return (
                            <div 
                              key={unit.id}
                              onClick={() => handleToggleUnitSelection(unit.id)}
                              className={`p-2 rounded border transition-all cursor-pointer flex justify-between items-center ${isAssigned ? 'bg-sky-950/40 border-sky-600 text-sky-400' : 'bg-[#151a21]/50 border-gray-800 text-gray-300 hover:border-gray-700'}`}
                            >
                              <div>
                                <span className="font-bold block text-[11px]">{unit.designation}</span>
                                <span className="text-[9px] text-gray-500 block uppercase">Zone: {unit.currentRegion} | Readiness: {unit.attributes.readiness}%</span>
                              </div>
                              <input 
                                type="checkbox"
                                checked={isAssigned}
                                readOnly
                                className="rounded text-sky-500 bg-gray-900"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 pt-2 border-t border-gray-850">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-450">Strategic Risk level:</span>
                        <select 
                          value={riskTolerance}
                          onChange={(e) => setRiskTolerance(e.target.value as RiskTolerance)}
                          className="p-1 bg-[#151a21] border border-gray-700 text-gray-100 rounded text-[11px]"
                        >
                          <option value="MINIMAL">Minimal</option>
                          <option value="MODERATE">Moderate</option>
                          <option value="AGGRESSIVE">Aggressive</option>
                          <option value="RECKLESS">Reckless</option>
                        </select>
                      </div>

                      <button
                        onClick={handleLaunchCampaign}
                        className="w-full py-2.5 bg-sky-650 hover:bg-sky-600 border border-sky-500 text-gray-100 font-bold rounded flex justify-center items-center space-x-2 text-xs uppercase tracking-wider transition-all"
                      >
                        <Play className="w-4 h-4 text-emerald-400" />
                        <span>AUTHORIZE DISPATCH & COMMENCE CAMPAIGN</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* MILITARY ENGAGEMENTS LOGS */}
              <div>
                <h4 className="font-bold text-sky-400 uppercase text-xs mb-2 flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>LIVE TACTICAL COMBAT JOURNAL (ENGAGEMENTS LOG)</span>
                </h4>
                {combatEngagements.length === 0 ? (
                  <div className="bg-[#12161b] border border-gray-800 rounded p-4 text-center text-gray-500 text-xs font-mono">
                    NO COMBAT ENGAGEMENTS RECORDED YET. STANDING BY FOR FORCE DISPATCH.
                  </div>
                ) : (
                  <div className="bg-[#0a0d10] border border-gray-850 rounded p-2 max-h-[160px] overflow-y-auto space-y-1">
                    {combatEngagements.map((eng, idx) => (
                      <div key={eng.id || idx} className="text-xs p-2 bg-[#12161b]/80 border-b border-gray-850 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500 font-bold">Tick {eng.tick}</span>
                          <span className="text-gray-400 font-bold uppercase">{eng.regionId} GRID:</span>
                          <span className="text-gray-200">
                            Casualties recording Attrition 
                            <strong className="text-red-400 ml-1 font-bold">Atk: +{Math.round(eng.attackerAttrition*100)}%</strong> | 
                            <strong className="text-amber-500 ml-1 font-bold">Def: +{Math.round(eng.defenderAttrition*100)}%</strong>
                          </span>
                        </div>
                        <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] uppercase border ${
                          eng.outcome === 'ATTACKER_ADVANCE' ? 'bg-sky-950 text-sky-400 border-sky-900/60' :
                          'bg-amber-950 text-amber-400 border-amber-900/60'
                        }`}>
                          {eng.outcome.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: COA WARGAMING SANDBOX */}
          {activeTab === 'wargame' && (
            <div className="space-y-4">
              <div className="border-b border-gray-800 pb-2">
                <h3 className="font-bold text-sky-400 uppercase text-sm">Interactive Course of Action (COA) Wargamer</h3>
                <p className="text-xs text-gray-400">Run trial simulation checks and pre-calculate campaign failure scenarios.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* CONFIGURATOR PANEL */}
                <div className="md:col-span-5 bg-[#12161b] border border-gray-800 rounded p-4 space-y-4">
                  <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block border-b border-gray-850 pb-1">WARGAME CONFIGURATIONS</span>
                  
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-bold">Expected Target Area</label>
                    <select 
                      value={wargameTarget}
                      onChange={(e) => setWargameTarget(e.target.value)}
                      className="p-2 bg-[#19202a] border border-gray-700 text-gray-100 rounded text-xs uppercase"
                    >
                      <option value="TW">Taiwan Coastal sector (TW)</option>
                      <option value="CN">Fujian Province (CN)</option>
                      <option value="RU">Eastern European corridor (RU)</option>
                      <option value="IR">Strait of Hormuz (IR)</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-bold">Assigned assets</label>
                    <div className="bg-[#0c0f12] border border-gray-800 rounded p-2 overflow-y-auto max-h-[140px] space-y-1 text-xs">
                      {units.filter(u => u.countryId === playerCountryId && u.currentStatus !== 'DESTROYED').map((unit) => {
                        const isChosen = wargameUnits.includes(unit.id);
                        return (
                          <div 
                            key={unit.id}
                            onClick={() => handleToggleWargameUnitSelection(unit.id)}
                            className={`p-1.5 rounded transition-all cursor-pointer flex justify-between items-center ${isChosen ? 'bg-sky-950/40 border-sky-700 text-sky-400' : 'bg-[#151a21]/40 border-gray-850 text-gray-300'}`}
                          >
                            <span className="font-bold block text-[10px]">{unit.designation}</span>
                            <input type="checkbox" checked={isChosen} readOnly className="rounded text-sky-500 bg-gray-900" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-bold">Operational combat risk tolerance</label>
                    <select 
                      value={wargameRisk}
                      onChange={(e) => setWargameRisk(e.target.value as RiskTolerance)}
                      className="p-2 bg-[#19202a] border border-gray-700 text-gray-100 rounded text-xs"
                    >
                      <option value="MINIMAL">Minimal</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="AGGRESSIVE">Aggressive</option>
                      <option value="RECKLESS">Reckless</option>
                    </select>
                  </div>

                  <button
                    onClick={handleWargameCOA}
                    className="w-full py-2.5 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-400 font-bold rounded text-xs uppercase transition-all"
                  >
                    RUN MONTE CARLO COA WARGAME
                  </button>
                </div>

                {/* RESULTS GRAPHICS PANEL */}
                <div className="md:col-span-7 bg-[#12161b] border border-gray-800 rounded p-4 flex flex-col justify-between">
                  {!wargameResult ? (
                    <div className="flex-1 flex flex-col justify-center items-center text-center py-12 text-gray-500">
                      <Gauge className="w-12 h-12 text-gray-600 mb-2 animate-pulse" />
                      <p className="text-xs font-mono">STANDBY: ASSIGN FORCE ASSETS TO COMPUTE WARGAME OUTCOMES.</p>
                      <p className="text-[10px] text-gray-600 mt-1">Simulates 10,000 scenario path calculations dynamically.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start border-b border-gray-850 pb-1.5">
                        <div>
                          <span className="text-[9px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-1.5 py-0.5 rounded font-bold">SIMULATION COMPLETED</span>
                          <h4 className="font-bold text-gray-100 text-sm mt-1">{wargameResult.name}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 uppercase block">Success probability</span>
                          <span className="text-xl font-bold text-emerald-400">{Math.round(wargameResult.successProbability * 100)}%</span>
                        </div>
                      </div>

                      {/* STATS MATRIX RESULTS DISPLAY */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-[#0c0f12] p-2.5 rounded border border-gray-900">
                          <span className="text-[9px] text-gray-500 block uppercase">Logistics sufficiency</span>
                          <span className="text-sm font-bold text-sky-400">{Math.round(wargameResult.logisticsFeasibility * 100)}%</span>
                        </div>
                        <div className="bg-[#0c0f12] p-2.5 rounded border border-gray-900">
                          <span className="text-[9px] text-gray-500 block uppercase">Weather Risk Factor</span>
                          <span className="text-sm font-bold text-amber-500">{Math.round(wargameResult.weatherRisk * 100)}%</span>
                        </div>
                        <div className="bg-[#0c0f12] p-2.5 rounded border border-gray-900">
                          <span className="text-[9px] text-gray-500 block uppercase">Nuclear Trigger risk</span>
                          <span className="text-sm font-bold text-red-500">{Math.round(wargameResult.escalationRisk * 100)}%</span>
                        </div>
                      </div>

                      {/* CASUALTY ESTIMATORS */}
                      <div className="bg-[#101419] border border-red-950/40 p-3 rounded space-y-2">
                        <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">PROJECTED CAMPAIGN CASUALTY RATIOS</span>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-gray-500 block">OWN KIAs (LIGHT)</span>
                            <span className="font-bold text-gray-200">~{wargameResult.casualtyEstimate.ownForcesLight} troops</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 block">OWN KIAs (EXTREME)</span>
                            <span className="font-bold text-red-400">~{wargameResult.casualtyEstimate.ownForcesHeavy} troops</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 block">EQUIPMENT LOSS</span>
                            <span className="font-bold text-gray-300">{wargameResult.casualtyEstimate.equipmentLoss} vehicles</span>
                          </div>
                        </div>
                      </div>

                      {/* ADVANTAGES VS DISADVANTAGES */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block border-b border-gray-850 pb-0.5">ADVANTAGES</span>
                          <ul className="list-disc pl-4 space-y-0.5 text-gray-300">
                            {wargameResult.advantages.map((adv, idx) => <li key={idx}>{adv}</li>)}
                          </ul>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block border-b border-gray-850 pb-0.5">VULNERABILITIES</span>
                          <ul className="list-disc pl-4 space-y-0.5 text-gray-300">
                            {wargameResult.disadvantages.map((dis, idx) => <li key={idx}>{dis}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOGISTICS & SUSTAINMENT */}
          {activeTab === 'logistics' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <div>
                  <h3 className="font-bold text-sky-400 uppercase text-sm font-mono">SUPPLY DEPOTS & COMMISSARY SUSTAINMENT STATE</h3>
                  <p className="text-xs text-gray-400">Track stockpiles, passability routes, and forward logs structures.</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">SELECT STATE:</span>
                  <select 
                    value={selectedLogisticsCountry}
                    onChange={(e) => setSelectedLogisticsCountry(e.target.value)}
                    className="p-1.5 bg-[#151a21] border border-gray-700 text-gray-100 rounded text-xs uppercase"
                  >
                    {Object.keys(sustainment).map((cid) => (
                      <option key={cid} value={cid}>{countries[cid]?.name || cid}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CURRENT NATION LOGISTICS REPORT */}
              {sustainment[selectedLogisticsCountry] ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-[#12161b] border border-gray-850 rounded p-3 text-center">
                    <span className="text-[10px] text-gray-500 block uppercase">FUEL STOCKPILE</span>
                    <span className="text-lg font-bold text-sky-400">{Math.round(sustainment[selectedLogisticsCountry].fuelStockpile)} Gallons</span>
                    <span className="text-[10px] text-gray-500 block mt-1">Con: {Math.round(sustainment[selectedLogisticsCountry].fuelConsumptionPerTick)} per tick</span>
                  </div>
                  <div className="bg-[#12161b] border border-gray-850 rounded p-3 text-center">
                    <span className="text-[10px] text-gray-500 block uppercase">MUNITIONS STOCKPILE</span>
                    <span className="text-lg font-bold text-rose-400">{Math.round(sustainment[selectedLogisticsCountry].ammoStockpile)} Tons</span>
                    <span className="text-[10px] text-gray-500 block mt-1">Con: {Math.round(sustainment[selectedLogisticsCountry].ammoConsumptionPerTick)} per tick</span>
                  </div>
                  <div className="bg-[#12161b] border border-gray-850 rounded p-3 text-center">
                    <span className="text-[10px] text-gray-500 block uppercase">DAYS OF COMBAT SUPPLY</span>
                    <span className={`text-lg font-bold ${sustainment[selectedLogisticsCountry].daysOfSupplyRemaining < 15 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                      {sustainment[selectedLogisticsCountry].daysOfSupplyRemaining} days
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-1">Estimated duration remaining</span>
                  </div>
                  <div className="bg-[#12161b] border border-gray-850 rounded p-3 text-center">
                    <span className="text-[10px] text-gray-500 block uppercase">SUPPLY CHAIN INTEGRITY</span>
                    <span className="text-lg font-bold text-indigo-400">{Math.round(sustainment[selectedLogisticsCountry].supplyChainIntegrity * 100)}%</span>
                    <span className="text-[10px] text-gray-500 block mt-1">Route delivery strength</span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#12161b] border border-gray-850 rounded p-4 text-center text-xs text-gray-400">
                  NO LOGISTICAL SUSTAINMENT DATA TO MEASURE.
                </div>
              )}

              {/* SUPPLY ROUTES & BASES SECTORS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* SUPPLY ROUTES CARD */}
                <div className="bg-[#12161b] border border-gray-800 rounded p-4 space-y-3">
                  <h4 className="font-bold text-sky-400 uppercase text-xs flex items-center space-x-1.5 border-b border-gray-850 pb-1.5">
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                    <span>THEATER CONTESTED SUPPLY ROUTES</span>
                  </h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {supplyRoutes.map((route) => (
                      <div key={route.id} className="p-2.5 bg-[#0c0f12] rounded border border-gray-900 text-xs flex justify-between items-center">
                        <div>
                          <strong className="text-gray-100">{route.name}</strong>
                          <span className="text-[10px] text-gray-500 uppercase block">Link: {route.fromRegionId} to {route.toRegionId} | Capacity: {route.capacityTons} tons</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-400 font-bold">{Math.round((route.currentThroughput/route.capacityTons)*100)}% cap</span>
                          <span className="text-[10px] text-red-400 uppercase block">Contested: {route.contestedLevel*100}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LOGISTICS NODE CARD */}
                <div className="bg-[#12161b] border border-gray-800 rounded p-4 space-y-3">
                  <h4 className="font-bold text-sky-400 uppercase text-xs flex items-center space-x-1.5 border-b border-gray-850 pb-1.5">
                    <Server className="w-4 h-4 text-sky-400" />
                    <span>TACTICAL FORWARD LOGISTICS NODES</span>
                  </h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {logisticsNodes.map((node) => (
                      <div key={node.id} className="p-2.5 bg-[#0c0f12] rounded border border-gray-900 text-xs flex justify-between items-center">
                        <div>
                          <strong className="text-gray-100 uppercase">{node.regionId} FORWARD {node.type}</strong>
                          <span className="text-[10px] text-gray-500 uppercase block">Capacity Load: {node.currentLoad}/{node.capacityTons} tons</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                          node.isContested ? 'bg-red-950 text-red-400 border-red-800 animate-pulse' : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        }`}>
                          {node.isContested ? 'CONTESTED' : 'SECURE'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: TERRAIN & SEASONAL CONDITIONS */}
          {activeTab === 'terrain' && (
            <div className="space-y-4">
              <div className="border-b border-gray-800 pb-2">
                <h3 className="font-bold text-sky-400 uppercase text-sm font-mono">ENVIRONMENTAL HAZARD CONDITIONS</h3>
                <p className="text-xs text-gray-400">Analyse geographical passability, Seasonal muds, and micro-climate drift indices.</p>
              </div>

              {/* GRID FOR DISPLAYING ALL TERRAIN INFRASTRUCTURES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* GLOBAL SEASONS FORECASTS */}
                <div className="bg-[#12161b] border border-gray-800 rounded p-4 space-y-3">
                  <h4 className="font-bold text-sky-400 uppercase text-xs flex items-center space-x-1.5 border-b border-gray-850 pb-1.5">
                    <CloudRain className="w-4 h-4 text-sky-400" />
                    <span>LIVE WEATHER BROADCAST & VISIBILITY MAPS</span>
                  </h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {Object.keys(weatherStates).map((regionId) => {
                      const w = weatherStates[regionId];
                      return (
                        <div key={regionId} className="p-3 bg-[#0c0f12] rounded border border-gray-900 text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <h5 className="font-bold text-gray-100 uppercase flex items-center space-x-1">
                              <span>{countries[regionId]?.name || regionId} ZONE FORCASTS</span>
                            </h5>
                            <span className="text-gray-400 font-bold text-[10px] bg-sky-950/40 px-1 rounded uppercase">{w.season} Season</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="text-[10px] text-gray-500 block uppercase font-bold">Climate State</span>
                              <span className="text-sky-300 font-bold uppercase">{w.currentCondition}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-500 block uppercase font-bold">Visibility</span>
                              <span className="text-emerald-400 font-bold">{w.visibility*100}%</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-500 block uppercase font-bold">Ground Cond</span>
                              <span className="text-amber-400 font-bold uppercase">{w.groundCondition}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-900 pt-1">
                            <span>Temp: <strong className="text-gray-100 font-bold">{w.temperature}°C</strong> | Wind: <strong className="text-gray-100 font-bold">{w.windSpeed} km/h</strong></span>
                            {w.mudSeason && (
                              <span className="text-amber-500 bg-amber-950/40 border border-amber-900 px-1 py-0.2 rounded font-bold uppercase animate-pulse">
                                MUD GROUND SLOWDOWN ACTIVED
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* THEATER GEOGRAPHY DETAILS */}
                <div className="bg-[#12161b] border border-gray-800 rounded p-4 space-y-3">
                  <h4 className="font-bold text-sky-400 uppercase text-xs flex items-center space-x-1.5 border-b border-gray-850 pb-1.5">
                    <CompassIcon className="w-4 h-4 text-sky-400" />
                    <span>SOVEREIGN REGIONAL TERRAIN PROFILING</span>
                  </h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {Object.keys(terrainProfiles).map((regionId) => {
                      const t = terrainProfiles[regionId];
                      return (
                        <div key={regionId} className="p-3 bg-[#0c0f12] rounded border border-gray-900 text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <h5 className="font-bold text-gray-100 uppercase">{countries[regionId]?.name || regionId} GEOGRAPHY</h5>
                            <span className="text-gray-400 text-[10px]">Urban: <strong className="text-gray-200 uppercase">{t.urbanDensity}</strong></span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-[9px] text-gray-550 block uppercase font-bold">Primary topography</span>
                              <span className="text-sky-300 font-bold uppercase">{t.primaryTerrain}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-550 block uppercase font-bold">Passability score multiplier</span>
                              <span className="text-emerald-400 font-bold">{t.passability*100}% speed</span>
                            </div>
                          </div>

                          {/* PENALTY WARNINGS OR CHOKEPONT NOTICES */}
                          <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-gray-900">
                            {t.hasChokePoints && (
                              <span className="text-[9px] bg-red-950/40 text-red-400 border border-red-900/40 px-1 py-0.2 rounded uppercase font-bold">
                                CHOKE POINT RISKS
                              </span>
                            )}
                            {t.hasMountainPasses && (
                              <span className="text-[9px] bg-amber-950/40 text-amber-500 border border-amber-900/40 px-1 py-0.2 rounded uppercase font-bold">
                                MOUNTAIN CORRIDORS
                              </span>
                            )}
                            {t.defensibleTerrain && (
                              <span className="text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-1 py-0.2 rounded uppercase font-bold">
                                DEFENDER ENTRENCHMENT BONUS
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* CLOCK INDICATOR FOOTER */}
        <div className="bg-[#0c0f12] border-t border-gray-800 p-2 text-[10px] text-gray-500 flex justify-between items-center">
          <span>OPERATIONAL SYSTEM ENCRYPTED // DIGITAL SIGNATURE SHIFT AT LIVE TICKS</span>
          <span>SCS MODULE v7.2.1-KIN</span>
        </div>

      </div>
    </PanelFxShell>
  );
}
