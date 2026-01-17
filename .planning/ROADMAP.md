# Roadmap: BTAR (Brownfield-to-Agent-Ready)

## Overview

Transform existing codebases into agent-ready environments through systematic analysis and remediation. BTAR provides CLI-based measurement of the Foundation Tier metrics (type strictness, lint errors, test coverage), generates agent context files (AGENTS.md), and produces actionable remediation plans. The journey moves from understanding what's in the codebase (Phase 1-2), to scoring and CI integration (Phase 3), to generating context and hooks (Phase 4), to automated fixing (Phase 5).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - CLI scaffolding, language detection, config system
- [x] **Phase 2: Core Metrics** - Type strictness, lint errors, coverage measurement
- [x] **Phase 3: Scoring Engine** - Composite scoring, CI integration, quality gates
- [x] **Phase 4: Context Generation** - AGENTS.md validation/generation, hooks
- [ ] **Phase 5: Remediation** - Recommendations, ratchet mode, auto-fix

## Phase Details

### Phase 1: Foundation
**Goal**: CLI scaffolding, language detection, basic config
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-04, INFRA-07
**Success Criteria** (what must be TRUE):
  1. User can run `btar` from command line and see usage help
  2. User can run `btar analyze .` and see detected languages
  3. User can create `.btar.yaml` with custom thresholds
  4. User sees progress output during analysis
**Research**: Unlikely (established CLI patterns, research SUMMARY.md provides tool mapping)
**Plans**: 4

Plans:
- [x] 01-01: Project scaffolding
- [x] 01-02: Config loader (TDD)
- [x] 01-03: Language detector (TDD)
- [x] 01-04: CLI integration

### Phase 2: Core Metrics
**Goal**: Type strictness, lint errors, coverage measurement
**Depends on**: Phase 1
**Requirements**: METR-01, METR-02, METR-03, METR-05
**Success Criteria** (what must be TRUE):
  1. User can measure type strictness errors (shows count)
  2. User can measure lint errors (shows count)
  3. User can measure test coverage percentage
  4. User sees per-dimension breakdown in output
**Research**: Unlikely (tool invocation via subprocess, STACK.md provides mapping)
**Plans**: 5

Plans:
- [x] 02-01: Metric types and tool runner
- [x] 02-02: Type strictness measurement (TDD)
- [x] 02-03: Lint errors measurement (TDD)
- [x] 02-04: Coverage measurement (TDD)
- [x] 02-05: Metrics integration

### Phase 3: Scoring Engine
**Goal**: Composite scoring, CI integration, quality gates
**Depends on**: Phase 2
**Requirements**: METR-04, INFRA-03, INFRA-05, INFRA-06
**Success Criteria** (what must be TRUE):
  1. User receives composite Agent-Readiness Score (0-100)
  2. User can run BTAR in GitHub Actions
  3. User receives JSON output for integration
  4. BTAR returns non-zero exit code when gates fail
**Research**: Likely (GitHub Actions API, scoring normalization)
**Research topics**: GitHub Actions API for workflow history/timing, scoring normalization from diverse tool outputs to 0-100
**Plans**: 4

Plans:
- [x] 03-01: Scoring algorithm (TDD)
- [x] 03-02: JSON output format
- [x] 03-03: Quality gates (--fail-under)
- [x] 03-04: GitHub Actions integration (init-ci)

### Phase 4: Context Generation
**Goal**: AGENTS.md validation/generation, hook generation
**Depends on**: Phase 3
**Requirements**: CTXT-01, CTXT-02, CTXT-03, CTXT-04
**Success Criteria** (what must be TRUE):
  1. User can validate AGENTS.md has required sections
  2. User can generate AGENTS.md from analysis
  3. User can generate .pre-commit-config.yaml
  4. User can generate Claude Code hooks
**Research**: Unlikely (template generation, standard file patterns)
**Plans**: 4

Plans:
- [x] 04-01: AGENTS.md validation and generation (TDD)
- [x] 04-02: Pre-commit config generator
- [x] 04-03: Claude Code hooks generator
- [x] 04-04: CLI context command integration

### Phase 5: Remediation
**Goal**: Recommendations, ratchet mode, auto-fix delegation
**Depends on**: Phase 4
**Requirements**: RMED-01, RMED-02, RMED-03
**Success Criteria** (what must be TRUE):
  1. User receives tier-based recommendations prioritized by score
  2. User can enable ratchet mode to prevent regressions
  3. User can auto-fix lint issues via delegation to language tools
**Research**: Unlikely (delegating to existing tools like ruff --fix, eslint --fix)
**Plans**: 4

Plans:
- [ ] 05-01: Tier-based recommendations engine (TDD)
- [ ] 05-02: Ratchet mode score persistence (TDD)
- [ ] 05-03: Fix command with language tool delegation
- [ ] 05-04: CLI integration (recommendations + ratchet)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete | 2026-01-16 |
| 2. Core Metrics | 5/5 | Complete | 2026-01-17 |
| 3. Scoring Engine | 4/4 | Complete | 2026-01-17 |
| 4. Context Generation | 4/4 | Complete | 2026-01-17 |
| 5. Remediation | 0/4 | Planned | - |

---
*Roadmap created: 2026-01-15*
*Requirements coverage: 19/19 (100%)*
