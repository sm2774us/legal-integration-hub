import React, { useState } from 'react';
import {
  Bot,
  Terminal,
  Sparkles,
  Copy,
  Check,
  FileCode,
  Layers,
  Code
} from 'lucide-react';

export const AiDeveloperExTab: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<'claude' | 'copilot' | 'codex'>('claude');
  const [copied, setCopied] = useState(false);

  const configs = {
    claude: {
      name: 'Claude Code',
      file: 'CLAUDE.md',
      content: `# Claude Code - Legal Enterprise Integration Guidelines

## Project Context
You are working on LexisMatrix, an enterprise integration hub for an Am Law 50 global law firm.
Primary technologies:
- Frontend: TypeScript 7.0.2 + React 19.3 (Tailwind CSS, Motion, Lucide icons)
- Backend Stack 1: Python 3.13 + FastAPI 0.115 + Pydantic v2
- Backend Stack 2: C# 13 + .NET 9 Minimal API + System.Text.Json
- Line of Business: iManage Work 10 DMS REST API v2
- Compliance: Microsoft Purview DLP (Information Barriers, MNPI, Attorney-Client Privilege)
- Protocol: Model Context Protocol (MCP) JSON-RPC 2.0

## Core Rules & Non-Negotiables
1. ABA Model Rule 1.10 Ethical Walls:
   - NEVER expose matter documents to restricted/screened attorneys.
   - Every document retrieval MUST query the Ethical Wall screening engine first.
2. Microsoft Purview DLP:
   - Check all draft texts or summary payloads for MNPI (Material Non-Public Information) and privileged markers before passing to external LLMs.
3. Code Cleanliness:
   - Python: Strict Pydantic v2 models. Type hints everywhere. Run \`uv run ruff check .\` and \`uv run pytest\`.
   - C#: Use immutable \`record\` types. Depend on Native DI (\`builder.Services\`).
   - Never write mock stubs in production paths.`
    },
    copilot: {
      name: 'GitHub Copilot',
      file: '.github/copilot-instructions.md',
      content: `# GitHub Copilot Custom Repository Instructions

- You are assisting senior integration engineers at a top global law firm.
- All Python APIs must use FastAPI and validate input with Pydantic v2 schemas.
- In .NET, prefer Minimal API endpoints with typed results (\`TypedResults.Ok\`, \`TypedResults.Created\`, \`TypedResults.Problem\`).
- Maintain 100% compliance with ABA Model Rule 1.10 ethical walls across all services.
- When generating MCP tool functions, ensure standard JSON-RPC 2.0 error handling (-32602, -32601).
- Ensure all Microsoft Graph API calls use certificate-based Entra ID app credentials or validated delegated tokens.`
    },
    codex: {
      name: 'OpenAI Codex / AGENTS.md',
      file: '.codex/instructions.md & AGENTS.md',
      content: `# OpenAI Codex & Multi-Agent Architecture (AGENTS.md)

## Agent Role: Enterprise Legal Integration Specialist
- Scope: Microsoft 365, Teams, SharePoint, Power Automate, iManage DMS.
- Target: High-throughput, fault-tolerant asynchronous microservices.
- Always generate unit tests alongside any new endpoints (pytest for Python, xUnit for .NET).
- Follow Clean Architecture: separate HTTP controllers/endpoints from domain repositories and compliance scanners.`
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(configs[selectedAgent].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
          <span>AI Developer Experience Suite (Claude Code · Copilot · Codex)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Turnkey configuration files to accelerate enterprise development, automate integration scaffolding, and eliminate mundane tasks.
        </p>
      </div>

      {/* Agent Selector */}
      <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
        <button
          onClick={() => setSelectedAgent('claude')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
            selectedAgent === 'claude' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Claude Code (CLAUDE.md)</span>
        </button>
        <button
          onClick={() => setSelectedAgent('copilot')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
            selectedAgent === 'copilot' ? 'bg-sky-500/20 text-sky-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-sky-400" />
          <span>GitHub Copilot (.github/copilot-instructions.md)</span>
        </button>
        <button
          onClick={() => setSelectedAgent('codex')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
            selectedAgent === 'codex' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5 text-emerald-400" />
          <span>OpenAI Codex (.codex/instructions.md & AGENTS.md)</span>
        </button>
      </div>

      {/* Config File Inspector */}
      <div className="border border-slate-800 bg-slate-950 rounded-xl overflow-hidden shadow-sm font-mono text-xs">
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">{configs[selectedAgent].file}</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Config</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 text-slate-300 overflow-x-auto text-[11px] leading-relaxed max-h-[460px]">
          {configs[selectedAgent].content}
        </pre>
      </div>
    </div>
  );
};
