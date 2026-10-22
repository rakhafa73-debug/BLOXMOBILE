import React, { useState, useRef } from 'react';
import { Palette, Sparkles, Download, Upload, RotateCcw, Trash2, Check, Plus, AlertCircle, ShieldAlert } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { ThemeMode, AccentColor, BackgroundPattern, AnimationIntensity, UserPreset } from '../../types';
import { useToast } from '../../context/ToastContext';

export const CustomizeCenter: React.FC = () => {
  const {
    theme,
    accent,
    bgPattern,
    animationIntensity,
    presets,
    activePresetId,
    setTheme,
    setAccent,
    setBgPattern,
    setAnimationIntensity,
    applyPreset,
    saveNewPreset,
    deletePreset,
    resetToDefaults,
    exportPresetAsJson,
    importPresetFromJson,
    accentColorHex,
  } = useSettings();

  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);

  const themeOptions: { id: ThemeMode; label: string; desc: string }[] = [
    { id: 'dark', label: 'Classic Blox Dark', desc: '#0D0B14 — Deep purple gaming contrast' },
    { id: 'amoled', label: 'True AMOLED', desc: '#000000 — Zero pixel power for OLED screens' },
    { id: 'neon', label: 'Cyber Neon', desc: '#08060F — Ambient cyberpunk glow aesthetics' },
  ];

  const accentOptions: { id: AccentColor; label: string; bg: string }[] = [
    { id: 'violet', label: 'Violet', bg: 'bg-[#8B5CF6]' },
    { id: 'emerald', label: 'Emerald', bg: 'bg-[#10B981]' },
    { id: 'rose', label: 'Rose', bg: 'bg-[#F43F5E]' },
    { id: 'amber', label: 'Amber', bg: 'bg-[#F59E0B]' },
    { id: 'cyan', label: 'Cyan', bg: 'bg-[#06B6D4]' },
    { id: 'blue', label: 'Electric Blue', bg: 'bg-[#3B82F6]' },
  ];

  const bgPatterns: { id: BackgroundPattern; label: string; desc: string }[] = [
    { id: 'mesh', label: 'Mesh Glow', desc: 'Soft ambient pulsing gradient' },
    { id: 'grid', label: 'Cyber Grid', desc: 'Discrete tactical coordinates grid' },
    { id: 'dots', label: 'Starfield Dots', desc: 'Minimalist dotted canvas' },
    { id: 'plain', label: 'Pure Minimal', desc: 'No background textures for maximum performance' },
  ];

  const animationOptions: { id: AnimationIntensity; label: string; desc: string }[] = [
    { id: 'full', label: 'Full Smooth', desc: 'Responsive spring animations' },
    { id: 'subtle', label: 'Subtle / Eco', desc: 'Minimal fades, saves mobile battery' },
    { id: 'off', label: 'Instant (Off)', desc: 'Zero motion, instant UI rendering' },
  ];

  const handleCreatePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    try {
      const created = await saveNewPreset(newPresetName);
      setNewPresetName('');
      setIsCreatingPreset(false);
      showToast(`Preset "${created.name}" created and applied!`, 'success');
    } catch (err) {
      showToast('Could not create preset', 'error');
    }
  };

  const handleDownloadPreset = (preset: UserPreset) => {
    const jsonStr = exportPresetAsJson(preset);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bloxmobile-preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported "${preset.name}" preset JSON`, 'success');
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50000) {
      showToast('Preset file exceeds 50KB size limit', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = await importPresetFromJson(content);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Palette className="w-7 h-7 text-violet-400" />
            <span>Customize Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personalize your BloxMobile companion app UI theme, accent colors, and performance profiles.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-[#191523] border border-violet-500/20 hover:border-violet-500/40 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Preset</span>
          </button>

          <button
            onClick={resetToDefaults}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Honest Boundary Notice */}
      <div className="p-4 rounded-2xl bg-[#14101E] border border-violet-500/20 flex items-start gap-3 text-xs text-slate-300">
        <ShieldAlert className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-slate-400">
          <strong>Important notice:</strong> Customizations apply exclusively to the BloxMobile companion PWA interface.
          Mobile operating systems (iOS and Android sandboxing) do not allow web browsers to modify external closed-source Roblox app binaries or textures.
        </p>
      </div>

      {/* Live Interactive Preview Card */}
      <div className="rounded-3xl bg-[#191523] border border-violet-500/20 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Live Companion UI Preview</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Theme: {theme} • Accent: {accent}
          </span>
        </div>

        {/* Mock card matching active styles */}
        <div
          className="rounded-2xl p-4 sm:p-5 border transition-all space-y-3"
          style={{
            backgroundColor: theme === 'amoled' ? '#000000' : theme === 'neon' ? '#08060F' : '#14101F',
            borderColor: accentColorHex + '50',
            boxShadow: `0 8px 30px ${accentColorHex}20`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                style={{ backgroundColor: accentColorHex }}
              >
                BM
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">BloxMobile Preview Element</h3>
                <p className="text-[11px] text-slate-400">Pattern: {bgPattern} • Motion: {animationIntensity}</p>
              </div>
            </div>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-bold text-white shadow-sm"
              style={{ backgroundColor: accentColorHex }}
            >
              Active
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
            <button
              className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md transition"
              style={{ backgroundColor: accentColorHex }}
            >
              Accent Button
            </button>
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold">
              Secondary Button
            </button>
            <div className="px-3 py-1.5 rounded-lg bg-black/40 text-[11px] text-slate-300 font-mono">
              #Hex: {accentColorHex}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">1. Select Visual Theme</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`p-4 rounded-2xl text-left border transition relative ${
                theme === opt.id
                  ? 'bg-violet-600/15 border-violet-500 shadow-md shadow-violet-900/30'
                  : 'bg-[#191523] border-violet-500/10 hover:border-violet-500/30 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{opt.label}</span>
                {theme === opt.id && <Check className="w-4 h-4 text-violet-400" />}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Colors */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">2. Accent Color</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {accentOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setAccent(opt.id)}
              className={`p-3 rounded-2xl text-left border transition flex items-center gap-3 ${
                accent === opt.id
                  ? 'bg-white/10 border-white/40 shadow-sm'
                  : 'bg-[#191523] border-violet-500/10 hover:bg-[#201A2E]'
              }`}
            >
              <span className={`w-6 h-6 rounded-full shrink-0 ${opt.bg} shadow-md`} />
              <span className="text-xs font-semibold text-white truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Background Pattern */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">3. Ambient Background Pattern</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {bgPatterns.map((pat) => (
            <button
              key={pat.id}
              onClick={() => setBgPattern(pat.id)}
              className={`p-3.5 rounded-2xl text-left border transition ${
                bgPattern === pat.id
                  ? 'bg-violet-600/15 border-violet-500 text-white font-semibold'
                  : 'bg-[#191523] border-violet-500/10 hover:border-violet-500/30 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{pat.label}</span>
                {bgPattern === pat.id && <Check className="w-3.5 h-3.5 text-violet-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{pat.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Animation Intensity */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">4. Animation Intensity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {animationOptions.map((anim) => (
            <button
              key={anim.id}
              onClick={() => setAnimationIntensity(anim.id)}
              className={`p-3.5 rounded-2xl text-left border transition ${
                animationIntensity === anim.id
                  ? 'bg-violet-600/15 border-violet-500 text-white font-semibold'
                  : 'bg-[#191523] border-violet-500/10 hover:border-violet-500/30 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{anim.label}</span>
                {animationIntensity === anim.id && <Check className="w-3.5 h-3.5 text-violet-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{anim.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Presets Management Section */}
      <div className="space-y-4 pt-4 border-t border-violet-500/15">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Saved Companion Presets</h2>
            <p className="text-xs text-slate-400">Save your favorite style combinations or export as JSON</p>
          </div>

          {!isCreatingPreset && (
            <button
              onClick={() => setIsCreatingPreset(true)}
              className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save As New Preset</span>
            </button>
          )}
        </div>

        {/* New preset form */}
        {isCreatingPreset && (
          <form onSubmit={handleCreatePreset} className="p-4 rounded-2xl bg-[#14101E] border border-violet-500/25 flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              required
              placeholder="Preset Name (e.g. AMOLED Midnight)"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="w-full sm:flex-1 px-3.5 py-2 rounded-xl bg-[#191523] border border-violet-500/20 text-white text-xs focus:outline-none focus:border-violet-500"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsCreatingPreset(false)}
                className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-md"
              >
                Save Current Style
              </button>
            </div>
          </form>
        )}

        {/* Presets list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presets.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <div
                key={preset.id}
                className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-violet-600/10 border-violet-500/50'
                    : 'bg-[#191523] border-violet-500/15 hover:border-violet-500/30'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">{preset.name}</h3>
                    {preset.isDefault && (
                      <span className="text-[10px] text-violet-300 bg-violet-500/20 px-1.5 py-0.2 rounded font-mono">
                        Official
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Theme: {preset.theme} • Accent: {preset.accent} • Anim: {preset.animationIntensity}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => applyPreset(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-violet-600 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    {isSelected ? 'Applied' : 'Apply'}
                  </button>

                  <button
                    onClick={() => handleDownloadPreset(preset)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
                    title="Export JSON"
                    aria-label="Export JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {!preset.isDefault && (
                    <button
                      onClick={() => deletePreset(preset.id)}
                      className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition"
                      title="Delete Preset"
                      aria-label="Delete Preset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
