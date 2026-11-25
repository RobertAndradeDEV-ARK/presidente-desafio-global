import * as THREE from '../vendor/three.module.min.js';

/**
 * Generates a detailed procedural Earth CanvasTexture (oceans, continents, tactical grid, city lights)
 * so the 3D Globe renders crisply offline without external asset failures.
 */
export function createEarthTexture() {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Deep ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
  oceanGrad.addColorStop(0, '#040b1c');
  oceanGrad.addColorStop(0.5, '#071736');
  oceanGrad.addColorStop(1, '#030816');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle lat/lon tactical grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.11)';
  ctx.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 15) {
    const x = ((lon + 180) / 360) * w;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = ((90 - lat) / 180) * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const drawPoly = (coords, fill = '#132b4f', stroke = 'rgba(212, 175, 55, 0.55)') => {
    ctx.beginPath();
    coords.forEach(([lon, lat], i) => {
      const x = ((lon + 180) / 360) * w;
      const y = ((90 - lat) / 180) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  };

  // Simplified accurate continental outlines [lon, lat]
  // North America
  drawPoly([
    [-168, 66], [-140, 70], [-95, 70], [-78, 62], [-64, 52], [-54, 47], [-67, 45],
    [-75, 36], [-81, 25], [-83, 30], [-90, 29], [-97, 26], [-96, 19], [-87, 21],
    [-84, 10], [-78, 8], [-85, 11], [-93, 15], [-105, 20], [-112, 28], [-117, 32],
    [-124, 42], [-130, 54], [-152, 60]
  ]);
  // Greenland
  drawPoly([[-52, 60], [-42, 61], [-20, 72], [-25, 82], [-56, 81], [-62, 72]]);
  // South America
  drawPoly([
    [-78, 9], [-72, 12], [-62, 10], [-50, 1], [-35, -6], [-38, -14], [-41, -22],
    [-48, -28], [-53, -34], [-62, -41], [-66, -50], [-69, -55], [-74, -52], [-72, -38],
    [-71, -18], [-81, -5], [-79, 2]
  ]);
  // Europe
  drawPoly([
    [-9, 37], [-9, 43], [-2, 43], [-5, 48], [2, 51], [8, 55], [12, 58], [5, 61],
    [16, 69], [28, 71], [32, 65], [28, 59], [20, 54], [24, 46], [29, 41], [22, 37],
    [16, 38], [12, 44], [5, 43], [0, 38], [-6, 36]
  ]);
  // Africa
  drawPoly([
    [-17, 15], [-12, 28], [-5, 36], [10, 37], [25, 32], [33, 31], [43, 12], [51, 12],
    [41, -2], [40, -15], [33, -26], [20, -35], [15, -26], [12, -12], [9, 4], [2, 6],
    [-8, 5], [-16, 11]
  ]);
  // Asia
  drawPoly([
    [28, 41], [42, 42], [52, 40], [50, 29], [59, 22], [55, 25], [66, 25], [72, 20],
    [77, 8], [85, 20], [92, 21], [98, 16], [103, 2], [109, 12], [108, 21], [121, 24],
    [122, 32], [128, 36], [132, 43], [142, 52], [160, 60], [175, 66], [140, 72],
    [95, 76], [68, 70], [55, 65], [40, 56], [36, 46]
  ]);
  // Japan
  drawPoly([[130, 31], [135, 34], [140, 36], [142, 41], [145, 44], [141, 45], [139, 39], [133, 35]]);
  // Australia
  drawPoly([[114, -22], [129, -14], [137, -12], [142, -11], [153, -27], [150, -37], [138, -35], [126, -33], [115, -34]]);

  // City lights clusters
  const hubs = [
    [-74, 40.7], [-77, 38.9], [-118, 34], [-99.1, 19.4], [-46.6, -23.5], [-43.2, -22.9],
    [-47.9, -15.8], [-58.4, -34.6], [2.35, 48.86], [-0.1, 51.5], [13.4, 52.5], [37.6, 55.7],
    [116.4, 39.9], [121.5, 31.2], [139.7, 35.7], [135.5, 34.7], [77.2, 28.6], [151.2, -33.9]
  ];
  hubs.forEach(([lon, lat]) => {
    const x = ((lon + 180) / 360) * w;
    const y = ((90 - lat) / 180) * h;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 10);
    grad.addColorStop(0, 'rgba(245, 208, 97, 0.95)');
    grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.45)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function latLonToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
}
