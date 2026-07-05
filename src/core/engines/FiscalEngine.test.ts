import test from 'node:test';
import assert from 'node:assert/strict';
import { FiscalEngine } from './FiscalEngine';

test('FiscalEngine delegates the existing fiscal step logic', () => {
  const draft = {
    countries: {
      US: {
        id: 'US',
        name: 'United States',
        economic: {
          gdpB: 100,
          gdpGrowthRate: 2,
          inflationRate: 2,
          unemploymentRate: 5,
          treasuryCashB: 10,
          debtToGdpRatio: 50,
          debtStressIndex: 0,
          interestRate: 2,
          currencyStrength: 100,
          taxRate: 20,
          corporateTaxRate: 20,
          printingPressActive: false,
          printingPressIntensity: 1,
          bonds: [],
          oligarchs: [],
          offshoreSlushFundB: 0,
          sanctionedBy: [],
          tradeSurplusDeficitB: 0,
          spendingAllocation: {
            military: 0.2,
            healthcare: 0.05,
            education: 0.05,
            infrastructure: 0.05,
            intelligence: 0.05,
            debtService: 0.05,
            propaganda: 0.05,
          },
        },
        political: {
          leaderApprovalRating: 60,
          popularUnrest: 10,
          stabilityIndex: 50,
          coupRiskLevel: 0,
          martialLawActive: false,
          martialLawTicksRemaining: 0,
          factions: [],
          mediaChannels: [],
          propagandaEffectiveness: 10,
          censorship: 10,
          diasporaInfluence: 0,
        },
        arsenal: {
          totalMaintenanceCost: 0,
        },
        researchUnlocked: [],
        lastEventLog: [],
      },
    },
  } as any;

  const engine = new FiscalEngine();
  engine.step(draft);

  assert.notEqual(draft.countries.US.economic.treasuryCashB, 10);
});
