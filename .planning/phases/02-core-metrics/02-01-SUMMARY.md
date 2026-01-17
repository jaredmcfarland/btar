---
phase: 02-core-metrics
plan: 01
subsystem: metrics-infrastructure
tags: [typescript, subprocess, metrics, types]
dependency-graph:
  requires: [01-01, 01-02]
  provides: [metric-types, tool-runner]
  affects: [02-02, 02-03, 02-04, 02-05]
tech-stack:
  added: []
  patterns: [promise-wrapper, subprocess-management]
key-files:
  created:
    - src/core/metrics/types.ts
    - src/core/metrics/runner.ts
  modified: []
decisions:
  - id: metric-parser-signature
    choice: (stdout, stderr, exitCode) => number
    rationale: Parsers need all three to handle tools that report errors on stdout or stderr
metrics:
  duration: 3m
  completed: 2026-01-17
---

# Phase 02 Plan 01: Types and Runner Summary

**One-liner:** MetricType/MetricResult/ToolMapping types with async subprocess runner supporting timeout and error capture.

## What Was Built

- **src/core/metrics/types.ts**: Metric type definitions
  - `MetricType` union: type_strictness | lint_errors | test_coverage
  - `MetricResult` interface: tool execution outcome with value and success flag
  - `ToolMapping` interface: language-to-tool configuration
  - `MetricParser` type: function signature for parsing tool output

- **src/core/metrics/runner.ts**: Subprocess execution utility
  - `runTool` function: async subprocess spawning with output capture
  - `ToolResult` interface: stdout, stderr, exitCode, timedOut
  - `RunToolOptions` interface: command, cwd, timeout configuration
  - Handles: timeout (SIGKILL), command not found (exit 127), spawn errors

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Parser signature | (stdout, stderr, exitCode) => number | Some tools output to stderr, others to stdout |
| Subprocess API | spawn (not exec) | Better control over streams, no buffer limits |
| Timeout handling | SIGKILL after delay | Ensures hung processes are terminated |
| Exit code 127 | Command not found | Unix convention for missing executables |

## Verification Results

| Check | Status |
|-------|--------|
| npm run build | Pass |
| npx tsc --noEmit | Pass |
| types.ts exports MetricResult | Pass |
| types.ts exports MetricType | Pass |
| types.ts exports ToolMapping | Pass |
| runner.ts exports runTool | Pass |
| No circular dependencies | Pass |

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 7687d9d | feat | define metric types |
| 3d304b6 | feat | create tool runner utility |

## Next Phase Readiness

**Provides for subsequent plans:**
- MetricType, MetricResult types for all measurers
- ToolMapping interface for tool configuration
- runTool function for executing language tools (tsc, mypy, eslint, etc.)

**Blockers:** None

**Ready for:** 02-02 (Type Strictness Measurer), 02-03 (Lint Errors Measurer), 02-04 (Test Coverage Measurer)
