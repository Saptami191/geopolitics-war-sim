import { create } from 'zustand';
import { useUIStore } from './uiStore';
import { usePlayerStore } from './playerStore';

export type AnalysisMode = 'MAP' | 'GRAPH' | 'TIMELINE' | 'SPLIT';
export type PresetFocusMode = 'STRATEGIC' | 'CONFLICT' | 'DIPLOMACY' | 'NUCLEAR' | 'ECONOMIC';

export interface AnalysisEdge {
  source: string;
  target: string;
  type: string;
}

export interface SavedInvestigation {
  id: string;
  name: string;
  selectedCountryId: string | null;
  selectedEdge: AnalysisEdge | null;
  presetFocusMode: PresetFocusMode;
  analysisMode: AnalysisMode;
  filterTypes: string[];
  timestamp: string;
}

interface LinkedAnalysisState {
  analysisMode: AnalysisMode;
  presetFocusMode: PresetFocusMode;
  selectedCountryId: string | null;
  selectedEdge: AnalysisEdge | null;
  selectedEventId: string | null;
  timeRange: [number, number] | null; // [minTick, maxTick]
  filterTypes: string[]; // e.g. ['STRIKE', 'SANCTION', 'DIPLOMACY', 'COVERT_OP']
  isMaximized: boolean;
  inspectorCollapsed: boolean;
  savedInvestigations: SavedInvestigation[];
  
  // Actions
  setAnalysisMode: (mode: AnalysisMode) => void;
  setPresetFocusMode: (preset: PresetFocusMode) => void;
  selectCountry: (countryId: string | null, source?: string) => void;
  selectEdge: (edge: AnalysisEdge | null) => void;
  selectEvent: (eventId: string | null) => void;
  setTimeRange: (range: [number, number] | null) => void;
  setFilterTypes: (types: string[]) => void;
  toggleFilterType: (type: string) => void;
  setIsMaximized: (val: boolean) => void;
  setInspectorCollapsed: (val: boolean) => void;
  resetAnalysisState: () => void;
  
  // Saved Investigation Management
  saveInvestigation: (name: string) => void;
  loadInvestigation: (id: string) => void;
  deleteInvestigation: (id: string) => void;
  renameInvestigation: (id: string, newName: string) => void;
}

