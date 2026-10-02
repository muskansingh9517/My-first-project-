/**
 * Procedural 3D Models for 3D Car Racing Game using Three.js primitives.
 * High visual polish with low polygon counts for 60fps mobile performance.
 */

import * as THREE from 'three';

// Reusable standard geometries and materials to minimize GPU overhead
const wheelGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 14);
wheelGeometry.rotateZ(Math.PI / 2);

const rimGeometry = new THREE.CylinderGeometry(0.24, 0.24, 0.29, 10);
rimGeometry.rotateZ(Math.PI / 2);

const wheelMaterial = new THREE.MeshStandardMaterial({
  color: 0x18181b,
  roughness: 0.85,
  metalness: 0.1,
});

const rimMaterial = new THREE.MeshStandardMaterial({
  color: 0xd4d4d8,
  roughness: 0.2,
  metalness: 0.8,
});

const glassMaterial = new THREE.MeshStandardMaterial({
  color: 0x09090b,
  roughness: 0.1,
  metalness: 0.9,
  transparent: true,
  opacity: 0.85,
});

const headlightMaterial = new THREE.MeshStandardMaterial({
  color: 0xf8fafc,
  emissive: 0xe0f2fe,
  emissiveIntensity: 1.5,
  roughness: 0.2,
});

const taillightMaterial = new THREE.MeshStandardMaterial({
  color: 0xef4444,
  emissive: 0xdc2626,
  emissiveIntensity: 1.8,
  roughness: 0.3,
});

/**
 * Creates a wheel assembly (tire + metallic rim)
 */
export function createWheel(): THREE.Group {
  const wheelGroup = new THREE.Group();
  const tire = new THREE.Mesh(wheelGeometry, wheelMaterial);
  tire.castShadow = true;
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  wheelGroup.add(tire);
  wheelGroup.add(rim);
  return wheelGroup;
}

export interface PlayerCarInstance {
  group: THREE.Group;
  wheels: THREE.Group[];
  frontWheels: THREE.Group[];
  bodyMesh: THREE.Mesh;
  headlights: THREE.Mesh[];
  taillights: THREE.Mesh[];
  exhaustPipes: THREE.Vector3[];
  setBodyColor: (colorHex: number | string) => void;
}

/**
 * Creates the sleek Player Racing Sports Car
 */
