import React from 'react';
import { RotateCcw, Sliders, Trophy, Flame, Gauge, Navigation } from 'lucide-react';
import { GameOverData } from '../game/racingEngine';

interface GameOverModalProps {
  data: GameOverData;
  onRestart: () => void;
  onOpenMenu: () => void;
  onOpenExport: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  data,
  onRestart,
  onOpenMenu,
  onOpenExport,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center my-auto">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-red-500 mb-1">
          TRAFFIC COLLISION
        </div>
        <h2 className="font-racing text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
          GAME OVER
        </h2>

        {data.isNewHigh && (
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 text-xs font-black px-3.5 py-1 rounded-full mb-4 shadow-lg shadow-cyan-500/25">
            <Trophy className="w-3.5 h-3.5" />
            NEW ALL-TIME RECORD!
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-5 text-left">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Final Score</span>
            <div className="font-racing text-2xl font-black text-white mt-0.5 tabular-nums">
              {data.score.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase">High Score</span>
            <div className="font-racing text-2xl font-black text-cyan-400 mt-0.5 tabular-nums">
              {data.highScore.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Distance</span>
              <div className="font-racing text-base font-extrabold text-white tabular-nums">
                {data.distance} m
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Top Speed</span>
              <div className="font-racing text-base font-extrabold text-white tabular-nums">
                {data.topSpeed} km/h
              </div>
            </div>
          </div>
        </div>

        {/* Near Misses Count */}
        <div className="flex items-center justify-between bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-2.5 mb-6 text-xs">
          <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Flame className="w-4 h-4 text-orange-400" />
            Near Miss Combos:
          </span>
          <span className="font-racing font-extrabold text-cyan-400 text-sm">
            {data.nearMisses} Dodges
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 active:scale-98 text-white font-racing font-black text-base py-3.5 px-6 rounded-xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            RACE AGAIN
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenMenu}
              className="w-full bg-slate-800/60 hover:bg-slate-800 active:scale-98 text-slate-300 hover:text-white border border-slate-700/60 font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              Change Car
            </button>

            <button
              type="button"
              onClick={onOpenExport}
              className="w-full bg-slate-800/60 hover:bg-slate-800 active:scale-98 text-slate-300 hover:text-white border border-slate-700/60 font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              Standalone HTML
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
