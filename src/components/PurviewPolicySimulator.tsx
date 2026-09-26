import React from 'react';
import {
  PolicySimulationState,
  PurviewPolicyTriggers,
  StrictnessPreset,
  PRESET_CONFIGS,
  TRIGGER_METADATA,
  calculateSimulationProjections
} from '../types/policySimulation';
import {
  Sliders,
  ShieldAlert,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Lock,
  Radio,
  FileCheck
} from 'lucide-react';

interface PurviewPolicySimulatorProps {
  simulationState: PolicySimulationState;
  onUpdateState: (newState: PolicySimulationState) => void;
  onReset: () => void;
}

export const PurviewPolicySimulator: React.FC<PurviewPolicySimulatorProps> = ({
  simulationState,
  onUpdateState,
  onReset
}) => {
  const projections = calculateSimulationProjections(simulationState);

  const handlePresetSelect = (preset: StrictnessPreset) => {
    if (preset === 'CUSTOM') {
      onUpdateState({
        ...simulationState,
        preset: 'CUSTOM'
      });
      return;
    }

    const config = PRESET_CONFIGS[preset];
    onUpdateState({
      ...simulationState,
      preset,
      strictnessMultiplier: config.strictnessMultiplier,
      triggers: { ...config.triggers }
    });
  };

  const handleToggleTrigger = (triggerKey: keyof PurviewPolicyTriggers) => {
    const newTriggers = {
      ...simulationState.triggers,
      [triggerKey]: !simulationState.triggers[triggerKey]
    };
    onUpdateState({
      ...simulationState,
      preset: 'CUSTOM',
      triggers: newTriggers
    });
  };

  const handleMultiplierChange = (multiplier: number) => {
    onUpdateState({
      ...simulationState,
      preset: 'CUSTOM',
      strictnessMultiplier: multiplier
    });
  };

  const handleToggleLiveFeed = () => {
    onUpdateState({
      ...simulationState,
      isActiveInLiveStream: !simulationState.isActiveInLiveStream
    });
  };

  return (
    <div className="border border-sky-500/30 bg-slate-900/90 rounded-xl p-5 md:p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold font-mono text-sky-300 uppercase tracking-wide">
              Microsoft Purview DLP Policy Strictness & Impact Simulator
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
              Hypothetical Modeling
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Model hypothetical DLP rule activations and threshold strictness to project alert volume, SecOps triage workload, and false positive overhead before rolling out changes to the live tenant.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Toggle Live Stream Injection */}
          <button
            onClick={handleToggleLiveFeed}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              simulationState.isActiveInLiveStream
                ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-sm animate-pulse'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${simulationState.isActiveInLiveStream ? 'text-sky-400' : 'text-slate-500'}`} />
            <span>
              {simulationState.isActiveInLiveStream ? 'LIVE STREAM INJECTION: ON' : 'SIMULATE IN LIVE STREAM'}
            </span>
          </button>

          <button
            onClick={onReset}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
          <span className="font-semibold">POLICY STRICTNESS PRESETS:</span>
          <span className="text-slate-400 text-[11px]">Active Mode: <strong className="text-sky-300">{PRESET_CONFIGS[simulationState.preset].name}</strong></span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {(['PERMISSIVE', 'STANDARD', 'REGULATORY', 'ZERO_TRUST'] as StrictnessPreset[]).map(presetKey => {
            const preset = PRESET_CONFIGS[presetKey];
            const isSelected = simulationState.preset === presetKey;

            return (
              <button
                key={presetKey}
                onClick={() => handlePresetSelect(presetKey)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer font-mono ${
                  isSelected
                    ? 'bg-sky-950/60 border-sky-500 text-sky-200 ring-1 ring-sky-500 shadow-md'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-sky-300' : 'text-slate-300'}`}>
                    {preset.name.split(' (')[0]}
                  </span>
                  <span className="text-[10px] opacity-75 font-mono">{preset.strictnessMultiplier}x</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 font-sans">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Strictness Multiplier Slider */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>GLOBAL POLICY STRICTNESS TUNING MULTIPLIER:</span>
          </span>
          <span className="text-sky-300 font-bold px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
            {Math.round(simulationState.strictnessMultiplier * 100)}% ({simulationState.strictnessMultiplier}x baseline)
          </span>
        </div>

        <input
          type="range"
          min="0.5"
          max="2.5"
          step="0.05"
          value={simulationState.strictnessMultiplier}
          onChange={e => handleMultiplierChange(parseFloat(e.target.value))}
          className="w-full accent-sky-500 cursor-pointer"
        />

        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>0.5x (Permissive Audit Only)</span>
          <span>1.0x (Standard Baseline)</span>
          <span>1.5x (Strict ABA Enforcement)</span>
          <span>2.5x (Zero-Trust Lockdown)</span>
        </div>
      </div>

      {/* Real-Time Impact Projections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {/* Metric 1: Projected Volume */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>PROJECTED ALERTS/DAY</span>
            <span className="text-slate-500">Base: {projections.baselineDailyAlerts}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{projections.projectedDailyAlerts}</span>
            <span
              className={`text-xs font-bold ${
                projections.deltaPercentage > 0
                  ? 'text-rose-400'
                  : projections.deltaPercentage < 0
                  ? 'text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              {projections.deltaPercentage > 0 ? `+${projections.deltaPercentage}%` : `${projections.deltaPercentage}%`}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            Estimated daily incident load under current trigger set.
          </p>
        </div>

        {/* Metric 2: Severity Distribution */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] block">PROJECTED SEVERITY SHIFT</span>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-rose-400">Critical: <strong>{projections.criticalAlerts}</strong></span>
            <span className="text-amber-400">Warning: <strong>{projections.warningAlerts}</strong></span>
            <span className="text-sky-400">Info: <strong>{projections.infoAlerts}</strong></span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex mt-1.5">
            <div
              className="bg-rose-500 h-full"
              style={{ width: `${(projections.criticalAlerts / projections.projectedDailyAlerts) * 100}%` }}
            />
            <div
              className="bg-amber-500 h-full"
              style={{ width: `${(projections.warningAlerts / projections.projectedDailyAlerts) * 100}%` }}
            />
            <div
              className="bg-sky-500 h-full"
              style={{ width: `${(projections.infoAlerts / projections.projectedDailyAlerts) * 100}%` }}
            />
          </div>
        </div>

        {/* Metric 3: SecOps Workload & Analyst Hours */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>TRIAGE WORKLOAD</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                projections.alertFatigueLevel === 'CRITICAL'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : projections.alertFatigueLevel === 'ELEVATED'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {projections.alertFatigueLevel} FATIGUE
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {projections.analystHoursPerDay} <span className="text-xs font-normal text-slate-400">hrs/day</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            Requires ~{Math.ceil(projections.analystHoursPerDay / 6)} full-time SecOps compliance reviewers.
          </p>
        </div>

        {/* Metric 4: False Positive Estimate */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>EST. FALSE POSITIVES</span>
            <span className="text-slate-500">Quarantine: {projections.projectedQuarantinedFiles} files</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{projections.estimatedFalsePositiveRate}%</span>
            <span className="text-[10px] text-slate-400">of triggers</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            Attorney exception request volume estimated at {Math.round(projections.projectedDailyAlerts * (projections.estimatedFalsePositiveRate / 100))}/day.
          </p>
        </div>
      </div>

      {/* Hypothetical Purview Policy Triggers List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>HYPOTHETICAL PURVIEW DLP POLICY TRIGGERS:</span>
          </span>
          <span className="text-slate-400 text-[11px]">
            Toggle individual controls to test alert elasticity
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(Object.keys(TRIGGER_METADATA) as Array<keyof PurviewPolicyTriggers>).map(key => {
            const meta = TRIGGER_METADATA[key];
            const isEnabled = simulationState.triggers[key];

            return (
              <div
                key={key}
                onClick={() => handleToggleTrigger(key)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs font-mono space-y-2 select-none ${
                  isEnabled
                    ? 'bg-slate-950 border-sky-500/60 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 opacity-65'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => {}} // handled by div click
                      className="accent-sky-500 w-4 h-4 rounded mt-0.5 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isEnabled ? 'text-slate-100' : 'text-slate-400'}`}>
                          {meta.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        Rule: {meta.ruleCode}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                      isEnabled
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                        : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    +{meta.volumeImpactPercentage}% Vol
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 font-sans pl-6">
                  {meta.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-sky-400" />
          <span>
            {simulationState.isActiveInLiveStream
              ? 'Simulation active: Synthetic Purview DLP telemetry injecting at projected rates.'
              : 'Simulation in modeling mode: Live telemetry reflects baseline streaming.'}
          </span>
        </div>
        <span className="text-slate-500">
          Target Tenant: LexisMatrix Purview Multi-Tenant Hub
        </span>
      </div>
    </div>
  );
};
