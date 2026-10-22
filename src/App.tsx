/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { PWAInstallModal } from './components/PWAInstallModal';
import { HomeDashboard } from './features/home/HomeDashboard';
import { GameHub } from './features/gamehub/GameHub';
import { CustomizeCenter } from './features/customize/CustomizeCenter';
import { PerformanceAssistant } from './features/performance/PerformanceAssistant';
import { SettingsView } from './features/settings/SettingsView';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { GameDetailModal } from './features/gamehub/GameDetailModal';
import { usePWA } from './hooks/usePWA';
import { initializeDatabase, db } from './lib/db';
import { ActiveTab, RobloxGame } from './types';
import { WifiOff } from 'lucide-react';

function BloxMobileContent() {
  const { isOnline, isInstalled, isIOS, isAndroid, isInstallable, triggerInstall } = usePWA();
  const { bgPattern, animationIntensity } = useSettings();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [selectedGameForModal, setSelectedGameForModal] = useState<RobloxGame | null>(null);

  useEffect(() => {
    initializeDatabase().catch((err) => {
      console.warn('DB initialization error:', err);
    });
  }, []);

  const handleUnlockAdmin = (passcode: string): boolean => {
    // Verified passcode check
    if (passcode.trim() === 'admin2026') {
      setIsAdminUnlocked(true);
      setActiveTab('admin');
      return true;
    }
    return false;
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    setActiveTab('home');
    showToast('Admin session locked', 'info');
  };

  const handleToggleFavorite = async (gameId: string) => {
    const target = await db.games.get(gameId);
    if (!target) return;
    const nextState = !target.isFavorite;
    await db.games.update(gameId, { isFavorite: nextState });
    setSelectedGameForModal((prev) => (prev ? { ...prev, isFavorite: nextState } : null));
    showToast(nextState ? 'Added to favorites' : 'Removed from favorites', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative text-slate-100 overflow-x-hidden">
      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {bgPattern === 'mesh' && (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-600/15 blur-[120px] animate-pulse" />
            <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-purple-700/10 blur-[140px]" />
            <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-indigo-600/10 blur-[130px]" />
          </>
        )}
        {bgPattern === 'grid' && (
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'radial-gradient(circle, #8B5CF6 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        )}
        {bgPattern === 'dots' && (
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: 'radial-gradient(circle, #C4B5FD 1.5px, transparent 1.5px)',
              backgroundSize: '32px 32px',
            }}
          />
        )}
      </div>

      {/* Offline Status Top Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-black px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="w-4 h-4" />
          <span>Offline Mode — Displaying cached catalog and local preferences</span>
        </div>
      )}

      {/* Navigation (Sidebar on Desktop, Bottom bar on Mobile) */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdminUnlocked={isAdminUnlocked}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          isOnline={isOnline}
          isInstalled={isInstalled}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          isAdminUnlocked={isAdminUnlocked}
          onToggleAdmin={() => setActiveTab('admin')}
          onTabChange={setActiveTab}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 md:pb-12">
          {activeTab === 'home' && (
            <HomeDashboard
              onTabChange={setActiveTab}
              onOpenGameDetail={(game) => setSelectedGameForModal(game)}
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
              isInstalled={isInstalled}
            />
          )}

          {activeTab === 'gamehub' && (
            <GameHub onOpenGameDetail={(game) => setSelectedGameForModal(game)} />
          )}

          {activeTab === 'customize' && <CustomizeCenter />}

          {activeTab === 'performance' && <PerformanceAssistant />}

          {activeTab === 'settings' && (
            <SettingsView
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
              isInstalled={isInstalled}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard
              isAdminUnlocked={isAdminUnlocked}
              onLockAdmin={handleLockAdmin}
              onUnlockAdmin={handleUnlockAdmin}
            />
          )}
        </main>
      </div>

      {/* Game Details Modal (when opened from Home or shortcuts) */}
      <GameDetailModal
        game={selectedGameForModal}
        onClose={() => setSelectedGameForModal(null)}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* PWA Install Guidance Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isIOS={isIOS}
        isAndroid={isAndroid}
        onTriggerInstall={triggerInstall}
        isInstallable={isInstallable}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <SettingsProvider>
        <BloxMobileContent />
      </SettingsProvider>
    </ToastProvider>
  );
}
