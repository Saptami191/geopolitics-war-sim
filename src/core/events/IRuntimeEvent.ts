export enum RuntimeEventType {
  SimulationStarted = 'SimulationStarted',
  SimulationPaused = 'SimulationPaused',
  SimulationResumed = 'SimulationResumed',
  SimulationTickCompleted = 'SimulationTickCompleted',
  SimulationStopped = 'SimulationStopped'
}

export interface IRuntimeEvent {
  type: RuntimeEventType;
  payload?: any;
}
