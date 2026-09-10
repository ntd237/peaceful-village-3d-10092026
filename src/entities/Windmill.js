import * as THREE from 'three';
import { NATURE_COLORS } from '../config/palette.js';

export class Windmill {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.bladesGroup = null;
    this.spinSpeed = 0.65; // rad/s
    this.targetSpeed = 0.65;

    this.createWindmill();
  }

  createWindmill() {
    // Placed upon the hill at (-6.5, 1.35, -4.5)
    this.group.position.set(-6.5, 1.35, -4.5);
    this.group.rotation.y = 0.45; // Facing slightly toward the village center

    const stoneMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.stoneLight,
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true
    });

    const woodMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.wood,
      roughness: 0.85,
      flatShading: true
    });

    const woodDarkMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.woodDark,
      roughness: 0.9,
      flatShading: true
    });

    const roofMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.roofOrange,
      roughness: 0.8,
      flatShading: true
    });

    const sailMat = new THREE.MeshStandardMaterial({
      color: 0xfdf0d5,
      roughness: 0.7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      flatShading: true
    });

    // 1. Lower Stone Foundation (Octagonal prism)
    const baseHeight = 1.4;
    const baseGeo = new THREE.CylinderGeometry(1.9, 2.2, baseHeight, 8);
    const baseMesh = new THREE.Mesh(baseGeo, stoneMat);
    baseMesh.position.y = baseHeight / 2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    this.group.add(baseMesh);

    // Rustic arched wooden entry door
    const doorGeo = new THREE.BoxGeometry(0.65, 0.95, 0.15);
    const doorMesh = new THREE.Mesh(doorGeo, woodDarkMat);
    doorMesh.position.set(0, 0.5, 2.05);
    doorMesh.castShadow = true;
    this.group.add(doorMesh);

    // 2. Middle & Upper Tower (Tapered wood/timber)
    const towerHeight = 3.6;
    const towerGeo = new THREE.CylinderGeometry(1.3, 1.85, towerHeight, 8);
    const towerMesh = new THREE.Mesh(towerGeo, woodMat);
    towerMesh.position.y = baseHeight + towerHeight / 2;
    towerMesh.castShadow = true;
    towerMesh.receiveShadow = true;
    this.group.add(towerMesh);

    // Decorative balcony platform around middle
    const balconyGeo = new THREE.CylinderGeometry(1.85, 1.85, 0.12, 8);
    const balconyMesh = new THREE.Mesh(balconyGeo, woodDarkMat);
    balconyMesh.position.y = baseHeight + 1.8;
    balconyMesh.castShadow = true;
    this.group.add(balconyMesh);

    // 3. Conical Roof
    const roofHeight = 1.6;
    const roofGeo = new THREE.ConeGeometry(1.7, roofHeight, 8);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.y = baseHeight + towerHeight + roofHeight / 2;
    roofMesh.castShadow = true;
    this.group.add(roofMesh);

    // 4. Rotor Axle Hub & Blades Assembly
    this.rotorCenter = new THREE.Group();
    // Positioned near roof peak, protruding forward
    const hubY = baseHeight + towerHeight + 0.35;
    const hubZ = 1.45;
    this.rotorCenter.position.set(0, hubY, hubZ);
    this.group.add(this.rotorCenter);

    // Axle shaft projecting forward
    const axleGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.65, 6);
    axleGeo.rotateX(Math.PI / 2);
    const axleMesh = new THREE.Mesh(axleGeo, woodDarkMat);
    this.rotorCenter.add(axleMesh);

    // Rotating Blades Group
    this.bladesGroup = new THREE.Group();
    this.bladesGroup.position.set(0, 0, 0.35);
    this.rotorCenter.add(this.bladesGroup);

    // Create 4 Blades (Cross formation)
    const bladeSpan = 3.4; // Radius of blades
    for (let b = 0; b < 4; b++) {
      const angle = (b * Math.PI) / 2;
      const armGroup = new THREE.Group();
      armGroup.rotation.z = angle;

      // Wooden spar arm
      const armGeo = new THREE.BoxGeometry(0.08, bladeSpan, 0.08);
      const armMesh = new THREE.Mesh(armGeo, woodDarkMat);
      armMesh.position.y = bladeSpan / 2;
      armMesh.castShadow = true;
      armGroup.add(armMesh);

      // Lattice crossbars
      for (let bar = 1; bar <= 6; bar++) {
        const barY = 0.6 + bar * 0.42;
        const barGeo = new THREE.BoxGeometry(0.55, 0.04, 0.04);
        const barMesh = new THREE.Mesh(barGeo, woodDarkMat);
        barMesh.position.set(0.25, barY, 0.02);
        armGroup.add(barMesh);
      }

      // Canvas sailcloth sheet on one side of arm
      const clothGeo = new THREE.PlaneGeometry(0.52, bladeSpan - 0.7);
      const clothMesh = new THREE.Mesh(clothGeo, sailMat);
      clothMesh.position.set(0.26, (bladeSpan + 0.5) / 2, 0.04);
      clothMesh.castShadow = true;
      armGroup.add(clothMesh);

      this.bladesGroup.add(armGroup);
    }

    // Set interactivity metadata
    this.group.userData = {
      isInteractive: true,
      name: 'Cối xay gió',
      soundType: 'creak',
      message: '💨 Cối xay gió đang xoay tít đón gió mát lành!'
    };
  }

  onInteract() {
    // Temporarily spin faster on click
    this.targetSpeed = 2.4;
    setTimeout(() => {
      this.targetSpeed = 0.65;
    }, 2500);
  }

  update(delta, time) {
    if (this.bladesGroup) {
      // Smoothly interpolate spin speed
      this.spinSpeed += (this.targetSpeed - this.spinSpeed) * 0.04;
      this.bladesGroup.rotation.z += this.spinSpeed * delta;
    }
  }
}
