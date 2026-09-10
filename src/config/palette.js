/**
 * 3D Design Tokens & Color Palettes for Peaceful Village
 * Defined for Day, Sunset, and Night atmospheres
 */

export const PALETTES = {
  day: {
    name: 'Ban Ngày',
    sky: 0xd8f3dc,
    fog: 0xd8f3dc,
    fogDensity: 0.015,
    hemiSky: 0xffffff,
    hemiGround: 0x95d5b2,
    hemiIntensity: 0.65,
    dirLight: 0xfff3b0,
    dirIntensity: 1.4,
    dirPosition: [18, 25, 15],
    windowEmissive: 0x333333,
    windowEmissiveIntensity: 0.1,
    firefliesVisible: false,
    particlesColor: 0xffffff
  },
  sunset: {
    name: 'Hoàng Hôn',
    sky: 0xfde2e4,
    fog: 0xfbc4ab,
    fogDensity: 0.018,
    hemiSky: 0xffb5a7,
    hemiGround: 0xfcd5ce,
    hemiIntensity: 0.6,
    dirLight: 0xf38375,
    dirIntensity: 1.6,
    dirPosition: [25, 14, 20],
    windowEmissive: 0xffaa00,
    windowEmissiveIntensity: 0.7,
    firefliesVisible: true,
    particlesColor: 0xffea00
  },
  night: {
    name: 'Ban Đêm',
    sky: 0x0b132b,
    fog: 0x1c2541,
    fogDensity: 0.022,
    hemiSky: 0x3a506b,
    hemiGround: 0x1c2541,
    hemiIntensity: 0.35,
    dirLight: 0xa8dadc,
    dirIntensity: 0.5,
    dirPosition: [10, 20, 10],
    windowEmissive: 0xffb703,
    windowEmissiveIntensity: 1.5,
    firefliesVisible: true,
    particlesColor: 0x70e000
  }
};

export const NATURE_COLORS = {
  grassTop: 0x74c69d,
  grassMid: 0x52b788,
  grassDark: 0x40916c,
  earthCliff: 0x8a6240,
  earthDark: 0x583101,
  riverBed: 0x4361ee,
  water: 0x48cae4,
  waterFoam: 0xedf6f9,
  wood: 0x8d5b4c,
  woodDark: 0x5c3d2e,
  roofRed: 0xd90429,
  roofOrange: 0xe76f51,
  roofStraw: 0xe9c46a,
  wallWhite: 0xf8f9fa,
  wallCream: 0xfdf0d5,
  stoneLight: 0xced4da,
  stoneDark: 0x6c757d,
  foliagePine: 0x2d6a4f,
  foliageBright: 0x70e000,
  foliageMint: 0x95d5b2,
  foliageAutumn: 0xf4a261,
  flowerYellow: 0xffd166,
  flowerRed: 0xef476f,
  flowerWhite: 0xffffff,
  flowerBlue: 0x118ab2
};
