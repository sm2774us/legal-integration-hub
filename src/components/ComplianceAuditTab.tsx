import React, { useState, useEffect } from 'react';
import { ComplianceAuditLog, INITIAL_AUDIT_LOGS } from '../types/complianceAudit';
import { AlertThresholdConfig, DEFAULT_ALERT_CONFIG } from '../types/alertConfig';
import { generate30DayTrendData, DailyAlertTrend } from '../data/trendData';
import { AccessHeatmap } from './AccessHeatmap';
import { PurviewPolicySimulator } from './PurviewPolicySimulator';
import { LiveThreatMapSidebar } from './LiveThreatMapSidebar';
import { AuditorRemediationInspector } from './AuditorRemediationInspector';
import { AuditorRemediationModal } from './AuditorRemediationModal';
import {
  ResolutionTag,
  AuditorRemediation,
  RESOLUTION_TAG_META,
  remediationBackend
} from '../types/remediation';
import { computeOfficeThreatNodes } from '../types/threatMap';
import {
  PolicySimulationState,
  PRESET_CONFIGS,
  PurviewPolicyTriggers
} from '../types/policySimulation';
import { AccessHeatmapCell } from '../data/heatmapData';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Filter,
  Play,
  Pause,
  RefreshCw,
  Search,
  ExternalLink,
  Flame,
  FileCheck2,
  Lock,
  Radio,
  FileText,
  MapPin,
  Database,
  Sliders,
  BellRing,
  CheckCircle2,
  Save,
  RotateCcw,
  Zap,
  Info,
  Download,
  FileSpreadsheet,
  TrendingUp,
  BarChart3,
  Calendar,
  ChevronDown,
  Globe,
  Tag,
  MessageSquare,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface ComplianceAuditTabProps {
  activeStack: 'python' | 'dotnet';
}

