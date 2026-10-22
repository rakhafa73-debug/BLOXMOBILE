import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { RobloxGame } from '../../types';
import { extractPlaceId } from '../../lib/robloxUrl';
import { GameFormSchema } from '../../lib/zodSchemas';
import { useToast } from '../../context/ToastContext';

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGame: (game: RobloxGame) => Promise<void>;
}

export const AddGameModal: React.FC<AddGameModalProps> = ({ isOpen, onClose, onAddGame }) => {
  const { showToast } = useToast();
  const [urlOrId, setUrlOrId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RobloxGame['category']>('Action');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [touchControls, setTouchControls] = useState<number>(4);
  const [performance, setPerformance] = useState<'Smooth' | 'Moderate' | 'Demanding'>('Smooth');
  const [recommendedGraphics, setRecommendedGraphics] = useState('Level 2–3');
  const [tagsInput, setTagsInput] = useState('Mobile, Bookmark');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleUrlChange = (val: string) => {
    setUrlOrId(val);
    setErrorMsg('');
    const id = extractPlaceId(val);
    if (id && !title) {
      setTitle(`Roblox Experience ${id}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const placeId = extractPlaceId(urlOrId);
    if (!placeId) {
      setErrorMsg('Invalid Roblox URL or Place ID. Please enter a valid numeric ID or roblox.com/games link.');
      setIsSubmitting(false);
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const fallbackThumb = thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80';

    const gameData = {
      title: title.trim() || `Roblox Game ${placeId}`,
      placeId,
      description: description.trim() || 'Bookmarked custom Roblox mobile experience.',
      category,
      thumbnailUrl: fallbackThumb,
      mobileRating: {
        touchControls: touchControls as 1 | 2 | 3 | 4 | 5,
        performance,
        recommendedGraphics,
      },
      tags: tags.length ? tags : ['Custom', 'Bookmark'],
      isPublished: true,
      isDemo: false,
    };

    try {
      // Validate with Zod
      GameFormSchema.parse(gameData);

      const fullGame: RobloxGame = {
        ...gameData,
        id: `custom-${placeId}-${Date.now()}`,
        isFavorite: false,
        isCustom: true,
      };

      await onAddGame(fullGame);
      showToast(`Added "${fullGame.title}" to your Game Hub!`, 'success');
      onClose();
      // Reset form
      setUrlOrId('');
      setTitle('');
      setDescription('');
    } catch (err: any) {
      console.error('Validation error:', err);
      const msg = err.errors?.[0]?.message || 'Please check the form fields.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#191523] border border-violet-500/30 rounded-3xl p-6 shadow-2xl shadow-purple-950/60 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-violet-500/15">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Bookmark Game</h3>
              <p className="text-xs text-slate-400">Add any Roblox game by Place ID or web link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Roblox URL or Place ID *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2753915549 or https://www.roblox.com/games/..."
              value={urlOrId}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#120F1C] border border-violet-500/20 text-white text-sm focus:outline-none focus:border-violet-500 placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Game Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. My Favorite Obby"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#120F1C] border border-violet-500/20 text-white text-sm focus:outline-none focus:border-violet-500 placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#120F1C] border border-violet-500/20 text-white text-sm focus:outline-none focus:border-violet-500"
              >
                <option value="Action">Action</option>
                <option value="RPG">RPG</option>
                <option value="Anime">Anime</option>
                <option value="Simulator">Simulator</option>
                <option value="Horror">Horror</option>
                <option value="Social">Social</option>
                <option value="Survival">Survival</option>
                <option value="Racing">Racing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Performance Tier
              </label>
              <select
                value={performance}
                onChange={(e) => setPerformance(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#120F1C] border border-violet-500/20 text-white text-sm focus:outline-none focus:border-violet-500"
              >
                <option value="Smooth">Smooth (Low-end friendly)</option>
                <option value="Moderate">Moderate</option>
                <option value="Demanding">Demanding (Needs flagship)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Short note or description about this experience..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#120F1C] border border-violet-500/20 text-white text-sm focus:outline-none focus:border-violet-500 placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Thumbnail Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#120F1C] border border-violet-500/20 text-white text-sm focus:outline-none focus:border-violet-500 placeholder:text-slate-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-900/40 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
