# Brownfield-to-Agent-Ready (BTAR)

## What This Is

A Claude Code plugin that systematically transforms existing codebases into "agent-ready" environments — highly verifiable, well-tested, strictly typed codebases where AI agents can work autonomously and reliably. BTAR encodes the principles of agent-readiness, discovers project specifics through questioning, and generates project-specific skills and execution plans.

## Core Value

**Verification enables automation.** The Verifier's Rule states that AI effectiveness is proportional to task verifiability. BTAR maximizes verifiability by building the infrastructure that constrains AI agents into feedback-rich solution spaces.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Question-based project discovery (language, platform, existing tooling, goals)
- [ ] Foundation Tier scoring system (9 metrics, measurable, automatable)
- [ ] Dynamic skill generation for any language/stack based on discovery
- [ ] Gap identification against Foundation Tier metrics
- [ ] Remediation planning with prioritized fix order
- [ ] Wave-based parallel execution for remediation tasks
- [ ] Cross-language tool mapping (type checkers, linters, formatters, property test libs)
- [ ] AGENTS.md / CLAUDE.md template generation

### Out of Scope

- [ ] Language-specific hardcoding — discovery-based, not prescriptive
- [ ] Mutation testing in v1 — Foundation Tier is the floor, mutation testing is next tier
- [ ] Multi-repo orchestration — one Claude instance per repo, parallelization is within-repo
- [ ] GUI/web interface — CLI-first, Claude Code plugin architecture

## Context

**Theoretical Foundation:**
- The Verifier's Rule (Jason Wei): AI training effectiveness proportional to verifiability
- Software 2.0/3.0 (Karpathy): "Automates what you can verify"
- Validation bottleneck (Osmani): Verification, not generation, is the development bottleneck

**Inspiration:**
- GSD (Get Shit Done): Wave-based parallelization, question-based discovery, plan-as-prompt architecture
- `/gsd:map-codebase`: Brownfield analysis pattern

**Validation Ground:**
- Mixpanel server-side SDKs (Python, Node, Java, Ruby, PHP, Go)
- Mixpanel client-side SDKs (Swift, Objective-C, Android, Flutter, React Native, Unity)
- Owner/maintainer has full access and context

## Constraints

- **Architecture**: Claude Code plugin (commands, agents, skills, hooks)
- **Generalizability**: Must work for any language/codebase, not just Mixpanel SDKs
- **Skill Generation**: Fully generated from discovery, not templated slots
- **Scoring**: Foundation Tier (9 metrics) as v1 target

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Generalizable over Mixpanel-specific | Broader utility, forces cleaner abstraction | — Pending |
| Fully generated skills | Adapts to any stack without maintenance burden | — Pending |
| Foundation Tier as v1 scope | Establishes floor before investing in advanced metrics (mutation testing) | — Pending |
| Per-dimension scoring with rollup | Captures progress, identifies specific gaps | — Pending |
| Question-based discovery | Different languages/projects have different optimal tooling | — Pending |

---

## Foundation Tier Metrics (v1 Scoring)

| # | Metric | Target | Priority |
|---|--------|--------|----------|
| 1 | Type strictness | 0 errors | P0 — highest leverage |
| 2 | Lint errors on main | 0 errors | P1 — quick win |
| 3 | Formatter enforced | 0 diffs in CI | P1 — removes ambiguity |
| 4 | AGENTS.md exists | Present | P2 — write once |
| 5 | Property-based tests exist | > 0 files | P3 — start small |
| 6 | CI time | < 10 min | P4 — if slow, fix |
| 7 | Flaky test rate | < 1% | P4 — reliability |
| 8 | Test coverage | > 70% | P5 — foundation |
| 9 | Tests parallelize | Yes | P5 — enables speed |

---

## Plugin Architecture (Planned)

```
.claude/
├── commands/btar/           # Slash commands
│   ├── new-project.md       # /btar:new-project
│   ├── map-codebase.md      # /btar:map-codebase
│   ├── identify-gaps.md     # /btar:identify-gaps
│   ├── remediation-plan.md  # /btar:remediation-plan
│   └── implement.md         # /btar:implement
├── agents/btar/             # Subagents
│   ├── gap-analyzer.md
│   ├── skill-generator.md
│   └── remediation-executor.md
├── skills/btar/             # Generated skills (per-project)
│   └── [language]-readiness.md
└── hooks/btar/              # Validation hooks
    └── pre-commit-check.json
```

---
*Last updated: 2026-01-15 after initialization*
