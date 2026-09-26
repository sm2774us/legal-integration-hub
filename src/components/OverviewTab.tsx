import React from 'react';
import {
  ShieldCheck,
  Server,
  Cpu,
  Bot,
  Terminal,
  FileCheck,
  Lock,
  GitBranch,
  ArrowRight,
  Database,
  ExternalLink
} from 'lucide-react';

interface OverviewTabProps {
  onNavigate: (tabId: string) => void;
  activeStack: 'python' | 'dotnet';
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigate, activeStack }) => {
  return (
    <div className="space-y-8">
      {/* Hero Banner / Executive Summary */}
      <div className="border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 md:p-8 rounded-xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-mono tracking-wider uppercase">
            <span>Am Law 50 Law Firm Enterprise Architecture</span>
            <span aria-hidden="true">·</span>
            <span>AI & Data Platform Enablement Team</span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl text-slate-100 font-bold tracking-tight">
            Production-Grade Legal Integration Hub & Dual-Stack Reference Platform
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Engineered to illustrate state-of-the-art enterprise integration patterns for global law firms.
            Bridges <strong className="text-slate-100">Microsoft 365 Copilot</strong>, <strong className="text-slate-100">Copilot Studio</strong>, <strong className="text-slate-100">iManage Work 10 DMS</strong>, <strong className="text-slate-100">Microsoft Graph</strong>, and <strong className="text-slate-100">Purview Information Barriers</strong> across two identical, high-throughput backend implementations: <span className="text-amber-300 font-medium">FastAPI (Python 3.13)</span> and <span className="text-sky-300 font-medium">.NET 9 Minimal API (C#)</span>.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('matters_walls')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Explore Ethical Walls & Matters</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('dms_mcp')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Model Context Protocol (MCP) Studio</span>
            </button>
            <button
              onClick={() => onNavigate('compliance_audit')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Compliance Audit Stream</span>
            </button>
            <button
              onClick={() => onNavigate('downloads_guide')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Download Project ZIPs & Readme</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enterprise Architecture ASCII Diagram */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-200 font-medium text-sm">
            <Server className="w-4 h-4 text-amber-400" />
            <span>End-to-End Enterprise System Topology</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Active Mode: {activeStack === 'python' ? 'Python 3.13 (FastAPI)' : 'C# .NET 9 (Minimal API)'}
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
          <pre>{`
  ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                           ENTERPRISE USER SURFACES & AI CLIENTS                                 │
  │  [Microsoft 365 Copilot]  [Copilot Studio Agents]  [Teams Deal Rooms]  [React 19 / TS 7 Client] │
  └─────────────────────────────────┬───────────────────────────────┬───────────────────────────────┘
                                    │                               │
                                    │ (OAuth 2.0 / Entra ID Bearer) │ (REST / WebSocket / MCP)
                                    ▼                               ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                   LEXISMATRIX API GATEWAY & ENTERPRISE INTEGRATION LAYER                        │
  │                                                                                                 │
  │   STACK 1: Python 3.13 + FastAPI 0.115       ◄─── DUAL-STACK ───►  STACK 2: C# .NET 9 Minimal API│
  │   - Pydantic v2 Strict Validation Schema                          - C# Records & System.Text.Json│
  │   - FastAPI Dependency Injection (Depends)                        - Native DI (builder.Services) │
  │   - Uvicorn Asynchronous Event Loop                               - Kestrel High-Throughput I/O  │
  └──────────────────┬──────────────────────────────┬──────────────────────────────┬────────────────┘
                     │                              │                              │
                     ▼                              ▼                              ▼
  ┌──────────────────────────────┐┌──────────────────────────────┐┌─────────────────────────────────┐
  │   ABA 1.10 ETHICAL WALLS     ││   MICROSOFT PURVIEW DLP      ││   iManage WORK 10 DMS & MCP     │
  │   - Screening Rule Evaluator ││   - MNPI Classification      ││   - REST API v2 Connector       │
  │   - Cross-practice Isolation ││   - Attorney-Client Privilege││   - MCP JSON-RPC 2.0 Server     │
  │   - Real-time Audit Trail    ││   - PII / SSN / Financial    ││   - Workspace Document Vault    │
  └──────────────────────────────┘└──────────────────────────────┘└─────────────────────────────────┘
                     │                              │                              │
                     └──────────────────────┬───────────────────────────────────────┘
                                            ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                  MICROSOFT GRAPH API & POWER PLATFORM DATAVERSE CONNECTOR                       │
  │   - Teams Channel Notifications & Adaptive Cards    - SharePoint Document Library Sync          │
  │   - Entra ID Security Group Membership Sync         - Power Automate Deal-Room Automation Flows │
  └─────────────────────────────────────────────────────────────────────────────────────────────────┘
`}</pre>
        </div>
      </div>

      {/* Senior Role Qualifications & Enterprise Standards Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1 */}
        <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-sm">
            <Lock className="w-4 h-4" />
            <span>Ethical Walls & ABA Model Rule 1.10</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            In professional legal services, confidentiality is paramount. Our engine enforces real-time information barriers, blocking screened attorneys from iManage workspaces, Teams deal channels, and M365 Copilot vector groundings.
          </p>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono">
            <span>Screen Enforcement: Active</span>
            <span className="text-emerald-400">Strict Quarantine</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-sky-400 font-semibold text-sm">
            <Bot className="w-4 h-4" />
            <span>Copilot Studio & MCP Servers</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Deploys Model Context Protocol (MCP) servers and Copilot Studio declarative plugins, exposing firm-approved document search and summary tools that strictly honor security scopes and ethical barriers.
          </p>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono">
            <span>Protocol: MCP JSON-RPC 2.0</span>
            <span className="text-purple-400">Copilot Studio Ready</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-purple-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Microsoft Purview & DLP</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pre-flight inspection for Material Non-Public Information (MNPI), Attorney-Client Privilege markings, and PII. Blocks accidental data leakage before sending payloads to external connectors.
          </p>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono">
            <span>DLP Engine: Real-Time</span>
            <span className="text-amber-400">Sensitivity Labels</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm">
            <GitBranch className="w-4 h-4" />
            <span>Enterprise CI/CD & Protection</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Includes main branch protection policies, Lefthook pre-commit hooks (ruff, mypy, pytest, dotnet-format, eslint), PR approval gates (<code className="text-slate-300">open-pr.yml</code>), and two-phase semver changelog releases.
          </p>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono">
            <span>CI Coverage Gate: 100% Core</span>
            <span className="text-emerald-400">Branch Protected</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-rose-400 font-semibold text-sm">
            <Database className="w-4 h-4" />
            <span>Dual-Stack Architecture</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Directly fulfills both primary law firm backend ecosystems: Python 3.13 (FastAPI, Pydantic v2) for rapid AI prototyping, and C# .NET 9 Minimal API for high-volume enterprise data pipelines.
          </p>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono">
            <span>Re-usable React 19 Frontend</span>
            <span className="text-sky-400">1:1 Feature Parity</span>
          </div>
        </div>

        {/* Card 6 */}
        <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-400 font-semibold text-sm">
            <Terminal className="w-4 h-4" />
            <span>AI Dev-Ex Suite</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Full out-of-the-box configuration for <strong className="text-slate-200">Claude Code</strong> (<code className="text-slate-300">CLAUDE.md</code>), <strong className="text-slate-200">GitHub Copilot</strong>, and <strong className="text-slate-200">OpenAI Codex</strong> to accelerate development and eliminate mundane integration tasks.
          </p>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono">
            <span>Tools: Claude · Copilot · Codex</span>
            <span className="text-indigo-400">Prompt Anchored</span>
          </div>
        </div>
      </div>

      {/* Greenberg Traurig / Am Law 50 Job Requisition Alignment Table */}
      <div className="border border-slate-800 bg-slate-900/30 rounded-xl p-5 md:p-6 space-y-4">
        <h3 className="font-serif text-lg font-bold text-slate-200">
          Requisition Alignment: Enterprise Integration Engineer (AI & Data Platform Enablement)
        </h3>
        <p className="text-xs text-slate-400">
          Detailed breakdown demonstrating how this showcase satisfies and exceeds every single competency specified in the Greenberg Traurig (GT) job requisition.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3">Role Competency</th>
                <th className="py-2.5 px-3">Law Firm Production Requirement</th>
                <th className="py-2.5 px-3">LexisMatrix Implementation</th>
                <th className="py-2.5 px-3">Verification Artifact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-100">Microsoft Graph & REST APIs</td>
                <td className="py-3 px-3 text-slate-400">OAuth 2.0 app-only & delegated flows, Teams channel card alerts</td>
                <td className="py-3 px-3 text-emerald-400">Entra ID token refresh, adaptive card dispatcher</td>
                <td className="py-3 px-3 text-slate-400">/src/services/dotnetBackendSimulator.ts</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-100">iManage Work 10 DMS</td>
                <td className="py-3 px-3 text-slate-400">Document retrieval, ethical screening, workspace management</td>
                <td className="py-3 px-3 text-emerald-400">REST v2 connector with ABA Rule 1.10 screen gates</td>
                <td className="py-3 px-3 text-slate-400">Tab: iManage MCP Studio</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-100">MCP (Model Context Protocol)</td>
                <td className="py-3 px-3 text-slate-400">Installing & supporting MCP servers in enterprise</td>
                <td className="py-3 px-3 text-emerald-400">JSON-RPC 2.0 tools/list and tools/call endpoints</td>
                <td className="py-3 px-3 text-slate-400">scripts/mcp_imanage_server.py</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-100">Microsoft Purview & DLP</td>
                <td className="py-3 px-3 text-slate-400">Sensitivity labels, MNPI safeguards, privileged work product</td>
                <td className="py-3 px-3 text-emerald-400">Regex & semantic scanner preventing copilot export</td>
                <td className="py-3 px-3 text-slate-400">/src/services/dlpScanner.ts</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-100">PowerShell & Multi-Language</td>
                <td className="py-3 px-3 text-slate-400">PowerShell 7, Python 3.13, TypeScript, and C#</td>
                <td className="py-3 px-3 text-emerald-400">Full PowerShell audit scripts + dual Python & C# backends</td>
                <td className="py-3 px-3 text-slate-400">scripts/M365-EthicalWall-Audit.ps1</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-100">M365 Copilot & Studio</td>
                <td className="py-3 px-3 text-slate-400">Declarative plugins, custom connectors, Dataverse grounding</td>
                <td className="py-3 px-3 text-emerald-400">OpenAPI plugin manifests and live payload simulators</td>
                <td className="py-3 px-3 text-slate-400">Tab: Copilot Studio</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
