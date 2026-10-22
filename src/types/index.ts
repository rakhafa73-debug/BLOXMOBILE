export type ThemeMode = 'dark' | 'amoled' | 'neon';

export type AccentColor = 'violet' | 'emerald' | 'rose' | 'amber' | 'cyan' | 'blue';

export type BackgroundPattern = 'mesh' | 'grid' | 'dots' | 'plain';

export type AnimationIntensity = 'full' | 'subtle' | 'off';

export interface UserPreset {
  id: string;
  name: string;
  isDefault?: boolean;
  theme: ThemeMode;
  accent: AccentColor;
  bgPattern: BackgroundPattern;
  animationIntensity: AnimationIntensity;
  customGameHubGrid?: 'compact' | 'comfortable';
  updatedAt: string;
}

export interface RobloxGame {
  id: string;
  title: string;
  placeId: string;
  description: string;
  category: 'Action' | 'RPG' | 'Anime' | 'Simulator' | 'Horror' | 'Social' | 'Survival' | 'Racing';
  thumbnailUrl: string;
  activePlayersEstimate?: string;
  mobileRating: {
    touchControls: 1 | 2 | 3 | 4 | 5;
    performance: 'Smooth' | 'Moderate' | 'Demanding';
    recommendedGraphics: string; // e.g. "Level 1-3 (Low/Mid Phones)"
  };
  isFavorite?: boolean;
  isCustom?: boolean;
  isPublished?: boolean;
  isDemo?: boolean;
  tags: string[];
}

export interface PerformanceGuide {
  id: string;
  title: string;
  category: 'graphics' | 'battery' | 'network' | 'controls';
  summary: string;
  steps: string[];
  recommendedValue: string;
  impactLevel: 'High' | 'Medium' | 'Low';
}

export interface DeviceCapabilities {
  screenRefreshRate: number | null;
  hardwareConcurrency: number | null;
  deviceMemory: number | null;
  gpuRenderer: string | null;
  batteryLevel: number | null;
  isCharging: boolean | null;
  connectionType: string | null;
  effectiveType: string | null;
  downlinkSpeed: number | null;
  rtt: number | null;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  actor: string;
}

export type ActiveTab = 'home' | 'gamehub' | 'customize' | 'performance' | 'settings' | 'admin';

export type TargetFpsOption = 30 | 60 | 90 | 120;

export interface FpsProfile {
  targetFps: TargetFpsOption;
  label: string;
  description: string;
  recommendedGraphicsLevel: string;
  idealSoC: string;
  osTuningGuide: {
    android: string[];
    ios: string[];
  };
}
