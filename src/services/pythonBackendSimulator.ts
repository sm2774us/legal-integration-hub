import {
  LegalMatter,
  IManageDocument,
  EthicalWallRule
} from '../types/legalIntegration';
import { scanContentWithPurviewDlp } from './dlpScanner';

export interface FastAPIResponse<T> {
  statusCode: number;
  data?: T;
  error?: {
    detail: string | Array<{ loc: string[]; msg: string; type: string }>;
  };
  headers: Record<string, string>;
  serverRuntime: string;
}

export class PythonFastAPIEngine {
  private matters: LegalMatter[];
  private documents: IManageDocument[];
  private ethicalWalls: EthicalWallRule[];

  constructor(matters: LegalMatter[], documents: IManageDocument[], ethicalWalls: EthicalWallRule[]) {
    this.matters = [...matters];
    this.documents = [...documents];
    this.ethicalWalls = [...ethicalWalls];
  }

  // GET /api/v1/matters
  public listMatters(practiceGroupFilter?: string): FastAPIResponse<LegalMatter[]> {
    let result = this.matters;
    if (practiceGroupFilter && practiceGroupFilter !== 'All') {
      result = result.filter(m => m.practiceGroup === practiceGroupFilter);
    }
    return {
      statusCode: 200,
      data: result,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'server': 'uvicorn / Python 3.13.2',
        'x-fastapi-framework': 'FastAPI 0.115.8 (Pydantic v2.10)',
        'x-entra-tenant-id': 'gtlaw-m365-tenant-prod-us'
      },
      serverRuntime: 'Python 3.13 (FastAPI + Pydantic v2)'
    };
  }

  // POST /api/v1/matters (Validates with simulated Pydantic schema)
  public createMatter(payload: Partial<LegalMatter>): FastAPIResponse<LegalMatter> {
    // Pydantic Schema Validation Simulation
    const errors: Array<{ loc: string[]; msg: string; type: string }> = [];

    if (!payload.matterNumber || !/^GT-\d{4}-\d{4}$/.test(payload.matterNumber)) {
      errors.push({
        loc: ['body', 'matter_number'],
        msg: 'matter_number must match regex: ^GT-\\d{4}-\\d{4}$ (e.g. GT-2026-9901)',
        type: 'value_error.regex'
      });
    }

    if (!payload.clientName || payload.clientName.trim().length < 3) {
      errors.push({
        loc: ['body', 'client_name'],
        msg: 'Field required and minimum length 3 characters',
        type: 'value_error.missing'
      });
    }

    if (!payload.leadPartner) {
      errors.push({
        loc: ['body', 'lead_partner'],
        msg: 'Field required: Lead Partner responsible for billing & conflict oversight',
        type: 'value_error.missing'
      });
    }

    if (errors.length > 0) {
      return {
        statusCode: 422,
        error: { detail: errors },
        headers: {
          'content-type': 'application/json',
          'server': 'uvicorn / Python 3.13.2'
        },
        serverRuntime: 'Python 3.13 (FastAPI + Pydantic v2)'
      };
    }

    const newMatter: LegalMatter = {
      id: `mat-${Math.floor(1000 + Math.random() * 9000)}`,
      matterNumber: payload.matterNumber!,
      clientName: payload.clientName!,
      matterName: payload.matterName || 'New General Engagement',
      practiceGroup: payload.practiceGroup || 'Corporate M&A',
      leadPartner: payload.leadPartner!,
      billingAttorney: payload.leadPartner!,
      assignedAttorneys: payload.assignedAttorneys || [payload.leadPartner!],
      restrictedAttorneys: payload.restrictedAttorneys || [],
      openedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      purviewSensitivity: payload.purviewSensitivity || 'Confidential',
      retentionYears: payload.retentionYears || 7,
      iManageWorkspaceId: `WS-${payload.matterNumber!.replace(/[^a-zA-Z0-9]/g, '')}`,
      sharePointSiteUrl: `https://gtlaw.sharepoint.com/sites/${encodeURIComponent(payload.clientName!)}`,
      teamsChannelId: `teams-channel-${payload.matterNumber}`,
      description: payload.description || 'Enterprise matter created via FastAPI Legal Integration Endpoint'
    };

    this.matters.unshift(newMatter);

    return {
      statusCode: 201,
      data: newMatter,
      headers: {
        'content-type': 'application/json',
        'server': 'uvicorn / Python 3.13.2',
        'location': `/api/v1/matters/${newMatter.id}`
      },
      serverRuntime: 'Python 3.13 (FastAPI + Pydantic v2)'
    };
  }

  // POST /api/v1/conflicts/check-access
  public checkEthicalWallAccess(matterNumber: string, attorneyName: string) {
    const matter = this.matters.find(m => m.matterNumber === matterNumber);
    if (!matter) {
      return {
        statusCode: 404,
        error: { detail: `Matter with number ${matterNumber} not found in billing directory.` },
        headers: { 'server': 'uvicorn / Python 3.13.2' },
        serverRuntime: 'Python 3.13 (FastAPI)'
      };
    }

    const isRestricted = matter.restrictedAttorneys.some(
      a => a.toLowerCase().includes(attorneyName.toLowerCase())
    );

    const isAssigned = matter.assignedAttorneys.some(
      a => a.toLowerCase().includes(attorneyName.toLowerCase())
    );

    let decision: 'PERMITTED' | 'BLOCKED_BY_ETHICAL_WALL' | 'RESTRICTED_NEED_CLEARANCE';
    let explanation: string;

    if (isRestricted) {
      decision = 'BLOCKED_BY_ETHICAL_WALL';
      explanation = `ATTENTION: Attorney ${attorneyName} is subject to an active ABA Model Rule 1.10 Ethical Wall screen on matter ${matterNumber} due to previous adversary representation. All iManage DMS workspaces, M365 Copilot grounding, and Teams channels are strictly locked.`;
    } else if (isAssigned) {
      decision = 'PERMITTED';
      explanation = `Verified: Attorney ${attorneyName} has active clearance and is staffed on the matter team with full Read/Write permissions.`;
    } else {
      decision = 'RESTRICTED_NEED_CLEARANCE';
      explanation = `Attorney ${attorneyName} is not actively staffed on this matter team. Request clearance from Lead Partner ${matter.leadPartner} prior to accessing files.`;
    }

    return {
      statusCode: 200,
      data: {
        matterNumber,
        attorneyName,
        decision,
        explanation,
        purviewLabel: matter.purviewSensitivity,
        checkedAtUtc: new Date().toISOString()
      },
      headers: {
        'content-type': 'application/json',
        'server': 'uvicorn / Python 3.13.2',
        'x-purview-audit-logged': 'true'
      },
      serverRuntime: 'Python 3.13 (FastAPI + Pydantic v2)'
    };
  }

  // POST /api/v1/mcp/dispatch
  public handleMcpRpc(method: string, params: any) {
    const startTime = Date.now();

    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        result: {
          tools: [
            {
              name: 'imanage_search_matter_docs',
              description: 'Searches iManage Work 10 DMS respecting Ethical Walls and Purview sensitivity',
              inputSchema: {
                type: 'object',
                properties: {
                  matter_number: { type: 'string' },
                  query: { type: 'string' },
                  requestor_email: { type: 'string' }
                },
                required: ['matter_number', 'requestor_email']
              }
            },
            {
              name: 'imanage_check_ethical_wall',
              description: 'Validates conflict clearance against firm Information Barrier rules'
            },
            {
              name: 'purview_scan_sensitivity',
              description: 'Real-time DLP inspection for MNPI, PII, and privilege keywords'
            }
          ]
        },
        executionTimeMs: Date.now() - startTime
      };
    }

    if (method === 'tools/call') {
      const { name, arguments: args } = params;

      if (name === 'imanage_search_matter_docs') {
        const { matter_number, requestor_email, query } = args;
        const matter = this.matters.find(m => m.matterNumber === matter_number);

        if (!matter) {
          return {
            jsonrpc: '2.0',
            error: { code: -32602, message: `Matter ${matter_number} not found.` },
            executionTimeMs: Date.now() - startTime
          };
        }

        // Check ethical wall against requestor email/name
        const isBlocked = matter.restrictedAttorneys.some(att =>
          requestor_email.toLowerCase().includes(att.toLowerCase().split(' ')[0])
        );

        if (isBlocked) {
          return {
            jsonrpc: '2.0',
            error: {
              code: 403,
              message: `ETHICAL WALL VIOLATION: Access denied for ${requestor_email} to matter ${matter_number}. Screen rule active.`
            },
            executionTimeMs: Date.now() - startTime
          };
        }

        let docs = this.documents.filter(d => d.matterNumber === matter_number);
        if (query) {
          docs = docs.filter(d =>
            d.title.toLowerCase().includes(query.toLowerCase()) ||
            d.excerpt.toLowerCase().includes(query.toLowerCase())
          );
        }

        return {
          jsonrpc: '2.0',
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  status: 'SUCCESS',
                  matterNumber: matter_number,
                  matchedDocumentsCount: docs.length,
                  documents: docs.map(d => ({
                    docId: d.docId,
                    title: d.title,
                    version: d.version,
                    author: d.author,
                    sensitivityLabel: d.sensitivityLabel,
                    excerpt: d.excerpt
                  }))
                }, null, 2)
              }
            ]
          },
          executionTimeMs: Date.now() - startTime
        };
      }

      if (name === 'purview_scan_sensitivity') {
        const scan = scanContentWithPurviewDlp(args.content, args.matter_context);
        return {
          jsonrpc: '2.0',
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(scan, null, 2)
              }
            ]
          },
          executionTimeMs: Date.now() - startTime
        };
      }
    }

    return {
      jsonrpc: '2.0',
      error: { code: -32601, message: `Method '${method}' not found on Python MCP Server.` },
      executionTimeMs: Date.now() - startTime
    };
  }
}
