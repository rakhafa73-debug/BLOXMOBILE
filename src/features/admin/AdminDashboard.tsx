import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Plus, Edit2, Trash2, Check, X, Search, Lock, Unlock, FileText, Database, History, Eye, EyeOff } from 'lucide-react';
import { RobloxGame, AuditLogEntry, UserPreset } from '../../types';
import { db, addAuditLog } from '../../lib/db';
import { extractPlaceId } from '../../lib/robloxUrl';
import { useToast } from '../../context/ToastContext';

interface AdminDashboardProps {
  isAdminUnlocked: boolean;
  onLockAdmin: () => void;
  onUnlockAdmin: (passcode: string) => boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isAdminUnlocked,
  onLockAdmin,
  onUnlockAdmin,
}) => {
  const { showToast } = useToast();
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState<'games' | 'presets' | 'logs'>('games');
  const [games, setGames] = useState<RobloxGame[]>([]);
  const [presets, setPresets] = useState<UserPreset[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Editing game state
  const [editingGame, setEditingGame] = useState<RobloxGame | null>(null);

  // URL test state
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (isAdminUnlocked) {
      loadAdminData();
    }
  }, [isAdminUnlocked]);

  const loadAdminData = async () => {
    try {
      const g = await db.games.toArray();
      const p = await db.presets.toArray();
      const l = await db.auditLogs.reverse().toArray();
      setGames(g);
      setPresets(p);
      setAuditLogs(l);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onUnlockAdmin(passcode);
    if (success) {
      showToast('Admin mode activated', 'success');
      setPasscode('');
    } else {
      showToast('Invalid admin passcode (hint: admin2026)', 'error');
    }
  };

  const togglePublish = async (game: RobloxGame) => {
    const nextStatus = !game.isPublished;
    await db.games.update(game.id, { isPublished: nextStatus });
    await addAuditLog(
      nextStatus ? 'Published Game' : 'Unpublished Game',
      game.title,
      'Admin'
    );
    await loadAdminData();
    showToast(`${nextStatus ? 'Published' : 'Unpublished'} "${game.title}"`, 'info');
  };

  const handleDeleteGame = async (game: RobloxGame) => {
    if (confirm(`Are you sure you want to remove "${game.title}" from catalog?`)) {
      await db.games.delete(game.id);
      await addAuditLog('Deleted Game From Catalog', game.title, 'Admin');
      await loadAdminData();
      showToast(`Deleted "${game.title}"`, 'info');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame) return;

    await db.games.put(editingGame);
    await addAuditLog('Updated Game Metadata', editingGame.title, 'Admin');
    setEditingGame(null);
    await loadAdminData();
    showToast('Game updated successfully', 'success');
  };

  const handleTestUrl = () => {
    const id = extractPlaceId(testUrl);
    if (id) {
      setTestResult(`Valid Roblox Experience ID: ${id}`);
    } else {
      setTestResult('Invalid Roblox URL or Place ID.');
    }
  };

  // If locked, show passcode login screen
  if (!isAdminUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-[#191523] border border-violet-500/25 shadow-2xl text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-purple-950/60 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">Admin Authentication</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access catalog curation, URL validation, and security audit logs.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              required
              placeholder="Enter admin passcode (e.g. admin2026)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#120F1C] border border-violet-500/30 text-white text-center text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-900/30 transition active:scale-95"
          >
            Unlock Admin Console
          </button>
        </form>

        <p className="text-[11px] text-slate-500">
          Default developer passcode: <code className="text-violet-300 font-mono">admin2026</code>
        </p>
      </div>
    );
  }

  const filteredGames = games.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.placeId.includes(searchQuery)
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Admin Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-7 h-7 text-purple-400" />
              <span>Admin Management Portal</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono">
              SECURE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage catalog games, audit security events, and inspect Roblox URL routing.
          </p>
        </div>

        <button
          onClick={onLockAdmin}
          className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock Admin Session</span>
        </button>
      </div>

      {/* Admin stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-[#191523] border border-violet-500/15 space-y-1">
          <span className="text-slate-400">Total Games</span>
          <p className="text-2xl font-black text-white font-mono">{games.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#191523] border border-violet-500/15 space-y-1">
          <span className="text-slate-400">Published Games</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {games.filter((g) => g.isPublished !== false).length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[#191523] border border-violet-500/15 space-y-1">
          <span className="text-slate-400">Custom Bookmarks</span>
          <p className="text-2xl font-black text-purple-400 font-mono">
            {games.filter((g) => g.isCustom).length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[#191523] border border-violet-500/15 space-y-1">
          <span className="text-slate-400">Audit Events</span>
          <p className="text-2xl font-black text-blue-400 font-mono">{auditLogs.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-violet-500/15 pb-2">
        <button
          onClick={() => setActiveTab('games')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'games'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Game Catalog ({games.length})
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'presets'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Presets ({presets.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'logs'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Game Catalog Management */}
      {activeTab === 'games' && (
        <div className="space-y-4">
          {/* URL Validator Tool */}
          <div className="p-4 rounded-2xl bg-[#14101E] border border-violet-500/20 space-y-2">
            <span className="text-xs font-bold text-violet-300">Roblox URL Schema Validator</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Test URL or placeId (e.g. https://www.roblox.com/games/2753915549/Blox-Fruits)"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#191523] border border-violet-500/20 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleTestUrl}
                className="px-3 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-semibold"
              >
                Validate
              </button>
            </div>
            {testResult && (
              <p className="text-[11px] font-mono text-emerald-400">{testResult}</p>
            )}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search catalog games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#191523] border border-violet-500/20 text-white text-xs focus:outline-none"
            />
          </div>

          {/* Catalog Table */}
          <div className="rounded-2xl bg-[#191523] border border-violet-500/15 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#120F1C] text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-white/5">
                <tr>
                  <th className="p-3.5">Game</th>
                  <th className="p-3.5">Place ID</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredGames.map((game) => (
                  <tr key={game.id} className="hover:bg-white/5 transition">
                    <td className="p-3.5 flex items-center gap-2.5">
                      <img
                        src={game.thumbnailUrl}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold text-white truncate max-w-xs">{game.title}</p>
                        <p className="text-[10px] text-slate-500">{game.tags.join(', ')}</p>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{game.placeId}</td>
                    <td className="p-3.5">{game.category}</td>
                    <td className="p-3.5">
                      <button
                        onClick={() => togglePublish(game)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
                          game.isPublished !== false
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {game.isPublished !== false ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => setEditingGame(game)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition"
                        title="Edit Game"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game)}
                        className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition"
                        title="Delete Game"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Game Modal */}
      {editingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#191523] border border-violet-500/30 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Edit Game: {editingGame.title}</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Title</label>
                <input
                  type="text"
                  value={editingGame.title}
                  onChange={(e) => setEditingGame({ ...editingGame, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#120F1C] border border-violet-500/20 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-slate-400">Place ID</label>
                <input
                  type="text"
                  value={editingGame.placeId}
                  onChange={(e) => setEditingGame({ ...editingGame, placeId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#120F1C] border border-violet-500/20 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-slate-400">Description</label>
                <textarea
                  rows={2}
                  value={editingGame.description}
                  onChange={(e) => setEditingGame({ ...editingGame, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#120F1C] border border-violet-500/20 text-white mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingGame(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-violet-600 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Presets */}
      {activeTab === 'presets' && (
        <div className="space-y-3">
          <div className="rounded-2xl bg-[#191523] border border-violet-500/15 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#120F1C] text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-white/5">
                <tr>
                  <th className="p-3.5">Preset Name</th>
                  <th className="p-3.5">Theme</th>
                  <th className="p-3.5">Accent</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {presets.map((preset) => (
                  <tr key={preset.id}>
                    <td className="p-3.5 font-bold text-white">{preset.name}</td>
                    <td className="p-3.5 font-mono">{preset.theme}</td>
                    <td className="p-3.5 font-mono">{preset.accent}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/20 text-violet-300">
                        {preset.isDefault ? 'Official' : 'Custom'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-3">
          <div className="rounded-2xl bg-[#191523] border border-violet-500/15 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#120F1C] text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-white/5">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditLogs.slice(0, 30).map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition">
                    <td className="p-3.5 font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-bold text-violet-300">{log.actor}</td>
                    <td className="p-3.5 text-white">{log.action}</td>
                    <td className="p-3.5 text-slate-400 font-mono truncate max-w-xs">{log.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
