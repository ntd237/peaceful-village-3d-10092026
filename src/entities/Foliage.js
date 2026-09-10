import * as THREE from 'three';
import { NATURE_COLORS } from '../config/palette.js';

export class Foliage {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.createFarmFences();
    this.createPineTrees();
    this.createPuffyTrees();
    this.createFlowers();
    this.createBoulders();
  }

  createFarmFences() {
    // Farmyard enclosure around X: 5.0 to 8.5, Z: -4.8 to -7.8
    const fenceGroup = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.wood,
      roughness: 0.9,
      flatShading: true
    });

    const postGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.9, 5);
    const railGeo = new THREE.BoxGeometry(1.6, 0.08, 0.04);

    // Define fence perimeter posts
    const fencePosts = [
      // North fence
      [3.8, -4.8], [5.2, -4.8], [6.6, -4.8], [8.0, -4.8],
      // East fence
      [8.0, -6.0], [8.0, -7.2], [8.0, -8.4],
      // South fence
      [6.6, -8.4], [5.2, -8.4], [3.8, -8.4],
      // West fence (leaves a gate opening between -4.8 and -6.0)
      [3.8, -7.2], [3.8, -6.0]
    ];

    fencePosts.forEach(([fx, fz]) => {
      const post = new THREE.Mesh(postGeo, woodMat);
      post.position.set(fx, 0.45, fz);
      post.rotation.y = (Math.random() - 0.5) * 0.2;
      post.castShadow = true;
      post.receiveShadow = true;
      fenceGroup.add(post);
    });

    // Rails connecting posts
    for (let i = 0; i < fencePosts.length; i++) {
      const nextIdx = (i + 1) % fencePosts.length;
      // Skip gap for gate entrance
      if (i === 11) continue; // West gate opening

      const [x1, z1] = fencePosts[i];
      const [x2, z2] = fencePosts[nextIdx];

      const midX = (x1 + x2) / 2;
      const midZ = (z1 + z2) / 2;
      const angle = Math.atan2(z2 - z1, x2 - x1);
      const dist = Math.hypot(x2 - x1, z2 - z1);

      const rGeo = new THREE.BoxGeometry(dist * 1.05, 0.07, 0.04);
      
      // Upper rail
      const r1 = new THREE.Mesh(rGeo, woodMat);
      r1.position.set(midX, 0.65, midZ);
      r1.rotation.y = -angle;
      r1.castShadow = true;
      fenceGroup.add(r1);

      // Lower rail
      const r2 = new THREE.Mesh(rGeo, woodMat);
      r2.position.set(midX, 0.35, midZ);
      r2.rotation.y = -angle;
      r2.castShadow = true;
      fenceGroup.add(r2);
    }

    this.group.add(fenceGroup);
  }

  createPineTrees() {
    // 35 Low-Poly Pine Trees
    const trunkMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.woodDark,
      roughness: 0.9,
      flatShading: true
    });
    const pineMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.foliagePine,
      roughness: 0.8,
      flatShading: true
    });

    const pineLocations = [
      // Along north & west outskirts
      [-8.5, -6.5], [-9.5, -4.0], [-10.2, -1.5], [-8.8, 1.2], [-9.5, 4.2],
      [-7.2, 6.8], [-4.8, 8.2], [-2.2, 9.5], [1.0, 9.8], [4.5, 9.2],
      // Hill slopes around windmill
      [-8.0, -2.5], [-5.2, -7.5], [-3.8, -8.5], [-6.2, -9.0],
      // East outskirts behind cottages
      [9.5, 0.5], [10.2, 2.8], [8.8, 4.5], [9.8, -2.0], [10.5, -4.5],
      [7.2, 7.5], [8.5, 6.2], [9.8, -7.2], [5.5, 9.5], [-0.5, 10.2],
      // River bend groves
      [-3.5, 3.5], [-4.5, 5.0], [0.5, -6.5], [-1.5, -7.8]
    ];

    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 1.2, 5);
    const cone1Geo = new THREE.ConeGeometry(1.2, 1.5, 5);
    const cone2Geo = new THREE.ConeGeometry(0.95, 1.3, 5);
    const cone3Geo = new THREE.ConeGeometry(0.7, 1.1, 5);

    pineLocations.forEach(([x, z]) => {
      const tree = new THREE.Group();
      const scale = 0.75 + Math.random() * 0.45;
      tree.scale.setScalar(scale);

      // Determine height from ground
      let y = 0.0;
      const distToHill = Math.hypot(x + 6.5, z + 4.5);
      if (distToHill < 5.5) y += (1 - distToHill / 5.5) * 1.35;

      tree.position.set(x, y, z);
      tree.rotation.y = Math.random() * Math.PI * 2;

      // Trunk
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.6;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      tree.add(trunk);

      // 3 Cone foliage tiers
      const c1 = new THREE.Mesh(cone1Geo, pineMat);
      c1.position.y = 1.6;
      c1.castShadow = true;
      tree.add(c1);

      const c2 = new THREE.Mesh(cone2Geo, pineMat);
      c2.position.y = 2.4;
      c2.castShadow = true;
      tree.add(c2);

      const c3 = new THREE.Mesh(cone3Geo, pineMat);
      c3.position.y = 3.1;
      c3.castShadow = true;
      tree.add(c3);

      this.group.add(tree);
    });
  }

  createPuffyTrees() {
    // Ghibli style puffy round trees
    const trunkMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.wood,
      roughness: 0.9,
      flatShading: true
    });

    const leavesMats = [
      new THREE.MeshStandardMaterial({ color: NATURE_COLORS.foliageBright, roughness: 0.85, flatShading: true }),
      new THREE.MeshStandardMaterial({ color: NATURE_COLORS.foliageMint, roughness: 0.85, flatShading: true }),
      new THREE.MeshStandardMaterial({ color: NATURE_COLORS.foliageAutumn, roughness: 0.85, flatShading: true })
    ];

    const puffyLocations = [
      // Near village cottages
      [3.2, 0.8], [4.2, 4.0], [7.2, 0.2], [7.8, 3.2], [1.2, 3.8],
      // Near bridge and river bank
      [-1.8, -1.8], [1.8, -2.2], [-2.2, 1.5], [2.2, -4.5],
      // Near farm and paths
      [2.8, -3.2], [3.2, -6.5], [5.0, -2.5], [-4.0, -1.5], [-5.0, 1.2]
    ];

    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.25, 1.8, 6);
    const puffGeo = new THREE.DodecahedronGeometry(0.9, 1);

    puffyLocations.forEach(([x, z], i) => {
      const tree = new THREE.Group();
      const scale = 0.8 + Math.random() * 0.45;
      tree.scale.setScalar(scale);

      let y = 0.0;
      const distToHill = Math.hypot(x + 6.5, z + 4.5);
      if (distToHill < 5.5) y += (1 - distToHill / 5.5) * 1.35;

      tree.position.set(x, y, z);
      tree.rotation.y = Math.random() * Math.PI * 2;

      // Trunk
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.9;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      tree.add(trunk);

      // Puffy foliage crown composed of 4 intersecting dodecahedrons
      const mat = leavesMats[i % leavesMats.length];

      const pCenter = new THREE.Mesh(puffGeo, mat);
      pCenter.position.set(0, 2.3, 0);
      pCenter.castShadow = true;
      tree.add(pCenter);

      const offsets = [
        [0.45, 2.5, 0.3, 0.75],
        [-0.45, 2.2, -0.3, 0.7],
        [0.2, 2.8, -0.25, 0.65],
        [-0.3, 2.4, 0.4, 0.6]
      ];

      offsets.forEach(([ox, oy, oz, s]) => {
        const p = new THREE.Mesh(puffGeo, mat);
        p.position.set(ox, oy, oz);
        p.scale.setScalar(s);
        p.castShadow = true;
        tree.add(p);
      });

      this.group.add(tree);
    });
  }

  createFlowers() {
    // 160 Wild flowers using InstancedMesh for maximum efficiency
    const flowerCount = 180;
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4);
    const headGeo = new THREE.DodecahedronGeometry(0.1, 0);

    const colors = [
      NATURE_COLORS.flowerYellow,
      NATURE_COLORS.flowerRed,
      NATURE_COLORS.flowerWhite,
      NATURE_COLORS.flowerBlue
    ];

    const flowerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      flatShading: true,
      roughness: 0.6
    });

    const instancedMesh = new THREE.InstancedMesh(headGeo, flowerMat, flowerCount);
    instancedMesh.castShadow = true;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < flowerCount; i++) {
      // Clustered around paths, cottages, and river
      const angle = Math.random() * Math.PI * 2;
      const dist = 2.0 + Math.random() * 9.5;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      // Skip inside river channel
      const riverCenter = 2.8 * Math.sin(z * 0.22) - 0.5;
      if (Math.abs(x - riverCenter) < 1.4) {
        dummy.position.set(0, -100, 0); // Hide
      } else {
        dummy.position.set(x, 0.15 + Math.random() * 0.08, z);
        dummy.scale.setScalar(0.7 + Math.random() * 0.7);
        dummy.rotation.set(
          (Math.random() - 0.5) * 0.3,
          Math.random() * Math.PI,
          (Math.random() - 0.5) * 0.3
        );
      }

      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);

      color.setHex(colors[i % colors.length]);
      instancedMesh.setColorAt(i, color);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
    this.group.add(instancedMesh);
  }

  createBoulders() {
    // 45 Smooth boulders lining river banks and hill edge
    const boulderCount = 45;
    const boulderGeo = new THREE.DodecahedronGeometry(0.4, 1);
    const boulderMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.stoneLight,
      roughness: 0.9,
      flatShading: true
    });

    const instancedBoulders = new THREE.InstancedMesh(boulderGeo, boulderMat, boulderCount);
    instancedBoulders.castShadow = true;
    instancedBoulders.receiveShadow = true;

    const dummy = new THREE.Object3D();

    for (let i = 0; i < boulderCount; i++) {
      const z = (i / boulderCount) * 22 - 11;
      const riverCenter = 2.8 * Math.sin(z * 0.22) - 0.5;
      const side = i % 2 === 0 ? 1 : -1;
      const x = riverCenter + side * (1.6 + Math.random() * 0.9);

      dummy.position.set(x, -0.05 + Math.random() * 0.15, z);
      dummy.scale.set(
        0.6 + Math.random() * 0.7,
        0.4 + Math.random() * 0.5,
        0.6 + Math.random() * 0.7
      );
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      dummy.updateMatrix();
      instancedBoulders.setMatrixAt(i, dummy.matrix);
    }

    instancedBoulders.instanceMatrix.needsUpdate = true;
    this.group.add(instancedBoulders);
  }
}
