import * as THREE from 'three';
import { NATURE_COLORS } from '../config/palette.js';

export class Bridge {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.createBridge();
  }

  createBridge() {
    // Position bridge across the river at Z = 0, spanning from X: -2.4 to X: 1.4
    const bridgeCenter = new THREE.Vector3(-0.5, 0.0, 0.0);
    this.group.position.copy(bridgeCenter);

    const woodMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.wood,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true
    });

    const woodDarkMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.woodDark,
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true
    });

    // 1. Arch Support Beams (2 side beams)
    const beamLength = 4.2;
    const beamWidth = 0.18;
    const beamHeight = 0.22;

    for (let side = -1; side <= 1; side += 2) {
      const zOffset = side * 0.95;
      
      // Segmented arch using 7 angled beam segments
      const segments = 7;
      for (let s = 0; s < segments; s++) {
        const t1 = s / segments;
        const t2 = (s + 1) / segments;
        
        const x1 = -beamLength / 2 + t1 * beamLength;
        const x2 = -beamLength / 2 + t2 * beamLength;
        
        // Parabolic arch formula: y = h * (1 - (2x / L)^2)
        const y1 = 0.55 * (1 - Math.pow(x1 / (beamLength * 0.52), 2));
        const y2 = 0.55 * (1 - Math.pow(x2 / (beamLength * 0.52), 2));
        
        const segLen = Math.hypot(x2 - x1, y2 - y1);
        const segGeo = new THREE.BoxGeometry(segLen, beamHeight, beamWidth);
        const segMesh = new THREE.Mesh(segGeo, woodDarkMat);
        
        segMesh.position.set((x1 + x2) / 2, (y1 + y2) / 2 + 0.1, zOffset);
        segMesh.rotation.z = Math.atan2(y2 - y1, x2 - x1);
        segMesh.castShadow = true;
        segMesh.receiveShadow = true;
        this.group.add(segMesh);
      }
    }

    // 2. Bridge Wooden Deck Planks
    const plankCount = 22;
    const plankWidth = 0.16;
    const plankLength = 2.1;
    const plankHeight = 0.07;
    const plankGeo = new THREE.BoxGeometry(plankWidth, plankHeight, plankLength);

    for (let i = 0; i < plankCount; i++) {
      const t = i / (plankCount - 1);
      const px = -beamLength / 2 + 0.15 + t * (beamLength - 0.3);
      const py = 0.55 * (1 - Math.pow(px / (beamLength * 0.52), 2)) + 0.22;

      const plank = new THREE.Mesh(plankGeo, i % 2 === 0 ? woodMat : woodDarkMat);
      // Slight rustic jitter
      plank.position.set(px, py, (Math.random() - 0.5) * 0.04);
      plank.rotation.y = (Math.random() - 0.5) * 0.04;
      plank.rotation.z = -px * 0.25; // Tilt along arch curve
      plank.castShadow = true;
      plank.receiveShadow = true;
      this.group.add(plank);
    }

    // 3. Wooden Support Pillars in the River
    const pillarGeo = new THREE.CylinderGeometry(0.12, 0.14, 2.0, 6);
    const pillarPositions = [
      [-1.0, -0.6, -0.95],
      [-1.0, -0.6, 0.95],
      [1.0, -0.6, -0.95],
      [1.0, -0.6, 0.95]
    ];

    pillarPositions.forEach(([px, py, pz]) => {
      const pillar = new THREE.Mesh(pillarGeo, woodDarkMat);
      pillar.position.set(px, py, pz);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.group.add(pillar);
    });

    // 4. Railing Posts & Handrails
    const postGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.85, 5);
    const handrailGeo = new THREE.BoxGeometry(beamLength * 0.98, 0.07, 0.09);

    for (let side = -1; side <= 1; side += 2) {
      const zOffset = side * 1.0;
      
      // 5 posts per side
      for (let p = 0; p < 5; p++) {
        const pt = p / 4;
        const postX = -beamLength / 2 + 0.2 + pt * (beamLength - 0.4);
        const postY = 0.55 * (1 - Math.pow(postX / (beamLength * 0.52), 2)) + 0.6;
        
        const post = new THREE.Mesh(postGeo, woodMat);
        post.position.set(postX, postY, zOffset);
        post.castShadow = true;
        this.group.add(post);
      }

      // Curved handrail (approximated with 3 sections)
      for (let h = 0; h < 3; h++) {
        const segL = beamLength / 3;
        const hx = -beamLength / 2 + (h + 0.5) * segL;
        const hy = 0.55 * (1 - Math.pow(hx / (beamLength * 0.52), 2)) + 0.95;
        const hRail = new THREE.Mesh(new THREE.BoxGeometry(segL * 1.05, 0.07, 0.08), woodDarkMat);
        hRail.position.set(hx, hy, zOffset);
        hRail.rotation.z = -hx * 0.22;
        hRail.castShadow = true;
        this.group.add(hRail);
      }
    }

    // 5. Small lantern on bridge entry post
    const lanternPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.4, 4),
      woodDarkMat
    );
    lanternPost.position.set(1.9, 0.65, 1.0);
    this.group.add(lanternPost);

    const lanternBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.24, 0.18),
      new THREE.MeshStandardMaterial({
        color: 0xffe3a0,
        emissive: 0xffaa00,
        emissiveIntensity: 0.8,
        roughness: 0.3
      })
    );
    lanternBox.position.set(1.9, 0.85, 1.0);
    this.group.add(lanternBox);
  }
}
