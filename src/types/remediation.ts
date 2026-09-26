export type ResolutionTag =
  | 'UNREVIEWED'
  | 'UNDER_INVESTIGATION'
  | 'FALSE_POSITIVE'
  | 'REMEDIATED'
  | 'ESCALATED_GC'
  | 'CLIENT_DISCLOSED';

export interface AuditorNoteEntry {
  id: string;
  author: string;
  authorRole: string;
  timestamp: string;
  note: string;
  tag: ResolutionTag;
  actionItem?: string;
}

export interface AuditorRemediation {
  logId: string;
  status: ResolutionTag;
  resolvedBy?: string;
  resolvedAt?: string;
  notes: AuditorNoteEntry[];
  lastUpdated: string;
}

export const RESOLUTION_TAG_META: Record<
  ResolutionTag,
  {
    label: string;
    shortLabel: string;
    description: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    badgeClass: string;
    dotColor: string;
  }
> = {
  UNREVIEWED: {
    label: 'Awaiting Auditor Review',
    shortLabel: 'Unreviewed',
    description: 'Fresh DLP event pending initial triage by compliance auditor.',
    bgClass: 'bg-slate-900/60',
    borderClass: 'border-slate-700',
    textClass: 'text-slate-300',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    dotColor: '#94a3b8'
  },
  UNDER_INVESTIGATION: {
    label: 'Under Active Investigation',
    shortLabel: 'Investigating',
    description: 'SecOps and ethics counsel analyzing scope of unauthorized access attempt.',
    bgClass: 'bg-amber-950/60',
    borderClass: 'border-amber-700',
    textClass: 'text-amber-300',
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800',
    dotColor: '#f59e0b'
  },
  FALSE_POSITIVE: {
    label: 'Authorized / False Positive',
    shortLabel: 'False Positive',
    description: 'Investigated and confirmed benign: user had verified carve-out consent or test activity.',
    bgClass: 'bg-emerald-950/60',
    borderClass: 'border-emerald-700',
    textClass: 'text-emerald-300',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    dotColor: '#10b981'
  },
  REMEDIATED: {
    label: 'Remediated & Revoked',
    shortLabel: 'Remediated',
    description: 'Access tokens revoked, document quarantined, and user re-credentialed.',
    bgClass: 'bg-blue-950/60',
    borderClass: 'border-blue-700',
    textClass: 'text-blue-300',
    badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-800',
    dotColor: '#3b82f6'
  },
  ESCALATED_GC: {
    label: 'Escalated to General Counsel',
    shortLabel: 'Escalated to GC',
    description: 'Potential ABA 1.10 conflict or CFIUS statutory disclosure forwarded to General Counsel.',
    bgClass: 'bg-purple-950/60',
    borderClass: 'border-purple-700',
    textClass: 'text-purple-300',
    badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-800',
    dotColor: '#a855f7'
  },
  CLIENT_DISCLOSED: {
    label: 'Client Disclosed & Notified',
    shortLabel: 'Client Disclosed',
    description: 'Mandatory breach notice transmitted to client general counsel per Engagement Terms.',
    bgClass: 'bg-rose-950/60',
    borderClass: 'border-rose-700',
    textClass: 'text-rose-300',
    badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-800',
    dotColor: '#f43f5e'
  }
};

const STORAGE_KEY = 'lexismatrix_compliance_remediations_v2';

