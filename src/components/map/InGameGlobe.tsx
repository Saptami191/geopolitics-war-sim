import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useWorldStore } from '../../store/worldStore';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import { getCentroid } from './countryCentroids';
import { MAP_THEME } from './mapStyles';
import { LayerToggleState } from './MapLayerPanel';

/**
 * Maps Longitude & Latitude to 3D spherical positions on the Earth sphere
 */
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

interface InGameGlobeProps {
  theme?: 'dark' | 'light';
  layers: LayerToggleState;
}

export function InGameGlobe({ theme = 'dark', layers }: InGameGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Real time game data subscriptions
  const activeStrikes = useWorldStore((s) => s.activeStrikes);
  const countries = useWorldStore((s) => s.countries);
  const playerCountryId = usePlayerStore((s) => s.countryId);
  const hudMode = usePlayerStore((s) => s.hudMode);
  const targetCountryId = usePlayerStore((s) => s.selectedTargetCountryId);
  
  // Core selector actions
  const setTargetCountry = usePlayerStore((s) => s.setTargetCountry);
  const setCountryInspector = useUIStore((s) => s.setCountryInspector);

  // Group references to dynamically push elements down from React updates
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const arcsGroupRef = useRef<THREE.Group | null>(null);
  const sparksGroupRef = useRef<THREE.Group | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const starPointsRef = useRef<THREE.Points | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Drag rotation state
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const rotation = useRef({ y: 1.2, x: 0.3 }); // Look at Middle-East / Indian Ocean originally
  const targetRotation = useRef({ y: 1.2, x: 0.3 });

  const isDark = theme === 'dark';

  // WebGL Instance Initializer
  useEffect(() => {
    if (!mountRef.current) return;
    const W = mountRef.current.clientWidth || 600;
    const H = mountRef.current.clientHeight || 500;

    // SCENE & CAMERA Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDark ? 0x020508 : 0xf4f4f5, 0.28);

    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.z = 2.6;

    // RENDERER Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    mountRef.current.appendChild(renderer.domElement);

    // ROOT GLOBE Assembly
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // BLUE MARBLE SPACE MAP RENDER
    const loader = new THREE.TextureLoader();
    const dayTex = loader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
    const nightTex = loader.load('https://unpkg.com/three-globe/example/img/earth-night.jpg');

    // Earth Sphere Core
    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: dayTex,
      emissiveMap: nightTex,
      emissive: new THREE.Color(isDark ? 0x111e2f : 0x222222),
      emissiveIntensity: isDark ? 1.5 : 0.4,
      specular: new THREE.Color(isDark ? 0x0a2233 : 0x111111),
      shininess: isDark ? 25 : 5,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // CYBER METROPOLIS GRID SYSTEM
    const gridGeo = new THREE.SphereGeometry(1.015, 45, 45);
    const gridMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x054a5c : 0xa1c2d6,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.14 : 0.08,
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    globeGroup.add(gridMesh);

    // RADATIVE ATMOSPHERE RING
    const atmGeo = new THREE.SphereGeometry(1.035, 32, 32);
    const atmMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x00cfff : 0x7ca4bf,
      transparent: true,
      opacity: isDark ? 0.08 : 0.05,
      side: THREE.BackSide,
    });
    const atmMesh = new THREE.Mesh(atmGeo, atmMat);
    globeGroup.add(atmMesh);

    // STAR CONSTELLATIONS GLOW (Only on dark night monitor)
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.8 + Math.random() * 4.0;
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: isDark ? 0x6ca1bf : 0xd1d5db,
      size: 0.012,
      transparent: true,
      opacity: isDark ? 0.45 : 0.15,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);
    starPointsRef.current = starPoints;

    // STRATEGIC GROUPS
    const pins = new THREE.Group();
    globeGroup.add(pins);
    pinsGroupRef.current = pins;

    const arcs = new THREE.Group();
    globeGroup.add(arcs);
    arcsGroupRef.current = arcs;

    const sparks = new THREE.Group();
    globeGroup.add(sparks);
    sparksGroupRef.current = sparks;

    // INTENSE SATELLITE LIGHTING
    const sunLight = new THREE.DirectionalLight(0xfffaee, isDark ? 1.45 : 2.0);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const backSun = new THREE.DirectionalLight(isDark ? 0x0084ff : 0x737373, isDark ? 0.45 : 0.85);
    backSun.position.set(-5, -3, -5);
    scene.add(backSun);

    const ambientLight = new THREE.AmbientLight(isDark ? 0x0e1724 : 0x737373, isDark ? 0.7 : 1.35);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // MOUSE DRAG & INERTIA LOGIC
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;

      targetRotation.current.y += dx * 0.005;
      targetRotation.current.x += dy * 0.005;

      targetRotation.current.x = Math.max(-1.1, Math.min(1.1, targetRotation.current.x));
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    // RAYCAST TACTICAL INTERCEPT ACTION (Raycasting sphere clicks)
    const onCanvasClick = (e: MouseEvent) => {
      if (Math.abs(dtoX) > 4 || Math.abs(dtoY) > 4) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      const intersects = raycaster.intersectObjects(pins.children, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const mappedId = hit.userData?.countryId;
        if (mappedId) {
          if (hudMode === 'WAR_ROOM') {
            if (mappedId !== playerCountryId) {
              setTargetCountry(mappedId);
            }
          } else {
            setCountryInspector(mappedId);
          }
        }
      }
    };

    let dtoX = 0, dtoY = 0;
    const trackClickDeltaDown = (e: MouseEvent) => {
      dtoX = e.clientX;
      dtoY = e.clientY;
    };
    const trackClickDeltaUp = (e: MouseEvent) => {
      dtoX = e.clientX - dtoX;
      dtoY = e.clientY - dtoY;
      onCanvasClick(e);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    domElement.addEventListener('mousedown', trackClickDeltaDown);
    domElement.addEventListener('mouseup', trackClickDeltaUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // RESIZE OBSERVER
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(mountRef.current);

    // DETONATION SPARKS ANIMATION CACHE
    const activePulses: Array<{
      ring: THREE.Mesh;
      currentAge: number;
      maxAge: number;
    }> = [];

    // ANIMATION ENGINE LOOP
    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);

      // Dampen rotation inertia calculations
      rotation.current.y += (targetRotation.current.y - rotation.current.y) * 0.12;
      rotation.current.x += (targetRotation.current.x - rotation.current.x) * 0.12;

      if (!isDragging.current) {
        // Subtle planetary drift rotation
        targetRotation.current.y += 0.0006;
      }

      globeGroup.rotation.y = rotation.current.y;
      globeGroup.rotation.x = rotation.current.x;

      // drift stargrounds slightly slower
      starPoints.rotation.y = rotation.current.y * 0.18;

      // Animate active ballistic target arcs and detonation sparks
      arcs.children.forEach((c: any) => {
        if (c.userData?.isSpark && c.userData?.curve) {
          const tickSpeedFactor = 0.006;
          c.userData.pct += tickSpeedFactor;
          if (c.userData.pct > 1.0) {
            c.userData.pct = 0.0;
          }
          const p = c.userData.curve.getPointAt(c.userData.pct);
          c.position.copy(p);
        }
      });

      // detonation pulse animation
      for (let i = activePulses.length - 1; i >= 0; i--) {
        const p = activePulses[i];
        p.currentAge += 1;
        const scale = 1.0 + (p.currentAge / p.maxAge) * 0.25;
        p.ring.scale.set(scale, scale, scale);

        const op = 1.0 - p.currentAge / p.maxAge;
        if (p.ring.material instanceof THREE.Material) {
          p.ring.material.opacity = op;
        }

        if (p.currentAge >= p.maxAge) {
          sparks.remove(p.ring);
          activePulses.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      domElement.removeEventListener('mousedown', onMouseDown);
      domElement.removeEventListener('mousedown', trackClickDeltaDown);
      domElement.removeEventListener('mouseup', trackClickDeltaUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      resizeObserver.disconnect();
      renderer.dispose();
      try {
        mountRef.current?.removeChild(domElement);
      } catch (e) {
        // Safe check
      }
    };
  }, []);

  // Sync interactive lights with the theme prop when it changes
  useEffect(() => {
    const starPoints = starPointsRef.current;
    const ambientLight = ambientLightRef.current;
    const earthMesh = earthMeshRef.current;
    if (!starPoints || !ambientLight || !earthMesh) return;

    if (isDark) {
      if (starPoints.material instanceof THREE.PointsMaterial) {
        starPoints.material.color.setHex(0x6ca1bf);
        starPoints.material.opacity = 0.45;
      }
      ambientLight.color.setHex(0x0e1724);
      ambientLight.intensity = 0.7;

      if (earthMesh.material instanceof THREE.MeshPhongMaterial) {
        earthMesh.material.emissive.setHex(0x111e2f);
        earthMesh.material.emissiveIntensity = 1.5;
        earthMesh.material.shininess = 25;
      }
    } else {
      if (starPoints.material instanceof THREE.PointsMaterial) {
        starPoints.material.color.setHex(0x9ca3af);
        starPoints.material.opacity = 0.1;
      }
      ambientLight.color.setHex(0xcdcdcd);
      ambientLight.intensity = 1.4;

      if (earthMesh.material instanceof THREE.MeshPhongMaterial) {
        earthMesh.material.emissive.setHex(0x0d0d0d);
        earthMesh.material.emissiveIntensity = 0.25;
        earthMesh.material.shininess = 6;
      }
    }
  }, [theme, isDark]);

  // TICK-BASED THREE RE-RENDER SYNC FOR TRAJECTORIES & PINS OVERLAYS WITH MULTI-SELECT FILTERS
  useEffect(() => {
    const pins = pinsGroupRef.current;
    const arcs = arcsGroupRef.current;
    const sparks = sparksGroupRef.current;
    if (!pins || !arcs || !sparks) return;

    // Helper to safely clean scene groups to prevent WebGL leaks
    const clearGroup = (g: THREE.Group) => {
      while (g.children.length > 0) {
        const c = g.children[0];
        g.remove(c);
        if (c instanceof THREE.Mesh || c instanceof THREE.Line) {
          c.geometry.dispose();
          if (c.material instanceof Array) {
            c.material.forEach((m) => m.dispose());
          } else {
            c.material.dispose();
          }
        }
      }
    };

    clearGroup(pins);
    clearGroup(arcs);
    clearGroup(sparks);

    // 1. GENERATE TACTICAL PINS INTERACTING TO WORLD STATE & ACTIVE LAYER TOGGLES
    Object.entries(countries).forEach(([id, c]) => {
      const coord = getCentroid(id);
      if (coord[0] === 0 && coord[1] === 0) return;

      const extCoord = latLngToVector3(coord[1], coord[0], 1.0);

      // Distinguish status colors & filter visibility by active layered toggles
      let pinColor = 0x5c7a8c; // Neutrals
      let pinScale = 0.012;
      let shouldRenderPin = false;

      // Always show Player & target countries on the globe as defensive constants
      if (id === playerCountryId) {
        pinColor = 0x00ffaa; // Player Coalition (Emerald)
        pinScale = 0.024;
        shouldRenderPin = true;
      } else if (id === targetCountryId) {
        pinColor = 0xff1e46; // Target Country (Vibrant Red)
        pinScale = 0.022;
        shouldRenderPin = true;
      } else if (layers.conflicts && c.atWarWith && c.atWarWith.length > 0) {
        pinColor = 0xff3b4e; // Active war coordinates
        pinScale = 0.018;
        shouldRenderPin = true;
      } else if (layers.military && c.arsenal?.totalPowerRating && c.arsenal.totalPowerRating > 100) {
        pinColor = 0xf5a623; // Military base outposts
        pinScale = 0.015;
        shouldRenderPin = true;
      } else if (layers.nuclear && c.arsenal?.nuclearCapable) {
        pinColor = 0x00cfff; // Strategic Alert Silos
        pinScale = 0.016;
        shouldRenderPin = true;
      } else if (layers.economic && c.economic?.gdpB && c.economic.gdpB > 200) {
        pinColor = 0x39d98a; // Financial scale meridians
        pinScale = 0.014;
        shouldRenderPin = true;
      } else if (layers.cyber && c.intelligence?.cyberFirewallLevel && c.intelligence.cyberFirewallLevel > 2) {
        pinColor = 0xb87fff; // Undersea fiber terminal interceptions
        pinScale = 0.015;
        shouldRenderPin = true;
      } else if (layers.population && c.political?.popularUnrest && c.political.popularUnrest > 45) {
        pinColor = 0xeec152; // Civil discontent hotspots
        pinScale = 0.015;
        shouldRenderPin = true;
      } else if (layers.political) {
        // Fallback default alignment coloring block
        shouldRenderPin = true;
        if (c.allianceBlock === 'NATO') {
          pinColor = 0x0090ff;
        } else if (c.allianceBlock === 'BRICS') {
          pinColor = 0xff4d00;
        } else {
          pinColor = 0x7d8e95;
        }
      }

      if (shouldRenderPin) {
        // Base Pin Sphere Mesh
        const pinGeo = new THREE.SphereGeometry(pinScale, 16, 16);
        const pinMat = new THREE.MeshBasicMaterial({
          color: pinColor,
          transparent: true,
          opacity: 0.85,
        });
        const pinMesh = new THREE.Mesh(pinGeo, pinMat);
        pinMesh.position.copy(extCoord);
        pinMesh.userData = { countryId: id };
        pins.add(pinMesh);

        // Decorative Concentric Glow Ring for Selected Countries & Players
        if (id === playerCountryId || id === targetCountryId) {
          const ringGeo = new THREE.RingGeometry(pinScale * 1.5, pinScale * 2.1, 16);
          const ringMat = new THREE.MeshBasicMaterial({
            color: pinColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.position.copy(extCoord);
          ringMesh.lookAt(0, 0, 0); // Orient flat outwards from earth sphere center
          pins.add(ringMesh);
        }
      }
    });

    // 2. GENERATE BALLISTIC STRIKE ARC CONDUITS (always operational if nuclear/conflicts layer is loaded)
    const showStrikes = layers.nuclear || layers.conflicts || layers.political;
    if (showStrikes) {
      activeStrikes.forEach((s) => {
        const srcCoord = getCentroid(s.sourceCountryId);
        const tgtCoord = getCentroid(s.targetCountryId);

        if (srcCoord[0] === 0 || tgtCoord[0] === 0) return;

        const pStart = latLngToVector3(srcCoord[1], srcCoord[0], 1.0);
        const pEnd = latLngToVector3(tgtCoord[1], tgtCoord[0], 1.0);

        // Compute intermediate curve apex control point extending outwards
        const midPoint = new THREE.Vector3().addVectors(pStart, pEnd).multiplyScalar(0.5);
        const dist = pStart.distanceTo(pEnd);
        const arcHeight = Math.min(0.4, Math.max(0.12, dist * 0.22));
        const pMid = midPoint.normalize().multiplyScalar(1.0 + arcHeight);

        // Create geodesic quadratic bezier paths
        const curve = new THREE.QuadraticBezierCurve3(pStart, pMid, pEnd);
        const points = curve.getPoints(32);
        const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

        // Stylize based on weapon danger attributes
        const isDangerous = s.warheadYieldMT && s.warheadYieldMT > 0;
        const arcColor = isDangerous ? 0x00cfff : 0xff3b4e; // Nuclear strategic cyan vs attack red

        const arcMat = new THREE.LineBasicMaterial({
          color: arcColor,
          transparent: true,
          opacity: s.status === 'IN_FLIGHT' ? 0.75 : 0.15, // dim trails that have completed
        });

        const line = new THREE.Line(arcGeo, arcMat);
        arcs.add(line);

        // If Currently In Flight, add in-transit plasma spark projectile
        if (s.status === 'IN_FLIGHT') {
          const sparkGeo = new THREE.SphereGeometry(0.012, 8, 8);
          const sparkMat = new THREE.MeshBasicMaterial({
            color: arcColor,
            transparent: true,
            opacity: 0.95,
          });
          const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
          sparkMesh.userData = {
            isSpark: true,
            curve,
            pct: Math.min(0.99, Math.max(0.01, s.progressPct / 100)),
          };
          const initPos = curve.getPointAt(sparkMesh.userData.pct);
          sparkMesh.position.copy(initPos);
          arcs.add(sparkMesh);
        }

        // Add Impact Shockwave spark loop rings
        if (s.status === 'IMPACT' || s.status === 'INTERCEPTED') {
          const pulseColor = s.status === 'INTERCEPTED' ? 0x00cfff : 0xff1e46;
          const shGeo = new THREE.RingGeometry(0.02, 0.038, 16);
          const shMat = new THREE.MeshBasicMaterial({
            color: pulseColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
          });
          const shMesh = new THREE.Mesh(shGeo, shMat);
          shMesh.position.copy(pEnd);
          shMesh.lookAt(0, 0, 0);
          sparks.add(shMesh);
        }
      });
    }

  }, [activeStrikes, countries, playerCountryId, targetCountryId, theme, layers]);

  return (
    <div className="relative w-full h-full" id="tactical-3d-sphere-monitor">
      {/* WebGL Mount Point */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at center, #06111a 0%, #020508 100%)'
            : 'radial-gradient(ellipse at center, #ffffff 0%, #e4e4e7 100%)',
        }}
      />

      {/* Satellite HUD Watermarks */}
      <div className={`absolute inset-0 pointer-events-none z-[10] border flex flex-col justify-between p-4 select-none transition-colors duration-200
        ${isDark ? 'border-cyan-950/20 mix-blend-screen' : 'border-zinc-300/35 mix-blend-multiply'}
      `}>
        <div className={`flex justify-between items-start font-mono text-[8px] ${isDark ? 'text-cyan-600/70' : 'text-zinc-500'}`}>
          <div className="flex flex-col gap-0.5">
            <span>ORBIT: DEEP GEO-SYNCHRONOUS</span>
            <span>ALTITUDE: 35,786 KM</span>
          </div>
          <div className="text-right">
            <span>BEARING STATUS: AUTO-LOCK</span>
            <span>POLAR SWEEP: PASSIVE</span>
          </div>
        </div>

        {/* Outer Circular Targeting Crosshair overlay */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center items-center">
          <div className={`w-[320px] h-[320px] border rounded-full flex justify-center items-center relative animate-pulse
            ${isDark ? 'border-cyan-500/5' : 'border-zinc-300/30'}
          `}>
            <div className={`w-[180px] h-[180px] border rounded-full flex justify-center items-center relative
              ${isDark ? 'border-cyan-500/10' : 'border-zinc-300/50'}
            `}>
              <span className={`absolute w-4 h-[1px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isDark ? 'bg-cyan-400/40' : 'bg-zinc-400'}`} />
              <span className={`absolute w-[1px] h-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isDark ? 'bg-cyan-400/40' : 'bg-zinc-400'}`} />
            </div>
          </div>
        </div>

        <div className={`flex justify-between items-end font-mono text-[8px] ${isDark ? 'text-cyan-600/70' : 'text-zinc-500'}`}>
          <span>VECTOR CORRECTION: LOCKED [3d projection]</span>
          <span>INTELLIGENCE RADAR v5.4 SPATIAL FIELD</span>
        </div>
      </div>
    </div>
  );
}

export default InGameGlobe;
