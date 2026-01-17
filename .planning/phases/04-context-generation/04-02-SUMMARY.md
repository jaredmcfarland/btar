---
phase: 04-context-generation
plan: 02
subsystem: context
tags: [typescript, pre-commit, yaml, hooks, code-quality]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: SupportedLanguage type, DetectedLanguage interface
provides:
  - generatePreCommitConfig function for YAML generation
  - PreCommitConfig, PreCommitRepo, PreCommitHook types
  - getHooksForLanguage for language-specific hooks
affects: [04-04, 05-remediation]

# Tech tracking
tech-stack:
  added: []
  patterns: [language-hook-mapping, yaml-generation, de-duplication]

key-files:
  created:
    - src/core/context/pre-commit.ts
    - src/core/context/pre-commit.test.ts
  modified: []

key-decisions:
  - "Include base hooks (trailing-whitespace, end-of-file-fixer, check-yaml) for all projects"
  - "De-duplicate repos when multiple languages share same hooks (e.g., prettier for TS+JS)"
  - "Pin all hook versions for reproducibility"

patterns-established:
  - "Language-to-hooks mapping via LANGUAGE_HOOKS constant"
  - "YAML generation using yaml.stringify with consistent formatting"
  - "De-duplication via Set to track added repos"

# Metrics
duration: 3m
completed: 2026-01-17
---

# Phase 04 Plan 02: Pre-commit Config Generator Summary

**Pre-commit configuration generator mapping detected languages to appropriate code quality hooks with YAML output**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-17T21:00:53Z
- **Completed:** 2026-01-17T21:03:51Z
- **Tasks:** 2 (types/mapping + implementation/tests)
- **Files created:** 2

## Accomplishments

- PreCommitHook, PreCommitRepo, PreCommitConfig type definitions
- Hook mappings for all 8 supported languages (TypeScript, JavaScript, Python, Go, Swift, Kotlin, Java, Ruby, PHP)
- generatePreCommitConfig function producing valid YAML
- 15 comprehensive tests covering single/multi-language and edge cases

## Task Commits

1. **Task 1: Types and language mapping** - `af5f3de` (feat)
   - PreCommitHook, PreCommitRepo, PreCommitConfig types
   - LANGUAGE_HOOKS mapping for 8 languages
   - getHooksForLanguage function
   - Well-known repo URLs and stable versions

2. **Task 2: Implementation and tests** - `95801c2` (test)
   - generatePreCommitConfig function
   - 15 tests covering all scenarios
   - YAML validation and hook configuration tests

## Files Created

- `src/core/context/pre-commit.ts` (280 lines) - Pre-commit config generator
  - PreCommitHook, PreCommitRepo, PreCommitConfig interfaces
  - REPO_URLS and REPO_VERSIONS constants
  - getBaseHooks for universal hooks
  - LANGUAGE_HOOKS mapping all 8 languages
  - getHooksForLanguage and generatePreCommitConfig exports

- `src/core/context/pre-commit.test.ts` (267 lines) - Test suite
  - getHooksForLanguage tests for all languages
  - Single language tests (TypeScript, Python)
  - Multiple language tests with de-duplication
  - Empty language array test (base hooks only)
  - YAML output validation tests
  - Hook configuration detail tests

## Language-to-Hook Mappings

| Language | Hooks |
|----------|-------|
| TypeScript | prettier, eslint (with TS plugins) |
| JavaScript | prettier, eslint |
| Python | black, ruff (with --fix), mypy |
| Go | golangci-lint |
| Swift | swiftformat, swiftlint |
| Kotlin | ktlint |
| Java | google-java-format |
| Ruby | rubocop |
| PHP | php-cs-fixer |

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Base hooks | Always include | trailing-whitespace, end-of-file-fixer, check-yaml are universal |
| Repo de-duplication | By URL | Prevents duplicate repos when TS+JS share prettier |
| Version pinning | Explicit versions | Reproducibility across team environments |
| Local hooks | Skip | Placeholder Go fmt not included (needs project-specific config) |

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation and tests completed smoothly.

## Next Phase Readiness

**Provides for subsequent plans:**
- generatePreCommitConfig for CLI command (04-04)
- PreCommitConfig type for output formatting
- Hook mappings for remediation suggestions (Phase 5)

**Blockers:** None

**Ready for:** 04-03 (Claude Code Hooks) or 04-04 (Context CLI Commands)

## Requirements Satisfied

- **CTXT-03** (Pre-commit Config): Generate .pre-commit-config.yaml with language-appropriate hooks

---
*Phase: 04-context-generation*
*Completed: 2026-01-17*
