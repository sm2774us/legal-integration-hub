export type LegalPracticeGroup =
  | 'Corporate M&A'
  | 'Antitrust & Competition'
  | 'Intellectual Property Litigation'
  | 'White Collar & Regulatory Enforcement'
  | 'Capital Markets'
  | 'Commercial Real Estate';

export type SensitivityLevel = 'General' | 'Confidential' | 'Highly Confidential (MNPI)' | 'Attorney-Client Privileged';

export interface LegalMatter {
  id: string;
  matterNumber: string;
  clientName: string;
  matterName: string;
  practiceGroup: LegalPracticeGroup;
  leadPartner: string;
  billingAttorney: string;
  assignedAttorneys: string[];
  restrictedAttorneys: string[]; // Ethical wall restrictions
  openedDate: string;
  status: 'Active' | 'Pending Clearance' | 'Closed' | 'Ethical Wall Audit Required';
  purviewSensitivity: SensitivityLevel;
  retentionYears: number;
  iManageWorkspaceId: string;
  sharePointSiteUrl: string;
  teamsChannelId: string;
  description: string;
}

export interface IManageDocument {
  docId: string;
  matterNumber: string;
  title: string;
  version: number;
  author: string;
  extension: 'pdf' | 'docx' | 'xlsx' | 'eml';
  fileSizeBytes: number;
  sensitivityLabel: SensitivityLevel;
  lastModified: string;
  hasMnpi: boolean;
  hasPii: boolean;
  isPrivileged: boolean;
  excerpt: string;
}

export interface EthicalWallRule {
  id: string;
  ruleCode: string;
  targetMatterId: string;
  adversaryClientName: string;
  wallType: 'Information Barrier' | 'Screened Lawyer' | 'Regulatory Quarantine';
  enactedDate: string;
  screenedPersonnel: string[];
  permittedPersonnel: string[];
  justification: string;
  auditTrail: {
    timestamp: string;
    action: string;
    actor: string;
    result: 'Allowed' | 'Blocked' | 'Flagged';
  }[];
}

export interface DlpScanResult {
  detectedLabels: SensitivityLevel[];
  hasMnpi: boolean;
  hasPii: boolean;
  hasPrivilegeKeywords: boolean;
  riskScore: 'Low' | 'Medium' | 'High' | 'Critical';
  flaggedFindings: {
    category: string;
    snippet: string;
    ruleTriggered: string;
  }[];
  recommendedPurviewLabel: SensitivityLevel;
  canExportViaCopilot: boolean;
  preventedByPurviewPolicy: boolean;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
}

export interface McpCallLog {
  id: string;
  timestamp: string;
  toolName: string;
  requestPayload: any;
  responsePayload: any;
  status: 'success' | 'blocked_by_ethical_wall' | 'dlp_violation' | 'error';
  latencyMs: number;
}

export interface CopilotStudioPluginAction {
  actionId: string;
  displayName: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST';
  requiredScopes: string[];
  inputSchema: Record<string, string>;
  outputSchema: Record<string, string>;
}
