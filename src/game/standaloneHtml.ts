/**
 * Generates the complete, pristine single-file index.html.
 * Self-contained: includes Three.js via CDN, complete procedural 3D models,
 * Web Audio sound engine, responsive mobile controls, collision physics,
 * HUD, start screen, and game over modal.
 */

export function getStandaloneHtmlCode(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Apex Racer 3D - Highway Rush</title>
  <!-- Google Fonts for Racing Aesthetic -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <!-- Three.js CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
    }
    body, html {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #090d16;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      color: #f1f5f9;
      touch-action: none;
    }
    #game-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
    .font-racing {
      font-family: 'Orbitron', monospace, sans-serif;
    }

    /* HUD Overlay */
    #hud {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 16px;
    }
    .hud-card {
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 10px 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }
    .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      font-weight: 600;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 800;
      color: #f8fafc;
      line-height: 1.1;
    }
    .streak-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      color: #38bdf8;
      margin-top: 2px;
    }

    /* Speedometer & Gear */
    .speedo-wrap {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }
    .speedo-num {
      font-size: 38px;
      font-weight: 900;
      color: #f8fafc;
      letter-spacing: -0.02em;
    }
    .speedo-unit {
      font-size: 13px;
      color: #94a3b8;
      font-weight: 700;
    }
    .gear-box {
      font-size: 14px;
      font-weight: 800;
      color: #38bdf8;
      margin-left: 8px;
    }

    /* Floating Near Miss Popup */
    #near-miss-banner {
      position: absolute;
      top: 26%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.7);
      background: rgba(14, 165, 233, 0.9);
      color: #ffffff;
      padding: 8px 24px;
      border-radius: 9999px;
      font-weight: 900;
      font-size: 18px;
      letter-spacing: 0.05em;
      box-shadow: 0 0 25px rgba(56, 189, 248, 0.8);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s, transform 0.25s;
    }
    #near-miss-banner.show {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.15);
    }

    /* Touch Controls for Mobile */
    #touch-controls {
      display: none;
      width: 100%;
      justify-content: space-between;
      align-items: flex-end;
      padding-bottom: 8px;
      pointer-events: auto;
    }
    .touch-btn {
      width: 76px;
      height: 76px;
      background: rgba(30, 41, 59, 0.7);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 800;
      font-size: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: transform 0.08s, background 0.08s, border-color 0.08s;
    }
    .touch-btn:active {
      transform: scale(0.92);
      background: rgba(56, 189, 248, 0.5);
      border-color: #38bdf8;
    }
    .touch-btn-sub {
      width: 60px;
      height: 60px;
      font-size: 12px;
      text-transform: uppercase;
      border-radius: 16px;
      background: rgba(30, 41, 59, 0.65);
    }
    .touch-group {
      display: flex;
      gap: 14px;
      align-items: center;
    }

    /* Modals (Start Screen & Game Over) */
    .modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(3, 7, 18, 0.82);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      padding: 16px;
    }
    .modal-card {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 28px 24px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
      text-align: center;
    }
    .modal-title {
      font-size: 30px;
      font-weight: 900;
      letter-spacing: -0.01em;
      color: #ffffff;
      margin-bottom: 6px;
    }
    .modal-sub {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 22px;
      line-height: 1.4;
    }
    .color-swatch-list {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin: 14px 0 22px;
    }
    .color-swatch {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 3px solid transparent;
      cursor: pointer;
      transition: transform 0.15s, border-color 0.15s;
    }
    .color-swatch.active {
      transform: scale(1.18);
      border-color: #ffffff;
      box-shadow: 0 0 16px rgba(255, 255, 255, 0.5);
    }
    .btn-primary {
      width: 100%;
      background: #ef4444;
      color: #ffffff;
      border: none;
      padding: 14px 20px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.05em;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
      transition: transform 0.1s, background 0.15s;
    }
    .btn-primary:active {
      transform: scale(0.98);
      background: #dc2626;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 18px 0 24px;
      text-align: left;
    }
    .stat-box {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 12px;
    }
    .stat-box-title {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
    }
    .stat-box-value {
      font-size: 22px;
      font-weight: 800;
      color: #f8fafc;
      margin-top: 2px;
    }
    .hud-icon-btn {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      color: #cbd5e1;
      font-size: 13px;
      font-weight: 600;
      padding: 6px 12px;
      cursor: pointer;
      pointer-events: auto;
    }
    .hud-icon-btn:hover {
      background: rgba(51, 65, 85, 0.8);
      color: #ffffff;
    }
  </style>