export const ComplianceAuditTab: React.FC<ComplianceAuditTabProps> = ({ activeStack }) => {
  const [logs, setLogs] = useState<ComplianceAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [isStreaming, setIsStreaming] = useState(true);
  
  // Severity filter state supporting Critical, Warning (High + Medium), and Info
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<ComplianceAuditLog | null>(INITIAL_AUDIT_LOGS[0]);

  // Auditor Remediation & Resolution Tracking State (Stored in mock local backend)
  const [remediations, setRemediations] = useState<Record<string, AuditorRemediation>>(() =>
    remediationBackend.getAll()
  );
  const [selectedRemediationLog, setSelectedRemediationLog] = useState<ComplianceAuditLog | null>(null);
  const [isRemediationModalOpen, setIsRemediationModalOpen] = useState(false);
  const [resolutionFilter, setResolutionFilter] = useState<'ALL' | ResolutionTag>('ALL');
  const [inspectorTab, setInspectorTab] = useState<'FORENSIC' | 'REMEDIATION'>('FORENSIC');

  // Live Threat Map State (Visualizing global office network risk with dynamic pulse)
  const [showThreatMap, setShowThreatMap] = useState(true);
  const [selectedOfficeFilter, setSelectedOfficeFilter] = useState<string | null>(null);

  // Alert Thresholds Configuration State
  const [showAlertConfig, setShowAlertConfig] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertThresholdConfig>(DEFAULT_ALERT_CONFIG);
  const [configSavedToast, setConfigSavedToast] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Time-Series Trend Line Data (30 Days)
  const [trendData] = useState<DailyAlertTrend[]>(() => generate30DayTrendData());
  const [showTrendChart, setShowTrendChart] = useState(false);

  // D3 Access Heatmap State (Showing Hotspots of sensitive data access by time of day)
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<AccessHeatmapCell | null>(null);

  // Purview DLP Policy Simulator State
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulationState, setSimulationState] = useState<PolicySimulationState>({
    preset: 'STANDARD',
    strictnessMultiplier: 1.0,
    triggers: { ...PRESET_CONFIGS.STANDARD.triggers },
    isActiveInLiveStream: false
  });

  // Synthetic real-time simulation pool spanning firm's global office network
  const simulatedActors = [
    { name: 'Robert Sterling, Esq.', email: 'robert.sterling@gtlaw.com', office: 'Houston' as const, ip: '165.225.242.18' },
    { name: 'Katherine Miller, Esq.', email: 'katherine.miller@gtlaw.com', office: 'Houston' as const, ip: '165.225.240.210' },
    { name: 'David Chen, Esq.', email: 'david.chen@gtlaw.com', office: 'Dallas' as const, ip: '165.225.242.90' },
    { name: 'Arthur Pendelton, Esq.', email: 'arthur.pendelton@gtlaw.com', office: 'Atlanta COE' as const, ip: '165.225.242.50' },
    { name: 'Liam Gallagher, Esq.', email: 'liam.gallagher@gtlaw.com', office: 'Austin' as const, ip: '165.225.240.111' },
    { name: 'Elena Rostova, Esq.', email: 'elena.rostova@gtlaw.com', office: 'London' as const, ip: '165.225.242.33' },
    { name: 'Jonathan Pierce, Esq.', email: 'jonathan.pierce@gtlaw.com', office: 'New York' as const, ip: '165.225.244.12' },
    { name: 'Charlotte Dubois, Esq.', email: 'c.dubois@gtlaw.com', office: 'Frankfurt' as const, ip: '165.225.248.40' },
    { name: 'Hiroshi Tanaka, Esq.', email: 'hiroshi.tanaka@gtlaw.com', office: 'Tokyo' as const, ip: '165.225.246.88' },
    { name: 'Wei Liang, Esq.', email: 'wei.liang@gtlaw.com', office: 'Singapore' as const, ip: '165.225.250.77' },
    { name: 'Chloe Vance, Esq.', email: 'chloe.vance@gtlaw.com', office: 'San Francisco' as const, ip: '165.225.241.65' }
  ];

  const simulatedEvents: Array<{
    eventType: ComplianceAuditLog['eventType'];
    severity: ComplianceAuditLog['severity'];
    matterNumber: string;
    matterName: string;
    resourceName: string;
    actionTaken: ComplianceAuditLog['actionTaken'];
    details: string;
    purviewRuleId: string;
  }> = [
    {
      eventType: 'ETHICAL_WALL_BREACH_ATTEMPT',
      severity: 'CRITICAL',
      matterNumber: 'GT-2026-8841',
      matterName: 'Project Silicon Sovereign ($4.8B Acquisition)',
      resourceName: 'IM-109241 / Execution_Draft_Merger_Agreement.docx',
      actionTaken: 'Blocked & Audited',
      details: 'ABA Model Rule 1.10 screen violation: Screened attorney attempted retrieval from iManage Work 10 DMS API.',
      purviewRuleId: 'IB-WALL-ABA-1.10-APEX'
    },
    {
      eventType: 'PURVIEW_LABEL_UPGRADE',
      severity: 'MEDIUM',
      matterNumber: 'GT-2026-9102',
      matterName: 'DOJ & SEC Inquiry into Algorithmic Arbitrage',
      resourceName: 'SEC_Voluntary_Response_Exhibit_B.pdf',
      actionTaken: 'Sensitivity Label Elevated',
      details: 'Automatic Purview policy matched SSN / PII pattern and upgraded label to "Highly Confidential (MNPI)".',
      purviewRuleId: 'PURVIEW-DLP-FINRA-SSN'
    },
    {
      eventType: 'COPILOT_GROUNDING_BLOCKED',
      severity: 'HIGH',
      matterNumber: 'GT-2026-8841',
      matterName: 'Project Silicon Sovereign ($4.8B Acquisition)',
      resourceName: 'CFIUS_National_Security_Filing_Brief.pdf',
      actionTaken: 'Quarantined',
      details: 'Microsoft 365 Copilot Studio attempted grounding against unredacted dual-use tech memo; blocked by DLP export guard.',
      purviewRuleId: 'PURVIEW-COPILOT-CFIUS-BLOCK'
    },
    {
      eventType: 'DMS_EXPORT_INTERCEPTED',
      severity: 'HIGH',
      matterNumber: 'GT-2026-7729',
      matterName: 'BioVax Patent Infringement Defense vs. GenHelix',
      resourceName: 'Expert_Kovacs_Cellular_Assay_Raw_Data.xlsx',
      actionTaken: 'SecOps Alert Dispatched',
      details: 'Bulk download attempted via unmanaged browser session outside firm compliant device perimeter.',
      purviewRuleId: 'DLP-UNMANAGED-ENDPOINT-BLOCK'
    },
    {
      eventType: 'M365_GROUP_ACCESS_DENIED',
      severity: 'CRITICAL',
      matterNumber: 'GT-2026-7729',
      matterName: 'BioVax Patent Infringement Defense vs. GenHelix',
      resourceName: 'Teams Channel: m365-teams-biopharma-7729',
      actionTaken: 'Blocked & Audited',
      details: 'Entra ID Information Barrier engine rejected membership synchronization for screened attorney.',
      purviewRuleId: 'IB-TEAMS-GENHELIX-SCREEN'
    }
  ];

  // Generator for simulated policy events when policy simulation live injection is active
  const getSimulatedTriggerEvents = (triggers: PurviewPolicyTriggers) => {
    const list: typeof simulatedEvents = [];
    if (triggers.strictAbaEthicalScreen) {
      list.push({
        eventType: 'ETHICAL_WALL_BREACH_ATTEMPT',
        severity: 'CRITICAL',
        matterNumber: 'GT-2026-8841',
        matterName: 'Project Silicon Sovereign ($4.8B Acquisition)',
        resourceName: 'WS-APEX / Executive_Shareholder_Consents.docx',
        actionTaken: 'Blocked & Audited',
        details: '[SIMULATED STRICT ABA 1.10 TRIGGER] Real-time cross-matter query blocked: No active ethical screen waiver verified in Entra ID.',
        purviewRuleId: 'SIM-IB-WALL-ABA-1.10-STRICT'
      });
    }
    if (triggers.aggressiveMnpiScanning) {
      list.push({
        eventType: 'PURVIEW_LABEL_UPGRADE',
        severity: 'MEDIUM',
        matterNumber: 'GT-2026-8841',
        matterName: 'Project Silicon Sovereign ($4.8B Acquisition)',
        resourceName: 'Project_Codename_Valuation_Spreadsheet.xlsx',
        actionTaken: 'Sensitivity Label Elevated',
        details: '[SIMULATED AGGRESSIVE MNPI SCANNER] Low-confidence heuristic (68%) matched M&A target tender offer figures. Reclassified to Secret.',
        purviewRuleId: 'SIM-PURVIEW-DLP-MNPI-AGGRESSIVE'
      });
    }
    if (triggers.copilotAiGroundingBlock) {
      list.push({
        eventType: 'COPILOT_GROUNDING_BLOCKED',
        severity: 'HIGH',
        matterNumber: 'GT-2026-9102',
        matterName: 'DOJ & SEC Inquiry into Algorithmic Arbitrage',
        resourceName: 'Copilot RAG Cache: Algorithmic_Bot_Execution.cs',
        actionTaken: 'Quarantined',
        details: '[SIMULATED COPILOT AI INTERCEPTOR] Copilot Studio generative prompt aborted: Attempted RAG grounding against screened matter repository.',
        purviewRuleId: 'SIM-COPILOT-AI-RESTRICT-VECT'
      });
    }
    if (triggers.cfiusGeofenceQuarantine) {
      list.push({
        eventType: 'DMS_EXPORT_INTERCEPTED',
        severity: 'CRITICAL',
        matterNumber: 'GT-2026-8841',
        matterName: 'Project Silicon Sovereign ($4.8B Acquisition)',
        resourceName: 'EUV_Semiconductor_Defense_Export_Schedule.pdf',
        actionTaken: 'Quarantined',
        details: '[SIMULATED CFIUS GEOFENCE] Access request originated from non-domestic IP address (185.220.101.5); quarantined under CFIUS guard.',
        purviewRuleId: 'SIM-PURVIEW-GEO-CFIUS-QUARANTINE'
      });
    }
    if (triggers.offHoursBulkExportGuard) {
      list.push({
        eventType: 'DMS_EXPORT_INTERCEPTED',
        severity: 'HIGH',
        matterNumber: 'GT-2026-7729',
        matterName: 'BioVax Patent Infringement Defense vs. GenHelix',
        resourceName: 'Litigation_Hold_Archive_Batch_08.zip',
        actionTaken: 'SecOps Alert Dispatched',
        details: '[SIMULATED OFF-HOURS GUARD] Batch document download (5 files in 2 min) detected during 02:45 AM off-hours window.',
        purviewRuleId: 'SIM-PURVIEW-ANOMALY-OFFHOURS'
      });
    }
    if (triggers.dynamicWatermarkOnElevation) {
      list.push({
        eventType: 'PURVIEW_LABEL_UPGRADE',
        severity: 'MEDIUM',
        matterNumber: 'GT-2026-6420',
        matterName: 'Cross-Border Sovereign Debt Restructuring',
        resourceName: 'IMF_Default_Contingency_Strategy.docx',
        actionTaken: 'Sensitivity Label Elevated',
        details: '[SIMULATED MANDATED WATERMARK] Classification elevated; dynamic legal watermark stamped and external sharing links revoked.',
        purviewRuleId: 'SIM-PURVIEW-WATERMARK-REVOKE'
      });
    }
    if (triggers.unmanagedDeviceBlock) {
      list.push({
        eventType: 'M365_GROUP_ACCESS_DENIED',
        severity: 'HIGH',
        matterNumber: 'GT-2026-9102',
        matterName: 'DOJ & SEC Inquiry into Algorithmic Arbitrage',
        resourceName: 'SharePoint Defense Documents Library',
        actionTaken: 'Blocked & Audited',
        details: '[SIMULATED UNMANAGED DEVICE] Synchronize attempt blocked from unmanaged BYOD device lacking MDM compliance token.',
        purviewRuleId: 'SIM-ENTRA-UNMANAGED-DEV-BLOCK'
      });
    }
    return list.length > 0 ? list : simulatedEvents;
  };

  // Live polling / event stream simulator
  useEffect(() => {
    if (!isStreaming) return;

    // Adjust interval frequency based on policy simulation multiplier if active
    const intervalTime = simulationState.isActiveInLiveStream
      ? Math.max(1400, Math.round(4500 / simulationState.strictnessMultiplier))
      : 4500;

    const interval = setInterval(() => {
      const activeEventPool = simulationState.isActiveInLiveStream
        ? [...simulatedEvents, ...getSimulatedTriggerEvents(simulationState.triggers)]
        : simulatedEvents;

      const randomActor = simulatedActors[Math.floor(Math.random() * simulatedActors.length)];
      const randomEvt = activeEventPool[Math.floor(Math.random() * activeEventPool.length)];
      const randomId = `AUD-${Math.floor(9022 + Math.random() * 9000)}`;

      const newLog: ComplianceAuditLog = {
        id: randomId,
        timestamp: new Date().toISOString(),
        eventType: randomEvt.eventType,
        severity: randomEvt.severity,
        actorName: randomActor.name,
        actorEmail: randomActor.email,
        matterNumber: randomEvt.matterNumber,
        matterName: randomEvt.matterName,
        resourceName: randomEvt.resourceName,
        actionTaken: randomEvt.actionTaken,
        details: randomEvt.details,
        sourceIp: randomActor.ip,
        geoOffice: randomActor.office,
        purviewRuleId: randomEvt.purviewRuleId
      };

      setLogs(prev => [newLog, ...prev.slice(0, 49)]); // keep latest 50
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isStreaming, simulationState]);

  const handleResetSimulation = () => {
    setSimulationState({
      preset: 'STANDARD',
      strictnessMultiplier: 1.0,
      triggers: { ...PRESET_CONFIGS.STANDARD.triggers },
      isActiveInLiveStream: false
    });
  };

  const handleSelectHeatmapCell = (cell: AccessHeatmapCell) => {
    setSelectedHeatmapCell(cell);
    setSearchQuery(cell.topMatterNumber);
  };

  // Compute live threat network telemetry across global offices
  const officeThreatNodes = computeOfficeThreatNodes(logs, remediations);
  const pulsingOfficesCount = officeThreatNodes.filter(o => o.hasActivePulse).length;

  // Simulate a live DLP breach threat ping across global offices
  const handleSimulateThreatPing = () => {
    const globalOffices = [
      'London',
      'Singapore',
      'Frankfurt',
      'New York',
      'Tokyo',
      'San Francisco',
      'Austin',
      'Houston'
    ];
    const chosenOffice = globalOffices[Math.floor(Math.random() * globalOffices.length)];
    const pingId = `AUD-${Math.floor(9500 + Math.random() * 499)}`;
    const simulatedGlobalPing: ComplianceAuditLog = {
      id: pingId,
      timestamp: new Date().toISOString(),
      eventType: 'ETHICAL_WALL_BREACH_ATTEMPT',
      severity: 'CRITICAL',
      actorName: 'Alexander Wright, KC',
      actorEmail: 'alexander.wright@gtlaw.com',
      matterNumber: 'GT-2026-8841',
      matterName: 'Project Silicon Sovereign ($4.8B Acquisition)',
      resourceName: 'CMA_Antitrust_CrossBorder_Remedies.docx',
      actionTaken: 'Blocked & Audited',
      details: `[LIVE THREAT MAP INCIDENT TRIGGER] Screened partner attempted unauthorized cross-border retrieval from ${chosenOffice} practice office. Geofence violation dispatched.`,
      sourceIp: '165.225.248.105',
      geoOffice: chosenOffice,
      purviewRuleId: 'IB-CROSSBORDER-WALL-SCREEN'
    };

    setLogs(prev => [simulatedGlobalPing, ...prev.slice(0, 49)]);
    setSelectedLog(simulatedGlobalPing);
  };

  const handleRemediationUpdated = (updated: AuditorRemediation) => {
    setRemediations(prev => ({
      ...prev,
      [updated.logId]: updated
    }));
  };

  // Filter logs based on severity dropdown, event type, search query, office filter, and resolution tag
  const filteredLogs = logs.filter(log => {
    let matchesSeverity = true;
    if (severityFilter === 'CRITICAL') {
      matchesSeverity = log.severity === 'CRITICAL';
    } else if (severityFilter === 'WARNING') {
      matchesSeverity = log.severity === 'HIGH' || log.severity === 'MEDIUM';
    } else if (severityFilter === 'INFO') {
      matchesSeverity = log.severity === 'INFO';
    }

    const matchesEvent = selectedEventType === 'ALL' || log.eventType === selectedEventType;
    const matchesQuery =
      searchQuery === '' ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.matterNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.purviewRuleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.geoOffice.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOffice =
      !selectedOfficeFilter ||
      log.geoOffice.toLowerCase().includes(selectedOfficeFilter.toLowerCase()) ||
      selectedOfficeFilter.toLowerCase().includes(log.geoOffice.toLowerCase());

    const remediation = remediations[log.id];
    const logStatus = remediation?.status || 'UNREVIEWED';
    const matchesResolution =
      resolutionFilter === 'ALL' || logStatus === resolutionFilter;

    return matchesSeverity && matchesEvent && matchesQuery && matchesOffice && matchesResolution;
  });

  // Aggregated KPI counts
  const criticalCount = logs.filter(l => l.severity === 'CRITICAL').length;
  const highCount = logs.filter(l => l.severity === 'HIGH').length;
  const warningCount = logs.filter(l => l.severity === 'HIGH' || l.severity === 'MEDIUM').length;
  const infoCount = logs.filter(l => l.severity === 'INFO').length;
  const labelUpgradesCount = logs.filter(l => l.eventType === 'PURVIEW_LABEL_UPGRADE').length;
  const blockedAttemptsCount = logs.filter(l => l.actionTaken === 'Blocked & Audited' || l.actionTaken === 'Quarantined').length;

  // Threshold Evaluation: Is Critical or Warning breached?
  const isCriticalThresholdBreached = criticalCount >= alertConfig.criticalThreshold;
  const isWarningThresholdBreached = warningCount >= alertConfig.warningThreshold;

  const handleSaveAlertConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 2500);
  };

  const handleResetAlertConfig = () => {
    setAlertConfig(DEFAULT_ALERT_CONFIG);
  };

  // Export filtered logs to CSV conforming to audit & remediation requirements
  const handleExportCsv = () => {
    const headers = [
      'EventID',
      'TimestampUTC',
      'Severity',
      'EventType',
      'ActorName',
      'ActorEmail',
      'MatterNumber',
      'MatterName',
      'ProtectedResource',
      'ActionTaken',
      'PurviewPolicyRuleId',
      'OfficeLocation',
      'SourceIP',
      'ResolutionStatus',
      'AuditorNotesCount',
      'LatestAuditorNote',
      'RemediationActionItem',
      'ForensicDetails'
    ];

    const rows = filteredLogs.map(log => {
      const rem = remediations[log.id];
      const statusLabel = rem ? RESOLUTION_TAG_META[rem.status].label : 'Awaiting Review';
      const notesCount = rem ? rem.notes.length : 0;
      const latestNote = rem && rem.notes[0] ? rem.notes[0].note.replace(/"/g, '""') : '';
      const actionItem = rem && rem.notes[0] && rem.notes[0].actionItem ? rem.notes[0].actionItem.replace(/"/g, '""') : '';

      return [
        `"${log.id}"`,
        `"${log.timestamp}"`,
        `"${log.severity}"`,
        `"${log.eventType}"`,
        `"${log.actorName.replace(/"/g, '""')}"`,
        `"${log.actorEmail}"`,
        `"${log.matterNumber}"`,
        `"${log.matterName.replace(/"/g, '""')}"`,
        `"${log.resourceName.replace(/"/g, '""')}"`,
        `"${log.actionTaken}"`,
        `"${log.purviewRuleId}"`,
        `"${log.geoOffice}"`,
        `"${log.sourceIp}"`,
        `"${statusLabel}"`,
        `"${notesCount}"`,
        `"${latestNote}"`,
        `"${actionItem}"`,
        `"${log.details.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.href = url;
    link.setAttribute('download', `Purview_Compliance_Audit_Export_${timestampStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate and Download PDF Report using jsPDF & autoTable
  const handleExportPdf = () => {
    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'letter'
      });

      const generationDate = new Date().toUTCString();

      // Brand Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, doc.internal.pageSize.width, 65, 'F');

      doc.setFont('times', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(245, 158, 11); // amber-500
      doc.text('LEXISMATRIX // ENTERPRISE LEGAL INTEGRATION HUB', 40, 32);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(226, 232, 240); // slate-200
      doc.text('Microsoft Purview & ABA Rule 1.10 Ethical Wall Compliance Audit Report', 40, 48);

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Generated: ${generationDate} | Active Filter: ${severityFilter} Severity | Resolution: ${resolutionFilter} | Records: ${filteredLogs.length}`, 40, 60);

      // Audit Summary Metrics Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(40, 80, doc.internal.pageSize.width - 80, 45, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text('TELEMETRY STATUS & REMEDIATION SUMMARY:', 50, 96);

      const remediatedLogsCount = logs.filter(l => {
        const rem = remediations[l.id];
        return rem && (rem.status === 'REMEDIATED' || rem.status === 'FALSE_POSITIVE');
      }).length;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `Critical: ${criticalCount}  |  Warning: ${warningCount}  |  Quarantined: ${blockedAttemptsCount}  |  Remediated / Closed: ${remediatedLogsCount}  |  Global Offices Monitored: ${officeThreatNodes.length}  |  Policy Strictness: ${simulationState.preset}`,
        50,
        112
      );

      // Table mapping with Remediation status column
      const tableData = filteredLogs.map(l => {
        const rem = remediations[l.id];
        const statusStr = rem ? RESOLUTION_TAG_META[rem.status].shortLabel : 'Unreviewed';
        return [
          l.id,
          new Date(l.timestamp).toLocaleTimeString(),
          l.severity,
          l.eventType.replace(/_/g, ' '),
          l.actorName,
          l.matterNumber,
          statusStr,
          l.actionTaken,
          l.details.length > 40 ? l.details.substring(0, 38) + '...' : l.details
        ];
      });

      autoTable(doc, {
        head: [['ID', 'Time', 'Severity', 'Event Type', 'Actor', 'Matter', 'Remediation', 'Action Taken', 'Forensic Details']],
        body: tableData,
        startY: 135,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 41, 59], // slate-800
          textColor: [248, 250, 252],
          fontSize: 7.5,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 7,
          cellPadding: 4,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 42 },
          2: { cellWidth: 42 },
          3: { cellWidth: 85 },
          4: { cellWidth: 80 },
          5: { cellWidth: 60 },
          6: { cellWidth: 70 },
          7: { cellWidth: 70 },
          8: { cellWidth: 'auto' }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            const val = data.cell.raw;
            if (val === 'CRITICAL') {
              data.cell.styles.textColor = [225, 29, 72]; // rose-600
              data.cell.styles.fontStyle = 'bold';
            } else if (val === 'HIGH' || val === 'MEDIUM') {
              data.cell.styles.textColor = [217, 119, 6]; // amber-600
            }
          }
          if (data.section === 'body' && data.column.index === 6) {
            const val = String(data.cell.raw);
            if (val.includes('Remediated') || val.includes('False Positive')) {
              data.cell.styles.textColor = [16, 185, 129]; // emerald
              data.cell.styles.fontStyle = 'bold';
            } else if (val.includes('Investigating') || val.includes('Escalated')) {
              data.cell.styles.textColor = [217, 119, 6]; // amber
            }
          }
        },
        foot: [[
          {
            content: 'CONFIDENTIAL ATTORNEY-CLIENT PRIVILEGED WORK PRODUCT - PREPARED FOR INFOSEC & COMPLIANCE REVIEW',
            colSpan: 9,
            styles: { halign: 'center', fontSize: 6.5, textColor: [100, 116, 139] }
          }
        ]]
      });

      const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      doc.save(`Purview_Compliance_Audit_Report_${timestampStr}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title & Live Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <span>Microsoft Purview & Ethical Wall Live Compliance Audit</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time telemetry streaming from Purview Information Barriers, iManage Work 10 DMS access logs, and Entra ID security scopes.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* PDF Report Export Button using jsPDF */}
          <button
            onClick={handleExportPdf}
            disabled={isGeneratingPdf}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white border border-rose-500/40 shadow-sm"
            title="Generate and download compliance audit PDF report"
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow-sm"
            title="Export current view to compliance audit CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV ({filteredLogs.length})</span>
          </button>

          {/* Toggle Live Threat Map Button */}
          <button
            onClick={() => setShowThreatMap(!showThreatMap)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showThreatMap
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
            title="Toggle Live Threat Map sidebar representing global office network risk scope"
          >
            <Globe className="w-3.5 h-3.5 text-rose-400" />
            <span>Live Threat Map</span>
            {pulsingOfficesCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping ml-0.5" />
            )}
          </button>

          {/* Toggle D3 Access Heatmap Button */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showHeatmap
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
            title="Toggle D3.js temporal access hotspots heatmap"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>D3 Hotspots Heatmap</span>
          </button>

          {/* Toggle Purview DLP Policy Simulator Button */}
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showSimulator
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
            title="Toggle hypothetical Purview DLP policy triggers & strictness projection tool"
          >
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>DLP Policy Simulator</span>
            {simulationState.isActiveInLiveStream && (
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse ml-0.5" />
            )}
          </button>

          {/* Toggle Trend Chart Button */}
          <button
            onClick={() => setShowTrendChart(!showTrendChart)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showTrendChart
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span>30-Day Trend</span>
          </button>

          {/* Configure Alert Thresholds Button */}
          <button
            onClick={() => setShowAlertConfig(!showAlertConfig)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showAlertConfig
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Alert Thresholds</span>
            {(isCriticalThresholdBreached || isWarningThresholdBreached) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5" />
            )}
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-mono">
            <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className={isStreaming ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
              {isStreaming ? 'LIVE STREAM ACTIVE' : 'STREAM PAUSED'}
            </span>
          </div>

          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isStreaming
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Telemetry</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Feed</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Threshold Alert Banner (If breached) */}
      {(isCriticalThresholdBreached || isWarningThresholdBreached) && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md ${
            isCriticalThresholdBreached
              ? 'bg-rose-950/60 border-rose-800 text-rose-200'
              : 'bg-amber-950/60 border-amber-800 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <BellRing
              className={`w-5 h-5 shrink-0 ${
                isCriticalThresholdBreached ? 'text-rose-400 animate-bounce' : 'text-amber-400 animate-pulse'
              }`}
            />
            <div>
              <span className="font-bold text-sm block">
                {isCriticalThresholdBreached
                  ? 'CRITICAL ALERT: Purview DLP Violation Threshold Breached'
                  : 'WARNING ALERT: Elevated Policy Incident Volume Detected'}
              </span>
              <span className="text-[11px] opacity-90">
                {isCriticalThresholdBreached
                  ? `Critical events (${criticalCount}) exceeded configured threshold of ${alertConfig.criticalThreshold}. Automated SecOps quarantine engaged.`
                  : `Warning events (${warningCount}) exceeded configured threshold of ${alertConfig.warningThreshold}.`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {alertConfig.autoQuarantineOnCritical && isCriticalThresholdBreached && (
              <span className="px-2.5 py-1 rounded bg-rose-900/60 border border-rose-700 text-[10px] font-bold uppercase tracking-wider text-rose-200">
                Auto-Quarantine Active
              </span>
            )}
            <button
              onClick={() => setShowAlertConfig(true)}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded text-xs cursor-pointer"
            >
              Adjust Thresholds
            </button>
          </div>
        </div>
      )}

      {/* Real-Time Alert Threshold Configuration Panel (Collapsible) */}
      {showAlertConfig && (
        <div className="border border-amber-500/30 bg-slate-900/90 rounded-xl p-5 md:p-6 space-y-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Real-Time Alert Thresholds & Purview DLP Incident Triggers</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Tenant Policy: GTLaw-Purview-Global</span>
              <button
                onClick={() => setShowAlertConfig(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer ml-2"
              >
                ✕
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveAlertConfig} className="space-y-5 text-xs font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Critical Threshold Slider/Input */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-rose-400 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>CRITICAL SEVERITY LIMIT</span>
                  </span>
                  <span className="text-base font-bold font-mono text-slate-100">
                    {alertConfig.criticalThreshold} events
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Triggers immediate PagerDuty on-call dispatch & ABA 1.10 audit hold.
                </p>
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={alertConfig.criticalThreshold}
                  onChange={e =>
                    setAlertConfig({ ...alertConfig, criticalThreshold: Number(e.target.value) })
                  }
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 event (Strict)</span>
                  <span>Current: {criticalCount} in buffer</span>
                  <span>15 events</span>
                </div>
              </div>

              {/* Warning Threshold Slider/Input */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>WARNING SEVERITY LIMIT</span>
                  </span>
                  <span className="text-base font-bold font-mono text-slate-100">
                    {alertConfig.warningThreshold} events
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Flags high/medium violations (label elevations, external email forwarding).
                </p>
                <input
                  type="range"
                  min={2}
                  max={25}
                  value={alertConfig.warningThreshold}
                  onChange={e =>
                    setAlertConfig({ ...alertConfig, warningThreshold: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>2 events</span>
                  <span>Current: {warningCount} in buffer</span>
                  <span>25 events</span>
                </div>
              </div>

              {/* Alert Dispatch Email & Routing */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <span className="text-sky-400 font-bold flex items-center gap-1.5">
                  <BellRing className="w-4 h-4" />
                  <span>ALERT ROUTING RECIPIENT</span>
                </span>
                <p className="text-[11px] text-slate-400 font-sans">
                  Designated Information Security & Compliance distribution alias.
                </p>
                <input
                  type="email"
                  value={alertConfig.alertEmailRecipient}
                  onChange={e => setAlertConfig({ ...alertConfig, alertEmailRecipient: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Automated Enforcement Actions Checkboxes */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
              <span className="text-slate-300 font-semibold block">
                Automated Incident Response & Mitigation Triggers:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-slate-100">
                  <input
                    type="checkbox"
                    checked={alertConfig.autoQuarantineOnCritical}
                    onChange={e =>
                      setAlertConfig({ ...alertConfig, autoQuarantineOnCritical: e.target.checked })
                    }
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span>Auto-Quarantine DMS File on Critical Breach</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-slate-100">
                  <input
                    type="checkbox"
                    checked={alertConfig.sendPagerDutyAlert}
                    onChange={e =>
                      setAlertConfig({ ...alertConfig, sendPagerDutyAlert: e.target.checked })
                    }
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span>Dispatch PagerDuty Tier 1 SecOps Incident</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-slate-100">
                  <input
                    type="checkbox"
                    checked={alertConfig.notifyManagingPartner}
                    onChange={e =>
                      setAlertConfig({ ...alertConfig, notifyManagingPartner: e.target.checked })
                    }
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span>Notify Matter Lead Billing Partner</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-slate-100">
                  <input
                    type="checkbox"
                    checked={alertConfig.blockCopilotTenantWide}
                    onChange={e =>
                      setAlertConfig({ ...alertConfig, blockCopilotTenantWide: e.target.checked })
                    }
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span>Disable Copilot Studio Connector on Matter</span>
                </label>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Threshold policies synchronize to Microsoft Purview via Graph Webhook API.</span>
              </div>

              <div className="flex items-center gap-3">
                {configSavedToast && (
                  <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Policies Saved Successfully
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetAlertConfig}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Defaults</span>
                </button>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Apply Thresholds</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Purview Policy Simulation Active Indicator Banner (if live stream injection is ON) */}
      {simulationState.isActiveInLiveStream && (
        <div className="p-3.5 rounded-xl border border-sky-600/70 bg-sky-950/60 text-xs font-mono text-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-sky-400 animate-pulse shrink-0" />
            <div>
              <span className="font-bold text-sky-300">
                PURVIEW DLP HYPOTHETICAL SIMULATION ENGAGED IN LIVE STREAM:
              </span>{' '}
              <span>
                Mode: <strong>{PRESET_CONFIGS[simulationState.preset].name}</strong> ({Math.round(simulationState.strictnessMultiplier * 100)}% strictness rate). Synthetic policy events actively injecting into dashboard telemetry.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSimulator(true)}
              className="px-2.5 py-1 bg-sky-900/80 hover:bg-sky-800 border border-sky-700 rounded text-sky-200 cursor-pointer text-[11px]"
            >
              Configure Policies
            </button>
            <button
              onClick={() => setSimulationState({ ...simulationState, isActiveInLiveStream: false })}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 cursor-pointer text-[11px]"
            >
              Deactivate
            </button>
          </div>
        </div>
      )}

      {/* Purview Policy Simulator Panel (Collapsible) */}
      {showSimulator && (
        <PurviewPolicySimulator
          simulationState={simulationState}
          onUpdateState={setSimulationState}
          onReset={handleResetSimulation}
        />
      )}

      {/* D3 Access Heatmap Hotspots Component (Collapsible) */}
      {showHeatmap && (
        <AccessHeatmap onSelectCell={handleSelectHeatmapCell} />
      )}

      {/* Active Heatmap Filter Ribbon (If an auditor clicked a cell to focus) */}
      {selectedHeatmapCell && searchQuery === selectedHeatmapCell.topMatterNumber && (
        <div className="p-3 bg-amber-950/40 border border-amber-600/60 rounded-xl flex items-center justify-between text-xs font-mono text-amber-200 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>
              <strong>Temporal Heatmap Hotspot Scoped:</strong> Inspecting <strong>{selectedHeatmapCell.topMatterNumber}</strong> ({selectedHeatmapCell.topMatter}) from <strong>{selectedHeatmapCell.dayName} {selectedHeatmapCell.hourLabel}</strong> ({selectedHeatmapCell.accessCount} access events logged)
            </span>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="px-2.5 py-1 bg-amber-900/70 hover:bg-amber-800 border border-amber-700 rounded text-amber-200 flex items-center gap-1 cursor-pointer transition-colors text-[11px]"
            title="Clear heatmap filter scope"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Hotspot Scope</span>
          </button>
        </div>
      )}
      {showTrendChart && (
        <div className="border border-purple-500/30 bg-slate-900/60 rounded-xl p-5 md:p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Microsoft Purview DLP & Ethical Wall 30-Day Incident Trend Line</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3 h-3 text-slate-500" />
                Aug 27, 2026 – Sept 25, 2026 (Rolling 30 Days)
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Tracks historical volume of critical breaches (ethical screens & CFIUS exfiltration) versus warning-level DLP policy modifications and metadata label elevations across firm workspaces.
          </p>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  interval={3}
                  fontFamily="JetBrains Mono"
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  fontFamily="JetBrains Mono"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-xl text-xs font-mono space-y-1 z-50">
                          <span className="text-slate-300 font-bold block mb-1">{label}</span>
                          <div className="text-rose-400">
                            Critical Breaches: <strong>{payload[0]?.value}</strong>
                          </div>
                          <div className="text-amber-400">
                            Warning Interceptions: <strong>{payload[1]?.value}</strong>
                          </div>
                          <div className="text-sky-400">
                            Label Elevations: <strong>{payload[2]?.value}</strong>
                          </div>
                          <div className="border-t border-slate-800 pt-1 text-slate-400 text-[10px]">
                            Total Alerts: <strong>{Number(payload[0]?.value || 0) + Number(payload[1]?.value || 0) + Number(payload[2]?.value || 0)}</strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={28}
                  formatter={(value) => <span className="text-xs font-mono text-slate-300 capitalize">{value}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="critical"
                  name="Critical (Wall Screens)"
                  stroke="#f43f5e"
                  fillOpacity={1}
                  fill="url(#colorCritical)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="warning"
                  name="Warning (DLP Safeguards)"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorWarning)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="info"
                  name="Label Modifications"
                  stroke="#38bdf8"
                  fillOpacity={1}
                  fill="url(#colorInfo)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="border border-rose-900/40 bg-gradient-to-br from-rose-950/40 to-slate-900/60 p-4 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-rose-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              CRITICAL BREACH ATTEMPTS
            </span>
            <span className="text-[10px] font-mono text-rose-500 uppercase">
              Limit: {alertConfig.criticalThreshold}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold font-mono text-slate-100">{criticalCount}</div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                isCriticalThresholdBreached
                  ? 'bg-rose-900/80 text-rose-200 border border-rose-700 animate-pulse'
                  : 'text-slate-500'
              }`}
            >
              {isCriticalThresholdBreached ? 'BREACHED' : 'NORMAL'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Real-time attempts to query restricted matter workspaces blocked.
          </p>
        </div>

        {/* Card 2 */}
        <div className="border border-amber-900/40 bg-gradient-to-br from-amber-950/40 to-slate-900/60 p-4 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              WARNING LEVEL ACTIONS
            </span>
            <span className="text-[10px] font-mono text-amber-500 uppercase">
              Limit: {alertConfig.warningThreshold}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold font-mono text-slate-100">{warningCount}</div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                isWarningThresholdBreached
                  ? 'bg-amber-900/80 text-amber-200 border border-amber-700'
                  : 'text-slate-500'
              }`}
            >
              {isWarningThresholdBreached ? 'ELEVATED' : 'STABLE'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Prevented by Microsoft Purview DLP & Information Barrier rules.
          </p>
        </div>

        {/* Card 3 */}
        <div className="border border-sky-900/40 bg-gradient-to-br from-sky-950/40 to-slate-900/60 p-4 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-sky-400 flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5" />
              LABEL ELEVATIONS (DLP)
            </span>
            <span className="text-[10px] font-mono text-sky-500 uppercase">MNPI / SSN</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{labelUpgradesCount}</div>
          <p className="text-[11px] text-slate-400">
            Documents auto-classified to Highly Confidential / Privileged.
          </p>
        </div>

        {/* Card 4 */}
        <div className="border border-emerald-900/40 bg-gradient-to-br from-emerald-950/40 to-slate-900/60 p-4 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              TOTAL ACTIONS INTERCEPTED
            </span>
            <span className="text-[10px] font-mono text-emerald-500 uppercase">Quarantined</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{blockedAttemptsCount}</div>
          <p className="text-[11px] text-slate-400">
            iManage Work 10, SharePoint, Teams, and Copilot Studio reporting.
          </p>
        </div>
      </div>

      {/* Filter and Query Ribbon with Dropdown Filter for Severity Level and Remediation Status */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Dropdown Filter for Severity Level */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>SEVERITY:</span>
            </span>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
            >
              <option value="ALL">All Severities (Critical, Warning, Info)</option>
              <option value="CRITICAL">Critical Only (ABA Rule 1.10 & CFIUS)</option>
              <option value="WARNING">Warning Only (High & Medium DLP Safeguards)</option>
              <option value="INFO">Info Only (Audit Metadata Logs)</option>
            </select>
          </div>

          {/* Dropdown Filter for Remediation Status */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-sky-400" />
              <span>REMEDIATION:</span>
            </span>
            <select
              value={resolutionFilter}
              onChange={e => setResolutionFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
            >
              <option value="ALL">All Statuses ({filteredLogs.length})</option>
              <option value="UNREVIEWED">Awaiting Review</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="FALSE_POSITIVE">Authorized / False Positive</option>
              <option value="REMEDIATED">Remediated & Revoked</option>
              <option value="ESCALATED_GC">Escalated to General Counsel</option>
              <option value="CLIENT_DISCLOSED">Client Disclosed</option>
            </select>
          </div>

          {/* Active Office Geographic Filter Tag */}
          {selectedOfficeFilter && (
            <div className="flex items-center gap-1.5 bg-rose-950/70 border border-rose-800 text-rose-300 px-2.5 py-1 rounded-lg text-xs font-semibold animate-fadeIn">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Office: {selectedOfficeFilter}</span>
              <button
                onClick={() => setSelectedOfficeFilter(null)}
                className="ml-1 text-rose-400 hover:text-white cursor-pointer"
                title="Clear office geographical filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Quick Event Filter */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-500 px-2 py-1">EVENT TYPE:</span>
            {['ALL', 'ETHICAL_WALL_BREACH_ATTEMPT', 'COPILOT_GROUNDING_BLOCKED', 'PURVIEW_LABEL_UPGRADE'].map(evt => (
              <button
                key={evt}
                onClick={() => setSelectedEventType(evt)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
                  selectedEventType === evt
                    ? 'bg-slate-800 text-sky-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {evt.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Free-Text Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search actor, matter, office..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Main Two-Column Log Inspector & Live Threat Map Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Table: Audit Events Feed with Resolution Badges */}
        <div className="lg:col-span-7 border border-slate-800 bg-slate-900/50 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-Time Audit Event Stream ({filteredLogs.length} events)</span>
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportPdf}
                className="text-[10px] text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3 h-3" />
                <span>PDF Report</span>
              </button>
              <button
                onClick={handleExportCsv}
                className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-[580px] overflow-y-auto">
            {filteredLogs.map(log => {
              const isSelected = selectedLog?.id === log.id;
              const rem = remediations[log.id] || {
                logId: log.id,
                status: 'UNREVIEWED',
                notes: [],
                lastUpdated: log.timestamp
              };
              const remMeta = RESOLUTION_TAG_META[rem.status];

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-3.5 transition-colors cursor-pointer text-xs font-mono space-y-1.5 ${
                    isSelected
                      ? 'bg-slate-800/70 border-l-2 border-amber-500'
                      : 'hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.severity === 'CRITICAL'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : log.severity === 'HIGH' || log.severity === 'MEDIUM'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                            : 'bg-sky-950/80 text-sky-300 border border-sky-800'
                        }`}
                      >
                        {log.severity}
                      </span>
                      <span className="font-semibold text-slate-200">{log.eventType}</span>

                      {/* Remediation Status Tag Badge */}
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${remMeta.badgeClass}`}
                        title={`Remediation: ${remMeta.label}`}
                      >
                        {remMeta.shortLabel}
                      </span>

                      {/* Notes count indicator */}
                      {rem.notes.length > 0 && (
                        <span className="flex items-center gap-1 text-[9px] text-sky-400 font-semibold bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-800/80">
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>{rem.notes.length} note{rem.notes.length > 1 ? 's' : ''}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300 flex items-center justify-between">
                    <span className="text-amber-300 font-semibold">{log.actorName}</span>
                    <span className="text-slate-400">{log.matterNumber}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1 font-sans">
                    {log.details}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {log.geoOffice} office ({log.sourceIp})
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-medium">
                        Action: {log.actionTaken}
                      </span>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedLog(log);
                          setSelectedRemediationLog(log);
                          setIsRemediationModalOpen(true);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-600 transition-colors flex items-center gap-1 cursor-pointer font-semibold"
                        title="Click to attach Auditor Note or update Resolution Tag"
                      >
                        <Tag className="w-2.5 h-2.5 text-amber-400" />
                        <span>+ Note / Tag</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Showing {filteredLogs.length} matching audit frames (Severity: {severityFilter} | Tag: {resolutionFilter})</span>
            <span>Active Backend: {activeStack === 'python' ? 'FastAPI 0.115' : '.NET 9 Minimal API'}</span>
          </div>
        </div>

        {/* Right Panel: Live Threat Map Sidebar & Forensic / Remediation Inspector */}
        <div className="lg:col-span-5 space-y-5">
          {/* Live Threat Map Sidebar (Global Office Network Risk Telemetry) */}
          {showThreatMap && (
            <LiveThreatMapSidebar
              offices={officeThreatNodes}
              selectedOfficeFilter={selectedOfficeFilter}
              onSelectOfficeFilter={setSelectedOfficeFilter}
              onSimulateThreatPing={handleSimulateThreatPing}
            />
          )}

          {/* Inspector Panel with Tabs for Forensic Purview Details & Auditor Remediation Tracking */}
          <div className="border border-slate-800 bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-4 shadow-sm">
            {/* Inspector Tab Switcher */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setInspectorTab('FORENSIC')}
                  className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    inspectorTab === 'FORENSIC'
                      ? 'bg-slate-800 text-amber-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Forensic Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectorTab('REMEDIATION')}
                  className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    inspectorTab === 'REMEDIATION'
                      ? 'bg-slate-800 text-emerald-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Auditor Tracking</span>
                  {selectedLog && remediations[selectedLog.id]?.notes.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] flex items-center justify-center">
                      {remediations[selectedLog.id].notes.length}
                    </span>
                  )}
                </button>
              </div>

              {selectedLog && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedRemediationLog(selectedLog);
                      setIsRemediationModalOpen(true);
                    }}
                    className="text-[10px] text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Screen</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <span className="text-[11px] text-slate-500">{selectedLog.id}</span>
                </div>
              )}
            </div>

            {selectedLog ? (
              inspectorTab === 'FORENSIC' ? (
                <div className="space-y-4 text-xs">
                  {/* Severity & Action */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Enforcement Action:</span>
                      <span className="font-bold text-emerald-400">{selectedLog.actionTaken}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Policy Rule Triggered:</span>
                      <span className="font-bold text-sky-300">{selectedLog.purviewRuleId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Event Timestamp:</span>
                      <span className="text-slate-300">{selectedLog.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Current Remediation:</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                          remediations[selectedLog.id]
                            ? RESOLUTION_TAG_META[remediations[selectedLog.id].status].badgeClass
                            : RESOLUTION_TAG_META.UNREVIEWED.badgeClass
                        }`}
                      >
                        {remediations[selectedLog.id]
                          ? RESOLUTION_TAG_META[remediations[selectedLog.id].status].label
                          : RESOLUTION_TAG_META.UNREVIEWED.label}
                      </span>
                    </div>
                  </div>

                  {/* Actor & Location */}
                  <div className="space-y-2">
                    <span className="text-slate-400 block font-semibold">Actor Identity & Network Perimeter:</span>
                    <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800/80 space-y-1 text-[11px]">
                      <div>Principal: <strong className="text-slate-100">{selectedLog.actorName}</strong></div>
                      <div>Entra ID UPN: <span className="text-slate-400">{selectedLog.actorEmail}</span></div>
                      <div>Office Location: <span className="text-slate-300">{selectedLog.geoOffice} Practice Office</span></div>
                      <div>Origin IP: <span className="text-slate-400 font-mono">{selectedLog.sourceIp}</span></div>
                    </div>
                  </div>

                  {/* Target Matter & Resource */}
                  <div className="space-y-2">
                    <span className="text-slate-400 block font-semibold">Target Matter & Protected Asset:</span>
                    <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800/80 space-y-1 text-[11px]">
                      <div>Matter: <strong className="text-amber-400">{selectedLog.matterNumber}</strong> — {selectedLog.matterName}</div>
                      <div>Resource: <code className="text-sky-300">{selectedLog.resourceName}</code></div>
                    </div>
                  </div>

                  {/* Full Audit Narration */}
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-semibold">Technical Finding & Compliance Log:</span>
                    <p className="bg-slate-900/80 p-3 rounded border border-slate-800/80 text-slate-300 leading-relaxed font-sans text-xs">
                      {selectedLog.details}
                    </p>
                  </div>

                  {/* Quick Action to switch to remediation note */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Need to record an investigation finding?
                    </span>
                    <button
                      onClick={() => setInspectorTab('REMEDIATION')}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Tag className="w-3 h-3" />
                      <span>Attach Auditor Note</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Auditor Remediation & Action Plan Inspector */
                <AuditorRemediationInspector
                  log={selectedLog}
                  remediation={remediations[selectedLog.id] || remediationBackend.get(selectedLog.id)}
                  onRemediationUpdated={handleRemediationUpdated}
                />
              )
            ) : (
              <div className="text-center py-8 text-slate-500">
                Select an audit record to inspect technical findings.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auditor Remediation Modal Dialog */}
      <AuditorRemediationModal
        isOpen={isRemediationModalOpen}
        onClose={() => setIsRemediationModalOpen(false)}
        log={selectedRemediationLog || selectedLog}
        remediation={
          selectedRemediationLog
            ? remediations[selectedRemediationLog.id] || remediationBackend.get(selectedRemediationLog.id)
            : selectedLog
            ? remediations[selectedLog.id] || remediationBackend.get(selectedLog.id)
            : null
        }
        onRemediationUpdated={handleRemediationUpdated}
      />
    </div>
  );
};
