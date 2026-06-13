import { WorldState, Country } from '../types';
import { AlertSeverity } from '../hooks/usePanelAlertState';

/**
 * Returns the computed alert severity for a panel based on current state variables.
 */
export const getPanelAlertSeverity = (
  tabId: number,
  worldState: WorldState,
  country: Country
): AlertSeverity => {
  switch (tabId) {
    case 1: { // GOVERNMENT
      const pol = country.political;
      if (!pol) return 'nominal';
      const isCrit = (pol.stabilityIndex !== undefined && pol.stabilityIndex < 35) ||
                     (pol.popularUnrest !== undefined && pol.popularUnrest > 75) ||
                     (pol.coupRiskLevel !== undefined && pol.coupRiskLevel > 65);
      if (isCrit) return 'critical';

      const isWarn = (pol.stabilityIndex !== undefined && pol.stabilityIndex < 50) ||
                     (pol.popularUnrest !== undefined && pol.popularUnrest > 45) ||
                     (pol.coupRiskLevel !== undefined && pol.coupRiskLevel > 35);
      if (isWarn) return 'warning';
      return 'nominal';
    }
    case 2: { // CENTRAL BANK (ECONOMY)
      const econ = country.economic;
      if (!econ) return 'nominal';
      const isCrit = (econ.inflationRate !== undefined && econ.inflationRate > 20) ||
                     (econ.debtToGdpRatio !== undefined && econ.debtToGdpRatio > 120) ||
                     (econ.treasuryCashB !== undefined && econ.treasuryCashB < 1);
      if (isCrit) return 'critical';

      const isWarn = (econ.inflationRate !== undefined && (econ.inflationRate > 10 || econ.inflationRate < 0)) ||
                     (econ.debtToGdpRatio !== undefined && econ.debtToGdpRatio > 80) ||
                     (econ.treasuryCashB !== undefined && econ.treasuryCashB < 5);
      if (isWarn) return 'warning';
      return 'nominal';
    }
    case 3: { // ARSENAL (WEAPONS & MILITARY)
      const arsenal = country.arsenal;
      if (!arsenal) return 'nominal';
      
      // Critical check includes in-flight active strikes targeting player
      const incomingStrikes = worldState.activeStrikes?.some(
        (s) => s.targetCountryId === country.id && s.status === 'IN_FLIGHT'
      );
      
      const isCrit = (arsenal.readinessLevel !== undefined && arsenal.readinessLevel <= 25) || incomingStrikes;
      if (isCrit) return 'critical';

      const isWarn = (arsenal.readinessLevel !== undefined && arsenal.readinessLevel < 50) || 
                     (country.atWarWith && country.atWarWith.length > 0);
      if (isWarn) return 'warning';
      return 'nominal';
    }
    case 4: { // DIPLOMACY
      const warCount = country.atWarWith?.length ?? 0;
      const sanctionCount = country.economic?.sanctionedBy?.length ?? 0;
      if (warCount >= 2 || sanctionCount >= 3) return 'critical';
      if (warCount > 0 || sanctionCount > 0) return 'warning';
      return 'nominal';
    }
    case 5: { // RESEARCH
      const len = country.researchUnlocked?.length ?? 0;
      if (len < 2) return 'critical';
      if (len < 3) return 'warning';
      return 'nominal';
    }
    case 6: { // INTELLIGENCE
      const intel = country.intelligence;
      if (!intel) return 'nominal';
      const isCrit = (intel.blackBudgetB !== undefined && intel.blackBudgetB < 0.2) ||
                     (intel.signalIntelScore !== undefined && intel.signalIntelScore < 10) ||
                     (intel.knownThreats !== undefined && intel.knownThreats.length > 2);
      if (isCrit) return 'critical';

      const isWarn = (intel.blackBudgetB !== undefined && intel.blackBudgetB < 1.0) ||
                     (intel.signalIntelScore !== undefined && intel.signalIntelScore < 20);
      if (isWarn) return 'warning';
      return 'nominal';
    }
    case 7: { // SPACE
      const satellites = country.intelligence?.satellites?.length ?? 0;
      if (satellites === 0) return 'critical';
      if (satellites < 2) return 'warning';
      return 'nominal';
    }
    case 8: { // POPULATION
      const pol = country.political;
      if (!pol) return 'nominal';
      if (pol.leaderApprovalRating !== undefined && pol.leaderApprovalRating < 25) return 'critical';
      if (pol.leaderApprovalRating !== undefined && pol.leaderApprovalRating < 45) return 'warning';
      return 'nominal';
    }
    default:
      return 'nominal';
  }
};
