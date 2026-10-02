import React, { useState } from 'react';
import { X, Download, Copy, Check, Smartphone, Monitor } from 'lucide-react';
import { getStandaloneHtmlCode } from '../game/standaloneHtml';

interface StandaloneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandaloneModal: React.FC<StandaloneModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const htmlCode = getStandaloneHtmlCode();

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl my-auto text-left relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
          Single-File Offline Export
        </div>
        <h3 className="font-racing text-2xl font-black text-white mb-2">
          Standalone index.html
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed">
          This game is 100% self-contained in a single <code className="text-cyan-400 font-mono">index.html</code> file. It contains the Three.js 3D engine, procedural cars, mountains, trees, sound effects, and mobile touch controls with zero external audio assets or backend required.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleDownload}
            className="bg-cyan-500 hover:bg-cyan-400 active:scale-98 text-slate-950 font-racing font-bold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download index.html
          </button>

          <button
            onClick={handleCopy}
            className="bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 hover:text-white border border-slate-600/80 font-racing font-bold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
            {copied ? 'Copied to Clipboard!' : 'Copy HTML Code'}
          </button>
        </div>

        {/* How to run Guide */}
        <div className="space-y-3 bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300">
          <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">
            How to run the game:
          </div>

          <div className="flex items-start gap-2.5">
            <Monitor className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">On PC / Mac:</span> Save <code className="text-cyan-400 font-mono">index.html</code> anywhere and simply double-click it. It will open and run smoothly in Chrome, Edge, Firefox, or Safari!
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">On Android:</span> Download or transfer <code className="text-cyan-400 font-mono">index.html</code> to your phone's Downloads folder. Tap it in your "Files" app to open directly in Chrome, or open Chrome and navigate to <code className="text-cyan-400 font-mono">file:///sdcard/Download/index.html</code>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
