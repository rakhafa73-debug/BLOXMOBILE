import React, { useState } from 'react';
import { Zap, AlertTriangle, CheckCircle2, ShieldCheck, Smartphone, Settings2, Sliders, ExternalLink, HelpCircle, Info } from 'lucide-react';
import { TargetFpsOption, FpsProfile } from '../../types';
import { useToast } from '../../context/ToastContext';

interface FpsConfiguratorProps {
  detectedRefreshRate: number | null;
}

const FPS_PROFILES: Record<TargetFpsOption, FpsProfile> = {
  30: {
    targetFps: 30,
    label: '30 FPS — Eco & Anti-Overheat',
    description: 'Stabilizes frametimes on budget phones and avoids heavy thermal throttling during long gameplay sessions.',
    recommendedGraphicsLevel: 'Level 1 to 2 (Manual Mode)',
    idealSoC: 'Snapdragon 680 / Helio G85 / Unisoc / Apple A10-A11',
    osTuningGuide: {
      android: [
        'Open Phone Settings ➔ Battery ➔ Enable Standard Power Saving if phone gets too hot.',
        'In Roblox Settings: Set Graphics Mode to "Manual" and slider to Level 1.',
        'Turn off high ambient brightness to lower panel thermals.'
      ],
      ios: [
        'Open iOS Settings ➔ Accessibility ➔ Motion ➔ You can optionally toggle "Limit Frame Rate" if your phone gets too warm.',
        'In Roblox Settings: Set Graphics Mode to "Manual" and slider to Level 1–2.'
      ]
    }
  },
  60: {
    targetFps: 60,
    label: '60 FPS — Competitive Standard',
    description: 'The standard native ceiling for the Roblox mobile client engine. Delivers the optimal balance between input response and battery consumption.',
    recommendedGraphicsLevel: 'Level 2 to 4 (Manual Mode)',
    idealSoC: 'Snapdragon 778G / Dimensity 8100 / Apple A12-A15',
    osTuningGuide: {
      android: [
        'Ensure Battery Saver / Low Power Mode is TURNED OFF (Battery Saver limits CPU frequencies).',
        'Open Game Booster / Game Turbo ➔ Set Performance Mode to "Performance" or "Balanced".',
        'In Roblox Settings: Set Graphics Mode to "Manual" and slide to Level 2–3 for PvP games.'
      ],
      ios: [
        'Ensure Low Power Mode is TURNED OFF in Control Center.',
        'Close heavy background apps (Camera, TikTok, Maps) before launching.',
        'In Roblox Settings: Set Graphics Mode to "Manual" and slider to Level 3.'
      ]
    }
  },
  90: {
    targetFps: 90,
    label: '90 FPS — High Refresh Rate',
    description: 'Provides ultra-responsive camera movement for obbies and competitive sword games on 90Hz+ AMOLED panels.',
    recommendedGraphicsLevel: 'Level 2 to 3 (Manual Mode — Keeps GPU headroom for 90 FPS)',
    idealSoC: 'Snapdragon 8+ Gen 1 / Dimensity 9000 / Apple A15 Pro+',
    osTuningGuide: {
      android: [
        'Go to Settings ➔ Display ➔ Refresh Rate / Motion Smoothness ➔ Select "90Hz" or "120Hz".',
        'Xiaomi / POCO: Open Security app ➔ Game Turbo ➔ Enable high performance and lock frame rate to highest.',
        'Samsung: Ensure Game Booster does not have "Save power during gaming" enabled.'
      ],
      ios: [
        'Requires an iPhone Pro (13 Pro+) or iPad Pro with ProMotion display.',
        'Ensure Settings ➔ Accessibility ➔ Motion ➔ "Limit Frame Rate" is OFF.',
        'In Roblox Settings: Keep graphics low to maintain 90+ frame budget.'
      ]
    }
  },
  120: {
    targetFps: 120,
    label: '120 FPS — Ultra Smooth Pro',
    description: 'The smoothest possible mobile experience. Requires flagship hardware and 120Hz display with adequate cooling.',
    recommendedGraphicsLevel: 'Level 1 to 2 (Manual Mode — Prevents thermal drop)',
    idealSoC: 'Snapdragon 8 Gen 2/3 / Dimensity 9300 / Apple A17 Pro / M1-M4',
    osTuningGuide: {
      android: [
        'Go to Settings ➔ Display ➔ Set Screen Refresh Rate to "120Hz" or "Adaptive".',
        'Remove phone protective case to allow heat dissipation.',
        'Use an external clip-on mobile phone cooler for sustained 120 FPS in intense raids.',
        'In Roblox: Lock Graphics to Level 1–2 so the GPU does not overheat.'
      ],
      ios: [
        'Requires iPad Pro (ProMotion 120Hz) or iPhone 13/14/15/16 Pro.',
        'Verify Settings ➔ Accessibility ➔ Motion ➔ "Limit Frame Rate" is strictly OFF.',
        'Play in a cool room without charging simultaneously.'
      ]
    }
  }
};

