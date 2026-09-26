import React, { useState } from 'react';
import { scanContentWithPurviewDlp } from '../services/dlpScanner';
import { DlpScanResult } from '../types/legalIntegration';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Scan,
  FileCheck,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const PurviewDlpTab: React.FC = () => {
  const [inputText, setInputText] = useState<string>(
    'STRICT ATTORNEY-CLIENT PRIVILEGED & CONFIDENTIAL WORK PRODUCT.\nUnder the preliminary merger terms for Project Silicon Sovereign, Apex Semiconductor will acquire QuantuMicro for $4.85 billion in cash. Key executive SSN: 042-88-9102. Subject to mandatory CFIUS national security filing.'
  );

  const [scanResult, setScanResult] = useState<DlpScanResult | null>(() =>
    scanContentWithPurviewDlp(
      'STRICT ATTORNEY-CLIENT PRIVILEGED & CONFIDENTIAL WORK PRODUCT.\nUnder the preliminary merger terms for Project Silicon Sovereign, Apex Semiconductor will acquire QuantuMicro for $4.85 billion in cash. Key executive SSN: 042-88-9102. Subject to mandatory CFIUS national security filing.'
    )
  );

  const handleScan = () => {
    const result = scanContentWithPurviewDlp(inputText);
    setScanResult(result);
  };

  const sampleScenarios = [
    {
      title: 'M&A Deal MNPI + SSN Leak',
      text: 'CONFIDENTIAL: Apex Semiconductor will acquire QuantuMicro for $4.85 billion in cash prior to NASDAQ announcement. Beneficiary SSN is 019-44-8821. National security review by CFIUS pending.'
    },
    {
      title: 'Patent Litigation Work Product',
      text: 'ATTORNEY-CLIENT PRIVILEGED AND CONFIDENTIAL WORK PRODUCT. Prepared in anticipation of litigation regarding the asserted monoclonal antibody delivery claims 1-14. Do not disseminate.'
    },
    {
      title: 'Public Commercial Lease (Safe)',
      text: 'Standard office lease agreement for commercial premises at 1000 Louisiana Street, Houston, TX. Monthly rent is $14,500 due on the first calendar day of each month.'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
          <span>Microsoft Purview DLP & Sensitivity Labeling Engine</span>
        </h2>
        <p className="text-xs text-slate-400">
          Evaluates data protection, confidentiality, and DLP rules to safeguard MNPI and privileged legal work product before AI processing.
        </p>
      </div>

      {/* Preset Scenarios */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono">
        <span className="text-slate-400">Test Scenarios:</span>
        {sampleScenarios.map((sc, i) => (
          <button
            key={i}
            onClick={() => {
              setInputText(sc.text);
              setScanResult(scanContentWithPurviewDlp(sc.text));
            }}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-amber-400 transition-colors cursor-pointer whitespace-nowrap"
          >
            {sc.title}
          </button>
        ))}
      </div>

      {/* Scanner Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Text Area */}
        <div className="lg:col-span-6 space-y-3">
          <label className="block text-xs font-mono text-slate-400">
            Legal Content / AI Prompt Input / Client Email Body:
          </label>
          <textarea
            rows={10}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
            placeholder="Type or paste legal text to scan with Microsoft Purview rules..."
          />
          <button
            onClick={handleScan}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Scan className="w-4 h-4" />
            <span>Execute Purview DLP Inspection</span>
          </button>
        </div>

        {/* Scan Results Panel */}
        <div className="lg:col-span-6 space-y-4">
          <label className="block text-xs font-mono text-slate-400">
            Real-Time Purview Policy Evaluation:
          </label>

          {scanResult ? (
            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4 text-xs font-mono">
              {/* Risk Level Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-slate-400">Policy Risk Rating:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] uppercase ${
                    scanResult.riskScore === 'Critical'
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                      : scanResult.riskScore === 'High'
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                      : scanResult.riskScore === 'Medium'
                      ? 'bg-yellow-950/60 text-yellow-300 border border-yellow-800'
                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {scanResult.riskScore} Risk
                </span>
              </div>

              {/* Recommended Purview Label */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Recommended Purview Label:</span>
                <span className="text-slate-100 font-semibold">
                  {scanResult.recommendedPurviewLabel}
                </span>
              </div>

              {/* Copilot Studio Grounding Status */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Copilot Studio Grounding Clearance:</span>
                {scanResult.canExportViaCopilot ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Permitted under DLP Policy
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1 font-semibold">
                    <XCircle className="w-3.5 h-3.5" />
                    BLOCKED: MNPI / Privilege Safeguard
                  </span>
                )}
              </div>

              {/* Flagged Findings List */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-slate-400 block">Identified DLP Findings ({scanResult.flaggedFindings.length}):</span>
                {scanResult.flaggedFindings.length === 0 ? (
                  <p className="text-slate-500 italic text-[11px]">
                    No sensitive entities or compliance violations detected.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {scanResult.flaggedFindings.map((f, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/70 border border-slate-800 rounded p-2 text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-amber-400 font-semibold">{f.category}</span>
                          <span className="text-slate-500 text-[10px]">{f.ruleTriggered}</span>
                        </div>
                        <div className="text-slate-300 font-mono">
                          Match: <code className="text-rose-300 bg-rose-950/40 px-1 py-0.5 rounded">"{f.snippet}"</code>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-8 text-center text-slate-500 text-xs">
              Execute scan to preview Purview DLP analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
