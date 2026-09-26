import React, { useState } from 'react';
import {
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Play,
  FileCode,
  Lock,
  GitPullRequest,
  Tag,
  AlertCircle
} from 'lucide-react';

interface DevOpsPipelinesTabProps {
  activeStack: 'python' | 'dotnet';
}

export const DevOpsPipelinesTab: React.FC<DevOpsPipelinesTabProps> = ({ activeStack }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<
    'branch-protection' | 'lefthook' | 'ci' | 'open-pr' | 'changelog-release' | 'ai-improve'
  >('branch-protection');

  const [isRunningHooks, setIsRunningHooks] = useState(false);
  const [hookOutput, setHookOutput] = useState<Array<{ name: string; status: 'pass' | 'running'; message: string }>>([]);

  const handleSimulateLefthook = () => {
    setIsRunningHooks(true);
    setHookOutput([]);

    const steps = activeStack === 'python'
      ? [
          { name: 'frontend-lint (eslint / biome)', delay: 200, message: 'All 48 files pass strict TS 7.0 lint rules.' },
          { name: 'frontend-typecheck (tsc --noEmit)', delay: 400, message: 'TypeScript 7.0.2 compiler passed with zero errors.' },
          { name: 'backend-ruff-lint (ruff check .)', delay: 600, message: 'Ruff passed. 0 syntax or import errors.' },
          { name: 'backend-ruff-format (ruff format --check .)', delay: 800, message: 'All Python files formatted to 100 char limit.' },
          { name: 'backend-mypy (mypy app)', delay: 1000, message: 'Mypy static analysis clean. Strict type safety verified.' },
          { name: 'backend-pytest (pytest tests/)', delay: 1200, message: '100% core test suite passed. Coverage 96.4%.' }
        ]
      : [
          { name: 'frontend-lint (eslint)', delay: 200, message: 'TypeScript 7.0 linting passed clean.' },
          { name: 'frontend-typecheck (tsc)', delay: 400, message: 'Zero type errors in React 19 components.' },
          { name: 'csharp-format (dotnet format --verify-no-changes)', delay: 700, message: 'C# 13 records adhere to enterprise style.' },
          { name: 'csharp-xunit (dotnet test)', delay: 1100, message: 'All xUnit tests passed in LexisMatrix.Tests.dll.' }
        ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setHookOutput(prev => [...prev, { name: step.name, status: 'pass', message: step.message }]);
        if (idx === steps.length - 1) {
          setIsRunningHooks(false);
        }
      }, step.delay);
    });
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
          <span>Enterprise DevOps, Main Branch Protection & CI/CD Pipelines</span>
        </h2>
        <p className="text-xs text-slate-400">
          Strict production gating mechanisms guaranteeing fail-safe, fault-tolerant, and zero-defect deployments for legal technology.
        </p>
      </div>

      {/* Interactive Lefthook Pre-Commit Simulation */}
      <div className="border border-emerald-500/30 bg-slate-900/60 rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Lefthook Fast Parallel Pre-Commit Hook Runner</span>
          </div>
          <button
            onClick={handleSimulateLefthook}
            disabled={isRunningHooks}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isRunningHooks ? 'Running Hooks...' : 'Simulate `git commit` Pre-Commit Hook'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Enforces local compliance before any code reaches remote branches: linting, type-checking, formatting, and unit testing across both frontend (TS 7.0) and backend ({activeStack === 'python' ? 'Python 3.13 Ruff & Mypy' : 'C# .NET Format & xUnit'}).
        </p>

        {hookOutput.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono space-y-2">
            <span className="text-slate-500 text-[11px] block">// Lefthook execution log:</span>
            {hookOutput.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-emerald-300 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200">[{item.name}]:</strong> {item.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DevOps Workflow Selector */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
          <button
            onClick={() => setSelectedWorkflow('branch-protection')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedWorkflow === 'branch-protection' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Main Branch Protection
          </button>
          <button
            onClick={() => setSelectedWorkflow('lefthook')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedWorkflow === 'lefthook' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Lefthook Pre-Commit Config
          </button>
          <button
            onClick={() => setSelectedWorkflow('ci')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedWorkflow === 'ci' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Automated CI Pipeline (ci.yml)
          </button>
          <button
            onClick={() => setSelectedWorkflow('open-pr')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedWorkflow === 'open-pr' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            4. Open PR Gate (open-pr.yml)
          </button>
          <button
            onClick={() => setSelectedWorkflow('changelog-release')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedWorkflow === 'changelog-release' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            5. Two-Phase Release (changelog-release.yml)
          </button>
          <button
            onClick={() => setSelectedWorkflow('ai-improve')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              selectedWorkflow === 'ai-improve' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            6. Self-Healing AI Pipeline (ai-improve.yml)
          </button>
        </div>

        {/* Workflow Details Panel */}
        <div className="border border-slate-800 bg-slate-950 rounded-xl p-5 font-mono text-xs text-slate-300 space-y-4">
          {selectedWorkflow === 'branch-protection' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Lock className="w-4 h-4" />
                <span>setup-branch-protection.yml & GitHub Protection Rules</span>
              </div>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Branch protection is an admin-level policy that blocks any direct push to <code className="text-slate-200">main</code>. It requires at least 1 human approval and ensures status checks pass before merging.
              </p>
              <pre className="bg-slate-900/80 p-3 rounded border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
{`# Excerpt from .github/workflows/setup-branch-protection.yml
name: setup-branch-protection
on: workflow_dispatch: {}

jobs:
  protect-main:
    runs-on: ubuntu-latest
    steps:
      - name: Require pull request review + passing CI before merge
        env:
          GH_TOKEN: \${{ secrets.ADMIN_PAT }}
        run: |
          branch="\${{ github.ref_name }}"
          gh api --method PUT "repos/\${{ github.repository }}/branches/$branch/protection" \\
            -F 'required_status_checks[strict]=true' \\
            -f 'required_status_checks[contexts][]=test' \\
            -F 'enforce_admins=true' \\
            -F 'required_pull_request_reviews[required_approving_review_count]=1' \\
            -F 'allow_force_pushes=false' \\
            -F 'allow_deletions=false'`}
              </pre>
            </div>
          )}

          {selectedWorkflow === 'lefthook' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Terminal className="w-4 h-4" />
                <span>lefthook.yml Configuration</span>
              </div>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Runs pre-commit checks in parallel across frontend and backend workspaces.
              </p>
              <pre className="bg-slate-900/80 p-3 rounded border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
{`pre-commit:
  parallel: true
  commands:
    frontend-lint:
      root: "frontend/"
      glob: "*.{ts,tsx}"
      run: npm run lint
    frontend-typecheck:
      root: "frontend/"
      glob: "*.{ts,tsx}"
      run: npx tsc --noEmit
    backend-lint:
      root: "backend/"
      glob: "*.py"
      run: uv run ruff check .
    backend-tests:
      root: "backend/"
      glob: "*.py"
      run: uv run pytest`}
              </pre>
            </div>
          )}

          {selectedWorkflow === 'ci' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <GitBranch className="w-4 h-4" />
                <span>ci.yml Automated CI/CD Pipeline</span>
              </div>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Triggers on all pushes and PRs, testing frontend and backend in parallel on Ubuntu runners.
              </p>
              <pre className="bg-slate-900/80 p-3 rounded border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
{`name: CI - Fullstack Verification
on:
  push:
    branches: ["main", "feature/**"]
  pull_request:
    branches: ["main"]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v3
        with: { python-version: "3.13" }
      - run: uv sync --group dev
      - run: uv run ruff check .
      - run: uv run mypy app
      - run: uv run pytest --cov=app --cov-fail-under=85`}
              </pre>
            </div>
          )}

          {selectedWorkflow === 'open-pr' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <GitPullRequest className="w-4 h-4" />
                <span>open-pr.yml Workflow</span>
              </div>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Verifies the branch is clean with 100% tests before opening a PR. Approval and merge remain manual.
              </p>
              <pre className="bg-slate-900/80 p-3 rounded border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
{`name: open-pr
on:
  workflow_dispatch:
    inputs:
      branch: { description: "Feature branch name", required: true }

jobs:
  open-pr:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: uv run pytest
      - run: gh pr create --base main --head "\${{ inputs.branch }}"`}
              </pre>
            </div>
          )}

          {selectedWorkflow === 'changelog-release' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Tag className="w-4 h-4" />
                <span>changelog-release.yml (Two-Phase Release Flow)</span>
              </div>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Because main branch protection blocks direct pushes to main, this workflow operates in two phases:
                1) Writes CHANGELOG.md on a release branch and opens a PR for human approval.
                2) After merging, tags the commit and publishes the GitHub release.
              </p>
              <pre className="bg-slate-900/80 p-3 rounded border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
{`# Phase 1: Create changelog branch & open PR
git checkout -b chore/changelog-v1.2.0
git add CHANGELOG.md
git commit -m "chore(release): v1.2.0"
git push origin chore/changelog-v1.2.0

# Phase 2: After PR is reviewed & merged:
git tag v1.2.0
git push origin v1.2.0
gh release create v1.2.0 --notes-file release_notes.md`}
              </pre>
            </div>
          )}

          {selectedWorkflow === 'ai-improve' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <Terminal className="w-4 h-4" />
                <span>ai-improve.yml (Self-Healing Loop)</span>
              </div>
              <p className="text-slate-400 font-sans text-xs leading-relaxed">
                Checks out a branch, runs baseline benchmarks, prompts the AI model, validates lint and tests, and only opens a PR if 100% tests pass and benchmark regression is zero.
              </p>
              <pre className="bg-slate-900/80 p-3 rounded border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
{`gh workflow run ai-improve.yml -f instruction="optimize ethical wall index lookup"
# Retries up to 4 times internally if lint or tests fail
# Restores original files and aborts cleanly if unresolvable`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