export function createPlayerCar(colorHex: number = 0xef4444): PlayerCarInstance {
  const group = new THREE.Group();

  // Primary car paint material
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.25,
    metalness: 0.7,
  });

  const secondaryMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.4,
    metalness: 0.6,
  });

  // 1. Lower chassis / floor
  const lowerChassisGeo = new THREE.BoxGeometry(1.68, 0.32, 3.8);
  const lowerChassis = new THREE.Mesh(lowerChassisGeo, secondaryMaterial);
  lowerChassis.position.y = 0.36;
  lowerChassis.castShadow = true;
  group.add(lowerChassis);

  // 2. Main aerodynamic body
  const bodyGeo = new THREE.BoxGeometry(1.6, 0.46, 3.4);
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMaterial);
  bodyMesh.position.y = 0.62;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // 3. Cabin / Cockpit canopy
  const cabinGeo = new THREE.BoxGeometry(1.3, 0.42, 1.8);
  const cabin = new THREE.Mesh(cabinGeo, glassMaterial);
  cabin.position.set(0, 0.94, -0.15);
  cabin.castShadow = true;
  group.add(cabin);

  // 4. Roof trim
  const roofGeo = new THREE.BoxGeometry(1.22, 0.08, 1.4);
  const roof = new THREE.Mesh(roofGeo, bodyMaterial);
  roof.position.set(0, 1.18, -0.15);
  group.add(roof);

  // 5. Front Hood Scoop / Wedge
  const hoodWedgeGeo = new THREE.BoxGeometry(1.42, 0.18, 1.1);
  const hoodWedge = new THREE.Mesh(hoodWedgeGeo, secondaryMaterial);
  hoodWedge.position.set(0, 0.76, 1.05);
  hoodWedge.rotation.x = 0.08;
  group.add(hoodWedge);

  // 6. Rear Spoiler / Wing
  const spoilerWingGeo = new THREE.BoxGeometry(1.64, 0.08, 0.38);
  const spoilerWing = new THREE.Mesh(spoilerWingGeo, secondaryMaterial);
  spoilerWing.position.set(0, 1.12, -1.68);

  const strutGeo = new THREE.BoxGeometry(0.08, 0.32, 0.08);
  const leftStrut = new THREE.Mesh(strutGeo, secondaryMaterial);
  leftStrut.position.set(-0.58, 0.94, -1.68);
  const rightStrut = new THREE.Mesh(strutGeo, secondaryMaterial);
  rightStrut.position.set(0.58, 0.94, -1.68);

  group.add(spoilerWing);
  group.add(leftStrut);
  group.add(rightStrut);

  // 7. Headlights (Angled modern strips)
  const headlightGeo = new THREE.BoxGeometry(0.35, 0.12, 0.12);
  const hlLeft = new THREE.Mesh(headlightGeo, headlightMaterial);
  hlLeft.position.set(-0.6, 0.62, 1.72);
  const hlRight = new THREE.Mesh(headlightGeo, headlightMaterial);
  hlRight.position.set(0.6, 0.62, 1.72);
  group.add(hlLeft);
  group.add(hlRight);

  // 8. Taillights (Continuous modern lightbar style)
  const taillightGeo = new THREE.BoxGeometry(1.36, 0.1, 0.08);
  const tl = new THREE.Mesh(taillightGeo, taillightMaterial);
  tl.position.set(0, 0.65, -1.72);
  group.add(tl);

  // 9. Wheels
  const wheels: THREE.Group[] = [];
  const frontWheels: THREE.Group[] = [];

  const wheelPositions = [
    { x: -0.9, y: 0.38, z: 1.15, front: true },
    { x: 0.9, y: 0.38, z: 1.15, front: true },
    { x: -0.9, y: 0.38, z: -1.15, front: false },
    { x: 0.9, y: 0.38, z: -1.15, front: false },
  ];

  wheelPositions.forEach((pos) => {
    const w = createWheel();
    w.position.set(pos.x, pos.y, pos.z);
    group.add(w);
    wheels.push(w);
    if (pos.front) {
      frontWheels.push(w);
    }
  });

  // Exhaust positions (relative to car origin)
  const exhaustPipes: THREE.Vector3[] = [
    new THREE.Vector3(-0.35, 0.32, -1.74),
    new THREE.Vector3(0.35, 0.32, -1.74),
  ];

  const setBodyColor = (color: number | string) => {
    bodyMaterial.color.set(color);
    roof.material = bodyMaterial;
  };

  return {
    group,
    wheels,
    frontWheels,
    bodyMesh,
    headlights: [hlLeft, hlRight],
    taillights: [tl],
    exhaustPipes,
    setBodyColor,
  };
}

export type EnemyType = 'supercar' | 'muscle' | 'truck' | 'suv';

export interface EnemyCarInstance {
  group: THREE.Group;
  type: EnemyType;
  wheels: THREE.Group[];
  length: number;
  width: number;
}

const enemyColors = [
  0x2563eb, // Vibrant Sapphire
  0xf59e0b, // Amber Gold
  0x10b981, // Emerald Green
  0x8b5cf6, // Violet
  0xec4899, // Fuchsia
  0x0284c7, // Sky Blue
  0xd97706, // Bronze
  0xe11d48, // Crimson
];

/**
 * Creates enemy cars with diverse silhouettes (sports cars, trucks, SUVs)
 */
