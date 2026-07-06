import * as THREE from 'three';
import { latLonToVec3 } from '../../intro/GlobeMarkers';
import { RendererFrame, RendererFrameUnit } from '../../../renderer/frame/RendererFrame';
import {
  createProceduralCarrier,
  createProceduralSubmarine,
  createProceduralFighter,
  createProceduralMissile,
  WakeSystemManager,
  BubbleSystemManager,
} from '../MilitaryAsset3D';

/**
 * Enhanced class that manages 3D representation, movement interpolation,
 * orientation, particle effects, and status highlights of military units.
 * Consumes the serializable RendererFrame.
 */
export class UnitRenderer {
  private group: THREE.Group;
  private unitMeshes: Map<string, THREE.Object3D> = new Map();
  private prevPositions: Record<string, THREE.Vector3> = {};
  private prevHeadings: Record<string, THREE.Vector3> = {};
  private jetRolls: Record<string, number> = {};
  private subAltitudes: Record<string, number> = {};

  // Track dynamic particle systems
  private wakes: Record<string, WakeSystemManager> = {};
  private bubbles: Record<string, BubbleSystemManager> = {};

  constructor(group: THREE.Group) {
    this.group = group;
  }

  /** Update meshes based on the latest RendererFrame */
  update(frame: RendererFrame) {
    const units = frame.units;
    const currentIds = new Set(Object.keys(units));

    // Remove meshes & particle systems for units that no longer exist
    for (const [id, mesh] of this.unitMeshes.entries()) {
      if (!currentIds.has(id)) {
        this.group.remove(mesh);
        this.disposeObject(mesh);
        this.unitMeshes.delete(id);

        if (this.wakes[id]) {
          this.group.remove(this.wakes[id].getMesh());
          this.wakes[id].destroy();
          delete this.wakes[id];
        }
        if (this.bubbles[id]) {
          this.group.remove(this.bubbles[id].getMesh());
          this.bubbles[id].destroy();
          delete this.bubbles[id];
        }
      }
    }

    // Add or update existing units
    for (const [id, unit] of Object.entries(units)) {
      const existing = this.unitMeshes.get(id);
      const targetPos = this.getUnitPosition(unit, frame);

      if (!existing) {
        // Create new mesh
        const mesh = this.createMeshForUnit(unit);
        mesh.position.copy(targetPos);
        this.group.add(mesh);
        this.unitMeshes.set(id, mesh);
        this.prevPositions[id] = targetPos.clone();
      } else {
        // 1. Altitude calculation based on class and movement state
        let targetAltitude = 0;
        if (unit.type === 'Submarine') {
          const status = unit.status;
          const targetDepthOffset = (status === 'MOVING') ? -0.015 : 0.003;
          let currentDepth = this.subAltitudes[id];
          if (currentDepth === undefined) currentDepth = targetDepthOffset;
          currentDepth += (targetDepthOffset - currentDepth) * 0.05; // Smooth depth transition
          this.subAltitudes[id] = currentDepth;
          targetAltitude = currentDepth;
        }

        const normal = targetPos.clone().normalize();
        const interpTarget = targetPos.clone().addScaledVector(normal, targetAltitude);
        const lastPos = existing.position.clone();

        // 2. Smooth continuous coordinate slide (lerp)
        existing.position.lerp(interpTarget, 0.08);

        // 3. Directional movement orientation and banking calculations
        const motionVec = existing.position.clone().sub(this.prevPositions[id] || lastPos);
        const normalVec = existing.position.clone().normalize();

        if (motionVec.lengthSq() > 1e-8) {
          const forward = motionVec.clone().projectOnPlane(normalVec).normalize();
          const right = new THREE.Vector3().crossVectors(forward, normalVec).normalize();
          const up = new THREE.Vector3().crossVectors(right, forward).normalize();

          const rotMatrix = new THREE.Matrix4().makeBasis(right, up, forward);
          existing.quaternion.setFromRotationMatrix(rotMatrix);

          const prevHeading = this.prevHeadings[id] || forward.clone();

          // Apply Fighter banking / rolling
          if (unit.type === 'AirWing') {
            const cross = prevHeading.clone().cross(forward);
            const dot = cross.dot(normalVec);
            const turnAngle = prevHeading.angleTo(forward) * (dot > 0 ? 1 : -1);
            const targetRoll = THREE.MathUtils.clamp(turnAngle * 22.0, -Math.PI / 4, Math.PI / 4);

            let currentRoll = this.jetRolls[id] || 0;
            currentRoll += (targetRoll - currentRoll) * 0.12;
            this.jetRolls[id] = currentRoll;

            existing.rotateOnAxis(new THREE.Vector3(0, 0, 1), currentRoll);
          }

          // Emit Carrier wakes
          if (unit.type === 'CarrierGroup') {
            if (!this.wakes[id]) {
              this.wakes[id] = new WakeSystemManager();
              this.group.add(this.wakes[id].getMesh());
            }
            this.wakes[id].emit(existing.position, forward);
          }

          // Emit Submarine bubbles
          if (unit.type === 'Submarine') {
            if (!this.bubbles[id]) {
              this.bubbles[id] = new BubbleSystemManager();
              this.group.add(this.bubbles[id].getMesh());
            }
            this.bubbles[id].emit(existing.position, forward);
          }

          this.prevHeadings[id] = forward.clone();
        } else {
          // Stationary heading alignment
          const up = normalVec.clone();
          const right = new THREE.Vector3(1, 0, 0).projectOnPlane(up).normalize();
          const forward = new THREE.Vector3().crossVectors(up, right).normalize();
          const rotMatrix = new THREE.Matrix4().makeBasis(right, up, forward);
          existing.quaternion.setFromRotationMatrix(rotMatrix);
        }

        // Apply health-based emissive glow color coding
        existing.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
              if (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhongMaterial) {
                // Dim down status lights or change emission depending on damage
                const healthPct = (unit.health ?? 100) / 100;
                if (healthPct < 0.5) {
                  // High damage indicator (dim red warning beacon)
                  m.emissive.setHex(0x3a0000);
                  m.emissiveIntensity = 0.5;
                } else {
                  m.emissiveIntensity = 1.0;
                }
              }
            });
          }
        });

        this.prevPositions[id] = existing.position.clone();
      }
    }

    // Update active particle systems
    Object.values(this.wakes).forEach((w) => w.update());
    Object.values(this.bubbles).forEach((b) => b.update());
  }

  /** Resolve world position for a unit */
  private getUnitPosition(unit: RendererFrameUnit, frame: RendererFrame): THREE.Vector3 {
    if (unit.position?.lat !== undefined && unit.position?.lon !== undefined) {
      const isAir = unit.type === 'AirWing';
      const baseRadius = isAir ? 1.055 : 1.018;
      return latLonToVec3(unit.position.lat, unit.position.lon, baseRadius);
    }
    // Fallback to owner country's centroid
    const ownerCentroid = frame.countries[unit.owner]?.centroid;
    if (ownerCentroid) {
      return latLonToVec3(ownerCentroid[1], ownerCentroid[0], 1.018);
    }
    return new THREE.Vector3();
  }

  /** Create mesh based on unit type */
  private createMeshForUnit(unit: RendererFrameUnit): THREE.Object3D {
    switch (unit.type) {
      case 'CarrierGroup':
        return createProceduralCarrier();
      case 'Submarine':
        return createProceduralSubmarine();
      case 'Fighter':
      case 'AirWing':
        return createProceduralFighter();
      case 'Missile':
      case 'ICBMSilo':
        return createProceduralMissile();
      case 'GroundForce':
      case 'SpecForce':
      default:
        // Simple placeholder geometry
        const geo = new THREE.SphereGeometry(0.05, 12, 8);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x88ff44,
          emissive: 0x224400,
          transparent: true,
          opacity: 0.9,
        });
        return new THREE.Mesh(geo, mat);
    }
  }

  /** Dispose of geometry and material resources */
  private disposeObject(obj: THREE.Object3D) {
    obj.traverse((child) => {
      if ((child as any).geometry) {
        (child as any).geometry.dispose();
      }
      if ((child as any).material) {
        const mat = (child as any).material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose());
        } else {
          mat.dispose();
        }
      }
    });
  }

  /** Cleanup all meshes and particle systems */
  dispose() {
    for (const mesh of this.unitMeshes.values()) {
      this.group.remove(mesh);
      this.disposeObject(mesh);
    }
    this.unitMeshes.clear();

    Object.values(this.wakes).forEach((w) => {
      this.group.remove(w.getMesh());
      w.destroy();
    });
    Object.values(this.bubbles).forEach((b) => {
      this.group.remove(b.getMesh());
      b.destroy();
    });
    this.wakes = {};
    this.bubbles = {};
  }
}
