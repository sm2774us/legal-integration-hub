import React, { useState } from 'react';
import {
  IManageDocument,
  McpToolDefinition
} from '../types/legalIntegration';
import { PythonFastAPIEngine } from '../services/pythonBackendSimulator';
import { DotnetMinimalApiEngine } from '../services/dotnetBackendSimulator';
import {
  FileText,
  Lock,
  Cpu,
  Play,
  Terminal,
  Search,
  CheckCircle,
  AlertTriangle,
  FolderGit2
} from 'lucide-react';

interface DmsMcpStudioTabProps {
  documents: IManageDocument[];
  mcpTools: McpToolDefinition[];
  pythonEngine: PythonFastAPIEngine;
  dotnetEngine: DotnetMinimalApiEngine;
  activeStack: 'python' | 'dotnet';
}

export const DmsMcpStudioTab: React.FC<DmsMcpStudioTabProps> = ({
  documents,
  mcpTools,
  pythonEngine,
  dotnetEngine,
  activeStack
}) => {
  const [selectedTool, setSelectedTool] = useState<string>('imanage_search_matter_docs');
  const [toolMatterNumber, setToolMatterNumber] = useState('GT-2026-8841');
  const [toolRequestorEmail, setToolRequestorEmail] = useState('sarah.jenkins@gtlaw.com');
  const [toolQuery, setToolQuery] = useState('Merger purchase price and CFIUS');
  const [mcpLog, setMcpLog] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Document list filter
  const [docSearch, setDocSearch] = useState('');

  const filteredDocs = documents.filter(
    d =>
      d.title.toLowerCase().includes(docSearch.toLowerCase()) ||
      d.matterNumber.toLowerCase().includes(docSearch.toLowerCase()) ||
      d.excerpt.toLowerCase().includes(docSearch.toLowerCase())
  );

  const handleExecuteMcpTool = () => {
    setIsExecuting(true);

    const rpcPayload = {
      jsonrpc: '2.0',
      id: `req-${Math.floor(1000 + Math.random() * 9000)}`,
      method: 'tools/call',
      params: {
        name: selectedTool,
        arguments: {
          matter_number: toolMatterNumber,
          requestor_email: toolRequestorEmail,
          query: toolQuery,
          content: toolQuery
        }
      }
    };

    setTimeout(() => {
      let rpcResponse: any;
      if (activeStack === 'python') {
        rpcResponse = pythonEngine.handleMcpRpc('tools/call', rpcPayload.params);
      } else {
        rpcResponse = dotnetEngine.handleMcpRpc('tools/call', rpcPayload.params);
      }

      setMcpLog({
        request: rpcPayload,
        response: rpcResponse,
        executedAt: new Date().toLocaleTimeString(),
        stack: activeStack === 'python' ? 'Python 3.13 FastAPI MCP' : 'C# .NET 9 Kestrel MCP'
      });
      setIsExecuting(false);
    }, 250);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <span>iManage Work 10 DMS & Model Context Protocol (MCP) Studio</span>
          </h2>
          <p className="text-xs text-slate-400">
            Enterprise line-of-business integration exposing firm document intelligence to AI agents via standardized MCP JSON-RPC 2.0.
          </p>
        </div>
      </div>

      {/* Live MCP Tool Execution Studio */}
      <div className="border border-purple-500/30 bg-slate-900/70 rounded-xl p-5 md:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Interactive Model Context Protocol (MCP) Server Console</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Protocol: JSON-RPC 2.0 · Standard stdio & HTTP/SSE
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Tool Configuration */}
          <div className="lg:col-span-5 space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Select Registered MCP Tool</label>
              <select
                value={selectedTool}
                onChange={e => setSelectedTool(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {mcpTools.map(t => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Matter Number Context</label>
              <input
                type="text"
                value={toolMatterNumber}
                onChange={e => setToolMatterNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Requestor Entra ID UPN (Test Ethical Wall Screening)
              </label>
              <input
                type="text"
                value={toolRequestorEmail}
                onChange={e => setToolRequestorEmail(e.target.value)}
                placeholder="e.g. robert.sterling@gtlaw.com (Restricted) or sarah.jenkins@gtlaw.com (Allowed)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
              <div className="mt-1 text-[11px] text-slate-500 flex gap-2">
                <button
                  type="button"
                  onClick={() => setToolRequestorEmail('sarah.jenkins@gtlaw.com')}
                  className="hover:text-emerald-400 underline cursor-pointer"
                >
                  Set Sarah Jenkins (Allowed)
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setToolRequestorEmail('robert.sterling@gtlaw.com')}
                  className="hover:text-rose-400 underline cursor-pointer"
                >
                  Set Robert Sterling (Blocked)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Semantic Query / Context Payload</label>
              <input
                type="text"
                value={toolQuery}
                onChange={e => setToolQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>

            <button
              onClick={handleExecuteMcpTool}
              disabled={isExecuting}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isExecuting ? 'Dispatching JSON-RPC...' : 'Dispatch MCP Tool Call'}</span>
            </button>
          </div>

          {/* Right: Real JSON-RPC 2.0 Wire Inspector */}
          <div className="lg:col-span-7 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                <span>JSON-RPC 2.0 Wire Inspector</span>
              </span>
              {mcpLog && <span className="text-[11px] text-slate-500">{mcpLog.executedAt} · {mcpLog.stack}</span>}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 h-80 overflow-y-auto space-y-3 text-[11px]">
              {mcpLog ? (
                <>
                  <div>
                    <span className="text-slate-500">// &gt;&gt; CLIENT REQUEST:</span>
                    <pre className="text-sky-300 mt-1">
                      {JSON.stringify(mcpLog.request, null, 2)}
                    </pre>
                  </div>
                  <div className="border-t border-slate-800 pt-2">
                    <span className="text-slate-500">// &lt;&lt; SERVER RESPONSE:</span>
                    <pre className={`mt-1 ${mcpLog.response.error ? 'text-rose-400' : 'text-emerald-300'}`}>
                      {JSON.stringify(mcpLog.response, null, 2)}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600">
                  Click "Dispatch MCP Tool Call" to view live JSON-RPC wire frames.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* iManage Work 10 Document Vault */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold font-serif text-slate-200">
              iManage Work 10 DMS Vault ({filteredDocs.length} Documents)
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search documents or excerpts..."
              value={docSearch}
              onChange={e => setDocSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map(doc => (
            <div
              key={doc.docId}
              className="border border-slate-800 bg-slate-900/40 rounded-xl p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-semibold">{doc.docId}</span>
                  <span className="text-slate-400">{doc.matterNumber}</span>
                </div>

                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <h4 className="text-xs font-semibold text-slate-200 leading-snug">
                    {doc.title}
                  </h4>
                </div>

                <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded border border-slate-800/80 leading-relaxed font-serif">
                  "{doc.excerpt}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Author: {doc.author}</span>
                  <span>·</span>
                  <span>v{doc.version}</span>
                </div>
                <span className={`font-semibold ${
                  doc.sensitivityLabel.includes('MNPI')
                    ? 'text-rose-400'
                    : doc.sensitivityLabel.includes('Privileged')
                    ? 'text-purple-400'
                    : 'text-slate-300'
                }`}>
                  {doc.sensitivityLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
