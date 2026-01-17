---
phase: 05-remediation
plan: 04
subsystem: cli
tags: [typescript, cli, commander, recommendations, ratchet, baseline, analyze]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: CLI infrastructure, config loading, progress reporting
  - phase: 05-01
    provides: generateRecommendations function
  - phase: 05-02
    provides: loadRatchetScore, saveRatchetScore, checkRatchetRegression
  - phase: 05-03
    provides: runFix, FIX_TOOLS for fixer barrel export
provides:
  - Enhanced analyze command with recommendations output
  - Ratchet mode enforcement via --ratchet flag
  - Baseline saving via --save-baseline flag
  - Complete remediation barrel export (recommendations, ratchet, fixer)
affects: [end-user-workflows, ci-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [cli-flag-integration, barrel-export]

key-files:
  created: []
  modified:
    - src/core/remediation/index.ts
    - src/commands/analyze.ts
    - src/core/output.ts
    - src/cli.ts

key-decisions:
  - "Recommendations always shown in analyze output (text and JSON)"
  - "Ratchet mode uses --ratchet flag, exits 1 on regression"
  - "--save-baseline saves score to .btar-score file"
  - "Helpful message when --ratchet used without baseline"

patterns-established:
  - "Remediation modules re-exported from single barrel"
  - "Recommendations formatted with tier prefix and tool hints"
  - "Ratchet check happens after score calculation but before output"

# Metrics
duration: 15m
completed: 2026-01-17
---

# Phase 05 Plan 04: CLI Integration Summary

**Integrated recommendations and ratchet mode into analyze command with complete remediation barrel export**

## Performance

- **Duration:** 15 min
- **Started:** 2026-01-17T22:15:13Z
- **Completed:** 2026-01-17T22:30:07Z
- **Tasks:** 3 (all auto)
- **Files created:** 0
- **Files modified:** 4

## Accomplishments

- Complete remediation barrel export (recommendations, ratchet, fixer)
- Recommendations displayed in analyze text output with tier/tool hints
- Recommendations included in JSON output as array
- --ratchet flag enforces no regression from baseline
- --save-baseline flag saves current score to .btar-score
- All 281 tests continue to pass

## Task Commits

1. **Task 1: Create remediation barrel export** - `57f2d88` (chore)
   - Added runFix, FIX_TOOLS exports to index.ts
   - Added FixResult type export
   - Complete barrel for all remediation modules

2. **Task 2: Add recommendations to analyze output** - `2362699` (feat)
   - Imported generateRecommendations in analyze.ts
   - Generate recommendations after scoring
   - Display in text output with tier and tool hints
   - Added RecommendationOutput interface to output.ts
   - Include recommendations array in JSON output

3. **Task 3: Add ratchet mode to analyze command** - `c1856dc` (feat)
   - Added --ratchet and --save-baseline CLI options
   - Added ratchet/saveBaseline to AnalyzeOptions
   - --save-baseline saves score to .btar-score
   - --ratchet loads baseline and checks regression
   - Exit code 1 on ratchet failure

## Files Modified

- `src/core/remediation/index.ts` - Added fixer exports
  - export { runFix, FIX_TOOLS } from "./fixer.js"
  - export type { FixResult } from "./fixer.js"

- `src/commands/analyze.ts` - Integrated recommendations and ratchet
  - Import generateRecommendations, loadRatchetScore, saveRatchetScore, checkRatchetRegression
  - Added ratchet and saveBaseline to AnalyzeOptions
  - Generate recommendations after scoring
  - Save baseline if --save-baseline
  - Check ratchet regression if --ratchet
  - Display recommendations in text output
  - Exit 1 on ratchet failure

- `src/core/output.ts` - Added recommendations to JSON
  - Import Recommendation type
  - Added RecommendationOutput interface
  - Added recommendations field to FormatJsonOptions
  - Added recommendations array to AnalysisOutput
  - Map recommendations in formatAsJson

- `src/cli.ts` - Added CLI flags
  - .option("--ratchet", "...")
  - .option("--save-baseline", "...")

## CLI Usage

```bash
# Analyze with recommendations (always shown)
btar analyze .

# Save baseline for ratchet mode
btar analyze . --save-baseline

# Enforce no regression
btar analyze . --ratchet

# JSON output includes recommendations
btar analyze . --json
```

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Recommendations always shown | Yes | Actionable guidance on every run |
| Ratchet on flag only | --ratchet required | CI opt-in, not default |
| Baseline file | .btar-score | Matches existing pattern |
| Helpful no-baseline message | Info level | Guide user, don't fail |

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward integration of existing modules.

## Next Phase Readiness

**Ready for:** 05-05-PLAN.md (Ratchet Command) if planned

**Provides for remaining plans:**
- Analyze command now feature-complete for remediation
- Recommendations visible in all outputs
- Ratchet mode ready for CI integration

**Blockers:** None

## Requirements Satisfied

- [x] npm run build succeeds
- [x] npm test passes (281 tests)
- [x] btar analyze shows recommendations section
- [x] btar analyze --json includes recommendations array
- [x] btar analyze --save-baseline creates .btar-score file
- [x] btar analyze --ratchet checks against baseline

---
*Phase: 05-remediation*
*Completed: 2026-01-17*
