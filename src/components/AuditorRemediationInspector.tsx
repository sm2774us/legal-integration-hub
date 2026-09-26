import React, { useState, useEffect } from 'react';
import { ComplianceAuditLog } from '../types/complianceAudit';
import {
  ResolutionTag,
  AuditorRemediation,
  AuditorNoteEntry,
  RESOLUTION_TAG_META,
  remediationBackend
} from '../types/remediation';
import {
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Clock,
  UserCheck,
  FileEdit,
  Tag,
  Send,
  MessageSquare,
  AlertTriangle,
  FileText,
  CornerDownRight,
  Sparkles,
  Check
} from 'lucide-react';

interface AuditorRemediationInspectorProps {
  log: ComplianceAuditLog;
  remediation: AuditorRemediation;
  onRemediationUpdated: (updated: AuditorRemediation) => void;
  currentUser?: {
    name: string;
    role: string;
  };
}

export const AuditorRemediationInspector: React.FC<AuditorRemediationInspectorProps> = ({
  log,
  remediation,
  onRemediationUpdated,
  currentUser = {
    name: 'Sarah Sterling, Esq.',
    role: 'Lead Ethics & Compliance Counsel'
  }
}) => {
  const [selectedTag, setSelectedTag] = useState<ResolutionTag>(remediation.status);
  const [noteText, setNoteText] = useState('');
  const [actionItem, setActionItem] = useState('');
  const [authorName, setAuthorName] = useState(currentUser.name);
  const [authorRole, setAuthorRole] = useState(currentUser.role);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selected tag when selected log changes
  useEffect(() => {
    setSelectedTag(remediation.status);
    setNoteText('');
    setActionItem('');
    setSaveSuccess(false);
  }, [remediation.logId, remediation.status]);

  const currentMeta = RESOLUTION_TAG_META[remediation.status];

  // Quick note templates for compliance auditors
  const quickTemplates = [
    {
      title: 'Ethical Screen Upheld',
      text: 'Verified ABA Model Rule 1.10 screen was enforced by Entra ID. No restricted client work-product accessed.',
      tag: 'REMEDIATED' as ResolutionTag,
      action: 'Confirm ethical wall boundaries intact in iManage Work 10.'
    },
    {
      title: 'False Positive / Carve-Out',
      text: 'Investigation confirmed authorized deal team carve-out consent granted by billing partner.',
      tag: 'FALSE_POSITIVE' as ResolutionTag,
      action: 'Updated matter access roster to avoid recurring DLP flags.'
    },
    {
      title: 'CFIUS / Statutory Notice',
      text: 'Potential cross-border export violation of technical specifications. Transmitted to General Counsel per CFIUS protocol.',
      tag: 'ESCALATED_GC' as ResolutionTag,
      action: 'Prepare Section 721 mandatory disclosure memorandum.'
    },
    {
      title: 'Purview Token Revoked',
      text: 'Elevated sensitivity label to Highly Confidential (MNPI). M365 Copilot grounding token and active session revoked.',
      tag: 'REMEDIATED' as ResolutionTag,
      action: 'User re-credentialed with read-only watermark restrictions.'
    }
  ];

  const handleApplyTemplate = (tpl: typeof quickTemplates[0]) => {
    setNoteText(tpl.text);
    setActionItem(tpl.action);
    setSelectedTag(tpl.tag);
  };

  const handleSaveRemediation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() && selectedTag === remediation.status) {
      return;
    }

    setIsSubmitting(true);

    const updated = remediationBackend.addNote(
      log.id,
      authorName,
      authorRole,
      noteText.trim() || `Status updated to ${RESOLUTION_TAG_META[selectedTag].label}`,
      selectedTag,
      actionItem.trim() || undefined
    );

    onRemediationUpdated(updated);
    setNoteText('');
    setActionItem('');
    setSaveSuccess(true);
    setIsSubmitting(false);

    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleQuickStatusChange = (newTag: ResolutionTag) => {
    setSelectedTag(newTag);
    const updated = remediationBackend.updateStatus(
      log.id,
      newTag,
      `${authorName} (${authorRole})`
    );
    onRemediationUpdated(updated);
  };

  return (
    <div className="border border-slate-800 bg-slate-900/90 rounded-xl p-4 font-mono text-xs space-y-4 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-100 uppercase tracking-wide">
            Remediation & Auditor Tracking
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${currentMeta.badgeClass}`}
          >
            {currentMeta.shortLabel}
          </span>
          <span className="text-[10px] text-slate-500">{log.id}</span>
        </div>
      </div>

      {/* Current Remediation Status Banner */}
      <div className={`p-3 rounded-lg border ${currentMeta.bgClass} ${currentMeta.borderClass}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: currentMeta.dotColor }}
              />
              <span className={`font-bold ${currentMeta.textClass}`}>{currentMeta.label}</span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-normal">
              {currentMeta.description}
            </p>
          </div>
          {remediation.resolvedBy && (
            <div className="text-right text-[10px] text-slate-400 shrink-0">
              <span className="block text-slate-500">Last Reviewer:</span>
              <strong className="text-slate-200">{remediation.resolvedBy}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Resolution Tag Quick Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-amber-400" />
            <span>SET RESOLUTION STATUS:</span>
          </span>
          <span className="text-[10px] text-slate-500 font-normal">Click to update status</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {(Object.keys(RESOLUTION_TAG_META) as ResolutionTag[]).map(tagKey => {
            const meta = RESOLUTION_TAG_META[tagKey];
            const isCurrent = selectedTag === tagKey;

            return (
              <button
                key={tagKey}
                type="button"
                onClick={() => handleQuickStatusChange(tagKey)}
                className={`p-2 rounded text-left border transition-all cursor-pointer text-[10px] ${
                  isCurrent
                    ? `${meta.bgClass} ${meta.borderClass} ${meta.textClass} ring-1 ring-sky-500/50 font-bold shadow-sm`
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{meta.shortLabel}</span>
                  {isCurrent && <Check className="w-3 h-3 ml-1 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Auditor Note Form */}
      <form onSubmit={handleSaveRemediation} className="space-y-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
            <FileEdit className="w-3 h-3 text-sky-400" />
            <span>ATTACH AUDITOR NOTE & ACTION PLAN:</span>
          </label>

          <span className="text-[10px] text-slate-500">Stored in local remediation ledger</span>
        </div>

        {/* Quick Template Chips */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 block">Pre-approved Legal Templates:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {quickTemplates.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-sky-300 border border-slate-800 hover:border-sky-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5 text-sky-400" />
                <span>{tpl.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note Textarea */}
        <div>
          <textarea
            rows={3}
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Enter legal auditor rationale, interviews conducted, client ethical wall review, or reason for status update..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-sans"
          />
        </div>

        {/* Action Item Field */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">
              Required Remediation Action:
            </label>
            <input
              type="text"
              value={actionItem}
              onChange={e => setActionItem(e.target.value)}
              placeholder="e.g. Revoke M365 session / notify GC"
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Auditor Identity:</label>
            <input
              type="text"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          {saveSuccess ? (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Remediation note committed to ledger!</span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-500">
              {remediation.notes.length} notes recorded on this record
            </span>
          )}

          <button
            type="submit"
            disabled={isSubmitting || (!noteText.trim() && selectedTag === remediation.status)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Send className="w-3 h-3" />
            <span>Commit Remediation</span>
          </button>
        </div>
      </form>

      {/* Chronological Remediation Audit Trail */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>CHRONOLOGICAL REMEDIATION TRAIL:</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {remediation.notes.length} entries
          </span>
        </div>

        {remediation.notes.length === 0 ? (
          <div className="p-3 bg-slate-950/60 rounded border border-slate-800 text-center text-slate-500 text-[11px]">
            No auditor notes attached yet. Set a resolution status or attach a note above.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {remediation.notes.map(note => {
              const noteMeta = RESOLUTION_TAG_META[note.tag];
              return (
                <div
                  key={note.id}
                  className="p-2.5 bg-slate-950 rounded border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <strong className="text-slate-200">{note.author}</strong>
                      <span className="text-slate-500">({note.authorRole})</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${noteMeta.badgeClass}`}
                      >
                        {noteMeta.shortLabel}
                      </span>
                      <span className="text-slate-500">
                        {new Date(note.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {note.note}
                  </p>

                  {note.actionItem && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-300/90 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/40">
                      <CornerDownRight className="w-2.5 h-2.5 shrink-0" />
                      <span>Action: {note.actionItem}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
