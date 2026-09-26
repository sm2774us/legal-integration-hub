import React from 'react';
import {
  ShieldAlert,
  Terminal,
  FileCode,
  Download,
  Server,
  Layers,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  activeStack: 'python' | 'dotnet';
  onStackChange: (stack: 'python' | 'dotnet') => void;
  onOpenDownloads: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeStack,
  onStackChange,
  onOpenDownloads
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Brand & Context */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-xl shadow-inner">
            §
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif tracking-wide text-lg font-bold text-slate-100">
                LEXIS<span className="text-amber-400">MATRIX</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">v2.4-ENTERPRISE</span>
              <span className="text-xs text-slate-600">/</span>
              <span className="text-xs text-slate-400">Am Law 50 Production Hub</span>
            </div>
            <p className="text-xs text-slate-400">
              AI & Data Platform Enablement · Microsoft 365 Copilot · iManage DMS · Purview DLP
            </p>
          </div>
        </div>

        {/* Center / Right: Stack Selector & Quick Download */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Active Backend Architecture Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-slate-400 px-2 py-1 flex items-center gap-1 font-mono">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              BACKEND:
            </span>
            <button
              onClick={() => onStackChange('python')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeStack === 'python'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              FastAPI (Python 3.13)
            </button>
            <button
              onClick={() => onStackChange('dotnet')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeStack === 'dotnet'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              .NET 9 (C# Minimal API)
            </button>
          </div>

          {/* Download Project ZIPs Button */}
          <button
            onClick={onOpenDownloads}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-all shadow-sm shadow-amber-500/10 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Solution ZIPs</span>
          </button>
        </div>
      </div>

      {/* Enterprise System Telemetry Ribbon */}
      <div className="bg-slate-900/60 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-1.5 text-[11px] font-mono text-slate-400 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-4 min-w-max">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Entra ID OAuth 2.0: Connected (Tenant: gtlaw-m365-prod)
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Layers className="w-3 h-3 text-sky-400" />
            iManage Work 10: Synced (REST v2)
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            Purview DLP & Information Barriers: Enforcing
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1.5 text-purple-300">
            <Sparkles className="w-3 h-3 text-purple-400" />
            MCP Server: Active (Port 8000/5000)
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-slate-400 min-w-max">
          <span>Active Runtime:</span>
          <span className="text-slate-200">
            {activeStack === 'python' ? 'Uvicorn · Pydantic v2.10' : 'Kestrel · C# 13 Records · DI'}
          </span>
        </div>
      </div>
    </header>
  );
};
