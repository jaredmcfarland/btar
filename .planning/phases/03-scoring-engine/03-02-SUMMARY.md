---
phase: 03-scoring-engine
plan: 02
subsystem: output
tags: [typescript, json, cli, serialization, machine-readable]

# Dependency graph
requires:
  - phase: 02-core-metrics
    provides: MetricsReport type with Maps
provides:
  - AnalysisOutput type for JSON serialization
  - formatAsJson function converting MetricsReport to JSON
  - --json CLI flag for machine-readable output
affects: [03-03, 03-04, 04-report-generation, ci-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [json-serialization, map-to-object-conversion]

key-files:
  created:
    - src/core/output.ts
  modified:
    - src/commands/analyze.ts
    - src/cli.ts

key-decisions:
  - "Convert Maps to plain objects for JSON.stringify compatibility"
  - "JSON mode suppresses all progress output"
  - "Empty languages array outputs minimal valid JSON structure"

patterns-established:
  - "Output formatting in separate module from command logic"
  - "JSON output via --json flag pattern for all commands"

# Metrics
duration: 6m
completed: 2026-01-17
---

# Phase 03 Plan 02: JSON Output Summary

**JSON output format via --json flag for CI integration and tooling**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-17T20:22:47Z
- **Completed:** 2026-01-17T20:29:08Z
- **Tasks:** 2
- **Files created:** 1
- **Files modified:** 2

## Accomplishments

- AnalysisOutput type for JSON-serializable results
- formatAsJson function converts MetricsReport Maps to plain objects
- --json/-j CLI flag outputs valid JSON to stdout
- Suppresses progress output in JSON mode for clean stdout

## Task Commits

Each task was committed atomically:

1. **Task 1: Create output types and formatters** - `883e9ac` (feat)
   - AnalysisOutput type definition
   - formatAsJson function with Map-to-object conversion

2. **Task 2: Add --json flag to analyze command** - `b661b0f` (feat)
   - CLI option -j/--json
   - JSON output mode in analyzeCommand
   - Progress suppression in JSON mode

## Files Created/Modified

- `src/core/output.ts` (100 lines) - JSON serialization module
  - AnalysisOutput interface for JSON schema
  - formatAsJson function converting Maps to objects
  - JSON.stringify with 2-space indentation

- `src/commands/analyze.ts` - JSON output integration
  - json?: boolean option added
  - Early return with JSON output when flag set
  - Progress suppression in JSON mode

- `src/cli.ts` - CLI option registration
  - `-j, --json` option with description

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Map conversion | Convert to plain objects | JSON.stringify cannot serialize Maps |
| Progress output | Suppress in JSON mode | Clean stdout for piping to jq/tools |
| Empty result | Valid JSON with empty arrays | Consistent output structure |
| Indentation | 2 spaces | Readable yet compact |

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

**Provides for subsequent plans:**
- JSON output format for score display (03-03)
- Machine-readable format for CI integration
- AnalysisOutput type for report generation (04-xx)

**Blockers:** None

**Ready for:** 03-03 (Score Display Integration)

## Requirements Satisfied

- **INFRA-05** (Machine-readable output): JSON format for CI and tooling integration

---
*Phase: 03-scoring-engine*
*Completed: 2026-01-17*
