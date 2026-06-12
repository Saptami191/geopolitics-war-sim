import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { audio } from '../../utils/audio';
import { GLOBE_HOTSPOTS, createGlobeMarker, updateMarkerCanvas } from './GlobeMarkers';

export interface WebGLGlobeRef {
  setGreenTint: (progress: number) => void;
}

interface WebGLGlobeProps {
  rotSpeed?: number;
  elapsedMs?: number;
}

export const WebGLGlobe = forwardRef<WebGLGlobeRef, WebGLGlobeProps>(({
  rotSpeed = 0.0006,
  elapsedMs = 0
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.MeshPhongMaterial | null>(null);
  const greenTintRef = useRef<number>(0);
  const elapsedMsRef = useRef<number>(0);

  useEffect(() => {
    elapsedMsRef.current = elapsedMs;
  }, [elapsedMs]);

  useImperativeHandle(ref, () => ({
    setGreenTint: (progress: number) => {
      greenTintRef.current = progress;
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || 500;

    // Create scene
    const scene = new THREE.Scene();

    // Create camera with cinematic viewing frustum
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.z = 2.65; // Perfectly frames the Earth centered

    // Dynamic renderer with anti-aliasing and pixel-ratio optimization
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false); // false = let CSS control container constraints
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // === DIAGNOSTIC CHECKPOINT 1: Canvas size vs container size ===
    console.log('[GLOBE-DEBUG-1] Container size:', {
      containerW: containerRef.current?.clientWidth,
      containerH: containerRef.current?.clientHeight,
      containerOffsetW: containerRef.current?.offsetWidth,
      containerOffsetH: containerRef.current?.offsetHeight,
      innerW: window.innerWidth,
      innerH: window.innerHeight,
    });
    console.log('[GLOBE-DEBUG-2] Renderer pixel ratio:', renderer.getPixelRatio());
    console.log('[GLOBE-DEBUG-3] Renderer size:', renderer.getSize(new THREE.Vector2()));
    console.log('[GLOBE-DEBUG-4] Device pixel ratio:', window.devicePixelRatio);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    // --- RESILIENT, NON-BLOCKING ASYNCHRONOUS TEXTURE PIPELINE ---
    const loadTextureWithFallback = (localPath: string, fallbacks: string[]) => {
      const tex = new THREE.Texture();
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.anisotropy = maxAnisotropy;

      const img = new Image();
      const urls = [localPath, ...fallbacks];
      let attemptIndex = 0;

      const tryLoadNext = () => {
        if (attemptIndex >= urls.length) {
          console.warn(`[GLOBE-INTRO] ❌ All attempts failed for texture: ${localPath}`);
          return;
        }
        const currentUrl = urls[attemptIndex];
        attemptIndex++;
        
        const isLocal = !currentUrl.startsWith('http') && !currentUrl.startsWith('//');
        img.crossOrigin = isLocal ? undefined : 'anonymous';
        img.src = currentUrl;
      };

      img.onload = () => {
        tex.image = img;
        tex.needsUpdate = true;
        console.log(`[GLOBE-INTRO] ✅ Loaded texture: ${img.src}`);
      };

      img.onerror = () => {
        console.warn(`[GLOBE-INTRO] ⚠ Load failed for: ${img.src}. Trying fallback...`);
        tryLoadNext();
      };

      tryLoadNext();
      return tex;
    };

    // --- SCENIC LIGHTS FOR SUPERB GLOBE RENDERING ---
    const sunLight = new THREE.DirectionalLight(0xfffae5, 2.0);
    sunLight.position.set(5, 3.5, 5);
    scene.add(sunLight);

    const polarFilament = new THREE.DirectionalLight(0x00c4ff, 0.65);
    polarFilament.position.set(-5, -3, -5);
    scene.add(polarFilament);

    const ambientLight = new THREE.AmbientLight(0x0b131c, 1.05);
    scene.add(ambientLight);

    const dayTex = loadTextureWithFallback(
      '/textures/earth-blue-marble.jpg',
      [
        'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg',
        'https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-blue-marble.jpg'
      ]
    );
    const nightTex = loadTextureWithFallback(
      '/textures/earth-night.jpg',
      [
        'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg',
        'https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-night.jpg'
      ]
    );
    const specTex = loadTextureWithFallback(
      '/textures/earth-water.png',
      [
        'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-water.png',
        'https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-water.png'
      ]
    );

    // --- 1. Earth Core Mesh with Phong Shader ---
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0x061120), // Elegant solid navy while texture loads
      map: dayTex,
      emissiveMap: nightTex,
      emissive: new THREE.Color(0x112135),
      emissiveIntensity: 1.6,
      specularMap: specTex,
      specular: new THREE.Color(0x0d283c),
      shininess: 28,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    materialRef.current = earthMaterial;

    // --- 2. Cybernetic wireframe grid overlay ---
    const gridGeometry = new THREE.SphereGeometry(1.018, 48, 48);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x00cfff,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    earthMesh.add(gridMesh);

    // --- 3. Atmosphere (Backside glowing shell) ---
    const atmosGeometry = new THREE.SphereGeometry(1.04, 32, 32);
    const atmosMaterial = new THREE.MeshBasicMaterial({
      color: 0x00cfff,
      transparent: true,
      opacity: 0.085,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
    scene.add(atmosMesh);

    // Helper: Dynamic Deep Space Starfield with custom high-fidelity alpha radial glow texture
    const createStarTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.3, 'rgba(139, 229, 255, 0.8)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };
    
    const starTexture = createStarTexture();

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const dist = 40 + Math.random() * 60;
      starPositions[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = dist * Math.cos(phi);
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.7,
      map: starTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    // Helper: Convert Lat/Lon coordinates to spherical points
    const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -(radius * Math.sin(phi) * Math.sin(theta));
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.cos(theta);

      return new THREE.Vector3(x, y, z);
    };

    // Fine, Elegant Orbits (highly transparent threads)
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const createFineOrbit = (radius: number, color: number, rx: number, ry: number, rz: number) => {
      const points: THREE.Vector3[] = [];
      const segments = 120;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.06, // Retains supreme visual focus inside the globe core
        blending: THREE.AdditiveBlending
      });
      const line = new THREE.Line(geo, mat);
      line.rotation.set(rx, ry, rz);
      orbitGroup.add(line);

      return {
        getPosition: (angle: number) => {
          const p = new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
          p.applyEuler(new THREE.Euler(rx, ry, rz));
          return p;
        }
      };
    };

    const orbitSystems = [
      createFineOrbit(1.26, 0x00ff77, 0.42, 0.4, 0.1),
      createFineOrbit(1.34, 0x00d2ff, -0.28, 0.70, -0.4),
      createFineOrbit(1.20, 0xff3b55, 0.80, -0.25, 0.45)
    ];

    // Tactical micro satellites
    const satellites: { mesh: THREE.Mesh; orbitIdx: number; speed: number; offset: number }[] = [];
    for (let i = 0; i < 3; i++) {
      const satGeo = new THREE.SphereGeometry(0.0075, 6, 6);
      const satMat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x00ff77 : i === 1 ? 0x00d2ff : 0xff3b55,
        transparent: true,
        opacity: 0.85
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      scene.add(satMesh);
      satellites.push({
        mesh: satMesh,
        orbitIdx: i,
        speed: 0.18 + i * 0.05,
        offset: Math.random() * Math.PI * 2
      });
    }

    // Geopolitical monitoring telemetry nodes
    const activeTargets = [
      { lat: 31.9, lon: 35.2, label: 'LEVANT_BASIN', color: 0xff3144 },
      { lat: 48.3, lon: 31.2, label: 'EURO_SECTOR', color: 0xffb300 },
      { lat: 23.5, lon: 121.0, label: 'TAIWAN_STRAIT', color: 0xff3144 },
      { lat: 37.8, lon: 127.1, label: 'EAST_SEA_DMZ', color: 0x00d2ff }
    ];

    const radarRingsList: THREE.Mesh[] = [];
    activeTargets.forEach((tgt) => {
      const surfacePos = latLonToVector3(tgt.lat, tgt.lon, 1.002);
      const locatorGroup = new THREE.Group();
      locatorGroup.position.copy(surfacePos);

      const dir = surfacePos.clone().normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
      locatorGroup.setRotationFromQuaternion(quat);

      // Fine, sub-millimeter tactical locator rings
      const circleGeo = new THREE.RingGeometry(0.009, 0.013, 16);
      const circleMat = new THREE.MeshBasicMaterial({
        color: tgt.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      });
      const circleMesh = new THREE.Mesh(circleGeo, circleMat);
      circleMesh.rotation.x = Math.PI / 2;
      locatorGroup.add(circleMesh);

      const dotGeo = new THREE.SphereGeometry(0.003, 6, 6);
      const dotMat = new THREE.MeshBasicMaterial({ color: tgt.color });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      locatorGroup.add(dotMesh);

      earthMesh.add(locatorGroup);
      radarRingsList.push(circleMesh);
    });

    const globeMarkersList: (any)[] = [];
    GLOBE_HOTSPOTS.forEach(hotspot => {
      const marker = createGlobeMarker(hotspot.lat, hotspot.lon, hotspot.type, earthMesh);
      globeMarkersList.push({
        ...marker,
        phase: hotspot.phase,
        name: hotspot.name
      });
    });

    let firstFrameRendered = false;

    let animationId: number;
    const animateLoop = () => {
      animationId = requestAnimationFrame(animateLoop);

      // Spherical orbital rotations
      earthMesh.rotation.y += rotSpeed;

      // Update satellites coordinates
      satellites.forEach((sat) => {
        const theta = Date.now() * 0.001 * sat.speed + sat.offset;
        const p = orbitSystems[sat.orbitIdx].getPosition(theta);
        sat.mesh.position.copy(p);
      });

      // Pulse tactical coordinate locator dots
      radarRingsList.forEach((ring, idx) => {
        const pulse = 1.0 + Math.sin(Date.now() * 0.0053 + idx * 3.1) * 0.42;
        ring.scale.set(pulse, pulse, 1);
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.70 - (pulse - 1.0) * 1.8);
      });

      // Elegant cinematic camera drift (gives grand sense of space) and slow zoom
      const ticks = Date.now() * 0.00008;
      camera.position.x = Math.sin(ticks) * 0.12;
      camera.position.y = Math.cos(ticks * 0.78) * 0.08;
      
      const curElapsed = elapsedMsRef.current;
      if (curElapsed > 1500) {
        const zoomProgress = Math.min((curElapsed - 1500) / 12000, 1.0);
        camera.position.z = 2.65 - zoomProgress * 0.50; // Subtle z-position zoom down to 2.15
      } else {
        camera.position.z = 2.65;
      }

      // Update each marker's visibility and canvas frames based on curElapsed
      globeMarkersList.forEach((m) => {
        let isRevealed = false;

        // Custom progressive reveal pacing matching exact timeline requirements:
        if (m.phase === 1 && curElapsed >= 4000) {
          // Conflicts (phase 1): 9 hotspots stagger every 400ms from 4.0s
          const staggerIndex = GLOBE_HOTSPOTS.filter(h => h.phase === 1).findIndex(h => h.name === m.name);
          if (curElapsed >= 4000 + staggerIndex * 400) {
            isRevealed = true;
          }
        } else if (m.phase === 2 && curElapsed >= 9000) {
          // Military bases (phase 2): 7 markers stagger every 500ms from 9.0s
          const staggerIndex = GLOBE_HOTSPOTS.filter(h => h.phase === 2).findIndex(h => h.name === m.name);
          if (curElapsed >= 9000 + staggerIndex * 500) {
            isRevealed = true;
          }
        } else if (m.phase === 3 && curElapsed >= 14000) {
          // Nuclear sites (phase 3): 7 markers stagger every 500ms from 14.0s
          const staggerIndex = GLOBE_HOTSPOTS.filter(h => h.phase === 3).findIndex(h => h.name === m.name);
          if (curElapsed >= 14000 + staggerIndex * 500) {
            isRevealed = true;
          }
        } else if (m.phase === 4 && curElapsed >= 19000) {
          // Economic chokepoints (phase 4): 6 markers stagger every 600ms from 19.0s
          const staggerIndex = GLOBE_HOTSPOTS.filter(h => h.phase === 4).findIndex(h => h.name === m.name);
          if (curElapsed >= 19000 + staggerIndex * 600) {
            isRevealed = true;
          }
        }

        if (isRevealed) {
          if (!m.sprite.visible) {
            m.sprite.visible = true;
            try {
              audio.playMarkerPing(m.type);
            } catch (err) {}
          }
          // Animate is active on the HTML Canvas texture
          updateMarkerCanvas(m);
        } else {
          m.sprite.visible = false;
        }
      });

      // Interpolate phosphorus green tint transition
      if (materialRef.current) {
        const progress = greenTintRef.current;
        
        const baseEmissive = new THREE.Color(0x112135);
        const greenEmissive = new THREE.Color(0x02ff44);
        materialRef.current.emissive.copy(baseEmissive.clone().lerp(greenEmissive, progress));
        
        const baseSpecular = new THREE.Color(0x0d283c);
        const greenSpecular = new THREE.Color(0x008822);
        materialRef.current.specular.copy(baseSpecular.clone().lerp(greenSpecular, progress));

        const baseColor = new THREE.Color(0xffffff);
        const greenColor = new THREE.Color(0x116622);
        materialRef.current.color.copy(baseColor.clone().lerp(greenColor, progress));
        
        let darkenValue = 0.0;
        if (curElapsed >= 14000) {
          darkenValue = Math.min((curElapsed - 14000) / 4000, 1.0) * 0.40;
        }
        materialRef.current.emissiveIntensity = (1.6 + progress * 2.0) * (1.0 - darkenValue);
      }

      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animateLoop();

    // FIX B: Robust resize observer instead of window event listener
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      rendererRef.current.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      renderer.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      gridGeometry.dispose();
      gridMaterial.dispose();
      atmosGeometry.dispose();
      atmosMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      
      // Clean up Globe sprites and textures
      globeMarkersList.forEach(m => {
        try {
          if (m.sprite) {
            earthMesh.remove(m.sprite);
            if (m.sprite.geometry) m.sprite.geometry.dispose();
            if (m.sprite.material) m.sprite.material.dispose();
          }
          if (m.texture) m.texture.dispose();
        } catch (err) {}
      });

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [rotSpeed]);

  return (
    <div 
      id="sovereign-globe-viewport"
      ref={containerRef} 
      className="w-full h-full min-h-[500px] md:min-h-[600px] xl:min-h-[700px] relative overflow-hidden" 
    />
  );
});

export default WebGLGlobe;
