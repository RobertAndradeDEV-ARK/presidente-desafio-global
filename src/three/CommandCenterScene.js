import * as THREE from '../vendor/three.module.min.js';
import { isWebGLAvailable } from './earthTexture.js';

/**
 * 3D Presidential Command Center ("Sala de Situação"):
 * Features architectural command deck, curved holographic telemetry screens with live CanvasTextures,
 * central 3D tactical table with extruded national relief/pillars for regional events & crisis alerts.
 */
export class CommandCenterScene {
  constructor(container, country, options = {}) {
    this.container = container;
    this.country = country;
    this.liteMode = !!options.liteMode || !isWebGLAvailable();
    this.reducedMotion = !!options.reducedMotion;
    this.disposed = false;
    this.animId = null;
    this.crisisMood = 'normal'; // normal | medium | high | positive
    this.pointer = { x: 0, y: 0 };

    if (this.liteMode) {
      this.initLiteFallback();
    } else {
      this.initWebGL();
    }
  }

  initWebGL() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x040916, 0.085);

    this.camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 60);
    this.camera.position.set(0, 3.2, 6.8);
    this.camera.lookAt(0, 0.4, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    this.ambientLight = new THREE.AmbientLight(0x1e3a6e, 1.3);
    this.scene.add(this.ambientLight);

    this.holoSpot = new THREE.PointLight(0x38bdf8, 4.5, 16);
    this.holoSpot.position.set(0, 2.8, 0);
    this.scene.add(this.holoSpot);

    this.goldAccentLight = new THREE.PointLight(0xd4af37, 2.8, 18);
    this.goldAccentLight.position.set(-4, 3.5, 3);
    this.scene.add(this.goldAccentLight);

    // Situation Room Floor Grid + Tactical Concentric Rings
    const grid = new THREE.GridHelper(24, 24, 0x1d4ed8, 0x0f2042);
    grid.position.y = -0.8;
    this.scene.add(grid);

    const ringRadii = [2.2, 3.4, 5.2];
    ringRadii.forEach((r, idx) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r, r + 0.03, 72),
        new THREE.MeshBasicMaterial({
          color: idx === 0 ? 0xd4af37 : 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.32
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.78;
      this.scene.add(ring);
    });

    // Central Holographic Command Table Base
    const tableBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.15, 2.45, 0.55, 48),
      new THREE.MeshPhongMaterial({ color: 0x09152c, specular: 0xd4af37, shininess: 40 })
    );
    tableBase.position.y = -0.5;
    this.scene.add(tableBase);

    const tableRim = new THREE.Mesh(
      new THREE.TorusGeometry(2.18, 0.035, 12, 64),
      new THREE.MeshBasicMaterial({ color: 0xd4af37 })
    );
    tableRim.rotation.x = Math.PI / 2;
    tableRim.position.y = -0.22;
    this.scene.add(tableRim);

    // 3D Extruded Country Terrain Map on the Holographic Table
    this.holoGroup = new THREE.Group();
    this.holoGroup.position.y = 0.05;
    this.scene.add(this.holoGroup);

    this.buildCountryHologram(this.country);

    // 3 Curved Holographic Wall Screens around the Command Deck
    this.wallScreens = [];
    const angles = [-0.62, 0, 0.62];
    angles.forEach((ang, idx) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const tex = new THREE.CanvasTexture(canvas);
      const geo = new THREE.PlaneGeometry(3.2, 1.55);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      });
      const screen = new THREE.Mesh(geo, mat);
      const radius = 5.4;
      screen.position.set(Math.sin(ang) * radius, 1.85, -Math.cos(ang) * radius + 1.4);
      screen.rotation.y = -ang;
      this.scene.add(screen);
      this.wallScreens.push({ mesh: screen, canvas, tex, idx });
    });

    // Architectural Pillars
    for (let i = -2; i <= 2; i += 4) {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 6, 0.35),
        new THREE.MeshPhongMaterial({ color: 0x071024, emissive: 0x0a1c3f, emissiveIntensity: 0.4 })
      );
      pillar.position.set(i * 1.4, 2.0, -4.2);
      this.scene.add(pillar);
    }

    // Floating holographic particles
    const pCount = 140;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 10;
      pPos[i * 3 + 1] = Math.random() * 4.5;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    this.particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.045, transparent: true, opacity: 0.55 })
    );
    this.scene.add(this.particles);

    this.onResize = () => {
      if (this.disposed) return;
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    this.onPointerMove = (e) => {
      this.pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      this.pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onPointerMove);

    let t = 0;
    const animate = () => {
      if (this.disposed) return;
      this.animId = requestAnimationFrame(animate);
      const speed = this.reducedMotion ? 0.15 : 1;
      t += 0.025 * speed;

      this.holoGroup.rotation.y += 0.0022 * speed;
      this.particles.rotation.y -= 0.0008 * speed;

      // Subtle cinematic parallax camera
      const targetX = this.pointer.x * 0.45;
      const targetY = 3.15 - this.pointer.y * 0.22;
      this.camera.position.x += (targetX - this.camera.position.x) * 0.035;
      this.camera.position.y += (targetY - this.camera.position.y) * 0.035;
      this.camera.lookAt(0, 0.35, 0);

      // Animate regional event beacons & crisis lighting
      if (this.regionPins) {
        this.regionPins.forEach((p, idx) => {
          p.ring.scale.setScalar(1 + Math.sin(t * 2 + idx) * 0.28);
          p.beam.position.y = 0.25 + Math.sin(t + idx) * 0.03;
        });
      }

      if (this.crisisMood === 'high') {
        const pulse = 3.5 + Math.sin(t * 3.5) * 1.8;
        this.holoSpot.color.setHex(0xef4444);
        this.holoSpot.intensity = pulse;
      } else if (this.crisisMood === 'medium') {
        this.holoSpot.color.setHex(0xf59e0b);
        this.holoSpot.intensity = 4.2;
      } else if (this.crisisMood === 'positive') {
        this.holoSpot.color.setHex(0x10b981);
        this.holoSpot.intensity = 4.5;
      } else {
        this.holoSpot.color.setHex(0x38bdf8);
        this.holoSpot.intensity = 4.2;
      }

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  buildCountryHologram(country) {
    while (this.holoGroup.children.length) {
      this.holoGroup.remove(this.holoGroup.children[0]);
    }
    this.regionPins = [];

    // Parse SVG path points into a 3D ExtrudeGeometry silhouette
    const pts = [];
    const tokens = (country.svgOutline || '').match(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g) || [];
    tokens.forEach(pair => {
      const [px, py] = pair.split(',').map(Number);
      pts.push(new THREE.Vector2((px - 50) * 0.032, (50 - py) * 0.032));
    });

    if (pts.length >= 3) {
      const shape = new THREE.Shape(pts);
      const extrudeGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03 });
      extrudeGeo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshPhongMaterial({
        color: 0x0f2d5e,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.85
      });
      const terrain = new THREE.Mesh(extrudeGeo, mat);
      this.holoGroup.add(terrain);

      const wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(extrudeGeo),
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 })
      );
      this.holoGroup.add(wire);
    }

    // Add 3D city/region holographic pillars
    (country.regions || []).forEach(r => {
      const rx = (r.x * 100 - 50) * 0.032;
      const rz = -(50 - r.y * 100) * 0.032;
      const h = 0.22 + (r.weight || 0.15) * 0.8;

      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.04, h, 10),
        new THREE.MeshBasicMaterial({ color: 0xf5d061, transparent: true, opacity: 0.85 })
      );
      beam.position.set(rx, 0.16 + h / 2, rz);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.06, 0.095, 20),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(rx, 0.17, rz);

      this.holoGroup.add(beam);
      this.holoGroup.add(ring);
      this.regionPins.push({ regionId: r.id, beam, ring });
    });
  }

  /**
   * Updates the 3D holographic wall screens and regional beacons with live simulation telemetry.
   */
  updateTelemetry(state) {
    if (!state) return;
    const ind = state.indicators;
    const natEvents = state.nationalEvents || [];

    if (state.crisisAlert?.severity === 'high' || natEvents.some(e => e.type === 'protest')) {
      this.crisisMood = 'high';
    } else if (state.crisisAlert?.severity === 'medium') {
      this.crisisMood = 'medium';
    } else if (state.crisisAlert?.severity === 'positive' || ind.gdpGrowth >= 3.0) {
      this.crisisMood = 'positive';
    } else {
      this.crisisMood = 'normal';
    }

    if (this.liteMode || !this.wallScreens) return;

    // Color regional pins by live national event severity
    this.regionPins.forEach(p => {
      const ev = natEvents.find(e => e.regionId === p.regionId);
      const col = !ev ? 0xf5d061 : ev.severity === 'high' ? 0xef4444 : ev.severity === 'positive' ? 0x10b981 : 0xf59e0b;
      p.beam.material.color.setHex(col);
      p.ring.material.color.setHex(col);
    });

    // Redraw 3D CanvasTexture telemetry screens
    this.wallScreens.forEach(({ canvas, tex, idx }) => {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(6, 16, 38, 0.94)';
      ctx.fillRect(0, 0, 512, 256);
      ctx.strokeStyle = this.crisisMood === 'high' ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, 500, 244);

      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 20px Inter, sans-serif';
      if (idx === 0) {
        ctx.fillText('TELEMETRIA MACROECONÔMICA', 24, 42);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '18px monospace';
        ctx.fillText(`CÂMBIO:   ${this.country.currency.symbol} ${ind.exchangeRate.toFixed(this.country.currency.decimals)}`, 24, 92);
        ctx.fillText(`INFLAÇÃO: ${ind.inflation.toFixed(1)}%   JUROS: ${ind.interestRate.toFixed(2)}%`, 24, 130);
        ctx.fillText(`PIB:      ${ind.gdpGrowth.toFixed(1)}%   DÍVIDA: ${ind.publicDebt.toFixed(1)}%`, 24, 168);
        ctx.fillText(`RISCO:    ${ind.countryRisk} pts`, 24, 206);
      } else if (idx === 1) {
        ctx.fillText('CENTRO DE OPERAÇÕES — STATUS', 24, 42);
        ctx.fillStyle = this.crisisMood === 'high' ? '#fca5a5' : '#93c5fd';
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.fillText(state.crisisAlert ? state.crisisAlert.title.slice(0, 34) : 'ESTABILIDADE OPERACIONAL', 24, 102);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '17px Inter, sans-serif';
        ctx.fillText(`APROVAÇÃO POPULAR: ${Math.round(ind.approval)}%`, 24, 152);
        ctx.fillText(`BASE PARLAMENTAR:  ${Math.round(ind.parliamentSupport)}%`, 24, 188);
        ctx.fillText(`TRIMESTRE ATUAL:   ${state.quarter} / ${state.config.totalQuarters}`, 24, 222);
      } else {
        ctx.fillText('CENÁRIO INTERNACIONAL', 24, 42);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '18px monospace';
        ctx.fillText(`PETRÓLEO BRENT: US$ ${Math.round(state.externalScenario.oilPrice)}/bbl`, 24, 92);
        ctx.fillText(`JUROS EUA (FED): ${state.externalScenario.fedRate.toFixed(2)}%`, 24, 130);
        ctx.fillText(`BALANÇA COM.:    US$ ${ind.tradeBalance.toFixed(1)} bi`, 24, 168);
        ctx.fillText(`RESERVAS INT.:   US$ ${ind.reserves.toFixed(0)} bi`, 24, 206);
      }
      tex.needsUpdate = true;
    });
  }

  initLiteFallback() {
    this.container.innerHTML = '<div class="lite-command-bg"></div>';
  }

  dispose() {
    this.disposed = true;
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.onResize) window.removeEventListener('resize', this.onResize);
    if (this.onPointerMove) window.removeEventListener('pointermove', this.onPointerMove);
    if (this.renderer) this.renderer.dispose();
  }
}
