export interface PurviewPolicyTriggers {
  strictAbaEthicalScreen: boolean;
  aggressiveMnpiScanning: boolean;
  copilotAiGroundingBlock: boolean;
  cfiusGeofenceQuarantine: boolean;
  offHoursBulkExportGuard: boolean;
  dynamicWatermarkOnElevation: boolean;
  unmanagedDeviceBlock: boolean;
}

export type StrictnessPreset = 'PERMISSIVE' | 'STANDARD' | 'REGULATORY' | 'ZERO_TRUST' | 'CUSTOM';

export interface PolicySimulationState {
  preset: StrictnessPreset;
  strictnessMultiplier: number; // 0.5 to 2.5 (1.0 = baseline 100%)
  triggers: PurviewPolicyTriggers;
  isActiveInLiveStream: boolean; // if true, simulation directly affects live feed in dashboard
}

export interface SimulationProjectionMetrics {
  baselineDailyAlerts: number;
  projectedDailyAlerts: number;
  deltaPercentage: number;
  criticalAlerts: number;
  warningAlerts: number;
  infoAlerts: number;
  estimatedFalsePositiveRate: number; // percentage
  analystHoursPerDay: number;
  alertFatigueLevel: 'LOW' | 'OPTIMAL' | 'ELEVATED' | 'CRITICAL';
  projectedQuarantinedFiles: number;
}

export const PRESET_CONFIGS: Record<StrictnessPreset, {
  name: string;
  description: string;
  strictnessMultiplier: number;
  triggers: PurviewPolicyTriggers;
}> = {
  PERMISSIVE: {
    name: 'Permissive (Audit-Only)',
    description: 'Logging mode with zero active blockers; maximum user convenience, high audit liability.',
    strictnessMultiplier: 0.6,
    triggers: {
      strictAbaEthicalScreen: false,
      aggressiveMnpiScanning: false,
      copilotAiGroundingBlock: false,
      cfiusGeofenceQuarantine: false,
      offHoursBulkExportGuard: false,
      dynamicWatermarkOnElevation: false,
      unmanagedDeviceBlock: false
    }
  },
  STANDARD: {
    name: 'Standard Enterprise (Current Baseline)',
    description: 'Standard firm configuration with balanced ABA 1.10 enforcement and moderate DLP keywords.',
    strictnessMultiplier: 1.0,
    triggers: {
      strictAbaEthicalScreen: true,
      aggressiveMnpiScanning: false,
      copilotAiGroundingBlock: true,
      cfiusGeofenceQuarantine: false,
      offHoursBulkExportGuard: true,
      dynamicWatermarkOnElevation: false,
      unmanagedDeviceBlock: true
    }
  },
  REGULATORY: {
    name: 'Strict Regulatory & FINRA / CFIUS (Recommended)',
    description: 'Zero-tolerance cross-practice ethical screens, rigorous SEC Rule 10b-5 MNPI scanning, and geofencing.',
    strictnessMultiplier: 1.45,
    triggers: {
      strictAbaEthicalScreen: true,
      aggressiveMnpiScanning: true,
      copilotAiGroundingBlock: true,
      cfiusGeofenceQuarantine: true,
      offHoursBulkExportGuard: true,
      dynamicWatermarkOnElevation: true,
      unmanagedDeviceBlock: true
    }
  },
  ZERO_TRUST: {
    name: 'Maximum Zero-Trust (Red-Team Quarantine)',
    description: 'Aggressive isolation mode; immediate quarantine on any anomaly, pre-prompt Copilot vector lockout.',
    strictnessMultiplier: 2.1,
    triggers: {
      strictAbaEthicalScreen: true,
      aggressiveMnpiScanning: true,
      copilotAiGroundingBlock: true,
      cfiusGeofenceQuarantine: true,
      offHoursBulkExportGuard: true,
      dynamicWatermarkOnElevation: true,
      unmanagedDeviceBlock: true
    }
  },
  CUSTOM: {
    name: 'Custom Interactive Setting',
    description: 'User-configured policy toggles and precision strictness tuning slider.',
    strictnessMultiplier: 1.25,
    triggers: {
      strictAbaEthicalScreen: true,
      aggressiveMnpiScanning: true,
      copilotAiGroundingBlock: false,
      cfiusGeofenceQuarantine: true,
      offHoursBulkExportGuard: true,
      dynamicWatermarkOnElevation: false,
      unmanagedDeviceBlock: true
    }
  }
};