export const INITIAL_REMEDIATION_STORE: Record<string, AuditorRemediation> = {
  'AUD-9021': {
    logId: 'AUD-9021',
    status: 'UNDER_INVESTIGATION',
    resolvedBy: 'H. Vance (Ethics Counsel)',
    resolvedAt: '2026-09-25T20:12:00Z',
    lastUpdated: '2026-09-25T20:12:00Z',
    notes: [
      {
        id: 'NOTE-101',
        author: 'H. Vance, Esq.',
        authorRole: 'Ethics Committee Counsel',
        timestamp: '2026-09-25T20:12:00Z',
        tag: 'UNDER_INVESTIGATION',
        note: 'Screened partner attempted direct REST API sync from iManage Work 10. Audit logs pulled. Interview scheduled with matter billing partner.',
        actionItem: 'Temporarily suspend Entra ID service principal token for WS-APEX-8841.'
      }
    ]
  },
  'AUD-9020': {
    logId: 'AUD-9020',
    status: 'ESCALATED_GC',
    resolvedBy: 'S. Reynolds (SecOps Lead)',
    resolvedAt: '2026-09-25T20:01:10Z',
    lastUpdated: '2026-09-25T20:01:10Z',
    notes: [
      {
        id: 'NOTE-102',
        author: 'S. Reynolds',
        authorRole: 'Senior SecOps Lead',
        timestamp: '2026-09-25T20:01:10Z',
        tag: 'ESCALATED_GC',
        note: 'CFIUS export-controlled EUV lithography parameters detected in M365 Copilot grounding prompt. Escalated to Firm General Counsel per CFIUS compliance protocol.',
        actionItem: 'File confidential Section 721 notice memorandum with Office of General Counsel.'
      }
    ]
  },
  'AUD-9019': {
    logId: 'AUD-9019',
    status: 'REMEDIATED',
    resolvedBy: 'L. Chen (Compliance Auditor)',
    resolvedAt: '2026-09-25T19:48:00Z',
    lastUpdated: '2026-09-25T19:48:00Z',
    notes: [
      {
        id: 'NOTE-103',
        author: 'L. Chen',
        authorRole: 'Compliance Auditor',
        timestamp: '2026-09-25T19:48:00Z',
        tag: 'REMEDIATED',
        note: 'Confirmed automatic Purview label upgrade to Highly Confidential (MNPI) was applied properly. SSN records encrypted in SharePoint.',
        actionItem: 'No further action required; verified watermark enforced on downstream previews.'
      }
    ]
  },
  'AUD-9018': {
    logId: 'AUD-9018',
    status: 'FALSE_POSITIVE',
    resolvedBy: 'A. Miller (Senior Auditor)',
    resolvedAt: '2026-09-25T19:35:00Z',
    lastUpdated: '2026-09-25T19:35:00Z',
    notes: [
      {
        id: 'NOTE-104',
        author: 'A. Miller',
        authorRole: 'Senior Compliance Auditor',
        timestamp: '2026-09-25T19:35:00Z',
        tag: 'FALSE_POSITIVE',
        note: 'Attorney was inadvertently linked to old patent matter group. Verified no privileged BioVax documents were accessed or downloaded.',
        actionItem: 'Removed user from legacy distribution list and revalidated Entra ID Information Barrier boundary.'
      }
    ]
  }
};

/**
 * Local mock backend service for Auditor Remediations
 */
export const remediationBackend = {
  getAll(): Record<string, AuditorRemediation> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...INITIAL_REMEDIATION_STORE, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return INITIAL_REMEDIATION_STORE;
  },

  get(logId: string): AuditorRemediation {
    const all = this.getAll();
    if (all[logId]) {
      return all[logId];
    }
    return {
      logId,
      status: 'UNREVIEWED',
      notes: [],
      lastUpdated: new Date().toISOString()
    };
  },

  save(remediation: AuditorRemediation): void {
    try {
      const all = this.getAll();
      all[remediation.logId] = remediation;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
      console.warn('Failed to save remediation to localStorage', e);
    }
  },

  addNote(
    logId: string,
    author: string,
    authorRole: string,
    noteText: string,
    tag: ResolutionTag,
    actionItem?: string
  ): AuditorRemediation {
    const current = this.get(logId);
    const newNote: AuditorNoteEntry = {
      id: `NOTE-${Date.now().toString().slice(-5)}`,
      author: author.trim() || 'Compliance Auditor',
      authorRole: authorRole.trim() || 'Senior Compliance Analyst',
      timestamp: new Date().toISOString(),
      note: noteText.trim(),
      tag,
      actionItem: actionItem?.trim() || undefined
    };

    const updated: AuditorRemediation = {
      ...current,
      status: tag,
      resolvedBy: `${newNote.author} (${newNote.authorRole})`,
      resolvedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      notes: [newNote, ...current.notes]
    };

    this.save(updated);
    return updated;
  },

  updateStatus(logId: string, status: ResolutionTag, author: string): AuditorRemediation {
    const current = this.get(logId);
    const updated: AuditorRemediation = {
      ...current,
      status,
      resolvedBy: author,
      resolvedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    this.save(updated);
    return updated;
  },

  resetDefaults(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REMEDIATION_STORE));
    } catch {
      // ignore
    }
  }
};
