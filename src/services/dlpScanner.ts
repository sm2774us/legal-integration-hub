import { DlpScanResult, SensitivityLevel } from '../types/legalIntegration';

export function scanContentWithPurviewDlp(text: string, _matterContext?: string): DlpScanResult {
  const findings: { category: string; snippet: string; ruleTriggered: string }[] = [];
  const detectedLabels = new Set<SensitivityLevel>();

  let hasMnpi = false;
  let hasPii = false;
  let hasPrivilegeKeywords = false;

  // 1. MNPI Patterns (M&A, Stock Purchase, Tender Offer, Financials)
  const mnpiRegex = /(\$?[0-9]+(?:\.[0-9]+)?\s*(?:billion|million|B|M)\s*(?:cash|acquisition|tender offer|merger|purchase price))|(CFIUS|FIRRMA|national security risk|non-public|hostile takeover|pre-announcement)/gi;
  let match: RegExpExecArray | null;
  while ((match = mnpiRegex.exec(text)) !== null) {
    hasMnpi = true;
    detectedLabels.add('Highly Confidential (MNPI)');
    findings.push({
      category: 'MNPI (Material Non-Public Information)',
      snippet: match[0],
      ruleTriggered: 'Purview-Rule-M365-MNPI-FIN-01'
    });
  }

  // 2. Attorney-Client Privilege & Work Product Patterns
  const privilegeRegex = /(attorney[- ]client\s*privileged?|attorney\s*work\s*product|prepared\s*in\s*anticipation\s*of\s*litigation|legal\s*hold|privileged\s*and\s*confidential)/gi;
  while ((match = privilegeRegex.exec(text)) !== null) {
    hasPrivilegeKeywords = true;
    detectedLabels.add('Attorney-Client Privileged');
    findings.push({
      category: 'Legal Privilege & Work Product',
      snippet: match[0],
      ruleTriggered: 'Purview-Rule-M365-LegalPrivilege-03'
    });
  }

  // 3. SSN / PII pattern
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  while ((match = ssnRegex.exec(text)) !== null) {
    hasPii = true;
    detectedLabels.add('Confidential');
    findings.push({
      category: 'PII (Social Security Number)',
      snippet: match[0],
      ruleTriggered: 'Purview-Rule-M365-DLP-PII-SSN'
    });
  }

  // 4. Broker ID / Bank Account / Routing
  const bankRegex = /\b(?:routing\s*number|account\s*number|wire\s*instructions)\s*[:#]?\s*(\d{8,12})/gi;
  while ((match = bankRegex.exec(text)) !== null) {
    hasPii = true;
    detectedLabels.add('Confidential');
    findings.push({
      category: 'Financial PII (Wire / Account Details)',
      snippet: match[0],
      ruleTriggered: 'Purview-Rule-M365-DLP-Banking-02'
    });
  }

  // Assess overall risk & recommended label
  let recommendedPurviewLabel: SensitivityLevel = 'General';
  let riskScore: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  let canExportViaCopilot = true;
  let preventedByPurviewPolicy = false;

  if (hasMnpi) {
    recommendedPurviewLabel = 'Highly Confidential (MNPI)';
    riskScore = 'Critical';
    canExportViaCopilot = false; // Copilot Studio external connector blocking
    preventedByPurviewPolicy = true;
  } else if (hasPrivilegeKeywords) {
    recommendedPurviewLabel = 'Attorney-Client Privileged';
    riskScore = 'High';
    canExportViaCopilot = false; // Requires ethical wall clearance
    preventedByPurviewPolicy = true;
  } else if (hasPii) {
    recommendedPurviewLabel = 'Confidential';
    riskScore = 'Medium';
    canExportViaCopilot = true;
  }

  return {
    detectedLabels: Array.from(detectedLabels),
    hasMnpi,
    hasPii,
    hasPrivilegeKeywords,
    riskScore,
    flaggedFindings: findings,
    recommendedPurviewLabel,
    canExportViaCopilot,
    preventedByPurviewPolicy
  };
}
