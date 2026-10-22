import React from 'react';
import { Share, PlusSquare, Smartphone, Download, X, Check, ShieldCheck } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  isAndroid: boolean;
  onTriggerInstall: () => Promise<boolean>;
  isInstallable: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isIOS,
  isAndroid,
  onTriggerInstall,
  isInstallable,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#191523] border border-violet-500/30 rounded-3xl p-6 shadow-2xl shadow-purple-950/60 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center p-2.5 shadow-lg shadow-violet-900/50">
              <img src="/icon.svg" alt="BloxMobile" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Install BloxMobile PWA</h3>
              <p className="text-xs text-slate-400">Add to home screen for native experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits list */}
        <div className="grid grid-cols-2 gap-2 my-4">
          <div className="p-2.5 rounded-xl bg-violet-950/30 border border-violet-500/10 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-200">Full screen mode</span>
          </div>
          <div className="p-2.5 rounded-xl bg-violet-950/30 border border-violet-500/10 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-200">Offline cached data</span>
          </div>
          <div className="p-2.5 rounded-xl bg-violet-950/30 border border-violet-500/10 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-200">Instant app launch</span>
          </div>
          <div className="p-2.5 rounded-xl bg-violet-950/30 border border-violet-500/10 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-200">0% battery waste</span>
          </div>
        </div>

        {/* Platform-specific instructions */}
        {isInstallable ? (
          <div className="mt-4">
            <button
              onClick={async () => {
                const installed = await onTriggerInstall();
                if (installed) onClose();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-900/40 transition active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              Install Now (1-Tap)
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              Browser will prompt you to confirm addition to home screen.
            </p>
          </div>
        ) : isIOS ? (
          <div className="mt-4 space-y-3 bg-black/40 border border-violet-500/20 p-4 rounded-2xl">
            <div className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>iOS Safari Instructions</span>
            </div>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Tap the <strong className="text-white">Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> at the bottom of Safari.
              </li>
              <li>
                Scroll down in the action sheet and select <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-300" />.
              </li>
              <li>
                Tap <strong className="text-violet-400">Add</strong> in the top-right corner to finish.
              </li>
            </ol>
          </div>
        ) : (
          <div className="mt-4 space-y-3 bg-black/40 border border-violet-500/20 p-4 rounded-2xl">
            <div className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>Android Chrome Instructions</span>
            </div>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Tap the three dots menu <strong className="text-white">(⋮)</strong> in Chrome.
              </li>
              <li>
                Select <strong className="text-white">Add to Home screen</strong> or <strong className="text-white">Install App</strong>.
              </li>
              <li>
                Confirm prompt to add BloxMobile icon to your app drawer.
              </li>
            </ol>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-violet-500/10 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Client-side & Safe
          </span>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white px-3 py-1 rounded-lg hover:bg-white/5 transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
