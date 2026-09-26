import {
  LegalMatter,
  IManageDocument,
  EthicalWallRule,
  McpToolDefinition,
  CopilotStudioPluginAction
} from '../types/legalIntegration';

export const INITIAL_MATTERS: LegalMatter[] = [
  {
    id: 'mat-8841',
    matterNumber: 'GT-2026-8841',
    clientName: 'Apex Semiconductor Corp',
    matterName: 'Project Silicon Sovereign - Cross-Border $4.8B Acquisition of QuantuMicro Ltd',
    practiceGroup: 'Corporate M&A',
    leadPartner: 'Sarah Jenkins, Esq. (Houston)',
    billingAttorney: 'Marcus Vance, Esq.',
    assignedAttorneys: ['Sarah Jenkins', 'Marcus Vance', 'David Chen', 'Elena Rostova'],
    restrictedAttorneys: ['Robert Sterling', 'Katherine Miller'], // Ethical wall due to prior QuantuMicro representation
    openedDate: '2026-02-14',
    status: 'Active',
    purviewSensitivity: 'Highly Confidential (MNPI)',
    retentionYears: 10,
    iManageWorkspaceId: 'WS-APEX-8841',
    sharePointSiteUrl: 'https://gtlaw.sharepoint.com/sites/Apex-SiliconSovereign',
    teamsChannelId: 'm365-teams-apex-8841-deal-room',
    description: 'Cross-border stock purchase agreement and CFIUS national security regulatory review for semiconductor foundry assets.'
  },
  {
    id: 'mat-7729',
    matterNumber: 'GT-2026-7729',
    clientName: 'Global Biopharma Alliance',
    matterName: 'BioVax Patent Infringement Defense vs. GenHelix Therapeutics',
    practiceGroup: 'Intellectual Property Litigation',
    leadPartner: 'Arthur Pendelton, Esq. (Atlanta COE)',
    billingAttorney: 'Alicia Keyser, Esq.',
    assignedAttorneys: ['Arthur Pendelton', 'Alicia Keyser', 'Zackary Thorne'],
    restrictedAttorneys: ['David Chen'], // Screened due to patent prosecution work for GenHelix in 2024
    openedDate: '2026-01-10',
    status: 'Active',
    purviewSensitivity: 'Attorney-Client Privileged',
    retentionYears: 15,
    iManageWorkspaceId: 'WS-BIOPH-7729',
    sharePointSiteUrl: 'https://gtlaw.sharepoint.com/sites/BioPharma-GenHelix-Lit',
    teamsChannelId: 'm365-teams-biopharma-7729',
    description: 'Hatch-Waxman Paragraph IV patent litigation defending monoclonal antibody delivery mechanism before the District of Delaware.'
  },
  {
    id: 'mat-9102',
    matterNumber: 'GT-2026-9102',
    clientName: 'Meridian Capital Partners',
    matterName: 'DOJ & SEC Inquiry into Algorithmic High-Frequency Arbitrage Routines',
    practiceGroup: 'White Collar & Regulatory Enforcement',
    leadPartner: 'Patricia O\'Connor, Esq. (Austin)',
    billingAttorney: 'Patricia O\'Connor, Esq.',
    assignedAttorneys: ['Patricia O\'Connor', 'Liam Gallagher', 'Robert Sterling'],
    restrictedAttorneys: ['Marcus Vance', 'Sarah Jenkins'], // Screened from trading desk counterparties
    openedDate: '2026-03-01',
    status: 'Active',
    purviewSensitivity: 'Highly Confidential (MNPI)',
    retentionYears: 20,
    iManageWorkspaceId: 'WS-MERID-9102',
    sharePointSiteUrl: 'https://gtlaw.sharepoint.com/sites/Meridian-Enforcement-Review',
    teamsChannelId: 'm365-teams-meridian-9102-confidential',
    description: 'Special independent internal investigation in response to FINRA/SEC voluntary request regarding sub-millisecond dark pool liquidity routing.'
  },
  {
    id: 'mat-6533',
    matterNumber: 'GT-2026-6533',
    clientName: 'Horizon Renewable Energy REIT',
    matterName: '1.2GW Solar & Battery Storage Portfolio Project Financing ($1.15B)',
    practiceGroup: 'Commercial Real Estate',
    leadPartner: 'Elena Rostova, Esq. (Dallas)',
    billingAttorney: 'Elena Rostova, Esq.',
    assignedAttorneys: ['Elena Rostova', 'Katherine Miller', 'David Chen'],
    restrictedAttorneys: [],
    openedDate: '2025-11-20',
    status: 'Active',
    purviewSensitivity: 'Confidential',
    retentionYears: 7,
    iManageWorkspaceId: 'WS-HORIZ-6533',
    sharePointSiteUrl: 'https://gtlaw.sharepoint.com/sites/Horizon-Renewable-Financing',
    teamsChannelId: 'm365-teams-horizon-6533',
    description: 'Syndicated debt credit facility, title and survey diligence across 14 utility-scale ground leases in Texas and New Mexico.'
  }
];

