---
phase: 05-remediation
plan: 03
subsystem: remediation
tags: [typescript, cli, commander, auto-fix, eslint, ruff, gofmt, swiftformat, ktlint, rubocop, php-cs-fixer]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: CLI infrastructure, config loading, progress reporting
  - phase: 02-core-metrics
    provides: runTool from runner.ts, linter tool patterns
provides:
  - FIX_TOOLS configuration for all 9 languages
  - runFix function for executing fix tools
  - btar fix command for CLI
affects: [phase-05-remediation, end-user-workflows]

# Tech tracking
tech-stack:
  added: []
  patterns: [fix-tool-delegation, output-parsing]

key-files:
  created:
    - src/core/remediation/fixer.ts
    - src/core/remediation/fixer.test.ts
    - src/commands/fix.ts
  modified:
    - src/cli.ts

key-decisions:
  - "FIX_TOOLS mirrors LINTER_TOOLS structure with --fix flags"
  - "Fix tools return FixResult with success, filesModified, message"
  - "gofmt for Go (not golangci-lint --fix)"
  - "rubocop --autocorrect for Ruby"
  - "php-cs-fixer for PHP (not phpcbf)"

patterns-established:
  - "Fix output parsers extract file counts where possible"
  - "Tool not found returns helpful installation message"
  - "Exit 1 if any fix operation fails"

# Metrics
duration: 7m
completed: 2026-01-17
---

# Phase 05 Plan 03: Fix Command Summary

**Auto-fix command delegating to language-specific fix tools (eslint --fix, ruff --fix, gofmt -w, etc.) for all 9 supported languages**

## Performance

- **Duration:** 7 min
- **Started:** 2026-01-17T22:05:29Z
- **Completed:** 2026-01-17T22:12:34Z
- **Tasks:** 3 (all auto)
- **Files created:** 3
- **Files modified:** 1

## Accomplishments

- FIX_TOOLS configuration for all 9 supported languages
- runFix function for executing fix tools via runTool
- Output parsers extracting file counts from tool output
- btar fix command with --quiet and --language options
- Full test coverage for fixer module (33 tests)

## Task Commits

1. **Task 1: Create fix tool configuration** - `da3a8e6` (feat)
   - Created src/core/remediation/fixer.ts
   - Defined FixTool interface and FixResult type
   - Implemented FIX_TOOLS for all 9 languages
   - Created output parsers for each tool
   - Implemented runFix function with timeout/error handling

2. **Task 2: Create fix command** - `fb7a94f` (feat)
   - Created src/commands/fix.ts
   - Implemented fixCommand with language detection
   - Added --quiet and --language options
   - Wired into cli.ts

3. **Task 3: Add basic fix tests** - `67f1c14` (test)
   - Created src/core/remediation/fixer.test.ts
   - Tests for FIX_TOOLS configuration
   - Tests for all output parsers
   - Tests for runFix error handling

## Files Created

- `src/core/remediation/fixer.ts` (273 lines) - Fix tool execution
  - FixResult interface with success, filesModified, message, tool
  - FixTool interface with tool, command, parseOutput
  - FIX_TOOLS record mapping SupportedLanguage to FixTool
  - Output parsers: parseEslintFixOutput, parseRuffFixOutput, parseGofmtOutput, parseSwiftformatOutput, parseKtlintFormatOutput, parseRubocopFixOutput, parsePhpCsFixerOutput, parseGoogleJavaFormatOutput
  - runFix(language, directory) executing fix and returning FixResult

- `src/commands/fix.ts` (93 lines) - Fix command
  - FixOptions interface with quiet and language options
  - fixCommand detecting languages and running fixes
  - Progress reporting with success/failure per language
  - Exit 1 if any fix fails

- `src/core/remediation/fixer.test.ts` (318 lines) - Fix tests
  - FIX_TOOLS coverage for all 9 languages
  - Output parser unit tests
  - runFix integration tests with mocked runner

## Files Modified

- `src/cli.ts` - Added fix command
  - Import fixCommand from ./commands/fix.js
  - program.command("fix <directory>") with options

## Fix Tools by Language

| Language | Tool | Command |
|----------|------|---------|
| TypeScript | eslint | npx eslint . --fix |
| JavaScript | eslint | npx eslint . --fix |
| Python | ruff | ruff check . --fix |
| Go | gofmt | gofmt -w . |
| Java | google-java-format | google-java-format --replace --glob **/*.java |
| Swift | swiftformat | swiftformat . |
| Kotlin | ktlint | ktlint --format |
| Ruby | rubocop | rubocop --autocorrect |
| PHP | php-cs-fixer | php-cs-fixer fix . |

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Go fixer | gofmt -w | Standard Go formatter, no external deps |
| Ruby fixer | rubocop --autocorrect | Consistent with linter, built-in fix |
| PHP fixer | php-cs-fixer | More popular than phpcbf |
| Java fixer | google-java-format | Opinionated but standard |
| File count reporting | Best effort | Not all tools report file counts |

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward implementation following existing patterns.

## Next Phase Readiness

**Ready for:** 05-04-PLAN.md (Suggest Command) and 05-05-PLAN.md (Ratchet Command)

**Provides for remaining plans:**
- Fix infrastructure can be extended for other remediation features
- Pattern established for remediation commands in CLI

**Blockers:** None

## Requirements Satisfied

- User can run btar fix to auto-fix lint issues
- Fix delegates to language-specific tools (eslint --fix, ruff --fix, etc.)
- Fix reports which files were modified (where available)
- Fix works for all detected languages in project
- Fix module has test coverage for core functionality

---
*Phase: 05-remediation*
*Completed: 2026-01-17*
