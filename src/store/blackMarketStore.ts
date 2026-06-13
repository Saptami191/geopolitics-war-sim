import { create } from 'zustand';
import { produce } from 'immer';
import { AuctionLot, BlackMarketItemType, WorldState } from '../types';
import { useWorldStore } from './worldStore';
import { usePlayerStore } from './playerStore';
import { audio } from '../utils/audio';

const LOT_PROFILES: {
  itemType: BlackMarketItemType;
  rarity: 'COMMON' | 'RARE';
  titles: string[];
  descriptions: string[];
  sellerTags: string[];
  basePriceMin: number;
  basePriceMax: number;
  suspicionRange: [number, number];
}[] = [
  {
    itemType: 'MANPADS',
    rarity: 'COMMON',
    titles: [
      'FIM-92 Stinger Batch',
      '9K38 Igla-S Man-Portable Fleet',
      'Anza Mk-II Air Defense Depot'
    ],
    descriptions: [
      'Surplus military crates of surface-to-air shoulder-fired combat missile rigs. Deploys rapid air defense grid, increasing interception response (+12% ABM Shield Strength).',
      'Clandestine shoulder-launched air defense units. Perfect for defensive territorial hardening and cruise missile containment (+10% ABM Shield Strength).'
    ],
    sellerTags: ['[RED_ORION]', '[GRAY_MANTIS]', '[VECTOR_EAST]'],
    basePriceMin: 15,
    basePriceMax: 25,
    suspicionRange: [6, 12]
  },
  {
    itemType: 'CRUISE_MISSILE',
    rarity: 'COMMON',
    titles: [
      'Kalibr-NK Long-Range Stockpile',
      'BGM-109 Tomahawk Block IV Crate',
      'C-802 Anti-Ship Tactical Cruise Lots'
    ],
    descriptions: [
      'Subsonic precision guided cruise missiles equipped with land-attack warheads. Integrates 30 heavy guided missiles immediately into your operational military arsenal stockpile.',
      'Medium-range precision land-strike guided cruise missiles. Boosts standard missile stockpiles by 25 tactical units for instant bombardment operations.'
    ],
    sellerTags: ['[SABRE_GROUP]', '[ODESSA_NET]', '[HELIOS]'],
    basePriceMin: 20,
    basePriceMax: 35,
    suspicionRange: [8, 15]
  },
  {
    itemType: 'SATELLITE_JAMMERS',
    rarity: 'RARE',
    titles: [
      'Tirada-2S Mobile Orbital Blind Platform',
      'Pelena-1 Strategic Jamming Matrix'
    ],
    descriptions: [
      'Complex directed wave generator designed to overload satellite telemetry feeds and signal intelligence. Disables tracing channels and boosts intelligence signal cyber defense (+20 Signal Intel Score).',
      'High-altitude electronic countermeasures system that blocks satellite recon sweeps. Enhances firewall systems and signal concealment coefficients significantly.'
    ],
    sellerTags: ['[KRONOS_LABS]', '[AERODYNE_CYBER]'],
    basePriceMin: 35,
    basePriceMax: 55,
    suspicionRange: [12, 18]
  },
  {
    itemType: 'NUCLEAR_TRIGGERS',
    rarity: 'RARE',
    titles: [
      'Krytron Trigger-Array Assemblies',
      'High-Speed Explosive Polonium-Beryllium Initiators'
    ],
    descriptions: [
      'Co-axial gas-discharge tube switch structures required to ignite nuclear payloads simultaneously. Grants immediate status as a Nuclear-Capable military force with global nuclear capabilities.',
      'Restricted fission initiation trigger cores. Instantly delivers strategic readiness elevation, unlocking fully functional strategic military payload capability globally.'
    ],
    sellerTags: ['[GOLIATH_HEAVY]', '[OMEGA_NUCLEONICS]'],
    basePriceMin: 70,
    basePriceMax: 110,
    suspicionRange: [22, 35]
  }
];

