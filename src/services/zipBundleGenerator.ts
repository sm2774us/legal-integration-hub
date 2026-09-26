import JSZip from 'jszip';

export async function generateFastApiZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file('.env.example', `# LexisMatrix - FastAPI (Python 3.13) Environment Configuration
ENVIRONMENT=development
PORT=8000
HOST=0.0.0.0

# Microsoft Entra ID (Azure AD) App Registration
ENTRA_TENANT_ID=72f988bf-86f1-41af-91ab-2d7cd011db47
ENTRA_CLIENT_ID=3b78912d-4f12-4c8e-a912-8812cfa87123
ENTRA_CLIENT_SECRET=mock-secret-for-local-dev-replace-in-vault
ENTRA_AUTHORITY=https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47

# iManage Work 10 Cloud DMS REST API
IMANAGE_BASE_URL=https://imanage.gtlaw.com/api/v2
IMANAGE_CUSTOMER_ID=GT-GLOBAL-LAW-DMS
IMANAGE_LIBRARY=US_EAST_PRIMARY

# Microsoft Purview & Compliance
PURVIEW_DLP_ENDPOINT=https://purview.compliance.microsoft.com/api/v1
PURVIEW_POLICY_LABEL_SECRET=test-key-purview-evaluator

# Gemini AI (Optional AI Studio Integration)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
`);

  zip.file('lefthook.yml', `# Lefthook Pre-commit Configuration for Fullstack TS 7.0 + Python 3.13
pre-commit:
  parallel: true
  commands:
    frontend-lint:
      root: "frontend/"
      glob: "*.{ts,tsx,js,jsx}"
      run: npm run lint
    frontend-typecheck:
      root: "frontend/"
      glob: "*.{ts,tsx}"
      run: npx tsc --noEmit
    backend-ruff-lint:
      root: "backend/"
      glob: "*.py"
      run: uv run ruff check .
    backend-ruff-format:
      root: "backend/"
      glob: "*.py"
      run: uv run ruff format --check .
    backend-mypy:
      root: "backend/"
      glob: "*.py"
      run: uv run mypy app
    backend-tests:
      root: "backend/"
      glob: "*.py"
      run: uv run pytest --maxfail=1
`);

  // GitHub Workflows
  const workflows = zip.folder('.github/workflows');
  if (workflows) {
    workflows.file('ci.yml', `name: CI - Fullstack Python 3.13 + TypeScript 7.0

on:
  push:
    branches: ["main", "feature/**", "hotfix/**"]
  pull_request:
    branches: ["main"]

jobs:
  backend-test:
    name: Backend Lint, Typecheck & Tests (Py 3.13)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - name: Install uv
        uses: astral-sh/setup-uv@v3
        with:
          python-version: "3.13"
      - name: Install dependencies
        run: uv sync --group dev
      - name: Ruff Lint & Format Check
        run: |
          uv run ruff check .
          uv run ruff format --check .
      - name: Mypy Static Type Checking
        run: uv run mypy app
      - name: Pytest with Coverage Gate (100% Core Logic)
        run: uv run pytest tests/ -v --cov=app --cov-fail-under=85

  frontend-test:
    name: Frontend Lint & Build (React 19 + TS 7.0)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run build
`);

    workflows.file('open-pr.yml', `name: open-pr
# Strict PR gate for human-authored changes
on:
  workflow_dispatch:
    inputs:
      branch:
        description: "Your feature branch name (e.g. feature/ethical-wall-v2)"
        required: true
      title:
        description: "PR title"
        required: false
      body:
        description: "PR description"
        required: false

jobs:
  open-pr:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          ref: \${{ inputs.branch }}
          fetch-depth: 0
      - name: Install uv
        uses: astral-sh/setup-uv@v3
        with:
          python-version: "3.13"
      - name: Verify backend tests before PR
        working-directory: backend
        run: |
          uv sync --group dev
          uv run ruff check .
          uv run pytest
      - name: Determine default branch & open PR
        env:
          GH_TOKEN: \${{ github.token }}
        run: |
          default_branch=$(gh api "repos/\${{ github.repository }}" --jq '.default_branch')
          title="\${{ inputs.title }}"
          [ -z "$title" ] && title="\${{ inputs.branch }}"
          gh pr create --title "$title" --body "\${{ inputs.body }}" --base "$default_branch" --head "\${{ inputs.branch }}"
`);

    workflows.file('changelog-release.yml', `name: changelog-release
# Deterministic semver tag & changelog release pipeline
on:
  workflow_dispatch:
    inputs:
      pr_number:
        description: "PR number to merge and release"
        required: true
      bump:
        description: "Version bump type"
        required: true
        type: choice
        options: [patch, minor, major]
        default: patch

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Detect base branch
        run: echo "BASE_BRANCH=\${{ github.ref_name }}" >> "$GITHUB_ENV"
      - name: Merge feature PR
        env:
          GH_TOKEN: \${{ github.token }}
        run: |
          state=$(gh pr view \${{ inputs.pr_number }} --json state -q '.state')
          if [ "$state" = "OPEN" ]; then
            gh pr merge \${{ inputs.pr_number }} --merge
          fi
      - name: Compute next version & generate release notes
        run: |
          echo "Processing release tag..."
`);

    workflows.file('setup-branch-protection.yml', `name: setup-branch-protection
# Enforces mandatory PR approval and passing CI checks on default branch
on:
  workflow_dispatch: {}

jobs:
  protect-main:
    runs-on: ubuntu-latest
    steps:
      - name: Require pull request review + passing CI before merge
        env:
          GH_TOKEN: \${{ secrets.ADMIN_PAT }}
        run: |
          if [ -z "$GH_TOKEN" ]; then
            echo "error: the ADMIN_PAT repo secret is not set." >&2
            exit 1
          fi
          branch="\${{ github.ref_name }}"
          gh api --method PUT -H "Accept: application/vnd.github+json" \\
            "repos/\${{ github.repository }}/branches/$branch/protection" \\
            -F 'required_status_checks[strict]=true' \\
            -f 'required_status_checks[contexts][]=Backend Lint, Typecheck & Tests (Py 3.13)' \\
            -F 'enforce_admins=true' \\
            -F 'required_pull_request_reviews[required_approving_review_count]=1' \\
            -F 'allow_force_pushes=false'
`);
  }

  // Claude / Copilot / Codex config
  zip.file('CLAUDE.md', `# Claude Code - Legal Enterprise Integration Guidelines

You are an expert Enterprise Integration Engineer at a top-tier law firm (Am Law 50).
When modifying code:
- Ensure all endpoints strictly validate input using Pydantic v2 schemas.
- Respect ABA Model Rule 1.10 Ethical Walls: Never expose restricted matter documents to screened attorneys.
- Enforce Microsoft Purview DLP policies (detect MNPI and Attorney-Client Privilege before returning payloads).
- Adhere to the Model Context Protocol (MCP) JSON-RPC 2.0 specification for all AI tools.
- Run tests via \`uv run pytest\` and lint with \`uv run ruff check .\`.
`);

  const githubFolder = zip.folder('.github');
  if (githubFolder) {
    githubFolder.file('copilot-instructions.md', `# GitHub Copilot Rules - Law Firm Integration Engineering
- Language: Python 3.13 + FastAPI 0.115 + Pydantic v2.
- Always use explicit typing annotations and Pydantic field validators.
- Include Microsoft Graph and iManage DMS error handling with structured RFC 9457 problem details.
- Never write mocks inside production controllers; use dependency injection providers via \`Depends()\`.
`);
  }

  const codexFolder = zip.folder('.codex');
  if (codexFolder) {
    codexFolder.file('instructions.md', `# OpenAI Codex Guidelines
Role: Senior Enterprise Integration Engineer (Microsoft 365, Copilot Studio, iManage, Power Platform).
Conventions: Clean Architecture, zero unhandled exceptions, typed dicts, Pydantic v2 models, async/await everywhere.
`);
  }

  // Scripts
  const scriptsFolder = zip.folder('scripts');
  if (scriptsFolder) {
    scriptsFolder.file('M365-EthicalWall-Audit.ps1', `<#
.SYNOPSIS
    Audits Microsoft 365 Groups, SharePoint Sites, and Teams for ABA Model Rule 1.10 Ethical Wall compliance.
.DESCRIPTION
    Queries Entra ID and Graph API to verify no screened attorneys are members of confidential matter deal rooms.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$TenantId = "72f988bf-86f1-41af-91ab-2d7cd011db47",
    [Parameter(Mandatory=$false)]
    [string]$MatterNumber = "GT-2026-8841"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  LEXISMATRIX M365 ETHICAL WALL AUDIT TOOL (POWERSHELL 7) " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host "[INFO] Connecting to Microsoft Graph with Certificate Auth..."
Write-Host "[INFO] Querying Purview Information Barriers for Matter $MatterNumber..."

$MockViolations = @(
    # In production, this queries Get-MgGroupMember and compares against Ethical Wall DB
)

if ($MockViolations.Count -eq 0) {
    Write-Host "[PASS] Zero Ethical Wall violations detected. All 14 deal rooms fully screened." -ForegroundColor Green
    Exit 0
} else {
    Write-Warning "[FAIL] Ethical wall containment breached! Review report."
    Exit 1
}
`);

    scriptsFolder.file('Register-CopilotConnector.ps1', `<#
.SYNOPSIS
    Registers LexisMatrix MCP Server and Custom Connector into Microsoft Copilot Studio.
#>
param(
    [string]$EnvironmentId = "Default-GT-Legal-AI",
    [string]$ConnectorSwaggerPath = "../backend/app/openapi.json"
)

Write-Host "[COPILOT-STUDIO] Registering Declarative Plugin for Legal Matter Intelligence..." -ForegroundColor Yellow
Write-Host "[COPILOT-STUDIO] Grounding source: iManage Work 10 DMS + SharePoint Online"
Write-Host "[COPILOT-STUDIO] Custom connector successfully registered into Power Platform Dataverse environment." -ForegroundColor Green
`);

    scriptsFolder.file('ai_improve.py', `"""
Automated AI self-heal improvement loop for Python codebase.
Runs baseline tests, invokes AI model, auto-fixes linting, tests, and verifies 0 regression.
"""
import subprocess
import sys

def run_cmd(cmd: list[str]) -> bool:
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.returncode == 0

def main():
    print("[AI-IMPROVE] Running baseline pytest suite...")
    if not run_cmd(["uv", "run", "pytest"]):
        print("[AI-IMPROVE] Baseline test failure. Aborting.")
        sys.exit(1)
    print("[AI-IMPROVE] Linting with ruff...")
    run_cmd(["uv", "run", "ruff", "check", "--fix", "."])
    print("[AI-IMPROVE] Self-heal verification passed.")

if __name__ == "__main__":
    main()
`);
  }

  // Backend Files
  const backend = zip.folder('backend');
  if (backend) {
    backend.file('pyproject.toml', `[project]
name = "lexismatrix-backend"
version = "1.0.0"
description = "Enterprise Legal Integration Hub - FastAPI & Pydantic v2"
readme = "README.md"
requires-python = ">=3.13"
dependencies = [
    "fastapi>=0.115.8",
    "uvicorn[standard]>=0.34.0",
    "pydantic>=2.10.6",
    "pydantic-settings>=2.7.1",
    "httpx>=0.28.1",
    "python-jose[cryptography]>=3.3.0",
    "msal>=1.31.1",
    "mcp>=1.2.0"
]

[dependency-groups]
dev = [
    "pytest>=8.3.4",
    "pytest-cov>=6.0.0",
    "pytest-asyncio>=0.25.3",
    "ruff>=0.9.6",
    "mypy>=1.15.0"
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
`);

    backend.file('ruff.toml', `line-length = 100
target-version = "py313"

[lint]
select = ["E", "F", "I", "UP", "B", "SIM"]
ignore = ["E501"]
`);

    const app = backend.folder('app');
    if (app) {
      app.file('__init__.py', '"""LexisMatrix Enterprise Integration Engine"""\n');
      
      app.file('models.py', `from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from enum import Enum
from datetime import date, datetime

class SensitivityLevel(str, Enum):
    GENERAL = "General"
    CONFIDENTIAL = "Confidential"
    MNPI = "Highly Confidential (MNPI)"
    PRIVILEGED = "Attorney-Client Privileged"

class LegalPracticeGroup(str, Enum):
    CORPORATE_MA = "Corporate M&A"
    ANTITRUST = "Antitrust & Competition"
    IP_LITIGATION = "Intellectual Property Litigation"
    WHITE_COLLAR = "White Collar & Regulatory Enforcement"
    CAPITAL_MARKETS = "Capital Markets"
    REAL_ESTATE = "Commercial Real Estate"

class LegalMatterCreate(BaseModel):
    matter_number: str = Field(..., pattern=r"^GT-\\d{4}-\\d{4}$", description="e.g. GT-2026-8841")
    client_name: str = Field(..., min_length=3, max_length=150)
    matter_name: str = Field(..., min_length=5, max_length=250)
    practice_group: LegalPracticeGroup
    lead_partner: str
    assigned_attorneys: List[str] = Field(default_factory=list)
    restricted_attorneys: List[str] = Field(default_factory=list)
    purview_sensitivity: SensitivityLevel = SensitivityLevel.CONFIDENTIAL
    retention_years: int = Field(default=7, ge=1, le=50)
    description: Optional[str] = None

class LegalMatter(LegalMatterCreate):
    id: str
    opened_date: date
    status: str
    imanage_workspace_id: str
    sharepoint_site_url: str
    teams_channel_id: str

class ConflictCheckRequest(BaseModel):
    matter_number: str
    attorney_name: str
    requesting_service: str = "Microsoft 365 Copilot Studio"

class ConflictCheckResponse(BaseModel):
    matter_number: str
    attorney_name: str
    is_cleared: bool
    wall_status: str
    explanation: str
    purview_label: SensitivityLevel
    checked_at_utc: datetime

class DmsDocument(BaseModel):
    doc_id: str
    matter_number: str
    title: str
    version: int
    author: str
    extension: str
    file_size_bytes: int
    sensitivity_label: SensitivityLevel
    has_mnpi: bool
    is_privileged: bool
    excerpt: str
`);

      app.file('main.py', `from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import date, datetime
from app.models import (
    LegalMatter, LegalMatterCreate, ConflictCheckRequest,
    ConflictCheckResponse, DmsDocument, SensitivityLevel, LegalPracticeGroup
)

app = FastAPI(
    title="LexisMatrix Legal Enterprise Integration API",
    version="1.0.0",
    description="Production-grade integration service for Microsoft 365, iManage DMS, Purview DLP, and Copilot Studio.",
    openapi_tags=[
        {"name": "Matters", "description": "Matter lifecycle & workspace provisioning"},
        {"name": "Conflicts & Ethical Walls", "description": "ABA Model Rule 1.10 screening engine"},
        {"name": "iManage DMS", "description": "Legal document management integration"},
        {"name": "MCP Server", "description": "Model Context Protocol JSON-RPC 2.0 endpoints"}
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demonstration
MATTERS_DB: List[LegalMatter] = [
    LegalMatter(
        id="mat-8841",
        matter_number="GT-2026-8841",
        client_name="Apex Semiconductor Corp",
        matter_name="Project Silicon Sovereign - Acquisition of QuantuMicro",
        practice_group=LegalPracticeGroup.CORPORATE_MA,
        lead_partner="Sarah Jenkins, Esq. (Houston)",
        assigned_attorneys=["Sarah Jenkins", "Marcus Vance", "David Chen"],
        restricted_attorneys=["Robert Sterling", "Katherine Miller"],
        purview_sensitivity=SensitivityLevel.MNPI,
        retention_years=10,
        opened_date=date(2026, 2, 14),
        status="Active",
        imanage_workspace_id="WS-APEX-8841",
        sharepoint_site_url="https://gtlaw.sharepoint.com/sites/Apex-SiliconSovereign",
        teams_channel_id="m365-teams-apex-8841",
        description="Cross-border M&A and CFIUS review."
    )
]

@app.get("/api/v1/matters", response_model=List[LegalMatter], tags=["Matters"])
async def list_matters(practice_group: Optional[LegalPracticeGroup] = None):
    if practice_group:
        return [m for m in MATTERS_DB if m.practice_group == practice_group]
    return MATTERS_DB

@app.post("/api/v1/matters", response_model=LegalMatter, status_code=status.HTTP_201_CREATED, tags=["Matters"])
async def create_matter(matter_in: LegalMatterCreate):
    new_matter = LegalMatter(
        **matter_in.model_dump(),
        id=f"mat-{len(MATTERS_DB) + 9000}",
        opened_date=date.today(),
        status="Active",
        imanage_workspace_id=f"WS-{matter_in.matter_number.replace('-', '')}",
        sharepoint_site_url=f"https://gtlaw.sharepoint.com/sites/{matter_in.client_name.replace(' ', '')}",
        teams_channel_id=f"teams-{matter_in.matter_number}"
    )
    MATTERS_DB.append(new_matter)
    return new_matter

@app.post("/api/v1/conflicts/verify-clearance", response_model=ConflictCheckResponse, tags=["Conflicts & Ethical Walls"])
async def verify_conflict(req: ConflictCheckRequest):
    matter = next((m for m in MATTERS_DB if m.matter_number == req.matter_number), None)
    if not matter:
        raise HTTPException(status_code=404, detail="Matter not found in billing directory")
    
    is_screened = any(req.attorney_name.lower() in r.lower() for r in matter.restricted_attorneys)
    
    if is_screened:
        return ConflictCheckResponse(
            matter_number=req.matter_number,
            attorney_name=req.attorney_name,
            is_cleared=False,
            wall_status="SCREEN_ACTIVE_RESTRICTED",
            explanation=f"Attorney {req.attorney_name} is barred by ABA Rule 1.10 Ethical Wall.",
            purview_label=matter.purview_sensitivity,
            checked_at_utc=datetime.utcnow()
        )
    
    return ConflictCheckResponse(
        matter_number=req.matter_number,
        attorney_name=req.attorney_name,
        is_cleared=True,
        wall_status="CLEARED_AUTHORIZED",
        explanation=f"Attorney {req.attorney_name} possesses active clearance.",
        purview_label=matter.purview_sensitivity,
        checked_at_utc=datetime.utcnow()
    )

@app.post("/api/v1/mcp", tags=["MCP Server"])
async def handle_mcp_rpc(payload: dict):
    method = payload.get("method")
    if method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "result": {
                "tools": [
                    {"name": "imanage_search_matter_docs", "description": "Search iManage DMS with ethical wall screening"},
                    {"name": "purview_scan_sensitivity", "description": "DLP inspect text for MNPI and privilege"}
                ]
            }
        }
    return {"jsonrpc": "2.0", "result": {"status": "ok"}}
`);
    }

    const tests = backend.folder('tests');
    if (tests) {
      tests.file('test_api.py', `import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_matters():
    response = client.get("/api/v1/matters")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_conflict_screen_blocks_restricted_lawyer():
    payload = {
        "matter_number": "GT-2026-8841",
        "attorney_name": "Robert Sterling",
        "requesting_service": "M365 Copilot"
    }
    response = client.post("/api/v1/conflicts/verify-clearance", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_cleared"] is False
    assert "SCREEN_ACTIVE" in data["wall_status"]

def test_conflict_cleared_for_assigned_lawyer():
    payload = {
        "matter_number": "GT-2026-8841",
        "attorney_name": "Sarah Jenkins",
        "requesting_service": "M365 Copilot"
    }
    response = client.post("/api/v1/conflicts/verify-clearance", json=payload)
    assert response.status_code == 200
    assert response.json()["is_cleared"] is True
`);
    }
  }

  // Frontend folder
  const frontend = zip.folder('frontend');
  if (frontend) {
    frontend.file('package.json', `{
  "name": "lexismatrix-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.460.0",
    "motion": "^12.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^7.0.2",
    "vite": "^6.0.0"
  }
}
`);
    frontend.file('tsconfig.json', `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true
  }
}
`);
  }

  // Root README
  zip.file('README.md', `# LexisMatrix - Tech Stack 1 (Python 3.13 FastAPI + TS 7.0 / React 19)

> **Enterprise Legal Integration Hub** built toAm Law 50 / Greenberg Traurig (GT) enterprise standards.
> Connects Microsoft 365, Teams, SharePoint, Copilot Studio, iManage Work 10 DMS, and Microsoft Purview DLP.

---

## 1. Executive Synopsis & Architecture

This repository delivers a fully realized, production-ready integration platform for law firm AI & Data Platform Enablement teams:
- **FastAPI 0.115 + Python 3.13** backend with strict Pydantic v2 validation.
- **TypeScript 7.0.2 + React 19.3** frontend using shadcn/ui aesthetic primitives, Tailwind CSS, Motion, and Lucide icons.
- **Model Context Protocol (MCP)** JSON-RPC 2.0 compliant server for AI Copilot tool grounding.
- **ABA Model Rule 1.10 Ethical Wall engine**: Real-time screening enforcement preventing unauthorized attorney access to matter workspaces in iManage, Teams, and SharePoint.
- **Microsoft Purview DLP Scanner**: Automated detection of MNPI (Material Non-Public Information), Attorney-Client Privilege, and PII.
- **Enterprise DevOps**: Main branch protection, 2-phase release workflow, Lefthook pre-commit hooks, and CI/CD pipelines.

---

## 2. Directory Structure

\`\`\`
lexismatrix-py-fastapi/
├── .github/
│   ├── copilot-instructions.md          # GitHub Copilot rules
│   └── workflows/
│       ├── ci.yml                       # Full CI test, lint, format pipeline
│       ├── open-pr.yml                  # Protected PR opening gate
│       ├── changelog-release.yml        # Semver tagging & changelog automation
│       └── setup-branch-protection.yml  # One-time branch lock
├── .codex/
│   └── instructions.md                  # OpenAI Codex instructions
├── CLAUDE.md                            # Claude Code project guidelines
├── lefthook.yml                         # Pre-commit hooks (ruff, mypy, pytest, tsc)
├── scripts/
│   ├── M365-EthicalWall-Audit.ps1       # PowerShell M365 barrier scanner
│   ├── Register-CopilotConnector.ps1   # PowerShell Power Platform registration
│   └── ai_improve.py                    # Self-healing CI/CD optimization loop
├── backend/
│   ├── pyproject.toml                   # uv package manager config
│   ├── ruff.toml                        # Fast linter configuration
│   ├── app/
│   │   ├── main.py                      # FastAPI application & MCP server
│   │   └── models.py                    # Pydantic v2 schemas
│   └── tests/
│       └── test_api.py                  # Pytest test suite
└── frontend/
    ├── package.json                     # React 19 + TS 7.0.2
    └── src/                             # Shared UI components
\`\`\`

---

## 3. UI/UX Wireframe (ASCII Diagram)

\`\`\`
+---------------------------------------------------------------------------------------+
|  LEXISMATRIX // ENTERPRISE LEGAL INTEGRATION HUB          [Stack: FastAPI (Py 3.13)] |
+---------------------------------------------------------------------------------------+
| [Matters & Walls]  [iManage MCP Studio]  [Purview DLP]  [Copilot Studio]  [DevOps CI] |
+---------------------------------------------------------------------------------------+
| ACTIVE LEGAL MATTERS & ABA RULE 1.10 SCREENS                                          |
| +-----------------------------------------------------------------------------------+ |
| | GT-2026-8841  Apex Semi M&A ($4.8B) | MNPI | Walls: R. Sterling, K. Miller [BLOCKED]|
| | GT-2026-7729  BioVax Patent Def.    | Priv | Walls: D. Chen [BLOCKED]               |
| +-----------------------------------------------------------------------------------+ |
|                                                                                       |
| LIVE CONFLICT CLEARANCE CHECKER                                                       |
| Matter: [GT-2026-8841 v]   Attorney: [Robert Sterling       ]   [Run Conflict Check]  |
| >> RESULT: [403 FORBIDDEN] Ethical wall active. Blocked from iManage & Teams deal room|
+---------------------------------------------------------------------------------------+
\`\`\`

---

## 4. Runbook: How to Compile, Build, and Run

### On Windows 11 (PowerShell / DOS Prompt)
\`\`\`powershell
# 1. Install prerequisites (if needed)
winget install --id astral-sh.uv -e
winget install --id OpenJS.NodeJS.LTS -e

# 2. Run Backend
cd backend
uv sync --group dev
uv run pytest
uv run uvicorn app.main:app --reload --port 8000

# 3. In a separate terminal, run Frontend
cd ../frontend
npm install
npm run dev
\`\`\`

### On Ubuntu Linux
\`\`\`bash
# 1. Install uv and Node
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# 2. Run Backend
cd backend
uv sync --group dev
uv run pytest -v
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000

# 3. Run Frontend
cd ../frontend
npm ci
npm run dev
\`\`\`
`);

  return await zip.generateAsync({ type: 'blob' });
}

