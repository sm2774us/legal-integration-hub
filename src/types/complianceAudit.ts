export interface ComplianceAuditLog {
  id: string;
  timestamp: string;
  eventType: 'ETHICAL_WALL_BREACH_ATTEMPT' | 'PURVIEW_LABEL_UPGRADE' | 'COPILOT_GROUNDING_BLOCKED' | 'DMS_EXPORT_INTERCEPTED' | 'M365_GROUP_ACCESS_DENIED';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  actorName: string;
  actorEmail: string;
  matterNumber: string;
  matterName: string;
  resourceName: string;
  actionTaken: 'Blocked & Audited' | 'Quarantined' | 'Sensitivity Label Elevated' | 'SecOps Alert Dispatched';
  details: string;
  sourceIp: string;
  geoOffice: 'Houston' | 'Atlanta COE' | 'Austin' | 'Dallas' | 'New York' | 'London' | 'Frankfurt' | 'Singapore' | 'Tokyo' | 'San Francisco' | string;
  purviewRuleId: string;
}

export const INITIAL_AUDIT_LOGS: ComplianceAuditLog[] = [
  {
    id: 'AUD-9021',
    timestamp: '2026-09-25T20:05:14Z',
    eventType: 'ETHICAL_WALL_BREACH_ATTEMPT',
    severity: 'CRITICAL',
    actorName: 'Robert Sterling, Esq.',
    actorEmail: 'robert.sterling@gtlaw.com',
    matterNumber: 'GT-2026-8841',
    matterName: 'Project Silicon Sovereign ($4.8B Acquisition)',
    resourceName: 'WS-APEX-8841 / Merger_Agreement_v7.4_Execution.docx',
    actionTaken: 'Blocked & Audited',
    details: 'ABA Model Rule 1.10 Ethical Wall screen active. User attempted direct REST API sync from iManage Work 10.',
    sourceIp: '165.225.242.18',
    geoOffice: 'Houston',
    purviewRuleId: 'IB-WALL-ABA-1.10-APEX'
  },
  {
    id: 'AUD-9020',
    timestamp: '2026-09-25T19:58:30Z',
    eventType: 'COPILOT_GROUNDING_BLOCKED',
    severity: 'HIGH',
    actorName: 'Marcus Vance, Esq.',
    actorEmail: 'marcus.vance@gtlaw.com',
    matterNumber: 'GT-2026-8841',
    matterName: 'Project Silicon Sovereign ($4.8B Acquisition)',
    resourceName: 'CFIUS_National_Security_Risk_Mitigation_Plan.pdf',
    actionTaken: 'Quarantined',
    details: 'M365 Copilot grounding attempt blocked by Purview DLP: Unredacted national security EUV lithography export data detected.',
    sourceIp: '165.225.240.104',
    geoOffice: 'Austin',
    purviewRuleId: 'PURVIEW-DLP-MNPI-CFIUS'
  },
  {
    id: 'AUD-9019',
    timestamp: '2026-09-25T19:42:11Z',
    eventType: 'PURVIEW_LABEL_UPGRADE',
    severity: 'MEDIUM',
    actorName: 'Patricia O\'Connor, Esq.',
    actorEmail: 'patricia.oconnor@gtlaw.com',
    matterNumber: 'GT-2026-9102',
    matterName: 'DOJ & SEC Inquiry into Algorithmic High-Frequency Arbitrage',
    resourceName: 'Internal_Audit_Algorithmic_Execution_Logs.docx',
    actionTaken: 'Sensitivity Label Elevated',
    details: 'Automated labeling agent upgraded file from "Confidential" to "Highly Confidential (MNPI)" after detecting employee SSNs and dark pool order latency numbers.',
    sourceIp: '165.225.242.75',
    geoOffice: 'Atlanta COE',
    purviewRuleId: 'AUTO-LABEL-FINRA-SSN'
  },
  {
    id: 'AUD-9018',
    timestamp: '2026-09-25T19:30:05Z',
    eventType: 'M365_GROUP_ACCESS_DENIED',
    severity: 'CRITICAL',
    actorName: 'David Chen, Esq.',
    actorEmail: 'david.chen@gtlaw.com',
    matterNumber: 'GT-2026-7729',
    matterName: 'BioVax Patent Infringement Defense vs. GenHelix',
    resourceName: 'Teams Channel: m365-teams-biopharma-7729',
    actionTaken: 'Blocked & Audited',
    details: 'Entra ID Information Barrier policy blocked user from joining Teams deal room due to prior GenHelix patent prosecution screen.',
    sourceIp: '165.225.242.90',
    geoOffice: 'Dallas',
    purviewRuleId: 'IB-TEAMS-GENHELIX-SCREEN'
  },
  {
    id: 'AUD-9017',
    timestamp: '2026-09-25T19:15:40Z',
    eventType: 'DMS_EXPORT_INTERCEPTED',
    severity: 'HIGH',
    actorName: 'Katherine Miller, Esq.',
    actorEmail: 'katherine.miller@gtlaw.com',
    matterNumber: 'GT-2026-8841',
    matterName: 'Project Silicon Sovereign ($4.8B Acquisition)',
    resourceName: 'Apex_Q4_Pro_Forma_Balance_Sheet.xlsx',
    actionTaken: 'SecOps Alert Dispatched',
    details: 'Power Automate export pipeline intercepted download attempt to personal OneDrive. DLP incident ticket SecOps-78192 raised.',
    sourceIp: '165.225.240.210',
    geoOffice: 'Houston',
    purviewRuleId: 'DLP-EXFIL-ONEDRIVE-PREVENT'
  }
];
