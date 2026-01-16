# Architecture Research: Multi-Language Code Analysis Systems

**Researched:** 2026-01-15
**Domain:** Static code analysis, multi-language tooling, Claude Code plugin architecture
**Confidence:** HIGH (primary patterns verified via official documentation)

---

## Executive Summary

Multi-language code analysis systems consistently follow a **pipeline architecture** with language-agnostic coordination layers and pluggable language-specific analyzers. The dominant patterns are: (1) Scanner → Analyzer → Reporter pipelines (SonarQube), (2) Docker-containerized engines with standardized I/O (CodeClimate), and (3) Language Server Protocol for real-time analysis (LSP).

For BTAR, the optimal architecture combines **language detection heuristics** (GitHub Linguist pattern) with **pluggable metric collectors** that delegate to existing language tooling, coordinated through Claude Code's plugin system. The system should **leverage existing tools** (type checkers, linters, test runners) rather than building custom analyzers.

**Primary recommendation:** Build a thin orchestration layer that discovers repository characteristics, invokes existing tools via subprocess, normalizes results into a unified scoring model, and generates remediation skills dynamically.

---

## Reference Architectures

### SonarQube Analysis Pipeline

SonarQube follows a **bootstrapper-analyzer-server** pattern:

```
┌─────────────┐    ┌─────────────────┐    ┌──────────────────┐
│ SonarScanner│───>│ Language        │───>│ SonarQube Server │
│ (Bootstrap) │    │ Analyzers       │    │ (Compute/Store)  │
└─────────────┘    └─────────────────┘    └──────────────────┘
      │                    │                      │
      │ Downloads          │ Analyzes per         │ Computes metrics
      │ required           │ quality profile      │ asynchronously
      │ analyzers          │ returns metrics      │ stores results
      │                    │ + issues             │
      ▼                    ▼                      ▼
    ┌─────────────────────────────────────────────────┐
    │ Scanner determines languages → fetches only     │
    │ needed analyzers → caches for efficiency        │
    └─────────────────────────────────────────────────┘
```

**Key insight:** SonarQube's scanner is language-agnostic; it detects languages, downloads only required analyzers, and orchestrates execution. Analyzers are versioned independently from the scanner.

