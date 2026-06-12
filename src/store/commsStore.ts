import { create } from 'zustand';
import { produce } from 'immer';
import { audio } from '../utils/audio';

export interface CommsMessage {
  id: string;
  source: string;
  senderTitle: string;
  channel: 'STAFF_CHAT' | 'ADVISORY_CABLE' | 'INTELLIGENCE_TIP' | 'URGENT_NOTICE';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  text: string;
  tick: number;
  timestamp: string;
  isNew: boolean;
}

interface CommsState {
  comms: CommsMessage[];
  unreadCount: number;
  activeChannelFilter: 'ALL' | 'STAFF_CHAT' | 'ADVISORY_CABLE' | 'INTELLIGENCE_TIP' | 'URGENT_NOTICE';
  isMuted: boolean;
}

interface CommsActions {
  pushCommsMessage: (message: Omit<CommsMessage, 'id' | 'timestamp' | 'isNew'>) => void;
  markAllAsRead: () => void;
  setChannelFilter: (filter: CommsState['activeChannelFilter']) => void;
  toggleMute: () => void;
  clearComms: () => void;
}

export const useCommsStore = create<CommsState & CommsActions>((set, get) => ({
  comms: [
    {
      id: 'start_comms_1',
      source: 'CHIEF OF STAFF',
      senderTitle: 'Chief of Staff',
      channel: 'STAFF_CHAT',
      severity: 'INFO',
      text: 'Executive terminal established. Staff advisers are standing by on active encryption channels.',
      tick: 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isNew: false
    }
  ],
  unreadCount: 0,
  activeChannelFilter: 'ALL',
  isMuted: audio.getMute(),

  pushCommsMessage: (message) => set(produce((draft: CommsState) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const id = `comms_${Math.random().toString(36).substr(2, 9)}`;
    
    draft.comms.unshift({
      ...message,
      id,
      timestamp: timeStr,
      isNew: true
    });

    draft.unreadCount += 1;

    // Direct sound play mapped to severity
    if (!draft.isMuted) {
      if (message.severity === 'CRITICAL') {
        const t = message.text.toLowerCase();
        if (t.includes('missile') || t.includes('warning') || t.includes('target') || t.includes('trajectory')) {
          audio.sfxKlaxon();
        } else {
          audio.sfxCrisisWarning();
        }
      } else if (message.severity === 'WARNING') {
        audio.sfxCrisisWarning();
      } else {
        // Double-check if success event
        const isSuccess = message.text.toLowerCase().includes('success') || 
                          message.text.toLowerCase().includes('accomplished') || 
                          message.text.toLowerCase().includes('breakthrough') || 
                          message.text.toLowerCase().includes('ratified') ||
                          message.text.toLowerCase().includes('formalized') ||
                          message.text.toLowerCase().includes('seized');
        if (isSuccess) {
          audio.sfxSuccessConfirmation();
        } else {
          audio.sfxIntelChime();
        }
      }
    }

    // Keep active log sized reasonably
    if (draft.comms.length > 200) {
      draft.comms.pop();
    }
  })),

  markAllAsRead: () => set(produce((draft: CommsState) => {
    draft.comms.forEach(c => c.isNew = false);
    draft.unreadCount = 0;
  })),

  setChannelFilter: (filter) => set({ activeChannelFilter: filter }),

  toggleMute: () => set((state) => {
    const nextMuted = !state.isMuted;
    audio.setMute(nextMuted);
    return { isMuted: nextMuted };
  }),

  clearComms: () => set({
    comms: [],
    unreadCount: 0
  })
}));

/**
 * Maps standard low-level system logs into atmospheric dialogue lines representing realistic advisors.
 */
