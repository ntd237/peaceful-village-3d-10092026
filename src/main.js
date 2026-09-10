import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { PALETTES } from './config/palette.js';
import { Environment } from './scene/Environment.js';
import { Terrain } from './scene/Terrain.js';
import { Bridge } from './entities/Bridge.js';
import { Windmill } from './entities/Windmill.js';
import { Cottages } from './entities/Cottages.js';
import { Foliage } from './entities/Foliage.js';
import { Animals } from './entities/Animals.js';
import { SoundManager } from './audio/SoundManager.js';
import { UIManager } from './ui/UIManager.js';

class PeacefulVillageApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();

    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initControls();

    this.soundManager = new SoundManager();
    this.environment = new Environment(this.scene, this.renderer);
    this.terrain = new Terrain(this.scene);
    this.bridge = new Bridge(this.scene);
    this.windmill = new Windmill(this.scene);
    this.cottages = new Cottages(this.scene);
    this.foliage = new Foliage(this.scene);
    this.animals = new Animals(this.scene);

    this.uiManager = new UIManager(this);

    this.initRaycaster();
    this.initEvents();

    // Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    // Fade out loading screen
    setTimeout(() => {
      this.uiManager.hideLoader();
    }, 600);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.container.appendChild(this.renderer.domElement);
  }

  initScene() {
    this.scene = new THREE.Scene();
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      150
    );
    // Isometric diorama vantage point
    this.camera.position.set(18, 14, 20);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Comfort bounds: camera cannot sink below ground
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 55;
    this.controls.target.set(0, 1, 0);
  }

  initRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.interactiveObjects = [
      this.windmill.group,
      this.cottages.group,
      this.animals.group
    ];
  }

  initEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    const canvas = this.renderer.domElement;

    // Pointer move for hover detection
    canvas.addEventListener('pointermove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

      let foundInteractive = false;
      if (intersects.length > 0) {
        let current = intersects[0].object;
        while (current && current !== this.scene) {
          if (current.userData && current.userData.isInteractive) {
            foundInteractive = true;
            break;
          }
          current = current.parent;
        }
      }

      canvas.style.cursor = foundInteractive ? 'pointer' : 'default';
    });

    // Pointer click for entity interaction
    canvas.addEventListener('pointerdown', (event) => {
      // Only process main button
      if (event.button !== 0) return;

      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

      if (intersects.length > 0) {
        let current = intersects[0].object;
        let interactiveTarget = null;

        while (current && current !== this.scene) {
          if (current.userData && current.userData.isInteractive) {
            interactiveTarget = current;
            break;
          }
          current = current.parent;
        }

        if (interactiveTarget) {
          this.handleInteraction(interactiveTarget, intersects[0].point);
        }
      }
    });
  }

  handleInteraction(target, hitPoint) {
    const data = target.userData;
    if (!data) return;

    // 1. Play sound
    if (data.soundType) {
      if (data.soundType === 'sheep') this.soundManager.playSheep();
      else if (data.soundType === 'cow') this.soundManager.playCow();
      else if (data.soundType === 'chicken') this.soundManager.playChicken();
      else if (data.soundType === 'creak') this.soundManager.playCreak();
      else this.soundManager.playChime();
    }

    // 2. Trigger entity specific animation
    if (target === this.windmill.group) {
      this.windmill.onInteract();
    } else if (this.animals.interactiveAnimals.includes(target)) {
      this.animals.onInteract(target);
    }

    // 3. Show Speech Bubble in 3D space
    const bubblePos = target.position.clone();
    bubblePos.y += 1.3;
    if (target === this.windmill.group) bubblePos.y += 3.8;

    this.uiManager.showSpeechBubble(bubblePos, data.message || `✨ ${data.name}`);
  }

  setTimeOfDay(timeKey) {
    this.environment.setTimeOfDay(timeKey, (preset, progress) => {
      // Synchronize window glow intensity
      const targetGlow = preset.windowEmissiveIntensity;
      this.cottages.setWindowGlow(targetGlow);
    });
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // Update all systems
    this.controls.update();
    this.terrain.update(delta, time);
    this.environment.update(delta, time);
    this.windmill.update(delta, time);
    this.cottages.update(delta, time);
    this.animals.update(delta, time);
    this.uiManager.update();

    // Render 3D scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new PeacefulVillageApp();
});
