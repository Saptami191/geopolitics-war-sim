import { create } from 'zustand';
import { produce } from 'immer';
import { 
  ArachneIntelItem, ArachneFilterState, ArachneTheme, ArachneSourceClass, 
  ArachneUrgency, ArachneConfidence, ArachneFreshness, ArachnePriority, ArachneBriefGroup,
  ArachneFeed, ArachneNode, ArachneLink, ArachneIntelFusion, ArachneExposureLevel, ArachneNodeType, ArachneSourceType
} from '../types';
import { ScenarioId, WorldState, CountryState, WorldEvent } from '../types';
import { SCENARIO_SEEDS, GLOBAL_BASELINES, generateDynamicWhyItMatters } from '../data/arachneSeeded';
import { useWorldStore } from './worldStore';
import { usePlayerStore } from './playerStore';
import { useSigintStore as sigintStore } from './sigintStore';
import { useFinintStore as finintStore } from './finintStore';
import { useDefconStore as defconStore } from './defconStore';
import { useGothamStore as gothamStore } from './gothamStore';

function arachne_generateNodeLabel(
  type: ArachneNodeType,
  nationId: string,
  index: number
): string {
  const seed = (index * 73) % 100;
  if (type === 'PERSON') return `Person of Interest ${nationId}-${seed}`;
  if (type === 'ORGANISATION') return `Commercial Entity ${nationId}-${seed}`;
  if (type === 'FINANCIAL_ENTITY') return `Financial Node ${nationId}-${seed}`;
  if (type === 'VESSEL') return `Vessel Callsign ${nationId}-${seed}`;
  if (type === 'STATE_ENTITY') return `State Agency ${nationId}-${seed}`;
  if (type === 'FACILITY') return `Facility ${nationId}-${seed}`;
  if (type === 'PROXY_GROUP') return `Proxy Group ${nationId}-${seed}`;
  return `Unknown Entity ${nationId}-${seed}`;
}

function arachne_computeRiskScore(
  node: ArachneNode,
  activeFlags: any[],
  confirmedSignals: any[]
): number {
  let score = 30;
  if (node.sanctionedFlag) score += 20;
  if (node.proliferationFlag) score += 15;
  score += activeFlags.length * 10;
  score += confirmedSignals.length * 10;
  return Math.min(100, score);
}

function arachne_determineJurisdiction(tick: number, index: number): string {
  const pool = ['BVI', 'Cayman Islands', 'UAE', 'Panama', 'Singapore', 'Liechtenstein', 'Cyprus', 'Seychelles', 'Belize', 'Marshall Islands'];
  return pool[(tick + index) % pool.length];
}

function generateArachneFusionSummary(
  nodes: ArachneNode[],
  fusionType: ArachneIntelFusion['fusionType'],
  nationId: string,
  tick: number
): string {
  if (fusionType === 'NETWORK_MAP') {
    return `ARACHNE NETWORK PRODUCT // ${nationId} — ${nodes.length} entities mapped. Assessment confidence: HIGH.`;
  }
  if (fusionType === 'PROCUREMENT_CHAIN') {
    return `ARACHNE PROCUREMENT INTELLIGENCE // ${nationId} — Acquisition network identified. Active acquisition programme — CRITICAL priority.`;
  }
  if (fusionType === 'INFLUENCE_WEB') {
    return `ARACHNE INFLUENCE MAPPING // ${nationId} — Political influence network charted. Assessment: coordinated influence operation — ongoing.`;
  }
  if (fusionType === 'FINANCIAL_FLOW_MAP') {
    return `ARACHNE × FININT FUSION // ${nationId} — Financial network visualised. Assessment: systematic sanctions evasion infrastructure.`;
  }
  if (fusionType === 'FRONT_COMPANY_CHAIN') {
    return `ARACHNE CORPORATE INTELLIGENCE // ${nationId} — Shell company chain identified. Assessment: structured concealment — unmask initiated.`;
  }
  return `ARACHNE INTELLIGENCE PRODUCT // ${nationId}`;
}

interface ArachneState {
  feed: ArachneIntelItem[];
  filters: ArachneFilterState;
  pdbCards: ArachneIntelItem[];
  pdbActive: boolean;
  selectedItemId: string | null;
  unreadAlertCount: number;

