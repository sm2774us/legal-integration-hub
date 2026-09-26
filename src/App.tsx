/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { MattersEthicalWallsTab } from './components/MattersEthicalWallsTab';
import { DmsMcpStudioTab } from './components/DmsMcpStudioTab';
import { PurviewDlpTab } from './components/PurviewDlpTab';
import { CopilotStudioTab } from './components/CopilotStudioTab';
import { DualStackCompareTab } from './components/DualStackCompareTab';
import { DevOpsPipelinesTab } from './components/DevOpsPipelinesTab';
import { AiDeveloperExTab } from './components/AiDeveloperExTab';
import { DownloadsGuideTab } from './components/DownloadsGuideTab';
import { ComplianceAuditTab } from './components/ComplianceAuditTab';

import {
  INITIAL_MATTERS,
  INITIAL_DOCUMENTS,
  INITIAL_ETHICAL_WALLS,
  MCP_TOOLS
} from './data/seedData';
import { PythonFastAPIEngine } from './services/pythonBackendSimulator';
import { DotnetMinimalApiEngine } from './services/dotnetBackendSimulator';
import { LegalMatter } from './types/legalIntegration';

import {
  LayoutDashboard,
  Lock,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Bot,
  Layers,
  GitBranch,
  Sparkles,
  Download
} from 'lucide-react';

export default function App() {
  const [activeStack, setActiveStack] = useState<'python' | 'dotnet'>('python');
  const [activeTab, setActiveTab] = useState<string>('overview');

  const [matters, setMatters] = useState<LegalMatter[]>(INITIAL_MATTERS);
  const [documents] = useState(INITIAL_DOCUMENTS);
  const [ethicalWalls] = useState(INITIAL_ETHICAL_WALLS);

  // Engines
  const pythonEngine = useMemo(
    () => new PythonFastAPIEngine(matters, documents, ethicalWalls),
    [matters, documents, ethicalWalls]
  );

  const dotnetEngine = useMemo(
    () => new DotnetMinimalApiEngine(matters, documents, ethicalWalls),
    [matters, documents, ethicalWalls]
  );

  const handleAddMatter = (newMatter: LegalMatter) => {
    setMatters(prev => [newMatter, ...prev]);
  };

  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'matters_walls', label: 'Matters & Ethical Walls', icon: Lock },
    { id: 'dms_mcp', label: 'iManage DMS & MCP Studio', icon: Cpu },
    { id: 'purview_dlp', label: 'Purview DLP Scanner', icon: ShieldAlert },
    { id: 'compliance_audit', label: 'Compliance Audit', icon: ShieldCheck },
    { id: 'copilot_studio', label: 'Copilot Studio & Graph', icon: Bot },
    { id: 'dual_stack', label: 'Dual-Stack Compare', icon: Layers },
    { id: 'devops_cicd', label: 'DevOps & Protection', icon: GitBranch },
    { id: 'ai_developer_ex', label: 'AI Dev-Ex Suite', icon: Sparkles },
    { id: 'downloads_guide', label: 'Solution ZIPs & Runbook', icon: Download }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Header */}
      <Header
        activeStack={activeStack}
        onStackChange={setActiveStack}
        onOpenDownloads={() => setActiveTab('downloads_guide')}
      />

      {/* Primary Navigation Tabs */}
      <nav className="border-b border-slate-800 bg-slate-950/60 sticky top-[92px] z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {activeTab === 'overview' && (
          <OverviewTab onNavigate={setActiveTab} activeStack={activeStack} />
        )}

        {activeTab === 'matters_walls' && (
          <MattersEthicalWallsTab
            matters={matters}
            onAddMatter={handleAddMatter}
            pythonEngine={pythonEngine}
            dotnetEngine={dotnetEngine}
            activeStack={activeStack}
          />
        )}

        {activeTab === 'dms_mcp' && (
          <DmsMcpStudioTab
            documents={documents}
            mcpTools={MCP_TOOLS}
            pythonEngine={pythonEngine}
            dotnetEngine={dotnetEngine}
            activeStack={activeStack}
          />
        )}

        {activeTab === 'purview_dlp' && <PurviewDlpTab />}

        {activeTab === 'compliance_audit' && (
          <ComplianceAuditTab activeStack={activeStack} />
        )}

        {activeTab === 'copilot_studio' && (
          <CopilotStudioTab activeStack={activeStack} />
        )}

        {activeTab === 'dual_stack' && <DualStackCompareTab />}

        {activeTab === 'devops_cicd' && (
          <DevOpsPipelinesTab activeStack={activeStack} />
        )}

        {activeTab === 'ai_developer_ex' && <AiDeveloperExTab />}

        {activeTab === 'downloads_guide' && <DownloadsGuideTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-5 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span>LEXISMATRIX · Am Law 50 Legal Enterprise Integration Reference Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Microsoft 365 Copilot</span>
            <span aria-hidden="true">·</span>
            <span>iManage Work 10</span>
            <span aria-hidden="true">·</span>
            <span>Purview DLP</span>
            <span aria-hidden="true">·</span>
            <span>FastAPI & .NET 9</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
