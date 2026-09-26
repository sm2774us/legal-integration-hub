import { ComplianceAuditLog } from './complianceAudit';

export type OfficeRegion = 'AMER' | 'EMEA' | 'APAC';
export type ThreatLevel = 'CRITICAL' | 'ELEVATED' | 'LOW' | 'NOMINAL';

export interface OfficeThreatNode {
  id: string;
  name: string;
  city: string;
  country: string;
  region: OfficeRegion;
  practiceFocus: string;
  // Percentage coordinates on world map (0-100%)
  x: number; // Longitude projection on map (0 = West, 100 = East)
  y: number; // Latitude projection on map (0 = North, 100 = South)
  timeZone: string;
  activeThreatLevel: ThreatLevel;
  hasActivePulse: boolean;
  pulseType: 'critical' | 'warning' | 'info' | 'quiescent';
  lastIncident?: {
    timestamp: string;
    logId: string;
    actorName: string;
    matterNumber: string;
    resourceName: string;
    eventType: string;
    severity: string;
    actionTaken: string;
  };
  metrics: {
    criticalCount: number;
    warningCount: number;
    infoCount: number;
    totalViolations: number;
    resolvedCount: number;
  };
}

export const GLOBAL_OFFICE_REGISTRY: Omit<OfficeThreatNode, 'metrics' | 'activeThreatLevel' | 'hasActivePulse' | 'pulseType' | 'lastIncident'>[] = [
  {
    id: 'houston',
    name: 'Houston',
    city: 'Houston, TX',
    country: 'United States',
    region: 'AMER',
    practiceFocus: 'Energy, LNG Infrastructure & Cross-Border M&A',
    x: 23.5,
    y: 43.5,
    timeZone: 'CT (UTC-5)'
  },
  {
    id: 'new-york',
    name: 'New York',
    city: 'New York, NY',
    country: 'United States',
    region: 'AMER',
    practiceFocus: 'Global Finance, Capital Markets & SEC Enforcement',
    x: 29.5,
    y: 37.0,
    timeZone: 'ET (UTC-4)'
  },
  {
    id: 'london',
    name: 'London',
    city: 'London',
    country: 'United Kingdom',
    region: 'EMEA',
    practiceFocus: 'Bishopsgate / UK-EU Cross-Border & CMA Antitrust',
    x: 48.0,
    y: 31.0,
    timeZone: 'BST (UTC+1)'
  },
  {
    id: 'austin',
    name: 'Austin',
    city: 'Austin, TX',
    country: 'United States',
    region: 'AMER',
    practiceFocus: 'Silicon Hills / AI Semiconductor IP & CFIUS',
    x: 22.0,
    y: 44.5,
    timeZone: 'CT (UTC-5)'
  },
  {
    id: 'dallas',
    name: 'Dallas',
    city: 'Dallas, TX',
    country: 'United States',
    region: 'AMER',
    practiceFocus: 'Private Equity, Biopharma & Tech Litigation',
    x: 23.0,
    y: 41.5,
    timeZone: 'CT (UTC-5)'
  },
  {
    id: 'atlanta',
    name: 'Atlanta COE',
    city: 'Atlanta, GA',
    country: 'United States',
    region: 'AMER',
    practiceFocus: 'SecOps Command Center & Legal Tech Automation',
    x: 26.5,
    y: 42.0,
    timeZone: 'ET (UTC-4)'
  },
  {
    id: 'san-francisco',
    name: 'San Francisco',
    city: 'San Francisco, CA',
    country: 'United States',
    region: 'AMER',
    practiceFocus: 'Emerging Tech, AI Foundation Models & Venture IP',
    x: 16.5,
    y: 38.0,
    timeZone: 'PT (UTC-7)'
  },
  {
    id: 'frankfurt',
    name: 'Frankfurt',
    city: 'Frankfurt',
    country: 'Germany',
    region: 'EMEA',
    practiceFocus: 'EU Data Governance (GDPR), Fintech & ECB Regulatory',
    x: 51.5,
    y: 33.0,
    timeZone: 'CEST (UTC+2)'
  },
  {
    id: 'singapore',
    name: 'Singapore',
    city: 'Singapore',
    country: 'Singapore',
    region: 'APAC',
    practiceFocus: 'Marina Bay / APAC Private Wealth, Arbitration & MAS Rules',
    x: 77.5,
    y: 56.0,
    timeZone: 'SGT (UTC+8)'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    region: 'APAC',
    practiceFocus: 'Marunouchi / Cross-Border Patent Prosecution & Trade',
    x: 87.0,
    y: 39.0,
    timeZone: 'JST (UTC+9)'
  }
];

