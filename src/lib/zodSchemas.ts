import { z } from 'zod';

export const PresetSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name must be at least 1 character').max(32, 'Name too long'),
  isDefault: z.boolean().optional(),
  theme: z.enum(['dark', 'amoled', 'neon']),
  accent: z.enum(['violet', 'emerald', 'rose', 'amber', 'cyan', 'blue']),
  bgPattern: z.enum(['mesh', 'grid', 'dots', 'plain']),
  animationIntensity: z.enum(['full', 'subtle', 'off']),
  customGameHubGrid: z.enum(['compact', 'comfortable']).optional(),
  updatedAt: z.string().datetime().or(z.string().min(10)),
});

export const RobloxUrlOrIdSchema = z.string().refine((val) => {
  const cleaned = val.trim();
  // Valid numeric place ID (e.g. 2753915549)
  if (/^\d{6,14}$/.test(cleaned)) return true;
  // Valid roblox.com URL
  try {
    const url = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
    const host = url.hostname.toLowerCase();
    const isRobloxDomain = host === 'roblox.com' || host === 'www.roblox.com' || host.endsWith('.roblox.com');
    if (!isRobloxDomain) return false;
    // Check if path contains games/placeId
    const pathParts = url.pathname.split('/').filter(Boolean);
    const hasGames = pathParts.includes('games');
    const hasNumber = pathParts.some((part) => /^\d{6,14}$/.test(part));
    return hasGames && hasNumber;
  } catch {
    return false;
  }
}, {
  message: 'Must be a valid Roblox Place ID (e.g. 2753915549) or URL (e.g. https://www.roblox.com/games/2753915549/...)',
});

export const GameFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(60, 'Title too long'),
  placeId: z.string().regex(/^\d{6,14}$/, 'Place ID must be a 6 to 14 digit number'),
  description: z.string().min(5, 'Description must be at least 5 characters').max(300, 'Description too long'),
  category: z.enum(['Action', 'RPG', 'Anime', 'Simulator', 'Horror', 'Social', 'Survival', 'Racing']),
  thumbnailUrl: z.string().url('Must be a valid image URL').or(z.string().startsWith('/')),
  mobileRating: z.object({
    touchControls: z.number().int().min(1).max(5),
    performance: z.enum(['Smooth', 'Moderate', 'Demanding']),
    recommendedGraphics: z.string().min(3).max(60),
  }),
  tags: z.array(z.string()).min(1, 'Add at least one tag'),
  isDemo: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export const FullBackupSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  app: z.literal('BloxMobile'),
  presets: z.array(PresetSchema),
  favorites: z.array(z.string()),
  customGames: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      placeId: z.string(),
      description: z.string(),
      category: z.string(),
      thumbnailUrl: z.string(),
      mobileRating: z.any(),
      tags: z.array(z.string()),
      isFavorite: z.boolean().optional(),
      isCustom: z.boolean().optional(),
    })
  ),
  settings: z.object({
    theme: z.enum(['dark', 'amoled', 'neon']),
    accent: z.enum(['violet', 'emerald', 'rose', 'amber', 'cyan', 'blue']),
    bgPattern: z.enum(['mesh', 'grid', 'dots', 'plain']),
    animationIntensity: z.enum(['full', 'subtle', 'off']),
  }),
});