export function generateCommsFromLog(text: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SYSTEM', tick: number): Omit<CommsMessage, 'id' | 'timestamp' | 'isNew'> | null {
  const t = text.toLowerCase();

  // 1. Orbital imaging
  if (t.includes('orbital recon') || t.includes('satellite') || t.includes('radar-sat')) {
    return {
      source: 'COSMIC RECON MASTER (SAT-6)',
      senderTitle: 'Reconnaissance Intelligence Officer',
      channel: 'INTELLIGENCE_TIP',
      severity: 'INFO',
      text: 'Imaging lock acquired. Target thermal telemetry vectors are successfully streaming down to early warning systems.',
      tick
    };
  }

  // 2. Covert operations assigned
  if (t.includes('signals command') || t.includes('covert op assigned')) {
    return {
      source: 'SPECIAL FIELD INFILTRATION CELL',
      senderTitle: 'Signals Reconnaissance Lead',
      channel: 'INTELLIGENCE_TIP',
      severity: 'WARNING',
      text: 'Decoy relays and decrypt boxes are deployed. Active infiltration networks are tapping target communications nodes.',
      tick
    };
  }

  // 3. Commodity investment
  if (t.includes('futures client locks') || t.includes('futures')) {
    return {
      source: 'SOCIETY OF SOVEREIGN WEALTH',
      senderTitle: 'Risk Auditor',
      channel: 'ADVISORY_CABLE',
      severity: 'INFO',
      text: 'Futures positions secured. Capital hedging models successfully isolated our domestic reserves from immediate spot-price shocks.',
      tick
    };
  }

  // 4. Commodity shorting
  if (t.includes('short positions opened') || t.includes('short position')) {
    return {
      source: 'DEFENSE ENERGY TRADING BOARD',
      senderTitle: 'Energy Broker',
      channel: 'ADVISORY_CABLE',
      severity: 'INFO',
      text: 'Hedge shorts established. Derivative margin accounts credited to guard sovereign liquidity index parameters.',
      tick
    };
  }

  // 5. Sanctions Applied
  if (t.includes('strict trade embargo') || t.includes('imposes strict trade embargo')) {
    return {
      source: 'MINISTRY OF GLOBAL TRADE RELATIONS',
      senderTitle: 'Foreign Commerce Envoy',
      channel: 'ADVISORY_CABLE',
      severity: 'WARNING',
      text: 'Trade embargo successfully enacted. We have instructed deepwater port patrols and border authorities to halt and impound target ships.',
      tick
    };
  }

  // 6. Easing sanctions
  if (t.includes('eases sanctions')) {
    return {
      source: 'CHANCERY OF COMMERCE & PROTOCOLS',
      senderTitle: 'Diplomatic Trade Plenipotentiary',
      channel: 'ADVISORY_CABLE',
      severity: 'INFO',
      text: 'Commercial blockade lifted. Merchant tankers and container cargo networks cleared to resume transit corridors.',
      tick
    };
  }

  // 7. Academic upgrade
  if (t.includes('technology upgrade') || t.includes('researchers deployed')) {
    return {
      source: 'DIRECTORATE OF ADVANCED BLUEPRINTS',
      senderTitle: 'Sovereign Projects Chief',
      channel: 'STAFF_CHAT',
      severity: 'INFO',
      text: 'Core milestone accomplished! Advanced system blueprints have achieved full command authorization. Systems are rolling out.',
      tick
    };
  }

  // 8. Sovereign budget approved
  if (t.includes('fiscal command') || t.includes('budget plan approved')) {
    return {
      source: 'TREASURY INTERNAL CONTROL OFFICE',
      senderTitle: 'Budget Director',
      channel: 'STAFF_CHAT',
      severity: 'INFO',
      text: 'Sovereign capital reallocation successfully executed. Sector accounts re-budgeted to reflect new executive directives.',
      tick
    };
  }

  // 9. Martial law
  if (t.includes('martial law') || t.includes('martial decree invoked')) {
    return {
      source: 'HIGH OFFICE OF HOME LAND POLICE',
      senderTitle: 'Marshal General Commandant',
      channel: 'URGENT_NOTICE',
      severity: 'WARNING',
      text: 'FEDERAL MARTIAL DECREE ENFORCED: Civilians quarantined, communication lines intercepted, and tactical teams assigned to public sectors.',
      tick
    };
  }

  // 10. Oligarch purge
  if (t.includes('decrease') && t.includes('expels') || t.includes('expels industry')) {
    return {
      source: 'NATIONAL ASSET FORFEITURE DIVISION',
      senderTitle: 'Executive Prosecuting Marshal',
      channel: 'ADVISORY_CABLE',
      severity: 'WARNING',
      text: 'Decree executed. Police units have occupied corrupt offshore properties and seized corporate bank balances.',
      tick
    };
  }

  // 11. Cabinet restructuring
  if (t.includes('cabinet reshuffle') || t.includes('new appointee')) {
    return {
      source: 'CHIEF REGISTRAR OF CABINET SYSTEMS',
      senderTitle: 'Chief of Staff',
      channel: 'STAFF_CHAT',
      severity: 'INFO',
      text: 'Cabinet reshuffling process complete; files transferred. Appointed target ministers have assumed sovereign desks.',
      tick
    };
  }

  // 12. Policy rate change
  if (t.includes('policy rate adjusted') || t.includes('central bank: policy')) {
    return {
      source: 'CENTRAL SINK FINANCIAL BOARD',
      senderTitle: 'Liquidity Control Manager',
      channel: 'STAFF_CHAT',
      severity: 'INFO',
      text: 'Policy interest rate update completed. Recalibrating capital yield matrices to contain inflation index projections.',
      tick
    };
  }

  // 13. Bond issuance
  if (t.includes('bond desk') || t.includes('sovereign treasury bills')) {
    return {
      source: 'TREASURY REVENUE DEBT DESK',
      senderTitle: 'Capital Markets Specialist',
      channel: 'ADVISORY_CABLE',
      severity: 'INFO',
      text: 'Auditor reports treasury bill placements settled. Sovereign bond portfolios liquidated; credit reserves injected.',
      tick
    };
  }

  // 14. Financial Default
  if (t.includes('default protocol') || t.includes('defaults on sovereign obligations')) {
    return {
      source: 'CREDIT INDEX AUDITING TEAM',
      senderTitle: 'Sovereign Debt Auditor',
      channel: 'URGENT_NOTICE',
      severity: 'CRITICAL',
      text: 'CRITICAL EVENT: COMMODITY DEFAULT LOGGED. Bond ratings downgraded to speculative junk status. Capital fleeing accounts.',
      tick
    };
  }

  // 15. Black markets
  if (t.includes('black market') || t.includes('ordnance') || t.includes('blackmarket')) {
    return {
      source: 'COVERT SUPPLY SQUAD',
      senderTitle: 'Logistics Quartermaster',
      channel: 'STAFF_CHAT',
      severity: 'INFO',
      text: 'Unlisted black-market crates received and unloaded. Kinetic munitions updated and routed to elite strike teams.',
      tick
    };
  }

  // 16. Silo launches
  if (t.includes('war clerk') && t.includes('fired') || t.includes('launch order authorized')) {
    return {
      source: 'SOVEREIGN AEROSPACE MISSILE COMMAND',
      senderTitle: 'Chief Launch Commander',
      channel: 'URGENT_NOTICE',
      severity: 'CRITICAL',
      text: 'DIRECTIVE TRIGGERED: TACTICAL ORDNANCE AIRBORNE! Silo pressure seals blown, nuclear velocity nominal, warheads locked.',
      tick
    };
  }

  // 17. Propellant reload
  if (t.includes('propellant') && t.includes('charge')) {
    return {
      source: 'SILO RE-PRESSURIZATION CELL',
      senderTitle: 'Silo Launch Architect',
      channel: 'STAFF_CHAT',
      severity: 'INFO',
      text: 'Silo pressure reserves re-established. Silo fuel cores fully charged and locked at maximum responsive standby states.',
      tick
    };
  }

  // 18. Diplomatic aid delivered
  if (t.includes('direct aid dispatched') || t.includes('direct economic aid') || t.includes('aid dispatch')) {
    return {
      source: 'FOREIGN DEVELOPMENT AGENCY',
      senderTitle: 'Direct Aid Coordinator',
      channel: 'ADVISORY_CABLE',
      severity: 'INFO',
      text: 'Direct aid dispatch completed. Financial coordinates and infrastructure shipments successfully registered on target ledger.',
      tick
    };
  }

  // 19. Blockade decrees
  if (t.includes('blockade decree') || t.includes('placed aggregate sanctions')) {
    return {
      source: 'EMBARGO ADMINISTRATION DESK',
      senderTitle: 'Sanctions Specialist',
      channel: 'ADVISORY_CABLE',
      severity: 'WARNING',
      text: 'Comprehensive commercial blockades validated. Shipping lanes and customs records locked down to choke trade velocity.',
      tick
    };
  }

  // 20. Defensive pacts
  if (t.includes('treaty ratified') || t.includes('signed mutual defense') || t.includes('treaty signed')) {
    return {
      source: 'OFFICE OF INTER-STATE TREATIES',
      senderTitle: 'Special Chancellery Counselor',
      channel: 'STAFF_CHAT',
      severity: 'INFO',
      text: 'Mutual defensive alliance treaty sealed. Technical communication channels established for shared threat warning grids.',
      tick
    };
  }

  // 21. Drone kinetic payload strike
  if (t.includes('drone command') || t.includes('launched kinetic paystrike')) {
    return {
      source: 'TACTICAL SENTINEL FLIGHT SQUAD',
      senderTitle: 'Sovereign Drone Commander',
      channel: 'URGENT_NOTICE',
      severity: 'CRITICAL',
      text: 'Sentinel kinetic payoff strike executed. Direct thermal impact confirmed; hostile threat coordinates wiped.',
      tick
    };
  }

  // 22. Strike targeting
  if (t.includes('target locked') || t.includes('strike target')) {
    return {
      source: 'CHIEF OF GEOMETRIC MATRIX ARRAYS',
      senderTitle: 'Targeting Coordinator',
      channel: 'STAFF_CHAT',
      severity: 'WARNING',
      text: 'Target coordinates entered and locked down. Aerospace vectors secured, awaiting launch authorize key input.',
      tick
    };
  }

  // 23. Ballistic threat detected
  if (t.includes('tactical warning') || t.includes('ballistic target trace') || t.includes('airspace!')) {
    return {
      source: 'AEROSPACE MISSILE INTERCEPT COORDINATE',
      senderTitle: 'Early Warning Officer',
      channel: 'URGENT_NOTICE',
      severity: 'CRITICAL',
      text: 'IMMEDIATE BALLISTIC WARNING: INCOMING TRAJECTORIES DETECTED IN ACTIVE AIRSPACE! Trajectory profiles tracking launch source.',
      tick
    };
  }

  // 24. Decryption/Signals scanning
  if (t.includes('covert operational network') || t.includes('signals scanning')) {
    return {
      source: 'SIGNALS INTELLIGENCE DESK',
      senderTitle: 'Signals Decryption Specialist',
      channel: 'INTELLIGENCE_TIP',
      severity: 'INFO',
      text: 'Operational decrypted data logged. Signals scanning active to intercept threat updates and leaks.',
      tick
    };
  }

  // 25. Sovereign money printing
  if (t.includes('printing press') || t.includes('currency press active')) {
    return {
      source: 'METRIC RESERVE CURRENCY OFFICE',
      senderTitle: 'Sovereign Currency Controller',
      channel: 'STAFF_CHAT',
      severity: 'INFO',
      text: 'Sovereign print operations active. Strategic currency expansion in progress. Risk indexes updated.',
      tick
    };
  }

  // SYSTEM, debug, scenario won, scenario lost, or unhandled
  if (t.includes('scenario accomplished') || t.includes('campaign accomplished')) {
    return {
      source: 'SUPREME OPERATIONS DIRECTORATE',
      senderTitle: 'Sovereign Secretariat',
      channel: 'URGENT_NOTICE',
      severity: 'INFO',
      text: `DIRECTIVE TASK ACCOMPLISHED: Core campaign milestones successfully registered. Secure history logged.`,
      tick
    };
  }

  if (t.includes('scenario fiasco') || t.includes('system defeated')) {
    return {
      source: 'SUPREME OPERATIONS DIRECTORATE',
      senderTitle: 'Sovereign Secretariat',
      channel: 'URGENT_NOTICE',
      severity: 'CRITICAL',
      text: `CRITICAL DEFEAT REPORTED: National command networks compromised. Executive controls severed.`,
      tick
    };
  }

  // Generic fallback if severity is high or the event is interesting enough
  const cleanSev = severity === 'SYSTEM' ? 'INFO' : severity;
  return {
    source: 'SOCIETY FOR JOINT TACTICAL CONTEXT',
    senderTitle: 'Strategic Advisor',
    channel: 'ADVISORY_CABLE',
    severity: cleanSev,
    text: `Core operations log registered: "${text}"`,
    tick
  };
}