export function createEnemyCar(type: EnemyType = 'supercar', colorHex?: number): EnemyCarInstance {
  const group = new THREE.Group();
  const wheels: THREE.Group[] = [];
  const chosenColor = colorHex ?? enemyColors[Math.floor(Math.random() * enemyColors.length)];

  const paintMat = new THREE.MeshStandardMaterial({
    color: chosenColor,
    roughness: 0.3,
    metalness: 0.6,
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.6,
    metalness: 0.4,
  });

  let length = 3.6;
  let width = 1.6;

  if (type === 'truck') {
    length = 6.2;
    width = 1.9;

    // Cab
    const cabGeo = new THREE.BoxGeometry(1.84, 1.4, 2.0);
    const cab = new THREE.Mesh(cabGeo, paintMat);
    cab.position.set(0, 1.05, 1.8);
    cab.castShadow = true;
    group.add(cab);

    // Cab windshield
    const cabGlassGeo = new THREE.BoxGeometry(1.68, 0.6, 0.4);
    const cabGlass = new THREE.Mesh(cabGlassGeo, glassMaterial);
    cabGlass.position.set(0, 1.3, 2.62);
    group.add(cabGlass);

    // Cargo Trailer (White or Metallic)
    const cargoMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.5,
      metalness: 0.3,
    });
    const cargoGeo = new THREE.BoxGeometry(1.86, 1.7, 4.0);
    const cargo = new THREE.Mesh(cargoGeo, cargoMat);
    cargo.position.set(0, 1.25, -1.1);
    cargo.castShadow = true;
    group.add(cargo);

    // 6 Wheels for Semi-Truck
    const wheelZ = [2.0, -1.4, -2.6];
    wheelZ.forEach((z) => {
      [-1.0, 1.0].forEach((x) => {
        const w = createWheel();
        w.position.set(x, 0.4, z);
        group.add(w);
        wheels.push(w);
      });
    });

    // Headlights
    const hlGeo = new THREE.BoxGeometry(0.3, 0.16, 0.1);
    const hlL = new THREE.Mesh(hlGeo, headlightMaterial);
    hlL.position.set(-0.7, 0.6, 2.82);
    const hlR = new THREE.Mesh(hlGeo, headlightMaterial);
    hlR.position.set(0.7, 0.6, 2.82);
    group.add(hlL);
    group.add(hlR);

  } else if (type === 'suv') {
    length = 4.0;
    width = 1.75;

    // SUV Boxy Body
    const suvBodyGeo = new THREE.BoxGeometry(1.7, 0.72, 3.8);
    const suvBody = new THREE.Mesh(suvBodyGeo, paintMat);
    suvBody.position.set(0, 0.75, 0);
    suvBody.castShadow = true;
    group.add(suvBody);

    // Tall Cabin
    const cabinGeo = new THREE.BoxGeometry(1.48, 0.65, 2.6);
    const cabin = new THREE.Mesh(cabinGeo, glassMaterial);
    cabin.position.set(0, 1.35, -0.2);
    group.add(cabin);

    // Roof rack rails
    const railMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.5 });
    const railGeo = new THREE.BoxGeometry(0.06, 0.08, 2.2);
    const railL = new THREE.Mesh(railGeo, railMat);
    railL.position.set(-0.65, 1.72, -0.2);
    const railR = new THREE.Mesh(railGeo, railMat);
    railR.position.set(0.65, 1.72, -0.2);
    group.add(railL);
    group.add(railR);

    // 4 Wheels
    [-1.25, 1.25].forEach((z) => {
      [-0.92, 0.92].forEach((x) => {
        const w = createWheel();
        w.position.set(x, 0.42, z);
        group.add(w);
        wheels.push(w);
      });
    });

    // Lights
    const hlGeo = new THREE.BoxGeometry(0.35, 0.15, 0.1);
    const hlL = new THREE.Mesh(hlGeo, headlightMaterial);
    hlL.position.set(-0.65, 0.75, 1.91);
    const hlR = new THREE.Mesh(hlGeo, headlightMaterial);
    hlR.position.set(0.65, 0.75, 1.91);
    group.add(hlL);
    group.add(hlR);

  } else {
    // Supercar or Muscle Car
    length = 3.6;
    width = 1.62;

    const lowerGeo = new THREE.BoxGeometry(1.62, 0.35, 3.5);
    const lower = new THREE.Mesh(lowerGeo, trimMat);
    lower.position.y = 0.36;
    lower.castShadow = true;
    group.add(lower);

    const bodyGeo = new THREE.BoxGeometry(1.58, 0.44, 3.2);
    const body = new THREE.Mesh(bodyGeo, paintMat);
    body.position.y = 0.62;
    body.castShadow = true;
    group.add(body);

    const cabinGeo = new THREE.BoxGeometry(1.24, 0.4, 1.6);
    const cabin = new THREE.Mesh(cabinGeo, glassMaterial);
    cabin.position.set(0, 0.92, -0.1);
    group.add(cabin);

    // Wheels
    [-1.15, 1.15].forEach((z) => {
      [-0.88, 0.88].forEach((x) => {
        const w = createWheel();
        w.position.set(x, 0.38, z);
        group.add(w);
        wheels.push(w);
      });
    });

    // Headlights
    const hlGeo = new THREE.BoxGeometry(0.32, 0.1, 0.1);
    const hlL = new THREE.Mesh(hlGeo, headlightMaterial);
    hlL.position.set(-0.58, 0.6, 1.62);
    const hlR = new THREE.Mesh(hlGeo, headlightMaterial);
    hlR.position.set(0.58, 0.6, 1.62);
    group.add(hlL);
    group.add(hlR);
  }

  // Rotate enemy cars 180 degrees so they face the oncoming player car
  group.rotation.y = Math.PI;

  return {
    group,
    type,
    wheels,
    length,
    width,
  };
}

