import * as THREE from '../vendor/three.module.min.js';
import { createEarthTexture, latLonToVector3, isWebGLAvailable } from './earthTexture.js';

/**
 * Interactive 3D Globe for Country Selection with Raycasting, Drag-Orbit, Smooth Fly-To,
 * and glowing nation beacons + trade arcs.
 */
export class GlobeSelectorScene {
  constructor(container, countries, options = {}) {
    this.container = container;
    this.countries = countries;
    this.selectedId = options.selectedId || countries[0].id;
    this.onSelect = options.onSelect || (() => {});
    this.liteMode = !!options.liteMode || !isWebGLAvailable();
    this.reducedMotion = !!options.reducedMotion;
    this.disposed = false;
    this.animId = null;

    // Spherical camera state
    this.targetRotY = 0;
    this.targetRotX = 0.2;
    this.currRotY = 0;
    this.currRotX = 0.2;
    this.zoom = 2.95;
    this.isDragging = false;
    this.dragMoved = false;

    if (this.liteMode) {
      this.initLiteFallback();
    } else {
      this.initWebGL();
    }
    this.focusCountry(this.selectedId);
  }

  initWebGL() {
    const width = this.container.clientWidth || 640;
    const height = this.container.clientHeight || 520;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    this.camera.position.set(0, 0, this.zoom);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.AmbientLight(0x4c79bd, 1.45));
    const dir = new THREE.DirectionalLight(0xfff5db, 2.0);
    dir.position.set(4, 3, 5);
    this.scene.add(dir);

