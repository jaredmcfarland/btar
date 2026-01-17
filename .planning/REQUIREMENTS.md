# Requirements: BTAR (Brownfield-to-Agent-Ready)

**Defined:** 2026-01-15
**Core Value:** Verification enables automation. The Verifier's Rule states that AI effectiveness is proportional to task verifiability. BTAR maximizes verifiability by building infrastructure that constrains AI agents into feedback-rich solution spaces.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Infrastructure

- [x] **INFRA-01**: User can run BTAR from command line with `btar` command
- [x] **INFRA-02**: User can analyze TypeScript, Python, Swift, Kotlin, Go, Java, Ruby, PHP codebases
- [x] **INFRA-03**: User can run BTAR in GitHub Actions CI pipeline
- [x] **INFRA-04**: User can configure thresholds and exclusions via `.btar.yaml`
- [x] **INFRA-05**: User receives JSON output for integration with other tools
- [x] **INFRA-06**: User receives non-zero exit code when quality gates fail
- [x] **INFRA-07**: User sees progress output during analysis

### Metrics

- [x] **METR-01**: User can measure type strictness errors (0 errors target)
- [x] **METR-02**: User can measure lint errors on main (0 errors target)
- [x] **METR-03**: User can measure test coverage percentage (>70% target)
- [x] **METR-04**: User receives composite Agent-Readiness Score (0-100)
- [x] **METR-05**: User sees per-dimension breakdown of scoring

### Context

- [x] **CTXT-01**: User can validate AGENTS.md has required sections
- [x] **CTXT-02**: User can generate AGENTS.md from codebase analysis
- [x] **CTXT-03**: User can generate .pre-commit-config.yaml for detected language
- [x] **CTXT-04**: User can generate Claude Code hooks for validation

### Remediation

- [ ] **RMED-01**: User receives tier-based recommendations (prioritized by score range)
- [ ] **RMED-02**: User can enable ratchet mode to prevent score regressions in CI
- [ ] **RMED-03**: User can auto-fix lint issues by delegating to language tools

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Metrics

- **METR-06**: User can measure CI feedback time
- **METR-07**: User can detect flaky tests from test history
- **METR-08**: User can measure mutation score (mutmut/Stryker integration)
- **METR-09**: User can detect presence of property-based tests

### Context

- **CTXT-05**: User can check completeness of context files (CLAUDE.md, .cursorrules)

### Remediation

- **RMED-04**: User can apply agent-safe refactoring recipes (OpenRewrite integration)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Hosted SaaS dashboard | Competitors do this better; CLI + JSON output is sufficient |
| Security vulnerability scanning | Snyk does this better; not agent-readiness related |
| Team velocity metrics | CodeClimate Velocity does this; different problem domain |
| IDE plugin | High development overhead; CLI + CI integration is sufficient |
| Custom rule authoring UI | YAML configuration file is sufficient |
| Support for 35+ languages | Start narrow with 8 languages, expand based on demand |
| Enterprise SSO/billing/teams | Enterprise sales complexity; v1 is single-user focused |
| AI code generation | Not our problem space; we verify, not generate |

## Traceability

Which phases cover which requirements. Updated by create-roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 3 | Complete |
| INFRA-04 | Phase 1 | Complete |
| INFRA-05 | Phase 3 | Complete |
| INFRA-06 | Phase 3 | Complete |
| INFRA-07 | Phase 1 | Complete |
| METR-01 | Phase 2 | Complete |
| METR-02 | Phase 2 | Complete |
| METR-03 | Phase 2 | Complete |
| METR-04 | Phase 3 | Complete |
| METR-05 | Phase 2 | Complete |
| CTXT-01 | Phase 4 | Complete |
| CTXT-02 | Phase 4 | Complete |
| CTXT-03 | Phase 4 | Complete |
| CTXT-04 | Phase 4 | Complete |
| RMED-01 | Phase 5 | Pending |
| RMED-02 | Phase 5 | Pending |
| RMED-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19 ✓
- Unmapped: 0

---
*Requirements defined: 2026-01-15*
*Last updated: 2026-01-17 after Phase 4 completion*
