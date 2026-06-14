import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { DossierCard } from '../country/DossierCard';

export default function CountryInspector() {
  const inspectorId = useUIStore((s) => s.countryInspectorId);
  const setCountryInspector = useUIStore((s) => s.setCountryInspector);

  if (!inspectorId) return null;

  return (
    <DossierCard
      countryId={inspectorId}
      onClose={() => setCountryInspector(null)}
    />
  );
}
