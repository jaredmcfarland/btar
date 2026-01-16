# Requirements: BTAR (Brownfield-to-Agent-Ready)

**Defined:** 2026-01-15
**Core Value:** Verification enables automation. The Verifier's Rule states that AI effectiveness is proportional to task verifiability. BTAR maximizes verifiability by building infrastructure that constrains AI agents into feedback-rich solution spaces.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Infrastructure

- [ ] **INFRA-01**: User can run BTAR from command line with `btar` command
- [ ] **INFRA-02**: User can analyze TypeScript, Python, Swift, Kotlin, Go, Java, Ruby, PHP codebases
- [ ] **INFRA-03**: User can run BTAR in GitHub Actions CI pipeline
- [ ] **INFRA-04**: User can configure thresholds and exclusions via `.btar.yaml`
- [ ] **INFRA-05**: User receives JSON output for integration with other tools
- [ ] **INFRA-06**: User receives non-zero exit code when quality gates fail
- [ ] **INFRA-07**: User sees progress output during analysis

### Metrics

- [ ] **METR-01**: User can measure type strictness errors (0 errors target)
- [ ] **METR-02**: User can measure lint errors on main (0 errors target)
- [ ] **METR-03**: User can measure test coverage percentage (>70% target)
- [ ] **METR-04**: User receives composite Agent-Readiness Score (0-100)
- [ ] **METR-05**: User sees per-dimension breakdown of scoring

### Context

- [ ] **CTXT-01**: User can validate AGENTS.md has required sections
- [ ] **CTXT-02**: User can generate AGENTS.md from codebase analysis
- [ ] **CTXT-03**: User can generate .pre-commit-config.yaml for detected language
- [ ] **CTXT-04**: User can generate Claude Code hooks for validation

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
| INFRA-01 | Pending | Pending |
| INFRA-02 | Pending | Pending |
| INFRA-03 | Pending | Pending |
| INFRA-04 | Pending | Pending |
| INFRA-05 | Pending | Pending |
| INFRA-06 | Pending | Pending |
| INFRA-07 | Pending | Pending |
| METR-01 | Pending | Pending |
| METR-02 | Pending | Pending |
| METR-03 | Pending | Pending |
| METR-04 | Pending | Pending |
| METR-05 | Pending | Pending |
| CTXT-01 | Pending | Pending |
| CTXT-02 | Pending | Pending |
| CTXT-03 | Pending | Pending |
| CTXT-04 | Pending | Pending |
| RMED-01 | Pending | Pending |
| RMED-02 | Pending | Pending |
| RMED-03 | Pending | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 0 (pending create-roadmap)
- Unmapped: 19 ⚠️

---
*Requirements defined: 2026-01-15*
*Last updated: 2026-01-15 after initial definition*
