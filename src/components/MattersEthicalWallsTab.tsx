import React, { useState } from 'react';
import {
  LegalMatter,
  LegalPracticeGroup,
  SensitivityLevel
} from '../types/legalIntegration';
import { PythonFastAPIEngine } from '../services/pythonBackendSimulator';
import { DotnetMinimalApiEngine } from '../services/dotnetBackendSimulator';
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Users,
  Lock,
  Calendar,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

interface MattersEthicalWallsTabProps {
  matters: LegalMatter[];
  onAddMatter: (matter: LegalMatter) => void;
  pythonEngine: PythonFastAPIEngine;
  dotnetEngine: DotnetMinimalApiEngine;
  activeStack: 'python' | 'dotnet';
}

export const MattersEthicalWallsTab: React.FC<MattersEthicalWallsTabProps> = ({
  matters,
  onAddMatter,
  pythonEngine,
  dotnetEngine,
  activeStack
}) => {
  const [selectedPracticeGroup, setSelectedPracticeGroup] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Conflict Checker State
  const [conflictMatterNumber, setConflictMatterNumber] = useState(matters[0]?.matterNumber || 'GT-2026-8841');
  const [conflictAttorney, setConflictAttorney] = useState('Robert Sterling');
  const [conflictResult, setConflictResult] = useState<any>(null);

  // New Matter Form State
  const [newMatterNumber, setNewMatterNumber] = useState('GT-2026-9912');
  const [newClientName, setNewClientName] = useState('Vanguard Quantum Defense LLC');
  const [newMatterName, setNewMatterName] = useState('CFIUS Defense & Department of Defense Secure Communications Licensing');
  const [newPracticeGroup, setNewPracticeGroup] = useState<LegalPracticeGroup>('Corporate M&A');
  const [newLeadPartner, setNewLeadPartner] = useState('Victoria Vance, Esq.');
  const [newRestricted, setNewRestricted] = useState('Robert Sterling');
  const [newSensitivity, setNewSensitivity] = useState<SensitivityLevel>('Highly Confidential (MNPI)');
  const [formError, setFormError] = useState<string | null>(null);

  const practiceGroups: (string | LegalPracticeGroup)[] = [
    'All',
    'Corporate M&A',
    'Antitrust & Competition',
    'Intellectual Property Litigation',
    'White Collar & Regulatory Enforcement',
    'Commercial Real Estate'
  ];

  const filteredMatters = matters.filter(m => {
    const matchesGroup = selectedPracticeGroup === 'All' || m.practiceGroup === selectedPracticeGroup;
    const matchesSearch =
      m.matterNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.matterName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const handleRunConflictCheck = () => {
    let res: any;
    if (activeStack === 'python') {
      res = pythonEngine.checkEthicalWallAccess(conflictMatterNumber, conflictAttorney);
    } else {
      res = dotnetEngine.checkEthicalWallAccess(conflictMatterNumber, conflictAttorney);
    }
    setConflictResult(res);
  };

  const handleCreateMatter = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload: Partial<LegalMatter> = {
      matterNumber: newMatterNumber,
      clientName: newClientName,
      matterName: newMatterName,
      practiceGroup: newPracticeGroup,
      leadPartner: newLeadPartner,
      restrictedAttorneys: newRestricted ? newRestricted.split(',').map(s => s.trim()) : [],
      assignedAttorneys: [newLeadPartner, 'Marcus Vance', 'Sarah Jenkins'],
      purviewSensitivity: newSensitivity,
      retentionYears: 10
    };

    let response: any;
    if (activeStack === 'python') {
      response = pythonEngine.createMatter(payload);
    } else {
      response = dotnetEngine.createMatter(payload);
    }

    if (response.statusCode >= 400) {
      if (response.error?.detail) {
        setFormError(
          typeof response.error.detail === 'string'
            ? response.error.detail
            : JSON.stringify(response.error.detail, null, 2)
        );
      } else if (response.error?.errors) {
        setFormError(JSON.stringify(response.error.errors, null, 2));
      } else {
        setFormError('Validation error occurred while executing backend serializer.');
      }
      return;
    }

    if (response.data) {
      onAddMatter(response.data);
      setShowCreateModal(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <span>Enterprise Legal Matters & Ethical Walls</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time ABA Model Rule 1.10 information barrier enforcement across iManage, Microsoft 365, and Copilot Studio.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Enterprise Matter</span>
        </button>
      </div>

      {/* Interactive Conflict Screening Simulator Box */}
      <div className="border border-amber-500/30 bg-slate-900/80 rounded-xl p-5 md:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
            <Lock className="w-4 h-4" />
            <span>Interactive Conflict Clearance & Ethical Wall Screen Evaluator</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Backend Engine: {activeStack === 'python' ? 'FastAPI Python 3.13' : '.NET 9 Minimal API'}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Simulate an attorney or Copilot Studio agent requesting clearance to ground or view documents on an active deal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Target Matter Number</label>
            <select
              value={conflictMatterNumber}
              onChange={e => setConflictMatterNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {matters.map(m => (
                <option key={m.id} value={m.matterNumber}>
                  {m.matterNumber} - {m.clientName.slice(0, 28)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Personnel / Attorney Name</label>
            <input
              type="text"
              value={conflictAttorney}
              onChange={e => setConflictAttorney(e.target.value)}
              placeholder="e.g. Robert Sterling or Sarah Jenkins"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunConflictCheck}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 font-medium rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Verify Clearance Rule</span>
            </button>
          </div>
        </div>

        {/* Live Conflict Screen Result Display */}
        {conflictResult && (
          <div
            className={`mt-4 p-4 rounded-lg border text-xs font-mono transition-all ${
              conflictResult.data?.decision === 'BLOCKED_BY_ETHICAL_WALL'
                ? 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                : conflictResult.data?.decision === 'PERMITTED'
                ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                : 'bg-amber-950/30 border-amber-800/80 text-amber-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold flex items-center gap-1.5 uppercase tracking-wide">
                {conflictResult.data?.decision === 'BLOCKED_BY_ETHICAL_WALL' ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>STATUS: 403 ACCESS DENIED (ETHICAL WALL SCREEN ACTIVE)</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>STATUS: 200 OK (AUTHORIZED ON MATTER TEAM)</span>
                  </>
                )}
              </span>
              <span className="text-[11px] text-slate-400">
                Server: {conflictResult.headers?.server || conflictResult.serverRuntime}
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed mb-3">
              {conflictResult.data?.explanation}
            </p>

            <div className="text-[11px] text-slate-400 border-t border-slate-800/60 pt-2 flex flex-wrap gap-4">
              <span>Purview Sensitivity: <strong className="text-slate-200">{conflictResult.data?.purviewLabel}</strong></span>
              <span>Checked At: {conflictResult.data?.checkedAtUtc}</span>
              <span>Information Barrier Audit: Logged to Purview Event Hub</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Practice Group Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          {practiceGroups.map(grp => (
            <button
              key={grp}
              onClick={() => setSelectedPracticeGroup(grp)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                selectedPracticeGroup === grp
                  ? 'bg-slate-800 text-amber-300 font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search matter, client, number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Legal Matters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMatters.map(m => (
          <div
            key={m.id}
            className="border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition-colors rounded-xl p-5 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-amber-400 font-semibold">
                  {m.matterNumber}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {m.practiceGroup}
                </span>
              </div>

              <h3 className="font-serif text-base font-bold text-slate-100 leading-snug">
                {m.matterName}
              </h3>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Client: <strong className="text-slate-300">{m.clientName}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Lead: {m.leadPartner}</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {m.description}
              </p>
            </div>

            {/* Matter Metadata & Ethical Walls */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Purview Sensitivity:</span>
                <span className="font-mono text-slate-200 font-medium">
                  {m.purviewSensitivity}
                </span>
              </div>

              {/* Ethical Wall Screened List */}
              {m.restrictedAttorneys.length > 0 ? (
                <div className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-300 font-medium text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Active Ethical Wall Restrictions (ABA Rule 1.10):</span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[11px] text-rose-200 font-mono">
                    {m.restrictedAttorneys.map((att, idx) => (
                      <span key={idx} className="bg-rose-900/30 px-1.5 py-0.5 rounded">
                        {att} [BLOCKED]
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 font-mono">
                  No active ethical screens on this matter.
                </div>
              )}

              {/* Workspaces & Integrations Links */}
              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <FolderOpen className="w-3 h-3 text-sky-400" />
                  {m.iManageWorkspaceId}
                </span>
                <span>Teams Deal Room: Active</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Matter Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-slate-100">
                Open New Enterprise Legal Matter
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Provision workspace in iManage Work 10, initialize SharePoint deal library, and configure Ethical Wall screen in Purview.
            </p>

            {formError && (
              <div className="bg-rose-950/40 border border-rose-800 p-3 rounded-lg text-xs font-mono text-rose-200">
                <strong>Validation Failed:</strong>
                <pre className="whitespace-pre-wrap mt-1 text-[11px]">{formError}</pre>
              </div>
            )}

            <form onSubmit={handleCreateMatter} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Matter Number (GT-YYYY-NNNN)</label>
                  <input
                    type="text"
                    value={newMatterNumber}
                    onChange={e => setNewMatterNumber(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Practice Group</label>
                  <select
                    value={newPracticeGroup}
                    onChange={e => setNewPracticeGroup(e.target.value as LegalPracticeGroup)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="Corporate M&A">Corporate M&A</option>
                    <option value="Antitrust & Competition">Antitrust & Competition</option>
                    <option value="Intellectual Property Litigation">Intellectual Property Litigation</option>
                    <option value="White Collar & Regulatory Enforcement">White Collar & Regulatory Enforcement</option>
                    <option value="Commercial Real Estate">Commercial Real Estate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Client Name</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Matter Title</label>
                <input
                  type="text"
                  value={newMatterName}
                  onChange={e => setNewMatterName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Lead Responsible Partner</label>
                  <input
                    type="text"
                    value={newLeadPartner}
                    onChange={e => setNewLeadPartner(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Purview Sensitivity</label>
                  <select
                    value={newSensitivity}
                    onChange={e => setNewSensitivity(e.target.value as SensitivityLevel)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="General">General</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Highly Confidential (MNPI)">Highly Confidential (MNPI)</option>
                    <option value="Attorney-Client Privileged">Attorney-Client Privileged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">
                  Restricted Attorneys (Ethical Screen - comma separated)
                </label>
                <input
                  type="text"
                  value={newRestricted}
                  onChange={e => setNewRestricted(e.target.value)}
                  placeholder="e.g. Robert Sterling, Katherine Miller"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded cursor-pointer"
                >
                  Create & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
