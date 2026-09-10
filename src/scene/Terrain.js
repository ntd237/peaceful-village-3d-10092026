import * as THREE from 'three';
import { NATURE_COLORS } from '../config/palette.js';

export class Terrain {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.waterMesh = null;
    this.waterVerticesOriginal = null;

    this.createDioramaBase();
    this.createRiver();
    this.createPaths();
  }

  /**
   * Helper function to get river center-X for a given Z
   * River curve equation: X = 2.8 * Math.sin(z * 0.22) - 0.5
   */
  getRiverX(z) {
    return 2.8 * Math.sin(z * 0.22) - 0.5;
  }

  createDioramaBase() {
    // 1. Top Island Grass Surface (Cylinder with low-poly subdivisions)
    const radius = 13.5;
    const height = 3.5;
    const radialSegments = 40;
    const heightSegments = 4;

    const islandGeo = new THREE.CylinderGeometry(
      radius,
      radius * 0.85,
      height,
      radialSegments,
      heightSegments
    );

    const posAttr = islandGeo.attributes.position;
    const vertex = new THREE.Vector3();

    // Deform vertices to create natural diorama terrain
    for (let i = 0; i < posAttr.count; i++) {
      vertex.fromBufferAttribute(posAttr, i);

      // Only deform the top surface and upper vertices
      if (vertex.y >= height / 2 - 0.1) {
        const distFromCenter = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
        const riverCenter = this.getRiverX(vertex.z);
        const distToRiver = Math.abs(vertex.x - riverCenter);

        // Carve river trench
        if (distToRiver < 2.2) {
          const depthFactor = Math.cos((distToRiver / 2.2) * (Math.PI / 2));
          vertex.y -= depthFactor * 0.65;
        }

        // Windmill hill on the west/back side (X: -6.5, Z: -4.5)
        const distToHill = Math.hypot(vertex.x + 6.5, vertex.z + 4.5);
        if (distToHill < 5.5) {
          vertex.y += (1 - distToHill / 5.5) * 1.35;
        }

        // Village cottage terrace on the east side (X: 5.5, Z: -2.0)
        const distToVillage = Math.hypot(vertex.x - 5.5, vertex.z + 2.0);
        if (distToVillage < 5.0) {
          vertex.y += (1 - distToVillage / 5.0) * 0.45;
        }

        // Organic low-poly undulating surface noise
        const noise = Math.sin(vertex.x * 0.7) * Math.cos(vertex.z * 0.7) * 0.18;
        vertex.y += noise;

        // Taper outer rim downwards slightly
        if (distFromCenter > radius * 0.85) {
          const rimFactor = (distFromCenter - radius * 0.85) / (radius * 0.15);
          vertex.y -= rimFactor * 0.4;
        }
      } else {
        // Lower subterranean rocky side deformation
        const angle = Math.atan2(vertex.z, vertex.x);
        const rNoise = (Math.sin(angle * 6) + Math.cos(angle * 4)) * 0.25;
        vertex.x += (vertex.x / radius) * rNoise;
        vertex.z += (vertex.z / radius) * rNoise;
      }

      posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    islandGeo.computeVertexNormals();

    // Material with Vertex Colors or Multi-Material
    const grassMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.grassMid,
      flatShading: true,
      roughness: 0.85,
      metalness: 0.05
    });

    const cliffMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.earthCliff,
      flatShading: true,
      roughness: 0.95,
      metalness: 0.0
    });

    // Create dual-zone material assignment
    const baseMesh = new THREE.Mesh(islandGeo, [grassMat, cliffMat, grassMat]);
    baseMesh.position.y = -height / 2;
    baseMesh.receiveShadow = true;
    this.group.add(baseMesh);

    // Decorative cliff layer rim
    const bottomGeo = new THREE.CylinderGeometry(radius * 0.85, 0.1, 1.8, 24);
    const bottomMesh = new THREE.Mesh(bottomGeo, cliffMat);
    bottomMesh.position.y = -height - 0.9;
    this.group.add(bottomMesh);
  }

  createRiver() {
    // Ribbon curved river geometry traversing across the island
    const riverLength = 26;
    const riverSegments = 50;
    const halfWidth = 1.9;

    const riverGeo = new THREE.PlaneGeometry(halfWidth * 2, riverLength, 8, riverSegments);
    riverGeo.rotateX(-Math.PI / 2);

    const posAttr = riverGeo.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < posAttr.count; i++) {
      vertex.fromBufferAttribute(posAttr, i);

      // Curve along the S-channel
      const riverCenter = this.getRiverX(vertex.z);
      vertex.x += riverCenter;
      vertex.y = -0.22 + Math.sin(vertex.z * 0.5) * 0.02; // Just below ground level

      posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    riverGeo.computeVertexNormals();
    this.waterVerticesOriginal = posAttr.array.slice();

    const waterMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.water,
      roughness: 0.12,
      metalness: 0.15,
      transparent: true,
      opacity: 0.82,
      flatShading: true
    });

    this.waterMesh = new THREE.Mesh(riverGeo, waterMat);
    this.waterMesh.receiveShadow = true;
    this.group.add(this.waterMesh);

    // River bed foam edge strips
    const foamGeo = new THREE.BufferGeometry();
    // Subtle foam ribbon along banks
    const foamMat = new THREE.MeshBasicMaterial({
      color: NATURE_COLORS.waterFoam,
      transparent: true,
      opacity: 0.55
    });
  }

  createPaths() {
    // Dirt roads connecting village houses, bridge, and windmill
    const pathGroup = new THREE.Group();

    const pathMat = new THREE.MeshStandardMaterial({
      color: 0xcbb799,
      roughness: 0.95,
      metalness: 0.0,
      flatShading: true
    });

    const stoneMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.stoneLight,
      roughness: 0.9,
      flatShading: true
    });

    // Path 1: From Village square (X: 4.5, Z: 0) to Bridge (X: 0, Z: 0)
    const p1Geo = new THREE.BoxGeometry(4.8, 0.06, 1.4);
    const p1 = new THREE.Mesh(p1Geo, pathMat);
    p1.position.set(2.4, 0.04, 0.0);
    p1.rotation.y = -0.05;
    p1.receiveShadow = true;
    pathGroup.add(p1);

    // Path 2: From Bridge (X: 0, Z: 0) climbing up to Windmill (X: -6.5, Z: -4.5)
    const p2Geo = new THREE.BoxGeometry(6.2, 0.06, 1.3);
    const p2 = new THREE.Mesh(p2Geo, pathMat);
    p2.position.set(-3.2, 0.45, -2.2);
    p2.rotation.y = 0.65;
    p2.rotation.z = 0.12;
    p2.receiveShadow = true;
    pathGroup.add(p2);

    // Path 3: Branching to the animal farmyard (X: 4.5, Z: -5.0)
    const p3Geo = new THREE.BoxGeometry(1.2, 0.06, 4.5);
    const p3 = new THREE.Mesh(p3Geo, pathMat);
    p3.position.set(4.8, 0.08, -2.8);
    p3.rotation.y = 0.1;
    p3.receiveShadow = true;
    pathGroup.add(p3);

    // Cobblestone stepping stones scattered along the path
    const stoneGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.06, 6);
    for (let i = 0; i < 28; i++) {
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      const t = i / 28;
      let px, pz, py;

      if (i < 12) {
        // Path to bridge
        px = 0.5 + t * 9;
        pz = (Math.random() - 0.5) * 0.7;
        py = 0.06;
      } else {
        // Path to windmill
        const progress = (i - 12) / 16;
        px = -0.8 - progress * 5.2 + (Math.random() - 0.5) * 0.5;
        pz = -progress * 4.2 + (Math.random() - 0.5) * 0.5;
        py = 0.08 + progress * 0.85;
      }

      stone.position.set(px, py, pz);
      stone.rotation.y = Math.random() * Math.PI;
      stone.scale.set(
        0.8 + Math.random() * 0.5,
        1,
        0.8 + Math.random() * 0.5
      );
      stone.receiveShadow = true;
      pathGroup.add(stone);
    }

    this.group.add(pathGroup);
  }

  update(delta, time) {
    // Water vertex wave animation
    if (!this.waterMesh || !this.waterVerticesOriginal) return;

    const posAttr = this.waterMesh.geometry.attributes.position;
    const count = posAttr.count;

    for (let i = 0; i < count; i++) {
      const origX = this.waterVerticesOriginal[i * 3];
      const origY = this.waterVerticesOriginal[i * 3 + 1];
      const origZ = this.waterVerticesOriginal[i * 3 + 2];

      // Traveling ripples along Z and across X
      const wave1 = Math.sin(origZ * 1.5 + time * 2.8) * 0.035;
      const wave2 = Math.cos(origX * 3.0 + time * 2.0) * 0.02;

      posAttr.setY(i, origY + wave1 + wave2);
    }

    posAttr.needsUpdate = true;
    this.waterMesh.geometry.computeVertexNormals();
  }
}