/**
 * Calculates live threat telemetry for each office node from the current audit logs and remediations
 */
export function computeOfficeThreatNodes(
  logs: ComplianceAuditLog[],
  remediations: Record<string, { status: string }> = {}
): OfficeThreatNode[] {
  return GLOBAL_OFFICE_REGISTRY.map(office => {
    // Match office name against log.geoOffice
    const officeLogs = logs.filter(log => {
      const geo = (log.geoOffice || '').toLowerCase();
      const officeName = office.name.toLowerCase();
      if (geo === officeName) return true;
      if (office.id === 'houston' && geo.includes('houston')) return true;
      if (office.id === 'austin' && geo.includes('austin')) return true;
      if (office.id === 'dallas' && geo.includes('dallas')) return true;
      if (office.id === 'atlanta' && (geo.includes('atlanta') || geo.includes('coe'))) return true;
      if (office.id === 'new-york' && (geo.includes('new york') || geo.includes('ny'))) return true;
      if (office.id === 'london' && geo.includes('london')) return true;
      if (office.id === 'san-francisco' && (geo.includes('san francisco') || geo.includes('sf'))) return true;
      if (office.id === 'frankfurt' && geo.includes('frankfurt')) return true;
      if (office.id === 'singapore' && geo.includes('singapore')) return true;
      if (office.id === 'tokyo' && geo.includes('tokyo')) return true;
      return false;
    });

    const criticalCount = officeLogs.filter(l => l.severity === 'CRITICAL').length;
    const warningCount = officeLogs.filter(l => l.severity === 'HIGH' || l.severity === 'MEDIUM').length;
    const infoCount = officeLogs.filter(l => l.severity === 'INFO').length;
    const totalViolations = officeLogs.length;

    const resolvedCount = officeLogs.filter(l => {
      const rem = remediations[l.id];
      return rem && (rem.status === 'REMEDIATED' || rem.status === 'FALSE_POSITIVE');
    }).length;

    // Latest incident in this office
    const sortedOfficeLogs = [...officeLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const latest = sortedOfficeLogs[0];

    // Determine active threat level
    let activeThreatLevel: ThreatLevel = 'NOMINAL';
    let pulseType: OfficeThreatNode['pulseType'] = 'quiescent';
    let hasActivePulse = false;

    if (criticalCount > 0) {
      activeThreatLevel = 'CRITICAL';
      pulseType = 'critical';
      hasActivePulse = true;
    } else if (warningCount >= 2) {
      activeThreatLevel = 'ELEVATED';
      pulseType = 'warning';
      hasActivePulse = true;
    } else if (warningCount === 1) {
      activeThreatLevel = 'LOW';
      pulseType = 'warning';
      hasActivePulse = true;
    } else if (infoCount > 0) {
      activeThreatLevel = 'LOW';
      pulseType = 'info';
      hasActivePulse = false;
    }

    return {
      ...office,
      activeThreatLevel,
      hasActivePulse,
      pulseType,
      lastIncident: latest
        ? {
            timestamp: latest.timestamp,
            logId: latest.id,
            actorName: latest.actorName,
            matterNumber: latest.matterNumber,
            resourceName: latest.resourceName,
            eventType: latest.eventType,
            severity: latest.severity,
            actionTaken: latest.actionTaken
          }
        : undefined,
      metrics: {
        criticalCount,
        warningCount,
        infoCount,
        totalViolations,
        resolvedCount
      }
    };
  });
}
