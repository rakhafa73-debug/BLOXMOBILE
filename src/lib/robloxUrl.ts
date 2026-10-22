/**
 * Utility for handling Roblox URLs, Place IDs, and mobile deeplinks
 */

export function extractPlaceId(input: string): string | null {
  const cleaned = input.trim();
  // If pure digits
  if (/^\d{6,14}$/.test(cleaned)) {
    return cleaned;
  }

  try {
    const url = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
    const host = url.hostname.toLowerCase();
    const isRoblox = host === 'roblox.com' || host === 'www.roblox.com' || host.endsWith('.roblox.com');
    if (!isRoblox) return null;

    // e.g., /games/2753915549/Blox-Fruits
    const match = url.pathname.match(/\/games\/(\d+)/i);
    if (match && match[1]) {
      return match[1];
    }

    // search params ?placeId=
    const placeIdParam = url.searchParams.get('placeId') || url.searchParams.get('placeID');
    if (placeIdParam && /^\d+$/.test(placeIdParam)) {
      return placeIdParam;
    }
  } catch {
    return null;
  }

  return null;
}

export function getRobloxDeepLink(placeId?: string): string {
  if (!placeId) {
    return 'roblox://navigation/home';
  }
  // roblox://experiences/start?placeId=... is standard for mobile Roblox
  return `roblox://experiences/start?placeId=${placeId}`;
}

export function getRobloxWebUrl(placeId?: string): string {
  if (!placeId) {
    return 'https://www.roblox.com/home';
  }
  return `https://www.roblox.com/games/${placeId}`;
}

export interface LaunchResult {
  opened: boolean;
  deepLink: string;
  webFallback: string;
}

/**
 * Attempts to launch Roblox mobile client with fallback to official website.
 * Follows browser security guidelines (no intrusive popups or window.alert).
 */
export function launchRoblox(placeId?: string): LaunchResult {
  const deepLink = getRobloxDeepLink(placeId);
  const webFallback = getRobloxWebUrl(placeId);

  // Attempt to open deep link via hidden iframe or window location
  try {
    const start = Date.now();
    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent.toLowerCase());

    if (isMobile) {
      window.location.href = deepLink;
    } else {
      // For desktop companion mode, open the web url or attempt scheme
      window.location.href = deepLink;
    }

    // Set a lightweight timer to check if page was hidden or still focused
    setTimeout(() => {
      // If user is still on page after 1.8 seconds, the app might not be installed
      if (Date.now() - start < 2200 && document.hasFocus()) {
        console.info('Roblox app launch might have timed out, web fallback available.');
      }
    }, 1500);

    return { opened: true, deepLink, webFallback };
  } catch (err) {
    console.error('Launch failed:', err);
    window.open(webFallback, '_blank', 'noopener,noreferrer');
    return { opened: false, deepLink, webFallback };
  }
}
