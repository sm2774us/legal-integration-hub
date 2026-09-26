import React, { useState } from 'react';
import { generateFastApiZip, generateDotnetZip } from '../services/zipBundleGenerator';
import {
  Download,
  Terminal,
  FileCode,
  FolderArchive,
  CheckCircle,
  Laptop,
  Layers,
  ArrowDownToLine,
  FileCheck
} from 'lucide-react';

export const DownloadsGuideTab: React.FC = () => {
  const [downloadingStack, setDownloadingStack] = useState<string | null>(null);

  const handleDownload = async (type: 'python' | 'dotnet' | 'both') => {
    setDownloadingStack(type);

    try {
      if (type === 'python' || type === 'both') {
        const pyBlob = await generateFastApiZip();
        const url = URL.createObjectURL(pyBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lexismatrix-fastapi-py313.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      if (type === 'dotnet' || type === 'both') {
        const dotBlob = await generateDotnetZip();
        const url = URL.createObjectURL(dotBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lexismatrix-dotnet9-minimalapi.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setDownloadingStack(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
          <span>Solution Packages, Compilation Runbooks & Wireframe Blueprints</span>
        </h2>
        <p className="text-xs text-slate-400">
          Download complete, importable GitHub repositories ready to unzip, build, test, and run on Windows 11 and Ubuntu Linux.
        </p>
      </div>

      {/* Download Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: FastAPI Python */}
        <div className="border border-amber-500/30 bg-slate-900/60 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-amber-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <Terminal className="w-4 h-4" />
                <span>TECH STACK 1</span>
              </span>
              <span>Python 3.13</span>
            </div>
            <h3 className="font-serif text-base font-bold text-slate-100">
              FastAPI + Pydantic v2 + React 19
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete repository with FastAPI backend, Pydantic v2 schemas, iManage DMS connector, Purview DLP engine, MCP JSON-RPC server, and full test suite.
            </p>
          </div>

          <button
            onClick={() => handleDownload('python')}
            disabled={downloadingStack !== null}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingStack === 'python' ? 'Generating ZIP...' : 'Download FastAPI Solution (.zip)'}</span>
          </button>
        </div>

        {/* Card 2: .NET 9 Minimal API */}
        <div className="border border-sky-500/30 bg-slate-900/60 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-sky-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <FileCode className="w-4 h-4" />
                <span>TECH STACK 2</span>
              </span>
              <span>C# .NET 9</span>
            </div>
            <h3 className="font-serif text-base font-bold text-slate-100">
              .NET Minimal API + Records + React 19
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete repository with ASP.NET Core 9 Minimal API, C# Records, Kestrel server, Native DI container, Microsoft.AspNetCore.OpenApi, and xUnit tests.
            </p>
          </div>

          <button
            onClick={() => handleDownload('dotnet')}
            disabled={downloadingStack !== null}
            className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingStack === 'dotnet' ? 'Generating ZIP...' : 'Download .NET 9 Solution (.zip)'}</span>
          </button>
        </div>

        {/* Card 3: Both Stacks */}
        <div className="border border-purple-500/30 bg-slate-900/60 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-purple-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <FolderArchive className="w-4 h-4" />
                <span>DUAL-STACK SUITE</span>
              </span>
              <span>Both Repositories</span>
            </div>
            <h3 className="font-serif text-base font-bold text-slate-100">
              Full Enterprise Architecture Suite
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Downloads both complete standalone project packages with shared React 19 frontend, workflows, PowerShell scripts, and AI config files.
            </p>
          </div>

          <button
            onClick={() => handleDownload('both')}
            disabled={downloadingStack !== null}
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>{downloadingStack === 'both' ? 'Generating Bundles...' : 'Download Both Solutions (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* ASCII UI Wireframe Diagrams */}
      <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-5 md:p-6 space-y-4">
        <h3 className="font-serif text-sm font-bold text-slate-200">
          ASCII UI/UX Wireframe & Component Layout
        </h3>
        <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`+---------------------------------------------------------------------------------------------------+
| LEXISMATRIX // ENTERPRISE LEGAL INTEGRATION HUB                         [Stack: FastAPI / .NET 9] |
+---------------------------------------------------------------------------------------------------+
| [Overview] [Matters & Walls] [iManage MCP Studio] [Purview DLP] [Copilot Studio] [DevOps & CI/CD] |
+---------------------------------------------------------------------------------------------------+
| ACTIVE MATTER DIRECTORY & ABA RULE 1.10 SCREEN CHECKER                                            |
|                                                                                                   |
| +-- FILTER & CONFLICT CHECK --------------------------------------------------------------------+ |
| | Target Matter: [GT-2026-8841 Apex Semi M&A v]   Personnel: [Robert Sterling ] [Verify Screen] | |
| | >> [403 FORBIDDEN]: Screen rule active. Restricted from iManage DMS & Teams Deal Channel.     | |
| +-----------------------------------------------------------------------------------------------+ |
|                                                                                                   |
| +-- ACTIVE LEGAL MATTERS ------------------------+ +-- PURVIEW DLP & SENSITIVITY EVALUATOR -----+ |
| | GT-2026-8841 Apex Semi $4.8B Acquisition       | | Input: Merger terms, SSN, Attorney Priv.   | |
| | Sensitivity: Highly Confidential (MNPI)        | | Risk: CRITICAL | Recommended: MNPI Label   | |
| | Restricted Attorneys: R. Sterling, K. Miller   | | Copilot Studio Grounding: BLOCKED          | |
| +------------------------------------------------+ +--------------------------------------------+ |
|                                                                                                   |
| +-- MODEL CONTEXT PROTOCOL (MCP) STUDIO ---------+ +-- ENTERPRISE CI/CD & PROTECTION -----------+ |
| | Tool: imanage_search_matter_docs               | | - Main Branch Protection: Required Review  | |
| | Method: tools/call via JSON-RPC 2.0            | | - Lefthook Pre-Commit: Parallel Lint & Test| |
| | Result: 2 documents returned (filtered)        | | - 2-Phase Semver Changelog & Tag Release   | |
| +------------------------------------------------+ +--------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+`}
        </pre>
      </div>

      {/* Runbook: How to Compile, Build, and Run */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-mono text-xs">
        {/* Windows 11 Runbook */}
        <div className="border border-slate-800 bg-slate-950 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-bold">
            <Laptop className="w-4 h-4" />
            <span>Windows 11 Runbook (PowerShell 7 / DOS Prompt)</span>
          </div>

          <pre className="text-slate-300 text-[11px] leading-relaxed overflow-x-auto">
{`# 1. Install prerequisites via winget
winget install --id astral-sh.uv -e
winget install --id Microsoft.DotNet.SDK.9 -e
winget install --id OpenJS.NodeJS.LTS -e

# 2. Extract and run Tech Stack 1 (Python)
tar -xf lexismatrix-fastapi-py313.zip
cd lexismatrix-py-fastapi/backend
uv sync --group dev
uv run pytest
uv run uvicorn app.main:app --port 8000

# 3. Extract and run Tech Stack 2 (.NET 9)
tar -xf lexismatrix-dotnet9-minimalapi.zip
cd lexismatrix-dotnet-minimalapi/backend/LexisMatrix.Api
dotnet test ../LexisMatrix.Tests
dotnet run

# 4. Run Frontend (React 19 + TS 7.0)
cd ../../frontend
npm install
npm run dev`}
          </pre>
        </div>

        {/* Ubuntu Linux Runbook */}
        <div className="border border-slate-800 bg-slate-950 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Terminal className="w-4 h-4" />
            <span>Ubuntu Linux Runbook (bash)</span>
          </div>

          <pre className="text-slate-300 text-[11px] leading-relaxed overflow-x-auto">
{`# 1. Install tools
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
sudo apt-get update && sudo apt-get install -y dotnet-sdk-9.0 nodejs npm

# 2. Tech Stack 1 (FastAPI Python 3.13)
unzip lexismatrix-fastapi-py313.zip
cd backend
uv sync --group dev
uv run pytest -v
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000

# 3. Tech Stack 2 (.NET 9 Minimal API)
unzip lexismatrix-dotnet9-minimalapi.zip
cd backend
dotnet test LexisMatrix.Tests
dotnet run --project LexisMatrix.Api --urls "http://0.0.0.0:5000"

# 4. Frontend
cd ../frontend
npm ci
npm run dev`}
          </pre>
        </div>
      </div>
    </div>
  );
};