  arachne_feeds: ArachneFeed[];
  arachne_nodes: ArachneNode[];
  arachne_links: ArachneLink[];
  arachne_fusionProducts: ArachneIntelFusion[];
  arachne_budget: { totalAllocated: number; spent: number; remaining: number };
  arachne_lastProcessedTick: number;
  arachne_totalNodesDiscovered: number;
  arachne_totalLinksDiscovered: number;
  arachne_burnedNodes: string[];
  arachne_activeTab: 'MAP' | 'FEEDS' | 'FUSION' | 'FININT' | 'SHELLS';
}

interface ArachneActions {
  initArachneForScenario: (scenarioId: ScenarioId) => void;
  setPdbActive: (active: boolean) => void;
  dismissPdbCard: (cardId: string) => void;
  setSelectedItem: (itemId: string | null) => void;
  updateFilters: (updates: Partial<ArachneFilterState>) => void;
  resetFilters: () => void;
  addLiveIntelItem: (item: Partial<ArachneIntelItem>) => void;
  tickArachne: (currentTick: number) => void;

  arachne_deployFeed: (feed: Omit<ArachneFeed, 'id' | 'deployedAtTick' | 'nodesDiscoveredTotal' | 'lastYieldTick'>, currentTick: number) => void;
  arachne_retractFeed: (feedId: string) => void;
  arachne_allocateBudget: (amount: number) => void;
  arachne_addNode: (node: Omit<ArachneNode, 'id' | 'firstObservedTick'>) => string;
  arachne_addLink: (link: Omit<ArachneLink, 'id' | 'firstObservedTick'>) => string;
  arachne_updateNodeExposure: (nodeId: string, level: ArachneExposureLevel) => void;
  arachne_burnNode: (nodeId: string, currentTick: number) => void;
  arachne_setActiveTab: (tab: 'MAP' | 'FEEDS' | 'FUSION' | 'FININT' | 'SHELLS') => void;
  arachne_processTick: (currentTick: number) => void;
  arachne_getNodesByNation: (nationId: string) => ArachneNode[];
  arachne_getHighRiskNodes: () => ArachneNode[];
  arachne_getMappedNodes: () => ArachneNode[];
  arachne_getActionableFusions: () => ArachneIntelFusion[];
  arachne_getLinksForNode: (nodeId: string) => ArachneLink[];
}

const initialFilters: ArachneFilterState = {
  searchQuery: '',
  country: 'ALL',
  region: 'ALL',
  theme: 'ALL',
  urgency: 'ALL',
  sourceType: 'ALL',
  confidence: 'ALL',
  freshness: 'ALL_ACTIVE'
};