interface BlackMarketState {
  activeLots: AuctionLot[];
  playerBids: Record<string, number>;
  pendingDeliveries: AuctionLot[];
  internationalSuspicion: number;
  unInvestigationTriggered: boolean;
  sanctionsTriggered: boolean;
}

interface BlackMarketActions {
  spawnAuctionLot: (currentTick: number) => void;
  spawnLotsForTick: (currentTick: number) => void;
  placePlayerBid: (lotId: string, amount: number) => { success: boolean; error?: string };
  runAIBidding: (currentTick: number) => void;
  resolveExpiredLots: (currentTick: number) => void;
  scheduleDelivery: (lotId: string, winnerId: string, currentTick: number) => void;
  processDeliveries: (currentTick: number) => void;
  increaseSuspicion: (amount: number) => void;
  decaySuspicion: () => void;
  getLiveLots: () => AuctionLot[];
  getPendingDeliveries: () => AuctionLot[];
  getPlayerBidForLot: (lotId: string) => number;
  tickMarket: (currentTick: number) => void;
  resetMarket: () => void;
  bootstrapStarterLots: (currentTick: number) => void;
  runSingleAICounterBid: (lotId: string) => void;
}

export const useBlackMarketStore = create<BlackMarketState & BlackMarketActions>((set, get) => ({
  activeLots: [],
  playerBids: {},
  pendingDeliveries: [],
  internationalSuspicion: 0,
  unInvestigationTriggered: false,
  sanctionsTriggered: false,

  spawnAuctionLot: (currentTick) => {
    // 5% chance of Rare, 95% Common
    const rollRare = Math.random() < 0.05;
    const targetRarity = rollRare ? 'RARE' : 'COMMON';

    // Filter profiles
    const profiles = LOT_PROFILES.filter(p => p.rarity === targetRarity);
    if (profiles.length === 0) return;

    const profile = profiles[Math.floor(Math.random() * profiles.length)];
    
    // Choose title and details
    const title = profile.titles[Math.floor(Math.random() * profile.titles.length)];
    const description = profile.descriptions[Math.floor(Math.random() * profile.descriptions.length)];
    const sellerTag = profile.sellerTags[Math.floor(Math.random() * profile.sellerTags.length)];
    
    const basePrice = Math.round(
      profile.basePriceMin + Math.random() * (profile.basePriceMax - profile.basePriceMin)
    );
    const suspicionOnWin = Math.round(
      profile.suspicionRange[0] + Math.random() * (profile.suspicionRange[1] - profile.suspicionRange[0])
    );

    // AI Interest profile setup:
    // Determine 2-4 appropriate country IDs (excluding Player country, standard CN, RU, GB, FR, IL, etc.)
    const playerCountryId = usePlayerStore.getState().countryId || 'US';
    const allAIs = ['CN', 'RU', 'GB', 'FR', 'IL', 'IN', 'KP', 'JP'].filter(id => id !== playerCountryId);
    
    // Pick 2 to 4 random AIs
    const interestedCount = Math.floor(Math.random() * 3) + 2; // 2 to 4
    const shuffled = [...allAIs].sort(() => 0.5 - Math.random());
    const interestedAIs = shuffled.slice(0, interestedCount);

    const lotId = `LOT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLot: AuctionLot = {
      id: lotId,
      itemType: profile.itemType,
      title,
      description,
      sellerTag,
      rarity: profile.rarity,
      basePrice,
      currentBid: basePrice,
      currentLeaderId: null,
      spawnedAtTick: currentTick,
      expiresAtTick: currentTick + (profile.rarity === 'RARE' ? 15 : 12),
      status: 'LIVE',
      deliveryTick: null,
      suspicionOnWin,
      aiInterestProfile: {
        baseDesire: Math.round(50 + Math.random() * 40), // 50 to 90
        interestedAIs
      }
    };

    set(produce((draft: BlackMarketState) => {
      draft.activeLots.push(newLot);
    }));

    useWorldStore.getState().addGlobalEvent(
      `BLACK MARKET LISTING: New lot [${lotId}] launched by ${sellerTag}. Category: ${profile.itemType.replace('_', ' ')}. Bidding open.`,
      'WARNING'
    );
  },

  spawnLotsForTick: (currentTick) => {
    // Maintain minimum floor of 2 live lots at all times
    const liveCount = get().activeLots.filter(l => l.status === 'LIVE').length;
    if (liveCount < 2) {
      get().spawnAuctionLot(currentTick);
    }

    // Every 5 ticks, 30% chance to spawn a new lot
    if (currentTick > 0 && currentTick % 5 === 0) {
      if (Math.random() < 0.30) {
        get().spawnAuctionLot(currentTick);
      }
    }
  },

  placePlayerBid: (lotId, amount) => {
    const lot = get().activeLots.find(l => l.id === lotId);
    if (!lot) return { success: false, error: 'Auction lot not found.' };
    if (lot.status !== 'LIVE') return { success: false, error: 'This auction list has closed.' };

    const minRequired = parseFloat((lot.currentBid * 1.05).toFixed(2));
    if (amount < minRequired) {
      return { 
        success: false, 
        error: `Bid must be at least 5% higher than current bid ($${minRequired.toFixed(2)}B).` 
      };
    }

    const playerState = usePlayerStore.getState();
    if (playerState.cashB < amount) {
      return { 
        success: false, 
        error: `Insufficient national treasury. Required: $${amount.toFixed(1)}B, Available: $${playerState.cashB.toFixed(1)}B.` 
      };
    }

    // Update active leader and bid
    set(produce((draft: BlackMarketState) => {
      const targetLot = draft.activeLots.find(l => l.id === lotId);
      if (targetLot) {
        targetLot.currentBid = amount;
        targetLot.currentLeaderId = 'PLAYER';
      }
      draft.playerBids[lotId] = amount;
    }));

    audio.sfxKeyClick();
    return { success: true };
  },

  runAIBidding: (currentTick) => {
    const worldStore = useWorldStore.getState();
    const playerCountryId = usePlayerStore.getState().countryId || 'US';

    set(produce((draft: BlackMarketState) => {
      draft.activeLots.forEach((lot) => {
        if (lot.status !== 'LIVE') return;
        if (!lot.aiInterestProfile) return;

        // Give each interested AI a chance to bid
        lot.aiInterestProfile.interestedAIs.forEach((aiId) => {
          const aiCountryObj = worldStore.countries[aiId];
          if (!aiCountryObj) return;

          // AI Desire score calculation
          let desire = lot.aiInterestProfile!.baseDesire;

          // Influence desire by AI attributes
          const isAtWar = aiCountryObj.atWarWith && aiCountryObj.atWarWith.length > 0;
          if (isAtWar) desire += 15;

          const treasury = aiCountryObj.economic.treasuryCashB;
          if (treasury > lot.basePrice * 3) {
            desire += 15;
          } else if (treasury < lot.currentBid) {
            desire -= 40; // Too poor to bid
          }

          // Random noise
          desire += (Math.random() * 20 - 10);

          // Threshold check (Threshold: 65)
          if (desire > 65) {
            const nextBid = parseFloat((lot.currentBid * 1.1).toFixed(2));
            
            // Check if AI can afford and is not already the leader
            if (treasury >= nextBid && lot.currentLeaderId !== aiId) {
              // Place bid!
              const prevLeader = lot.currentLeaderId;
              lot.currentBid = nextBid;
              lot.currentLeaderId = aiId;

              // If player was outbid immediately write terminal alert or play sfx
              if (prevLeader === 'PLAYER') {
                useWorldStore.getState().addGlobalEvent(
                  `BLACK MARKET: Player outbid on lot [${lot.id}] by competing bidder. Current high bid: $${nextBid.toFixed(2)}B.`, 
                  'WARNING'
                );
              }
            }
          }
        });
      });
    }));
  },

  resolveExpiredLots: (currentTick) => {
    const listToResolve: AuctionLot[] = [];

    set(produce((draft: BlackMarketState) => {
      draft.activeLots.forEach((lot) => {
        if (lot.status === 'LIVE' && currentTick >= lot.expiresAtTick) {
          listToResolve.push({ ...lot });
          
          if (lot.currentLeaderId === 'PLAYER') {
            lot.status = 'DELIVERING';
            lot.deliveryTick = currentTick + 3;
            draft.pendingDeliveries.push({
              ...lot,
              status: 'DELIVERING',
              deliveryTick: currentTick + 3
            });
          } else if (lot.currentLeaderId) {
            lot.status = 'RESOLVED'; // AI wins, items delivers immediately or resolved
          } else {
            lot.status = 'EXPIRED'; // No bids
          }
        }
      });

      // Remove fully completed actions and filter active lots
      draft.activeLots = draft.activeLots.filter(
        l => l.status === 'LIVE' || l.status === 'DELIVERING'
      );
    }));

    // Handle payment deduction on player win
    listToResolve.forEach((lot) => {
      if (lot.currentLeaderId === 'PLAYER') {
        const winningBid = lot.currentBid;
        // Deduct from Player Treasurer
        usePlayerStore.setState((s) => ({ cashB: Math.max(0, s.cashB - winningBid) }));
        usePlayerStore.getState().syncCashToCountry();

        useWorldStore.getState().addGlobalEvent(
          `CONTRABAND PROCUREMENT: You secured Lot [${lot.id}] (${lot.title}) high bid of $${winningBid.toFixed(2)}B. Transit pipeline initiated (ETA: 3 Ticks).`,
          'CRITICAL'
        );
        audio.sfxKlaxon();
      } else if (lot.currentLeaderId) {
        // AI won deduction
        const winnerId = lot.currentLeaderId;
        const winnerCountry = useWorldStore.getState().countries[winnerId];
        const winnerName = winnerCountry?.name || winnerId;
        
        useWorldStore.getState().updateCountry(winnerId, (draft) => {
          draft.economic.treasuryCashB = Math.max(0, draft.economic.treasuryCashB - lot.currentBid);
          // Apply weapon upgrade directly for AI
          if (lot.itemType === 'CRUISE_MISSILE') {
            const u = draft.arsenal.units.find(un => un.type === 'CRUISE_MISSILE');
            if (u) { u.count += 20; u.operational += 20; }
          } else if (lot.itemType === 'MANPADS') {
            draft.arsenal.abmShieldStrength = Math.min(100, draft.arsenal.abmShieldStrength + 10);
          } else if (lot.itemType === 'NUCLEAR_TRIGGERS') {
            draft.arsenal.nuclearCapable = true;
          } else if (lot.itemType === 'SATELLITE_JAMMERS') {
            draft.intelligence.signalIntelScore = Math.min(100, draft.intelligence.signalIntelScore + 15);
          }
        });

        useWorldStore.getState().addGlobalEvent(
          `INTELLIGENCE LEAK: Foreign nation ${winnerName} (${winnerId}) successfully procured illicit asset [${lot.id}] from black markets.`,
          'WARNING'
        );
      } else {
        useWorldStore.getState().addGlobalEvent(
          `BLACK MARKET: Auction Lot [${lot.id}] expired with zero active bidders. Item liquidated.`,
          'INFO'
        );
      }
    });
  },

  scheduleDelivery: (lotId, winnerId, currentTick) => {
    // scheduled automatically inside resolveExpiredLots
  },

  processDeliveries: (currentTick) => {
    const deliveriesToComplete: AuctionLot[] = [];

    set(produce((draft: BlackMarketState) => {
      draft.pendingDeliveries.forEach((del) => {
        if (del.deliveryTick !== null && currentTick >= del.deliveryTick) {
          del.status = 'DELIVERED';
          deliveriesToComplete.push({ ...del });
        }
      });
      draft.pendingDeliveries = draft.pendingDeliveries.filter(d => d.status !== 'DELIVERED');
    }));

    deliveriesToComplete.forEach((lot) => {
      const playerCountryId = usePlayerStore.getState().countryId || 'US';
      
      // Raise International Suspicion on Delivery
      get().increaseSuspicion(lot.suspicionOnWin);

      // Apply gameplay state modifications
      useWorldStore.getState().updateCountry(playerCountryId, (draft) => {
        switch (lot.itemType) {
          case 'CRUISE_MISSILE':
            // Add Cruise Missiles to player arsenal
            const cruiseUnit = draft.arsenal.units.find(u => u.type === 'CRUISE_MISSILE');
            if (cruiseUnit) {
              cruiseUnit.count += 30;
              cruiseUnit.operational += 30;
            }
            break;

          case 'MANPADS':
            // Boost ABM defense shield strength
            draft.arsenal.abmShieldStrength = Math.min(100, draft.arsenal.abmShieldStrength + 12);
            break;

          case 'SATELLITE_JAMMERS':
            // Blind satellites / improve signal intel
            draft.intelligence.signalIntelScore = Math.min(100, draft.intelligence.signalIntelScore + 20);
            break;

          case 'NUCLEAR_TRIGGERS':
            // Turn on nuclear capability
            draft.arsenal.nuclearCapable = true;
            break;
        }
      });

      // Synchronize player cash from country treasury after mod
      usePlayerStore.getState().syncCashFromCountry();

      useWorldStore.getState().addGlobalEvent(
        `CONTRABAND ARRIVAL: Consignment Lot [${lot.id}] (${lot.title}) successfully smuggled past board security! Global suspicion increased by +${lot.suspicionOnWin}%.`,
        'CRITICAL'
      );

      audio.sfxKlaxon();
    });
  },

  increaseSuspicion: (amount) => {
    set(produce((draft: BlackMarketState) => {
      const prevSuspicion = draft.internationalSuspicion;
      draft.internationalSuspicion = Math.min(100, draft.internationalSuspicion + amount);
      const newSuspicion = draft.internationalSuspicion;

      // Threshold crossing semantics
      if (newSuspicion > 60 && prevSuspicion <= 60 && !draft.unInvestigationTriggered) {
        draft.unInvestigationTriggered = true;
        
        // UN Investigation Event
        useWorldStore.getState().addGlobalEvent(
          `UN INVESTIGATION INITIATED: Evidence of systematic covert military smuggling detected. UN General Assembly votes to open formal weapons investigations on the Player's state!`,
          'CRITICAL'
        );
      }

      if (newSuspicion > 80 && prevSuspicion <= 80 && !draft.sanctionsTriggered) {
        draft.sanctionsTriggered = true;

        // Sanctions Event
        useWorldStore.getState().addGlobalEvent(
          `EMBARGO RESOLUTION PASSED: UN Security Council imposes severe tactical global economic sanctions. Major powers lock state commercial assets in retribution.`,
          'CRITICAL'
        );

        // Apply real economic sanctions from other major powers
        const playerCountryId = usePlayerStore.getState().countryId || 'US';
        const sanctioningPowers = ['US', 'CN', 'RU', 'GB', 'FR'].filter(id => id !== playerCountryId);
        
        useWorldStore.getState().updateCountry(playerCountryId, (cDraft) => {
          sanctioningPowers.forEach((powerId) => {
            if (!cDraft.economic.sanctionedBy.includes(powerId)) {
              cDraft.economic.sanctionedBy.push(powerId);
            }
          });
          // Shrink GDP rate as a direct penal multiplier
          cDraft.economic.gdpGrowthRate = Math.max(-0.15, cDraft.economic.gdpGrowthRate - 0.05);
        });

        // Trigger alarm
        audio.sfxKlaxon();
      }
    }));
  },

  decaySuspicion: () => {
    set(produce((draft: BlackMarketState) => {
      const prevSuspicion = draft.internationalSuspicion;
      draft.internationalSuspicion = Math.max(0, draft.internationalSuspicion - 1);
      const newSuspicion = draft.internationalSuspicion;

      // Reset threshold triggers if we clear below them
      if (newSuspicion <= 60 && prevSuspicion > 60) {
        draft.unInvestigationTriggered = false;
      }
      if (newSuspicion <= 80 && prevSuspicion > 80) {
        draft.sanctionsTriggered = false;
      }
    }));
  },

  getLiveLots: () => {
    return get().activeLots.filter(l => l.status === 'LIVE');
  },

  getPendingDeliveries: () => {
    return get().pendingDeliveries;
  },

  getPlayerBidForLot: (lotId) => {
    return get().playerBids[lotId] ?? 0;
  },

  tickMarket: (currentTick) => {
    // Execute full lifecycle step of Black Market on Tick:
    // 1. Evaluate new lot Spawning
    get().spawnLotsForTick(currentTick);
    
    // 2. Run ongoing AI decision bids
    get().runAIBidding(currentTick);

    // 3. Check for expired bids & winning determinations
    get().resolveExpiredLots(currentTick);

    // 4. Progress active smuggling deliveries (3-tick ETA)
    get().processDeliveries(currentTick);

    // 5. Decay global suspicion slowly every 2 ticks
    if (currentTick > 0 && currentTick % 2 === 0) {
      get().decaySuspicion();
    }
  },

  bootstrapStarterLots: (currentTick: number) => {
    const liveCount = get().activeLots.filter(l => l.status === 'LIVE').length;
    if (liveCount >= 3) return; // already populated

    const playerCountryId = usePlayerStore.getState().countryId || 'US';
    const allAIs = ['CN', 'RU', 'GB', 'FR', 'IL', 'IN', 'KP', 'JP'].filter(id => id !== playerCountryId);

    const starterLots: AuctionLot[] = [
      {
        id: `LOT-INIT-1`,
        itemType: 'MANPADS',
        title: 'FIM-92 Stinger Batch',
        description: 'Surplus military crates of surface-to-air shoulder-fired combat missile rigs. Deploys rapid air defense grid, increasing interception response (+12% ABM Shield Strength).',
        sellerTag: '[GRAY_MANTIS]',
        rarity: 'COMMON',
        basePrice: 18,
        currentBid: 18,
        currentLeaderId: null,
        spawnedAtTick: currentTick,
        expiresAtTick: currentTick + 15,
        status: 'LIVE',
        deliveryTick: null,
        suspicionOnWin: 8,
        aiInterestProfile: {
          baseDesire: 72,
          interestedAIs: allAIs.slice(0, 3)
        }
      },
      {
        id: `LOT-INIT-2`,
        itemType: 'SATELLITE_JAMMERS',
        title: 'Tirada-2S Mobile Jammer Matrix',
        description: 'Complex directed wave generator designed to overload satellite telemetry feeds and signal intelligence. Disables tracing channels and boosts intelligence signal cyber defense (+20 Signal Intel Score).',
        sellerTag: '[KRONOS_LABS]',
        rarity: 'RARE',
        basePrice: 42,
        currentBid: 42,
        currentLeaderId: null,
        spawnedAtTick: currentTick,
        expiresAtTick: currentTick + 18,
        status: 'LIVE',
        deliveryTick: null,
        suspicionOnWin: 15,
        aiInterestProfile: {
          baseDesire: 81,
          interestedAIs: allAIs.slice(1, 4)
        }
      },
      {
        id: `LOT-INIT-3`,
        itemType: 'NUCLEAR_TRIGGERS',
        title: 'Krytron Trigger-Array Assemblies',
        description: 'Co-axial gas-discharge tube switch structures required to ignite nuclear payloads simultaneously. Grants immediate status as a Nuclear-Capable military force.',
        sellerTag: '[OMEGA_NUCLEONICS]',
        rarity: 'RARE',
        basePrice: 85,
        currentBid: 85,
        currentLeaderId: null,
        spawnedAtTick: currentTick,
        expiresAtTick: currentTick + 22,
        status: 'LIVE',
        deliveryTick: null,
        suspicionOnWin: 30,
        aiInterestProfile: {
          baseDesire: 90,
          interestedAIs: allAIs.slice(2, 5)
        }
      },
      {
        id: `LOT-INIT-4`,
        itemType: 'CRUISE_MISSILE',
        title: 'BGM-109 Tomahawk Weapon Crate',
        description: 'Medium-range precision land-strike guided cruise missiles. Boosts standard missile stockpiles by 30 tactical units for instant bombardment operations.',
        sellerTag: '[SABRE_GROUP]',
        rarity: 'COMMON',
        basePrice: 28,
        currentBid: 28,
        currentLeaderId: null,
        spawnedAtTick: currentTick,
        expiresAtTick: currentTick + 12,
        status: 'LIVE',
        deliveryTick: null,
        suspicionOnWin: 12,
        aiInterestProfile: {
          baseDesire: 68,
          interestedAIs: allAIs.slice(3, 6)
        }
      }
    ];

    set(produce((draft: BlackMarketState) => {
      starterLots.forEach(lot => {
        if (!draft.activeLots.some(l => l.id === lot.id)) {
          draft.activeLots.push(lot);
        }
      });
    }));

    useWorldStore.getState().addGlobalEvent(
      `BLACK MARKET SEED: Curated procurement listings populated for initial tender. Channels verified.`,
      'WARNING'
    );
  },

  runSingleAICounterBid: (lotId: string) => {
    const worldStore = useWorldStore.getState();

    set(produce((draft: BlackMarketState) => {
      const lot = draft.activeLots.find(l => l.id === lotId);
      if (!lot || lot.status !== 'LIVE' || !lot.aiInterestProfile) return;

      // Select an AI country to bid
      const interested = [...lot.aiInterestProfile.interestedAIs].sort(() => Math.random() - 0.5);
      
      for (const aiId of interested) {
        const aiCountryObj = worldStore.countries[aiId];
        if (!aiCountryObj) continue;

        let desire = lot.aiInterestProfile.baseDesire;
        const isAtWar = aiCountryObj.atWarWith && aiCountryObj.atWarWith.length > 0;
        if (isAtWar) desire += 15;

        const treasury = aiCountryObj.economic.treasuryCashB;
        if (treasury > lot.basePrice * 3) {
          desire += 15;
        } else if (treasury < lot.currentBid) {
          desire -= 45;
        }

        // Add competitive pressure boost when reacting directly to a player bid
        desire += (Math.random() * 25 + 5);

        // Threshold check (65)
        if (desire > 65) {
          const nextBid = parseFloat((lot.currentBid * 1.1).toFixed(2));
          if (treasury >= nextBid && lot.currentLeaderId !== aiId) {
            const prevLeader = lot.currentLeaderId;
            lot.currentBid = nextBid;
            lot.currentLeaderId = aiId;

            if (prevLeader === 'PLAYER') {
              useWorldStore.getState().addGlobalEvent(
                `BLACK MARKET OUTBID: Player lost lead on Lot [${lot.id}] to competing bidder ${aiId}. High bid: $${nextBid.toFixed(2)}B.`,
                'WARNING'
              );
            }
            break; // Stop after first successful competitor outbids
          }
        }
      }
    }));
  },

  resetMarket: () => set({
    activeLots: [],
    playerBids: {},
    pendingDeliveries: [],
    internationalSuspicion: 0,
    unInvestigationTriggered: false,
    sanctionsTriggered: false
  })
}));