export const INITIAL_DOCUMENTS: IManageDocument[] = [
  {
    docId: 'IM-109241',
    matterNumber: 'GT-2026-8841',
    title: 'Merger_Agreement_Apex_QuantuMicro_v7.4_Execution_Draft.docx',
    version: 7,
    author: 'Sarah Jenkins',
    extension: 'docx',
    fileSizeBytes: 2450380,
    sensitivityLabel: 'Highly Confidential (MNPI)',
    lastModified: '2026-09-24T14:22:00Z',
    hasMnpi: true,
    hasPii: false,
    isPrivileged: true,
    excerpt: 'SECTION 4.02. Purchase Price Allocation. The aggregate purchase price payable by Parent to Sellers shall be $4,850,000,000 in cash, subject to working capital adjustments under Schedule 2.1...'
  },
  {
    docId: 'IM-109248',
    matterNumber: 'GT-2026-8841',
    title: 'CFIUS_National_Security_Risk_Mitigation_Plan.pdf',
    version: 3,
    author: 'Marcus Vance',
    extension: 'pdf',
    fileSizeBytes: 4120900,
    sensitivityLabel: 'Highly Confidential (MNPI)',
    lastModified: '2026-09-25T09:15:00Z',
    hasMnpi: true,
    hasPii: true,
    isPrivileged: true,
    excerpt: 'CONFIDENTIAL ATTORNEY WORK PRODUCT - PREPARED FOR CFIUS FILING. Analysis of sensitive dual-use EUV lithography patents and foreign equity ownership threshold screening under FIRRMA regulations...'
  },
  {
    docId: 'IM-201884',
    matterNumber: 'GT-2026-7729',
    title: 'Expert_Report_Dr_Kovacs_Prior_Art_BioVax_US9812402B2.pdf',
    version: 2,
    author: 'Arthur Pendelton',
    extension: 'pdf',
    fileSizeBytes: 8940120,
    sensitivityLabel: 'Attorney-Client Privileged',
    lastModified: '2026-09-22T17:40:00Z',
    hasMnpi: false,
    hasPii: false,
    isPrivileged: true,
    excerpt: 'ATTORNEY-CLIENT PRIVILEGED & CONFIDENTIAL. Comparative structural analysis demonstrating claim differentiation between the 2018 GenHelix priority application and asserted claims 1-14...'
  },
  {
    docId: 'IM-308191',
    matterNumber: 'GT-2026-9102',
    title: 'Internal_Audit_Algorithmic_Execution_Logs_Privileged_Memo.docx',
    version: 4,
    author: 'Patricia O\'Connor',
    extension: 'docx',
    fileSizeBytes: 1845100,
    sensitivityLabel: 'Highly Confidential (MNPI)',
    lastModified: '2026-09-25T11:05:00Z',
    hasMnpi: true,
    hasPii: true,
    isPrivileged: true,
    excerpt: 'STRICT LEGAL HOLD - DO NOT DISSEMINATE. Preliminary findings regarding latency order routing protocols during the trading window of October 14, 2025. Contains employee Social Security and Broker IDs...'
  },
  {
    docId: 'IM-402219',
    matterNumber: 'GT-2026-6533',
    title: 'Horizon_REIT_Master_Credit_Agreement_Closing_Set.pdf',
    version: 1,
    author: 'Elena Rostova',
    extension: 'pdf',
    fileSizeBytes: 6204000,
    sensitivityLabel: 'Confidential',
    lastModified: '2026-09-20T16:10:00Z',
    hasMnpi: false,
    hasPii: false,
    isPrivileged: false,
    excerpt: 'This Credit Agreement dated as of September 20, 2026 among Horizon Renewable Energy Holdings LLC, as Borrower, and the Lenders party hereto...'
  }
];

