import * as THREE from 'three';
import { PALETTES } from '../config/palette.js';

export class Environment {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.currentPreset = 'day';

    this.initLights();
    this.initFog();
    this.initParticles();
  }

  initLights() {
    const preset = PALETTES[this.currentPreset];

    // Hemisphere Light for soft sky/ground bounce
    this.hemiLight = new THREE.HemisphereLight(
      preset.hemiSky,
      preset.hemiGround,
      preset.hemiIntensity
    );
    this.hemiLight.position.set(0, 40, 0);
    this.scene.add(this.hemiLight);

    // Directional Light for sun/moon casting soft shadows
    this.dirLight = new THREE.DirectionalLight(preset.dirLight, preset.dirIntensity);
    this.dirLight.position.set(...preset.dirPosition);
    this.dirLight.castShadow = true;

    // High quality soft shadow configuration
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 80;
    this.dirLight.shadow.bias = -0.0005;

    const d = 22;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;

    this.scene.add(this.dirLight);

    // Subtle Ambient Light for filling pitch black areas
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(this.ambientLight);
  }

  initFog() {
    const preset = PALETTES[this.currentPreset];
    this.scene.background = new THREE.Color(preset.sky);
    this.scene.fog = new THREE.FogExp2(preset.fog, preset.fogDensity);
  }

  initParticles() {
    // 120 floating pollen / firefly specks
    const count = 140;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Scatter within island bounds
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 14;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0.5 + Math.random() * 6.5;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      phases[i] = Math.random() * Math.PI * 2;
      scales[i] = 0.5 + Math.random() * 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Custom Canvas Texture for soft circular glow particle
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 200, 0.8)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    this.particleMaterial = new THREE.PointsMaterial({
      size: 0.35,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: PALETTES[this.currentPreset].particlesColor,
      opacity: 0.8
    });

    this.particles = new THREE.Points(geometry, this.particleMaterial);
    this.scene.add(this.particles);

    this.initialParticlePositions = positions.slice();
    this.particlePhases = phases;
  }

  setTimeOfDay(timeKey, onProgress = null) {
    if (!PALETTES[timeKey]) return;
    this.currentPreset = timeKey;
    const target = PALETTES[timeKey];

    const startSky = this.scene.background.clone();
    const endSky = new THREE.Color(target.sky);

    const startHemiSky = this.hemiLight.color.clone();
    const endHemiSky = new THREE.Color(target.hemiSky);
    const startHemiGround = this.hemiLight.groundColor.clone();
    const endHemiGround = new THREE.Color(target.hemiGround);

    const startDirColor = this.dirLight.color.clone();
    const endDirColor = new THREE.Color(target.dirLight);

    const startDirPos = this.dirLight.position.clone();
    const endDirPos = new THREE.Vector3(...target.dirPosition);

    const startHemiInt = this.hemiLight.intensity;
    const endHemiInt = target.hemiIntensity;

    const startDirInt = this.dirLight.intensity;
    const endDirInt = target.dirIntensity;

    const startFogDensity = this.scene.fog.density;
    const endFogDensity = target.fogDensity;

    const startParticleColor = this.particleMaterial.color.clone();
    const endParticleColor = new THREE.Color(target.particlesColor);

    const duration = 1200; // ms
    const startTime = performance.now();

    const animateTransition = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1.0);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad

      this.scene.background.lerpColors(startSky, endSky, ease);
      this.scene.fog.color.copy(this.scene.background);
      this.scene.fog.density = THREE.MathUtils.lerp(startFogDensity, endFogDensity, ease);

      this.hemiLight.color.lerpColors(startHemiSky, endHemiSky, ease);
      this.hemiLight.groundColor.lerpColors(startHemiGround, endHemiGround, ease);
      this.hemiLight.intensity = THREE.MathUtils.lerp(startHemiInt, endHemiInt, ease);

      this.dirLight.color.lerpColors(startDirColor, endDirColor, ease);
      this.dirLight.intensity = THREE.MathUtils.lerp(startDirInt, endDirInt, ease);
      this.dirLight.position.lerpVectors(startDirPos, endDirPos, ease);

      this.particleMaterial.color.lerpColors(startParticleColor, endParticleColor, ease);
      this.particleMaterial.opacity = target.firefliesVisible ? 0.9 : 0.4;

      if (onProgress) {
        onProgress(target, ease);
      }

      if (t < 1.0) {
        requestAnimationFrame(animateTransition);
      }
    };

    requestAnimationFrame(animateTransition);
  }

  update(delta, time) {
    if (!this.particles) return;

    const positions = this.particles.geometry.attributes.position.array;
    const count = positions.length / 3;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const phase = this.particlePhases[i];
      // Gentle floating sine wave motion
      positions[idx + 1] = this.initialParticlePositions[idx + 1] + Math.sin(time * 1.5 + phase) * 0.4;
      positions[idx] = this.initialParticlePositions[idx] + Math.cos(time * 0.8 + phase) * 0.2;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
  }
}
