import * as THREE from 'three';

export class Animals {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.interactiveAnimals = [];
    this.sheepList = [];
    this.cow = null;
    this.chickens = [];

    this.createSheep();
    this.createCow();
    this.createChickens();
  }

  createSheep() {
    // 3 sheep placed near the farm pasture
    const sheepConfigs = [
      { x: 4.8, z: -5.8, rot: 0.4 },
      { x: 6.5, z: -6.8, rot: -1.2 },
      { x: 5.6, z: -7.5, rot: 2.1 }
    ];

    const woolMat = new THREE.MeshStandardMaterial({
      color: 0xf8f9fa,
      roughness: 0.9,
      flatShading: true
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x2b2d42,
      roughness: 0.8,
      flatShading: true
    });
    const pinkMat = new THREE.MeshStandardMaterial({
      color: 0xffb5a7,
      roughness: 0.7,
      flatShading: true
    });

    sheepConfigs.forEach((cfg, idx) => {
      const sheepGroup = new THREE.Group();
      sheepGroup.position.set(cfg.x, 0.0, cfg.z);
      sheepGroup.rotation.y = cfg.rot;

      // 1. Puffy Wool Body
      const bodyGeo = new THREE.DodecahedronGeometry(0.55, 1);
      bodyGeo.scale(1.2, 0.9, 0.9);
      const body = new THREE.Mesh(bodyGeo, woolMat);
      body.position.y = 0.65;
      body.castShadow = true;
      body.receiveShadow = true;
      sheepGroup.add(body);

      // 2. Head Group (pivot for grazing animation)
      const headPivot = new THREE.Group();
      headPivot.position.set(0.55, 0.65, 0);

      const headGeo = new THREE.BoxGeometry(0.35, 0.32, 0.28);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.set(0.18, 0.0, 0);
      head.castShadow = true;
      headPivot.add(head);

      // Fluffy wool cap on head
      const capGeo = new THREE.DodecahedronGeometry(0.2, 0);
      const cap = new THREE.Mesh(capGeo, woolMat);
      cap.position.set(0.12, 0.16, 0);
      headPivot.add(cap);

      // Floppy ears
      const earGeo = new THREE.BoxGeometry(0.08, 0.05, 0.2);
      const earL = new THREE.Mesh(earGeo, pinkMat);
      earL.position.set(0.15, 0.05, 0.18);
      earL.rotation.x = 0.3;
      headPivot.add(earL);

      const earR = new THREE.Mesh(earGeo, pinkMat);
      earR.position.set(0.15, 0.05, -0.18);
      earR.rotation.x = -0.3;
      headPivot.add(earR);

      sheepGroup.add(headPivot);

      // 3. Four Stubby Legs
      const legGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.42, 5);
      const legPositions = [
        [0.35, 0.21, 0.25],
        [0.35, 0.21, -0.25],
        [-0.35, 0.21, 0.25],
        [-0.35, 0.21, -0.25]
      ];

      legPositions.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, skinMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        sheepGroup.add(leg);
      });

      this.group.add(sheepGroup);

      // Metadata for interactivity
      sheepGroup.userData = {
        isInteractive: true,
        name: `Chú Cừu Bông ${idx + 1}`,
        soundType: 'sheep',
        message: '🐑 Be-e-e! Cừu bông thích thú nhai cỏ non!',
        entity: sheepGroup,
        headPivot: headPivot,
        origY: 0.0,
        hopTimer: 0,
        idlePhase: Math.random() * Math.PI * 2
      };

      this.sheepList.push(sheepGroup.userData);
      this.interactiveAnimals.push(sheepGroup);
    });
  }

  createCow() {
    // Dairy Cow at (6.8, 0.0, -6.0)
    const cowGroup = new THREE.Group();
    cowGroup.position.set(6.8, 0.0, -6.0);
    cowGroup.rotation.y = -2.2;

    const cowWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xfdf0d5,
      roughness: 0.8,
      flatShading: true
    });
    const cowBlackMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.8,
      flatShading: true
    });
    const pinkMat = new THREE.MeshStandardMaterial({
      color: 0xf4a261,
      roughness: 0.7,
      flatShading: true
    });
    const hornMat = new THREE.MeshStandardMaterial({
      color: 0xe9ecef,
      roughness: 0.5,
      flatShading: true
    });

    // 1. Cow Body
    const bodyGeo = new THREE.BoxGeometry(1.6, 0.95, 0.85);
    const body = new THREE.Mesh(bodyGeo, cowWhiteMat);
    body.position.y = 0.95;
    body.castShadow = true;
    body.receiveShadow = true;
    cowGroup.add(body);

    // Dark patches on body
    const patchGeo = new THREE.BoxGeometry(0.5, 0.5, 0.87);
    const patch = new THREE.Mesh(patchGeo, cowBlackMat);
    patch.position.set(0.2, 0.95, 0);
    cowGroup.add(patch);

    // 2. Head & Neck Group
    const headPivot = new THREE.Group();
    headPivot.position.set(0.8, 1.1, 0);

    const headGeo = new THREE.BoxGeometry(0.55, 0.48, 0.42);
    const head = new THREE.Mesh(headGeo, cowWhiteMat);
    head.position.set(0.25, 0.0, 0);
    head.castShadow = true;
    headPivot.add(head);

    // Muzzle / Snout
    const muzzleGeo = new THREE.BoxGeometry(0.25, 0.24, 0.38);
    const muzzle = new THREE.Mesh(muzzleGeo, pinkMat);
    muzzle.position.set(0.55, -0.1, 0);
    headPivot.add(muzzle);

    // Horns
    const hornGeo = new THREE.ConeGeometry(0.06, 0.22, 4);
    const hornL = new THREE.Mesh(hornGeo, hornMat);
    hornL.position.set(0.25, 0.28, 0.18);
    hornL.rotation.z = -0.3;
    headPivot.add(hornL);

    const hornR = new THREE.Mesh(hornGeo, hornMat);
    hornR.position.set(0.25, 0.28, -0.18);
    hornR.rotation.z = -0.3;
    headPivot.add(hornR);

    // Floppy ears
    const earGeo = new THREE.BoxGeometry(0.08, 0.08, 0.22);
    const earL = new THREE.Mesh(earGeo, cowBlackMat);
    earL.position.set(0.18, 0.16, 0.26);
    headPivot.add(earL);

    const earR = new THREE.Mesh(earGeo, cowBlackMat);
    earR.position.set(0.18, 0.16, -0.26);
    headPivot.add(earR);

    cowGroup.add(headPivot);

    // 3. Legs
    const legGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.65, 6);
    const legPos = [
      [0.55, 0.32, 0.3],
      [0.55, 0.32, -0.3],
      [-0.55, 0.32, 0.3],
      [-0.55, 0.32, -0.3]
    ];

    legPos.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, cowWhiteMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      cowGroup.add(leg);
    });

    // 4. Tail
    const tailPivot = new THREE.Group();
    tailPivot.position.set(-0.8, 1.25, 0);
    const tailGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 4);
    const tail = new THREE.Mesh(tailGeo, cowWhiteMat);
    tail.position.y = -0.25;
    tail.rotation.z = 0.15;
    tailPivot.add(tail);

    const tuftGeo = new THREE.DodecahedronGeometry(0.08, 0);
    const tuft = new THREE.Mesh(tuftGeo, cowBlackMat);
    tuft.position.set(0.04, -0.5, 0);
    tailPivot.add(tuft);

    cowGroup.add(tailPivot);
    this.group.add(cowGroup);

    cowGroup.userData = {
      isInteractive: true,
      name: 'Bò Sữa Hoa Đốm',
      soundType: 'cow',
      message: '🐮 Ùm bò-o-o! Chú bò sữa thảnh thơi nhai cỏ.',
      entity: cowGroup,
      headPivot: headPivot,
      tailPivot: tailPivot,
      origY: 0.0,
      hopTimer: 0,
      idlePhase: 0
    };

    this.cow = cowGroup.userData;
    this.interactiveAnimals.push(cowGroup);
  }

  createChickens() {
    // 4 Little chickens roaming
    const chickenConfigs = [
      { x: 3.5, z: 1.0, color: 0xffd166 },
      { x: 4.2, z: 0.2, color: 0xffffff },
      { x: 2.8, z: 2.2, color: 0xffd166 },
      { x: 4.5, z: -2.0, color: 0xffb703 }
    ];

    const beakMat = new THREE.MeshStandardMaterial({ color: 0xf77f00, flatShading: true });
    const combMat = new THREE.MeshStandardMaterial({ color: 0xd62828, flatShading: true });
    const legMat = new THREE.MeshStandardMaterial({ color: 0xf77f00, flatShading: true });

    chickenConfigs.forEach((cfg, idx) => {
      const chk = new THREE.Group();
      chk.position.set(cfg.x, 0.0, cfg.z);
      chk.rotation.y = Math.random() * Math.PI * 2;

      const bodyMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.7,
        flatShading: true
      });

      // 1. Egg-shaped Body
      const bodyGeo = new THREE.SphereGeometry(0.18, 6, 6);
      bodyGeo.scale(1.0, 1.2, 0.9);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.28;
      body.castShadow = true;
      chk.add(body);

      // 2. Beak
      const beakGeo = new THREE.ConeGeometry(0.05, 0.1, 4);
      beakGeo.rotateX(Math.PI / 2);
      const beak = new THREE.Mesh(beakGeo, beakMat);
      beak.position.set(0, 0.32, 0.2);
      chk.add(beak);

      // 3. Comb on head
      const combGeo = new THREE.BoxGeometry(0.04, 0.08, 0.1);
      const comb = new THREE.Mesh(combGeo, combMat);
      comb.position.set(0, 0.44, 0.04);
      chk.add(comb);

      // 4. Tiny Legs
      const legGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.16, 4);
      [-0.06, 0.06].forEach(lx => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, 0.08, 0);
        chk.add(leg);
      });

      this.group.add(chk);

      const data = {
        isInteractive: true,
        name: `Gà Con Chip ${idx + 1}`,
        soundType: 'chicken',
        message: '🐔 Cục ta cục tác! Gà con mổ hạt ngô giòn tan.',
        entity: chk,
        origY: 0.0,
        peckTimer: Math.random() * 2,
        hopTimer: 0,
        walkSpeed: 0.15 + Math.random() * 0.1
      };

      chk.userData = data;
      this.chickens.push(data);
      this.interactiveAnimals.push(chk);
    });
  }

  onInteract(targetObject) {
    const data = targetObject.userData;
    if (!data) return;

    // Trigger hop / excited animation
    data.hopTimer = 1.0;
  }

  update(delta, time) {
    // 1. Sheep grazing & bobbing head
    this.sheepList.forEach((sheep, i) => {
      if (sheep.hopTimer > 0) {
        sheep.hopTimer -= delta * 2.5;
        const hop = Math.sin(sheep.hopTimer * Math.PI) * 0.4;
        sheep.entity.position.y = sheep.origY + Math.max(0, hop);
        sheep.entity.rotation.y += delta * 6;
      } else {
        sheep.entity.position.y = sheep.origY;
        // Natural grazing bob
        const graze = Math.sin(time * 1.6 + sheep.idlePhase);
        sheep.headPivot.rotation.x = graze > 0.2 ? 0.45 : 0.05;
        // Breathing body scale
        sheep.entity.scale.y = 1.0 + Math.sin(time * 2.2 + sheep.idlePhase) * 0.03;
      }
    });

    // 2. Cow head & tail waggle
    if (this.cow) {
      if (this.cow.hopTimer > 0) {
        this.cow.hopTimer -= delta * 2.0;
        const hop = Math.sin(this.cow.hopTimer * Math.PI) * 0.3;
        this.cow.entity.position.y = this.cow.origY + Math.max(0, hop);
      } else {
        this.cow.entity.position.y = this.cow.origY;
        // Chewing / slow head turn
        this.cow.headPivot.rotation.y = Math.sin(time * 0.9) * 0.22;
        this.cow.headPivot.rotation.z = Math.cos(time * 1.1) * 0.08;
        // Tail flick
        this.cow.tailPivot.rotation.z = Math.sin(time * 3.5) * 0.35;
      }
    }

    // 3. Chicken pecking and wandering
    this.chickens.forEach(chk => {
      if (chk.hopTimer > 0) {
        chk.hopTimer -= delta * 3.5;
        const hop = Math.sin(chk.hopTimer * Math.PI) * 0.3;
        chk.entity.position.y = chk.origY + Math.max(0, hop);
        chk.entity.rotation.y += delta * 8;
      } else {
        chk.peckTimer += delta;
        if (chk.peckTimer > 2.5) {
          // Rapid 3 pecks
          const peckCycle = (chk.peckTimer - 2.5) * 8;
          chk.entity.rotation.x = Math.sin(peckCycle) * 0.35;
          if (chk.peckTimer > 3.2) {
            chk.peckTimer = Math.random() * 0.8;
            chk.entity.rotation.x = 0;
            // Turn towards a new direction
            chk.entity.rotation.y += (Math.random() - 0.5) * 1.5;
          }
        }
      }
    });
  }
}
