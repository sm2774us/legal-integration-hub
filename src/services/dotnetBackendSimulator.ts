import {
  LegalMatter,
  IManageDocument,
  EthicalWallRule
} from '../types/legalIntegration';
import { scanContentWithPurviewDlp } from './dlpScanner';

export interface DotnetApiResponse<T> {
  statusCode: number;
  data?: T;
  error?: {
    type: string;
    title: string;
    status: number;
    errors?: Record<string, string[]>;
    traceId: string;
  };
  headers: Record<string, string>;
  serverRuntime: string;
}

export class DotnetMinimalApiEngine {
  private matters: LegalMatter[];
  private documents: IManageDocument[];
  private ethicalWalls: EthicalWallRule[];

  constructor(matters: LegalMatter[], documents: IManageDocument[], ethicalWalls: EthicalWallRule[]) {
    this.matters = [...matters];
    this.documents = [...documents];
    this.ethicalWalls = [...ethicalWalls];
  }

  // GET /api/v1/matters -> TypedResults.Ok(IEnumerable<LegalMatterRecord>)
  public listMatters(practiceGroupFilter?: string): DotnetApiResponse<LegalMatter[]> {
    let result = this.matters;
    if (practiceGroupFilter && practiceGroupFilter !== 'All') {
      result = result.filter(m => m.practiceGroup === practiceGroupFilter);
    }
    return {
      statusCode: 200,
      data: result,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'server': 'Kestrel / .NET 9.0.2 CLR',
        'x-aspnetcore-version': '9.0.2',
        'x-di-container': 'Microsoft.Extensions.DependencyInjection',
        'traceparent': '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'
      },
      serverRuntime: 'C# .NET 9 (Minimal API + Native DI + Records)'
    };
  }

  // POST /api/v1/matters -> TypedResults.Created(uri, newMatterRecord)
  public createMatter(payload: Partial<LegalMatter>): DotnetApiResponse<LegalMatter> {
    const validationErrors: Record<string, string[]> = {};

    if (!payload.matterNumber || !/^GT-\d{4}-\d{4}$/.test(payload.matterNumber)) {
      validationErrors['MatterNumber'] = [
        'The MatterNumber field must match the strict law firm regex pattern GT-YYYY-NNNN.'
      ];
    }

    if (!payload.clientName || payload.clientName.trim().length < 3) {
      validationErrors['ClientName'] = [
        'The ClientName field is required and must be at least 3 characters.'
      ];
    }

    if (!payload.leadPartner) {
      validationErrors['LeadPartner'] = [
        'The LeadPartner field is required under Enterprise Governance Policy.'
      ];
    }

    if (Object.keys(validationErrors).length > 0) {
      return {
        statusCode: 400,
        error: {
          type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
          title: 'One or more validation errors occurred.',
          status: 400,
          errors: validationErrors,
          traceId: `00-${Math.random().toString(16).slice(2, 18)}-01`
        },
        headers: {
          'content-type': 'application/problem+json; charset=utf-8',
          'server': 'Kestrel / .NET 9.0.2'
        },
        serverRuntime: 'C# .NET 9 (Minimal API)'
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
      description: payload.description || 'Enterprise matter created via .NET 9 Minimal API Endpoint'
    };

    this.matters.unshift(newMatter);

    return {
      statusCode: 201,
      data: newMatter,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'server': 'Kestrel / .NET 9.0.2',
        'location': `/api/v1/matters/${newMatter.id}`
      },
      serverRuntime: 'C# .NET 9 (Minimal API + Native DI + Records)'
    };
  }

  // POST /api/v1/conflicts/check-access
  public checkEthicalWallAccess(matterNumber: string, attorneyName: string) {
    const matter = this.matters.find(m => m.matterNumber === matterNumber);
    if (!matter) {
      return {
        statusCode: 404,
        error: {
          type: 'https://tools.ietf.org/html/rfc9110#section-15.5.5',
          title: 'Not Found',
          status: 404,
          traceId: `00-${Math.random().toString(16).slice(2, 18)}-01`
        },
        headers: { 'server': 'Kestrel / .NET 9.0.2' },
        serverRuntime: 'C# .NET 9 (Minimal API)'
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
      explanation = `[C# System.Security.Claims]: Attorney ${attorneyName} matches screened principal in EthicalWallDbContext. Access to workspace ${matter.iManageWorkspaceId} denied by EthicalWallFilterAttribute.`;
    } else if (isAssigned) {
      decision = 'PERMITTED';
      explanation = `[C# IAuthorizationService]: Attorney ${attorneyName} successfully authorized against LegalMatterPolicy. Full access granted.`;
    } else {
      decision = 'RESTRICTED_NEED_CLEARANCE';
      explanation = `Attorney ${attorneyName} unassigned. Requires Partner-level delegation token.`;
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
        'server': 'Kestrel / .NET 9.0.2',
        'x-entraid-auth': 'Bearer verified'
      },
      serverRuntime: 'C# .NET 9 (Minimal API + Native DI + Records)'
    };
  }

  // POST /api/v1/mcp/dispatch
  public handleMcpRpc(method: string, params: any) {
    const startTime = Date.now();

    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        result: {
          server: 'LexisMatrix.DotNet.McpServer 1.0.0 (Kestrel)',
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
            error: { code: -32602, message: `Matter ${matter_number} not found in repository.` },
            executionTimeMs: Date.now() - startTime
          };
        }

        const isBlocked = matter.restrictedAttorneys.some(att =>
          requestor_email.toLowerCase().includes(att.toLowerCase().split(' ')[0])
        );

        if (isBlocked) {
          return {
            jsonrpc: '2.0',
            error: {
              code: 403,
              message: `[Kestrel-MCP] Ethical Wall Violation: Access screened for ${requestor_email} on matter ${matter_number}.`
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
                  runtime: '.NET 9 Kestrel Minimal API',
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
      error: { code: -32601, message: `Method '${method}' not found on .NET MCP Server.` },
      executionTimeMs: Date.now() - startTime
    };
  }
}