export const INITIAL_ETHICAL_WALLS: EthicalWallRule[] = [
  {
    id: 'ew-01',
    ruleCode: 'EW-APEX-QUANTUM-2026',
    targetMatterId: 'mat-8841',
    adversaryClientName: 'QuantuMicro Former Shareholders Group',
    wallType: 'Screened Lawyer',
    enactedDate: '2026-02-15',
    screenedPersonnel: ['Robert Sterling', 'Katherine Miller'],
    permittedPersonnel: ['Sarah Jenkins', 'Marcus Vance', 'David Chen', 'Elena Rostova'],
    justification: 'Attorneys Robert Sterling and Katherine Miller represented target QuantuMicro in private financing during 2023-2024. ABA Model Rule 1.10 ethical screen mandated.',
    auditTrail: [
      {
        timestamp: '2026-09-25T14:10:22Z',
        action: 'iManage Workspace Access Attempt',
        actor: 'Robert Sterling',
        result: 'Blocked'
      },
      {
        timestamp: '2026-09-25T13:45:00Z',
        action: 'M365 Copilot Document Grounding Request',
        actor: 'David Chen',
        result: 'Allowed'
      },
      {
        timestamp: '2026-09-24T18:20:11Z',
        action: 'SharePoint Document Library Query via Power Automate',
        actor: 'Katherine Miller',
        result: 'Blocked'
      }
    ]
  },
  {
    id: 'ew-02',
    ruleCode: 'EW-BIOPHARMA-GENHELIX-2026',
    targetMatterId: 'mat-7729',
    adversaryClientName: 'GenHelix Therapeutics Inc.',
    wallType: 'Information Barrier',
    enactedDate: '2026-01-12',
    screenedPersonnel: ['David Chen'],
    permittedPersonnel: ['Arthur Pendelton', 'Alicia Keyser', 'Zackary Thorne'],
    justification: 'David Chen authored provisional patent claims for GenHelix while with prior firm. Complete logical separation enforced across iManage, SharePoint, and Teams.',
    auditTrail: [
      {
        timestamp: '2026-09-23T11:05:12Z',
        action: 'Copilot Studio Agent Query',
        actor: 'Arthur Pendelton',
        result: 'Allowed'
      },
      {
        timestamp: '2026-09-22T09:30:15Z',
        action: 'Teams Channel Direct Mention Check',
        actor: 'David Chen',
        result: 'Blocked'
      }
    ]
  }
];

