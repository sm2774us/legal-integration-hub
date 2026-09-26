export interface AccessHeatmapCell {
  dayIndex: number; // 0 = Mon, 6 = Sun
  dayName: string; // 'Mon', 'Tue', etc.
  hour: number; // 0 to 23
  hourLabel: string; // '00:00', '01:00', etc.
  accessCount: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  topMatter: string;
  topMatterNumber: string;
  topActor: string;
  isAnomaly: boolean;
  anomalyDescription?: string;
  displayCount?: number;
}

export interface HeatmapFilterOptions {
  severity: 'ALL' | 'CRITICAL' | 'WARNING';
  highlightAnomaliesOnly: boolean;
}

export function generateAccessHeatmapData(): AccessHeatmapCell[] {
  const days = [
    { index: 0, name: 'Mon' },
    { index: 1, name: 'Tue' },
    { index: 2, name: 'Wed' },
    { index: 3, name: 'Thu' },
    { index: 4, name: 'Fri' },
    { index: 5, name: 'Sat' },
    { index: 6, name: 'Sun' }
  ];

  const matters = [
    { num: 'GT-2026-8841', name: 'Project Silicon Sovereign ($4.8B Acquisition)' },
    { num: 'GT-2026-9102', name: 'SEC & DOJ Algorithmic Trading Defense' },
    { num: 'GT-2026-7319', name: 'Pfizer Bio-Pharma Patent Licensing' },
    { num: 'GT-2026-6420', name: 'Cross-Border Sovereign Debt Restructuring' }
  ];

  const actors = [
    'Robert Sterling, Esq.',
    'Katherine Miller, Esq.',
    'David Chen, Esq.',
    'Arthur Pendelton, Esq.',
    'Liam Gallagher, Esq.',
    'Elena Rostova, Esq.'
  ];

  const cells: AccessHeatmapCell[] = [];

  for (const day of days) {
    for (let hour = 0; hour < 24; hour++) {
      const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
      const isWeekend = day.index >= 5;
      const isBusinessHours = hour >= 8 && hour <= 18;

      let baseCount = 0;
      let critical = 0;
      let warning = 0;
      let info = 0;
      let isAnomaly = false;
      let anomalyDescription: string | undefined = undefined;

      // Realistic business access profile
      if (isBusinessHours) {
        if (!isWeekend) {
          // Regular workday peak: 20-55 accesses
          baseCount = Math.floor(18 + Math.random() * 32);
          critical = Math.random() > 0.6 ? Math.floor(1 + Math.random() * 2) : 0;
          warning = Math.floor(2 + Math.random() * 6);
          info = baseCount - critical - warning;
        } else {
          // Weekend daytime: 4-12 accesses
          baseCount = Math.floor(3 + Math.random() * 9);
          warning = Math.floor(Math.random() * 3);
          critical = Math.random() > 0.8 ? 1 : 0;
          info = baseCount - critical - warning;
        }
      } else {
        // Off-hours baseline: 1-6 accesses
        baseCount = Math.floor(1 + Math.random() * 5);
        warning = Math.random() > 0.7 ? 1 : 0;
        critical = 0;
        info = baseCount - warning;
      }

      // Specific known suspicious hotspots & anomalies to help compliance auditors
      // 1. Tuesday 02:00 - 03:00: Critical Ethical Wall probe spike from foreign IP
      if (day.index === 1 && hour === 2) {
        baseCount = 38;
        critical = 14;
        warning = 12;
        info = 12;
        isAnomaly = true;
        anomalyDescription = 'CRITICAL ANOMALY: Off-hours surge (38 attempts, 14 ethical wall breaches). Origin: Unapproved IP probing Project Silicon Sovereign merger drafts.';
      }

      // 2. Tuesday 03:00: Continuation of breach attempt
      if (day.index === 1 && hour === 3) {
        baseCount = 29;
        critical = 9;
        warning = 11;
        info = 9;
        isAnomaly = true;
        anomalyDescription = 'SUSPICIOUS ACTIVITY: Off-hours automated script querying iManage REST APIs during maintenance window.';
      }

      // 3. Friday 23:00 - 00:00: Suspicious bulk exfiltration attempt before weekend
      if (day.index === 4 && hour === 23) {
        baseCount = 44;
        critical = 11;
        warning = 18;
        info = 15;
        isAnomaly = true;
        anomalyDescription = 'DATA LOSS RISK: Rapid burst of 44 document downloads on restricted antitrust defense matter at 11:00 PM Friday.';
      }

      // 4. Thursday 14:00: Major M&A filing surge (High volume business spike)
      if (day.index === 3 && hour === 14) {
        baseCount = 68;
        critical = 4;
        warning = 19;
        info = 45;
        isAnomaly = true;
        anomalyDescription = 'REGULATORY PEAK: High-concurrency access peak (68 events) aligning with CFIUS pre-closing filing deadline.';
      }

      // 5. Sunday 04:00: Unauthorized Copilot Studio batch grounding test
      if (day.index === 6 && hour === 4) {
        baseCount = 24;
        critical = 6;
        warning = 14;
        info = 4;
        isAnomaly = true;
        anomalyDescription = 'UNUSUAL TRAFFIC: Unscheduled Copilot Studio AI batch indexing on sealed SEC investigation records.';
      }

      const matterObj = matters[(day.index + hour) % matters.length];
      const actorName = isAnomaly && (day.index === 1 || day.index === 4) 
        ? 'David Chen, Esq. [Remote Credential]' 
        : actors[(day.index * 3 + hour) % actors.length];

      cells.push({
        dayIndex: day.index,
        dayName: day.name,
        hour,
        hourLabel,
        accessCount: baseCount,
        criticalCount: critical,
        warningCount: warning,
        infoCount: Math.max(0, info),
        topMatter: matterObj.name,
        topMatterNumber: matterObj.num,
        topActor: actorName,
        isAnomaly,
        anomalyDescription
      });
    }
  }

  return cells;
}
