export type LayerKey =
  | 'political'
  | 'military'
  | 'conflicts'
  | 'economic'
  | 'nuclear'
  | 'cyber'
  | 'population'
  | 'isr'
  | 'radar'
  | 'logistics'
  | 'traces';

export interface LayerToggleState {
  political: boolean;
  military: boolean;
  conflicts: boolean;
  economic: boolean;
  nuclear: boolean;
  cyber: boolean;
  population: boolean;
  isr?: boolean;
  radar?: boolean;
  logistics?: boolean;
  traces?: boolean;
}