export const MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'imanage_search_matter_docs',
    description: 'Searches iManage Work 10 DMS for matter files respecting active Ethical Walls and Purview sensitivity labels.',
    parameters: {
      type: 'object',
      properties: {
        matter_number: { type: 'string', description: 'The official GT matter number (e.g. GT-2026-8841)' },
        query: { type: 'string', description: 'Semantic search keyword or document title' },
        requestor_email: { type: 'string', description: 'Entra ID UPN of requesting attorney/paralegal' },
        include_privileged: { type: 'string', enum: ['true', 'false'], description: 'Whether to return privileged documents' }
      },
      required: ['matter_number', 'requestor_email']
    }
  },
  {
    name: 'imanage_check_ethical_wall',
    description: 'Validates whether a legal professional has conflict clearance or is screened by an Ethical Wall / Information Barrier.',
    parameters: {
      type: 'object',
      properties: {
        matter_number: { type: 'string', description: 'Matter identifier to verify clearance against' },
        personnel_name: { type: 'string', description: 'Full name or Entra ID alias of the individual' }
      },
      required: ['matter_number', 'personnel_name']
    }
  },
  {
    name: 'purview_scan_sensitivity',
    description: 'Analyzes draft text, emails, or contract clauses for MNPI, SSN/PII, and Attorney-Client privilege markings under Microsoft Purview DLP.',
    parameters: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Draft legal text or prompt context' },
        matter_context: { type: 'string', description: 'Related matter number for context rules' }
      },
      required: ['content']
    }
  },
  {
    name: 'm365_graph_notify_deal_room',
    description: 'Dispatches high-priority notification to Matter Deal Room in Microsoft Teams with adaptive card formatting.',
    parameters: {
      type: 'object',
      properties: {
        matter_number: { type: 'string', description: 'Matter identifier' },
        title: { type: 'string', description: 'Alert title' },
        message: { type: 'string', description: 'Details of the milestone or document upload' },
        priority: { type: 'string', enum: ['Normal', 'Important', 'Urgent'], description: 'Teams message urgency' }
      },
      required: ['matter_number', 'title', 'message']
    }
  }
];

export const COPILOT_STUDIO_ACTIONS: CopilotStudioPluginAction[] = [
  {
    actionId: 'act_summarize_matter_filings',
    displayName: 'Summarize Matter Filings (iManage DMS)',
    description: 'Extracts key facts, deadlines, and closing milestones from active matter workspace while respecting Ethical Walls.',
    endpoint: '/api/v1/copilot/actions/summarize-matter',
    method: 'POST',
    requiredScopes: ['Matter.Read.All', 'DMS.Content.Read', 'Purview.DLP.Inspect'],
    inputSchema: {
      matterNumber: 'string (e.g. GT-2026-8841)',
      userUpn: 'string (requesting attorney UPN)',
      focusTopic: 'string (e.g. "CFIUS national security review")'
    },
    outputSchema: {
      summary: 'string',
      sourceDocIds: 'array of strings',
      ethicalClearanceStatus: 'string',
      purviewClassification: 'string'
    }
  },
  {
    actionId: 'act_verify_conflict_clearance',
    displayName: 'Verify Conflict Clearance & Screen Rule',
    description: 'Checks real-time compliance database to confirm if an attorney or expert can be added to a deal team or invited to Teams.',
    endpoint: '/api/v1/conflicts/verify-clearance',
    method: 'POST',
    requiredScopes: ['EthicalWalls.ReadWrite', 'Directory.Read.All'],
    inputSchema: {
      matterNumber: 'string',
      candidateName: 'string'
    },
    outputSchema: {
      isCleared: 'boolean',
      wallStatus: 'string',
      reason: 'string'
    }
  },
  {
    actionId: 'act_dispatch_teams_deal_alert',
    displayName: 'Post Deal Room Card via Microsoft Graph',
    description: 'Publishes an adaptive card into the secure Microsoft Teams deal channel using app-only Entra ID token.',
    endpoint: '/api/v1/graph/teams/deal-card',
    method: 'POST',
    requiredScopes: ['ChannelMessage.Send', 'Group.ReadWrite.All'],
    inputSchema: {
      teamsChannelId: 'string',
      cardTitle: 'string',
      cardBody: 'string'
    },
    outputSchema: {
      graphMessageId: 'string',
      deliveredAt: 'string'
    }
  }
];
