import React from 'react';
import { ComplianceAuditLog } from '../types/complianceAudit';
import { AuditorRemediation } from '../types/remediation';
import { AuditorRemediationInspector } from './AuditorRemediationInspector';
import { X, ShieldAlert, FileText } from 'lucide-react';

interface AuditorRemediationModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: ComplianceAuditLog | null;
  remediation: AuditorRemediation | null;
  onRemediationUpdated: (updated: AuditorRemediation) => void;
}

export const AuditorRemediationModal: React.FC<AuditorRemediationModalProps> = ({
  isOpen,
  onClose,
  log,
  remediation,
  onRemediationUpdated
}) => {
  if (!isOpen || !log || !remediation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-mono text-xs">
        {/* Top Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">
                  Compliance Auditor Remediation Workflow
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-sky-400 border border-slate-700">
                  {log.id}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block">
                {log.matterNumber} — {log.matterName}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Incident Summary Card */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-3 text-[11px]">
          <div>
            <span className="text-slate-500 block">VIOLATION TYPE:</span>
            <strong className="text-rose-400">{log.eventType}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">PRINCIPAL ACTOR:</span>
            <strong className="text-amber-300">{log.actorName}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">OFFICE:</span>
            <strong className="text-slate-300">{log.geoOffice} Practice Office</strong>
          </div>
          <div>
            <span className="text-slate-500 block">ENFORCEMENT:</span>
            <strong className="text-emerald-400">{log.actionTaken}</strong>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          <AuditorRemediationInspector
            log={log}
            remediation={remediation}
            onRemediationUpdated={onRemediationUpdated}
          />
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Remediation state is persistently tracked in the local compliance mock ledger.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
