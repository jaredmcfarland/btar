# Pitfalls Research: BTAR Codebase Transformation Tools

**Researched:** 2026-01-15
**Domain:** Codebase analysis, transformation, and agent-readiness scoring
**Confidence:** HIGH (extensive cross-referenced sources)

---

## Executive Summary

Three major risk areas dominate codebase transformation tooling: **false positives destroying developer trust** (the single biggest adoption killer), **performance bottlenecks making tools unusable on real codebases**, and **metrics that don't correlate with actual agent success**. The Mixpanel SDK validation ground is critical because multi-language codebases surface edge cases that single-language tools miss. AI-generated transformations fail silently at alarming rates (45% contain security vulnerabilities per [Veracode 2025](https://spectrum.ieee.org/ai-coding-degrades)), requiring robust verification layers.

---

## Critical Pitfalls (Block Shipping)

These pitfalls will prevent BTAR from working on real codebases.

| Pitfall | Warning Signs | Prevention | Phase to Address | Severity |
|---------|---------------|------------|------------------|----------|
| **AST parsing fails on valid code** | "Parse error" on files that compile fine; tree-sitter produces ERROR nodes on edge cases | Use [LibCST](https://blog.jez.io/tree-sitter-limitations/) for Python (preserves formatting), test against Mixpanel SDKs' weirdest files first, maintain parser fallback chain | Phase 1: Core Analysis | CRITICAL |
| **Cross-file analysis timeouts** | Analysis hangs on large repos; Semgrep defaults to single-file after [3 hours or 5GB memory](https://semgrep.dev/docs/semgrep-code/semgrep-pro-engine-intro) | Implement incremental analysis, file-count limits with graceful degradation, explicit timeout handling | Phase 1: Core Analysis | CRITICAL |
| **Generated skills that don't work** | Skills pass unit tests but fail on real agent invocations; 45% of AI-generated code contains vulnerabilities per [Veracode](https://www.theregister.com/2025/12/17/ai_code_bugs/) | Test-first skill generation; every skill must demonstrate working agent execution; mutation testing on skill logic | Phase 3: Skill Generation | CRITICAL |
| **Codemod breaks production code silently** | Codemod runs without errors but changes behavior; [MUI migrations broke line endings](https://github.com/mui/material-ui/issues/29822), import order | Diff preview mandatory; semantic equivalence tests; rollback-first design; require git clean state | Phase 4: Transformation | CRITICAL |
| **CommonJS/ESM module resolution failures** | Analysis misses exports, finds phantom dependencies; [Semgrep can't track certain CommonJS patterns](https://semgrep.dev/docs/semgrep-code/semgrep-pro-engine-examples) | Test against all SDK module patterns (CJS, ESM, UMD, IIFE); explicit unsupported-pattern detection with user warning | Phase 1: Core Analysis | CRITICAL |

---

## Quality Pitfalls (Degrade Quality)

These pitfalls produce working but unreliable/unhelpful output.

| Pitfall | Warning Signs | Prevention | Phase to Address | Severity |
|---------|---------------|------------|------------------|----------|
| **Metrics that don't predict agent success** | High readiness scores on repos where agents still fail; [95% coverage but production breaks](https://getdx.com/blog/software-quality-metrics/) | Validate scoring rubric against actual agent task completion rates; mutation score > line coverage | Phase 2: Scoring | HIGH |
| **False positive flood** | Users ignore findings; [AI tools generate noise that wastes time](https://graphite.com/guides/Ai-code-review-solutions-in-2024) | Confidence thresholds; suppress LOW confidence by default; track false positive rate as KPI | Phase 2: Scoring | HIGH |
| **Incomplete language support** | "Partially supported" language produces misleading scores; [no tool covers all layers](https://www.qodo.ai/blog/code-analysis-tools/) | Explicit language support matrix; FAIL LOUDLY on unsupported languages vs partial analysis | Phase 1: Core Analysis | HIGH |
| **Losing formatting/comments in transforms** | AST roundtrip [strips whitespace and comments](https://deepsource.com/blog/python-asts-by-building-your-own-linter); diffs become unreadable | Use CST (Concrete Syntax Trees) for source transforms; preserve original formatting in untouched code | Phase 4: Transformation | HIGH |
| **Test quality metrics that game easily** | Coverage inflated by [tests that run code without verifying behavior](https://distantjob.com/blog/code-quality-metrics/) | Require mutation testing (mutmut/Stryker) for test quality assessment; explain metric limitations | Phase 2: Scoring | MEDIUM |
| **Hallucinated API recommendations** | Skills reference non-existent methods; [LLMs generate plausible but wrong code](https://www.augmentcode.com/guides/debugging-ai-generated-code-8-failure-patterns-and-fixes) | All API references verified against actual codebase; no "best practices" without source validation | Phase 3: Skill Generation | HIGH |

---

## UX Pitfalls (Developer Frustration)

These pitfalls make the tool annoying to use, killing adoption.

| Pitfall | Warning Signs | Prevention | Phase to Address | Severity |
|---------|---------------|------------|------------------|----------|
| **Analysis takes too long** | Users cancel before completion; [CodeQL recommends schedule-only for large repos](https://docs.github.com/en/code-security/code-scanning/troubleshooting-code-scanning/analysis-takes-too-long) | Progress indicators; incremental results; target <60s for initial useful output; background full analysis | Phase 1: Core Analysis | HIGH |
| **Overwhelming output volume** | Hundreds of findings with no prioritization; [developers buried in notifications](https://graphite.com/guides/Ai-code-review-solutions-in-2024) | Priority-ordered output; "top 5 actions" summary; progressive disclosure of detail | Phase 2: Scoring | MEDIUM |
| **Opaque scoring** | "Your score is 47" with no explanation of why or how to improve | Every score component shows: metric value, target, specific action to improve, expected score gain | Phase 2: Scoring | MEDIUM |
| **Works-on-my-machine failures** | Tool succeeds locally but fails in CI; path assumptions, dependency issues | Docker-first testing; explicit environment requirements; CI template provided | All phases | MEDIUM |
| **No dry-run mode** | Users fear running transformations; [codemods should support --dry-run](https://docs.codemod.com/guides/migrations/zod-3-4) | All transformations preview-only by default; explicit --apply flag required | Phase 4: Transformation | MEDIUM |
| **Error messages that don't help** | "Analysis failed" with no actionable next step; [tree-sitter gives parse errors without context](https://github.com/tree-sitter/tree-sitter/issues/1631) | Every error includes: what failed, likely cause, specific remediation step | All phases | MEDIUM |

---

## Multi-Language Specific Pitfalls

BTAR's multi-language requirement (Mixpanel SDKs) introduces unique challenges.

| Pitfall | Warning Signs | Prevention | Phase to Address | Severity |
|---------|---------------|------------|------------------|----------|
| **Language-specific metric incompatibility** | Comparing Python mutation scores to Swift code coverage meaningless; [each language has different tool ecosystems](https://github.com/analysis-tools-dev/static-analysis) | Normalize metrics per-language; separate language-specific and cross-language scores; explicit "not comparable" warnings | Phase 2: Scoring | HIGH |
| **Inconsistent analysis depth across languages** | Python fully analyzed, Swift barely scanned; [systems span many languages with no single tool](https://www.in-com.com/blog/best-static-code-analysis-tools-large-enterprises-2025/) | Minimum viable analysis per language before claiming support; feature parity matrix | Phase 1: Core Analysis | HIGH |
| **Different module/package conventions** | Python packages vs Swift modules vs Kotlin packages vs JS node_modules; path assumptions break | Language-specific module resolvers; explicit "project root" detection per language | Phase 1: Core Analysis | CRITICAL |
| **Type system differences** | TypeScript structural types vs Swift nominal types vs Python gradual typing | Per-language type coverage definitions; don't compare 100% TypeScript strict to 80% mypy | Phase 2: Scoring | MEDIUM |
| **Build system fragmentation** | Gradle vs npm vs pip vs SwiftPM have incompatible patterns; [multi-language monorepos require Bazel-level tooling](https://graphite.com/guides/managing-multiple-languages-in-a-monorepo) | Detect and adapt to build system per-language; don't assume single build tool | Phase 1: Core Analysis | HIGH |
| **SDK release cadence differences** | iOS SDK updated monthly, Android quarterly, Python weekly | Per-SDK analysis caching; don't re-analyze unchanged SDKs | Phase 1: Core Analysis | MEDIUM |

---

## AI/Agent-Readiness Specific Pitfalls

These pitfalls are specific to the "agent-ready" mission.

| Pitfall | Warning Signs | Prevention | Phase to Address | Severity |
|---------|---------------|------------|------------------|----------|
| **Scoring what's measurable, not what matters** | Perfect scores on repos where agents fail; [coverage doesn't predict production incidents](https://getdx.com/blog/software-quality-metrics/) | Validate rubric against actual agent task success rates; iterate scoring based on real usage | Phase 2: Scoring | CRITICAL |
| **Context files that agents can't use** | Generated CLAUDE.md too long, too vague, or missing critical info; [agents need precise, actionable context](https://docs.factory.ai) | Test generated context with actual Claude Code tasks; measure task success rate as feedback | Phase 3: Skill Generation | HIGH |
| **Verification speed not measured** | Scoring ignores CI time; [fast feedback enables agent iteration loops](https://www.anthropic.com/engineering/claude-code-best-practices) | CI feedback time as first-class metric; target <5 min for agent-ready | Phase 2: Scoring | HIGH |
| **Skills that work once but not repeatedly** | Skill succeeds on demo but fails on variations; [agents struggle with existing codebases](https://www.honeycomb.io/blog/how-i-code-with-llms-these-days) | Test skills on multiple invocations with variations; property-based testing for skill robustness | Phase 3: Skill Generation | HIGH |
| **Ignoring flaky tests** | Agents "learn wrong lessons" from intermittent failures; [>3% flaky rate destroys feedback signal](https://arxiv.org/html/2504.09691v1) | Flaky test detection and flagging as critical agent-readiness blocker | Phase 2: Scoring | HIGH |
| **Trust but don't verify** | Generated skills assumed correct; [46% of developers don't trust AI tool accuracy](https://www.diffblue.com/resources/the-trust-problem-in-ai-driven-software-development-what-to-do-about-it/) | Every generated artifact must pass verification; no "trust the AI" shortcuts | Phase 3: Skill Generation | CRITICAL |
| **Over-optimizing for benchmarks** | High SWE-bench scores but poor real-world performance; [METR found devs 19% slower with AI on familiar repos](https://spectrum.ieee.org/ai-coding-degrades) | Real-world validation on Mixpanel SDKs; track actual developer time-to-task completion | Phase 2: Scoring | MEDIUM |

---

## Pitfall Priority Matrix

| Pitfall | Likelihood | Impact | Priority | Phase |
|---------|------------|--------|----------|-------|
| AST parsing fails on valid code | HIGH | CRITICAL | P0 | 1 |
| Cross-file analysis timeouts | HIGH | CRITICAL | P0 | 1 |
| Generated skills don't work | HIGH | CRITICAL | P0 | 3 |
| Metrics don't predict agent success | HIGH | CRITICAL | P0 | 2 |
| Codemod breaks code silently | MEDIUM | CRITICAL | P0 | 4 |
| False positive flood | HIGH | HIGH | P1 | 2 |
| Analysis takes too long | HIGH | HIGH | P1 | 1 |
| Module resolution failures | MEDIUM | CRITICAL | P1 | 1 |
| Inconsistent language analysis depth | MEDIUM | HIGH | P1 | 1 |
| Context files agents can't use | MEDIUM | HIGH | P1 | 3 |
| Incomplete language support | MEDIUM | HIGH | P2 | 1 |
| Hallucinated API recommendations | MEDIUM | HIGH | P2 | 3 |
| Overwhelming output volume | MEDIUM | MEDIUM | P2 | 2 |
| Opaque scoring | LOW | MEDIUM | P3 | 2 |
| No dry-run mode | LOW | MEDIUM | P3 | 4 |

---

## Prevention Strategies by Phase

### Phase 1: Core Analysis
- **Parser resilience:** Chain multiple parsers (tree-sitter -> language-specific -> fallback regex)
- **Timeout handling:** Hard limits with graceful degradation, not silent failure
- **Module detection:** Test against ALL Mixpanel SDK module patterns before claiming support
- **Progress feedback:** Stream partial results; never make users wait for "all or nothing"

### Phase 2: Scoring
- **Validation loop:** Compare scores to actual agent task success; iterate rubric
- **Explainability:** Every score shows calculation, target, and improvement action
- **Confidence bands:** HIGH/MEDIUM/LOW on every metric; suppress LOW by default
- **False positive tracking:** Log and review all user-disputed findings

### Phase 3: Skill Generation
- **Test-first:** Skills written against verification suite before generation
- **Execution testing:** Every skill executed by actual agent in test harness
- **API verification:** All referenced methods/functions validated against codebase AST
- **Mutation testing:** Skills pass mutation testing, not just example tests

### Phase 4: Transformation
- **Preview-only default:** No transformation without explicit user confirmation
- **Semantic equivalence:** Automated tests that transformed code behaves identically
- **Rollback-first:** Git state captured before any transformation
- **Diff readability:** Preserve formatting; minimal, targeted changes

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| AST/Parsing pitfalls | HIGH | Extensive documentation from tree-sitter, JavaParser, jscodeshift projects |
| Performance pitfalls | HIGH | GitHub CodeQL, Semgrep officially document timeout/memory limits |
| Multi-language challenges | HIGH | Multiple sources confirm tool fragmentation, no universal solution |
| AI/Agent pitfalls | HIGH | Recent (2025-2026) research from Veracode, METR, Qodo quantifies failure rates |
| Metric correlation | MEDIUM | Strong theoretical basis (Verifier's Rule) but limited empirical validation |
| Transformation safety | HIGH | Well-documented codemod failure patterns from MUI, React Query migrations |

---

## Sources

### Primary (HIGH confidence)
- [GitHub Code Scanning Troubleshooting](https://docs.github.com/en/code-security/code-scanning/troubleshooting-code-scanning/analysis-takes-too-long) - CodeQL performance limits
- [Semgrep Cross-File Analysis](https://semgrep.dev/docs/semgrep-code/semgrep-pro-engine-intro) - Memory/timeout constraints
- [Tree-sitter Limitations](https://blog.jez.io/tree-sitter-limitations/) - Parser edge cases
- [Veracode AI Code Study](https://www.theregister.com/2025/12/17/ai_code_bugs/) - 45% vulnerability rate
- [IEEE Spectrum: AI Coding Degrades](https://spectrum.ieee.org/ai-coding-degrades) - Silent failure patterns

### Secondary (MEDIUM confidence)
- [DX Software Quality Metrics](https://getdx.com/blog/software-quality-metrics/) - Metric correlation issues
- [Graphite AI Code Review](https://graphite.com/guides/Ai-code-review-solutions-in-2024) - False positive problems
- [Augment Code AI Debugging](https://www.augmentcode.com/guides/debugging-ai-generated-code-8-failure-patterns-and-fixes) - Failure patterns
- [MUI Codemod Issues](https://github.com/mui/material-ui/issues/29822) - Real-world migration failures
- [Graphite Multi-Language Monorepos](https://graphite.com/guides/managing-multiple-languages-in-a-monorepo) - Tooling fragmentation

### Tertiary (LOW confidence)
- Stack Overflow discussions on codemod failures
- Medium posts on migration lessons learned