Source: [SonarQube Analysis Overview](https://docs.sonarsource.com/sonarqube-server/2025.5/analyzing-source-code/analysis-overview)

### CodeClimate Engine Specification

CodeClimate uses **Docker containers with standardized I/O**:

```
┌───────────────────────────────────────────────────────────────┐
│                     CodeClimate CLI                           │
├───────────────────────────────────────────────────────────────┤
│ 1. Reads .codeclimate.yml                                     │
│ 2. Mounts /code (read-only) and /config.json per engine       │
│ 3. Runs Docker containers with resource limits                │
│ 4. Collects JSON issues from STDOUT (null-terminated)         │
│ 5. Aggregates into unified report                             │
└───────────────────────────────────────────────────────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
   ┌─────────┐        ┌─────────┐        ┌─────────┐
   │ Engine A│        │ Engine B│        │ Engine C│
   │ (Ruby)  │        │ (Python)│        │ (Go)    │
   └─────────┘        └─────────┘        └─────────┘
```

**Engine Contract:**
- Input: `/code` (source), `/config.json` (configuration)
- Output: JSON issues to STDOUT, null-terminated
- Constraints: 512MB image, 1GB RAM, 10 min timeout, no network
- Exit: 0 on success (even with issues), non-zero only for fatal errors

**Issue Format:**
```json
{
  "type": "issue",
  "check_name": "complexity",
  "description": "Function has cyclomatic complexity of 15",
  "categories": ["Complexity"],
  "location": {"path": "src/main.py", "lines": {"begin": 10, "end": 25}},
  "severity": "major",
  "remediation_points": 150000
}
```

Source: [CodeClimate Engine Specification](https://github.com/codeclimate/platform/blob/master/spec/analyzers/SPEC.md)

### Language Server Protocol (LSP)

LSP solves the **M x N problem** (M editors x N languages) with a standard protocol:

```
┌─────────────┐         JSON-RPC          ┌─────────────────┐
│   Editor    │◄─────────────────────────►│ Language Server │
│  (Client)   │                           │   (e.g., gopls) │
└─────────────┘                           └─────────────────┘
                     ▲
                     │ Capabilities negotiation
                     │ textDocument/didOpen
                     │ textDocument/hover
                     │ textDocument/completion
                     │ textDocument/diagnostic
                     ▼
```

**Key insight:** LSP provides semantic analysis (types, references, diagnostics) per-language. Each language server is a separate process, enabling polyglot analysis by running multiple servers concurrently.

Source: [Language Server Protocol Overview](https://microsoft.github.io/language-server-protocol/overviews/lsp/overview/)

### GitHub Linguist Language Detection

GitHub Linguist uses **cascading heuristics**:

1. **Emacs/Vim modelines** (explicit declaration)
2. **Known filenames** (e.g., `Makefile` → Make)
3. **Shebang detection** (e.g., `#!/bin/bash` → Shell)
4. **File extension** (may return multiple candidates)
5. **Content heuristics** (regex patterns to disambiguate)
6. **Bayesian classifier** (last resort, lowest accuracy)

**Key insight:** Extension-based detection is ambiguous (`.h` → C, C++, or Objective-C). Content heuristics refine candidates using regex patterns. This cascading approach balances speed and accuracy.

Source: [GitHub Linguist](https://github.com/github-linguist/linguist)

### Semgrep Pattern Matching

Semgrep uses **AST-based pattern matching** with language-agnostic rule syntax:

```
┌────────────────────────────────────────────────────────────┐
│                      Semgrep CLI                           │
├────────────────────────────────────────────────────────────┤
│ 1. Parse YAML rules → internal rule representation         │
│ 2. Detect languages in target code                         │
│ 3. Parse target code → AST per language                    │
│ 4. Apply pattern matching (ellipsis operator, metavars)    │
│ 5. For taint rules: dataflow analysis                      │
│ 6. Regexp prefiltering for performance                     │
└────────────────────────────────────────────────────────────┘
```

**Generic pattern matching:** Semgrep's "spacegrep" mode tokenizes on whitespace, enabling pattern matching on configuration files and unsupported languages.

Source: [Semgrep Core Architecture](https://deepwiki.com/semgrep/semgrep/2-core-architecture)

---

## Proposed BTAR Architecture

### Design Principles

1. **Leverage existing tools:** Use mypy, ruff, tsc, swiftlint, etc. - don't rebuild analyzers
2. **Thin orchestration:** BTAR coordinates; language tools do the work
3. **Normalized scoring:** Convert diverse tool outputs to unified 0-100 metrics
4. **Progressive disclosure:** Start with simple metrics, add depth via skills
5. **Claude Code native:** Use commands, agents, skills, hooks - not external infrastructure

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BTAR Plugin                                    │
│  .claude/                                                               │
│  ├── commands/btar/          ├── agents/btar/       ├── skills/btar/   │
│  │   ├── assess.md           │   ├── discoverer.md  │   (generated)    │
│  │   ├── remediate.md        │   ├── scorer.md      │   ├── python/    │
│  │   └── report.md           │   └── remediator.md  │   ├── typescript/│
│  │                           │                       │   └── swift/     │
│  └── hooks/btar/             └── .mcp.json (optional)                   │
│      └── hooks.json                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │  Discovery   │  │   Scoring    │  │ Remediation  │
         │   Engine     │  │   Engine     │  │   Engine     │
         └──────────────┘  └──────────────┘  └──────────────┘
                    │               │               │
                    ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Language Tool Adapters                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Python  │ │TypeScript│ │  Swift │ │ Kotlin │ │   Go    │           │
│  │ mypy    │ │  tsc    │ │swiftlint│ │ detekt │ │ go vet  │           │
│  │ ruff    │ │ eslint  │ │ xctest │ │ ktlint │ │ go test │           │
│  │ pytest  │ │ jest    │ │ muter  │ │ pitest │ │ gotests │           │
│  │ mutmut  │ │ stryker │ │        │ │ jacoco │ │         │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Core Components

| Component | Responsibility | Inputs | Outputs |
|-----------|---------------|--------|---------|
| **Discovery Engine** | Detect languages, frameworks, tooling, CI config | Repository root path | DiscoveryReport (languages, tools, files) |
| **Language Detector** | Identify primary/secondary languages | File paths, contents | LanguageMap {lang → confidence, files[]} |
| **Tool Detector** | Find existing lint/test/type tooling | package.json, pyproject.toml, etc. | ToolInventory {category → tool, config} |
| **Scoring Engine** | Compute 9 Foundation Tier metrics | DiscoveryReport, tool outputs | ScoreReport (metric → score, evidence) |
| **Metric Collectors** | Invoke tools, parse output, normalize | Tool config, file paths | RawMetric (value, confidence, source) |
| **Score Normalizer** | Convert raw metrics to 0-100 scale | RawMetric[] | NormalizedScore (0-100, grade) |
| **Skill Generator** | Create language-specific remediation skills | DiscoveryReport, gaps | SKILL.md files |
| **Remediation Planner** | Prioritize improvements, generate roadmap | ScoreReport, skills | RemediationPlan (phases, tasks) |

### Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              /btar:assess                                 │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: DISCOVERY                                                      │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐         │
│  │ Scan file tree │───>│ Detect langs   │───>│ Find tools     │         │
│  │ (glob patterns)│    │ (extension +   │    │ (config files) │         │
│  │                │    │  heuristics)   │    │                │         │
│  └────────────────┘    └────────────────┘    └────────────────┘         │
│                                    │                                     │
│                                    ▼                                     │
│                        ┌────────────────────┐                            │
│                        │  DiscoveryReport   │                            │
│                        │  - languages[]     │                            │
│                        │  - tools{}         │                            │
│                        │  - structure{}     │                            │
│                        └────────────────────┘                            │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: MEASUREMENT                                                    │
│                                                                          │
│  For each metric in Foundation Tier:                                     │
│    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐             │
│    │ Select tool  │───>│ Invoke tool  │───>│ Parse output │             │
│    │ (from disc.) │    │ (subprocess) │    │ (adapter)    │             │
│    └──────────────┘    └──────────────┘    └──────────────┘             │
│           │                                       │                      │
│           │ (fallback if no tool)                 ▼                      │
│           │                            ┌──────────────────┐              │
│           └───────────────────────────>│ Infer from files │              │
│                                        │ (heuristics)     │              │
│                                        └──────────────────┘              │
│                                                   │                      │
│                                                   ▼                      │
│                                        ┌──────────────────┐              │
│                                        │  RawMetrics[]    │              │
│                                        └──────────────────┘              │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: SCORING                                                        │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ Normalization Rules (from scoring rubric)                       │     │
│  │                                                                 │     │
│  │ CI Feedback Time:    <3min=10, 3-5min=8, 5-10min=5, ...        │     │
│  │ Mutation Score:      >85%=15, 75-85%=12, 60-75%=8, ...         │     │
│  │ Type Coverage:       100%=12, >95%=9, 80-95%=6, ...            │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                    │                                     │
│                                    ▼                                     │
│                        ┌────────────────────┐                            │
│                        │    ScoreReport     │                            │
│                        │  - total: 67/100   │                            │
│                        │  - category scores │                            │
│                        │  - evidence{}      │                            │
│                        │  - gaps[]          │                            │
│                        └────────────────────┘                            │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PHASE 4: SKILL GENERATION                                               │
│                                                                          │
│  For each gap in ScoreReport:                                            │
│    ┌──────────────────────────────────────────────────────────────┐     │
│    │ Gap: "Type coverage below target (currently 72%)"             │     │
│    │ Language: Python                                              │     │
│    │ Tool: mypy                                                    │     │
│    │                                                               │     │
│    │ Generate SKILL.md with:                                       │     │
│    │ - How to run mypy --strict                                    │     │
│    │ - Common error patterns and fixes                             │     │
│    │ - Project-specific type stubs needed                          │     │
│    │ - Incremental adoption strategy                               │     │
│    └──────────────────────────────────────────────────────────────┘     │
│                                    │                                     │
│                                    ▼                                     │
│                        ┌────────────────────┐                            │
│                        │ skills/btar/python/│                            │
│                        │   typing.md        │                            │
│                        │   testing.md       │                            │
│                        │   linting.md       │                            │
│                        └────────────────────┘                            │
└──────────────────────────────────────────────────────────────────────────┘
```

### Plugin Integration

**Commands (`commands/btar/`):**

| Command | Purpose | Workflow |
|---------|---------|----------|
| `/btar:assess` | Full assessment | Discovery → Measurement → Scoring → Report |
| `/btar:assess-quick` | Fast subset | File counts, config presence, skip slow metrics |
| `/btar:remediate [metric]` | Fix specific gap | Load skill → Execute remediation steps |
| `/btar:report` | Generate report | Format ScoreReport as markdown |

**Agents (`agents/btar/`):**

| Agent | Purpose | When Invoked |
|-------|---------|--------------|
| `discoverer` | Analyze repository structure | `/btar:assess` phase 1 |
| `scorer` | Compute and normalize metrics | `/btar:assess` phase 2-3 |
| `remediator` | Execute remediation actions | `/btar:remediate` |

**Skills (`skills/btar/` - generated):**

Skills are generated dynamically based on discovery. Example structure:

```
skills/btar/
├── python/
│   ├── typing/
│   │   └── SKILL.md    # mypy --strict adoption
│   ├── testing/
│   │   └── SKILL.md    # pytest + hypothesis + mutmut
│   └── linting/
│       └── SKILL.md    # ruff configuration
├── typescript/
│   ├── typing/
│   │   └── SKILL.md    # tsc --strict adoption
│   └── testing/
│       └── SKILL.md    # jest/vitest + stryker
└── shared/
    ├── ci-optimization/
    │   └── SKILL.md    # Reduce CI feedback time
    └── agent-context/
        └── SKILL.md    # AGENTS.md creation
```

**Hooks (`hooks/btar/`):**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "btar-validate-no-regression $FILE"
          }
        ]
      }
    ]
  }
}
```

### Language Tool Adapters

Each language requires adapters that:
1. Detect if tooling is present (config file exists)
2. Invoke tool with appropriate flags
3. Parse output into normalized format
4. Handle tool absence gracefully

**Python Adapter Example:**

```
┌────────────────────────────────────────────────────────────────┐
│ Python Metric Collectors                                       │
├────────────────────────────────────────────────────────────────┤
│ Type Coverage:                                                 │
│   detect: pyproject.toml[tool.mypy] or mypy.ini               │
│   invoke: mypy --strict src/ 2>&1                             │
│   parse: count "error:" lines, compute % files passing        │
│   fallback: 0% if no mypy config                              │
├────────────────────────────────────────────────────────────────┤
│ Lint Errors:                                                   │
│   detect: pyproject.toml[tool.ruff] or ruff.toml              │
│   invoke: ruff check src/ --output-format=json                │
│   parse: count issues, categorize by severity                 │
│   fallback: try flake8, pylint, or report "no linter"         │
├────────────────────────────────────────────────────────────────┤
│ Test Coverage:                                                 │
│   detect: pyproject.toml[tool.pytest] or pytest.ini           │
│   invoke: pytest --cov=src/ --cov-report=json                 │
│   parse: extract coverage percentage from json                │
│   fallback: 0% if no pytest config                            │
├────────────────────────────────────────────────────────────────┤
│ Mutation Score:                                                │
│   detect: mutmut in requirements.txt or pyproject.toml        │
│   invoke: mutmut run --paths-to-mutate=src/ (slow!)           │
│   parse: extract kill rate from results                       │
│   fallback: "not measured" - suggest adding mutmut            │
└────────────────────────────────────────────────────────────────┘
```

### Build Order

| Phase | Components | Rationale |
|-------|------------|-----------|
| **1. Discovery** | Language Detector, Tool Detector | Foundation - everything depends on knowing what's in the repo |
| **2. Core Metrics** | Line Coverage, Lint Errors, Type Coverage | High-value, fast, existing tools available |
| **3. CI Metrics** | CI Feedback Time, CI Green Rate, Flaky Tests | Requires CI access (GitHub Actions API or similar) |
| **4. Advanced Metrics** | Mutation Score, Property Tests, Test Quality | Expensive to compute, may require new tooling |
| **5. Skill Generation** | Skill Generator, Remediation Planner | Depends on all metrics being computed |
| **6. Commands** | /btar:assess, /btar:remediate | User-facing orchestration |
| **7. Hooks** | PostToolUse validation | Optional - adds safety rails |

### Cross-Language Consistency

**Challenge:** Different tools report metrics differently (percentage vs count, errors vs warnings).

**Solution:** Normalize to common scale per metric:

```
┌───────────────────────────────────────────────────────────────────────┐
│ Metric: Type Coverage                                                 │
├───────────────────────────────────────────────────────────────────────┤
│ Python (mypy):                                                        │
│   Raw: "Found 23 errors in 5 files"                                   │
│   Normalized: (total_files - files_with_errors) / total_files * 100   │
│   Result: 95% coverage                                                │
├───────────────────────────────────────────────────────────────────────┤
│ TypeScript (tsc):                                                     │
│   Raw: "error TS2322: Type..." (15 errors)                           │
│   Normalized: (total_files - files_with_errors) / total_files * 100   │
│   Result: 92% coverage                                                │
├───────────────────────────────────────────────────────────────────────┤
│ Swift (compiler):                                                     │
│   Raw: Type errors are compile errors (binary pass/fail)              │
│   Normalized: compiles cleanly = 100%, else = 0%                      │
│   Result: 100% coverage (or 0%)                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### Handling Missing Tooling

When a language's standard tooling is absent:

1. **Detection:** Check for config files, installed packages, lock files
2. **Fallback heuristics:**
   - No type checker: Score 0, recommend adding
   - No linter: Score 0, recommend adding
   - No test runner: Score 0, recommend adding
3. **Skill generation:** Create "bootstrap [tool]" skill with setup instructions
4. **Report:** Clearly indicate "metric not measured - tooling not detected"

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Pipeline architecture pattern | HIGH | Verified via SonarQube and CodeClimate official docs |
| Claude Code plugin structure | HIGH | Verified via official plugin documentation |
| Language detection heuristics | HIGH | GitHub Linguist is well-documented standard |
| Scoring normalization | MEDIUM | Based on scoring rubric (project-specific) |
| Skill generation approach | MEDIUM | Novel design, follows plugin patterns |
| Multi-language tool adapters | MEDIUM | Language-specific details need per-language research |

---

## Open Questions

1. **CI Integration:** How to access GitHub Actions API for CI metrics without requiring user auth setup?
2. **Mutation Testing Performance:** Mutation testing is slow (minutes to hours). How to handle in assessment workflow?
3. **Skill Versioning:** When project tooling changes, how to regenerate/update skills?
4. **Cross-repo Learning:** Can skills learned from one repo be shared to similar repos?

---

## Sources

### Primary (HIGH confidence)
- [SonarQube Analysis Overview](https://docs.sonarsource.com/sonarqube-server/2025.5/analyzing-source-code/analysis-overview)
- [CodeClimate Engine Specification](https://github.com/codeclimate/platform/blob/master/spec/analyzers/SPEC.md)
- [Claude Code Plugin Documentation](https://code.claude.com/docs/en/plugins)
- [Language Server Protocol Overview](https://microsoft.github.io/language-server-protocol/overviews/lsp/overview/)
- [GitHub Linguist](https://github.com/github-linguist/linguist)

### Secondary (MEDIUM confidence)
- [Semgrep Core Architecture](https://deepwiki.com/semgrep/semgrep/2-core-architecture)
- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)
- [Moderne Automated Code Remediation](https://www.moderne.ai/blog/generative-ai-for-automating-code-remediation-at-scale)
- [Qodo Code Quality Metrics](https://www.qodo.ai/blog/code-quality-metrics-2026/)

### Project Context
- Agent Readiness Scoring Rubric (`agent-readiness-scoring-rubric.md`)
- Agent Readiness Research (`agent-readiness-claude.md`)
