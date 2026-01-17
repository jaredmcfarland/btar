---
phase: 05-remediation
plan: 01
subsystem: remediation
tags: [typescript, tdd, recommendations, scoring, ai-agent-readiness]

# Dependency graph
requires:
  - phase: 03-scoring-engine
    provides: ScoreResult, ScoreInterpretation types
  - phase: 02-core-metrics
    provides: MetricsReport, LINTER_TOOLS
provides:
  - generateRecommendations function for tier-based guidance
  - Recommendation interface with tier/category/message/impact/tool
  - RecommendationTier type (P0-P3 priority levels)
affects: [05-02-fixer, 05-03-ratchet, cli-output, reporting]

# Tech tracking
tech-stack:
  added: []
  patterns: [tier-based-recommendations, priority-sorting, language-aware-tools]

key-files:
  created:
    - src/core/remediation/recommendations.ts
    - src/core/remediation/recommendations.test.ts
    - src/core/remediation/index.ts
  modified: []

key-decisions:
  - "P0 type errors, P1 lint, P2 coverage, P3 deferred for needs-work tier"
  - "Poor tier defers coverage to P3 (foundation first)"
  - "Excellent tier uses P2/P3 with low impact (maintenance suggestions)"
  - "Tool suggestions from LINT_FIX_TOOLS by language"
  - "Sorted by tier then by impact (high first)"

patterns-established:
  - "Tier-based generation: separate functions per interpretation"
  - "Recommendation ordering: tier priority, then impact priority"
  - "Language-aware tooling: LINT_FIX_TOOLS[language] for tool suggestions"

# Metrics
duration: 7m
completed: 2026-01-17
---

# Phase 05 Plan 01: Tier-Based Recommendations Summary

**Tier-based recommendation engine using TDD: converts ScoreResult and MetricsReport into prioritized, actionable Recommendation[] with tool suggestions**

## Performance

- **Duration:** 7 min
- **Started:** 2026-01-17T22:05:29Z
- **Completed:** 2026-01-17T22:12:31Z
- **Tasks:** TDD cycle (RED-GREEN)
- **Tests:** 24 passing
- **Files created:** 3
- **Files modified:** 0

## Accomplishments

- Recommendation interface with tier (P0-P3), category, message, impact, tool
- generateRecommendations() converting score and metrics to actionable guidance
- Four tier strategies: excellent (maintain), good (fix remaining), needs-work (prioritize), poor (foundation first)
- P0: Type errors (highest priority for AI agent reliability)
- P1: Lint errors (clean code for AI modifications)
- P2: Coverage (verification for AI-generated code)
- P3: Advanced/deferred items
- Tool suggestions from LINT_FIX_TOOLS for all 9 supported languages
- Sorting by tier then impact (high first)
- Barrel export via remediation/index.ts

## TDD Commits

1. **RED Phase: Add failing tests** - `7f61044` (test)
   - 24 failing tests covering all tier behaviors
   - Tests for recommendation structure
   - Tests for excellent/good/needs-work/poor tiers
   - Tests for ordering by tier then impact
   - Tests for tool suggestions and edge cases

2. **GREEN Phase: Implement recommendations engine** - `0387fd2` (feat)
   - generateRecommendations() with tier-based logic
   - Separate generator functions per interpretation
   - LINT_FIX_TOOLS record for all 9 languages
   - sortRecommendations() for tier+impact ordering
   - Barrel export in index.ts
   - All 24 tests passing

## Files Created

- `src/core/remediation/recommendations.ts` (386 lines)
  - RecommendationTier, RecommendationCategory, RecommendationImpact types
  - Recommendation interface
  - generateRecommendations() main function
  - generateExcellentRecommendations() - maintenance and advanced suggestions
  - generateGoodRecommendations() - fix remaining errors
  - generateNeedsWorkRecommendations() - prioritized P0/P1/P2
  - generatePoorRecommendations() - foundation first, defer coverage
  - sortRecommendations() - by tier then impact
  - LINT_FIX_TOOLS - tool suggestions for all 9 languages

- `src/core/remediation/recommendations.test.ts` (474 lines)
  - Comprehensive TDD test coverage
  - Tests for all four interpretation tiers
  - Tests for recommendation structure validation
  - Tests for ordering guarantees
  - Tests for tool suggestions
  - Tests for edge cases (zero errors, missing coverage)

- `src/core/remediation/index.ts` (12 lines)
  - Barrel export for recommendations module
  - Exports generateRecommendations, Recommendation, RecommendationTier, RecommendationCategory, RecommendationImpact

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Priority tiers | P0-P3 | Standard priority nomenclature, clear ordering |
| Type errors priority | P0 in needs-work/poor | Type safety most critical for AI agent reliability |
| Coverage deferral | P3 in poor tier | Foundation (type+lint) must come first |
| Tool suggestions | Per-language LINT_FIX_TOOLS | Actionable guidance with exact commands |
| Impact levels | high/medium/low | Indicates urgency relative to score improvement |
| Sort order | Tier first, then impact | Ensures P0 high always comes before P1 high |

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward TDD implementation.

## Verification Results

- `npm test -- recommendations` - 24 tests passing
- `npm run build` - Compiles successfully
- `src/core/remediation/index.ts` - Exports available

## Next Phase Readiness

**Provides for 05-02 (Auto-fixer):**
- Recommendation interface for actionable fixes
- Tool suggestions for lint auto-fix commands
- Category classification for targeted fixes

**Provides for 05-03 (Ratchet Mode):**
- Recommendations can explain regressions
- Tier system indicates severity of issues

**Blockers:** None

## Requirements Satisfied

- Score 90+ receives 'excellent' recommendations (maintain practices)
- Score 70-89 receives 'good' recommendations (minor improvements)
- Score 50-69 receives 'needs-work' recommendations (prioritized fixes)
- Score <50 receives 'poor' recommendations (foundation first)
- Recommendations ordered by impact (highest first)
- generateRecommendations exported from remediation/index.ts
- Recommendation and RecommendationTier types exported
- Test file exceeds 100 lines (474 lines)

---
*Phase: 05-remediation*
*Completed: 2026-01-17*
