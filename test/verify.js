import * as THREE from 'three';
import { PALETTES, NATURE_COLORS } from '../src/config/palette.js';
import { Bridge } from '../src/entities/Bridge.js';
import { Windmill } from '../src/entities/Windmill.js';
import { Cottages } from '../src/entities/Cottages.js';
import { Foliage } from '../src/entities/Foliage.js';
import { Animals } from '../src/entities/Animals.js';
import { Terrain } from '../src/scene/Terrain.js';

console.log('Testing Peaceful Village 3D modules in Node...');

// 1. Check Palettes
if (!PALETTES.day || !PALETTES.sunset || !PALETTES.night) {
  throw new Error('Missing day/sunset/night palettes');
}
console.log('✓ Palettes validated');

// 2. Setup mock scene
const scene = new THREE.Scene();

// 3. Test Terrain
const terrain = new Terrain(scene);
if (!terrain.waterMesh) throw new Error('Terrain waterMesh failed to create');
console.log('✓ Terrain created successfully');

// 4. Test Bridge
const bridge = new Bridge(scene);
if (bridge.group.children.length === 0) throw new Error('Bridge has no children');
console.log('✓ Bridge created successfully with ' + bridge.group.children.length + ' parts');

// 5. Test Windmill
const windmill = new Windmill(scene);
if (!windmill.bladesGroup) throw new Error('Windmill bladesGroup missing');
console.log('✓ Windmill created successfully with spinning blades');

// 6. Test Cottages
const cottages = new Cottages(scene);
if (cottages.group.children.length !== 3) throw new Error('Cottages count mismatch: ' + cottages.group.children.length);
if (cottages.smokeSystems.length !== 3) throw new Error('Smoke systems count mismatch');
console.log('✓ 3 Cottages and smoke particle systems created successfully');

// 7. Test Foliage
const foliage = new Foliage(scene);
if (foliage.group.children.length === 0) throw new Error('Foliage has no elements');
console.log('✓ Foliage created successfully');

// 8. Test Animals
const animals = new Animals(scene);
if (animals.sheepList.length !== 3) throw new Error('Sheep count mismatch');
if (!animals.cow) throw new Error('Cow missing');
if (animals.chickens.length !== 4) throw new Error('Chickens count mismatch');
console.log('✓ Farm animals created successfully (3 sheep, 1 cow, 4 chickens)');

// 9. Test animation loop updates for 10 frames
for (let i = 0; i < 10; i++) {
  const delta = 0.016;
  const time = i * delta;
  terrain.update(delta, time);
  windmill.update(delta, time);
  cottages.update(delta, time);
  animals.update(delta, time);
}
console.log('✓ Animation updates verified without runtime exceptions');

console.log('ALL VERIFICATIONS PASSED 100%!');
