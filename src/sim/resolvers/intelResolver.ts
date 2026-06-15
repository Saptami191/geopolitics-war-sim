import { CanonicalWorld, IntelFact } from '../../types';

export function resolveIntel(world: CanonicalWorld, currentTick: number): { updatedIntel: Record<string, IntelFact>; logs: string[] } {
  const updatedIntel = { ...world.intelFactsById };
  const logs: string[] = [];

  Object.keys(updatedIntel).forEach((id) => {
    const report = { ...updatedIntel[id] };

    // Freshness & confidence degradation over time
    if (report.confidence > 20) {
      report.confidence = Math.max(10, report.confidence - (Math.random() > 0.4 ? 1 : 0));
    }

    // Expiration checks
    if (report.expiresTick !== null && currentTick >= report.expiresTick) {
      report.visibilityScope = 'CLASSIFIED'; // Retracted or archived
      if (Math.random() < 0.1) {
        logs.push(`Intel Expiry: Intelligence intercept "${report.title}" is now considered legacy stale data.`);
      }
    }

    // Interactive verification or disputes
    if (report.disputed && Math.random() < 0.08) {
      report.disputed = false;
      report.verified = true;
      report.confidence = Math.min(100, report.confidence + 15);
      logs.push(`Intel Verification: SIGINT/IMINT reconciliation verified disputed truth of "${report.title}".`);
    }

    updatedIntel[id] = report;
  });

  return { updatedIntel, logs };
}