// -------------------------------------------------------------
// Scenery & Environment Objects (Trees, Lamps, Buildings, Signs)
// -------------------------------------------------------------

const pineTrunkGeo = new THREE.CylinderGeometry(0.18, 0.26, 1.2, 7);
const pineTier1Geo = new THREE.ConeGeometry(1.4, 1.8, 7);
const pineTier2Geo = new THREE.ConeGeometry(1.1, 1.6, 7);
const pineTier3Geo = new THREE.ConeGeometry(0.75, 1.4, 7);

const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
const pineFoliageMat1 = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.8 });
const pineFoliageMat2 = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.8 });

/**
 * Creates low-poly pine tree
 */
export function createPineTree(): THREE.Group {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(pineTrunkGeo, trunkMat);
  trunk.position.y = 0.6;
  trunk.castShadow = true;
  tree.add(trunk);

  const t1 = new THREE.Mesh(pineTier1Geo, pineFoliageMat1);
  t1.position.y = 1.9;
  t1.castShadow = true;
  tree.add(t1);

  const t2 = new THREE.Mesh(pineTier2Geo, pineFoliageMat2);
  t2.position.y = 2.8;
  t2.castShadow = true;
  tree.add(t2);

  const t3 = new THREE.Mesh(pineTier3Geo, pineFoliageMat1);
  t3.position.y = 3.6;
  t3.castShadow = true;
  tree.add(t3);

  // Randomize scale slightly for natural look
  const scale = 0.85 + Math.random() * 0.4;
  tree.scale.set(scale, scale, scale);
  tree.rotation.y = Math.random() * Math.PI * 2;

  return tree;
}

const oakCanopyGeo = new THREE.DodecahedronGeometry(1.6, 1);
const oakFoliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 });

/**
 * Creates low-poly leafy deciduous tree
 */
export function createOakTree(): THREE.Group {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 1.8, 8), trunkMat);
  trunk.position.y = 0.9;
  trunk.castShadow = true;
  tree.add(trunk);

  const canopy = new THREE.Mesh(oakCanopyGeo, oakFoliageMat);
  canopy.position.y = 2.6;
  canopy.castShadow = true;
  tree.add(canopy);

  const scale = 0.85 + Math.random() * 0.4;
  tree.scale.set(scale, scale, scale);
  return tree;
}

