/**
 * Apex Racer 3D - High-Speed Highway Rush
 * Main Application Component uniting Three.js 3D Racing Engine,
 * Web Audio Procedural Synthesizer, Floating Glass HUD, and Mobile Touch Controls.
 */

import React, { useEffect, useRef, useState } from 'react';
import { RacingEngine, GameStats, GameOverData, DifficultyMode } from './game/racingEngine';
import { soundEngine } from './game/audio';
import { HUD } from './components/HUD';
import { MobileControls } from './components/MobileControls';
import { StartModal } from './components/StartModal';
import { GameOverModal } from './components/GameOverModal';
import { StandaloneModal } from './components/StandaloneModal';

const INITIAL_STATS: GameStats = {
  score: 0,
  highScore: 0,
  speedKmh: 0,
  distanceMeters: 0,
  gear: 1,
  multiplier: 1,
  nearMissCount: 0,
  isBoosting: false,
};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<RacingEngine | null>(null);

  // Game UI States
  const [gameState, setGameState] = useState<'menu' | 'racing' | 'gameover'>('menu');
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [gameOverData, setGameOverData] = useState<GameOverData | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [nearMissText, setNearMissText] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Player preferences
  const [selectedColor, setSelectedColor] = useState<number>(0xef4444);
  const [selectedDiff, setSelectedDiff] = useState<DifficultyMode>('pro');

  // Detect touch device
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  // Initialize Racing Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new RacingEngine();
    engine.init(containerRef.current);
    engineRef.current = engine;

    engine.setCallbacks(
      (newStats) => {
        setStats(newStats);
      },
      (bonusPoints) => {
        setNearMissText(`NEAR MISS +${bonusPoints}!`);
        setTimeout(() => {
          setNearMissText(null);
        }, 700);
      },
      (data) => {
        setGameOverData(data);
        setGameState('gameover');
      }
    );

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Start Race Handler
  const handleStartRace = () => {
    if (!engineRef.current) return;
    setGameState('racing');
    setIsPaused(false);
    engineRef.current.startRace(selectedDiff, selectedColor);
  };

  // Restart Game Handler
  const handleRestartRace = () => {
    if (!engineRef.current) return;
    setGameState('racing');
    setIsPaused(false);
    engineRef.current.startRace(selectedDiff, selectedColor);
  };

  // Return to Setup Menu
  const handleReturnToMenu = () => {
    setGameState('menu');
  };

  // Audio Toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  // Pause Toggle
  const handleTogglePause = () => {
    if (!engineRef.current || gameState !== 'racing') return;
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    engineRef.current.setPaused(nextPaused);
  };

  // Touch Steering actions
  const handleSteerLeft = () => {
    engineRef.current?.steerLeft();
  };

  const handleSteerRight = () => {
    engineRef.current?.steerRight();
  };

  const handleBoostStart = () => {
    engineRef.current?.setBoost(true);
  };

  const handleBoostEnd = () => {
    engineRef.current?.setBoost(false);
  };

  const handleBrakeStart = () => {
    engineRef.current?.setBrake(true);
  };

  const handleBrakeEnd = () => {
    engineRef.current?.setBrake(false);
  };

  return (
    <main className="relative w-full h-full overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Floating Racing Glass HUD */}
      {gameState === 'racing' && (
        <HUD
          stats={stats}
          isPaused={isPaused}
          isMuted={isMuted}
          nearMissText={nearMissText}
          onToggleMute={handleToggleMute}
          onTogglePause={handleTogglePause}
          onOpenExportModal={() => setIsExportModalOpen(true)}
        />
      )}

      {/* Mobile Ergonomic Touch Controls */}
      {gameState === 'racing' && !isPaused && isTouchDevice && (
        <MobileControls
          onSteerLeft={handleSteerLeft}
          onSteerRight={handleSteerRight}
          onBoostStart={handleBoostStart}
          onBoostEnd={handleBoostEnd}
          onBrakeStart={handleBrakeStart}
          onBrakeEnd={handleBrakeEnd}
        />
      )}

      {/* Start Game Modal */}
      {gameState === 'menu' && (
        <StartModal
          highScore={stats.highScore}
          selectedColor={selectedColor}
          selectedDiff={selectedDiff}
          onSelectColor={setSelectedColor}
          onSelectDiff={setSelectedDiff}
          onStart={handleStartRace}
          onOpenExport={() => setIsExportModalOpen(true)}
        />
      )}

      {/* Game Over Crash Modal */}
      {gameState === 'gameover' && gameOverData && (
        <GameOverModal
          data={gameOverData}
          onRestart={handleRestartRace}
          onOpenMenu={handleReturnToMenu}
          onOpenExport={() => setIsExportModalOpen(true)}
        />
      )}

      {/* Standalone index.html Download / View Modal */}
      <StandaloneModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </main>
  );
}
