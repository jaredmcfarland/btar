---
phase: 02-core-metrics
plan: 03
subsystem: metrics-linting
tags: [eslint, ruff, golangci-lint, linting, json-parsing]
dependency-graph:
  requires: [02-01]
  provides: [lint-error-measurement]
  affects: [02-05]
tech-stack:
  added: []
  patterns: [json-parser-per-tool, tool-mapping]
key-files:
  created:
    - src/core/metrics/linter.ts
    - src/core/metrics/linter.test.ts
  modified: []
decisions:
  - id: json-output-format
    choice: Use JSON output format for all linters that support it
    rationale: Reliable parsing vs regex on text output
  - id: swiftlint-errors-only
    choice: Count only errors, not warnings for SwiftLint
    rationale: Consistent with other tools that distinguish severity
metrics:
  duration: 2m
  completed: 2026-01-17
---

# Phase 02 Plan 03: Lint Errors Measurer Summary

**One-liner:** measureLintErrors with LINTER_TOOLS mapping for 9 languages, JSON parsers for eslint/ruff/golangci-lint/swiftlint/ktlint/rubocop/phpcs and XML parser for checkstyle.

## What Was Built

- **src/core/metrics/linter.ts**: Lint error measurement
  - `LINTER_TOOLS` constant: Maps all 9 SupportedLanguage values to linter config
  - `measureLintErrors(language, directory)`: Main function returning MetricResult
  - Per-tool JSON parsers: parseEslintJson, parseRuffJson, parseGolangciLintJson, parseSwiftlintJson, parseKtlintJson, parseRubocopJson, parsePhpcsJson
  - XML parser: parseCheckstyleOutput (for Java checkstyle)
  - Edge cases: tool not found (exit 127), timeout, invalid JSON, empty output

- **src/core/metrics/linter.test.ts**: 49 tests
  - LINTER_TOOLS mapping tests for all 9 languages
  - Unit tests for each parser with realistic sample output
  - Integration tests for measureLintErrors with mocked runner
  - Edge case coverage: tool not found, timeout, invalid JSON, clean project

## Linter Tool Mapping

| Language   | Tool          | Output Format | Parser                   |
|------------|---------------|---------------|--------------------------|
| typescript | eslint        | JSON          | parseEslintJson          |
| javascript | eslint        | JSON          | parseEslintJson          |
| python     | ruff          | JSON          | parseRuffJson            |
| go         | golangci-lint | JSON          | parseGolangciLintJson    |
| java       | checkstyle    | XML           | parseCheckstyleOutput    |
| swift      | swiftlint     | JSON          | parseSwiftlintJson       |
| kotlin     | ktlint        | JSON          | parseKtlintJson          |
| ruby       | rubocop       | JSON          | parseRubocopJson         |
| php        | phpcs         | JSON          | parsePhpcsJson           |

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Output format | JSON where available | Reliable parsing, structured data |
| SwiftLint counting | Errors only (not warnings) | Severity distinction consistency |
| Parser return on failure | -1 | Distinguishes parse failure from 0 errors |
| Timeout | 120 seconds | Linting large codebases can be slow |

## Verification Results

| Check | Status |
|-------|--------|
| npm run build | Pass |
| npm test (linter.test.ts) | Pass (49/49) |
| measureLintErrors handles all 9 languages | Pass |
| JSON parsing tested with realistic output | Pass |
| Tool-not-found handled gracefully | Pass |

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| c79fcdc | feat | implement lint error measurement |
| 14f47f9 | test | add linter measurement tests |

## Next Phase Readiness

**Provides for subsequent plans:**
- `measureLintErrors` function for 02-05 (Report Generation)
- `LINTER_TOOLS` mapping for any future linter-related features

**Blockers:** None

**Ready for:** 02-04 (Test Coverage Measurer), 02-05 (Report Generation)