/**
 * Creates modern roadside street lamppost
 */
export function createLamppost(faceRight: boolean = true): THREE.Group {
  const lamp = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.7 });
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 1.6,
  });

  // Vertical pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 5.0, 8), poleMat);
  pole.position.y = 2.5;
  pole.castShadow = true;
  lamp.add(pole);

  // Overhang arm
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8), poleMat);
  arm.rotation.z = faceRight ? -Math.PI / 3 : Math.PI / 3;
  arm.position.set(faceRight ? 0.7 : -0.7, 4.8, 0);
  lamp.add(arm);

  // Light fixture head
  const fixture = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.5), lightMat);
  fixture.position.set(faceRight ? 1.4 : -1.4, 4.4, 0);
  lamp.add(fixture);

  return lamp;
}

/**
 * Creates overhead highway gantry sign spanning the whole road
 */
export function createHighwayGantry(roadWidth: number = 16): THREE.Group {
  const gantry = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
  const signGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 });
  const signWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.4,
  });

  const height = 6.2;
  const pillarGeo = new THREE.BoxGeometry(0.4, height, 0.4);

  // Left & right pillars
  const leftPillar = new THREE.Mesh(pillarGeo, frameMat);
  leftPillar.position.set(-roadWidth / 2 - 0.5, height / 2, 0);
  const rightPillar = new THREE.Mesh(pillarGeo, frameMat);
  rightPillar.position.set(roadWidth / 2 + 0.5, height / 2, 0);
  gantry.add(leftPillar);
  gantry.add(rightPillar);

  // Cross beam
  const beamGeo = new THREE.BoxGeometry(roadWidth + 2.2, 0.5, 0.5);
  const beam = new THREE.Mesh(beamGeo, frameMat);
  beam.position.set(0, height - 0.25, 0);
  gantry.add(beam);

  // Green Highway Sign Board
  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(7.0, 1.8, 0.15), signGreenMat);
  signBoard.position.set(0, height - 1.2, 0.2);
  gantry.add(signBoard);

  // Sign text accent bars (giving retro-reflective highway marker appearance)
  const lineGeo = new THREE.BoxGeometry(6.4, 0.14, 0.16);
  const line1 = new THREE.Mesh(lineGeo, signWhiteMat);
  line1.position.set(0, height - 0.8, 0.22);
  const line2 = new THREE.Mesh(lineGeo, signWhiteMat);
  line2.position.set(0, height - 1.6, 0.22);
  gantry.add(line1);
  gantry.add(line2);

  return gantry;
}

/**
 * Creates low-poly skyscraper / modern city tower for roadside background
 */
export function createCityBuilding(height: number = 24, width: number = 7): THREE.Group {
  const building = new THREE.Group();
  const buildingMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.6,
    metalness: 0.5,
  });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });

  const bMesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, width), buildingMat);
  bMesh.position.y = height / 2;
  bMesh.castShadow = true;
  building.add(bMesh);

  // Glowing window strip grids
  const stripGeo = new THREE.BoxGeometry(width * 0.85, 0.35, width + 0.1);
  const floors = Math.floor(height / 3.2);
  for (let f = 1; f < floors; f++) {
    if (f % 2 === 0) {
      const strip = new THREE.Mesh(stripGeo, windowMat);
      strip.position.y = f * 3.2;
      building.add(strip);
    }
  }

  return building;
}

/**
 * Creates distant mountains with low-poly jagged vertices
 */
export function createMountainRange(width: number = 180, depth: number = 50): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(width, depth, 18, 10);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    // Raise center mountains higher
    const distFromCenter = Math.abs(x) / (width * 0.5);
    const baseHeight = (1 - distFromCenter * 0.5) * 25;
    const noise = Math.sin(x * 0.1) * Math.cos(z * 0.15) * 8 + Math.sin(x * 0.25) * 4;
    pos.setY(i, Math.max(0, baseHeight + noise));
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: 0x1e1b4b, // Deep indigo ridge
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = false;
  return mesh;
}
