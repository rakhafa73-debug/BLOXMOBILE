import React, { useState } from 'react';
import { Play, Download, Wifi, WifiOff, Shield, ShieldAlert } from 'lucide-react';
import { launchRoblox } from '../lib/robloxUrl';
import { useToast } from '../context/ToastContext';
import { ActiveTab } from '../types';

interface HeaderProps {
  isOnline: boolean;
  isInstalled: boolean;
  onOpenInstallModal: () => void;
  isAdminUnlocked: boolean;
  onToggleAdmin: () => void;
  onTabChange: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  isInstalled,
  onOpenInstallModal,
  isAdminUnlocked,
  onToggleAdmin,
  onTabChange,
}) => {
  const { showToast } = useToast();
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunchRoblox = () => {
    setIsLaunching(true);
    const result = launchRoblox();
    showToast('Launching Roblox mobile...', 'info');

    setTimeout(() => {
      setIsLaunching(false);
    }, 1500);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0D0B14]/80 backdrop-blur-xl border-b border-violet-500/15 px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Left mobile branding */}
        <div className="flex items-center gap-2.5 md:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center p-1.5 shadow-md shadow-violet-900/50">
            <img src="/icon.svg" alt="BloxMobile" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-sm font-black tracking-tight text-white flex items-center gap-1">
              BloxMobile
              <span className="text-[9px] uppercase font-mono px-1 py-0.2 bg-violet-500/20 text-violet-300 rounded border border-violet-500/30">
                PWA
              </span>
            </div>
          </div>
        </div>

        {/* Connectivity status */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#191523] border border-violet-500/20 text-xs">
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 text-[11px] font-medium">Online Mode</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 text-[11px] font-medium">Offline (Cached)</span>
            </>
          )}
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2">
          {/* Admin toggle icon */}
          <button
            onClick={() => {
              if (isAdminUnlocked) {
                onTabChange('admin');
              } else {
                onToggleAdmin();
              }
            }}
            className={`p-2 rounded-xl text-xs transition border flex items-center gap-1.5 ${
              isAdminUnlocked
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/40'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
            title={isAdminUnlocked ? 'Admin Mode Active' : 'Enter Admin Passcode'}
            aria-label="Admin portal"
          >
            {isAdminUnlocked ? (
              <>
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span className="hidden lg:inline font-mono text-[10px]">ADMIN</span>
              </>
            ) : (
              <Shield className="w-4 h-4" />
            )}
          </button>

          {/* PWA Install Button (if not already installed standalone) */}
          {!isInstalled && (
            <button
              onClick={onOpenInstallModal}
              className="px-3 py-1.5 rounded-xl bg-violet-950/60 hover:bg-violet-900/60 border border-violet-500/30 text-violet-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
              aria-label="Install App"
            >
              <Download className="w-3.5 h-3.5 text-violet-400" />
              <span>Install</span>
            </button>
          )}

          {/* Quick Open Roblox */}
          <button
            onClick={handleLaunchRoblox}
            disabled={isLaunching}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-violet-900/30 transition active:scale-95"
            aria-label="Open Roblox App"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isLaunching ? 'animate-spin' : ''}`} />
            <span>Open Roblox</span>
          </button>
        </div>
      </div>
    </header>
  );
};
