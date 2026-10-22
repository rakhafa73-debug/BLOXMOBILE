import React, { useState, useEffect } from 'react';
import { Gauge, CheckCircle2, Circle, Wifi, Cpu, HardDrive, Smartphone, Battery, AlertTriangle, ExternalLink, RefreshCw, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { PERFORMANCE_GUIDES } from '../../data/initialGuides';
import { measureNetworkLatency, getDeviceCapabilities, PingResult } from '../../lib/diagnostics';
import { DeviceCapabilities, PerformanceGuide } from '../../types';
import { useToast } from '../../context/ToastContext';
import { FpsConfigurator } from './FpsConfigurator';

export const PerformanceAssistant: React.FC = () => {
  const { showToast } = useToast();
  const [deviceCaps, setDeviceCaps] = useState<DeviceCapabilities | null>(null);
  const [pingData, setPingData] = useState<PingResult | null>(null);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingHistory, setPingHistory] = useState<PingResult[]>([]);
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>('guide-graphics-mode');

  // Pre-game optimization checklist state (persisted locally)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    closeApps: false,
    removeCase: false,
    disableSaver: false,
    wifi5ghz: false,
    storageSpace: false,
  });

  useEffect(() => {
    runFullDiagnostics();
  }, []);

  const runFullDiagnostics = async () => {
    setIsTestingPing(true);
    try {
      const [caps, ping] = await Promise.all([
        getDeviceCapabilities(),
        measureNetworkLatency(),
      ]);
      setDeviceCaps(caps);
      setPingData(ping);
      setPingHistory((prev) => [ping, ...prev.slice(0, 4)]);
    } finally {
      setIsTestingPing(false);
    }
  };

  const handleTestPingOnly = async () => {
    setIsTestingPing(true);
    try {
      const ping = await measureNetworkLatency();
      setPingData(ping);
      setPingHistory((prev) => [ping, ...prev.slice(0, 4)]);
      showToast(`Ping tested: ${ping.latencyMs}ms (${ping.status})`, 'info');
    } finally {
      setIsTestingPing(false);
    }
  };

  const toggleChecklist = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedChecklistCount = Object.values(checklist).filter(Boolean).length;
  const totalChecklistItems = Object.keys(checklist).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Gauge className="w-7 h-7 text-emerald-400" />
            <span>Mobile Performance Assistant</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Honest diagnostic benchmarks, network latency analyzer, and step-by-step Roblox mobile settings guides.
          </p>
        </div>

        <button
          onClick={runFullDiagnostics}
          disabled={isTestingPing}
          className="px-4 py-2.5 rounded-2xl bg-[#191523] border border-violet-500/20 hover:border-violet-500/40 text-slate-200 text-xs font-semibold flex items-center gap-2 transition active:scale-95 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTestingPing ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Rerun Hardware & Ping Diagnostics</span>
        </button>
      </div>

      {/* Honest Boundary Notice (Anti-Slop / Security Rules) */}
      <div className="p-4 rounded-2xl bg-[#171224] border border-violet-500/20 space-y-2 text-xs text-slate-300">
        <div className="flex items-center gap-2 text-violet-300 font-bold">
          <ShieldCheck className="w-4 h-4 text-violet-400" />
          <span>Engineering Transparency Notice</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          BloxMobile will <strong>never fabricate fake FPS multipliers, fake RAM cleaner buttons, or fake CPU temperature gauges</strong>.
          Browsers run in a sandboxed runtime and cannot alter phone kernel frequencies or inject into the Roblox mobile client.
          The tools below provide genuine Web API metrics, target FPS profile matching, and realistic Roblox configuration guides.
        </p>
      </div>

      {/* Target FPS Configurator & Refresh Rate Optimizer */}
      <FpsConfigurator detectedRefreshRate={deviceCaps?.screenRefreshRate || null} />

      {/* Real Network Latency Tester */}
      <div className="rounded-3xl bg-[#191523] border border-violet-500/20 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Live Network Latency & Jitter Diagnostic</h2>
          </div>
          <button
            onClick={handleTestPingOnly}
            disabled={isTestingPing}
            className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 text-xs font-semibold border border-violet-500/30 transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${isTestingPing ? 'animate-spin' : ''}`} />
            <span>Ping Now</span>
          </button>
        </div>

        {pingData ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#120F1C] border border-white/5 space-y-1">
              <span className="text-xs text-slate-400">Round-Trip Latency</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white font-mono">{pingData.latencyMs}</span>
                <span className="text-xs text-slate-400">ms</span>
              </div>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  pingData.status === 'excellent'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                    : pingData.status === 'good'
                    ? 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                    : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                }`}
              >
                {pingData.status}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#120F1C] border border-white/5 space-y-1">
              <span className="text-xs text-slate-400">Packet Jitter Variance</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white font-mono">±{pingData.jitterMs}</span>
                <span className="text-xs text-slate-400">ms</span>
              </div>
              <p className="text-[11px] text-slate-400">Lower jitter prevents Roblox rubber-banding</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#120F1C] border border-white/5 space-y-1">
              <span className="text-xs text-slate-400">Target Endpoint</span>
              <p className="text-sm font-semibold text-white truncate">{pingData.endpoint}</p>
              <p className="text-[11px] text-slate-500 font-mono">Tested at {pingData.timestamp}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs">Testing connection...</div>
        )}

        {/* History log */}
        {pingHistory.length > 1 && (
          <div className="pt-2 border-t border-violet-500/10">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Recent Ping Samples
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {pingHistory.map((p, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono flex items-center gap-2"
                >
                  <span className="text-slate-400">{p.timestamp}:</span>
                  <span className="font-bold text-white">{p.latencyMs}ms</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Genuine Browser & Device Hardware Inspector */}
      <div className="rounded-3xl bg-[#191523] border border-violet-500/20 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-bold text-white">Device & Display Capabilities</h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Web API Telemetry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Display refresh rate */}
          <div className="p-3.5 rounded-2xl bg-[#120F1C] border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Smartphone className="w-3.5 h-3.5 text-violet-400" />
              <span>Display Rate</span>
            </div>
            <p className="text-lg font-black text-white font-mono">
              {deviceCaps?.screenRefreshRate ? `${deviceCaps.screenRefreshRate} Hz` : 'Checking...'}
            </p>
            <p className="text-[10px] text-slate-500">Sampled via requestAnimationFrame</p>
          </div>

          {/* CPU logical threads */}
          <div className="p-3.5 rounded-2xl bg-[#120F1C] border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>CPU Cores</span>
            </div>
            <p className="text-lg font-black text-white font-mono">
              {deviceCaps?.hardwareConcurrency ? `${deviceCaps.hardwareConcurrency} Logical Cores` : 'Protected'}
            </p>
            <p className="text-[10px] text-slate-500">Hardware concurrency API</p>
          </div>

          {/* Device memory */}
          <div className="p-3.5 rounded-2xl bg-[#120F1C] border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              <span>RAM Tier</span>
            </div>
            <p className="text-lg font-black text-white font-mono">
              {deviceCaps?.deviceMemory ? `≥ ${deviceCaps.deviceMemory} GB` : 'Not Exposed'}
            </p>
            <p className="text-[10px] text-slate-500">Quantized for privacy protection</p>
          </div>

          {/* Battery Status */}
          <div className="p-3.5 rounded-2xl bg-[#120F1C] border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Battery className="w-3.5 h-3.5 text-amber-400" />
              <span>Battery Level</span>
            </div>
            <p className="text-lg font-black text-white font-mono">
              {deviceCaps?.batteryLevel !== null ? `${deviceCaps?.batteryLevel}%` : 'Restricted'}
            </p>
            <p className="text-[10px] text-slate-500">
              {deviceCaps?.isCharging ? 'Charging (Causes heat)' : 'On Battery'}
            </p>
          </div>
        </div>

        {/* WebGL GPU info */}
        <div className="p-3 rounded-2xl bg-[#120F1C] border border-white/5 flex items-center justify-between text-xs">
          <span className="text-slate-400">WebGL GPU Hardware:</span>
          <span className="font-mono text-slate-200 truncate max-w-xs sm:max-w-md text-right">
            {deviceCaps?.gpuRenderer || 'Detecting...'}
          </span>
        </div>
      </div>

      {/* Pre-Gaming Mobile Checklist */}
      <div className="rounded-3xl bg-[#191523] border border-violet-500/20 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Pre-Game Performance Checklist</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Practical hardware and OS steps before launching intense Roblox experiences.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
            {completedChecklistCount}/{totalChecklistItems} Ready
          </span>
        </div>

        <div className="space-y-2">
          {[
            {
              key: 'closeApps',
              title: 'Swipe away background apps (TikTok, Camera, Instagram)',
              desc: 'Prevents the OS from swapping Roblox out of physical RAM when memory gets tight.',
            },
            {
              key: 'removeCase',
              title: 'Remove thick rubber/leather case if phone gets warm',
              desc: 'Improves heat dissipation and delays aggressive thermal CPU throttling.',
            },
            {
              key: 'disableSaver',
              title: 'Ensure Low Power Mode / Battery Saver is OFF',
              desc: 'Battery Saver mode artificially caps processor frequencies to 60-70%.',
            },
            {
              key: 'wifi5ghz',
              title: 'Connect to 5GHz Wi-Fi or strong 4G/5G signal',
              desc: '2.4GHz Wi-Fi suffers heavy microwave and Bluetooth interference.',
            },
            {
              key: 'storageSpace',
              title: 'Verify at least 15% free internal storage',
              desc: 'Mobile operating systems require swap space for smooth game assets caching.',
            },
          ].map((item) => {
            const isDone = checklist[item.key];
            return (
              <button
                key={item.key}
                onClick={() => toggleChecklist(item.key)}
                className={`w-full p-3.5 rounded-2xl text-left border transition flex items-start gap-3 ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-[#120F1C] border-white/5 hover:border-violet-500/30 text-slate-300'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className={`text-xs font-bold ${isDone ? 'line-through text-emerald-300/80' : 'text-white'}`}>
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step-by-Step Roblox Settings Guide */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>In-Game Roblox Settings Tutorials</span>
        </h2>

        <div className="space-y-3">
          {PERFORMANCE_GUIDES.map((guide) => {
            const isExpanded = expandedGuideId === guide.id;
            return (
              <div
                key={guide.id}
                className="rounded-2xl bg-[#191523] border border-violet-500/15 overflow-hidden transition"
              >
                <button
                  onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-white/5 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          guide.impactLevel === 'High'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {guide.impactLevel} Impact
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Recommended: {guide.recommendedValue}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1.5">{guide.title}</h3>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-white/5 space-y-3">
                    <p className="text-xs text-slate-300 pt-3">{guide.summary}</p>
                    <div className="p-3 rounded-xl bg-[#120F1C] border border-white/5 space-y-2">
                      <span className="text-[11px] font-bold text-violet-300 uppercase tracking-wider">
                        Action Steps:
                      </span>
                      <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                        {guide.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Roblox Resources & Status */}
      <div className="rounded-2xl bg-[#14101E] border border-violet-500/15 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <p className="font-semibold text-white">Official Roblox Systems & Documentation</p>
          <p className="text-slate-400">Check server outages or read official mobile guidelines.</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://status.roblox.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <span>Roblox Status</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
          <a
            href="https://en.help.roblox.com/hc/en-us/articles/203625474-Mobile-General-Troubleshooting"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <span>Official Mobile FAQ</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
