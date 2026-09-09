// SPDX-License-Identifier: Apache-2.0
// Shader behavior derived from Vibecraft; see ../NOTICE.md.
import * as THREE from 'three';

// Retain Vibecraft's atlas, vertex lighting and underwater tint exactly.
const vertexShader = `
precision highp float;
attribute vec3 position;
attribute vec3 color;
attribute vec2 uv;
uniform mat4 vp;
varying vec3 vColor;
varying vec2 vUv;
void main() {
  gl_Position = vp * vec4(position, 1.0);
  vColor = color;
  vUv = uv;
}`;
const fragmentShader = `
precision mediump float;
uniform sampler2D atlas;
uniform vec3 tint;
uniform float strength;
varying vec3 vColor;
varying vec2 vUv;
void main() {
  vec4 tex = texture2D(atlas, vUv);
  if (tex.a < 0.1) discard;
  gl_FragColor = vec4(mix(tex.rgb * vColor, tint, strength), tex.a);
}`;

export function createRenderer(canvas, atlas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const texture = new THREE.CanvasTexture(atlas);
  texture.magFilter = texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  const uniforms = {
    vp: { value: new THREE.Matrix4() },
    atlas: { value: texture },
    tint: { value: new THREE.Vector3() },
    strength: { value: 0 },
  };
  const materials = [0, 1, 2].map(layer => new THREE.RawShaderMaterial({
    uniforms, vertexShader, fragmentShader,
    side: THREE.DoubleSide,
    transparent: layer === 2,
    depthWrite: layer !== 2,
  }));
  const meshes = new Map();
  let count = 0;
  let frames = 0;
  let last = performance.now();
  function remove(key) {
    const mesh = meshes.get(key);
    if (!mesh) return;
    scene.remove(mesh);
    mesh.geometry.dispose();
    meshes.delete(key);
  }
  const api = {
    resize(w, h) { renderer.setSize(w, h, false); },
    reset(size) {
      for (const key of [...meshes.keys()]) remove(key);
      count = size;
    },
    upload(index, layer, positions, colors, uvs, vertices) {
      if (index < -1 || index >= count) throw new RangeError('Invalid chunk slot');
      const key = `${index}:${layer}`;
      remove(key);
      if (!vertices) return;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setDrawRange(0, vertices);
      const mesh = new THREE.Mesh(geometry, materials[layer]);
      // The game supplies a combined world-to-clip matrix, not a Three camera.
      mesh.frustumCulled = false;
      mesh.renderOrder = layer;
      scene.add(mesh);
      meshes.set(key, mesh);
    },
    draw(vp, x, y, z, strength) {
      uniforms.vp.value.fromArray(vp);
      uniforms.tint.value.set(x, y, z);
      uniforms.strength.value = strength;
      renderer.setClearColor(new THREE.Color().setRGB(...(strength > 0
        ? [0.05, 0.12, 0.22] : [0.52, 0.75, 0.95]), THREE.SRGBColorSpace));
      renderer.render(scene, camera);
      frames++;
      const now = performance.now();
      if (now - last > 1000) {
        document.getElementById('fps').textContent = `${Math.round(frames * 1000 / (now - last))} FPS`;
        last = now;
        frames = 0;
      }
    },
    dispose() {
      for (const key of [...meshes.keys()]) remove(key);
      for (const material of materials) material.dispose();
      texture.dispose();
      renderer.dispose();
    },
  };
  window.addEventListener('pagehide', () => api.dispose(), { once: true });
  return api;
}