export const useArachneStore = create<ArachneState & ArachneActions>((set, get) => ({
  feed: [],
  filters: initialFilters,
  pdbCards: [],
  pdbActive: false,
  selectedItemId: null,
  unreadAlertCount: 0,
  
  arachne_feeds: [],
  arachne_nodes: [],
  arachne_links: [],
  arachne_fusionProducts: [],
  arachne_budget: { totalAllocated: 600, spent: 0, remaining: 600 },
  arachne_lastProcessedTick: -1,
  arachne_totalNodesDiscovered: 0,
  arachne_totalLinksDiscovered: 0,
  arachne_burnedNodes: [],
  arachne_activeTab: 'MAP',
  
  arachne_setActiveTab: (tab) => set({ arachne_activeTab: tab }),

  initArachneForScenario: (scenarioId: ScenarioId) => {
    const worldState = useWorldStore.getState();
    const seeds = SCENARIO_SEEDS[scenarioId] || [];
    const baselines = GLOBAL_BASELINES;

    // Ingest and build feed
    const initialFeed: ArachneIntelItem[] = [];

    const buildItem = (seed: typeof seeds[0], index: number, isBaseline: boolean): ArachneIntelItem => {
      // Determine strategic priority based on seeds
      let urgRank = 1;
      if (seed.urgency === 'MEDIUM') urgRank = 2;
      else if (seed.urgency === 'HIGH') urgRank = 3;
      else if (seed.urgency === 'CRITICAL') urgRank = 4;

      let confRank = 1;
      if (seed.confidence === 'MEDIUM') confRank = 2;
      if (seed.confidence === 'HIGH') confRank = 3;
      if (seed.confidence === 'TOTAL') confRank = 4;

      // Prioritization math: alertScore: urgency (10-40) + confidence (10-40) + seed bias
      const scoreBase = (urgRank * 10) + (confRank * 8);
      const isCritical = seed.urgency === 'CRITICAL' || seed.strategicPriority === 'CRITICAL';

      // Dynamic analytical "why it matters" summary
      const firstCountry = seed.countryIds[0] || 'US';
      const theme = seed.themeTags[0] || 'MILITARY';
      const dynamicMatters = generateDynamicWhyItMatters(firstCountry, theme, worldState);

      return {
        id: `arc_${scenarioId}_${isBaseline ? 'base' : 'seed'}_${index}_${Math.random().toString(36).substring(2, 6)}`,
        title: seed.title,
        summary: seed.summary,
        fullBrief: seed.fullBrief,
        whyItMatters: seed.whyItMatters || dynamicMatters,
        countryIds: seed.countryIds,
        regionIds: seed.regionIds,
        relatedLeaderIds: [],
        themeTags: seed.themeTags,
        urgency: seed.urgency,
        confidence: seed.confidence,
        sourceType: seed.sourceType,
        sourceLabel: seed.sourceLabel,
        timestampTick: 0,
        freshnessState: isCritical ? 'BREAKING' : 'ACTIVE',
        linkedIntelFactIds: [],
        linkedWorldEventIds: [],
        linkedOperationIds: [],
        relatedTreatyIds: [],
        alertScore: scoreBase + (isBaseline ? 0 : 25),
        strategicPriority: seed.strategicPriority,
        visibility: 'PUBLIC',
        status: 'ACTIVE',
        requiresAttention: seed.requiresAttention,
        briefingCategory: seed.briefingCategory,
        storyId: seed.storyId
      };
    };

    // Build lists
    seeds.forEach((seed, i) => {
      initialFeed.push(buildItem(seed, i, false));
    });

    baselines.forEach((seed, i) => {
      // Avoid raw duplicates if already added as seed
      if (!initialFeed.some(f => f.storyId === seed.storyId)) {
        initialFeed.push(buildItem(seed, i, true));
      }
    });

    // Sort by alertScore descending
    initialFeed.sort((a, b) => b.alertScore - a.alertScore);

    // Filter Top Cart Stack for PDB: Needs 3 to 7 high strategic priority cards
    const pdbList = initialFeed
      .filter(item => item.requiresAttention || item.urgency === 'CRITICAL' || item.urgency === 'HIGH')
      .slice(0, 6);

    const fallbackPdb = pdbList.length >= 3 ? pdbList : initialFeed.slice(0, 4);

    set({
      feed: initialFeed,
      pdbCards: fallbackPdb,
      pdbActive: false, // do not open automatically on scenario load
      selectedItemId: initialFeed[0]?.id || null,
      unreadAlertCount: initialFeed.filter(item => item.requiresAttention).length,
      filters: initialFilters
    });
  },

  setPdbActive: (active) => set({ pdbActive: active }),

  dismissPdbCard: (cardId) => set(produce((draft: ArachneState) => {
    draft.pdbCards = draft.pdbCards.filter(c => c.id !== cardId);
    // Auto close modal if stack is empty
    if (draft.pdbCards.length === 0) {
      draft.pdbActive = false;
    }
  })),

  setSelectedItem: (itemId) => set({ selectedItemId: itemId }),

  updateFilters: (updates) => set(produce((draft: ArachneState) => {
    draft.filters = { ...draft.filters, ...updates };
  })),

  resetFilters: () => set({ filters: initialFilters }),

  addLiveIntelItem: (item) => set(produce((draft: ArachneState) => {
    const worldState = useWorldStore.getState();
    const id = `arc_live_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newItem: ArachneIntelItem = {
      id,
      title: item.title || "SIGINT INTERCEPT: Satellite Telemetry Active",
      summary: item.summary || "High-amplitude signals processed on regional military node.",
      fullBrief: item.fullBrief || "Intermittent command communications indicate military units are verifying encryption sequences, suggesting preparation for posture shifts.",
      whyItMatters: item.whyItMatters || "Strategic coordination suggests heightened regional posture awareness.",
      countryIds: item.countryIds || [],
      regionIds: item.regionIds || ["Global Space Console"],
      relatedLeaderIds: item.relatedLeaderIds || [],
      themeTags: item.themeTags || ["INTELLIGENCE"],
      urgency: item.urgency || "LOW",
      confidence: item.confidence || "MEDIUM",
      sourceType: item.sourceType || "SIGINT",
      sourceLabel: item.sourceLabel || "Sovereign Strategic Constellation",
      timestampTick: worldState.currentTick,
      freshnessState: item.freshnessState || "BREAKING",
      linkedIntelFactIds: item.linkedIntelFactIds || [],
      linkedWorldEventIds: item.linkedWorldEventIds || [],
      linkedOperationIds: item.linkedOperationIds || [],
      relatedTreatyIds: item.relatedTreatyIds || [],
      alertScore: item.alertScore || 30,
      strategicPriority: item.strategicPriority || "BACKGROUND",
      visibility: item.visibility || "PUBLIC",
      status: 'ACTIVE',
      requiresAttention: item.requiresAttention !== undefined ? item.requiresAttention : true,
      briefingCategory: item.briefingCategory || "BACKGROUND_SIGNAL",
      icon: item.icon,
      storyId: item.storyId
    };

    // Prepend to feed and sort again
    draft.feed.unshift(newItem);
    if (newItem.requiresAttention) {
      draft.unreadAlertCount++;
    }

    // Story Clustering: Deduplicate or cluster if storyId matches
    if (newItem.storyId) {
      draft.feed = draft.feed.filter(f => f.id === id || f.storyId !== newItem.storyId);
    }

    // Keep feed length balanced
    if (draft.feed.length > 100) {
      draft.feed.pop();
    }
  })),

  tickArachne: (currentTick) => set(produce((draft: ArachneState) => {
    const worldState = useWorldStore.getState();
    const activeScenario = usePlayerStore.getState().activeScenario;

    // 1. Freshness decay & lifecycle updates
    draft.feed.forEach(item => {
      const age = currentTick - item.timestampTick;
      
      // Decay score slowly as it ages
      if (age > 0) {
        item.alertScore = Math.max(5, item.alertScore - (age * 0.5));
      }

      // Lifecycle status transitions
      if (item.freshnessState === 'BREAKING' && age >= 3) {
        item.freshnessState = 'ACTIVE';
      } else if (item.freshnessState === 'ACTIVE' && age >= 8) {
        item.freshnessState = 'WATCH';
      } else if (item.freshnessState === 'WATCH' && age >= 15) {
        item.freshnessState = 'BACKGROUND';
      } else if (item.freshnessState === 'BACKGROUND' && age >= 25) {
        item.freshnessState = 'STALE';
      }
    });

    // 2. Continuous dynamic report generation from simulated world state changes
    // Check if any major change occurred during this tick and publish an Arachne feed card
    const globalLog = worldState.globalEventLog;
    const latestEvent = globalLog[0]; // peek latest log string

    if (latestEvent && latestEvent.tick === currentTick) {
      const text = latestEvent.text.toUpperCase();
      let theme: ArachneTheme = "DIPLOMACY";
      let urgency: ArachneUrgency = "LOW";
      let confidence: ArachneConfidence = "HIGH";
      let sourceType: ArachneSourceClass = "OSINT";
      let sourceLabel = "Open Satellite Wire / News Agencies";
      let title = "WORLD BRIEF: Geopolitical Movement Recorded";
      let summary = latestEvent.text;
      let fullBrief = `A strategic event was recorded in the global central directory: "${latestEvent.text}". Automated intelligence engines have compiled public and tactical channels to monitor secondary regional effects.`;
      let countryIds: string[] = [];
      let regionIds: string[] = ["Global Arena"];
      let storyId = `log_evt_${currentTick}`;

      // Analyze keyword triggers
      if (text.includes("STRIKE") || text.includes("LAUNCH") || text.includes("MISSILE") || text.includes("IMPACT")) {
        theme = "MILITARY";
        urgency = "CRITICAL";
        confidence = "TOTAL";
        sourceType = "CONFIRMED";
        sourceLabel = "Early-Warning Radar / Airborne Sensors";
        title = "CRITICAL ALERT: Ballistic Missile Event Tracked";
        fullBrief = `Early-warning sensor profiles verified ballistics launching or impacting within sovereign borders. Local intercept shields actively calculated counter-vectors: "${latestEvent.text}".`;
      } else if (text.includes("WAR") || text.includes("DECLARE")) {
        theme = "MILITARY";
        urgency = "CRITICAL";
        confidence = "TOTAL";
        sourceType = "CONFIRMED";
        sourceLabel = "Joint Command Diplomatic Wire";
        title = "CRITICAL ALERT: Active War Status Triggered";
        fullBrief = `Bilateral war declarations have been uploaded to official registers: "${latestEvent.text}". Armed battalions are fully activated and logistics conduits have switched to martial distribution.`;
      } else if (text.includes("SANCTION") || text.includes("EMBARGO")) {
        theme = "SANCTIONS";
        urgency = "HIGH";
        confidence = "TOTAL";
        sourceType = "CONFIRMED";
        sourceLabel = "Sovereign Trade Regulation Desk";
        title = "ECONOMIC MONITOR: Sanctions Regime Enforced";
      } else if (text.includes("CYBER") || text.includes("HACK") || text.includes("INTRUSION")) {
        theme = "CYBER";
        urgency = "HIGH";
        confidence = "HIGH";
        sourceType = "SIGINT";
        sourceLabel = "Signal-Scribe Intrusion Detection System";
        title = "CYBER WATCH: Offensive Firewall Intrusion";
        fullBrief = `High-amplitude payload scans recorded inside state military networks: "${latestEvent.text}". Analysts suspect technical espionage designed to extract active tracking schemas.`;
      } else if (text.includes("UNREST") || text.includes("RIOT") || text.includes("PROTEST")) {
        theme = "UNREST";
        urgency = "HIGH";
        sourceType = "HUMINT";
        confidence = "HIGH";
        sourceLabel = "Local Liaison Informants / Social Media Feeds";
        title = "CIVIL DEFENSE: Spiking Civil Unrest";
        fullBrief = `Spontaneous civilian gathers and riots reported inside key population hubs: "${latestEvent.text}". Civil authority structures are deployed under emergency posture guidelines.`;
      } else if (text.includes("COUP") || text.includes("REBEL")) {
        theme = "LEADERSHIP";
        urgency = "CRITICAL";
        confidence = "HIGH";
        sourceType = "HUMINT";
        sourceLabel = "Defense Intelligence Agent Wire";
        title = "ALERT: Coup Risk Extremes Recorded";
      }

      // Sniff country codes
      Object.keys(worldState.countries).forEach(id => {
        if (text.includes(id) || text.includes(worldState.countries[id].name.toUpperCase())) {
          countryIds.push(id);
          const reg = worldState.countries[id].continent;
          if (reg && !regionIds.includes(reg)) regionIds.push(reg);
        }
      });

      const strategicPriority = (urgency === 'CRITICAL' || urgency === 'HIGH') ? 'CRITICAL' : 'MEDIUM';

      // Dynamic analytical "why it matters" summary
      const firstCountry = countryIds[0] || 'US';
      const dynamicMatters = generateDynamicWhyItMatters(firstCountry, theme, worldState);

      const newItem: ArachneIntelItem = {
        id: `arc_live_event_${currentTick}_${Math.random().toString(36).substring(2,6)}`,
        title,
        summary,
        fullBrief,
        whyItMatters: dynamicMatters,
        countryIds,
        regionIds,
        relatedLeaderIds: [],
        themeTags: [theme],
        urgency,
        confidence,
        sourceType,
        sourceLabel,
        timestampTick: currentTick,
        freshnessState: 'BREAKING',
        linkedIntelFactIds: [],
        linkedWorldEventIds: [],
        linkedOperationIds: [],
        relatedTreatyIds: [],
        alertScore: (urgency === 'CRITICAL' ? 80 : 50) + (confidence === 'TOTAL' ? 15 : 5),
        strategicPriority,
        visibility: 'PUBLIC',
        status: 'ACTIVE',
        requiresAttention: strategicPriority === 'CRITICAL',
        briefingCategory: strategicPriority === 'CRITICAL' ? 'TOP_STORY' : 'ACTIVE_WATCH',
        storyId
      };

      draft.feed.unshift(newItem);
      if (newItem.requiresAttention) {
        draft.unreadAlertCount++;
      }
    }

    // 3. Keep sorted
    draft.feed.sort((a, b) => b.alertScore - a.alertScore);
  })),

  arachne_getNodesByNation: (nationId) => get().arachne_nodes.filter(n => n.nationId === nationId),
  arachne_getHighRiskNodes: () => get().arachne_nodes.filter(n => n.riskScore >= 75),
  arachne_getMappedNodes: () => get().arachne_nodes.filter(n => n.exposureLevel === 'MAPPED'),
  arachne_getActionableFusions: () => get().arachne_fusionProducts.filter(f => f.actionableFlag),
  arachne_getLinksForNode: (nodeId) => get().arachne_links.filter(l => l.sourceNodeId === nodeId || l.targetNodeId === nodeId),

  arachne_deployFeed: (feed, currentTick) => set(produce((draft: ArachneState) => {
    draft.arachne_feeds.push({
      ...feed,
      id: `arc_feed_${currentTick}_${Math.random().toString(36).slice(2,7)}`,
      deployedAtTick: currentTick,
      nodesDiscoveredTotal: 0,
      lastYieldTick: currentTick
    });
  })),

  arachne_retractFeed: (feedId) => set(produce((draft: ArachneState) => {
    const idx = draft.arachne_feeds.findIndex(f => f.id === feedId);
    if (idx !== -1) draft.arachne_feeds[idx].isActive = false;
  })),

  arachne_allocateBudget: (amount) => set(produce((draft: ArachneState) => {
    draft.arachne_budget.totalAllocated += amount;
    draft.arachne_budget.remaining += amount;
  })),

  arachne_addNode: (node) => {
    const id = `arc_node_${Math.random().toString(36).slice(2,9)}`;
    set(produce((draft: ArachneState) => {
      draft.arachne_nodes.push({ ...node, id, firstObservedTick: useWorldStore.getState().currentTick });
      draft.arachne_totalNodesDiscovered++;
    }));
    return id;
  },

  arachne_addLink: (link) => {
    const id = `arc_link_${Math.random().toString(36).slice(2,9)}`;
    set(produce((draft: ArachneState) => {
      draft.arachne_links.push({ ...link, id, firstObservedTick: useWorldStore.getState().currentTick });
      draft.arachne_totalLinksDiscovered++;
    }));
    return id;
  },

  arachne_updateNodeExposure: (nodeId, level) => set(produce((draft: ArachneState) => {
    const node = draft.arachne_nodes.find(n => n.id === nodeId);
    if (node && node.exposureLevel !== 'BURNED') {
      node.exposureLevel = level;
    }
  })),

  arachne_burnNode: (nodeId, currentTick) => set(produce((draft: ArachneState) => {
    const node = draft.arachne_nodes.find(n => n.id === nodeId);
    if (node && !node.isBurned) {
      node.isBurned = true;
      node.burnedAtTick = currentTick;
      node.exposureLevel = 'BURNED';
      if (!draft.arachne_burnedNodes.includes(nodeId)) {
        draft.arachne_burnedNodes.push(nodeId);
      }
    }
  })),

  arachne_processTick: (currentTick: number) => {
    const state = get();
    if (state.arachne_lastProcessedTick === currentTick) return;

    const sigintState = sigintStore.getState();
    const confirmedSignals = sigintState.u8200GetConfirmedSignals ? sigintState.u8200GetConfirmedSignals() : [];
    
    // finintStore might not be fully implemented yet, but we will mock its shape
    const finintState = finintStore.getState() as any;
    const criticalFlags = (finintState.finint_flags || []).filter((f: any) => f.severity === 'HIGH' || f.severity === 'CRITICAL');

    const worldState = useWorldStore.getState();
    const defcon = defconStore.getState().currentDefconLevel ?? 3;
    const defconBoost = (6 - defcon) * 0.08;

    let budgetSpent = state.arachne_budget.spent;
    const activeFeeds = state.arachne_feeds.filter(f => f.isActive);
    activeFeeds.forEach(feed => { budgetSpent += feed.dailyCost; });
    const remaining = state.arachne_budget.totalAllocated - budgetSpent;

    let feeds = [...state.arachne_feeds];
    if (remaining <= 0) {
      feeds = feeds.map(f => f.isActive ? { ...f, isActive: false } : f);
    }

    let nodes = [...state.arachne_nodes];
    let links = [...state.arachne_links];
    let fusions = [...state.arachne_fusionProducts];
    let burnedNodeIds = [...state.arachne_burnedNodes];
    let nodesDiscovered = 0;
    let linksDiscovered = 0;

    // Discovery
    feeds.forEach(feed => {
      if (!feed.isActive) return;
      const discoveryProb = (feed.coverageDepth / 100) * (1 + defconBoost);
      if (Math.random() < discoveryProb) {
        let nodeType: ArachneNodeType = 'PERSON';
        const typeRoll = Math.random();
        if (feed.sourceType === 'CORPORATE_REGISTRY') {
          nodeType = typeRoll < 0.5 ? 'ORGANISATION' : typeRoll < 0.8 ? 'FINANCIAL_ENTITY' : 'PERSON';
        } else if (feed.sourceType === 'SHIPPING_MANIFEST') {
          nodeType = typeRoll < 0.5 ? 'VESSEL' : typeRoll < 0.8 ? 'FACILITY' : 'ORGANISATION';
        } else if (feed.sourceType === 'PROCUREMENT_DATABASE') {
          nodeType = typeRoll < 0.5 ? 'ORGANISATION' : typeRoll < 0.8 ? 'STATE_ENTITY' : 'FACILITY';
        } else if (feed.sourceType === 'SOCIAL_NETWORK') {
          nodeType = typeRoll < 0.7 ? 'PERSON' : 'PROXY_GROUP';
        } else if (feed.sourceType === 'NEWS_AGGREGATOR') {
          nodeType = typeRoll < 0.4 ? 'PERSON' : typeRoll < 0.8 ? 'ORGANISATION' : 'STATE_ENTITY';
        } else if (feed.sourceType === 'SATELLITE_METADATA') {
          nodeType = typeRoll < 0.5 ? 'FACILITY' : 'VESSEL';
        } else if (feed.sourceType === 'FINANCIAL_FILING') {
          nodeType = typeRoll < 0.4 ? 'FINANCIAL_ENTITY' : typeRoll < 0.8 ? 'PERSON' : 'ORGANISATION';
        } else if (feed.sourceType === 'DIPLOMATIC_REGISTRY') {
          nodeType = typeRoll < 0.6 ? 'PERSON' : 'STATE_ENTITY';
        }
        
        const existingNodeIdx = nodes.findIndex(n => n.nationId === feed.targetNationId && n.exposureLevel === 'SUSPECTED');
        if (existingNodeIdx >= 0) {
           nodes[existingNodeIdx] = { ...nodes[existingNodeIdx], exposureLevel: 'IDENTIFIED', lastActiveObservationTick: currentTick };
        } else {
           const isSanctioned = false; // Add logic if needed
           const baseRisk = 30 + (isSanctioned ? 20 : 0) + ((6-defcon)*5);
           const newNode: ArachneNode = {
             id: `arc_node_${currentTick}_${Math.random().toString(36).slice(2,7)}`,
             label: arachne_generateNodeLabel(nodeType, feed.targetNationId, nodes.length),
             type: nodeType,
             nationId: feed.targetNationId,
             exposureLevel: 'SUSPECTED',
             riskScore: Math.min(100, baseRisk),
             sanctionedFlag: isSanctioned,
             proliferationFlag: false,
             corruptionFlag: false,
             linkedEntityIds: [],
             sourceTypes: [feed.sourceType],
             firstObservedTick: currentTick,
             lastActiveObservationTick: currentTick,
             notes: '',
             isBurned: false,
             burnedAtTick: null
           };
           nodes.push(newNode);
           nodesDiscovered++;
        }
        
        const nationNodes = nodes.filter(n => n.nationId === feed.targetNationId && !n.isBurned);
        if (nationNodes.length >= 2 && Math.random() < 0.4) {
          const n1 = nationNodes[Math.floor(Math.random() * nationNodes.length)];
          const n2 = nationNodes[Math.floor(Math.random() * nationNodes.length)];
          if (n1.id !== n2.id && !links.find(l => (l.sourceNodeId === n1.id && l.targetNodeId === n2.id) || (l.sourceNodeId === n2.id && l.targetNodeId === n1.id))) {
            const newLink: ArachneLink = {
              id: `arc_link_${currentTick}_${Math.random().toString(36).slice(2,7)}`,
              sourceNodeId: n1.id,
              targetNodeId: n2.id,
              linkType: 'CO_LOCATION', // Simplification
              confidence: 50,
              firstObservedTick: currentTick,
              lastConfirmedTick: currentTick,
              financialValue: null,
              notes: ''
            };
            links.push(newLink);
            linksDiscovered++;
            
            const n1Idx = nodes.findIndex(n => n.id === n1.id);
            const n2Idx = nodes.findIndex(n => n.id === n2.id);
            nodes[n1Idx] = { ...nodes[n1Idx], linkedEntityIds: [...nodes[n1Idx].linkedEntityIds, n2.id] };
            nodes[n2Idx] = { ...nodes[n2Idx], linkedEntityIds: [...nodes[n2Idx].linkedEntityIds, n1.id] };
          }
        }
        
        const feedIdx = feeds.findIndex(f => f.id === feed.id);
        if (feedIdx !== -1) {
           feeds[feedIdx] = { ...feeds[feedIdx], nodesDiscoveredTotal: feeds[feedIdx].nodesDiscoveredTotal + 1, lastYieldTick: currentTick };
        }
      }
    });

    // SIGINT updates
    confirmedSignals.forEach(signal => {
      const signalNodes = nodes.filter(n => n.nationId === signal.sourceNationId && !n.isBurned);
      signalNodes.forEach(node => {
        if (node.linkedEntityIds.length > 0) { // Simplification
          const idx = nodes.findIndex(n => n.id === node.id);
          nodes[idx] = { ...nodes[idx], riskScore: Math.min(100, nodes[idx].riskScore + 10) };
          if (nodes[idx].exposureLevel === 'SUSPECTED') nodes[idx].exposureLevel = 'IDENTIFIED';
        }
      });
    });

    // FININT updates
    criticalFlags.forEach((flag: any) => {
      if (flag.linkedArachneNodeIds?.length > 0) {
        flag.linkedArachneNodeIds.forEach((id: string) => {
           const idx = nodes.findIndex(n => n.id === id);
           if (idx !== -1) {
             nodes[idx] = { ...nodes[idx], riskScore: Math.min(100, nodes[idx].riskScore + 15) };
             if (nodes[idx].exposureLevel === 'SUSPECTED') nodes[idx].exposureLevel = 'IDENTIFIED';
           }
        });
      } else {
        const newNode: ArachneNode = {
           id: `arc_node_${currentTick}_${Math.random().toString(36).slice(2,7)}`,
           label: arachne_generateNodeLabel('FINANCIAL_ENTITY', flag.sourceNationId, nodes.length),
           type: 'FINANCIAL_ENTITY',
           nationId: flag.sourceNationId,
           exposureLevel: 'SUSPECTED',
           riskScore: Math.min(100, 50 + ((6-defcon)*5)),
           sanctionedFlag: false,
           proliferationFlag: false,
           corruptionFlag: false,
           linkedEntityIds: [],
           sourceTypes: ['FINANCIAL_FILING'],
           firstObservedTick: currentTick,
           lastActiveObservationTick: currentTick,
           notes: '',
           isBurned: false,
           burnedAtTick: null
        };
        nodes.push(newNode);
        nodesDiscovered++;
      }
    });

    // Fusion products
    const nations = [...new Set(nodes.map(n => n.nationId))];
    nations.forEach(nationId => {
      const mappedNodes = nodes.filter(n => n.nationId === nationId && n.exposureLevel === 'MAPPED');
      if (mappedNodes.length >= 3) {
         const exists = fusions.some(f => f.involvedNationIds.includes(nationId) && f.fusionType === 'NETWORK_MAP' && (currentTick - f.producedAtTick < 20));
         if (!exists) {
           fusions.push({
             id: `arc_fusion_${currentTick}_${Math.random().toString(36).slice(2,7)}`,
             producedAtTick: currentTick,
             involvedNodeIds: mappedNodes.map(n => n.id),
             involvedNationIds: [nationId],
             fusionType: 'NETWORK_MAP',
             summary: generateArachneFusionSummary(mappedNodes, 'NETWORK_MAP', nationId, currentTick),
             confidence: 85,
             actionableFlag: true,
             linkedSignalIds: [],
             linkedFinintFlags: []
           });
            useWorldStore.getState().addGlobalEvent(
              `Arachne Fusion Product generated for ${nationId}.`,
              'WARNING'
            );
         }
      }
    });

    // Burn mechanics
    nodes.filter(n => n.exposureLevel === 'MAPPED' && !n.isBurned).forEach(node => {
      const activeDuration = currentTick - node.firstObservedTick;
      const burnProb = 0.005 * (activeDuration / 10);
      if (Math.random() < burnProb) {
         const idx = nodes.findIndex(n => n.id === node.id);
         nodes[idx] = { ...nodes[idx], isBurned: true, burnedAtTick: currentTick, exposureLevel: 'BURNED' };
         burnedNodeIds.push(node.id);
         useWorldStore.getState().addGlobalEvent(
           `Arachne Node BURNED: ${node.label}`,
           'CRITICAL'
         );
      }
    });

    // if (gothamStore.getState().ingestArachneNodes) {
    //     gothamStore.getState().ingestArachneNodes(nodes, links);
    // }

    set({
      arachne_feeds: feeds,
      arachne_nodes: nodes,
      arachne_links: links,
      arachne_fusionProducts: fusions,
      arachne_budget: { ...state.arachne_budget, spent: budgetSpent, remaining: Math.max(0, remaining) },
      arachne_burnedNodes: burnedNodeIds,
      arachne_lastProcessedTick: currentTick,
      arachne_totalNodesDiscovered: state.arachne_totalNodesDiscovered + nodesDiscovered,
      arachne_totalLinksDiscovered: state.arachne_totalLinksDiscovered + linksDiscovered
    });
  }

}));
