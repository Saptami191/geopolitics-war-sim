import React from 'react';

// Export all the individual panels you've generated
export * from './IntelFeedPanel';
export * from './SIGINTVisibilityPanel';
export * from './ThreatNetworkPanel';
export * from './DEFCONStatusPanel';
export * from './NuclearOrderOfBattlePanel';
export * from './StrikeAuthorizationPanel';
export * from './OperativeNetworkPanel';
export * from './RegimePressurePanel';
export * from './CovertFinancePanel';
export * from './SanctionsControlPanel';
export * from './MacroEconomicPanel';
export * from './EnergyLeveragePanel';
export * from './TreatyStatusPanel';
export * from './UNSCLivePanel';
export * from './BlocCoherencePanel';
export * from './ActiveCyberOpsPanel';
export * from './CyberDefensePanel';
export * from './ZeroDayMarketPanel';
export * from './SovereignAgentPanel';
export * from './MirrorAIPanel';
export * from './LeaderPsychologyPanel';
export * from './PDBBriefingPanel';
export * from './CampaignProgressPanel';
export * from './DynamicScenarioPanel';

import { IntelFeedPanel } from './IntelFeedPanel';
import { SIGINTVisibilityPanel } from './SIGINTVisibilityPanel';
import { ThreatNetworkPanel } from './ThreatNetworkPanel';
import { DEFCONStatusPanel } from './DEFCONStatusPanel';
import { NuclearOrderOfBattlePanel } from './NuclearOrderOfBattlePanel';
import { StrikeAuthorizationPanel } from './StrikeAuthorizationPanel';
import { OperativeNetworkPanel } from './OperativeNetworkPanel';
import { RegimePressurePanel } from './RegimePressurePanel';
import { CovertFinancePanel } from './CovertFinancePanel';
import { SanctionsControlPanel } from './SanctionsControlPanel';
import { MacroEconomicPanel } from './MacroEconomicPanel';
import { EnergyLeveragePanel } from './EnergyLeveragePanel';
import { TreatyStatusPanel } from './TreatyStatusPanel';
import { UNSCLivePanel } from './UNSCLivePanel';
import { BlocCoherencePanel } from './BlocCoherencePanel';
import { ActiveCyberOpsPanel } from './ActiveCyberOpsPanel';
import { CyberDefensePanel } from './CyberDefensePanel';
import { ZeroDayMarketPanel } from './ZeroDayMarketPanel';
import { SovereignAgentPanel } from './SovereignAgentPanel';
import { MirrorAIPanel } from './MirrorAIPanel';
import { LeaderPsychologyPanel } from './LeaderPsychologyPanel';
import { PDBBriefingPanel } from './PDBBriefingPanel';
import { CampaignProgressPanel } from './CampaignProgressPanel';
import { DynamicScenarioPanel } from './DynamicScenarioPanel';

// Provide explicit mapping to the Phase 1 keys already extant in workspaceLayouts.ts
// This guarantees PanelColumn.tsx successfully initializes WITHOUT throwing Component crashes.
export const PANEL_COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  // INTEL COMMAND
  "INTEL_PANEL": IntelFeedPanel,
  "ARACHNE_PANEL": SIGINTVisibilityPanel,
  "GOTHAM_PANEL": ThreatNetworkPanel,

  // NUCLEAR COMMAND
  "ARSENAL_PANEL": NuclearOrderOfBattlePanel,
  "CONVENTIONAL_OPS_PANEL": StrikeAuthorizationPanel,
  "EW_PANEL": DEFCONStatusPanel, // Reusing EW keys to satisfy registry constraints

  // COVERT OPS
  "CIA_PANEL": OperativeNetworkPanel,
  "COVERT_FINANCE_PANEL": CovertFinancePanel,
  "GOVERNMENT_PANEL": RegimePressurePanel,

  // ECONOMIC WARFARE
  "SANCTIONS_PANEL": SanctionsControlPanel,
  "ECONOMIC_FORECAST_PANEL": MacroEconomicPanel,
  "ENERGY_PANEL": EnergyLeveragePanel,

  // DIPLOMACY & BLOCS
  "DIPLOMACY_PANEL": TreatyStatusPanel,
  "BLOCS_PANEL": BlocCoherencePanel,
  "CENTRAL_BANK_PANEL": UNSCLivePanel, 

  // CYBER WARFARE
  "CYBER_PANEL": CyberDefensePanel,
  "CYBER_OPS_PANEL": ActiveCyberOpsPanel,
  "FININT_PANEL": ZeroDayMarketPanel,

  // SOVEREIGN AI BRIEFING
  "MIRROR_ADAPTATION_PANEL": MirrorAIPanel,
  "ADVERSARIAL_INFLUENCE_PANEL": SovereignAgentPanel,
  "LEADER_PROFILES_PANEL": LeaderPsychologyPanel,

  // SITUATION ROOM
  "DECEPTION_CAMPAIGN_PANEL": CampaignProgressPanel,
  "FOUNDRY_PANEL": PDBBriefingPanel,
  "CONSEQUENCE_CHAIN_PANEL": DynamicScenarioPanel
};
