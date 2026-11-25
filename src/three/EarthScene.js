import * as THREE from '../vendor/three.module.min.js';
import { createEarthTexture, latLonToVector3, isWebGLAvailable } from './earthTexture.js';

/**
 * 3D Spinning Planet Earth with global economic trade arcs, orbital nodes & atmospheric glow.
 * Includes automatic 2D Canvas fallback for Lite Mode or devices without WebGL.
 */
export class EarthScene {
  constructor(container, options = {}) {
    this.container = container;
    this.liteMode = !!options.liteMode || !isWebGLAvailable();
    this.reducedMotion = !!options.reducedMotion;
    this.disposed = false;
    this.animId = null;
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
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.set(0, 0.35, 3.35);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Cinematic Lighting
    const ambient = new THREE.AmbientLight(0x3b66a8, 1.3);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff4d6, 2.2);
    sun.position.set(5, 3, 4);
    this.scene.add(sun);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    rimLight.position.set(-5, -2, -3);
    this.scene.add(rimLight);

    // Earth Group
    this.earthGroup = new THREE.Group();
    this.scene.add(this.earthGroup);

    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: createEarthTexture(),
      specular: new THREE.Color(0x1d4ed8),
      shininess: 24,
      emissive: new THREE.Color(0x050e24),
      emissiveIntensity: 0.45
    });
    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthGroup.add(this.earthMesh);

    // Atmospheric Fresnel Glow Shell
    const atmosGeo = new THREE.SphereGeometry(1.055, 48, 48);
    const atmosMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      uniforms: { glowColor: { value: new THREE.Color(0x38bdf8) } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.2);
          gl_FragColor = vec4(glowColor, 1.0) * intensity * 0.9;
        }
      `
    });
    this.earthGroup.add(new THREE.Mesh(atmosGeo, atmosMat));

    // Trade Arcs connecting major capitals
    const corridors = [
      [[-15.79, -47.88], [38.9, -77.04]],   // BR -> US
      [[38.9, -77.04], [48.86, 2.35]],     // US -> FR
      [[48.86, 2.35], [35.68, 139.69]],    // FR -> JP
      [[-15.79, -47.88], [35.68, 139.69]], // BR -> JP
      [[19.43, -99.13], [38.9, -77.04]],   // MX -> US
      [[-34.6, -58.38], [-15.79, -47.88]]  // AR -> BR
    ];

    this.pulses = [];
    corridors.forEach(([a, b], idx) => {
      const p1 = latLonToVector3(a[0], a[1], 1.008);
      const p2 = latLonToVector3(b[0], b[1], 1.008);
      const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(1.26);
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
      const arcMat = new THREE.LineBasicMaterial({
        color: idx % 2 === 0 ? 0xd4af37 : 0x38bdf8,
        transparent: true,
        opacity: 0.55
      });
      this.earthGroup.add(new THREE.Line(arcGeo, arcMat));

      const pulseGeo = new THREE.SphereGeometry(0.015, 10, 10);
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0xf5d061 });
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      this.earthGroup.add(pulse);
      this.pulses.push({ mesh: pulse, curve, offset: idx * 0.17 });
    });

    // Orbital ring
    const ringGeo = new THREE.RingGeometry(1.36, 1.372, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22
    });
    this.orbitRing = new THREE.Mesh(ringGeo, ringMat);
    this.orbitRing.rotation.x = Math.PI * 0.42;
    this.orbitRing.rotation.y = 0.22;
    this.scene.add(this.orbitRing);

    // Starfield
    const starCount = 700;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 28;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 28;
      starPos[i * 3 + 2] = -4 - Math.random() * 18;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.04, transparent: true, opacity: 0.7 });
    this.stars = new THREE.Points(starGeo, starMat);
    this.scene.add(this.stars);

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
      t += 0.005 * speed;

      this.earthGroup.rotation.y += 0.0018 * speed;
      this.orbitRing.rotation.z += 0.0008 * speed;
      this.camera.position.x += (this.pointer.x * 0.25 - this.camera.position.x) * 0.03;
      this.camera.position.y += (0.35 - this.pointer.y * 0.15 - this.camera.position.y) * 0.03;
      this.camera.lookAt(0, 0, 0);

      this.pulses.forEach(p => {
        const u = (t * 0.7 + p.offset) % 1;
        p.mesh.position.copy(p.curve.getPoint(u));
      });

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  initLiteFallback() {
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    this.container.innerHTML = '';
    this.container.appendChild(canvas);

    let angle = 0;
    const draw = () => {
      if (this.disposed) return;
      const w = (canvas.width = this.container.clientWidth || window.innerWidth);
      const h = (canvas.height = this.container.clientHeight || window.innerHeight);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const r = Math.min(w, h) * 0.28;

      const glow = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.45);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      glow.addColorStop(1, 'rgba(5, 10, 24, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#081b3d';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rotating latitude/longitude lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(Math.cos(angle + i * 0.45)) * r, r, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (!this.reducedMotion) angle += 0.008;
      this.animId = requestAnimationFrame(draw);
    };
    draw();
  }

  dispose() {
    this.disposed = true;
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.onResize) window.removeEventListener('resize', this.onResize);
    if (this.onPointerMove) window.removeEventListener('pointermove', this.onPointerMove);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
