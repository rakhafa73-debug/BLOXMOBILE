import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Heart, Gauge, Palette, ArrowRight, ShieldCheck, Wifi, ExternalLink, RefreshCw, Smartphone } from 'lucide-react';
import { RobloxGame, ActiveTab } from '../../types';
import { db } from '../../lib/db';
import { launchRoblox, getRobloxWebUrl } from '../../lib/robloxUrl';
import { measureNetworkLatency, PingResult } from '../../lib/diagnostics';
import { useToast } from '../../context/ToastContext';

interface HomeDashboardProps {
  onTabChange: (tab: ActiveTab) => void;
  onOpenGameDetail: (game: RobloxGame) => void;
  onOpenInstallModal: () => void;
  isInstalled: boolean;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onTabChange,
  onOpenGameDetail,
  onOpenInstallModal,
  isInstalled,
}) => {
  const { showToast } = useToast();
  const [favoriteGames, setFavoriteGames] = useState<RobloxGame[]>([]);
  const [pingResult, setPingResult] = useState<PingResult | null>(null);
  const [isTestingPing, setIsTestingPing] = useState(false);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const games = await db.games.toArray();
        const favs = games.filter((g) => g.isFavorite);
        setFavoriteGames(favs);
      } catch (err) {
        console.warn('Error reading favorites:', err);
      }
    }
    loadFavorites();
    runPing();
  }, []);

  const runPing = async () => {
    setIsTestingPing(true);
    try {
      const res = await measureNetworkLatency();
      setPingResult(res);
    } finally {
      setIsTestingPing(false);
    }
  };

  const handleLaunch = (game?: RobloxGame) => {
    const res = launchRoblox(game?.placeId);
    showToast(game ? `Launching ${game.title}...` : 'Launching Roblox mobile...', 'info');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Hero Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#1E1833] via-[#161226] to-[#0E0B18] border border-violet-500/25 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow backdrop circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-indigo-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Bloxstrap-Inspired Mobile Companion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Level Up Your <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">Roblox Mobile</span> Experience
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Curated mobile game hub, realistic graphics optimization guides, connection latency testing, and companion customization.
            </p>
          </div>

          {/* Action launcher buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={() => handleLaunch()}
              className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-2.5 shadow-xl shadow-violet-900/40 active:scale-95 transition"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Launch Roblox App</span>
            </button>
            <a
              href="https://www.roblox.com/home"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-violet-500/20 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>Open Roblox Web Fallback</span>
            </a>
          </div>
        </div>

        {/* Quick status bar inside hero */}
        <div className="mt-6 pt-5 border-t border-violet-500/15 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Latency:</span>
              <strong className="text-white font-mono">
                {pingResult ? `${pingResult.latencyMs} ms` : 'Measuring...'}
              </strong>
              {pingResult && (
                <span className="text-[10px] text-slate-400">
                  (Jitter: {pingResult.jitterMs}ms)
                </span>
              )}
            </div>
            <button
              onClick={runPing}
              disabled={isTestingPing}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
              title="Refresh ping"
              aria-label="Refresh ping"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingPing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {!isInstalled && (
            <button
              onClick={onOpenInstallModal}
              className="text-violet-300 hover:text-white flex items-center gap-1.5 font-medium transition"
            >
              <Smartphone className="w-4 h-4" />
              <span>Install PWA for 1-Tap Home Screen Access</span>
            </button>
          )}
        </div>
      </div>

      {/* Honest Capability Disclaimer (Transparency section) */}
      <div className="rounded-2xl bg-[#14101E] border border-violet-500/15 p-4 sm:p-5 flex items-start gap-3.5 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">Safe & Transparent Companion Notice</p>
          <p className="leading-relaxed text-slate-400">
            Bloxstrap Windows is a desktop launcher. BloxMobile is a safe web companion for mobile gamers.
            We <strong>never</strong> modify internal Roblox files, force fake FPS, inject scripts, or ask for your password.
            All bookmarks and settings remain safe on your device.
          </p>
        </div>
      </div>

      {/* Quick Access Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onTabChange('gamehub')}
          className="p-4 rounded-2xl bg-[#191523] border border-violet-500/15 hover:border-violet-500/40 hover:bg-[#201A2E] text-left transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Play className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-white">Game Hub</h2>
          <p className="text-[11px] text-slate-400 mt-1">Browse mobile-rated experiences</p>
        </button>

        <button
          onClick={() => onTabChange('customize')}
          className="p-4 rounded-2xl bg-[#191523] border border-violet-500/15 hover:border-violet-500/40 hover:bg-[#201A2E] text-left transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Palette className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-white">Customize</h2>
          <p className="text-[11px] text-slate-400 mt-1">Themes, OLED & Presets</p>
        </button>

        <button
          onClick={() => onTabChange('performance')}
          className="p-4 rounded-2xl bg-[#191523] border border-violet-500/15 hover:border-violet-500/40 hover:bg-[#201A2E] text-left transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Gauge className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-white">Performance</h2>
          <p className="text-[11px] text-slate-400 mt-1">Roblox settings & diagnostics</p>
        </button>

        <button
          onClick={onOpenInstallModal}
          className="p-4 rounded-2xl bg-[#191523] border border-violet-500/15 hover:border-violet-500/40 hover:bg-[#201A2E] text-left transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Smartphone className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-white">PWA App</h2>
          <p className="text-[11px] text-slate-400 mt-1">{isInstalled ? 'Installed on device' : 'Install instructions'}</p>
        </button>
      </div>

      {/* Favorite Games Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="text-lg font-bold text-white">Favorite Games</h2>
            <span className="text-xs bg-rose-500/15 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
              {favoriteGames.length}
            </span>
          </div>
          <button
            onClick={() => onTabChange('gamehub')}
            className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {favoriteGames.length === 0 ? (
          <div className="rounded-2xl bg-[#191523] border border-dashed border-violet-500/20 p-8 text-center space-y-2">
            <p className="text-sm text-slate-300">No favorite games bookmarked yet</p>
            <p className="text-xs text-slate-500">Tap the heart icon on any game card in Game Hub to pin it here.</p>
            <button
              onClick={() => onTabChange('gamehub')}
              className="mt-3 px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-xs font-semibold hover:bg-violet-600/30 transition"
            >
              Explore Games
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {favoriteGames.map((game) => (
              <div
                key={game.id}
                className="group rounded-2xl bg-[#191523] border border-violet-500/15 hover:border-violet-500/40 p-3.5 transition flex flex-col justify-between shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={game.thumbnailUrl}
                    alt={game.title}
                    className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-violet-300 px-1.5 py-0.2 rounded bg-violet-500/15">
                        {game.category}
                      </span>
                      {game.isDemo && (
                        <span className="text-[9px] text-slate-400 bg-white/5 px-1 py-0.2 rounded">
                          Demo
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white truncate mt-1 group-hover:text-violet-300 transition">
                      {game.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {game.mobileRating.performance} on mobile
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-violet-500/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenGameDetail(game)}
                    className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/5 transition"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleLaunch(game)}
                    className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-violet-900/30 transition active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
