# LexisMatrix — Enterprise Legal Integration Hub & Dual-Stack Showcase

> **Am Law 50 Production Reference Architecture** built for the **AI & Data Platform Enablement Team** (Greenberg Traurig model).
> Connects Microsoft 365, Copilot Studio, iManage Work 10 DMS, Microsoft Graph, and Microsoft Purview DLP.

---

## 1. Project Synopsis & Executive Architecture

Top global law firms require integration architectures that are **economically viable, fault-tolerant, horizontally scalable, and strictly governed by professional conduct rules** (such as ABA Model Rule 1.10 for Ethical Walls and Information Barriers).

**LexisMatrix** provides two complete, standalone, production-ready full-stack implementations sharing a unified **TypeScript 7.0.2 + React 19.3** modern frontend:
1. **Tech Stack 1 (Python 3.13 + FastAPI + Pydantic v2)**: High-speed async API, Pydantic v2 strict data modeling, and standard JSON-RPC 2.0 Model Context Protocol (MCP) server.
2. **Tech Stack 2 (C# .NET 9 Minimal API + Records / System.Text.Json)**: High-throughput Kestrel server, immutable C# Records, Native DI container, and built-in OpenAPI.

Both full-stack solutions can be explored interactively live in this application and downloaded as 1-click standalone `.zip` repositories.

---

## 2. Directory Structure

```
lexismatrix-enterprise/
├── .github/
│   ├── copilot-instructions.md          # Custom GitHub Copilot legal engineering rules
│   └── workflows/
│       ├── ci.yml                       # Multi-platform CI (tests, coverage, ruff/dotnet)
│       ├── open-pr.yml                  # Protected PR gate for human-authored changes
│       ├── changelog-release.yml        # 2-phase semver changelog & tag release workflow
│       ├── setup-branch-protection.yml  # Default branch protection automation
│       └── ai-improve.yml               # Self-healing AI optimization pipeline
├── .codex/
│   ├── instructions.md                  # OpenAI Codex instructions
│   └── AGENTS.md                        # Multi-agent role definition & conventions
├── CLAUDE.md                            # Claude Code guidelines & memory
├── lefthook.yml                         # Pre-commit hooks (ruff, mypy, pytest, dotnet-format, tsc)
├── scripts/
│   ├── M365-EthicalWall-Audit.ps1       # PowerShell 7 M365 Information Barrier auditor
│   ├── Register-CopilotConnector.ps1   # PowerShell Power Platform Dataverse connector setup
│   └── ai_improve.py                    # Benchmark baseline & self-healing test loop
├── backend/                             # [Tech Stack 1: FastAPI] or [Tech Stack 2: .NET 9]
│   ├── app/ or LexisMatrix.Api/
│   └── tests/ or LexisMatrix.Tests/
└── frontend/                            # React 19.3 + TypeScript 7.0.2 + Tailwind CSS
    ├── src/
    │   ├── components/                  # Domain-specific UI tabs & wireframes
    │   ├── services/                    # Dual-stack simulators & zip generators
    │   └── types/                       # Legal matter & compliance types
    ├── package.json
    └── tsconfig.json
```

---

## 3. How .NET Maps to FastAPI Features

| FastAPI Feature | .NET Minimal API Equivalent | Enterprise Legal Tech Advantage |
|---|---|---|
| **Pydantic Models** | **C# Records / System.Text.Json** | Native immutable records provide zero-copy serialization and compile-time safety. |
| **Built-in Swagger / OpenAPI** | **Microsoft.AspNetCore.OpenApi** | Generates OpenAPI 3.1 specs ingested directly by Copilot Studio declarative plugins. |
| **Uvicorn / Hypercorn** | **Kestrel Web Server** | High-concurrency socket pooling handling thousands of simultaneous Graph webhooks. |
| **Dependency Injection (`Depends`)** | **Native DI Container (`builder.Services`)** | Scoped, Transient, and Singleton lifecycles without third-party frameworks. |
| **Async / Await** | **`async / await (Task<T>)`** | Native thread pool async I/O optimized for iManage REST APIs and Microsoft Graph calls. |

---

## 4. ASCII UI Wireframe Mock Diagrams

```
+---------------------------------------------------------------------------------------------------+
|  LEXISMATRIX // ENTERPRISE LEGAL INTEGRATION HUB                        [Stack: FastAPI / .NET 9] |
+---------------------------------------------------------------------------------------------------+
| [Overview] [Matters & Walls] [iManage MCP Studio] [Purview DLP] [Copilot Studio] [DevOps & CI/CD] |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
| +-- ABA MODEL RULE 1.10 ETHICAL SCREEN EVALUATOR -----------------------------------------------+ |
| | Target Matter: [GT-2026-8841 Apex Semi M&A v]   Personnel: [Robert Sterling ] [Verify Screen] | |
| | >> [403 FORBIDDEN]: Screen rule active. Restricted from iManage DMS & Teams Deal Channel.     | |
| +-----------------------------------------------------------------------------------------------+ |
|                                                                                                   |
| +-- ACTIVE LEGAL MATTERS ------------------------+ +-- PURVIEW DLP & SENSITIVITY SCANNER --------+ |
| | GT-2026-8841 Apex Semi $4.8B Acquisition       | | Input: Preliminary merger terms, SSN, Priv. | |
| | Purview Sensitivity: Highly Confidential (MNPI)| | Policy Risk Rating: CRITICAL               | |
| | Ethical Wall: R. Sterling, K. Miller [BLOCKED] | | Copilot Studio Grounding: BLOCKED (MNPI)   | |
| +------------------------------------------------+ +--------------------------------------------+ |
|                                                                                                   |
| +-- MODEL CONTEXT PROTOCOL (MCP) STUDIO ---------+ +-- ENTERPRISE DEVOPS & CI/CD GATES ---------+ |
| | Tool: imanage_search_matter_docs               | | [x] Main Branch Protection (Human Review)  | |
| | Protocol: JSON-RPC 2.0 (stdio / HTTP)          | | [x] Parallel Lefthook Pre-Commit Gate      | |
| | Result: 2 documents returned (filtered)        | | [x] 2-Phase Semver Release & Tagging       | |
| +------------------------------------------------+ +--------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

---

## 5. Compilation, Build & Run Instructions

### Windows 11 (PowerShell / DOS Prompt)
```powershell
# 1. Install prerequisites (winget)
winget install --id astral-sh.uv -e
winget install --id Microsoft.DotNet.SDK.9 -e
winget install --id OpenJS.NodeJS.LTS -e

# 2. Tech Stack 1 (Python 3.13 FastAPI)
cd backend
uv sync --group dev
uv run pytest
uv run uvicorn app.main:app --port 8000

# 3. Tech Stack 2 (.NET 9 Minimal API)
cd backend/LexisMatrix.Api
dotnet test ../LexisMatrix.Tests
dotnet run

# 4. Frontend (TypeScript 7.0 + React 19)
cd ../../frontend
npm install
npm run dev
```

### Ubuntu Linux (bash)
```bash
# 1. Install prerequisites
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
sudo apt-get update && sudo apt-get install -y dotnet-sdk-9.0 nodejs npm

# 2. Tech Stack 1 (Python 3.13 FastAPI)
cd backend
uv sync --group dev
uv run pytest -v
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000

# 3. Tech Stack 2 (.NET 9 Minimal API)
cd backend
dotnet test LexisMatrix.Tests
dotnet run --project LexisMatrix.Api --urls "http://0.0.0.0:5000"

# 4. Frontend (TypeScript 7.0 + React 19)
cd ../frontend
npm ci
npm run dev
```

---

## 6. How to Extend the Application

1. **Add New Practice Group Connectors**:
   - Register new endpoints under `backend/app/` (Python) or `backend/LexisMatrix.Api/Endpoints/` (C#).
   - Add corresponding Pydantic schema in `models.py` or C# Record in `MatterModels.cs`.
2. **Extend Model Context Protocol (MCP) Tools**:
   - Add new tool signatures in `scripts/mcp_imanage_server.py` or `McpEndpoints.cs`.
   - Update Copilot Studio declarative plugin schema in `ai-plugin.json`.
3. **Enhance DLP Policies**:
   - Add custom regex or LLM classifiers in `src/services/dlpScanner.ts` to flag international export control regulations (ITAR, EAR) or specific European cross-border GDPR transfer clauses.
