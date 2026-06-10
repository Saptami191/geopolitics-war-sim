export interface BezierCurve {
  startX: number;
  startY: number;
  controlX: number;
  controlY: number;
  endX: number;
  endY: number;
}

export function getBezierPoint(bezier: BezierCurve, t: number) {
  const x = (1 - t) * (1 - t) * bezier.startX + 2 * (1 - t) * t * bezier.controlX + t * t * bezier.endX;
  const y = (1 - t) * (1 - t) * bezier.startY + 2 * (1 - t) * t * bezier.controlY + t * t * bezier.endY;
  return { x, y };
}