</head>
<body>
  <!-- 3D Canvas Container -->
  <div id="game-container"></div>

  <!-- In-Game HUD -->
  <div id="hud">
    <div class="top-bar">
      <!-- Speed & Gear -->
      <div class="hud-card">
        <div class="speedo-wrap">
          <span id="hud-speed" class="speedo-num font-racing">0</span>
          <span class="speedo-unit">KM/H</span>
          <span id="hud-gear" class="gear-box font-racing">G1</span>
        </div>
      </div>

      <!-- Audio Mute & Pause Controls -->
      <div style="display:flex; gap: 8px;">
        <button id="btn-sound" class="hud-icon-btn">🔊 SOUND</button>
        <button id="btn-pause" class="hud-icon-btn">⏸ PAUSE</button>
      </div>

      <!-- Score & High Score -->
      <div class="hud-card" style="text-align: right;">
        <div class="stat-label">SCORE</div>
        <div id="hud-score" class="stat-value font-racing">0</div>
        <div id="hud-multiplier" class="streak-badge">1X MULTIPLIER</div>
      </div>
    </div>

    <!-- Near Miss Alert -->
    <div id="near-miss-banner" class="font-racing">NEAR MISS +100!</div>

    <!-- Mobile Touch Controls -->
    <div id="touch-controls">
      <div class="touch-group">
        <button id="touch-left" class="touch-btn" aria-label="Steer Left">◀</button>
        <button id="touch-right" class="touch-btn" aria-label="Steer Right">▶</button>
      </div>
      <div class="touch-group">
        <button id="touch-brake" class="touch-btn touch-btn-sub" aria-label="Brake">SLOW</button>
        <button id="touch-boost" class="touch-btn touch-btn-sub" style="background: rgba(239, 68, 68, 0.4); border-color: #ef4444;" aria-label="Boost">NITRO</button>
      </div>
    </div>
  </div>

  <!-- Start Screen Modal -->
  <div id="start-modal" class="modal-overlay">
    <div class="modal-card">
      <h1 class="modal-title font-racing">APEX RACER 3D</h1>
      <p class="modal-sub">Dodge high-speed traffic, trigger near-misses, and race into the sunset.</p>

      <div style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">SELECT CAR PAINT</div>
      <div class="color-swatch-list">
        <div class="color-swatch active" data-color="0xef4444" style="background:#ef4444;"></div>
        <div class="color-swatch" data-color="0x06b6d4" style="background:#06b6d4;"></div>
        <div class="color-swatch" data-color="0x10b981" style="background:#10b981;"></div>
        <div class="color-swatch" data-color="0xf59e0b" style="background:#f59e0b;"></div>
        <div class="color-swatch" data-color="0x8b5cf6" style="background:#8b5cf6;"></div>
        <div class="color-swatch" data-color="0x1e293b" style="background:#1e293b; border: 1px solid #475569;"></div>
      </div>

      <div style="background: rgba(30, 41, 59, 0.4); border-radius: 12px; padding: 12px; margin-bottom: 20px; font-size: 13px; color: #cbd5e1; text-align: left; line-height: 1.5;">
        <div><b>Controls:</b></div>
        <div>• <b>PC:</b> Arrow Keys or <b>A / D</b> to steer, <b>W</b> for Nitro, <b>S</b> to Brake.</div>
        <div>• <b>Mobile:</b> Touch on-screen buttons to steer and boost.</div>
      </div>

      <button id="btn-start" class="btn-primary font-racing">START RACE</button>
      <div style="margin-top: 14px; font-size: 12px; color: #64748b;">
        High Score: <span id="start-high-score" class="font-racing" style="color: #38bdf8;">0</span>
      </div>
    </div>
  </div>

  <!-- Game Over Screen Modal -->
  <div id="gameover-modal" class="modal-overlay" style="display: none;">
    <div class="modal-card">
      <div style="color: #ef4444; font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">CRASH COLLISION</div>
      <h2 class="modal-title font-racing" style="color: #f87171; margin-top: 4px;">GAME OVER</h2>
      <div id="record-badge" style="display: none; background: #0284c7; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; margin: 4px auto 14px; width: fit-content;">NEW RECORD!</div>

      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-box-title">Final Score</div>
          <div id="go-score" class="stat-box-value font-racing">0</div>
        </div>
        <div class="stat-box">
          <div class="stat-box-title">High Score</div>
          <div id="go-high" class="stat-box-value font-racing">0</div>
        </div>
        <div class="stat-box">
          <div class="stat-box-title">Distance</div>
          <div id="go-distance" class="stat-box-value font-racing">0 m</div>
        </div>
        <div class="stat-box">
          <div class="stat-box-title">Top Speed</div>
          <div id="go-speed" class="stat-box-value font-racing">0 km/h</div>
        </div>
      </div>

      <button id="btn-restart" class="btn-primary font-racing">RACE AGAIN</button>
    </div>
  </div>

  <script>
    // ==========================================
    // PROCEDURAL WEB AUDIO SYNTHESIZER
    // ==========================================
    class SoundEngine {
      constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.engineOsc = null;
        this.engineSubOsc = null;
        this.engineFilter = null;
        this.engineGain = null;
        this.isEngineRunning = false;
      }
      initContext() {
        if (!this.ctx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) this.ctx = new AudioContextClass();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }
      toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.engineGain && this.ctx) {
          this.engineGain.gain.setValueAtTime(this.isMuted ? 0 : 0.16, this.ctx.currentTime);
        }
        return this.isMuted;
      }
      startEngine() {
        this.initContext();
        if (!this.ctx || this.isEngineRunning) return;
        try {
          const t = this.ctx.currentTime;
          this.engineOsc = this.ctx.createOscillator();
          this.engineOsc.type = 'sawtooth';
          this.engineOsc.frequency.setValueAtTime(55, t);

          this.engineSubOsc = this.ctx.createOscillator();
          this.engineSubOsc.type = 'triangle';
          this.engineSubOsc.frequency.setValueAtTime(27.5, t);

          this.engineFilter = this.ctx.createBiquadFilter();
          this.engineFilter.type = 'lowpass';
          this.engineFilter.frequency.setValueAtTime(240, t);

          this.engineGain = this.ctx.createGain();
          this.engineGain.gain.setValueAtTime(this.isMuted ? 0 : 0.16, t);

          this.engineOsc.connect(this.engineFilter);
          this.engineSubOsc.connect(this.engineFilter);
          this.engineFilter.connect(this.engineGain);
          this.engineGain.connect(this.ctx.destination);

          this.engineOsc.start(t);
          this.engineSubOsc.start(t);
          this.isEngineRunning = true;
        } catch(e) {}
      }
      updatePitch(speedRatio, isBoosting) {
        if (!this.ctx || !this.isEngineRunning || !this.engineOsc || !this.engineFilter) return;
        const t = this.ctx.currentTime;
        const mult = isBoosting ? 1.25 : 1.0;
        const targetFreq = (55 + Math.pow(speedRatio, 1.2) * 165) * mult;
        const targetFilter = 220 + speedRatio * 800 + (isBoosting ? 300 : 0);
        this.engineOsc.frequency.setTargetAtTime(targetFreq, t, 0.08);
        this.engineSubOsc.frequency.setTargetAtTime(targetFreq * 0.5, t, 0.08);
        this.engineFilter.frequency.setTargetAtTime(targetFilter, t, 0.08);
      }
      stopEngine() {
        if (this.engineOsc) {
          try { this.engineOsc.stop(); this.engineOsc.disconnect(); } catch(e) {}
          this.engineOsc = null;
        }
        if (this.engineSubOsc) {
          try { this.engineSubOsc.stop(); this.engineSubOsc.disconnect(); } catch(e) {}
          this.engineSubOsc = null;
        }
        this.isEngineRunning = false;
      }
      playTireScreech() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;
        try {
          const bufferSize = this.ctx.sampleRate * 0.22;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(2200, this.ctx.currentTime);
          filter.Q.setValueAtTime(4.0, this.ctx.currentTime);
          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          noise.start();
        } catch(e) {}
      }
      playNearMiss() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;
        try {
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(659.25, t);
          osc.frequency.exponentialRampToValueAtTime(1046.5, t + 0.15);
          gain.gain.setValueAtTime(0.22, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.22);
        } catch(e) {}
      }
      playCrash() {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;
        try {
          const t = this.ctx.currentTime;
          const thump = this.ctx.createOscillator();
          const thumpGain = this.ctx.createGain();
          thump.type = 'sine';
          thump.frequency.setValueAtTime(150, t);
          thump.frequency.exponentialRampToValueAtTime(30, t + 0.4);
          thumpGain.gain.setValueAtTime(0.6, t);
          thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
          thump.connect(thumpGain);
          thumpGain.connect(this.ctx.destination);
          thump.start(t);
          thump.stop(t + 0.45);

          const bufferSize = this.ctx.sampleRate * 0.6;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1200, t);
          const noiseGain = this.ctx.createGain();
          noiseGain.gain.setValueAtTime(0.5, t);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(this.ctx.destination);
          noise.start(t);
        } catch(e) {}
      }
    }

    const sound = new SoundEngine();

    // ==========================================
    // PROCEDURAL 3D MODELS (Three.js)
    // ==========================================
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.29, 8);
    rimGeo.rotateZ(Math.PI / 2);

    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.2, metalness: 0.8 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85 });
    const hlMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, emissive: 0xe0f2fe, emissiveIntensity: 1.5 });
    const tlMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 1.8 });

    function createWheel() {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(wheelGeo, wheelMat));
      g.add(new THREE.Mesh(rimGeo, rimMat));
      return g;
    }

    function createPlayerCar(colorHex) {
      const g = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.25, metalness: 0.7 });
      const trimMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.6 });

      const lower = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.32, 3.8), trimMat);
      lower.position.y = 0.36;
      g.add(lower);

      const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.46, 3.4), bodyMat);
      body.position.y = 0.62;
      g.add(body);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.42, 1.8), glassMat);
      cabin.position.set(0, 0.94, -0.15);
      g.add(cabin);

      const roof = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.08, 1.4), bodyMat);
      roof.position.set(0, 1.18, -0.15);
      g.add(roof);

      const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.08, 0.38), trimMat);
      spoiler.position.set(0, 1.12, -1.68);
      g.add(spoiler);

      const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.12), hlMat);
      hlL.position.set(-0.6, 0.62, 1.72);
      const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.12), hlMat);
      hlR.position.set(0.6, 0.62, 1.72);
      g.add(hlL); g.add(hlR);

      const tl = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.1, 0.08), tlMat);
      tl.position.set(0, 0.65, -1.72);
      g.add(tl);

      const wheels = [];
      const frontWheels = [];
      const wheelPos = [
        { x: -0.9, y: 0.38, z: 1.15, front: true },
        { x: 0.9, y: 0.38, z: 1.15, front: true },
        { x: -0.9, y: 0.38, z: -1.15, front: false },
        { x: 0.9, y: 0.38, z: -1.15, front: false }
      ];
      wheelPos.forEach(p => {
        const w = createWheel();
        w.position.set(p.x, p.y, p.z);
        g.add(w);
        wheels.push(w);
        if (p.front) frontWheels.push(w);
      });

      return {
        group: g,
        wheels,
        frontWheels,
        setBodyColor: (c) => { bodyMat.color.set(c); roof.material = bodyMat; }
      };
    }

    const enemyColors = [0x2563eb, 0xf59e0b, 0x10b981, 0x8b5cf6, 0xec4899, 0x0284c7, 0xe11d48];

    function createEnemyCar(isTruck) {
      const g = new THREE.Group();
      const wheels = [];
      const color = enemyColors[Math.floor(Math.random() * enemyColors.length)];
      const paintMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 });

      let width = 1.6;
      let length = 3.6;

      if (isTruck) {
        width = 1.9;
        length = 6.0;
        const cab = new THREE.Mesh(new THREE.BoxGeometry(1.84, 1.4, 2.0), paintMat);
        cab.position.set(0, 1.05, 1.8);
        g.add(cab);

        const cargo = new THREE.Mesh(new THREE.BoxGeometry(1.86, 1.7, 4.0), new THREE.MeshStandardMaterial({ color: 0xf1f5f9 }));
        cargo.position.set(0, 1.25, -1.1);
        g.add(cargo);

        [2.0, -1.4, -2.6].forEach(z => {
          [-1.0, 1.0].forEach(x => {
            const w = createWheel();
            w.position.set(x, 0.4, z);
            g.add(w);
            wheels.push(w);
          });
        });
      } else {
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.44, 3.2), paintMat);
        body.position.y = 0.62;
        g.add(body);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.4, 1.6), glassMat);
        cabin.position.set(0, 0.92, -0.1);
        g.add(cabin);

        [-1.15, 1.15].forEach(z => {
          [-0.88, 0.88].forEach(x => {
            const w = createWheel();
            w.position.set(x, 0.38, z);
            g.add(w);
            wheels.push(w);
          });
        });
      }

      g.rotation.y = Math.PI; // Face incoming
      return { group: g, wheels, width, length };
    }

    function createTree() {
      const tree = new THREE.Group();
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.8 });

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 1.2, 7), trunkMat);
      trunk.position.y = 0.6;
      tree.add(trunk);

      const t1 = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.8, 7), foliageMat);
      t1.position.y = 1.9;
      const t2 = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.6, 7), foliageMat);
      t2.position.y = 2.8;
      tree.add(t1); tree.add(t2);

      const scale = 0.85 + Math.random() * 0.4;
      tree.scale.set(scale, scale, scale);
      return tree;
    }

    function createLamppost() {
      const lamp = new THREE.Group();
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const lightMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 1.5 });

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 5.0, 8), poleMat);
      pole.position.y = 2.5;
      lamp.add(pole);

      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8), poleMat);
      arm.rotation.z = -Math.PI / 3;
      arm.position.set(0.7, 4.8, 0);
      lamp.add(arm);

      const fix = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.5), lightMat);
      fix.position.set(1.4, 4.4, 0);
      lamp.add(fix);
      return lamp;
    }

    function createBuilding() {
      const b = new THREE.Group();
      const h = 20 + Math.random() * 20;
      const w = 7;
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      bMesh.position.y = h / 2;
      b.add(bMesh);
      return b;
    }

    // ==========================================
    // MAIN GAME ENGINE & LOOP
    // ==========================================
    const container = document.getElementById('game-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

    const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 350);
    camera.position.set(0, 4.2, 7.8);
    camera.lookAt(0, 1.2, -10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0x94a3b8, 0.85));
    scene.add(new THREE.HemisphereLight(0x38bdf8, 0x1e293b, 0.6));
    const dirLight = new THREE.DirectionalLight(0xfef08a, 1.3);
    dirLight.position.set(20, 35, 20);
    scene.add(dirLight);

    // Distant mountain
    const mtnGeo = new THREE.PlaneGeometry(240, 60, 16, 8);
    mtnGeo.rotateX(-Math.PI / 2);
    const pos = mtnGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, Math.max(0, 20 - Math.abs(x) * 0.1 + Math.sin(x * 0.2) * 6));
    }
    mtnGeo.computeVertexNormals();
    const mtn = new THREE.Mesh(mtnGeo, new THREE.MeshStandardMaterial({ color: 0x1e1b4b, flatShading: true }));
    mtn.position.set(0, -0.5, -160);
    scene.add(mtn);

    // Road configuration
    const roadWidth = 15;
    const laneX = [-4.5, -1.5, 1.5, 4.5];
    let currentLane = 1;
    let playerTargetX = -1.5;
    let playerCurrentX = -1.5;

    // Endless Road Segments
    const roadSegments = [];
    const segLength = 60;
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Group();
      // Asphalt
      const asp = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, segLength).rotateX(-Math.PI/2), new THREE.MeshStandardMaterial({ color: 0x111827 }));
      seg.add(asp);
      // Grass
      const gL = new THREE.Mesh(new THREE.PlaneGeometry(50, segLength).rotateX(-Math.PI/2), new THREE.MeshStandardMaterial({ color: 0x064e3b }));
      gL.position.set(-roadWidth/2 - 25, -0.04, 0);
      const gR = new THREE.Mesh(new THREE.PlaneGeometry(50, segLength).rotateX(-Math.PI/2), new THREE.MeshStandardMaterial({ color: 0x064e3b }));
      gR.position.set(roadWidth/2 + 25, -0.04, 0);
      seg.add(gL); seg.add(gR);

      // Rumble curbs
      for (let z = -segLength/2; z < segLength/2; z += 2.5) {
        const mat = Math.floor(z/2.5)%2 === 0 ? new THREE.MeshStandardMaterial({ color: 0xdc2626 }) : new THREE.MeshStandardMaterial({ color: 0xf8fafc });
        const cL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 2.5), mat);
        cL.position.set(-roadWidth/2 - 0.18, 0.06, z + 1.25);
        const cR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 2.5), mat);
        cR.position.set(roadWidth/2 + 0.18, 0.06, z + 1.25);
        seg.add(cL); seg.add(cR);
      }

      // Dashed lane lines
      [-3.0, 0, 3.0].forEach(lx => {
        for (let z = -segLength/2; z < segLength/2; z += 6.5) {
          const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 3.5).rotateX(-Math.PI/2), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.2 }));
          dash.position.set(lx, 0.02, z + 1.75);
          seg.add(dash);
        }
      });

      seg.position.z = -i * segLength + 30;
      scene.add(seg);
      roadSegments.push(seg);
    }

    // Scenery pool
    const scenery = [];
    for (let z = -240; z <= 40; z += 18) {
      const tL = Math.random() > 0.4 ? createTree() : createLamppost();
      tL.position.set(-roadWidth/2 - 3 - Math.random() * 6, 0, z);
      scene.add(tL);
      scenery.push(tL);

      const tR = Math.random() > 0.4 ? createTree() : createBuilding();
      tR.position.set(roadWidth/2 + 3 + Math.random() * 6, 0, z);
      scene.add(tR);
      scenery.push(tR);
    }

    // Player & Traffic
    let playerCar = createPlayerCar(0xef4444);
    scene.add(playerCar.group);

    let enemies = [];
    let debris = [];

    // State Variables
    let isRunning = false;
    let isPaused = false;
    let isCrashed = false;
    let selectedColor = 0xef4444;
    let currentSpeed = 1.0;
    let targetSpeed = 1.0;
    let maxSpeed = 2.7;
    let score = 0;
    let highScore = parseInt(localStorage.getItem('apex_racer_high_score') || '0', 10);
    let distance = 0;
    let nearMisses = 0;
    let multiplier = 1;
    let consecutive = 0;
    let isBoosting = false;
    let isBraking = false;
    let spawnTimer = 0;
    let crashTimer = 0;
    let topSpeed = 0;

    document.getElementById('start-high-score').textContent = highScore;

    // UI Elements
    const hudSpeed = document.getElementById('hud-speed');
    const hudGear = document.getElementById('hud-gear');
    const hudScore = document.getElementById('hud-score');
    const hudMult = document.getElementById('hud-multiplier');
    const nearMissBanner = document.getElementById('near-miss-banner');
    const startModal = document.getElementById('start-modal');
    const gameoverModal = document.getElementById('gameover-modal');

    // Check Mobile to reveal touch controls
    function checkTouch() {
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.getElementById('touch-controls').style.display = 'flex';
      }
    }
    checkTouch();

    function startGame() {
      isRunning = true;
      isPaused = false;
      isCrashed = false;
      score = 0;
      distance = 0;
      nearMisses = 0;
      multiplier = 1;
      consecutive = 0;
      currentSpeed = 1.0;
      targetSpeed = 1.0;
      topSpeed = 68;
      currentLane = 1;
      playerTargetX = laneX[1];
      playerCurrentX = laneX[1];

      // Clean old cars & debris
      enemies.forEach(e => scene.remove(e.group));
      enemies = [];
      debris.forEach(d => scene.remove(d.mesh));
      debris = [];

      playerCar.setBodyColor(selectedColor);
      playerCar.group.rotation.set(0, 0, 0);
      playerCar.group.position.set(playerCurrentX, 0, 0);

      startModal.style.display = 'none';
      gameoverModal.style.display = 'none';
      sound.startEngine();
    }

    function steerLeft() {
      if (!isRunning || isCrashed || isPaused) return;
      if (currentLane > 0) {
        currentLane--;
        playerTargetX = laneX[currentLane];
        sound.playTireScreech();
      }
    }

    function steerRight() {
      if (!isRunning || isCrashed || isPaused) return;
      if (currentLane < laneX.length - 1) {
        currentLane++;
        playerTargetX = laneX[currentLane];
        sound.playTireScreech();
      }
    }

    function triggerCrash() {
      isCrashed = true;
      sound.playCrash();
      crashTimer = 0;

      // Burst Debris Particles
      for (let i = 0; i < 40; i++) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        mesh.position.set(playerCurrentX, 0.6, 0);
        scene.add(mesh);
        debris.push({
          mesh,
          vel: new THREE.Vector3((Math.random() - 0.5) * 12, 4 + Math.random() * 10, (Math.random() - 0.5) * 12),
          life: 1.8
        });
      }
    }

    function gameOver() {
      isRunning = false;
      sound.stopEngine();

      const isNew = score > highScore;
      if (isNew) {
        highScore = Math.floor(score);
        localStorage.setItem('apex_racer_high_score', highScore.toString());
      }

      document.getElementById('go-score').textContent = Math.floor(score);
      document.getElementById('go-high').textContent = highScore;
      document.getElementById('go-distance').textContent = Math.floor(distance) + ' m';
      document.getElementById('go-speed').textContent = Math.floor(topSpeed) + ' km/h';
      document.getElementById('record-badge').style.display = isNew ? 'block' : 'none';
      gameoverModal.style.display = 'flex';
    }

    function spawnTraffic() {
      const lane = Math.floor(Math.random() * laneX.length);
      const isTruck = Math.random() < 0.25;
      const enemy = createEnemyCar(isTruck);
      enemy.group.position.set(laneX[lane], 0, -140 - Math.random() * 25);
      scene.add(enemy.group);

      enemies.push({
        ...enemy,
        speed: (isTruck ? 0.35 : 0.55) * (0.85 + Math.random() * 0.3),
        lane,
        passed: false,
        scoredNearMiss: false
      });
    }

    // Main Animation Loop
    let lastTime = performance.now();
    function animate(now) {
      requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;

      if (isCrashed) {
        crashTimer += dt;
        playerCar.group.rotation.x += dt * 3.5;
        playerCar.group.rotation.z += dt * 4.5;
        playerCar.group.position.y += dt * 1.2;

        for (let i = debris.length - 1; i >= 0; i--) {
          const d = debris[i];
          d.life -= dt;
          d.mesh.position.addScaledVector(d.vel, dt);
          d.vel.y -= 25 * dt;
          if (d.mesh.position.y < 0.1) {
            d.mesh.position.y = 0.1;
            d.vel.y *= -0.3;
          }
          if (d.life <= 0) {
            scene.remove(d.mesh);
            debris.splice(i, 1);
          }
        }

        if (crashTimer > 1.2 && isRunning) {
          gameOver();
        }
        renderer.render(scene, camera);
        return;
      }

      if (!isRunning || isPaused) {
        // Subtle road motion in menu
        roadSegments.forEach(s => {
          s.position.z += 0.3;
          if (s.position.z > 60) s.position.z -= 300;
        });
        renderer.render(scene, camera);
        return;
      }

      // Speed Dynamics
      targetSpeed = Math.min(maxSpeed, 1.0 + distance * 0.00015);
      if (isBoosting) targetSpeed *= 1.35;
      if (isBraking) targetSpeed *= 0.65;
      currentSpeed += (targetSpeed - currentSpeed) * 0.06;

      const speedKmh = Math.floor(currentSpeed * 68);
      if (speedKmh > topSpeed) topSpeed = speedKmh;

      sound.updatePitch(Math.min(1.0, (currentSpeed - 0.8) / 2.5), isBoosting);

      distance += currentSpeed * 2.2;
      score += currentSpeed * multiplier * 0.8;

      // Player Steering Physics
      const dx = playerTargetX - playerCurrentX;
      playerCurrentX += dx * Math.min(1.0, 12 * dt);
      playerCar.group.position.x = playerCurrentX;
      playerCar.group.rotation.z = -dx * 0.12;

      playerCar.frontWheels.forEach(w => w.rotation.y = -dx * 0.28);
      playerCar.wheels.forEach(w => w.rotation.x -= currentSpeed * 0.75);

      // Road scroll
      const roadMove = currentSpeed * 1.8;
      roadSegments.forEach(s => {
        s.position.z += roadMove;
        if (s.position.z > 60) s.position.z -= 300;
      });

      // Scenery scroll
      scenery.forEach(s => {
        s.position.z += roadMove;
        if (s.position.z > 40) s.position.z -= 280;
      });

      // Traffic Spawning
      spawnTimer += dt;
      if (spawnTimer > Math.max(0.7, 1.8 - (score / 500) * 0.3)) {
        spawnTimer = 0;
        spawnTraffic();
      }

      // Traffic Collision & Update
      const pBox = { minX: playerCurrentX - 0.75, maxX: playerCurrentX + 0.75, minZ: -1.7, maxZ: 1.7 };
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.group.position.z += roadMove + e.speed * 1.2;
        e.wheels.forEach(w => w.rotation.x += e.speed * 0.5);

        const ez = e.group.position.z;
        const ex = e.group.position.x;
        const hw = e.width * 0.48;
        const hl = e.length * 0.48;

        // Collision Check
        if (pBox.minX <= ex + hw && pBox.maxX >= ex - hw && pBox.minZ <= ez + hl && pBox.maxZ >= ez - hl) {
          triggerCrash();
          break;
        }

        // Near-Miss Bonus
        if (!e.scoredNearMiss && Math.abs(ez) < 1.8) {
          const lat = Math.abs(playerCurrentX - ex);
          if (lat > 1.2 && lat < 2.5) {
            e.scoredNearMiss = true;
            nearMisses++;
            consecutive++;
            multiplier = Math.min(5, 1 + Math.floor(consecutive / 3));
            score += 100 * multiplier;
            sound.playNearMiss();

            // Flash banner
            nearMissBanner.textContent = 'NEAR MISS +' + (100 * multiplier) + '!';
            nearMissBanner.classList.add('show');
            setTimeout(() => nearMissBanner.classList.remove('show'), 650);
          }
        }

        // Passed safely
        if (!e.passed && ez > 3.0) {
          e.passed = true;
          score += 25 * multiplier;
        }

        if (ez > 35) {
          scene.remove(e.group);
          enemies.splice(i, 1);
        }
      }

      // Camera Damping
      camera.position.x += (playerCurrentX * 0.45 - camera.position.x) * 0.1;
      camera.fov += ((isBoosting ? 72 : 62) - camera.fov) * 0.08;
      camera.updateProjectionMatrix();

      // Update HUD
      hudSpeed.textContent = speedKmh;
      hudGear.textContent = 'G' + Math.min(6, Math.max(1, Math.floor((speedKmh - 40) / 25) + 1));
      hudScore.textContent = Math.floor(score);
      hudMult.textContent = multiplier + 'X MULTIPLIER';

      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);

    // Window Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Keyboard Controls
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') steerLeft();
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') steerRight();
      else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') isBoosting = true;
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') isBraking = true;
      else if (e.key === ' ') {
        if (!isRunning && startModal.style.display !== 'none') startGame();
        else if (isCrashed && gameoverModal.style.display !== 'none') startGame();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') isBoosting = false;
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') isBraking = false;
    });

    // Mobile Touch Button Listeners
    const btnLeft = document.getElementById('touch-left');
    const btnRight = document.getElementById('touch-right');
    const btnBoost = document.getElementById('touch-boost');
    const btnBrake = document.getElementById('touch-brake');

    btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); steerLeft(); });
    btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); steerRight(); });
    btnBoost.addEventListener('touchstart', (e) => { e.preventDefault(); isBoosting = true; });
    btnBoost.addEventListener('touchend', (e) => { e.preventDefault(); isBoosting = false; });
    btnBrake.addEventListener('touchstart', (e) => { e.preventDefault(); isBraking = true; });
    btnBrake.addEventListener('touchend', (e) => { e.preventDefault(); isBraking = false; });

    // Swatches
    document.querySelectorAll('.color-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        selectedColor = parseInt(sw.getAttribute('data-color'), 16);
        playerCar.setBodyColor(selectedColor);
      });
    });

    // Buttons
    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('btn-restart').addEventListener('click', startGame);

    document.getElementById('btn-sound').addEventListener('click', () => {
      const muted = sound.toggleMute();
      document.getElementById('btn-sound').textContent = muted ? '🔇 MUTED' : '🔊 SOUND';
    });

    document.getElementById('btn-pause').addEventListener('click', () => {
      if (!isRunning || isCrashed) return;
      isPaused = !isPaused;
      document.getElementById('btn-pause').textContent = isPaused ? '▶ RESUME' : '⏸ PAUSE';
      if (isPaused) sound.stopEngine();
      else sound.startEngine();
    });
  </script>
</body>
</html>`;
}
