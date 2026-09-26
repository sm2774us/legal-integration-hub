import React, { useState } from 'react';
import {
  Code,
  FileCode,
  Terminal,
  CheckCircle,
  ArrowRightLeft,
  Sparkles,
  Layers
} from 'lucide-react';

export const DualStackCompareTab: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<'models' | 'di' | 'endpoints' | 'openapi'>('models');

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
          <span>Dual-Stack Enterprise Architecture: FastAPI (Py 3.13) vs .NET 9 Minimal API</span>
        </h2>
        <p className="text-xs text-slate-400">
          Comparing the two leading enterprise ecosystems utilized across global law firms for AI, data integration, and high-performance services.
        </p>
      </div>

      {/* Feature Mapping Table (as specified in prompt) */}
      <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-5 md:p-6 space-y-4">
        <h3 className="font-serif text-sm font-bold text-slate-200">
          Feature-by-Feature Architectural Parity Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3">FastAPI Feature</th>
                <th className="py-2.5 px-3">.NET Minimal API Equivalent</th>
                <th className="py-2.5 px-3">Enterprise Notes & Law Firm Optimization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-3 font-semibold text-amber-400">Pydantic Models</td>
                <td className="py-3 px-3 font-semibold text-sky-400">C# Records / System.Text.Json</td>
                <td className="py-3 px-3 text-slate-400">
                  C# Records provide immutable, concise class definitions out-of-the-box with native type safety and zero memory overhead.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-3 font-semibold text-amber-400">Built-in Swagger / OpenAPI</td>
                <td className="py-3 px-3 font-semibold text-sky-400">Microsoft.AspNetCore.OpenApi</td>
                <td className="py-3 px-3 text-slate-400">
                  Native integration automatically generates interactive OpenAPI 3.1 specifications consumed by Copilot Studio declarative plugins.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-3 font-semibold text-amber-400">Uvicorn / Hypercorn</td>
                <td className="py-3 px-3 font-semibold text-sky-400">Kestrel Web Server</td>
                <td className="py-3 px-3 text-slate-400">
                  Kestrel is the lightning-fast internal web server built right into .NET with cross-platform socket pooling.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-3 font-semibold text-amber-400">Dependency Injection (Depends)</td>
                <td className="py-3 px-3 font-semibold text-sky-400">Native DI Container (builder.Services)</td>
                <td className="py-3 px-3 text-slate-400">
                  No extra packages needed. .NET includes an enterprise-grade Dependency Injection system natively (Scoped, Transient, Singleton).
                </td>
              </tr>
              <tr className="hover:bg-slate-800/20">
                <td className="py-3 px-3 font-semibold text-amber-400">Async / Await</td>
                <td className="py-3 px-3 font-semibold text-sky-400">async / await (Task-based)</td>
                <td className="py-3 px-3 text-slate-400">
                  Async execution is first-class and heavily optimized for asynchronous I/O and iManage / Graph database operations.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Code Comparison View */}
      <div className="space-y-4">
        {/* Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
          <button
            onClick={() => setSelectedFeature('models')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedFeature === 'models' ? 'bg-slate-800 text-slate-100 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Data Models (Pydantic v2 vs C# Records)
          </button>
          <button
            onClick={() => setSelectedFeature('endpoints')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedFeature === 'endpoints' ? 'bg-slate-800 text-slate-100 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Endpoints (FastAPI Route vs Minimal API MapPost)
          </button>
          <button
            onClick={() => setSelectedFeature('di')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedFeature === 'di' ? 'bg-slate-800 text-slate-100 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Dependency Injection (Depends vs builder.Services)
          </button>
          <button
            onClick={() => setSelectedFeature('openapi')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedFeature === 'openapi' ? 'bg-slate-800 text-slate-100 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            4. OpenAPI / Copilot Plugin Generation
          </button>
        </div>

        {/* Side-by-side Code Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
          {/* Python Side */}
          <div className="border border-amber-500/20 bg-slate-950 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-amber-300">
              <span className="flex items-center gap-2 font-semibold">
                <Terminal className="w-4 h-4" />
                <span>Python 3.13 (FastAPI 0.115 + Pydantic v2)</span>
              </span>
              <span className="text-[11px] text-slate-500">app/models.py</span>
            </div>
            <pre className="p-4 text-slate-300 overflow-x-auto text-[11px] leading-relaxed max-h-[480px]">
              {selectedFeature === 'models' && `from pydantic import BaseModel, Field
from typing import List
from enum import Enum

class SensitivityLevel(str, Enum):
    GENERAL = "General"
    CONFIDENTIAL = "Confidential"
    MNPI = "Highly Confidential (MNPI)"
    PRIVILEGED = "Attorney-Client Privileged"

class LegalMatterCreate(BaseModel):
    matter_number: str = Field(..., pattern=r"^GT-\\d{4}-\\d{4}$")
    client_name: str = Field(..., min_length=3, max_length=150)
    matter_name: str = Field(..., min_length=5)
    lead_partner: str
    assigned_attorneys: List[str] = []
    restricted_attorneys: List[str] = [] # ABA Rule 1.10
    purview_sensitivity: SensitivityLevel = SensitivityLevel.CONFIDENTIAL
    retention_years: int = Field(default=7, ge=1, le=50)

class LegalMatter(LegalMatterCreate):
    id: str
    opened_date: str
    imanage_workspace_id: str`}

              {selectedFeature === 'endpoints' && `@app.post("/api/v1/matters", response_model=LegalMatter, status_code=201)
async def create_matter(
    matter_in: LegalMatterCreate,
    repo: MatterRepository = Depends(get_matter_repo),
    graph: MicrosoftGraphClient = Depends(get_graph_client)
):
    # 1. Persist matter in repository
    created = await repo.create(matter_in)
    
    # 2. Provision Teams Deal Room via Graph API
    await graph.provision_deal_channel(
        channel_name=matter_in.matter_number,
        assigned_attorneys=matter_in.assigned_attorneys
    )
    
    return created`}

              {selectedFeature === 'di' && `# FastAPI Dependency Injection Pattern
from fastapi import Depends

def get_db_session() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_imanage_client(
    token: str = Depends(oauth2_scheme)
) -> IManageClient:
    return IManageClient(bearer_token=token)

@app.get("/api/v1/documents")
async def list_docs(
    matter_number: str,
    dms: IManageClient = Depends(get_imanage_client)
):
    return await dms.search_documents(matter_number)`}

              {selectedFeature === 'openapi' && `# FastAPI natively generates OpenAPI 3.1 at /openapi.json
app = FastAPI(
    title="LexisMatrix Legal Enterprise API",
    version="1.0.0",
    description="Exposes endpoints for Copilot Studio plugins"
)

# Custom connector reads directly from:
# http://localhost:8000/openapi.json`}
            </pre>
          </div>

          {/* C# Side */}
          <div className="border border-sky-500/20 bg-slate-950 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-sky-300">
              <span className="flex items-center gap-2 font-semibold">
                <FileCode className="w-4 h-4" />
                <span>C# .NET 9 (Minimal API + System.Text.Json)</span>
              </span>
              <span className="text-[11px] text-slate-500">Models/MatterModels.cs</span>
            </div>
            <pre className="p-4 text-slate-300 overflow-x-auto text-[11px] leading-relaxed max-h-[480px]">
              {selectedFeature === 'models' && `namespace LexisMatrix.Api.Models;

// C# Records provide immutable, concise class definitions
public record LegalMatterRecord(
    string Id,
    string MatterNumber,
    string ClientName,
    string MatterName,
    string LeadPartner,
    IReadOnlyList<string> AssignedAttorneys,
    IReadOnlyList<string> RestrictedAttorneys, // ABA Rule 1.10
    string PurviewSensitivity,
    int RetentionYears,
    DateTime OpenedDate,
    string IManageWorkspaceId
);

public record LegalMatterCreateRecord(
    string MatterNumber,
    string ClientName,
    string MatterName,
    string LeadPartner,
    IReadOnlyList<string> AssignedAttorneys,
    IReadOnlyList<string> RestrictedAttorneys,
    string PurviewSensitivity,
    int RetentionYears
);`}

              {selectedFeature === 'endpoints' && `var matters = app.MapGroup("/api/v1/matters").WithTags("Matters");

matters.MapPost("/", async (
    LegalMatterCreateRecord input,
    IMatterRepository repo,
    IMicrosoftGraphClient graph) =>
{
    // 1. Persist matter in repository
    var created = await repo.CreateAsync(input);
    
    // 2. Provision Teams Deal Room via Graph API
    await graph.ProvisionDealChannelAsync(
        input.MatterNumber,
        input.AssignedAttorneys
    );

    return TypedResults.Created($"/api/v1/matters/{created.Id}", created);
})
.WithName("CreateMatter")
.WithOpenApi();`}

              {selectedFeature === 'di' && `// ASP.NET Core Native DI Container (builder.Services)
var builder = WebApplication.CreateBuilder(args);

// Register lifetimes: Transient, Scoped, Singleton
builder.Services.AddScoped<IIManageClient, IManageClient>();
builder.Services.AddScoped<IMicrosoftGraphClient, MicrosoftGraphClient>();
builder.Services.AddSingleton<IMatterRepository, SqlMatterRepository>();

var app = builder.Build();

// Endpoints resolve dependencies automatically from lambda parameters
app.MapGet("/api/v1/documents", async (
    string matterNumber,
    [FromServices] IIManageClient dms) =>
{
    return TypedResults.Ok(await dms.SearchDocumentsAsync(matterNumber));
});`}

              {selectedFeature === 'openapi' && `// Microsoft.AspNetCore.OpenApi built-in integration
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // Generates /openapi/v1.json out-of-the-box
    app.MapOpenApi();
}

// Copilot Studio custom connector imports:
// http://localhost:5000/openapi/v1.json`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
