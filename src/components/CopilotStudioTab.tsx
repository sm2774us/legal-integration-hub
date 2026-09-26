import React, { useState } from 'react';
import { COPILOT_STUDIO_ACTIONS } from '../data/seedData';
import { CopilotStudioPluginAction } from '../types/legalIntegration';
import {
  Bot,
  Send,
  Code2,
  Share2,
  CheckCircle,
  FileCode,
  Zap,
  Terminal,
  ExternalLink
} from 'lucide-react';

interface CopilotStudioTabProps {
  activeStack: 'python' | 'dotnet';
}

export const CopilotStudioTab: React.FC<CopilotStudioTabProps> = ({ activeStack }) => {
  const [selectedActionId, setSelectedActionId] = useState<string>(
    COPILOT_STUDIO_ACTIONS[0].actionId
  );
  const [matterNumberInput, setMatterNumberInput] = useState('GT-2026-8841');
  const [userUpnInput, setUserUpnInput] = useState('sarah.jenkins@gtlaw.com');
  const [executionOutput, setExecutionOutput] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const currentAction =
    COPILOT_STUDIO_ACTIONS.find(a => a.actionId === selectedActionId) ||
    COPILOT_STUDIO_ACTIONS[0];

  const handleRunPluginAction = () => {
    setIsRunning(true);
    setTimeout(() => {
      let output: any;
      if (selectedActionId === 'act_summarize_matter_filings') {
        output = {
          copilotAgentId: 'gt-copilot-studio-m365-agent-v1',
          action: currentAction.displayName,
          executedOnStack: activeStack === 'python' ? 'Python 3.13 FastAPI' : 'C# .NET 9 Minimal API',
          status: 'SUCCESS',
          ethicalClearance: 'VERIFIED_ACTIVE',
          data: {
            matterNumber: matterNumberInput,
            requestor: userUpnInput,
            matterSummary: 'Apex Semiconductor $4.85B acquisition of QuantuMicro. 7 draft versions in iManage Work 10. Key regulatory filing: CFIUS national security review submitted on Sept 24, 2026.',
            referencedDocuments: [
              'IM-109241 (Merger_Agreement_Apex_QuantuMicro_v7.4_Execution_Draft.docx)',
              'IM-109248 (CFIUS_National_Security_Risk_Mitigation_Plan.pdf)'
            ],
            purviewComplianceLabel: 'Highly Confidential (MNPI)'
          },
          graphTelemetry: {
            entraTenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
            latencyMs: 142
          }
        };
      } else if (selectedActionId === 'act_verify_conflict_clearance') {
        output = {
          copilotAgentId: 'gt-copilot-studio-m365-agent-v1',
          action: currentAction.displayName,
          executedOnStack: activeStack === 'python' ? 'Python 3.13 FastAPI' : 'C# .NET 9 Minimal API',
          status: 'SUCCESS',
          data: {
            matterNumber: matterNumberInput,
            candidate: userUpnInput,
            clearanceStatus: userUpnInput.includes('sterling') ? 'SCREENED_BLOCKED' : 'CLEARED_AUTHORIZED',
            auditRule: 'ABA Model Rule 1.10 Ethical Wall',
            purviewBarrierSync: 'Enforced across M365 Groups & Teams'
          }
        };
      } else {
        output = {
          copilotAgentId: 'gt-copilot-studio-m365-agent-v1',
          action: currentAction.displayName,
          executedOnStack: activeStack === 'python' ? 'Python 3.13 FastAPI' : 'C# .NET 9 Minimal API',
          status: 'DELIVERED',
          graphResponse: {
            messageId: `teams-msg-${Math.floor(100000 + Math.random() * 900000)}`,
            channel: 'm365-teams-apex-8841-deal-room',
            adaptiveCardSchema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            timestamp: new Date().toISOString()
          }
        };
      }

      setExecutionOutput(output);
      setIsRunning(false);
    }, 300);
  };

  const sampleCopilotManifest = {
    schema_version: 'v2.1',
    name_for_human: 'GT Legal Matter Intelligence Copilot Plugin',
    name_for_model: 'gt_legal_matter_intel',
    description_for_human: 'Enables M365 Copilot to ground on iManage DMS workspaces and check ethical screens.',
    description_for_model: 'Allows querying GT matter statuses, iManage documents, and conflict walls while respecting ABA Rule 1.10.',
    auth: {
      type: 'oauth2',
      client_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      scope: 'Matter.Read.All DMS.Content.Read'
    },
    api: {
      type: 'openapi',
      url: activeStack === 'python' ? 'http://localhost:8000/openapi.json' : 'http://localhost:5000/openapi/v1.json'
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
          <span>Microsoft 365 Copilot & Copilot Studio Integration Hub</span>
        </h2>
        <p className="text-xs text-slate-400">
          Deploy declarative plugins, custom connectors, and Microsoft Graph webhooks that surface approved legal capabilities inside Teams, Outlook, and Copilot.
        </p>
      </div>

      {/* Main Interactive Studio Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Action Selection & Test Execution */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold text-sky-400">
                <Bot className="w-4 h-4" />
                <span>Copilot Studio Plugin Action</span>
              </span>
              <span className="text-slate-500">Method: {currentAction.method}</span>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Target Action</label>
              <select
                value={selectedActionId}
                onChange={e => setSelectedActionId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
              >
                {COPILOT_STUDIO_ACTIONS.map(a => (
                  <option key={a.actionId} value={a.actionId}>
                    {a.displayName}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-slate-400 font-sans leading-relaxed text-[11px]">
              {currentAction.description}
            </p>

            <div>
              <label className="block text-slate-400 mb-1">Matter Number</label>
              <input
                type="text"
                value={matterNumberInput}
                onChange={e => setMatterNumberInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Requesting User / Candidate UPN</label>
              <input
                type="text"
                value={userUpnInput}
                onChange={e => setUserUpnInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-slate-500 block mb-1">Required Entra ID Scopes:</span>
              <div className="flex flex-wrap gap-1">
                {currentAction.requiredScopes.map(scope => (
                  <span key={scope} className="bg-slate-800 text-sky-300 px-2 py-0.5 rounded text-[10px]">
                    {scope}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleRunPluginAction}
              disabled={isRunning}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>{isRunning ? 'Invoking Action...' : 'Invoke Copilot Studio Action'}</span>
            </button>
          </div>
        </div>

        {/* Right: Live Plugin Response & Manifest Inspector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span>Copilot Studio Execution Payload</span>
              </span>
              <span className="text-slate-500">API Endpoint: {currentAction.endpoint}</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] h-60 overflow-y-auto">
              {executionOutput ? (
                <pre className="text-emerald-300">
                  {JSON.stringify(executionOutput, null, 2)}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600">
                  Click "Invoke Copilot Studio Action" to test endpoint response.
                </div>
              )}
            </div>

            {/* Plugin Manifest Inspector */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <FileCode className="w-3 h-3 text-amber-400" />
                  <span>Declarative Copilot Plugin Manifest (ai-plugin.json):</span>
                </span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded p-2.5 text-[10px] text-slate-400 max-h-36 overflow-y-auto">
                <pre className="text-slate-300">
                  {JSON.stringify(sampleCopilotManifest, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
