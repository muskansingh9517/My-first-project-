import React from 'react';
import { Play, Trophy, Download, Compass } from 'lucide-react';
import { DifficultyMode } from '../game/racingEngine';

interface StartModalProps {
  highScore: number;
  selectedColor: number;
  selectedDiff: DifficultyMode;
  onSelectColor: (hex: number) => void;
  onSelectDiff: (diff: DifficultyMode) => void;
  onStart: () => void;
  onOpenExport: () => void;
}

const CAR_COLORS = [
  { name: 'Crimson Red', hex: 0xef4444, bg: 'bg-red-500' },
  { name: 'Electric Cyan', hex: 0x06b6d4, bg: 'bg-cyan-500' },
  { name: 'Neon Lime', hex: 0x10b981, bg: 'bg-emerald-500' },
  { name: 'Amber Gold', hex: 0xf59e0b, bg: 'bg-amber-500' },
  { name: 'Violet Fury', hex: 0x8b5cf6, bg: 'bg-purple-500' },
  { name: 'Stealth Black', hex: 0x0f172a, bg: 'bg-slate-900 border border-slate-700' },
];

export const StartModal: React.FC<StartModalProps> = ({
  highScore,
  selectedColor,
  selectedDiff,
  onSelectColor,
  onSelectDiff,
  onStart,
  onOpenExport,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none overflow-y-auto">
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center my-auto">
        {/* Header */}
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1.5">
          <Compass className="w-3.5 h-3.5" />
          Highway Rush 3D
        </div>
        <h1 className="font-racing text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
          APEX RACER 3D
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-sm mx-auto">
          Dodge incoming highway traffic at extreme speeds. Pull off near-misses to multiply your score!
        </p>

        {/* High Score Banner */}
        <div className="flex items-center justify-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl py-2 px-4 mb-6">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400 uppercase font-semibold">Track Record:</span>
          <span className="font-racing font-extrabold text-sm text-cyan-400 tabular-nums">
            {highScore.toLocaleString()} PTS
          </span>
        </div>

        {/* Car Paint Selector */}
        <div className="mb-5 text-left">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Select Car Paint
          </label>
          <div className="flex items-center justify-between gap-2">
            {CAR_COLORS.map((c) => {
              const isSelected = selectedColor === c.hex;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => onSelectColor(c.hex)}
                  title={c.name}
                  className={`w-10 h-10 rounded-full ${c.bg} transition-all relative ${
                    isSelected ? 'ring-3 ring-cyan-400 scale-110 shadow-lg shadow-cyan-500/30' : 'opacity-80 hover:opacity-100 hover:scale-105'
                  }`}
                  aria-label={c.name}
                />
              );
            })}
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="mb-6 text-left">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Traffic Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['casual', 'pro', 'insane'] as DifficultyMode[]).map((mode) => {
              const active = selectedDiff === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onSelectDiff(mode)}
                  className={`py-2 px-2 text-xs font-racing font-bold uppercase rounded-lg border transition-all ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500 shadow-sm'
                      : 'bg-slate-800/40 text-slate-400 border-slate-700/60 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls Hint */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 mb-6 text-left text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-slate-200">How to Steer:</div>
          <div>• <b>PC:</b> <span className="text-cyan-400 font-mono">← / →</span> or <span className="text-cyan-400 font-mono">A / D</span> to steer, <span className="text-cyan-400 font-mono">↑ / W</span> for Nitro.</div>
          <div>• <b>Mobile:</b> Touch on-screen buttons to dodge cars.</div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={onStart}
            className="w-full bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 active:scale-98 text-white font-racing font-black text-base py-3.5 px-6 rounded-xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            START RACE
          </button>

          <button
            type="button"
            onClick={onOpenExport}
            className="w-full bg-slate-800/60 hover:bg-slate-800 active:scale-98 text-slate-300 hover:text-white border border-slate-700/60 font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Download Standalone index.html
          </button>
        </div>
      </div>
    </div>
  );
};
