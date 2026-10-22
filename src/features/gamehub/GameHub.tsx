import React, { useState, useEffect, useMemo } from 'react';
import { Search, Heart, Play, Plus, Filter, Sparkles, AlertCircle, X, ExternalLink } from 'lucide-react';
import { RobloxGame } from '../../types';
import { db, addAuditLog } from '../../lib/db';
import { launchRoblox } from '../../lib/robloxUrl';
import { GameDetailModal } from './GameDetailModal';
import { AddGameModal } from './AddGameModal';
import { useToast } from '../../context/ToastContext';

interface GameHubProps {
  onOpenGameDetail?: (game: RobloxGame) => void;
}

export const GameHub: React.FC<GameHubProps> = () => {
  const { showToast } = useToast();
  const [games, setGames] = useState<RobloxGame[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPerformance, setSelectedPerformance] = useState<string>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [activeGameModal, setActiveGameModal] = useState<RobloxGame | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['All', 'Action', 'RPG', 'Anime', 'Simulator', 'Horror', 'Social', 'Survival'];

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setIsLoading(true);
    try {
      const all = await db.games.toArray();
      // only show published games in public hub
      const published = all.filter((g) => g.isPublished !== false);
      setGames(published);
    } catch (err) {
      console.error('Failed to load games:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (gameId: string) => {
    const target = games.find((g) => g.id === gameId);
    if (!target) return;

    const nextState = !target.isFavorite;
    await db.games.update(gameId, { isFavorite: nextState });
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, isFavorite: nextState } : g))
    );
    if (activeGameModal?.id === gameId) {
      setActiveGameModal((prev) => (prev ? { ...prev, isFavorite: nextState } : null));
    }
    showToast(
      nextState ? `Saved "${target.title}" to favorites` : `Removed "${target.title}" from favorites`,
      'info'
    );
  };

  const handleAddGame = async (newGame: RobloxGame) => {
    await db.games.add(newGame);
    await addAuditLog('Bookmarked Game', newGame.title);
    await loadGames();
  };

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      if (showFavoritesOnly && !game.isFavorite) return false;
      if (selectedCategory !== 'All' && game.category !== selectedCategory) return false;
      if (selectedPerformance !== 'All' && game.mobileRating.performance !== selectedPerformance) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchTitle = game.title.toLowerCase().includes(q);
      const matchId = game.placeId.includes(q);
      const matchCategory = game.category.toLowerCase().includes(q);
      const matchTags = game.tags.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchId || matchCategory || matchTags;
    });
  }, [games, searchQuery, selectedCategory, selectedPerformance, showFavoritesOnly]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedPerformance('All');
    setShowFavoritesOnly(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Roblox Mobile Game Hub</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {games.length} Experiences
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Curated experiences tested for touch controls and mobile thermal performance.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-900/30 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Bookmark Any Game</span>
        </button>
      </div>

      {/* Search Input & Favorite Quick Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, Place ID, tag (e.g. Doors, Anime, 2753915549)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#191523] border border-violet-500/20 text-white text-sm focus:outline-none focus:border-violet-500 placeholder:text-slate-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Favorite toggle pill */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 border transition shrink-0 ${
            showFavoritesOnly
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
              : 'bg-[#191523] border-violet-500/20 text-slate-300 hover:text-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-400 text-rose-400' : ''}`} />
          <span>Favorites Only</span>
        </button>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
              selectedCategory === cat
                ? 'bg-violet-600 text-white border-violet-500 shadow-sm shadow-violet-900/50'
                : 'bg-[#191523] text-slate-400 border-violet-500/10 hover:text-slate-200 hover:bg-[#201A2E]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notice Banner */}
      <div className="rounded-2xl bg-[#14101E] border border-violet-500/15 p-3 sm:p-4 flex items-center justify-between gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
          <span>
            External links open via official <code>roblox://</code> URL scheme or official website.
          </span>
        </span>
        <span className="text-[10px] text-slate-500 hidden sm:inline">
          Showing {filteredGames.length} of {games.length}
        </span>
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className="rounded-3xl bg-[#191523] border border-dashed border-violet-500/25 p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-violet-400/60 mx-auto" />
          <h2 className="text-base font-bold text-white">No experiences found</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords, clear category filters, or bookmark this experience with its Place ID.
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 px-4 py-2 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs font-semibold hover:bg-violet-600/30 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="group rounded-3xl bg-[#191523] border border-violet-500/15 hover:border-violet-500/40 transition-all flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-purple-950/20"
            >
              {/* Card Image banner */}
              <div
                className="relative h-44 w-full cursor-pointer overflow-hidden bg-[#120F1C]"
                onClick={() => setActiveGameModal(game)}
              >
                <img
                  src={game.thumbnailUrl}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#191523] via-transparent to-transparent" />

                {/* Favorite button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(game.id);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition active:scale-90"
                  aria-label="Toggle Favorite"
                >
                  <Heart
                    className={`w-4 h-4 transition ${
                      game.isFavorite ? 'text-rose-500 fill-rose-500' : 'text-slate-300'
                    }`}
                  />
                </button>

                {/* Category & Demo tag */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600/90 text-white backdrop-blur-md">
                    {game.category}
                  </span>
                  {game.isDemo && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/60 text-slate-300 backdrop-blur-md">
                      Demo
                    </span>
                  )}
                  {game.isCustom && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                      Custom
                    </span>
                  )}
                </div>

                {/* Bottom title inside thumbnail */}
                <div className="absolute bottom-2 left-3 right-3">
                  <h2 className="text-base font-bold text-white truncate drop-shadow-md">
                    {game.title}
                  </h2>
                </div>
              </div>

              {/* Card Info Details */}
              <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {game.description}
                </p>

                {/* Mobile Performance & Place ID row */}
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-violet-500/10">
                  <span className="flex items-center gap-1 text-slate-400">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        game.mobileRating.performance === 'Smooth'
                          ? 'bg-emerald-400'
                          : game.mobileRating.performance === 'Moderate'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                    <span>{game.mobileRating.performance}</span>
                  </span>

                  <span className="font-mono text-slate-500 text-[10px]">
                    ID: {game.placeId}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveGameModal(game)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold text-center transition"
                  >
                    Details & Tips
                  </button>

                  <button
                    onClick={() => {
                      launchRoblox(game.placeId);
                      showToast(`Launching ${game.title}...`, 'info');
                    }}
                    className="py-2 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-violet-900/30 transition active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Game Detail Modal */}
      <GameDetailModal
        game={activeGameModal}
        onClose={() => setActiveGameModal(null)}
        onToggleFavorite={toggleFavorite}
      />

      {/* Add Custom Game Bookmark Modal */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGame={handleAddGame}
      />
    </div>
  );
};