export const TRIGGER_METADATA: Record<keyof PurviewPolicyTriggers, {
  label: string;
  category: 'ETHICAL_WALL' | 'MNPI_DLP' | 'AI_COPILOT' | 'PERIMETER';
  ruleCode: string;
  volumeImpactPercentage: number;
  description: string;
  falsePositiveDelta: number;
}> = {
  strictAbaEthicalScreen: {
    label: 'Strict ABA Model Rule 1.10 Zero-Tolerance Screen',
    category: 'ETHICAL_WALL',
    ruleCode: 'IB-WALL-ABA-1.10-STRICT',
    volumeImpactPercentage: 38,
    description: 'Immediately block and log all cross-practice matter queries without verified written conflict waivers.',
    falsePositiveDelta: 3.5
  },
  aggressiveMnpiScanning: {
    label: 'Aggressive SEC 10b-5 MNPI & Deal Codename Scanner',
    category: 'MNPI_DLP',
    ruleCode: 'PURVIEW-DLP-MNPI-AGGRESSIVE',
    volumeImpactPercentage: 54,
    description: 'Lower keyword confidence threshold (65%+) for Material Non-Public Information and unannounced M&A targets.',
    falsePositiveDelta: 9.8
  },
  copilotAiGroundingBlock: {
    label: 'Copilot Studio Semantic Vector Grounding Interceptor',
    category: 'AI_COPILOT',
    ruleCode: 'COPILOT-AI-RESTRICT-VECT',
    volumeImpactPercentage: 45,
    description: 'Halt generative embeddings and RAG lookups across all matters marked with Ethical Wall boundaries.',
    falsePositiveDelta: 4.2
  },
  cfiusGeofenceQuarantine: {
    label: 'CFIUS & Geofence International Access Quarantine',
    category: 'PERIMETER',
    ruleCode: 'PURVIEW-GEO-CFIUS-QUARANTINE',
    volumeImpactPercentage: 29,
    description: 'Quarantine access to national security and defense matters originating outside verified US/UK security enclaves.',
    falsePositiveDelta: 2.1
  },
  offHoursBulkExportGuard: {
    label: 'Off-Hours Exfiltration Guard (8 PM - 6 AM Local)',
    category: 'PERIMETER',
    ruleCode: 'PURVIEW-ANOMALY-OFFHOURS-BULK',
    volumeImpactPercentage: 26,
    description: 'Flag anomalous batch queries (>3 documents/10 min) occurring during non-business hours.',
    falsePositiveDelta: 5.0
  },
  dynamicWatermarkOnElevation: {
    label: 'Dynamic Mandated Watermarking & Link Revocation',
    category: 'MNPI_DLP',
    ruleCode: 'PURVIEW-DLP-WATERMARK-REVOKE',
    volumeImpactPercentage: 22,
    description: 'Force dynamic encrypted legal watermarking and revoke anonymous guest links upon label elevation.',
    falsePositiveDelta: 1.8
  },
  unmanagedDeviceBlock: {
    label: 'Unmanaged Endpoint & Shadow Cloud Sync Interceptor',
    category: 'PERIMETER',
    ruleCode: 'ENTRA-CONDITIONAL-UNMANAGED-DEV',
    volumeImpactPercentage: 31,
    description: 'Block downloads from unmanaged BYOD endpoints, personal OneDrive, Box, or unauthorized USB drives.',
    falsePositiveDelta: 3.2
  }
};

export function calculateSimulationProjections(state: PolicySimulationState): SimulationProjectionMetrics {
  const BASELINE_DAILY_ALERTS = 142; // standard baseline across firm tenants

  // Calculate cumulative impact from enabled triggers
  let triggerImpactSum = 0;
  let falsePositiveBase = 4.2;

  (Object.keys(state.triggers) as Array<keyof PurviewPolicyTriggers>).forEach(key => {
    if (state.triggers[key]) {
      triggerImpactSum += TRIGGER_METADATA[key].volumeImpactPercentage;
      falsePositiveBase += TRIGGER_METADATA[key].falsePositiveDelta;
    }
  });

  // Calculate projected alerts factoring in strictnessMultiplier
  // Base formula: Baseline * (1 + (triggerImpactSum / 100)) * strictnessMultiplier
  const multiplier = state.strictnessMultiplier;
  const growthFactor = (triggerImpactSum / 100) * 0.75; // normalized scaling
  const projectedTotal = Math.round(BASELINE_DAILY_ALERTS * (1 + growthFactor) * multiplier);

  const deltaPercentage = Math.round(((projectedTotal - BASELINE_DAILY_ALERTS) / BASELINE_DAILY_ALERTS) * 100);

  // Distribution changes under stricter policies
  const criticalWeight = state.triggers.strictAbaEthicalScreen || state.triggers.cfiusGeofenceQuarantine ? 0.32 : 0.18;
  const warningWeight = state.triggers.aggressiveMnpiScanning || state.triggers.copilotAiGroundingBlock ? 0.48 : 0.42;
  const infoWeight = Math.max(0.1, 1 - criticalWeight - warningWeight);

  const criticalAlerts = Math.round(projectedTotal * criticalWeight);
  const warningAlerts = Math.round(projectedTotal * warningWeight);
  const infoAlerts = projectedTotal - criticalAlerts - warningAlerts;

  const estimatedFalsePositiveRate = Math.min(38, Math.round(falsePositiveBase * (multiplier > 1.2 ? 1.25 : 0.9) * 10) / 10);

  // Analyst review time estimation (assume 4.5 minutes per alert review)
  const analystHoursPerDay = Math.round((projectedTotal * 4.5 / 60) * 10) / 10;

  // Fatigue level
  let alertFatigueLevel: SimulationProjectionMetrics['alertFatigueLevel'] = 'OPTIMAL';
  if (projectedTotal < 100) alertFatigueLevel = 'LOW';
  else if (projectedTotal <= 220) alertFatigueLevel = 'OPTIMAL';
  else if (projectedTotal <= 360) alertFatigueLevel = 'ELEVATED';
  else alertFatigueLevel = 'CRITICAL';

  const projectedQuarantinedFiles = Math.round(criticalAlerts * 0.85 + warningAlerts * 0.35);

  return {
    baselineDailyAlerts: BASELINE_DAILY_ALERTS,
    projectedDailyAlerts: projectedTotal,
    deltaPercentage,
    criticalAlerts,
    warningAlerts,
    infoAlerts,
    estimatedFalsePositiveRate,
    analystHoursPerDay,
    alertFatigueLevel,
    projectedQuarantinedFiles
  };
}
