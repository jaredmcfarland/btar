# Brownfield-to-Agent-Ready (BTAR)

## What This Is

A CLI tool that systematically measures and improves codebase agent-readiness through scoring, context generation, and remediation automation. BTAR encodes the Foundation Tier metrics (type strictness, lint errors, test coverage), generates agent context files (AGENTS.md), and produces actionable remediation plans with auto-fix delegation.

## Core Value

**Verification enables automation.** The Verifier's Rule states that AI effectiveness is proportional to task verifiability. BTAR maximizes verifiability by building the infrastructure that constrains AI agents into feedback-rich solution spaces.

## Requirements

### Validated

- ✓ **INFRA-01**: User can run BTAR from command line — v1.0
- ✓ **INFRA-02**: User can analyze 9 languages (TS, Python, Go, Java, Kotlin, Swift, Ruby, PHP, JS) — v1.0
- ✓ **INFRA-03**: User can run BTAR in GitHub Actions CI pipeline — v1.0
- ✓ **INFRA-04**: User can configure thresholds and exclusions via `.btar.yaml` — v1.0
- ✓ **INFRA-05**: User receives JSON output for integration — v1.0
- ✓ **INFRA-06**: User receives non-zero exit code when quality gates fail — v1.0
- ✓ **INFRA-07**: User sees progress output during analysis — v1.0
- ✓ **METR-01**: User can measure type strictness errors — v1.0
- ✓ **METR-02**: User can measure lint errors on main — v1.0
- ✓ **METR-03**: User can measure test coverage percentage — v1.0
- ✓ **METR-04**: User receives composite Agent-Readiness Score (0-100) — v1.0
- ✓ **METR-05**: User sees per-dimension breakdown of scoring — v1.0
- ✓ **CTXT-01**: User can validate AGENTS.md has required sections — v1.0
- ✓ **CTXT-02**: User can generate AGENTS.md from codebase analysis — v1.0
- ✓ **CTXT-03**: User can generate .pre-commit-config.yaml — v1.0
- ✓ **CTXT-04**: User can generate Claude Code hooks — v1.0
- ✓ **RMED-01**: User receives tier-based recommendations — v1.0
- ✓ **RMED-02**: User can enable ratchet mode for CI regression prevention — v1.0
- ✓ **RMED-03**: User can auto-fix lint issues via delegation — v1.0

### Active

(Next milestone requirements — none yet)

### Out of Scope

- Hosted SaaS dashboard — Competitors do this better; CLI + JSON output is sufficient
- Security vulnerability scanning — Snyk does this better; not agent-readiness related
- Team velocity metrics — CodeClimate Velocity does this; different problem domain
- IDE plugin — High development overhead; CLI + CI integration is sufficient
- Custom rule authoring UI — YAML configuration file is sufficient
- Support for 35+ languages — Start narrow with 9 languages, expand based on demand
- Enterprise SSO/billing/teams — Enterprise sales complexity; v1 is single-user focused
- AI code generation — Not our problem space; we verify, not generate
- Mutation testing in v1 — Foundation Tier is the floor, mutation testing is next tier

## Context

**Current State:**
- v1.0 shipped 2026-01-17
- ~9,300 lines TypeScript, 99 files
- 281 tests passing
- Tech stack: Node.js, Commander.js, Vitest, YAML

**Known Issues:**
- Human verification items deferred (multi-language project testing, ratchet regression testing)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Generalizable over Mixpanel-specific | Broader utility, forces cleaner abstraction | ✓ Good — 9 languages supported |
| Foundation Tier as v1 scope | Establishes floor before investing in advanced metrics | ✓ Good — shipped complete |
| Per-dimension scoring with rollup | Captures progress, identifies specific gaps | ✓ Good — provides actionable breakdown |
| Logarithmic decay scoring | Penalizes first few errors heavily, diminishing returns after | ✓ Good — encourages zero-error target |
| Delegate fix to native tools | No reinventing wheel; eslint --fix, ruff --fix, etc. | ✓ Good — leverages existing tooling |
| JSON output for integration | Enables downstream tooling (dashboards, aggregators) | ✓ Good — machine-readable |
| Ratchet mode for CI | Prevents regression without requiring immediate perfection | ✓ Good — pragmatic adoption path |

## Constraints

- **Architecture**: CLI tool, Node.js + TypeScript
- **Generalizability**: Must work for any language/codebase
- **Scoring**: Foundation Tier (3 metrics) as v1 target

---

*Last updated: 2026-01-17 after v1.0 milestone*
