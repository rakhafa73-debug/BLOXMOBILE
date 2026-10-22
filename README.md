# BloxMobile PWA — Roblox Mobile Gaming Companion

BloxMobile is a high-performance, mobile-first Progressive Web App (PWA) inspired by the customization spirit of Bloxstrap, designed specifically for Roblox players on **Android** and **iOS**.

BloxMobile provides a curated Game Hub with mobile touch-control and performance ratings, realistic in-game Roblox graphics optimization guides, connection latency testing, companion UI customization with AMOLED/Neon themes, and offline functionality.

> **Independent Project Notice:** BloxMobile is an independent companion application. It is not affiliated with, sponsored by, or endorsed by Roblox Corporation or the Windows Bloxstrap open-source project.

---

## ⚡ Key Features

1. **Home Dashboard**
   - 1-Tap **Launch Roblox** with automatic URI scheme detection (`roblox://experiences/start?placeId=...`) and official web fallback.
   - Pinned favorite experiences for instant access.
   - Live network latency & jitter monitor with real-time refresh.
   - PWA installation banner and honest capability disclaimer.

2. **Game Hub**
   - Instant search by title, place ID, category, or tags.
   - Category filters: Action, RPG, Anime, Simulator, Horror, Social, Survival, and Favorites.
   - Mobile Readiness Ratings: Touch control score (1–5 stars), performance tier (Smooth, Moderate, Demanding), and recommended in-game graphic levels.
   - **Bookmark Any Game**: Add any custom Roblox game by Place ID or URL with Zod schema validation.
   - Direct launch into the Roblox mobile client.

3. **Customize Center**
   - **Themes**: Classic Blox Dark (`#0D0B14`), True AMOLED (`#000000` for OLED battery savings), and Cyber Neon (`#08060F` with glowing borders).
   - **Accent Colors**: Violet, Emerald, Rose, Amber, Cyan, and Electric Blue.
   - **Background Patterns**: Ambient Mesh Glow, Tactical Cyber Grid, Starfield Dots, and Pure Minimal.
   - **Animation Profiles**: Full Smooth, Eco / Battery Saver, or Instant (respects `prefers-reduced-motion`).
   - **Preset Manager**: Save custom presets, export preset JSON, import preset JSON with validation, and reset to defaults.

4. **Performance Assistant**
   - **Target FPS Configurator**: Profile selection (30 FPS Eco, 60 FPS Standard, 90 FPS Smooth, 120 FPS Pro) matched against detected physical screen refresh rate.
   - **OS High Refresh Rate Guide**: Step-by-step instructions to force 90Hz/120Hz display modes on Samsung, Xiaomi/POCO, and iOS ProMotion devices.
   - **Network Latency Diagnostics**: Real round-trip time (ms) and jitter test against Cloudflare Edge endpoints.
   - **Hardware Telemetry**: Screen refresh rate detection via `requestAnimationFrame` sampling (60Hz / 90Hz / 120Hz ProMotion), CPU logical cores, WebGL GPU renderer, and battery status.
   - **Pre-Game Checklist**: Practical OS and hardware steps (background app cleanup, case removal to delay thermal throttling, disabling battery saver mode).
   - **Roblox Settings Tutorials**: Step-by-step guides for in-game manual graphics tuning.

5. **Settings & Data Management**
   - Encrypted client-side storage using **IndexedDB** via **Dexie**.
   - Storage metrics: Count of saved presets, catalog games, and audit log entries.
   - **Full Backup / Migration**: Export entire state as JSON and restore with Zod validation.
   - Danger zone: Clear all local data with confirmation safety modal.

6. **Admin Dashboard**
   - Secured by passcode authentication (`admin2026`).
   - Catalog management: Edit games, toggle publish/unpublish, delete experiences.
   - Roblox URL validation tool.
   - Audit logging tracking actions with timestamps.

---

## 🛡️ Engineering Transparency & Platform Boundaries

Mobile browsers operate inside sandboxed security environments on Android and iOS:
- **No FastFlags Modification**: Web applications cannot modify closed-source native mobile app files, APKs, or IPAs.
- **No Fake FPS Unlocking**: Mobile Roblox has a native 60 FPS cap. BloxMobile does not make false promises about bypassing engine limits without OS-level root/jailbreak.
- **No Fake RAM Boosters**: Web browsers cannot kill background processes from other applications. We provide honest step-by-step OS guidance instead.
- **Zero Credential Requests**: BloxMobile never asks for passwords, session cookies, or `.ROBLOSECURITY` tokens.

---

## 📱 PWA Installation Instructions

### Android (Chrome / Brave / Edge)
1. Tap the **Install** button in the BloxMobile header.
2. If prompted by your browser, tap **Install** or **Add to Home screen**.
3. BloxMobile will appear in your app drawer as a standalone fullscreen app.

### iOS (Safari on iPhone / iPad)
1. Open the website in **Safari**.
2. Tap the **Share** button (box with an upward arrow) in the Safari toolbar.
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add** in the top-right corner.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript (Strict Mode)
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **PWA**: `vite-plugin-pwa` + Web App Manifest + Service Worker (`public/sw.js`)
- **Local Database**: IndexedDB through `dexie`
- **Validation**: `zod`
- **Icons**: `lucide-react`
- **Testing**: `vitest`

---

## 🚀 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start local development server (port 3000)
npm run dev

# 3. Run unit tests
npm test

# 4. Type check / lint
npm run lint

# 5. Build for production
npm run build
```

---

## 🗄️ Database Schema & Supabase Cloud Migration

For local standalone usage, BloxMobile runs 100% in-browser with IndexedDB.
If connecting to Supabase for multi-device sync and cloud admin authentication:
- Execute the migration file located at: `supabase/migrations/20260101_init_bloxmobile.sql`.
- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your environment.
- Row Level Security (RLS) is pre-configured on all tables (`profiles`, `games`, `user_favorites`, `user_presets`, `audit_logs`).
