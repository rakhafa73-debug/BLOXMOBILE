import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ThemeMode, AccentColor, BackgroundPattern, AnimationIntensity, UserPreset } from '../types';
import { db, addAuditLog, AppSettingsRecord } from '../lib/db';
import { PresetSchema, FullBackupSchema } from '../lib/zodSchemas';
import { INITIAL_PRESETS } from '../data/initialPresets';

interface SettingsContextType {
  theme: ThemeMode;
  accent: AccentColor;
  bgPattern: BackgroundPattern;
  animationIntensity: AnimationIntensity;
  presets: UserPreset[];
  activePresetId: string | null;
  setTheme: (theme: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  setBgPattern: (pattern: BackgroundPattern) => void;
  setAnimationIntensity: (intensity: AnimationIntensity) => void;
  applyPreset: (preset: UserPreset) => Promise<void>;
  saveNewPreset: (name: string) => Promise<UserPreset>;
  deletePreset: (id: string) => Promise<boolean>;
  resetToDefaults: () => Promise<void>;
  exportPresetAsJson: (preset: UserPreset) => string;
  importPresetFromJson: (jsonString: string) => Promise<{ success: boolean; message: string; preset?: UserPreset }>;
  exportFullBackup: () => Promise<string>;
  importFullBackup: (jsonString: string) => Promise<{ success: boolean; message: string }>;
  accentColorHex: string;
  accentRgb: string;
}

const ACCENT_COLORS: Record<AccentColor, { hex: string; rgb: string; hover: string; light: string }> = {
  violet: { hex: '#8B5CF6', rgb: '139, 92, 246', hover: '#7C3AED', light: '#C4B5FD' },
  emerald: { hex: '#10B981', rgb: '16, 185, 129', hover: '#059669', light: '#6EE7B7' },
  rose: { hex: '#F43F5E', rgb: '244, 63, 94', hover: '#E11D48', light: '#FDA4AF' },
  amber: { hex: '#F59E0B', rgb: '245, 158, 11', hover: '#D97706', light: '#FDE68A' },
  cyan: { hex: '#06B6D4', rgb: '6, 182, 212', hover: '#0891B2', light: '#67E8F9' },
  blue: { hex: '#3B82F6', rgb: '59, 130, 246', hover: '#2563EB', light: '#93C5FD' },
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [accent, setAccentState] = useState<AccentColor>('violet');
  const [bgPattern, setBgPatternState] = useState<BackgroundPattern>('mesh');
  const [animationIntensity, setAnimationIntensityState] = useState<AnimationIntensity>('full');
  const [presets, setPresets] = useState<UserPreset[]>(INITIAL_PRESETS);
  const [activePresetId, setActivePresetId] = useState<string | null>('default-blox-dark');

  // Load initial settings and presets from Dexie
  useEffect(() => {
    async function loadData() {
      try {
        const storedSettings = await db.settings.get('active_settings');
        if (storedSettings) {
          setThemeState(storedSettings.theme || 'dark');
          setAccentState(storedSettings.accent || 'violet');
          setBgPatternState(storedSettings.bgPattern || 'mesh');
          setAnimationIntensityState(storedSettings.animationIntensity || 'full');
        }

        const storedPresets = await db.presets.toArray();
        if (storedPresets.length > 0) {
          setPresets(storedPresets);
        }
      } catch (err) {
        console.warn('Could not read settings from DB, using defaults', err);
      }
    }
    loadData();
  }, []);

  // Update DOM body styles whenever theme or accent changes
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    const colors = ACCENT_COLORS[accent] || ACCENT_COLORS.violet;
    document.documentElement.style.setProperty('--primary-color', colors.hex);
    document.documentElement.style.setProperty('--primary-hover', colors.hover);
    document.documentElement.style.setProperty('--accent-color', colors.light);
    document.documentElement.style.setProperty('--glow-shadow', `0 0 30px rgba(${colors.rgb}, 0.35)`);
  }, [theme, accent]);

  const persistSettings = useCallback(async (
    newTheme: ThemeMode,
    newAccent: AccentColor,
    newBg: BackgroundPattern,
    newAnim: AnimationIntensity
  ) => {
    try {
      const record: AppSettingsRecord = {
        key: 'active_settings',
        theme: newTheme,
        accent: newAccent,
        bgPattern: newBg,
        animationIntensity: newAnim,
        updatedAt: new Date().toISOString(),
      };
      await db.settings.put(record);
    } catch (e) {
      console.error('Error saving settings to db:', e);
    }
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    persistSettings(newTheme, accent, bgPattern, animationIntensity);
  };

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    persistSettings(theme, newAccent, bgPattern, animationIntensity);
  };

  const setBgPattern = (newBg: BackgroundPattern) => {
    setBgPatternState(newBg);
    persistSettings(theme, accent, newBg, animationIntensity);
  };

  const setAnimationIntensity = (newAnim: AnimationIntensity) => {
    setAnimationIntensityState(newAnim);
    persistSettings(theme, accent, bgPattern, newAnim);
  };

  const applyPreset = async (preset: UserPreset) => {
    setThemeState(preset.theme);
    setAccentState(preset.accent);
    setBgPatternState(preset.bgPattern);
    setAnimationIntensityState(preset.animationIntensity);
    setActivePresetId(preset.id);
    await persistSettings(preset.theme, preset.accent, preset.bgPattern, preset.animationIntensity);
    await addAuditLog('Applied Preset', preset.name);
  };

  const saveNewPreset = async (name: string): Promise<UserPreset> => {
    const newPreset: UserPreset = {
      id: `preset-${Date.now()}`,
      name: name.trim() || 'Custom Preset',
      isDefault: false,
      theme,
      accent,
      bgPattern,
      animationIntensity,
      customGameHubGrid: 'comfortable',
      updatedAt: new Date().toISOString(),
    };

    await db.presets.add(newPreset);
    const updated = await db.presets.toArray();
    setPresets(updated);
    setActivePresetId(newPreset.id);
    await addAuditLog('Created Preset', newPreset.name);
    return newPreset;
  };

  const deletePreset = async (id: string): Promise<boolean> => {
    const target = presets.find((p) => p.id === id);
    if (!target || target.isDefault) {
      return false; // Prevent deleting default official presets
    }

    await db.presets.delete(id);
    const updated = await db.presets.toArray();
    setPresets(updated);
    if (activePresetId === id) {
      setActivePresetId(updated[0]?.id || null);
    }
    await addAuditLog('Deleted Preset', target.name);
    return true;
  };

  const resetToDefaults = async () => {
    const defaultPreset = INITIAL_PRESETS[0];
    await applyPreset(defaultPreset);
    await db.presets.clear();
    await db.presets.bulkAdd(INITIAL_PRESETS);
    const refreshed = await db.presets.toArray();
    setPresets(refreshed);
    await addAuditLog('Reset to Defaults', 'All Settings');
  };

  const exportPresetAsJson = (preset: UserPreset): string => {
    return JSON.stringify(preset, null, 2);
  };

  const importPresetFromJson = async (jsonString: string) => {
    try {
      if (jsonString.length > 50000) {
        return { success: false, message: 'File is too large (maximum 50KB for preset file)' };
      }
      const parsed = JSON.parse(jsonString);
      const validated = PresetSchema.parse(parsed);

      // Generate clean new ID to avoid collisions
      const imported: UserPreset = {
        ...validated,
        id: `preset-import-${Date.now()}`,
        name: `${validated.name} (Imported)`,
        isDefault: false,
        updatedAt: new Date().toISOString(),
      };

      await db.presets.add(imported);
      const updated = await db.presets.toArray();
      setPresets(updated);
      await applyPreset(imported);
      await addAuditLog('Imported Preset', imported.name);

      return { success: true, message: `Successfully imported "${imported.name}"!`, preset: imported };
    } catch (err: any) {
      console.error('Preset validation failed:', err);
      const errMsg = err.errors?.[0]?.message || 'Invalid preset JSON structure.';
      return { success: false, message: `Import error: ${errMsg}` };
    }
  };

  const exportFullBackup = async (): Promise<string> => {
    const allPresets = await db.presets.toArray();
    const allGames = await db.games.toArray();
    const favorites = allGames.filter((g) => g.isFavorite).map((g) => g.id);
    const customGames = allGames.filter((g) => g.isCustom);

    const backup = {
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      app: 'BloxMobile' as const,
      presets: allPresets,
      favorites,
      customGames,
      settings: {
        theme,
        accent,
        bgPattern,
        animationIntensity,
      },
    };

    return JSON.stringify(backup, null, 2);
  };

  const importFullBackup = async (jsonString: string) => {
    try {
      if (jsonString.length > 500000) {
        return { success: false, message: 'Backup file exceeds size limit (500KB)' };
      }
      const parsed = JSON.parse(jsonString);
      const validated = FullBackupSchema.parse(parsed);

      // Restore presets
      await db.presets.clear();
      await db.presets.bulkAdd(validated.presets);

      // Restore custom games
      if (validated.customGames.length > 0) {
        await db.games.bulkPut(validated.customGames as any);
      }

      // Restore favorites
      for (const favId of validated.favorites) {
        await db.games.update(favId, { isFavorite: true });
      }

      // Restore settings
      setThemeState(validated.settings.theme);
      setAccentState(validated.settings.accent);
      setBgPatternState(validated.settings.bgPattern);
      setAnimationIntensityState(validated.settings.animationIntensity);
      await persistSettings(
        validated.settings.theme,
        validated.settings.accent,
        validated.settings.bgPattern,
        validated.settings.animationIntensity
      );

      const refreshedPresets = await db.presets.toArray();
      setPresets(refreshedPresets);
      await addAuditLog('Restored Full Backup', `Version ${validated.version}`);

      return { success: true, message: 'Full backup successfully restored!' };
    } catch (err: any) {
      console.error('Backup import error:', err);
      const errMsg = err.errors?.[0]?.message || 'Corrupted or invalid backup file.';
      return { success: false, message: `Restore failed: ${errMsg}` };
    }
  };

  const currentAccent = ACCENT_COLORS[accent] || ACCENT_COLORS.violet;

  return (
    <SettingsContext.Provider
      value={{
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
        exportFullBackup,
        importFullBackup,
        accentColorHex: currentAccent.hex,
        accentRgb: currentAccent.rgb,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
