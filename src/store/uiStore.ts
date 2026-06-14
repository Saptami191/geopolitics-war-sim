import { create } from 'zustand';
import { produce } from 'immer';
import { CountryHotspot } from '../types';
import { getHotspotsForCountry, SEEDED_HOTSPOTS } from '../data/hotspots';

export interface TerminalLine {
  id: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'SYSTEM';
  text: string;
}

export interface UIAlert {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'DANGER';
}

interface UIState {
  countryInspectorId: string | null;
  selectedCountryId: string | null;
  selectedHotspotId: string | null;
  strikeConfirmModalOpen: boolean;
  terminalLines: TerminalLine[];
  alerts: UIAlert[];
  expandedWorkstation: 'SATELLITE' | 'DRONE' | 'CYBER' | 'HAARP' | null;
}

interface UIStoreActions {
  setCountryInspector: (id: string | null) => void;
  setSelectedCountry: (id: string | null) => void;
  setSelectedHotspot: (id: string | null, countryId?: string | null) => void;
  clearSelectedHotspot: () => void;
  getHotspotsForCountry: (countryId: string) => CountryHotspot[];
  setStrikeConfirmModalOpen: (open: boolean) => void;
  pushTerminalLine: (text: string, type?: TerminalLine['type']) => void;
  clearTerminal: () => void;
  pushAlert: (alert: Omit<UIAlert, 'id'>) => void;
  dismissAlert: (id: string) => void;
  resetUI: () => void;
  setExpandedWorkstation: (workstation: 'SATELLITE' | 'DRONE' | 'CYBER' | 'HAARP' | null) => void;
}

export const useUIStore = create<UIState & UIStoreActions>((set, get) => ({
  countryInspectorId: null,
  selectedCountryId: null,
  selectedHotspotId: null,
  strikeConfirmModalOpen: false,
  expandedWorkstation: null,
  terminalLines: [
    { id: 'start_1', type: 'SYSTEM', text: 'Sovereign Command Simulator CLI v2.0-Alpha loaded.' },
    { id: 'start_2', type: 'INFO', text: 'Enter "/help" to list all available system operations.' }
  ],
  alerts: [],

  setCountryInspector: (id) => set({ 
    countryInspectorId: id, 
    selectedCountryId: id,
    selectedHotspotId: id === get().selectedCountryId ? get().selectedHotspotId : null 
  }),
  
  setSelectedCountry: (id) => set({ 
    selectedCountryId: id, 
    countryInspectorId: id,
    selectedHotspotId: id === get().selectedCountryId ? get().selectedHotspotId : null
  }),
  
  setSelectedHotspot: (id, countryId) => {
    if (id) {
      const hs = SEEDED_HOTSPOTS.find(h => h.id === id);
      const computedCountryId = countryId || hs?.countryId || null;
      set({
        selectedHotspotId: id,
        selectedCountryId: computedCountryId,
        countryInspectorId: computedCountryId
      });
    } else {
      set({ selectedHotspotId: null });
    }
  },
  
  clearSelectedHotspot: () => set({ selectedHotspotId: null }),
  
  getHotspotsForCountry: (countryId) => getHotspotsForCountry(countryId),

  setStrikeConfirmModalOpen: (open) => set({ strikeConfirmModalOpen: open }),
  setExpandedWorkstation: (workstation) => set({ expandedWorkstation: workstation }),

  pushTerminalLine: (text, type = 'INFO') => set(produce((draft) => {
    draft.terminalLines.push({
      id: Math.random().toString(),
      type: type,
      text: text,
    });
    if (draft.terminalLines.length > 300) {
      draft.terminalLines.shift();
    }
  })),

  clearTerminal: () => set({ terminalLines: [] }),

  pushAlert: (alert) => set(produce((draft) => {
    draft.alerts.push({
      id: Math.random().toString(),
      ...alert,
    });
  })),

  dismissAlert: (id) => set(produce((draft) => {
    draft.alerts = draft.alerts.filter((a: any) => a.id !== id);
  })),

  resetUI: () => set({
    countryInspectorId: null,
    strikeConfirmModalOpen: false,
    expandedWorkstation: null,
    terminalLines: [
      { id: 'start_reset', type: 'SYSTEM', text: 'Command interface recalibrated and cleared.' }
    ],
    alerts: [],
  }),
}));