export const useLinkedAnalysisStore = create<LinkedAnalysisState>((set, get) => ({
  analysisMode: 'MAP',
  presetFocusMode: 'STRATEGIC',
  selectedCountryId: null,
  selectedEdge: null,
  selectedEventId: null,
  timeRange: null,
  filterTypes: ['STRIKE', 'SANCTION', 'DIPLOMACY', 'COVERT_OP', 'RESEARCH', 'FISCAL', 'MARKET', 'SYSTEM', 'OTHER'],
  isMaximized: false,
  inspectorCollapsed: false,
  savedInvestigations: [
    {
      id: 'preset_meg',
      name: 'SUPERPOWER INTERCEPT NET',
      selectedCountryId: 'US',
      selectedEdge: null,
      presetFocusMode: 'STRATEGIC',
      analysisMode: 'MAP',
      filterTypes: ['STRIKE', 'SANCTION', 'DIPLOMACY', 'COVERT_OP', 'RESEARCH', 'FISCAL', 'MARKET', 'SYSTEM', 'OTHER'],
      timestamp: 'INITIAL',
    },
    {
      id: 'preset_as_co',
      name: 'TACTICAL FLASHPOINT FOCUS',
      selectedCountryId: null,
      selectedEdge: { source: 'RU', target: 'CH', type: 'DIPLOMACY' },
      presetFocusMode: 'CONFLICT',
      analysisMode: 'GRAPH',
      filterTypes: ['STRIKE', 'SANCTION', 'COVERT_OP'],
      timestamp: 'INITIAL',
    }
  ],

  setAnalysisMode: (mode) => set({ analysisMode: mode }),
  
  setPresetFocusMode: (preset) => {
    set({ presetFocusMode: preset });
    
    // Auto-adjust filters and layers based on the preset focus
    switch (preset) {
      case 'STRATEGIC':
        set({
          filterTypes: ['STRIKE', 'SANCTION', 'DIPLOMACY', 'COVERT_OP', 'RESEARCH', 'FISCAL', 'MARKET', 'SYSTEM', 'OTHER'],
        });
        break;
      case 'CONFLICT':
        set({
          filterTypes: ['STRIKE', 'SANCTION', 'COVERT_OP'],
        });
        break;
      case 'DIPLOMACY':
        set({
          filterTypes: ['DIPLOMACY', 'FISCAL', 'SYSTEM'],
        });
        break;
      case 'NUCLEAR':
        set({
          filterTypes: ['STRIKE', 'SYSTEM'],
        });
        break;
      case 'ECONOMIC':
        set({
          filterTypes: ['SANCTION', 'MARKET', 'FISCAL'],
        });
        break;
    }
  },

  selectCountry: (countryId, source = 'workspace') => {
    set({ selectedCountryId: countryId, selectedEdge: null });

    // Sync with other existing stores to coordinate UI Inspector boards
    if (countryId) {
      const hudMode = usePlayerStore.getState().hudMode;
      const playerCountryId = usePlayerStore.getState().countryId;

      if (hudMode === 'WAR_ROOM' && countryId !== playerCountryId) {
        usePlayerStore.getState().setTargetCountry(countryId);
      } else {
        useUIStore.getState().setCountryInspector(countryId);
      }
    } else {
      useUIStore.getState().setCountryInspector(null);
    }
  },

  selectEdge: (edge) => set({ selectedEdge: edge, selectedCountryId: null, selectedEventId: null }),

  selectEvent: (eventId) => {
    set({ selectedEventId: eventId });
  },

  setTimeRange: (range) => set({ timeRange: range }),

  setFilterTypes: (types) => set({ filterTypes: types }),

  toggleFilterType: (type) => {
    const current = get().filterTypes;
    if (current.includes(type)) {
      set({ filterTypes: current.filter((t) => t !== type) });
    } else {
      set({ filterTypes: [...current, type] });
    }
  },

  setIsMaximized: (val) => set({ isMaximized: val }),
  setInspectorCollapsed: (val) => set({ inspectorCollapsed: val }),

  resetAnalysisState: () => set({
    analysisMode: 'MAP',
    presetFocusMode: 'STRATEGIC',
    selectedCountryId: null,
    selectedEdge: null,
    selectedEventId: null,
    timeRange: null,
    filterTypes: ['STRIKE', 'SANCTION', 'DIPLOMACY', 'COVERT_OP', 'RESEARCH', 'FISCAL', 'MARKET', 'SYSTEM', 'OTHER'],
    isMaximized: false,
    inspectorCollapsed: false,
  }),

  saveInvestigation: (name) => {
    const current = get();
    const newRecord: SavedInvestigation = {
      id: `inv_${Math.random().toString().substring(2, 9)}`,
      name: name.toUpperCase() || 'UNNAMED INTEL OVERVIEW',
      selectedCountryId: current.selectedCountryId,
      selectedEdge: current.selectedEdge,
      presetFocusMode: current.presetFocusMode,
      analysisMode: current.analysisMode,
      filterTypes: [...current.filterTypes],
      timestamp: new Date().toLocaleTimeString(),
    };
    set({ savedInvestigations: [newRecord, ...current.savedInvestigations] });
  },

  loadInvestigation: (id) => {
    const target = get().savedInvestigations.find((inv) => inv.id === id);
    if (target) {
      set({
        selectedCountryId: target.selectedCountryId,
        selectedEdge: target.selectedEdge,
        presetFocusMode: target.presetFocusMode,
        analysisMode: target.analysisMode,
        filterTypes: [...target.filterTypes],
      });
      // Synchronize back to standard widgets
      if (target.selectedCountryId) {
        useUIStore.getState().setCountryInspector(target.selectedCountryId);
      } else {
        useUIStore.getState().setCountryInspector(null);
      }
    }
  },

  deleteInvestigation: (id) => {
    set({
      savedInvestigations: get().savedInvestigations.filter((inv) => inv.id !== id),
    });
  },

  renameInvestigation: (id, newName) => {
    set({
      savedInvestigations: get().savedInvestigations.map((inv) =>
        inv.id === id ? { ...inv, name: newName.toUpperCase() } : inv
      ),
    });
  },
}));
