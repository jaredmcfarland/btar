# Research Summary: BTAR (Brownfield-to-Agent-Ready)

**Synthesized:** 2026-01-15
**Domain:** Multi-language codebase analysis and transformation for AI agent readiness
**Overall Confidence:** HIGH

---

## Executive Summary

BTAR occupies a **distinct, uncontested niche**: optimizing codebases specifically for AI agent operation. While SonarQube, CodeClimate, and Codacy optimize for human code quality (maintainability, security, bug detection), BTAR answers a different question: **"Can an AI agent safely modify this code?"**

The research confirms three strategic insights:

1. **Leverage, don't rebuild:** Every target language has dominant tooling (ruff for Python, golangci-lint for Go, detekt for Kotlin). BTAR should orchestrate these tools via subprocess, not replace them.

2. **The competitive moat is agent-specific metrics:** No competitor measures flaky test rate, mutation score, CI feedback time, or verification ceiling. The Verifier's Rule ("AI effectiveness proportional to verifiability") is BTAR's theoretical foundation.

3. **Multi-language is hard but achievable:** The pipeline architecture (SonarQube) and containerized engine model (CodeClimate) prove cross-language analysis works. The key is normalization layers that convert diverse tool outputs to unified 0-100 scores.

**Critical risk:** False positives destroy trust (46% of developers don't trust AI tool accuracy). Every finding must have a confidence level, and LOW confidence should be suppressed by default.

---

## Key Research Findings

### Stack (STACK.md)

| Language | Type Checker | Linter | Formatter | Test | Property Test |
|----------|-------------|--------|-----------|------|---------------|
| Python | pyright | ruff | ruff format | pytest | Hypothesis |
| TypeScript | tsc | ESLint/Biome | Prettier/Biome | Vitest/Jest | fast-check |
| Swift | swiftc | SwiftLint | SwiftFormat | XCTest | SwiftCheck |
| Kotlin | kotlinc | detekt + ktlint | ktfmt | JUnit 5 | kotest-property |
| Go | go build | golangci-lint | gofmt | go test | gopter |
| Java | javac | SpotBugs + Checkstyle | google-java-format | JUnit 5 | jqwik |
| Ruby | Sorbet/Steep | Standard Ruby | Standard Ruby | RSpec | Rantly |
| PHP | PHPStan | PHPStan + Psalm | PHP CS Fixer | PHPUnit | Eris |

**Key insight:** Use **pre-commit framework** to unify hook execution across all languages.

### Features (FEATURES.md)

**Table Stakes:**
- CLI interface, multi-language support, CI/CD integration, scoring output, configuration file

**Differentiators:**
- Agent-Readiness Scoring Rubric (unique metric system)
- Flaky test detection (no competitor focuses here)
- Mutation score measurement
- AGENTS.md generation (60K repos have adopted this standard)
- CI feedback time measurement

**Anti-Features (deliberately NOT building):**
- Hosted SaaS dashboard (competitors do this better)
- Security scanning (Snyk does this better)
- IDE plugin (high overhead, CLI + CI is sufficient)

### Architecture (ARCHITECTURE.md)

**Pipeline pattern:** Discovery Engine -> Scoring Engine -> Skill Generator -> Remediation Planner

**Claude Code plugin structure:**
```
.claude/
├── commands/btar/      # /btar:assess, /btar:remediate
├── agents/btar/        # discoverer, scorer, remediator
├── skills/btar/        # Generated per-language skills
└── hooks/btar/         # PostToolUse validation
```

**Data flow:** Scan file tree -> Detect languages -> Find tools -> Invoke tools (subprocess) -> Parse output -> Normalize to 0-100 -> Generate skills for gaps

### Pitfalls (PITFALLS.md)

**Critical (block shipping):**
1. AST parsing fails on valid code - use CST (LibCST) for Python, test against Mixpanel SDKs' weirdest files
2. Cross-file analysis timeouts - implement incremental analysis with hard limits
3. Generated skills that don't work - test-first skill generation, execute with real agents
4. Codemod breaks code silently - diff preview mandatory, rollback-first design

**Quality (degrade quality):**
1. Metrics don't predict agent success - validate scoring against actual agent task completion
2. False positive flood - confidence thresholds, suppress LOW by default
3. Analysis takes too long - target <60s for initial useful output

**Agent-specific:**
1. Flaky tests destroy feedback signal - detection is critical for agent-readiness
2. Context files agents can't use - test AGENTS.md with actual Claude Code tasks
3. Verification speed not measured - CI feedback time as first-class metric

---

## Implications for Roadmap

Based on research, the suggested phase structure:

### Phase 1: Discovery & Core Metrics
**Delivers:** Language detection, tool detection, type strictness, lint errors, test coverage

**Addresses:**
- Features: CLI interface, multi-language support, core metrics
- Pitfalls: Parser resilience (test against Mixpanel SDKs), timeout handling

**Uses:** Language-specific tool adapters (ruff, tsc, swiftlint, detekt, golangci-lint)

**Rationale:** Foundation - everything depends on knowing what's in the repo and having basic metrics.

### Phase 2: Agent-Readiness Scoring
**Delivers:** Scoring rubric implementation, CI feedback time, flaky test detection, AGENTS.md validation

**Addresses:**
- Features: Agent-readiness score (differentiator), tier-based recommendations
- Pitfalls: Metrics validation against actual agent success, explainability

**Uses:** CI platform API integration (GitHub Actions), scoring normalization rules

**Rationale:** Differentiation - this is what sets BTAR apart from SonarQube/CodeClimate.

### Phase 3: Skill Generation
**Delivers:** Dynamic skill generation per-language, AGENTS.md generation, remediation planning

**Addresses:**
- Features: AGENTS.md generation, automated remediation workflows
- Pitfalls: Test-first skill generation, API verification, execution testing

**Uses:** Skill templates, codebase analysis results

**Rationale:** Automation - enables AI agents to actually improve codebases.

### Phase 4: Transformations
**Delivers:** Lint auto-fix delegation, type stub generation, hook generators

**Addresses:**
- Features: Pre-commit hook configuration, Claude Code hooks
- Pitfalls: Preview-only default, rollback-first, diff readability

**Uses:** Language-specific fix tools (ruff --fix, eslint --fix), OpenRewrite recipes

**Rationale:** Polish - adds convenience features once core is solid.

### Phase Ordering Rationale

1. **Phase 1 before 2:** Can't score without metrics; can't get metrics without discovery
2. **Phase 2 before 3:** Skills address gaps; can't identify gaps without scoring
3. **Phase 3 before 4:** Transformations are higher-risk; skills are safer first step
4. **All phases:** Parser resilience testing against Mixpanel SDKs validates multi-language support

### Research Flags for Phases

| Phase | Research Status |
|-------|-----------------|
| Phase 1 | Standard patterns - STACK.md provides tool mapping |
| Phase 2 | **Needs validation** - scoring rubric must correlate with actual agent success |
| Phase 3 | Novel design - skill generation approach needs iteration |
| Phase 4 | Standard patterns - codemod tools are well-documented |

---

## Confidence Assessment

| Research Area | Confidence | Reason |
|---------------|------------|--------|
| Stack recommendations | HIGH | Verified via official docs, PyPI/npm adoption |
| Competitive landscape | HIGH | Official docs for SonarQube, CodeClimate, Codacy |
| Pipeline architecture | HIGH | Verified via SonarQube, CodeClimate specs |
| Claude Code plugin structure | HIGH | Official plugin documentation |
| Pitfall identification | HIGH | Quantified research from Veracode, METR, GitHub |
| Agent-readiness metrics | MEDIUM | Strong theory, limited empirical validation |
| Skill generation approach | MEDIUM | Novel design, follows plugin patterns |

---

## Open Questions

1. **CI API access:** How to get GitHub Actions history without complex user auth?
2. **Mutation testing performance:** Too slow for real-time; background analysis?
3. **Scoring validation:** Need Mixpanel SDK agent tasks to validate rubric
4. **Skill versioning:** What happens when project tooling changes?

---

## Next Steps

1. **Run `/gsd:define-requirements`** to convert research findings into actionable requirements
2. **Validate scoring rubric** against actual Claude Code task completion on Mixpanel SDKs
3. **Prototype Phase 1** discovery engine against Mixpanel Python SDK as initial target

---

**Research Date:** 2026-01-15
**Valid Until:** 2026-04-15 (3 months - tooling evolves quickly)
