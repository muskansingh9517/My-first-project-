import React from 'react';
import { ArrowLeft, ArrowRight, Zap, ShieldAlert } from 'lucide-react';

interface MobileControlsProps {
  onSteerLeft: () => void;
  onSteerRight: () => void;
  onBoostStart: () => void;
  onBoostEnd: () => void;
  onBrakeStart: () => void;
  onBrakeEnd: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onSteerLeft,
  onSteerRight,
  onBoostStart,
  onBoostEnd,
  onBrakeStart,
  onBrakeEnd,
}) => {
  return (
    <div className="absolute bottom-4 inset-x-0 px-4 sm:px-6 pointer-events-none z-30 flex items-end justify-between select-none">
      {/* Left Steering Touch Controls */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onSteerLeft();
          }}
          onClick={onSteerLeft}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900/80 active:bg-cyan-500/80 active:scale-95 border-2 border-slate-600 active:border-cyan-400 text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all touch-none"
          aria-label="Steer Left"
        >
          <ArrowLeft className="w-8 h-8 sm:w-10 sm:h-10" />
        </button>

        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onSteerRight();
          }}
          onClick={onSteerRight}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900/80 active:bg-cyan-500/80 active:scale-95 border-2 border-slate-600 active:border-cyan-400 text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all touch-none"
          aria-label="Steer Right"
        >
          <ArrowRight className="w-8 h-8 sm:w-10 sm:h-10" />
        </button>
      </div>

      {/* Right Action Touch Controls (Brake & Nitro) */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onBrakeStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onBrakeEnd();
          }}
          onMouseDown={onBrakeStart}
          onMouseUp={onBrakeEnd}
          onMouseLeave={onBrakeEnd}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/80 active:bg-amber-600/80 active:scale-95 border-2 border-slate-600 active:border-amber-400 text-amber-300 flex flex-col items-center justify-center shadow-2xl backdrop-blur-md transition-all touch-none"
          aria-label="Brake"
        >
          <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[10px] font-bold mt-0.5">SLOW</span>
        </button>

        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onBoostStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onBoostEnd();
          }}
          onMouseDown={onBoostStart}
          onMouseUp={onBoostEnd}
          onMouseLeave={onBoostEnd}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-rose-600/90 to-red-500/90 active:from-red-400 active:to-orange-400 active:scale-95 border-2 border-red-400 text-white flex flex-col items-center justify-center shadow-2xl backdrop-blur-md transition-all touch-none shadow-red-500/30"
          aria-label="Nitro Boost"
        >
          <Zap className="w-6 h-6 sm:w-8 sm:h-8 fill-white" />
          <span className="text-[10px] sm:text-xs font-racing font-extrabold tracking-wider">NITRO</span>
        </button>
      </div>
    </div>
  );
};
