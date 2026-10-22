import { describe, it, expect } from 'vitest';
import { extractPlaceId, getRobloxDeepLink, getRobloxWebUrl } from '../lib/robloxUrl';
import { PresetSchema, RobloxUrlOrIdSchema, GameFormSchema, FullBackupSchema } from '../lib/zodSchemas';
import { INITIAL_GAMES } from '../data/initialGames';

describe('Roblox URL and Place ID Extraction', () => {
  it('extracts numeric place ID directly from clean digits', () => {
    expect(extractPlaceId('2753915549')).toBe('2753915549');
    expect(extractPlaceId(' 4924922222 ')).toBe('4924922222');
  });

  it('extracts place ID from standard Roblox game web URLs', () => {
    const url = 'https://www.roblox.com/games/2753915549/Blox-Fruits';
    expect(extractPlaceId(url)).toBe('2753915549');
  });

  it('extracts place ID from roblox query parameters', () => {
    const url = 'https://www.roblox.com/games?placeId=6516141723';
    expect(extractPlaceId(url)).toBe('6516141723');
  });

  it('rejects malicious or non-Roblox domains', () => {
    expect(extractPlaceId('https://fake-phishing-roblox.com/games/123456')).toBeNull();
    expect(extractPlaceId('https://google.com')).toBeNull();
    expect(extractPlaceId('not_a_valid_id')).toBeNull();
  });

  it('generates correct mobile deep links and fallback web URLs', () => {
    const placeId = '2753915549';
    expect(getRobloxDeepLink(placeId)).toBe('roblox://experiences/start?placeId=2753915549');
    expect(getRobloxWebUrl(placeId)).toBe('https://www.roblox.com/games/2753915549');
    expect(getRobloxDeepLink()).toBe('roblox://navigation/home');
    expect(getRobloxWebUrl()).toBe('https://www.roblox.com/home');
  });
});

describe('Zod Schemas Validation', () => {
  it('validates legitimate companion presets', () => {
    const validPreset = {
      id: 'test-preset',
      name: 'Cyber Violet',
      theme: 'neon' as const,
      accent: 'violet' as const,
      bgPattern: 'mesh' as const,
      animationIntensity: 'full' as const,
      updatedAt: new Date().toISOString(),
    };
    expect(() => PresetSchema.parse(validPreset)).not.toThrow();
  });

  it('rejects preset with invalid theme or missing required fields', () => {
    const invalidPreset = {
      id: 'test-preset',
      name: 'Bad Preset',
      theme: 'non-existent-theme',
      accent: 'violet',
    };
    expect(() => PresetSchema.parse(invalidPreset)).toThrow();
  });

  it('validates Roblox URL and Place ID schema', () => {
    expect(RobloxUrlOrIdSchema.safeParse('2753915549').success).toBe(true);
    expect(RobloxUrlOrIdSchema.safeParse('https://www.roblox.com/games/2753915549/Blox-Fruits').success).toBe(true);
    expect(RobloxUrlOrIdSchema.safeParse('https://phishing.com/games/2753915549').success).toBe(false);
    expect(RobloxUrlOrIdSchema.safeParse('abc').success).toBe(false);
  });

  it('validates Game bookmark creation form', () => {
    const validForm = {
      title: 'Anime Defenders',
      placeId: '17017769292',
      description: 'Tower defense anime adventure.',
      category: 'Anime' as const,
      thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119',
      mobileRating: {
        touchControls: 4,
        performance: 'Moderate' as const,
        recommendedGraphics: 'Level 2–3',
      },
      tags: ['Anime', 'Tower Defense'],
      isPublished: true,
    };
    expect(() => GameFormSchema.parse(validForm)).not.toThrow();
  });

  it('validates full application backup JSON structure', () => {
    const backup = {
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      app: 'BloxMobile' as const,
      presets: [
        {
          id: 'p1',
          name: 'P1',
          theme: 'dark' as const,
          accent: 'violet' as const,
          bgPattern: 'plain' as const,
          animationIntensity: 'subtle' as const,
          updatedAt: new Date().toISOString(),
        },
      ],
      favorites: ['blox-fruits'],
      customGames: [],
      settings: {
        theme: 'dark' as const,
        accent: 'violet' as const,
        bgPattern: 'mesh' as const,
        animationIntensity: 'full' as const,
      },
    };
    expect(() => FullBackupSchema.parse(backup)).not.toThrow();
  });
});

describe('Game Hub Search and Filtering Logic', () => {
  it('correctly filters games by search query across titles and tags', () => {
    const query = 'anime';
    const matches = INITIAL_GAMES.filter(
      (g) =>
        g.title.toLowerCase().includes(query) ||
        g.tags.some((t) => t.toLowerCase().includes(query))
    );
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some((g) => g.title === 'Blox Fruits')).toBe(true);
  });

  it('correctly filters games by performance rating', () => {
    const smoothGames = INITIAL_GAMES.filter((g) => g.mobileRating.performance === 'Smooth');
    expect(smoothGames.length).toBeGreaterThan(0);
    expect(smoothGames.every((g) => g.mobileRating.performance === 'Smooth')).toBe(true);
  });
});

describe('FPS Optimizer & Display Refresh Rate Compatibility', () => {
  it('correctly identifies when selected FPS exceeds physical panel refresh rate', () => {
    const screenHz = 60;
    const isTargetExceeding = (targetFps: number, hz: number) => targetFps > hz;

    expect(isTargetExceeding(120, screenHz)).toBe(true);
    expect(isTargetExceeding(90, screenHz)).toBe(true);
    expect(isTargetExceeding(60, screenHz)).toBe(false);
    expect(isTargetExceeding(30, screenHz)).toBe(false);
  });

  it('validates 120Hz display compatibility', () => {
    const screenHz = 120;
    const isTargetExceeding = (targetFps: number, hz: number) => targetFps > hz;

    expect(isTargetExceeding(120, screenHz)).toBe(false);
    expect(isTargetExceeding(90, screenHz)).toBe(false);
    expect(isTargetExceeding(60, screenHz)).toBe(false);
  });
});