export const FpsConfigurator: React.FC<FpsConfiguratorProps> = ({ detectedRefreshRate }) => {
  const { showToast } = useToast();
  const [selectedFps, setSelectedFps] = useState<TargetFpsOption>(60);
  const [selectedPlatform, setSelectedPlatform] = useState<'android' | 'ios'>('android');
  const [showTechnicalExplainer, setShowTechnicalExplainer] = useState(false);

  const activeProfile = FPS_PROFILES[selectedFps];
  const screenHz = detectedRefreshRate || 60;
  const isTargetHigherThanScreen = selectedFps > screenHz;

  const handleApplyProfile = () => {
    showToast(`Target FPS set to ${selectedFps} FPS. Apply the recommended in-game settings below.`, 'success');
  };

  return (
    <div className="rounded-3xl bg-[#191523] border border-violet-500/25 p-5 sm:p-7 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-black text-white">Roblox Mobile Target FPS Configurator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure your target frame rate profile, match with display hardware, and optimize system refresh settings.
          </p>
        </div>

        {/* Display Refresh Badge */}
        <div className="px-3.5 py-1.5 rounded-2xl bg-[#120F1C] border border-violet-500/20 text-xs flex items-center gap-2 shrink-0">
          <Smartphone className="w-4 h-4 text-violet-400" />
          <span className="text-slate-400">Detected Screen:</span>
          <strong className="text-white font-mono">{screenHz} Hz</strong>
        </div>
      </div>

      {/* Target FPS Selector Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          1. Choose Target FPS Profile
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([30, 60, 90, 120] as TargetFpsOption[]).map((fps) => {
            const isSelected = selectedFps === fps;
            return (
              <button
                key={fps}
                onClick={() => setSelectedFps(fps)}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-violet-600/20 border-violet-500 shadow-lg shadow-violet-900/30'
                    : 'bg-[#120F1C] border-white/5 hover:border-violet-500/30 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xl font-black font-mono ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {fps} FPS
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                </div>
                <span className="text-[10px] mt-1 text-slate-400 truncate">
                  {fps === 30 ? 'Anti-Lag Eco' : fps === 60 ? 'Standard 60' : fps === 90 ? '90Hz Smooth' : '120Hz Pro'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hardware Compatibility Warning / Match Banner */}
      {isTargetHigherThanScreen ? (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Hardware Bottleneck Detected: {selectedFps} FPS on a {screenHz}Hz Screen</p>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              Your device screen is physically detected at <strong>{screenHz}Hz</strong>. A 60Hz display can physically only render up to 60 frames per second.
              Setting a target higher than your panel refresh rate will generate unnecessary GPU heat without adding visual fluidity. We recommend targeting <strong>60 FPS</strong>.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Display hardware verified: Your <strong>{screenHz}Hz</strong> screen fully supports this {selectedFps} FPS target!
          </span>
        </div>
      )}

      {/* Profile Details & Recommended Tuning */}
      <div className="p-5 rounded-2xl bg-[#120F1C] border border-violet-500/15 space-y-4 text-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">{activeProfile.label}</h3>
            <p className="text-slate-400 mt-1">{activeProfile.description}</p>
          </div>
          <button
            onClick={handleApplyProfile}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition shadow-md shadow-violet-900/30 active:scale-95 shrink-0"
          >
            Apply Profile
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/5">
          <div className="space-y-1">
            <span className="text-slate-400">Recommended In-Game Graphics:</span>
            <p className="font-bold text-violet-300">{activeProfile.recommendedGraphicsLevel}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400">Target SoC Capability:</span>
            <p className="font-bold text-slate-200">{activeProfile.idealSoC}</p>
          </div>
        </div>
      </div>

      {/* OS-Level Refresh Rate Setup Guide */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            2. How to Enable High Refresh Rate on Mobile
          </label>
          <div className="flex items-center gap-1 bg-[#120F1C] p-1 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => setSelectedPlatform('android')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                selectedPlatform === 'android' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Android
            </button>
            <button
              onClick={() => setSelectedPlatform('ios')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                selectedPlatform === 'ios' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              iOS (iPhone/iPad)
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#14101E] border border-violet-500/15 space-y-2 text-xs">
          <ol className="text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
            {activeProfile.osTuningGuide[selectedPlatform].map((step, idx) => (
              <li key={idx} className="text-slate-300">
                <span className="text-slate-200">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Technical FAQ: Why Web Browsers Cannot Inject FastFlags on Mobile */}
      <div className="pt-2 border-t border-violet-500/10">
        <button
          onClick={() => setShowTechnicalExplainer(!showTechnicalExplainer)}
          className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-violet-400" />
            <span>Why Bloxstrap on PC has an FPS Unlocker, but Mobile Apps Cannot?</span>
          </span>
          <span className="text-violet-400">{showTechnicalExplainer ? 'Hide' : 'Read Technical Details'}</span>
        </button>

        {showTechnicalExplainer && (
          <div className="mt-3 p-4 rounded-2xl bg-black/40 border border-violet-500/15 text-xs text-slate-400 space-y-2.5 leading-relaxed animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Operating System Sandboxing & Safety Notice</span>
            </div>
            <p>
              1. <strong>Windows Launcher vs Mobile Browser:</strong> On Windows, Bloxstrap is a native <code>.exe</code> executable with filesystem access to write to Roblox's <code>ClientAppSettings.json</code> (the FastFlag <code>DFIntTaskSchedulerTargetFps</code>).
            </p>
            <p>
              2. <strong>Android & iOS Security Sandbox:</strong> On mobile devices, operating systems strictly isolate every application (sandbox). A web browser or companion app is prevented by kernel security from modifying internal files of the native Roblox app (<code>/data/data/com.roblox.client</code>) or injecting into its runtime memory.
            </p>
            <p>
              3. <strong>Anti-Ban Compliance:</strong> Attempting to tamper with mobile APKs or memory using third-party modified loaders violates Roblox's Terms of Service and triggers Byfron / Hyperion anti-tamper bans.
            </p>
            <p>
              4. <strong>The Legitimate Solution:</strong> By adjusting phone display refresh rate to 120Hz in Android/iOS system settings and configuring in-game graphics manually as shown in the guides above, Roblox runs at the maximum possible smooth frame delivery without risk to your account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
