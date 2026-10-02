import React from 'react';
import { Volume2, VolumeX, Pause, Play, Download, Zap } from 'lucide-react';
import { GameStats } from '../game/racingEngine';

interface HUDProps {
  stats: GameStats;
  isPaused: boolean;
  isMuted: boolean;
  nearMissText: string | null;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onOpenExportModal: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  isPaused,
  isMuted,
  nearMissText,
  onToggleMute,
  onTogglePause,
  onOpenExportModal,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* Top Bar HUD */}
      <div className="flex items-start justify-between gap-2 sm:gap-4 pointer-events-auto">
        {/* Speedometer & Gear */}
        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-xl flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Speed</span>
            <div className="flex items-baseline gap-1">
              <span className="font-racing text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums">
                {stats.speedKmh}
              </span>
              <span className="text-[11px] font-bold text-slate-400">KM/H</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700/60" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Gear</span>
            <span className="font-racing text-lg sm:text-xl font-extrabold text-cyan-400">
              G{stats.gear}
            </span>
          </div>

          {stats.isBoosting && (
            <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded-md border border-cyan-800/60 animate-pulse">
              <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
              <span className="hidden sm:inline">NITRO</span>
            </div>
          )}
        </div>

        {/* Center Quick Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onToggleMute}
            className="bg-slate-900/70 hover:bg-slate-800/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-lg"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="hidden md:inline">{isMuted ? 'Muted' : 'Sound'}</span>
          </button>

          <button
            onClick={onTogglePause}
            className="bg-slate-900/70 hover:bg-slate-800/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-lg"
            title={isPaused ? 'Resume Race' : 'Pause Race'}
            aria-label="Toggle Pause"
          >
            {isPaused ? <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
            <span className="hidden md:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="bg-slate-900/70 hover:bg-slate-800/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shadow-lg"
            title="Download Standalone index.html"
            aria-label="Export Single HTML file"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Get index.html</span>
          </button>
        </div>

        {/* Score & Streak */}
        <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-xl text-right">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">Score</span>
          <div className="font-racing text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums leading-none mt-0.5">
            {stats.score.toLocaleString()}
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-1 text-[11px] font-bold text-cyan-400">
            <span>{stats.multiplier}X MULTIPLIER</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-mono tabular-nums">{stats.distanceMeters}m</span>
          </div>
        </div>
      </div>

      {/* Near Miss Floating Popup */}
      {nearMissText && (
        <div className="self-center mb-auto mt-20 sm:mt-24 pointer-events-none transform -translate-y-2 animate-bounce">
          <div className="bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-racing font-black text-sm sm:text-lg px-4 py-1.5 rounded-full shadow-[0_0_24px_rgba(56,189,248,0.7)] tracking-wide">
            {nearMissText}
          </div>
        </div>
      )}

      {/* Pause Screen Overlay */}
      {isPaused && (
        <div className="self-center my-auto pointer-events-auto bg-slate-950/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 sm:p-8 text-center max-w-sm w-full shadow-2xl">
          <div className="font-racing text-2xl sm:text-3xl font-black text-white mb-2">RACE PAUSED</div>
          <p className="text-xs sm:text-sm text-slate-400 mb-6">Take a breather. Press Resume to jump right back onto the asphalt.</p>
          <button
            onClick={onTogglePause}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-racing font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            RESUME RACE
          </button>
        </div>
      )}
    </div>
  );
};