    this.globeGroup = new THREE.Group();
    this.scene.add(this.globeGroup);

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({
        map: createEarthTexture(),
        specular: new THREE.Color(0x2563eb),
        shininess: 22,
        emissive: new THREE.Color(0x040b1f),
        emissiveIntensity: 0.4
      })
    );
    this.globeGroup.add(sphere);

    // Outer atmosphere halo
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(1.045, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.08, side: THREE.BackSide })
    );
    this.globeGroup.add(halo);

    // Country Markers
    this.markers = [];
    this.raycaster = new THREE.Raycaster();
    this.pointerNDC = new THREE.Vector2();

    this.countries.forEach(c => {
      const pos = latLonToVector3(c.coordinates.lat, c.coordinates.lon, 1.022);
      const group = new THREE.Group();
      group.position.copy(pos);
      group.lookAt(pos.clone().multiplyScalar(2));

      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(0.036, 16, 16),
        new THREE.MeshBasicMaterial({ color: c.id === this.selectedId ? 0xf5d061 : 0x38bdf8 })
      );
      pin.userData = { countryId: c.id };

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.048, 0.068, 24),
        new THREE.MeshBasicMaterial({
          color: c.id === this.selectedId ? 0xf5d061 : 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        })
      );
      ring.userData = { countryId: c.id };

      group.add(pin);
      group.add(ring);
      this.globeGroup.add(group);
      this.markers.push({ id: c.id, group, pin, ring });
    });

    // Trade arcs from selected country
    this.arcsGroup = new THREE.Group();
    this.globeGroup.add(this.arcsGroup);
    this.rebuildArcs();

    // Pointer Interactions
    const dom = this.renderer.domElement;
    let lastX = 0;
    let lastY = 0;

    this.onDown = (e) => {
      this.isDragging = true;
      this.dragMoved = false;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    this.onMove = (e) => {
      const rect = dom.getBoundingClientRect();
      this.pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        if (Math.abs(dx) + Math.abs(dy) > 3) this.dragMoved = true;
        this.targetRotY += dx * 0.007;
        this.targetRotX = Math.max(-1.1, Math.min(1.1, this.targetRotX + dy * 0.007));
        lastX = e.clientX;
        lastY = e.clientY;
      } else {
        this.raycaster.setFromCamera(this.pointerNDC, this.camera);
        const hits = this.raycaster.intersectObjects(this.markers.map(m => m.pin));
        dom.style.cursor = hits.length ? 'pointer' : 'grab';
      }
    };
    this.onUp = (e) => {
      if (this.isDragging && !this.dragMoved) {
        const rect = dom.getBoundingClientRect();
        this.pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.pointerNDC, this.camera);
        const hits = this.raycaster.intersectObjects(this.markers.map(m => m.pin));
        if (hits.length) {
          const cid = hits[0].object.userData.countryId;
          this.focusCountry(cid);
          this.onSelect(cid);
        }
      }
      this.isDragging = false;
    };
    this.onWheel = (e) => {
      e.preventDefault();
      this.zoom = Math.max(2.1, Math.min(4.0, this.zoom + e.deltaY * 0.0015));
    };
    this.onResize = () => {
      if (this.disposed) return;
      const w = this.container.clientWidth || 640;
      const h = this.container.clientHeight || 520;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };

    dom.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    dom.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('resize', this.onResize);

    let pulseT = 0;
    const animate = () => {
      if (this.disposed) return;
      this.animId = requestAnimationFrame(animate);
      pulseT += 0.05;

      const lerpFactor = this.reducedMotion ? 0.35 : 0.09;
      this.currRotY += (this.targetRotY - this.currRotY) * lerpFactor;
      this.currRotX += (this.targetRotX - this.currRotX) * lerpFactor;
      this.globeGroup.rotation.y = this.currRotY;
      this.globeGroup.rotation.x = this.currRotX;
      this.camera.position.z += (this.zoom - this.camera.position.z) * 0.1;

      this.markers.forEach(m => {
        const isSel = m.id === this.selectedId;
        const scale = isSel ? 1.25 + Math.sin(pulseT) * 0.2 : 0.9;
        m.ring.scale.setScalar(scale);
      });

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  rebuildArcs() {
    if (!this.arcsGroup) return;
    while (this.arcsGroup.children.length) {
      this.arcsGroup.remove(this.arcsGroup.children[0]);
    }
    const origin = this.countries.find(c => c.id === this.selectedId);
    if (!origin) return;
    const p1 = latLonToVector3(origin.coordinates.lat, origin.coordinates.lon, 1.02);

    this.countries.filter(c => c.id !== origin.id).forEach(other => {
      const p2 = latLonToVector3(other.coordinates.lat, other.coordinates.lon, 1.02);
      const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(1.24);
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(36)),
        new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.45 })
      );
      this.arcsGroup.add(line);
    });
  }

  focusCountry(countryId) {
    this.selectedId = countryId;
    const c = this.countries.find(x => x.id === countryId);
    if (!c) return;

    // Calculate rotation so (lat, lon) faces +Z camera
    const lonRad = (c.coordinates.lon + 90) * (Math.PI / 180);
    const latRad = c.coordinates.lat * (Math.PI / 180);
    this.targetRotY = -lonRad;
    this.targetRotX = latRad * 0.85;

    if (this.markers) {
      this.markers.forEach(m => {
        const col = m.id === countryId ? 0xf5d061 : 0x38bdf8;
        m.pin.material.color.setHex(col);
        m.ring.material.color.setHex(col);
      });
      this.rebuildArcs();
    }
    if (this.liteMode && this.drawLite) {
      this.drawLite();
    }
  }

  initLiteFallback() {
    const wrapper = document.createElement('div');
    wrapper.className = 'lite-globe-map';
    this.container.innerHTML = '';
    this.container.appendChild(wrapper);

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    wrapper.appendChild(canvas);

    this.drawLite = () => {
      const w = (canvas.width = this.container.clientWidth || 640);
      const h = (canvas.height = this.container.clientHeight || 420);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#061128';
      ctx.fillRect(0, 0, w, h);

      // Draw world grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
      for (let x = 0; x < w; x += w / 12) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += h / 6) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      const selected = this.countries.find(c => c.id === this.selectedId);
      const project = (lat, lon) => [((lon + 180) / 360) * w, ((90 - lat) / 180) * h];

      if (selected) {
        const [sx, sy] = project(selected.coordinates.lat, selected.coordinates.lon);
        this.countries.filter(c => c.id !== selected.id).forEach(other => {
          const [ox, oy] = project(other.coordinates.lat, other.coordinates.lon);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo((sx + ox) / 2, Math.min(sy, oy) - 40, ox, oy);
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }

      this.countries.forEach(c => {
        const [x, y] = project(c.coordinates.lat, c.coordinates.lon);
        const active = c.id === this.selectedId;
        ctx.beginPath();
        ctx.arc(x, y, active ? 9 : 6, 0, Math.PI * 2);
        ctx.fillStyle = active ? '#f5d061' : '#38bdf8';
        ctx.fill();
        ctx.font = '600 12px Inter, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(c.name, x + 12, y + 4);
      });
    };

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const cy = ((e.clientY - rect.top) / rect.height) * canvas.height;
      let best = null;
      let bestDist = 36;
      this.countries.forEach(c => {
        const px = ((c.coordinates.lon + 180) / 360) * canvas.width;
        const py = ((90 - c.coordinates.lat) / 180) * canvas.height;
        const d = Math.hypot(cx - px, cy - py);
        if (d < bestDist) { bestDist = d; best = c.id; }
      });
      if (best) {
        this.focusCountry(best);
        this.onSelect(best);
      }
    });
    this.drawLite();
  }

  dispose() {
    this.disposed = true;
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.renderer) {
      const dom = this.renderer.domElement;
      dom.removeEventListener('pointerdown', this.onDown);
      dom.removeEventListener('wheel', this.onWheel);
      window.removeEventListener('pointermove', this.onMove);
      window.removeEventListener('pointerup', this.onUp);
      window.removeEventListener('resize', this.onResize);
      this.renderer.dispose();
    }
  }
}
