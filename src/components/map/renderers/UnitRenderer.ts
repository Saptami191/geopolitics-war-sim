import * as THREE from 'three';
import { Unit, CanonicalMapState } from '../../types';
import { latLonToVec3 } from '../intro/GlobeMarkers';
import {
  createProceduralCarrier,
  createProceduralSubmarine,
  createProceduralFighter,
  createProceduralMissile,
} from './MilitaryAsset3D';

/**
 * Helper class that manages 3D representation of military units.
 * It diffs the incoming CanonicalMapState.units map against its internal cache
 * and creates/updates/disposes meshes accordingly.
 */
export class UnitRenderer {
  private group: THREE.Group;
  private unitMeshes: Map<string, THREE.Object3D> = new Map();

  constructor(group: THREE.Group) {
    this.group = group;
  }

  /** Update meshes based on the latest state */
  update(state: CanonicalMapState) {
    const units = state.units;
    const currentIds = new Set(Object.keys(units));

    // Remove meshes for units that no longer exist
    for (const [id, mesh] of this.unitMeshes.entries()) {
      if (!currentIds.has(id)) {
        this.group.remove(mesh);
        this.disposeObject(mesh);
        this.unitMeshes.delete(id);
      }
    }

    // Add or update existing units
    for (const [id, unit] of Object.entries(units)) {
      const existing = this.unitMeshes.get(id);
      const position = this.getUnitPosition(unit, state);
      if (!existing) {
        const mesh = this.createMeshForUnit(unit);
        mesh.position.copy(position);
        this.group.add(mesh);
        this.unitMeshes.set(id, mesh);
      } else {
        // Update position only if changed
        if (!existing.position.equals(position)) {
          existing.position.copy(position);
        }
      }
    }
  }

  /** Resolve world position for a unit */
  private getUnitPosition(unit: Unit, state: CanonicalMapState): THREE.Vector3 {
    if (unit.position?.lat !== undefined && unit.position?.lon !== undefined) {
      return latLonToVec3(unit.position.lat, unit.position.lon, 1.001);
    }
    // Fallback to owner country's centroid
    const ownerCentroid = state.countries[unit.owner]?.centroid;
    if (ownerCentroid) {
      return latLonToVec3(ownerCentroid[1], ownerCentroid[0], 1.001);
    }
    // Default to origin if all else fails
    return new THREE.Vector3();
  }

  /** Create mesh based on unit type */
  private createMeshForUnit(unit: Unit): THREE.Object3D {
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

  /** Cleanup all meshes */
  dispose() {
    for (const mesh of this.unitMeshes.values()) {
      this.group.remove(mesh);
      this.disposeObject(mesh);
    }
    this.unitMeshes.clear();
  }
}
