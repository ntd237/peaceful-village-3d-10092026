import * as THREE from 'three';
import { NATURE_COLORS } from '../config/palette.js';

export class Cottages {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.windowMaterials = [];
    this.smokeSystems = [];

    this.createCottage1(); // Main Village House
    this.createCottage2(); // Farmhouse / Barn
    this.createCottage3(); // River Cottage
  }

  createWindowMaterial() {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xffaa00,
      emissiveIntensity: 0.25,
      roughness: 0.3,
      flatShading: true
    });
    this.windowMaterials.push(mat);
    return mat;
  }

  createChimneySmoke(chimneyWorldPos) {
    const puffCount = 14;
    const puffs = [];
    const smokeGroup = new THREE.Group();
    smokeGroup.position.copy(chimneyWorldPos);

    const smokeGeo = new THREE.DodecahedronGeometry(0.24, 1);
    const smokeMat = new THREE.MeshStandardMaterial({
      color: 0xedf2f4,
      transparent: true,
      opacity: 0.65,
      roughness: 0.9,
      flatShading: true
    });

    for (let i = 0; i < puffCount; i++) {
      const mesh = new THREE.Mesh(smokeGeo, smokeMat.clone());
      // Random staggered initial progress [0, 1]
      const progress = i / puffCount;
      mesh.userData = {
        progress: progress,
        speed: 0.25 + Math.random() * 0.1,
        driftX: (Math.random() - 0.5) * 0.4,
        driftZ: (Math.random() - 0.5) * 0.4,
        initialScale: 0.3 + Math.random() * 0.2
      };
      smokeGroup.add(mesh);
      puffs.push(mesh);
    }

    this.scene.add(smokeGroup);
    this.smokeSystems.push({ group: smokeGroup, puffs });
  }

  createCottage1() {
    // Main Village House at (5.5, 0.2, 1.8)
    const house = new THREE.Group();
    house.position.set(5.5, 0.2, 1.8);
    house.rotation.y = -0.35;

    const wallMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.wallCream,
      roughness: 0.85,
      flatShading: true
    });
    const woodMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.woodDark,
      roughness: 0.8,
      flatShading: true
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.roofRed,
      roughness: 0.75,
      flatShading: true
    });
    const stoneMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.stoneDark,
      roughness: 0.9,
      flatShading: true
    });
    const winMat = this.createWindowMaterial();

    // 1. Foundation
    const foundGeo = new THREE.BoxGeometry(3.6, 0.4, 2.8);
    const foundMesh = new THREE.Mesh(foundGeo, stoneMat);
    foundMesh.position.y = 0.2;
    foundMesh.castShadow = true;
    foundMesh.receiveShadow = true;
    house.add(foundMesh);

    // 2. Main Walls
    const wallGeo = new THREE.BoxGeometry(3.4, 2.0, 2.6);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.y = 1.4;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    house.add(wallMesh);

    // Decorative Timber framing
    const beamGeo = new THREE.BoxGeometry(0.12, 2.02, 0.12);
    [[-1.68, 1.28], [1.68, 1.28], [-1.68, -1.28], [1.68, -1.28]].forEach(([bx, bz]) => {
      const beam = new THREE.Mesh(beamGeo, woodMat);
      beam.position.set(bx, 1.4, bz);
      house.add(beam);
    });

    // 3. Steep Pitched Gabled Roof (Prism)
    const roofGeo = new THREE.ConeGeometry(2.3, 1.6, 4);
    roofGeo.rotateY(Math.PI / 4);
    roofGeo.scale(1.2, 1.0, 1.5);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.y = 3.2;
    roofMesh.castShadow = true;
    house.add(roofMesh);

    // 4. Windows
    const winGeo = new THREE.BoxGeometry(0.5, 0.6, 0.08);
    // Front window
    const w1 = new THREE.Mesh(winGeo, winMat);
    w1.position.set(0.7, 1.5, 1.32);
    house.add(w1);
    // Upper dormer window
    const w2 = new THREE.Mesh(winGeo, winMat);
    w2.position.set(-0.7, 1.5, 1.32);
    house.add(w2);

    // 5. Wooden Door
    const doorGeo = new THREE.BoxGeometry(0.6, 1.2, 0.1);
    const door = new THREE.Mesh(doorGeo, woodMat);
    door.position.set(0.0, 1.0, 1.32);
    door.castShadow = true;
    house.add(door);

    // 6. Stone Chimney
    const chimGeo = new THREE.BoxGeometry(0.5, 2.4, 0.5);
    const chim = new THREE.Mesh(chimGeo, stoneMat);
    chim.position.set(-1.1, 2.8, -0.4);
    chim.castShadow = true;
    house.add(chim);

    this.group.add(house);

    // Calculate world position for chimney smoke
    const chimWorld = new THREE.Vector3(-1.1, 4.0, -0.4).applyEuler(house.rotation).add(house.position);
    this.createChimneySmoke(chimWorld);

    house.userData = {
      isInteractive: true,
      name: 'Tiệm Bánh Ngọt Làng Quê',
      soundType: 'chime',
      message: '🍞 Ngôi nhà phảng phất mùi bánh mì nướng thơm lừng!'
    };
  }

  createCottage2() {
    // Farmhouse / Barn at (6.8, 0.1, -4.2)
    const barn = new THREE.Group();
    barn.position.set(6.8, 0.1, -4.2);
    barn.rotation.y = 0.25;

    const wallMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.wood,
      roughness: 0.9,
      flatShading: true
    });
    const thatchMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.roofStraw,
      roughness: 0.85,
      flatShading: true
    });
    const woodDarkMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.woodDark,
      roughness: 0.85,
      flatShading: true
    });
    const winMat = this.createWindowMaterial();

    // 1. Barn Body
    const barnGeo = new THREE.BoxGeometry(4.2, 2.2, 3.0);
    const barnMesh = new THREE.Mesh(barnGeo, wallMat);
    barnMesh.position.y = 1.1;
    barnMesh.castShadow = true;
    barnMesh.receiveShadow = true;
    barn.add(barnMesh);

    // 2. Thatched Gambrel/Curved Roof
    const roofGeo = new THREE.CylinderGeometry(1.8, 2.4, 4.5, 6);
    roofGeo.rotateZ(Math.PI / 2);
    const roofMesh = new THREE.Mesh(roofGeo, thatchMat);
    roofMesh.position.y = 2.8;
    roofMesh.castShadow = true;
    barn.add(roofMesh);

    // 3. Double Barn Doors
    const doorGeo = new THREE.BoxGeometry(1.4, 1.6, 0.1);
    const door = new THREE.Mesh(doorGeo, woodDarkMat);
    door.position.set(0, 0.8, 1.52);
    barn.add(door);

    // 4. Windows on side
    const winGeo = new THREE.BoxGeometry(0.5, 0.5, 0.08);
    const w1 = new THREE.Mesh(winGeo, winMat);
    w1.position.set(1.4, 1.4, 1.52);
    barn.add(w1);

    // 5. Hay bales and crates beside barn
    const baleGeo = new THREE.BoxGeometry(0.7, 0.5, 0.9);
    const baleMat = new THREE.MeshStandardMaterial({ color: 0xdda15e, flatShading: true });
    for (let b = 0; b < 3; b++) {
      const bale = new THREE.Mesh(baleGeo, baleMat);
      bale.position.set(-2.5, 0.25 + (b === 2 ? 0.45 : 0), -0.5 + b * 0.7);
      bale.rotation.y = (b * 0.4);
      bale.castShadow = true;
      barn.add(bale);
    }

    // 6. Rustic Stove Chimney
    const stoneMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.stoneDark,
      roughness: 0.9,
      flatShading: true
    });
    const chimGeo = new THREE.CylinderGeometry(0.2, 0.25, 2.0, 6);
    const chim = new THREE.Mesh(chimGeo, stoneMat);
    chim.position.set(1.5, 3.4, -0.6);
    chim.castShadow = true;
    barn.add(chim);

    this.group.add(barn);

    const chimWorld = new THREE.Vector3(1.5, 4.4, -0.6).applyEuler(barn.rotation).add(barn.position);
    this.createChimneySmoke(chimWorld);

    barn.userData = {
      isInteractive: true,
      name: 'Nhà Kho Nông Trại',
      soundType: 'wood',
      message: '🌾 Nhà kho chứa đầy cỏ khô và hạt bắp vàng ươm.'
    };
  }

  createCottage3() {
    // River Cottage at (2.2, 0.0, 5.4)
    const cottage = new THREE.Group();
    cottage.position.set(2.2, 0.05, 5.4);
    cottage.rotation.y = -0.7;

    const wallMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.wallWhite,
      roughness: 0.85,
      flatShading: true
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.roofOrange,
      roughness: 0.75,
      flatShading: true
    });
    const stoneMat = new THREE.MeshStandardMaterial({
      color: NATURE_COLORS.stoneLight,
      roughness: 0.9,
      flatShading: true
    });
    const winMat = this.createWindowMaterial();

    // 1. Base
    const baseGeo = new THREE.BoxGeometry(2.6, 1.8, 2.2);
    const baseMesh = new THREE.Mesh(baseGeo, wallMat);
    baseMesh.position.y = 0.9;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    cottage.add(baseMesh);

    // 2. Roof
    const roofGeo = new THREE.ConeGeometry(1.8, 1.3, 4);
    roofGeo.rotateY(Math.PI / 4);
    roofGeo.scale(1.1, 1.0, 1.3);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.y = 2.4;
    roofMesh.castShadow = true;
    cottage.add(roofMesh);

    // 3. River Deck / Patio
    const deckGeo = new THREE.BoxGeometry(1.4, 0.1, 1.8);
    const deckMat = new THREE.MeshStandardMaterial({ color: NATURE_COLORS.woodDark, flatShading: true });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(-1.8, 0.1, 0.0);
    deck.castShadow = true;
    deck.receiveShadow = true;
    cottage.add(deck);

    // 4. Windows with flower planters
    const winGeo = new THREE.BoxGeometry(0.45, 0.55, 0.08);
    const w = new THREE.Mesh(winGeo, winMat);
    w.position.set(0.0, 1.0, 1.12);
    cottage.add(w);

    const planterGeo = new THREE.BoxGeometry(0.55, 0.15, 0.2);
    const planter = new THREE.Mesh(planterGeo, deckMat);
    planter.position.set(0.0, 0.65, 1.2);
    cottage.add(planter);

    // Small chimney with smoke
    const chim = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.8, 0.35), stoneMat);
    chim.position.set(0.8, 2.2, -0.5);
    chim.castShadow = true;
    cottage.add(chim);

    this.group.add(cottage);

    const chimWorld = new THREE.Vector3(0.8, 3.1, -0.5).applyEuler(cottage.rotation).add(cottage.position);
    this.createChimneySmoke(chimWorld);

    cottage.userData = {
      isInteractive: true,
      name: 'Ngôi Nhà Bên Bờ Suối',
      soundType: 'water',
      message: '🌊 Ngôi nhà nhỏ yên ả lắng nghe tiếng suối reo róc rách.'
    };
  }

  setWindowGlow(intensity) {
    this.windowMaterials.forEach(mat => {
      mat.emissiveIntensity = intensity;
    });
  }

  update(delta, time) {
    // Animate chimney smoke particles
    for (const sys of this.smokeSystems) {
      for (const puff of sys.puffs) {
        const u = puff.userData;
        u.progress += u.speed * delta;
        if (u.progress > 1.0) {
          u.progress = 0;
        }

        const p = u.progress;
        // Float upwards and expand
        puff.position.y = p * 2.8;
        puff.position.x = Math.sin(time * 0.8 + p * 4) * 0.25 + p * u.driftX * 2.5;
        puff.position.z = Math.cos(time * 0.6 + p * 3) * 0.2 + p * u.driftZ * 2.5;

        // Scale grows from small to large
        const currentScale = u.initialScale * (0.4 + p * 1.8);
        puff.scale.setScalar(currentScale);

        // Alpha fades out as it reaches the top
        puff.material.opacity = Math.max(0, (1 - p) * 0.6);
      }
    }
  }
}
