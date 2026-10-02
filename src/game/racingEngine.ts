/**
 * Core Three.js Racing Game Engine.
 * Handles 3D Scene, Infinite Road recycling, Traffic AI, Collision Physics,
 * Particle Systems, Camera Choreography, and Mobile / Desktop Controls.
 */

import * as THREE from 'three';
import {
  createPlayerCar,
  createEnemyCar,
  createPineTree,
  createOakTree,
  createLamppost,
  createHighwayGantry,
  createCityBuilding,
  createMountainRange,
  PlayerCarInstance,
  EnemyCarInstance,
  EnemyType,
} from './models';
import { soundEngine } from './audio';

export interface GameStats {
  score: number;
  highScore: number;
  speedKmh: number;
  distanceMeters: number;
  gear: number;
  multiplier: number;
  nearMissCount: number;
  isBoosting: boolean;
}

export interface GameOverData {
  score: number;
  highScore: number;
  distance: number;
  topSpeed: number;
  nearMisses: number;
  isNewHigh: boolean;
}

export type DifficultyMode = 'casual' | 'pro' | 'insane';

export class RacingEngine {
  private container: HTMLElement | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;

  // Road configuration
  private readonly roadWidth = 15;
  private readonly laneXPositions = [-4.5, -1.5, 1.5, 4.5];
  private currentLaneIndex = 1; // Default to lane 2 (-1.5)
  private playerTargetX = -1.5;
  private playerCurrentX = -1.5;

  // Entities
  private playerCar: PlayerCarInstance | null = null;
  private enemies: {
    instance: EnemyCarInstance;
    speed: number;
    lane: number;
    passed: boolean;
    scoredNearMiss: boolean;
  }[] = [];

  // Scenery pools
  private roadSegments: THREE.Group[] = [];
  private sceneryObjects: { group: THREE.Group; side: 'left' | 'right' }[] = [];

  // Lighting
  private dirLight: THREE.DirectionalLight | null = null;
  private headlampSpotlightL: THREE.SpotLight | null = null;
  private headlampSpotlightR: THREE.SpotLight | null = null;

  // Game state
  private isRunning = false;
  private isPaused = false;
  private isCrashed = false;
  private difficulty: DifficultyMode = 'pro';
  private carColor = 0xef4444;

  // Speeds and dynamics
  private baseSpeed = 1.0;
  private currentSpeed = 1.0;
  private targetSpeed = 1.0;
  private maxSpeed = 2.6;
  private topSpeedRecorded = 0;
  private distanceTraveled = 0;
  private score = 0;
  private highScore = 0;
  private nearMisses = 0;
  private multiplier = 1;
  private consecutivePasses = 0;

  // Input states
  private isSteeringLeft = false;
  private isSteeringRight = false;
  private isBoosting = false;
  private isBraking = false;

  // Camera dynamics
  private cameraShake = 0;
  private defaultCamPos = new THREE.Vector3(0, 4.2, 7.8);
  private defaultCamLookAt = new THREE.Vector3(0, 1.2, -10);

  // Particles
  private debrisParticles: {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    rotVelocity: THREE.Vector3;
    life: number;
  }[] = [];
  private exhaustParticles: {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    life: number;
  }[] = [];

  // Callbacks
  private onStatsCallback: ((stats: GameStats) => void) | null = null;
  private onNearMissCallback: ((points: number) => void) | null = null;
  private onGameOverCallback: ((data: GameOverData) => void) | null = null;

  // Time tracking
  private lastTime = 0;
  private spawnTimer = 0;
  private crashTimer = 0;

