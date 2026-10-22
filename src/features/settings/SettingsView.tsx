import React, { useState, useEffect, useRef } from 'react';
import { Settings, Download, Upload, Trash2, Smartphone, Shield, Database, Info, AlertTriangle, Check, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { db, addAuditLog } from '../../lib/db';
import { useToast } from '../../context/ToastContext';

interface SettingsViewProps {
  onOpenInstallModal: () => void;
  isInstalled: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenInstallModal, isInstalled }) => {
  const { exportFullBackup, importFullBackup, resetToDefaults } = useSettings();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dbStats, setDbStats] = useState({
    presetCount: 0,
    gameCount: 0,
    favoriteCount: 0,
    logCount: 0,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadDbStats();
  }, []);

  const loadDbStats = async () => {
    try {
      const presets = await db.presets.count();
      const games = await db.games.toArray();
      const favorites = games.filter((g) => g.isFavorite).length;
      const logs = await db.auditLogs.count();

      setDbStats({
        presetCount: presets,
        gameCount: games.length,
        favoriteCount: favorites,
        logCount: logs,
      });
    } catch (err) {
      console.warn('Error reading DB stats:', err);
    }
  };

  const handleExportBackup = async () => {
    try {
      const jsonStr = await exportFullBackup();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bloxmobile-full-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Exported full application backup JSON', 'success');
    } catch {
      showToast('Export backup failed', 'error');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000) {
      showToast('Backup file exceeds 500KB limit', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = await importFullBackup(content);
      if (res.success) {
        showToast(res.message, 'success');
        await loadDbStats();
      } else {
        showToast(res.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePurgeAllData = async () => {
    setIsResetting(true);
    try {
      await db.presets.clear();
      await db.games.clear();
      await db.settings.clear();
      await db.auditLogs.clear();
      await resetToDefaults();
      await loadDbStats();
      setShowDeleteConfirm(false);
      showToast('All local application data reset to initial state', 'success');
    } catch (err) {
      console.error('Purge failed:', err);
      showToast('Failed to purge data', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-violet-400" />
          <span>Settings & Data Management</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Local database management, JSON backup/restore, privacy disclosures, and PWA setup.
        </p>
      </div>

      {/* Local Storage & DB Status */}
      <div className="rounded-3xl bg-[#191523] border border-violet-500/20 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-bold text-white">IndexedDB Local Storage</h2>
          </div>
          <button
            onClick={loadDbStats}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
            title="Refresh database statistics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          BloxMobile stores all your preferences, game bookmarks, and presets locally in your browser's encrypted IndexedDB storage.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#120F1C] border border-white/5 space-y-1">
            <span className="text-slate-400">Saved Presets</span>
            <p className="text-xl font-black text-white font-mono">{dbStats.presetCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#120F1C] border border-white/5 space-y-1">
            <span className="text-slate-400">Total Games</span>
            <p className="text-xl font-black text-white font-mono">{dbStats.gameCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#120F1C] border border-white/5 space-y-1">
            <span className="text-slate-400">Favorited Games</span>
            <p className="text-xl font-black text-white font-mono">{dbStats.favoriteCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#120F1C] border border-white/5 space-y-1">
            <span className="text-slate-400">Audit Logs</span>
            <p className="text-xl font-black text-white font-mono">{dbStats.logCount}</p>
          </div>
        </div>
      </div>

      {/* Backup and Restore Section */}
      <div className="rounded-3xl bg-[#191523] border border-violet-500/20 p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white">Full Backup & Migration</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Export a full JSON snapshot of your companion presets and bookmarked games.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-900/30 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Full Backup (JSON)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportBackup}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#120F1C] border border-violet-500/25 hover:border-violet-500/50 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Upload className="w-4 h-4" />
            <span>Restore From Backup</span>
          </button>
        </div>
      </div>

      {/* PWA Home Screen Installation Guide */}
      <div className="rounded-3xl bg-[#191523] border border-violet-500/20 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Progressive Web App (PWA)</h2>
          </div>
          {isInstalled && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Standalone Mode Active</span>
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300">
          Install BloxMobile as a standalone mobile application on iOS or Android. No app store downloads or APK installations required.
        </p>

        <button
          onClick={onOpenInstallModal}
          className="px-4 py-2.5 rounded-2xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-xs font-semibold flex items-center gap-2 transition"
        >
          <Smartphone className="w-4 h-4" />
          <span>View Platform Installation Instructions</span>
        </button>
      </div>

      {/* Privacy & Security Policy */}
      <div className="rounded-3xl bg-[#191523] border border-violet-500/20 p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-white font-bold">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>Privacy & Security Pledge</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          BloxMobile is built with strict privacy-by-design standards:
        </p>
        <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
          <li>Zero tracking cookies, analytics trackers, or advertising SDKs.</li>
          <li>Never prompts for or stores Roblox passwords, session tokens, or .ROBLOSECURITY cookies.</li>
          <li>100% client-side storage via IndexedDB; nothing leaves your phone.</li>
          <li>Independent fan project inspired by Bloxstrap; not affiliated with Roblox Corporation.</li>
        </ul>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="rounded-3xl bg-[#221316] border border-rose-500/30 p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-rose-300 font-bold">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <span>Danger Zone: Reset Local Data</span>
        </div>
        <p className="text-xs text-rose-200/80">
          Permanently clear all custom bookmarked games, custom presets, and diagnostic logs from your device.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 text-xs font-bold transition flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset All Local Data</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-black/50 border border-rose-500/40 space-y-3">
            <p className="text-xs font-bold text-white">Are you sure? This cannot be undone.</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg text-slate-300 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeAllData}
                disabled={isResetting}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md"
              >
                {isResetting ? 'Resetting...' : 'Yes, Permanently Reset Data'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* App Version & Credits */}
      <div className="text-center text-xs text-slate-500 pt-4 space-y-1">
        <p className="font-mono text-slate-400">BloxMobile v1.2.0 (Mobile Companion PWA)</p>
        <p>Built with React 19, TypeScript, Tailwind CSS, Dexie IndexedDB & Service Worker.</p>
      </div>
    </div>
  );
};
