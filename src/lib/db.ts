import Dexie, { type Table } from 'dexie';
import { UserPreset, RobloxGame, AuditLogEntry, ThemeMode, AccentColor, BackgroundPattern, AnimationIntensity } from '../types';
import { INITIAL_GAMES } from '../data/initialGames';
import { INITIAL_PRESETS } from '../data/initialPresets';

export interface AppSettingsRecord {
  key: string;
  theme: ThemeMode;
  accent: AccentColor;
  bgPattern: BackgroundPattern;
  animationIntensity: AnimationIntensity;
  updatedAt: string;
}

export class BloxMobileDatabase extends Dexie {
  presets!: Table<UserPreset, string>;
  games!: Table<RobloxGame, string>;
  settings!: Table<AppSettingsRecord, string>;
  auditLogs!: Table<AuditLogEntry, string>;

  constructor() {
    super('BloxMobileDB');
    
    // Schema versioning
    this.version(1).stores({
      presets: 'id, name, theme, accent, updatedAt',
      games: 'id, title, placeId, category, isFavorite, isCustom, isPublished',
      settings: 'key',
      auditLogs: 'id, timestamp, action',
    });
  }
}

export const db = new BloxMobileDatabase();

/**
 * Initialize seed data into IndexedDB on first run
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const presetCount = await db.presets.count();
    if (presetCount === 0) {
      await db.presets.bulkAdd(INITIAL_PRESETS);
    }

    const gameCount = await db.games.count();
    if (gameCount === 0) {
      await db.games.bulkAdd(INITIAL_GAMES);
    }

    const existingSettings = await db.settings.get('active_settings');
    if (!existingSettings) {
      await db.settings.put({
        key: 'active_settings',
        theme: 'dark',
        accent: 'violet',
        bgPattern: 'mesh',
        animationIntensity: 'full',
        updatedAt: new Date().toISOString(),
      });
    }

    const auditCount = await db.auditLogs.count();
    if (auditCount === 0) {
      await db.auditLogs.add({
        id: 'initial-boot',
        action: 'BloxMobile Initialized',
        target: 'Local Database',
        timestamp: new Date().toISOString(),
        actor: 'System',
      });
    }
  } catch (error) {
    console.warn('IndexedDB initialization error, fallback mode active:', error);
  }
}

export async function addAuditLog(action: string, target: string, actor: string = 'User'): Promise<void> {
  try {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action,
      target,
      timestamp: new Date().toISOString(),
      actor,
    };
    await db.auditLogs.add(entry);
  } catch (err) {
    console.error('Failed to log audit entry:', err);
  }
}
