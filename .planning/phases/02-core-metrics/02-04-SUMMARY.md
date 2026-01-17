---
phase: 02-core-metrics
plan: 04
subsystem: metrics-coverage
tags: [typescript, testing, coverage, c8, pytest-cov, go]
dependency-graph:
  requires: [02-01]
  provides: [coverage-measurer]
  affects: [02-05]
tech-stack:
  added: []
  patterns: [parser-factory, tool-mapping]
key-files:
  created:
    - src/core/metrics/coverage.ts
    - src/core/metrics/coverage.test.ts
  modified: []
decisions:
  - id: go-coverage-averaging
    choice: Average coverage across multiple packages
    rationale: Go test reports per-package coverage; averaging gives project-level view
  - id: coverage-timeout
    choice: 120000ms (2 minutes)
    rationale: Coverage runs tests which can be slow in larger projects
metrics:
  duration: 5m
  completed: 2026-01-17
---

# Phase 02 Plan 04: Test Coverage Summary

**One-liner:** Coverage measurement via c8 (TS/JS), pytest-cov (Python), go test (Go) with per-tool parsing and extended timeout.

## What Was Built

- **src/core/metrics/coverage.ts**: Coverage measurement implementation
  - `CoverageTool` interface: tool config with parser function
  - `COVERAGE_TOOLS` mapping: 9 languages to coverage tools
  - `parseC8Coverage`: Parses "All files" line from c8/nyc
  - `parsePytestCoverage`: Parses "TOTAL" line from pytest-cov
  - `parseGoCoverage`: Averages coverage across Go packages
  - `parseGenericCoverage`: Fallback for Java, Kotlin, Swift, Ruby, PHP
  - `measureCoverage`: Async function returning MetricResult (0-100%)

- **src/core/metrics/coverage.test.ts**: 26 tests (289 lines)
  - Tool mapping tests for all 9 languages
  - Parser unit tests with realistic sample output
  - measureCoverage integration tests with mocked runner

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Go multi-package | Average percentages | Fair representation of overall coverage |
| Timeout | 120s (vs 60s default) | Coverage must run tests, can be slow |
| Tool not found | Return -1 with success: false | Distinguishes unavailable from 0% |
| Value clamping | Math.min(100, Math.max(0, value)) | Defensive against parsing edge cases |

## Coverage Tool Commands

| Language | Tool | Command |
|----------|------|---------|
| TypeScript | c8 | npx c8 --reporter=text-summary npm test |
| JavaScript | c8 | npx c8 --reporter=text-summary npm test |
| Python | pytest-cov | pytest --cov=. --cov-report=term-missing -q |
| Go | go test | go test -cover ./... |
| Java | jacoco | mvn test jacoco:report |
| Kotlin | jacoco | ./gradlew test jacocoTestReport |
| Swift | swift test | swift test --enable-code-coverage |
| Ruby | simplecov | bundle exec rspec --format progress |
| PHP | phpunit | ./vendor/bin/phpunit --coverage-text |

## Verification Results

| Check | Status |
|-------|--------|
| npm run build | Pass |
| npm test | Pass (135 tests, 26 coverage) |
| measureCoverage for TS/JS | Pass |
| measureCoverage for Python | Pass |
| measureCoverage for Go | Pass |
| Extended timeout (120s) | Pass |
| Percentage parsing tested | Pass |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Go coverage multi-package parsing**
- **Found during:** Task 2 (test revealed first-match behavior)
- **Issue:** Original parser took first package coverage instead of averaging
- **Fix:** Changed to use matchAll and average all package percentages
- **Files modified:** src/core/metrics/coverage.ts
- **Commit:** 19c2193 (included in test commit)

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 742e805 | feat | implement coverage measurement |
| 19c2193 | test | add coverage measurement tests |

## Next Phase Readiness

**Provides for subsequent plans:**
- measureCoverage function for test_coverage metric
- CoverageTool interface for extending coverage support
- COVERAGE_TOOLS mapping for all 9 supported languages

**Blockers:** None

**Ready for:** 02-05 (Metrics Aggregator)
