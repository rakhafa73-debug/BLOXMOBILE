import React from 'react';
import { Home, Gamepad2, Palette, Gauge, Settings, Shield } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isAdminUnlocked?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, isAdminUnlocked = false }) => {
  const tabs = [
    { id: 'home' as ActiveTab, label: 'Home', icon: Home },
    { id: 'gamehub' as ActiveTab, label: 'Game Hub', icon: Gamepad2 },
    { id: 'customize' as ActiveTab, label: 'Customize', icon: Palette },
    { id: 'performance' as ActiveTab, label: 'Performance', icon: Gauge },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  if (isAdminUnlocked) {
    tabs.push({ id: 'admin' as ActiveTab, label: 'Admin', icon: Shield });
  }

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Fixed with safe area padding, touch target >= 44px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#120F1C]/95 backdrop-blur-xl border-t border-violet-500/20 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-2 rounded-2xl transition-all relative ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label={tab.label}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-violet-600/15 border border-violet-500/30 rounded-2xl -z-10 shadow-sm" />
                )}
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-violet-400' : ''
                  }`}
                />
                <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'text-violet-300' : 'text-slate-400'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-0.5 shadow-sm shadow-violet-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Navigation Sidebar / Top pill navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-[#120F1C]/90 backdrop-blur-xl border-r border-violet-500/15 p-5 min-h-screen shrink-0 sticky top-0 h-screen">
        {/* Brand header */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center p-2 shadow-lg shadow-violet-900/40">
            <img src="/icon.svg" alt="BloxMobile Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              BloxMobile
              <span className="text-[10px] font-mono uppercase bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-md border border-violet-500/30">
                PWA
              </span>
            </span>
            <p className="text-[11px] text-slate-400">Roblox Mobile Companion</p>
          </div>
        </div>

        {/* Tab Links */}
        <div className="space-y-1.5 flex-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Disclaimer footer */}
        <div className="p-3 rounded-2xl bg-black/40 border border-violet-500/10 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Independent Companion</p>
          <p className="text-slate-400 leading-relaxed">
            Not affiliated with Roblox Corp or Bloxstrap Windows. Client-side only.
          </p>
        </div>
      </aside>
    </>
  );
};
