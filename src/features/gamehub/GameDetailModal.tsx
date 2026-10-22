import React from 'react';
import { X, Play, ExternalLink, Heart, Copy, Star, ShieldCheck, Smartphone, Check } from 'lucide-react';
import { RobloxGame } from '../../types';
import { launchRoblox, getRobloxWebUrl } from '../../lib/robloxUrl';
import { useToast } from '../../context/ToastContext';

interface GameDetailModalProps {
  game: RobloxGame | null;
  onClose: () => void;
  onToggleFavorite: (gameId: string) => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  onClose,
  onToggleFavorite,
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = React.useState(false);

  if (!game) return null;

  const handleCopyPlaceId = () => {
    navigator.clipboard.writeText(game.placeId);
    setCopied(true);
    showToast(`Copied Place ID: ${game.placeId}`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunch = () => {
    launchRoblox(game.placeId);
    showToast(`Launching ${game.title}...`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#191523] border border-violet-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/60 max-h-[90vh] flex flex-col">
        {/* Header image banner */}
        <div className="relative h-48 sm:h-56 w-full bg-[#120F1C] shrink-0">
          <img
            src={game.thumbnailUrl}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#191523] via-[#191523]/40 to-transparent" />

          {/* Close & Favorite button */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(game.id)}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition active:scale-90"
              aria-label="Toggle Favorite"
            >
              <Heart
                className={`w-5 h-5 transition ${
                  game.isFavorite ? 'text-rose-500 fill-rose-500' : 'text-white'
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition hover:scale-105"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Badges */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-violet-600/80 backdrop-blur-md text-white text-xs font-bold">
                {game.category}
              </span>
              {game.isDemo && (
                <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-slate-200 text-[10px] font-medium">
                  Community Curated
                </span>
              )}
            </div>
            {game.activePlayersEstimate && (
              <span className="text-[11px] text-slate-300 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full">
                {game.activePlayersEstimate}
              </span>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{game.title}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs font-mono text-slate-400">Place ID: {game.placeId}</span>
              <button
                onClick={handleCopyPlaceId}
                className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1 transition"
                title="Copy ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{game.description}</p>

          {/* Mobile Ratings Card */}
          <div className="p-4 rounded-2xl bg-[#120F1C] border border-violet-500/15 space-y-3">
            <h3 className="text-xs font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>Mobile Readiness Assessment</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400">Touch Controls</span>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < game.mobileRating.touchControls ? 'fill-amber-400' : 'text-slate-600'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-slate-300 text-[11px]">
                    {game.mobileRating.touchControls}/5
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Performance Tier</span>
                <p className="font-bold text-white">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                      game.mobileRating.performance === 'Smooth'
                        ? 'bg-emerald-400'
                        : game.mobileRating.performance === 'Moderate'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                  />
                  {game.mobileRating.performance}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 text-xs">
              <span className="text-slate-400">Recommended In-Game Graphics:</span>
              <p className="font-medium text-slate-200 mt-0.5">
                {game.mobileRating.recommendedGraphics}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {game.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Validation & Security statement */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Target verified to official Roblox deep link and domain.</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#14101E] border-t border-violet-500/15 flex items-center justify-between gap-3 shrink-0">
          <a
            href={getRobloxWebUrl(game.placeId)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Roblox Web</span>
          </a>

          <button
            onClick={handleLaunch}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-900/40 active:scale-95 transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Game in Roblox</span>
          </button>
        </div>
      </div>
    </div>
  );
};