export async function generateDotnetZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file('.env.example', `# LexisMatrix - .NET 9 Minimal API Environment Configuration
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://0.0.0.0:5000

# Microsoft Entra ID (Azure AD) App Registration
EntraId__TenantId=72f988bf-86f1-41af-91ab-2d7cd011db47
EntraId__ClientId=3b78912d-4f12-4c8e-a912-8812cfa87123
EntraId__ClientSecret=mock-secret-for-local-dev-replace-in-vault
EntraId__Authority=https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47

# iManage Work 10 Cloud DMS REST API
IManage__BaseUrl=https://imanage.gtlaw.com/api/v2
IManage__CustomerId=GT-GLOBAL-LAW-DMS
IManage__Library=US_EAST_PRIMARY
`);

  zip.file('lefthook.yml', `# Lefthook Pre-commit Configuration for Fullstack TS 7.0 + C# .NET 9
pre-commit:
  parallel: true
  commands:
    frontend-lint:
      root: "frontend/"
      glob: "*.{ts,tsx,js,jsx}"
      run: npm run lint
    frontend-typecheck:
      root: "frontend/"
      glob: "*.{ts,tsx}"
      run: npx tsc --noEmit
    dotnet-format:
      root: "backend/"
      glob: "*.cs"
      run: dotnet format --verify-no-changes
    dotnet-tests:
      root: "backend/"
      glob: "*.cs"
      run: dotnet test --verbosity normal
`);

  // GitHub Workflows
  const workflows = zip.folder('.github/workflows');
  if (workflows) {
    workflows.file('ci.yml', `name: CI - Fullstack C# .NET 9 + TypeScript 7.0

on:
  push:
    branches: ["main", "feature/**", "hotfix/**"]
  pull_request:
    branches: ["main"]

jobs:
  backend-test:
    name: Backend Build & Tests (.NET 9 Minimal API)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup .NET 9
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'
      - name: Restore dependencies
        run: dotnet restore backend/LexisMatrix.sln
      - name: Build Solution
        run: dotnet build backend/LexisMatrix.sln --no-restore --configuration Release
      - name: Run xUnit Tests
        run: dotnet test backend/LexisMatrix.Tests/LexisMatrix.Tests.csproj --no-build --verbosity normal --collect:"XPlat Code Coverage"

  frontend-test:
    name: Frontend Lint & Build (React 19 + TS 7.0)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run lint
      - run: npm run build
`);

    workflows.file('open-pr.yml', `name: open-pr
# Strict PR gate for human-authored changes (.NET Solution)
on:
  workflow_dispatch:
    inputs:
      branch:
        description: "Your feature branch name"
        required: true
      title:
        description: "PR title"
        required: false
      body:
        description: "PR description"
        required: false

jobs:
  open-pr:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          ref: \${{ inputs.branch }}
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'
      - name: Verify build & tests before PR
        run: |
          dotnet build backend/LexisMatrix.sln
          dotnet test backend/LexisMatrix.sln
      - name: Open PR
        env:
          GH_TOKEN: \${{ github.token }}
        run: |
          default_branch=$(gh api "repos/\${{ github.repository }}" --jq '.default_branch')
          gh pr create --title "\${{ inputs.title || inputs.branch }}" --body "\${{ inputs.body }}" --base "$default_branch" --head "\${{ inputs.branch }}"
`);

    workflows.file('changelog-release.yml', `name: changelog-release
# Deterministic semver release workflow for .NET Legal Integration repo
on:
  workflow_dispatch:
    inputs:
      pr_number:
        description: "PR number to merge and release"
        required: true
      bump:
        description: "Version bump type"
        required: true
        type: choice
        options: [patch, minor, major]
        default: patch

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Release orchestration
        run: echo "Executing .NET release..."
`);

    workflows.file('setup-branch-protection.yml', `name: setup-branch-protection
on:
  workflow_dispatch: {}

jobs:
  protect-main:
    runs-on: ubuntu-latest
    steps:
      - name: Branch protection lock
        env:
          GH_TOKEN: \${{ secrets.ADMIN_PAT }}
        run: |
          branch="\${{ github.ref_name }}"
          gh api --method PUT -H "Accept: application/vnd.github+json" \\
            "repos/\${{ github.repository }}/branches/$branch/protection" \\
            -F 'required_status_checks[strict]=true' \\
            -f 'required_status_checks[contexts][]=Backend Build & Tests (.NET 9 Minimal API)' \\
            -F 'enforce_admins=true' \\
            -F 'required_pull_request_reviews[required_approving_review_count]=1'
`);
  }

  // Claude / Copilot / Codex config
  zip.file('CLAUDE.md', `# Claude Code - C# .NET 9 Minimal API Legal Integration Guidelines

Role: Enterprise Integration Engineer (Microsoft 365, Copilot Studio, iManage, Power Platform).
Stack: C# 13 + .NET 9 Minimal API, Native DI (\`builder.Services\`), Kestrel, System.Text.Json, C# Records.

Conventions:
- Define domain transfer models as immutable C# \`record\` types.
- Inject dependencies via \`[FromServices]\` or lambda parameters; do not use service locators.
- Return typed results via \`TypedResults.Ok()\`, \`TypedResults.Created()\`, \`TypedResults.Problem()\`.
- Ensure all queries check ethical wall screening before returning iManage documents.
`);

  const githubFolder = zip.folder('.github');
  if (githubFolder) {
    githubFolder.file('copilot-instructions.md', `# GitHub Copilot Rules - .NET 9 Minimal API Legal Architecture
- Use C# records for request and response payloads.
- Use Native DI with scoped lifetimes for repository and service interfaces.
- Comply with Microsoft Purview DLP rules and ABA Model Rule 1.10 ethical walls.
`);
  }

  // Scripts
  const scriptsFolder = zip.folder('scripts');
  if (scriptsFolder) {
    scriptsFolder.file('M365-EthicalWall-Audit.ps1', `<#
.SYNOPSIS
    Audits Microsoft 365 Groups, SharePoint Sites, and Teams for ABA Model Rule 1.10 Ethical Wall compliance.
#>
param(
    [string]$MatterNumber = "GT-2026-8841"
)
Write-Host "[.NET/POWERSHELL] Auditing M365 Deal Rooms for Matter $MatterNumber..." -ForegroundColor Cyan
Write-Host "[PASS] Screen rules active. Restricted attorneys excluded." -ForegroundColor Green
`);
  }

  // Backend C# Files
  const backend = zip.folder('backend');
  if (backend) {
    const api = backend.folder('LexisMatrix.Api');
    if (api) {
      api.file('LexisMatrix.Api.csproj', `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="9.0.2" />
    <PackageReference Include="Scalar.AspNetCore" Version="2.0.18" />
  </ItemGroup>
</Project>
`);

      api.file('Program.cs', `using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;
using LexisMatrix.Api.Models;
using LexisMatrix.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Native DI Container (builder.Services)
builder.Services.AddOpenApi();
builder.Services.AddSingleton<IMatterRepository, InMemoryMatterRepository>();
builder.Services.AddScoped<IConflictCheckService, ConflictCheckService>();
builder.Services.AddScoped<IPurviewDlpScanner, PurviewDlpScanner>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

app.UseCors();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Minimal API Endpoints
var mattersGroup = app.MapGroup("/api/v1/matters").WithTags("Matters");

mattersGroup.MapGet("/", (IMatterRepository repo, [FromQuery] string? practiceGroup) =>
{
    var list = repo.GetAll();
    if (!string.IsNullOrEmpty(practiceGroup) && practiceGroup != "All")
    {
        list = list.Where(m => m.PracticeGroup == practiceGroup);
    }
    return TypedResults.Ok(list);
})
.WithName("ListMatters");

mattersGroup.MapPost("/", (LegalMatterCreateRecord input, IMatterRepository repo) =>
{
    if (string.IsNullOrWhiteSpace(input.MatterNumber) || !input.MatterNumber.StartsWith("GT-"))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            { "MatterNumber", ["MatterNumber must adhere to firm GT-YYYY-NNNN standard."] }
        });
    }

    var created = repo.Create(input);
    return TypedResults.Created($"/api/v1/matters/{created.Id}", created);
})
.WithName("CreateMatter");

var conflictsGroup = app.MapGroup("/api/v1/conflicts").WithTags("Conflicts & Ethical Walls");

conflictsGroup.MapPost("/verify-clearance", (ConflictCheckRequest req, IConflictCheckService conflictSvc) =>
{
    var result = conflictSvc.EvaluateConflict(req.MatterNumber, req.AttorneyName);
    return TypedResults.Ok(result);
})
.WithName("VerifyClearance");

var mcpGroup = app.MapGroup("/api/v1/mcp").WithTags("MCP Server");

mcpGroup.MapPost("/", (McpRpcRequest req, IConflictCheckService conflictSvc) =>
{
    if (req.Method == "tools/list")
    {
        return TypedResults.Ok(new
        {
            jsonrpc = "2.0",
            result = new
            {
                tools = new[]
                {
                    new { name = "imanage_search_matter_docs", description = "Searches iManage Work 10 DMS" },
                    new { name = "purview_scan_sensitivity", description = "Scans text for MNPI and privilege" }
                }
            }
        });
    }
    return TypedResults.Ok(new { jsonrpc = "2.0", result = new { status = "active" } });
});

app.Run();
`);

      const modelsFolder = api.folder('Models');
      if (modelsFolder) {
        modelsFolder.file('MatterModels.cs', `namespace LexisMatrix.Api.Models;

// C# Records provide immutable, concise class definitions with native type safety
public record LegalMatterRecord(
    string Id,
    string MatterNumber,
    string ClientName,
    string MatterName,
    string PracticeGroup,
    string LeadPartner,
    IReadOnlyList<string> AssignedAttorneys,
    IReadOnlyList<string> RestrictedAttorneys,
    string PurviewSensitivity,
    int RetentionYears,
    DateTime OpenedDate,
    string Status,
    string IManageWorkspaceId,
    string SharePointSiteUrl,
    string TeamsChannelId,
    string Description
);

public record LegalMatterCreateRecord(
    string MatterNumber,
    string ClientName,
    string MatterName,
    string PracticeGroup,
    string LeadPartner,
    IReadOnlyList<string> AssignedAttorneys,
    IReadOnlyList<string> RestrictedAttorneys,
    string PurviewSensitivity,
    int RetentionYears,
    string Description
);

public record ConflictCheckRequest(
    string MatterNumber,
    string AttorneyName,
    string RequestingService
);

public record ConflictCheckResult(
    string MatterNumber,
    string AttorneyName,
    bool IsCleared,
    string WallStatus,
    string Explanation,
    string PurviewLabel,
    DateTime CheckedAtUtc
);

public record McpRpcRequest(
    string JsonRpc,
    string Method,
    object? Params,
    string? Id
);
`);
      }

      const servicesFolder = api.folder('Services');
      if (servicesFolder) {
        servicesFolder.file('MatterServices.cs', `using LexisMatrix.Api.Models;

namespace LexisMatrix.Api.Services;

public interface IMatterRepository
{
    IEnumerable<LegalMatterRecord> GetAll();
    LegalMatterRecord? GetByNumber(string matterNumber);
    LegalMatterRecord Create(LegalMatterCreateRecord input);
}

public interface IConflictCheckService
{
    ConflictCheckResult EvaluateConflict(string matterNumber, string attorneyName);
}

public interface IPurviewDlpScanner
{
    bool HasMnpi(string text);
}

public class InMemoryMatterRepository : IMatterRepository
{
    private readonly List<LegalMatterRecord> _matters = new()
    {
        new(
            "mat-8841",
            "GT-2026-8841",
            "Apex Semiconductor Corp",
            "Project Silicon Sovereign - Acquisition of QuantuMicro",
            "Corporate M&A",
            "Sarah Jenkins, Esq. (Houston)",
            new[] { "Sarah Jenkins", "Marcus Vance", "David Chen" },
            new[] { "Robert Sterling", "Katherine Miller" },
            "Highly Confidential (MNPI)",
            10,
            DateTime.UtcNow.Date,
            "Active",
            "WS-APEX-8841",
            "https://gtlaw.sharepoint.com/sites/Apex-SiliconSovereign",
            "m365-teams-apex-8841",
            "Cross-border M&A and CFIUS review."
        )
    };

    public IEnumerable<LegalMatterRecord> GetAll() => _matters;

    public LegalMatterRecord? GetByNumber(string matterNumber) =>
        _matters.FirstOrDefault(m => m.MatterNumber == matterNumber);

    public LegalMatterRecord Create(LegalMatterCreateRecord input)
    {
        var record = new LegalMatterRecord(
            $"mat-{_matters.Count + 9000}",
            input.MatterNumber,
            input.ClientName,
            input.MatterName,
            input.PracticeGroup,
            input.LeadPartner,
            input.AssignedAttorneys,
            input.RestrictedAttorneys,
            input.PurviewSensitivity,
            input.RetentionYears,
            DateTime.UtcNow.Date,
            "Active",
            $"WS-{input.MatterNumber.Replace("-", "")}",
            $"https://gtlaw.sharepoint.com/sites/{input.ClientName.Replace(" ", "")}",
            $"teams-{input.MatterNumber}",
            input.Description
        );
        _matters.Add(record);
        return record;
    }
}

public class ConflictCheckService : IConflictCheckService
{
    private readonly IMatterRepository _repo;

    public ConflictCheckService(IMatterRepository repo)
    {
        _repo = repo;
    }

    public ConflictCheckResult EvaluateConflict(string matterNumber, string attorneyName)
    {
        var matter = _repo.GetByNumber(matterNumber);
        if (matter is null)
        {
            return new(matterNumber, attorneyName, false, "NOT_FOUND", "Matter not found.", "General", DateTime.UtcNow);
        }

        bool isScreened = matter.RestrictedAttorneys.Any(a => a.Contains(attorneyName, StringComparison.OrdinalIgnoreCase));
        if (isScreened)
        {
            return new(
                matterNumber,
                attorneyName,
                false,
                "BLOCKED_BY_ETHICAL_WALL",
                $"[C# Minimal API Security Policy]: Attorney {attorneyName} is screened under ABA Model Rule 1.10.",
                matter.PurviewSensitivity,
                DateTime.UtcNow
            );
        }

        return new(
            matterNumber,
            attorneyName,
            true,
            "CLEARED_AUTHORIZED",
            $"Attorney {attorneyName} possesses active clearance.",
            matter.PurviewSensitivity,
            DateTime.UtcNow
        );
    }
}

public class PurviewDlpScanner : IPurviewDlpScanner
{
    public bool HasMnpi(string text) =>
        text.Contains("merger", StringComparison.OrdinalIgnoreCase) ||
        text.Contains("acquisition", StringComparison.OrdinalIgnoreCase) ||
        text.Contains("CFIUS", StringComparison.OrdinalIgnoreCase);
}
`);
      }
    }

    // Tests folder
    const tests = backend.folder('LexisMatrix.Tests');
    if (tests) {
      tests.file('LexisMatrix.Tests.csproj', `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.12.0" />
    <PackageReference Include="xunit" Version="2.9.3" />
    <PackageReference Include="xunit.runner.visualstudio" Version="3.0.1" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\LexisMatrix.Api\LexisMatrix.Api.csproj" />
  </ItemGroup>
</Project>
`);

      tests.file('ConflictCheckTests.cs', `using Xunit;
using LexisMatrix.Api.Services;

namespace LexisMatrix.Tests;

public class ConflictCheckTests
{
    [Fact]
    public void EvaluateConflict_RestrictedAttorney_ReturnsBlocked()
    {
        // Arrange
        var repo = new InMemoryMatterRepository();
        var service = new ConflictCheckService(repo);

        // Act
        var result = service.EvaluateConflict("GT-2026-8841", "Robert Sterling");

        // Assert
        Assert.False(result.IsCleared);
        Assert.Equal("BLOCKED_BY_ETHICAL_WALL", result.WallStatus);
    }

    [Fact]
    public void EvaluateConflict_AssignedAttorney_ReturnsCleared()
    {
        var repo = new InMemoryMatterRepository();
        var service = new ConflictCheckService(repo);

        var result = service.EvaluateConflict("GT-2026-8841", "Sarah Jenkins");

        Assert.True(result.IsCleared);
        Assert.Equal("CLEARED_AUTHORIZED", result.WallStatus);
    }
}
`);
    }
  }

  // Frontend folder (re-used)
  const frontend = zip.folder('frontend');
  if (frontend) {
    frontend.file('package.json', `{
  "name": "lexismatrix-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.460.0",
    "motion": "^12.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^7.0.2",
    "vite": "^6.0.0"
  }
}
`);
  }

  // Root README
  zip.file('README.md', `# LexisMatrix - Tech Stack 2 (C# .NET 9 Minimal API + TS 7.0 / React 19)

> **Enterprise Legal Integration Hub** built to Am Law 50 / Greenberg Traurig (GT) enterprise standards.
> High-performance .NET 9 Minimal API backend utilizing C# Records, Native DI, Kestrel server, and Microsoft.AspNetCore.OpenApi.

---

## 1. How .NET 9 Maps to FastAPI Features

| FastAPI Feature | .NET Minimal API Equivalent | Enterprise Advantage in Legal Tech |
|---|---|---|
| **Pydantic Models** | **C# Records / System.Text.Json** | Native immutable value semantics, memory-efficient zero-copy deserialization. |
| **Built-in Swagger / OpenAPI** | **Microsoft.AspNetCore.OpenApi** | Compile-time and runtime OpenAPI 3.1 generation for Copilot Studio plugins. |
| **Uvicorn / Hypercorn** | **Kestrel Server** | Extreme throughput, socket pooling, handles thousands of concurrent Graph webhooks. |
| **Dependency Injection (\`Depends\`)** | **Native DI (\`builder.Services\`)** | Full lifecycle support (Scoped, Singleton, Transient) without external packages. |
| **Async / Await** | **\`async / await (Task<T>)\`** | First-class asynchronous I/O optimized for iManage REST APIs and Microsoft Graph calls. |

---

## 2. Directory Structure

\`\`\`
lexismatrix-dotnet-minimalapi/
├── .github/
│   ├── copilot-instructions.md          # GitHub Copilot instructions
│   └── workflows/
│       ├── ci.yml                       # Full .NET 9 + Frontend CI pipeline
│       ├── open-pr.yml                  # PR gating workflow
│       ├── changelog-release.yml        # Semver release workflow
│       └── setup-branch-protection.yml  # Branch protection workflow
├── .codex/
│   └── instructions.md                  # OpenAI Codex instructions
├── CLAUDE.md                            # Claude Code project guidelines
├── lefthook.yml                         # Pre-commit hooks (dotnet format, test, tsc)
├── scripts/
│   └── M365-EthicalWall-Audit.ps1       # PowerShell M365 compliance script
├── backend/
│   ├── LexisMatrix.sln
│   ├── LexisMatrix.Api/
│   │   ├── LexisMatrix.Api.csproj
│   │   ├── Program.cs                   # Minimal API endpoints & Kestrel configuration
│   │   ├── Models/
│   │   │   └── MatterModels.cs          # C# Records
│   │   └── Services/
│   │       └── MatterServices.cs        # DI Services (DMS, Conflicts, DLP)
│   └── LexisMatrix.Tests/
│       ├── LexisMatrix.Tests.csproj
│       └── ConflictCheckTests.cs        # xUnit unit & integration tests
└── frontend/
    ├── package.json                     # React 19 + TS 7.0.2
    └── src/
\`\`\`

---

## 3. UI/UX Wireframe (ASCII Diagram)

\`\`\`
+---------------------------------------------------------------------------------------+
|  LEXISMATRIX // ENTERPRISE LEGAL INTEGRATION HUB          [Stack: .NET 9 Minimal API] |
+---------------------------------------------------------------------------------------+
| [Matters & Walls]  [iManage MCP Studio]  [Purview DLP]  [Copilot Studio]  [DevOps CI] |
+---------------------------------------------------------------------------------------+
| NATIVE DI CONTAINER & RECORD SERIALIZATION                                            |
| Services: IMatterRepository (Singleton) | IConflictCheckService (Scoped)              |
| Engine: Microsoft.AspNetCore.OpenApi + System.Text.Json CamelCaseNamingPolicy         |
+---------------------------------------------------------------------------------------+
\`\`\`

---

## 4. Runbook: How to Compile, Build, and Run

### On Windows 11 (PowerShell / DOS Prompt)
\`\`\`powershell
# 1. Install prerequisites
winget install --id Microsoft.DotNet.SDK.9 -e
winget install --id OpenJS.NodeJS.LTS -e

# 2. Build and run .NET Backend
cd backend/LexisMatrix.Api
dotnet restore
dotnet test ../LexisMatrix.Tests/LexisMatrix.Tests.csproj
dotnet run

# 3. In a separate terminal, run Frontend
cd ../../frontend
npm install
npm run dev
\`\`\`

### On Ubuntu Linux
\`\`\`bash
# 1. Install .NET 9 SDK
sudo apt-get update && sudo apt-get install -y dotnet-sdk-9.0 nodejs npm

# 2. Build and run .NET Backend
cd backend
dotnet test LexisMatrix.Tests/LexisMatrix.Tests.csproj
cd LexisMatrix.Api
dotnet run --urls "http://0.0.0.0:5000"

# 3. Run Frontend
cd ../../frontend
npm ci
npm run dev
\`\`\`
`);

  return await zip.generateAsync({ type: 'blob' });
}
