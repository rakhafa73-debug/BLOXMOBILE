import { PerformanceGuide } from '../types';

export const PERFORMANCE_GUIDES: PerformanceGuide[] = [
  {
    id: 'guide-graphics-mode',
    title: 'Roblox In-Game Graphics: Manual vs Automatic',
    category: 'graphics',
    summary: 'Automatic mode constantly changes rendering fidelity, causing sudden micro-stutters during heavy combat.',
    steps: [
      'Open Roblox and enter any experience.',
      'Tap the Roblox logo button in the top-left corner to open settings.',
      'Navigate to the "Settings" tab (gear icon).',
      'Change "Graphics Mode" from "Automatic" to "Manual".',
      'Set "Graphics Quality" slider to Level 2 or 3 for mid-range phones, or Level 1 for budget devices.',
      'This locks shadow rendering and particle physics at a steady budget, eliminating sudden frame drops.'
    ],
    recommendedValue: 'Manual — Quality 2 to 3',
    impactLevel: 'High',
  },
  {
    id: 'guide-thermal-throttling',
    title: 'Thermal Throttling & Case Removal Tips',
    category: 'battery',
    summary: 'When smartphone SoC temperatures exceed 42°C, the operating system aggressively throttles CPU/GPU frequencies by up to 50%.',
    steps: [
      'Remove bulky rubber/leather protective cases before gaming sessions longer than 20 minutes.',
      'Avoid gaming while fast-charging; charging generates heavy heat inside the battery pack and SoC.',
      'Never play in direct sunlight or warm rooms.',
      'Enable phone native "Gaming Mode" (Samsung Game Booster, Xiaomi Game Turbo, iOS Focus mode) to silence background notification popups.',
      'Take a 5-minute break if your phone screen feels uncomfortably hot to touch.'
    ],
    recommendedValue: 'Cool ambient temperature & case off',
    impactLevel: 'High',
  },
  {
    id: 'guide-background-apps',
    title: 'Freeing Memory for Mobile Operating Systems',
    category: 'battery',
    summary: 'Web browsers cannot forcefully terminate other apps. Here is the realistic operating system procedure.',
    steps: [
      'Swipe up / press recent apps button on Android or iOS.',
      'Swipe away heavy background applications like camera, video editors, TikTok, or maps navigation before opening Roblox.',
      'Check system storage: Ensure your phone has at least 15% to 20% free internal storage for virtual memory swap (ZRAM/Swapfile).',
      'Restart your mobile device every 3-4 days to purge stale zombie daemon processes.'
    ],
    recommendedValue: '15%+ Free Storage & Fresh Reboot',
    impactLevel: 'Medium',
  },
  {
    id: 'guide-network-jitter',
    title: 'Reducing Mobile Network Jitter & Ping Spikes',
    category: 'network',
    summary: 'In Roblox, packet loss and jitter cause "rubber-banding" and teleporting glitches more than raw ping.',
    steps: [
      'Prefer 5GHz Wi-Fi over 2.4GHz Wi-Fi (2.4GHz suffers severe interference from Bluetooth and household walls).',
      'If playing on Mobile Data (4G/5G), ensure you have at least 3 bars of signal strength.',
      'Disable automated cloud backups (Google Photos, iCloud, WhatsApp Backup) while playing.',
      'Turn off active VPNs unless strictly necessary; VPN routing adds extra hops and latency.'
    ],
    recommendedValue: '5GHz Wi-Fi or Strong 5G Low-Jitter',
    impactLevel: 'High',
  },
  {
    id: 'guide-camera-controls',
    title: 'Mobile Touch Controls & UI Sensitivity',
    category: 'controls',
    summary: 'Fine-tuning camera sensitivity prevents erratic spins and missed jump inputs in obby and action games.',
    steps: [
      'Inside Roblox settings, adjust "Camera Sensitivity" to between 0.25 and 0.45.',
      'Change "Movement Mode" to "Dynamic Thumbstick" or "Classic Thumbstick" based on your thumb reach.',
      'Enable "Shift Lock Switch" if playing PvP games where diagonal strafing is advantageous.',
      'Clean your phone screen with a microfiber cloth to prevent phantom moisture taps.'
    ],
    recommendedValue: 'Camera Sensitivity 0.30 - 0.40',
    impactLevel: 'Medium',
  },
];