  constructor() {
    this.scene = new THREE.Scene();
    // Atmospheric sunset / dusk sky palette with dense exponential fog
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.014);

    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 400);
    this.camera.position.copy(this.defaultCamPos);
    this.camera.lookAt(this.defaultCamLookAt);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Load persisted high score
    try {
      const saved = localStorage.getItem('apex_racer_high_score');
      if (saved) {
        this.highScore = parseInt(saved, 10) || 0;
      }
    } catch {
      // LocalStorage access fallback
    }

    this.setupLighting();
    this.setupRoadAndScenery();
  }

  public init(container: HTMLElement) {
    this.container = container;
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Initial render call to show 3D backdrop on start screen
    this.renderer.render(this.scene, this.camera);
    this.startLoop();
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.85);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1e293b, 0.6);
    this.scene.add(hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfef08a, 1.4);
    this.dirLight.position.set(20, 35, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 100;
    this.dirLight.shadow.camera.left = -20;
    this.dirLight.shadow.camera.right = 20;
    this.dirLight.shadow.camera.top = 20;
    this.dirLight.shadow.camera.bottom = -20;
    this.scene.add(this.dirLight);

    // Distant mountain ranges in the horizon
    const mountains = createMountainRange(240, 70);
    mountains.position.set(0, -0.5, -160);
    this.scene.add(mountains);

    // Second mountain layer for depth
    const mountains2 = createMountainRange(300, 80);
    mountains2.position.set(30, 2, -190);
    mountains2.rotation.y = Math.PI * 0.1;
    this.scene.add(mountains2);
  }

  private setupRoadAndScenery() {
    // We create multiple repeating road segments to form an endless highway
    const segmentLength = 60;
    const numSegments = 5;

    for (let i = 0; i < numSegments; i++) {
      const seg = this.createRoadSegment(segmentLength);
      seg.position.z = -i * segmentLength + 30;
      this.scene.add(seg);
      this.roadSegments.push(seg);
    }

    // Populate roadside scenery pool (trees, lamps, buildings, signs)
    this.populateScenery();
  }

  private createRoadSegment(length: number): THREE.Group {
    const seg = new THREE.Group();

    // 1. Asphalt Road Surface
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.85,
      metalness: 0.1,
    });
    const asphaltGeo = new THREE.PlaneGeometry(this.roadWidth, length);
    asphaltGeo.rotateX(-Math.PI / 2);
    const asphalt = new THREE.Mesh(asphaltGeo, asphaltMat);
    asphalt.receiveShadow = true;
    seg.add(asphalt);

    // 2. Road Shoulders / Grass Verges
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.9 });
    const grassL = new THREE.Mesh(new THREE.PlaneGeometry(50, length), grassMat);
    grassL.rotateX(-Math.PI / 2);
    grassL.position.set(-this.roadWidth / 2 - 25, -0.04, 0);
    grassL.receiveShadow = true;
    seg.add(grassL);

    const grassR = new THREE.Mesh(new THREE.PlaneGeometry(50, length), grassMat);
    grassR.rotateX(-Math.PI / 2);
    grassR.position.set(this.roadWidth / 2 + 25, -0.04, 0);
    grassR.receiveShadow = true;
    seg.add(grassR);

    // 3. Rumble Curbs (Alternating red and white hazard borders)
    const curbMatRed = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 });
    const curbMatWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
    const curbStep = 2.5;
    for (let z = -length / 2; z < length / 2; z += curbStep) {
      const mat = Math.floor(z / curbStep) % 2 === 0 ? curbMatRed : curbMatWhite;
      const curbL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, curbStep), mat);
      curbL.position.set(-this.roadWidth / 2 - 0.18, 0.06, z + curbStep / 2);
      seg.add(curbL);

      const curbR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, curbStep), mat);
      curbR.position.set(this.roadWidth / 2 + 0.18, 0.06, z + curbStep / 2);
      seg.add(curbR);
    }

    // 4. Guardrails
    const railMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, length), railMat);
    railL.position.set(-this.roadWidth / 2 - 0.7, 0.35, 0);
    seg.add(railL);

    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, length), railMat);
    railR.position.set(this.roadWidth / 2 + 0.7, 0.35, 0);
    seg.add(railR);

    // 5. White Dashed Lane Markings for 4 lanes (3 divider lines)
    const laneLineMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.25,
      roughness: 0.4,
    });
    const dashLength = 3.5;
    const gapLength = 3.0;
    const step = dashLength + gapLength;

    const dividersX = [-3.0, 0.0, 3.0];
    dividersX.forEach((x) => {
      for (let z = -length / 2; z < length / 2; z += step) {
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, dashLength), laneLineMat);
        dash.rotateX(-Math.PI / 2);
        dash.position.set(x, 0.02, z + dashLength / 2);
        seg.add(dash);
      }
    });

    return seg;
  }

  private populateScenery() {
    const spacing = 18;
    const totalDist = 240;

    for (let z = -totalDist; z <= 40; z += spacing) {
      // Left side scenery
      const leftChoice = Math.random();
      let leftObj: THREE.Group;
      if (leftChoice < 0.45) {
        leftObj = Math.random() > 0.5 ? createPineTree() : createOakTree();
        leftObj.position.set(-this.roadWidth / 2 - 3.5 - Math.random() * 8, 0, z);
      } else if (leftChoice < 0.75) {
        leftObj = createLamppost(true);
        leftObj.position.set(-this.roadWidth / 2 - 1.8, 0, z);
      } else {
        leftObj = createCityBuilding(18 + Math.random() * 20, 6 + Math.random() * 4);
        leftObj.position.set(-this.roadWidth / 2 - 14 - Math.random() * 10, 0, z);
      }
      this.scene.add(leftObj);
      this.sceneryObjects.push({ group: leftObj, side: 'left' });

      // Right side scenery
      const rightChoice = Math.random();
      let rightObj: THREE.Group;
      if (rightChoice < 0.45) {
        rightObj = Math.random() > 0.5 ? createPineTree() : createOakTree();
        rightObj.position.set(this.roadWidth / 2 + 3.5 + Math.random() * 8, 0, z);
      } else if (rightChoice < 0.75) {
        rightObj = createLamppost(false);
        rightObj.position.set(this.roadWidth / 2 + 1.8, 0, z);
      } else {
        rightObj = createCityBuilding(18 + Math.random() * 20, 6 + Math.random() * 4);
        rightObj.position.set(this.roadWidth / 2 + 14 + Math.random() * 10, 0, z);
      }
      this.scene.add(rightObj);
      this.sceneryObjects.push({ group: rightObj, side: 'right' });

      // Overhead highway gantry occasionally
      if (Math.abs(z) % 90 === 0) {
        const gantry = createHighwayGantry(this.roadWidth);
        gantry.position.set(0, 0, z);
        this.scene.add(gantry);
        this.sceneryObjects.push({ group: gantry, side: 'left' });
      }
    }
  }

  public setCallbacks(
    onStats: (stats: GameStats) => void,
    onNearMiss: (points: number) => void,
    onGameOver: (data: GameOverData) => void
  ) {
    this.onStatsCallback = onStats;
    this.onNearMissCallback = onNearMiss;
    this.onGameOverCallback = onGameOver;
  }

  public startRace(diff: DifficultyMode = 'pro', colorHex: number = 0xef4444) {
    this.difficulty = diff;
    this.carColor = colorHex;

    // Reset game parameters
    this.isCrashed = false;
    this.isPaused = false;
    this.score = 0;
    this.distanceTraveled = 0;
    this.nearMisses = 0;
    this.multiplier = 1;
    this.consecutivePasses = 0;
    this.cameraShake = 0;
    this.currentLaneIndex = 1;
    this.playerCurrentX = this.laneXPositions[1];
    this.playerTargetX = this.laneXPositions[1];

    if (diff === 'casual') {
      this.baseSpeed = 0.85;
      this.maxSpeed = 2.2;
    } else if (diff === 'pro') {
      this.baseSpeed = 1.05;
      this.maxSpeed = 2.7;
    } else {
      // Insane
      this.baseSpeed = 1.3;
      this.maxSpeed = 3.2;
    }

    this.currentSpeed = this.baseSpeed;
    this.targetSpeed = this.baseSpeed;
    this.topSpeedRecorded = this.baseSpeed * 65;

    // Clear existing debris & traffic
    this.clearTraffic();
    this.clearDebris();

    // Create or re-color player car
    if (!this.playerCar) {
      this.playerCar = createPlayerCar(this.carColor);
      this.scene.add(this.playerCar.group);

      // Add forward headlight spot beams
      this.headlampSpotlightL = new THREE.SpotLight(0xffffff, 2.5, 45, Math.PI / 6, 0.4, 1.2);
      this.headlampSpotlightL.position.set(-0.6, 0.8, 1.0);
      const targetL = new THREE.Object3D();
      targetL.position.set(-0.6, 0, -25);
      this.playerCar.group.add(targetL);
      this.headlampSpotlightL.target = targetL;
      this.playerCar.group.add(this.headlampSpotlightL);

      this.headlampSpotlightR = new THREE.SpotLight(0xffffff, 2.5, 45, Math.PI / 6, 0.4, 1.2);
      this.headlampSpotlightR.position.set(0.6, 0.8, 1.0);
      const targetR = new THREE.Object3D();
      targetR.position.set(0.6, 0, -25);
      this.playerCar.group.add(targetR);
      this.headlampSpotlightR.target = targetR;
      this.playerCar.group.add(this.headlampSpotlightR);
    } else {
      this.playerCar.setBodyColor(this.carColor);
      this.playerCar.group.rotation.set(0, 0, 0);
      this.playerCar.group.position.set(this.playerCurrentX, 0, 0);
    }

    this.isRunning = true;
    soundEngine.startEngine();
  }

  public steerLeft() {
    if (!this.isRunning || this.isCrashed || this.isPaused) return;
    if (this.currentLaneIndex > 0) {
      this.currentLaneIndex--;
      this.playerTargetX = this.laneXPositions[this.currentLaneIndex];
      soundEngine.playTireScreech();
    }
  }

  public steerRight() {
    if (!this.isRunning || this.isCrashed || this.isPaused) return;
    if (this.currentLaneIndex < this.laneXPositions.length - 1) {
      this.currentLaneIndex++;
      this.playerTargetX = this.laneXPositions[this.currentLaneIndex];
      soundEngine.playTireScreech();
    }
  }

  public setBoost(active: boolean) {
    this.isBoosting = active;
  }

  public setBrake(active: boolean) {
    this.isBraking = active;
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (paused) {
      soundEngine.stopEngine();
    } else if (this.isRunning && !this.isCrashed) {
      soundEngine.startEngine();
    }
  }

  private clearTraffic() {
    for (const enemy of this.enemies) {
      this.scene.remove(enemy.instance.group);
    }
    this.enemies = [];
  }

  private clearDebris() {
    for (const p of this.debrisParticles) {
      this.scene.remove(p.mesh);
    }
    this.debrisParticles = [];
  }

  private spawnTraffic() {
    // Lane choice: pick random lane from the 4 lanes
    const lane = Math.floor(Math.random() * this.laneXPositions.length);
    const laneX = this.laneXPositions[lane];

    // Ensure we don't spawn right on top of another car in that lane
    for (const e of this.enemies) {
      if (e.lane === lane && e.instance.group.position.z < -100) {
        return; // Too close to an existing car in this lane
      }
    }

    // Vehicle silhouette distribution
    const types: EnemyType[] = ['supercar', 'supercar', 'suv', 'truck', 'muscle'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    const enemy = createEnemyCar(chosenType);
    // Position ahead along the road
    const spawnZ = -140 - Math.random() * 25;
    enemy.group.position.set(laneX, 0, spawnZ);
    this.scene.add(enemy.group);

    // Enemy speeds: oncoming relative speed or slower traffic
    const baseEnemySpeed = chosenType === 'truck' ? 0.35 : chosenType === 'suv' ? 0.45 : 0.55;
    this.enemies.push({
      instance: enemy,
      speed: baseEnemySpeed * (0.85 + Math.random() * 0.3),
      lane,
      passed: false,
      scoredNearMiss: false,
    });
  }

  private createExhaustFlame(position: THREE.Vector3) {
    const geo = new THREE.SphereGeometry(0.12, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: this.isBoosting ? 0x06b6d4 : 0xf97316,
      transparent: true,
      opacity: 0.9,
    });
    const flame = new THREE.Mesh(geo, mat);
    flame.position.copy(position);
    this.scene.add(flame);

    this.exhaustParticles.push({
      mesh: flame,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.08,
        Math.random() * 0.05,
        this.currentSpeed * 0.8 + 0.4
      ),
      life: 0.18,
    });
  }

  private triggerCrashExplosion(impactPoint: THREE.Vector3) {
    soundEngine.playCrash();
    this.cameraShake = 0.8;

    const colors = [0xef4444, 0xf97316, 0xfacc15, 0x1e293b, 0xd4d4d8];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      const size = 0.12 + Math.random() * 0.28;
      const geo = Math.random() > 0.5 ? new THREE.BoxGeometry(size, size, size) : new THREE.DodecahedronGeometry(size, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        roughness: 0.3,
        metalness: 0.7,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(impactPoint);
      mesh.position.x += (Math.random() - 0.5) * 1.5;
      mesh.position.y += Math.random() * 1.0;
      mesh.position.z += (Math.random() - 0.5) * 1.5;
      this.scene.add(mesh);

      this.debrisParticles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 14,
          4 + Math.random() * 12,
          (Math.random() - 0.5) * 14
        ),
        rotVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15
        ),
        life: 2.2,
      });
    }
  }

  private handleGameOver() {
    this.isRunning = false;
    soundEngine.stopEngine();

    const isNewHigh = this.score > this.highScore;
    if (isNewHigh) {
      this.highScore = this.score;
      try {
        localStorage.setItem('apex_racer_high_score', this.highScore.toString());
      } catch {
        // Ignored
      }
    }

    if (this.onGameOverCallback) {
      this.onGameOverCallback({
        score: Math.floor(this.score),
        highScore: Math.floor(this.highScore),
        distance: Math.floor(this.distanceTraveled),
        topSpeed: Math.floor(this.topSpeedRecorded),
        nearMisses: this.nearMisses,
        isNewHigh,
      });
    }
  }

  private update(delta: number) {
    // Cap delta for frame drops
    const dt = Math.min(delta, 0.08);

    if (this.isCrashed) {
      this.crashTimer += dt;
      // Animate tumbling player car
      if (this.playerCar) {
        this.playerCar.group.rotation.x += dt * 3.5;
        this.playerCar.group.rotation.z += dt * 5.0;
        this.playerCar.group.position.y = Math.max(0.4, this.playerCar.group.position.y + dt * 1.5);
      }

      // Update debris
      for (let i = this.debrisParticles.length - 1; i >= 0; i--) {
        const p = this.debrisParticles[i];
        p.life -= dt;
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.velocity.y -= 25 * dt; // Gravity
        p.mesh.rotation.x += p.rotVelocity.x * dt;
        p.mesh.rotation.y += p.rotVelocity.y * dt;
        p.mesh.rotation.z += p.rotVelocity.z * dt;

        if (p.mesh.position.y < 0.1) {
          p.mesh.position.y = 0.1;
          p.velocity.y *= -0.4; // Bounce
          p.velocity.x *= 0.7;
          p.velocity.z *= 0.7;
        }

        if (p.life <= 0) {
          this.scene.remove(p.mesh);
          this.debrisParticles.splice(i, 1);
        }
      }

      // Damped camera shake
      if (this.cameraShake > 0) {
        this.cameraShake = Math.max(0, this.cameraShake - dt * 1.5);
        this.camera.position.x = this.defaultCamPos.x + (Math.random() - 0.5) * this.cameraShake * 1.2;
        this.camera.position.y = this.defaultCamPos.y + (Math.random() - 0.5) * this.cameraShake * 1.2;
      }

      if (this.crashTimer > 1.2 && this.isRunning) {
        this.handleGameOver();
      }
      return;
    }

    if (!this.isRunning || this.isPaused) {
      // Idle loop for initial menu screen: gently roll road markings
      const idleSpeed = 0.35;
      for (const seg of this.roadSegments) {
        seg.position.z += idleSpeed;
        if (seg.position.z > 60) {
          seg.position.z -= 60 * this.roadSegments.length;
        }
      }
      return;
    }

    // 1. Dynamic speed calculations
    const speedGrowth = 0.00035 * (this.score / 150 + 1);
    this.targetSpeed = Math.min(this.maxSpeed, this.baseSpeed + this.distanceTraveled * 0.00015 + speedGrowth);

    if (this.isBoosting) {
      this.targetSpeed *= 1.35;
    } else if (this.isBraking) {
      this.targetSpeed *= 0.65;
    }

    // Smooth speed acceleration
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.06;
    const speedKmh = Math.floor(this.currentSpeed * 68);
    if (speedKmh > this.topSpeedRecorded) {
      this.topSpeedRecorded = speedKmh;
    }

    // Engine Audio update
    const speedRatio = Math.min(1.0, (this.currentSpeed - 0.8) / (this.maxSpeed * 1.35 - 0.8));
    soundEngine.updateEnginePitch(speedRatio, this.isBoosting);

    // 2. Score & Distance tracking
    this.distanceTraveled += this.currentSpeed * 2.2;
    this.score += this.currentSpeed * this.multiplier * 0.8;

    // 3. Smooth Lane Interpolation & Vehicle Physics
    const steerSpeed = 12.0;
    const dx = this.playerTargetX - this.playerCurrentX;
    this.playerCurrentX += dx * Math.min(1.0, steerSpeed * dt);

    if (this.playerCar) {
      this.playerCar.group.position.x = this.playerCurrentX;

      // Suspension bounce
      const bounce = Math.sin(this.distanceTraveled * 0.8) * 0.018;
      this.playerCar.group.position.y = bounce;

      // Realistic car banking / roll into turns
      const rollTarget = -dx * 0.12;
      this.playerCar.group.rotation.z += (rollTarget - this.playerCar.group.rotation.z) * 0.2;

      // Front wheel steer angle
      const steerAngle = -dx * 0.28;
      this.playerCar.frontWheels.forEach((w) => {
        w.rotation.y = steerAngle;
      });

      // Wheel spin
      const spin = this.currentSpeed * 0.75;
      this.playerCar.wheels.forEach((w) => {
        w.rotation.x -= spin;
      });

      // Exhaust flame particles
      if (Math.random() < (this.isBoosting ? 0.9 : 0.25)) {
        this.playerCar.exhaustPipes.forEach((pipePos) => {
          const worldPos = pipePos.clone().applyMatrix4(this.playerCar!.group.matrixWorld);
          this.createExhaustFlame(worldPos);
        });
      }
    }

    // 4. Update Exhaust Particles
    for (let i = this.exhaustParticles.length - 1; i >= 0; i--) {
      const p = this.exhaustParticles[i];
      p.life -= dt;
      p.mesh.position.addScaledVector(p.velocity, dt);
      p.mesh.scale.multiplyScalar(0.92);
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.exhaustParticles.splice(i, 1);
      }
    }

    // 5. Scroll Road Segments (Endless highway loop)
    const roadMove = this.currentSpeed * 1.8;
    for (const seg of this.roadSegments) {
      seg.position.z += roadMove;
      if (seg.position.z > 60) {
        seg.position.z -= 60 * this.roadSegments.length;
      }
    }

    // 6. Scroll Scenery Objects
    for (const item of this.sceneryObjects) {
      item.group.position.z += roadMove;
      if (item.group.position.z > 40) {
        item.group.position.z -= 280;
      }
    }

    // 7. Spawn Traffic
    this.spawnTimer += dt;
    const spawnInterval = Math.max(0.7, 1.8 - (this.score / 500) * 0.3);
    if (this.spawnTimer > spawnInterval) {
      this.spawnTimer = 0;
      this.spawnTraffic();
    }

    // 8. Update Traffic & Collision Detection
    const playerAABB = {
      minX: this.playerCurrentX - 0.75,
      maxX: this.playerCurrentX + 0.75,
      minZ: -1.7,
      maxZ: 1.7,
    };

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      // Move enemy forward relative to road scroll
      enemy.instance.group.position.z += roadMove + enemy.speed * 1.2;

      // Wheel spin for enemy
      enemy.instance.wheels.forEach((w) => {
        w.rotation.x += enemy.speed * 0.5;
      });

      const enemyZ = enemy.instance.group.position.z;
      const enemyX = enemy.instance.group.position.x;
      const halfW = enemy.instance.width * 0.48;
      const halfL = enemy.instance.length * 0.48;

      const enemyAABB = {
        minX: enemyX - halfW,
        maxX: enemyX + halfW,
        minZ: enemyZ - halfL,
        maxZ: enemyZ + halfL,
      };

      // Collision Check
      const collisionX = playerAABB.minX <= enemyAABB.maxX && playerAABB.maxX >= enemyAABB.minX;
      const collisionZ = playerAABB.minZ <= enemyAABB.maxZ && playerAABB.maxZ >= enemyAABB.minZ;

      if (collisionX && collisionZ) {
        this.isCrashed = true;
        this.triggerCrashExplosion(
          new THREE.Vector3(
            (this.playerCurrentX + enemyX) / 2,
            0.6,
            (0 + enemyZ) / 2
          )
        );
        break;
      }

      // Near-Miss Bonus Detection:
      // If car is beside player (Z close to 0) and lateral distance is tight (< 2.2 units)
      if (!enemy.scoredNearMiss && Math.abs(enemyZ) < 1.8) {
        const lateralDist = Math.abs(this.playerCurrentX - enemyX);
        if (lateralDist > 1.2 && lateralDist < 2.5) {
          enemy.scoredNearMiss = true;
          this.nearMisses++;
          this.consecutivePasses++;
          this.multiplier = Math.min(5, 1 + Math.floor(this.consecutivePasses / 3));
          const bonus = 100 * this.multiplier;
          this.score += bonus;
          soundEngine.playNearMiss();
          if (this.onNearMissCallback) {
            this.onNearMissCallback(bonus);
          }
        }
      }

      // Check if safely passed
      if (!enemy.passed && enemyZ > 3.0) {
        enemy.passed = true;
        this.score += 25 * this.multiplier;
      }

      // Remove enemies that fall behind camera
      if (enemyZ > 35) {
        this.scene.remove(enemy.instance.group);
        this.enemies.splice(i, 1);
      }
    }

    // 9. Camera Choreography & Visual Impact
    // Wider FOV when boosting, camera lag on turns, subtle shake
    const targetFOV = this.isBoosting ? 72 : 62;
    this.camera.fov += (targetFOV - this.camera.fov) * 0.08;
    this.camera.updateProjectionMatrix();

    // Camera follow X with smooth spring lag
    const camTargetX = this.playerCurrentX * 0.45;
    this.camera.position.x += (camTargetX - this.camera.position.x) * 0.1;

    // Damped camera shake
    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 2.0);
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake;
      this.camera.position.y = this.defaultCamPos.y + (Math.random() - 0.5) * this.cameraShake;
    } else {
      this.camera.position.y = this.defaultCamPos.y;
    }

    // 10. Compute Gear Indicator (1 to 6)
    const gear = Math.min(6, Math.max(1, Math.floor((speedKmh - 40) / 25) + 1));

    // 11. Report Stats to UI HUD
    if (this.onStatsCallback) {
      this.onStatsCallback({
        score: Math.floor(this.score),
        highScore: Math.floor(Math.max(this.score, this.highScore)),
        speedKmh,
        distanceMeters: Math.floor(this.distanceTraveled),
        gear,
        multiplier: this.multiplier,
        nearMissCount: this.nearMisses,
        isBoosting: this.isBoosting,
      });
    }
  }

  private startLoop() {
    let last = performance.now();
    const animate = (now: number) => {
      this.animationFrameId = requestAnimationFrame(animate);
      const delta = (now - last) / 1000;
      last = now;

      this.update(delta);
      this.renderer.render(this.scene, this.camera);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.isSteeringLeft = true;
      this.steerLeft();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.isSteeringRight = true;
      this.steerRight();
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      this.setBoost(true);
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      this.setBrake(true);
    } else if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
      if (this.isRunning && !this.isCrashed) {
        this.setPaused(!this.isPaused);
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.isSteeringLeft = false;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.isSteeringRight = false;
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      this.setBoost(false);
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      this.setBrake(false);
    }
  };

  private handleResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    soundEngine.stopEngine();

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
