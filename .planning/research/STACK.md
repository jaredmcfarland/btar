# Stack Research: Cross-Language Code Quality Tooling

**Researched:** 2026-01-15
**Domain:** Static analysis, type checking, linting, formatting, testing, coverage
**Target Languages:** Python, Node/TypeScript, Java, Ruby, PHP, Go, Swift, Objective-C, Android/Kotlin, Flutter/Dart, React Native, Unity/C#
**Confidence:** HIGH for established languages, MEDIUM for edge cases

## Executive Summary

The 2025/2026 standard for cross-language code quality tooling has converged on language-specific best-of-breed tools rather than universal platforms. Each language ecosystem has a dominant toolchain that represents community consensus. The key insight: **universal platforms like SonarQube aggregate results but don't replace language-native tools**.

For BTAR's Foundation Tier metrics, the stack recommendation is:
1. **Type checking:** Language-native tools (mypy/pyright, tsc, etc.) - no universal solution
2. **Linting:** Language-native linters with zero-config options where available
3. **Formatting:** Language-native formatters, enforced via pre-commit hooks
4. **Testing:** Language-native test frameworks with coverage plugins
5. **CI orchestration:** GitHub Actions with pre-commit framework for hooks

**Primary recommendation:** Adopt each language's dominant toolchain; use pre-commit framework to unify hook execution across all languages.

## Cross-Language Tool Mapping

| Metric | Python | Node/TS | Java | Ruby | PHP | Go | Swift | ObjC | Android/Kotlin | Flutter/Dart | React Native | Unity/C# |
|--------|--------|---------|------|------|-----|-----|-------|------|----------------|--------------|--------------|----------|
| **Type checker** | pyright | tsc | javac | Sorbet/Steep | PHPStan | go build | swiftc | clang | kotlinc | dart analyze | tsc | Roslyn |
| **Linter** | ruff | ESLint/Biome | SpotBugs+Checkstyle | RuboCop/Standard | PHPStan+Psalm | golangci-lint | SwiftLint | OCLint+clang | detekt+ktlint | flutter_lints | ESLint | Roslyn Analyzers |
| **Formatter** | ruff format | Biome/Prettier | google-java-format | Standard Ruby | PHP CS Fixer | gofmt | SwiftFormat | clang-format | ktfmt | dart format | Prettier | dotnet format |
| **Test framework** | pytest | Vitest/Jest | JUnit 5 | RSpec | PHPUnit | go test | XCTest | XCTest | JUnit 5 | flutter test | Jest | NUnit |
| **Coverage tool** | pytest-cov | Istanbul/c8 | JaCoCo | SimpleCov | php-code-coverage | go test -cover | Xcode coverage | Xcode coverage | JaCoCo | lcov | Istanbul | coverlet |
| **Property testing** | Hypothesis | fast-check | jqwik | Rantly | Eris | gopter | SwiftCheck | N/A | kotest-property | - | fast-check | FsCheck |

## Per-Language Details

### Python

**Type Checker: pyright (recommended) or mypy**
- **Version:** pyright 1.1.x (current), mypy 1.x
- **Rationale:** Pyright is 3-5x faster than mypy, has better IDE integration (powers Pylance in VS Code), and supports newer typing features first. Mypy remains viable for teams with plugin requirements.
- **2025 Update:** [ty from Astral](https://astral.sh/blog/ty) is emerging (10-60x faster than pyright) but still in beta. Watch for stable release.
- **Configuration:** `pyrightconfig.json` with `"typeCheckingMode": "strict"`
- **Confidence:** HIGH

**Linter + Formatter: ruff**
- **Version:** 0.8.x (current)
- **Rationale:** Ruff is 30-100x faster than flake8+black+isort combined, written in Rust. It's a drop-in replacement with >99.9% Black compatibility. Adopted by pandas, FastAPI, Apache Airflow.
- **Anti-recommendation:** Do NOT use flake8, black, isort, bandit separately. Ruff replaces all of them.
- **Configuration:** `ruff.toml` or `pyproject.toml`
- **Source:** [Astral Ruff Formatter](https://astral.sh/blog/the-ruff-formatter)
- **Confidence:** HIGH

**Test Framework: pytest**
- **Version:** 8.x
- **Rationale:** De facto standard with 800+ plugins, rich fixture system, excellent parallel execution via pytest-xdist.
- **Coverage:** pytest-cov (wraps coverage.py)
- **Property Testing:** Hypothesis
- **Confidence:** HIGH

### Node.js / TypeScript

**Type Checker: TypeScript Compiler (tsc)**
- **Version:** 5.x
- **Rationale:** The only production-grade type checker for TypeScript. No alternatives.
- **Configuration:** `tsconfig.json` with `"strict": true`
- **Confidence:** HIGH

**Linter: ESLint (established) or Biome (emerging)**
- **ESLint Version:** 9.x (flat config format)
- **Biome Version:** 2.x (released June 2025)
- **Rationale:** ESLint remains king for customization and plugin ecosystem. [Biome](https://biomejs.dev/) is 10-25x faster, ships as single binary, and gained type inference in v2.0. For new projects prioritizing speed, Biome is viable. For existing codebases needing plugins, ESLint wins.
- **Configuration:** `eslint.config.mjs` (flat config) or `biome.json`
- **Anti-recommendation:** TSLint is deprecated. Do NOT use.
- **Source:** [Biome vs ESLint 2025](https://medium.com/@harryespant/biome-vs-eslint-the-ultimate-2025-showdown-for-javascript-developers-speed-features-and-3e5130be4a3c)
- **Confidence:** HIGH (ESLint), MEDIUM (Biome - rapidly maturing)

**Formatter: Prettier (established) or Biome**
- **Version:** Prettier 3.x, Biome 2.x
- **Rationale:** Prettier is the standard. Biome can replace both ESLint and Prettier in one tool. Choose based on linter choice.
- **Confidence:** HIGH

**Test Framework: Vitest (modern) or Jest**
- **Vitest Version:** 2.x
- **Rationale:** [Vitest](https://vitest.dev/) is significantly faster (native ES modules, Vite integration), has Jest-compatible API, and is the 2025 default for new projects. Jest remains viable for existing codebases.
- **Coverage:** Built-in (uses Istanbul/c8)
- **Property Testing:** fast-check
- **Confidence:** HIGH

### Java

**Type Checker: javac (built-in)**
- **Rationale:** Java's compiler is the type checker. Additional nullability checking via Error Prone + NullAway.
- **Confidence:** HIGH

**Static Analysis: SpotBugs + Error Prone + Checkstyle**
- **SpotBugs Version:** 4.x
- **Error Prone Version:** 2.x
- **Checkstyle Version:** 10.x
- **Rationale:** Use all three for complementary coverage. [SpotBugs](https://spotbugs.github.io/) finds bug patterns (400+ checks). [Error Prone](https://errorprone.info/) is Google's compiler plugin for compile-time checks. Checkstyle enforces style guide compliance.
- **Configuration:** Combined via Maven/Gradle plugins
- **Source:** [Java Static Analysis Guide](https://www.javacodegeeks.com/2025/10/static-analysis-code-generation-for-java-preventing-bugs-before-they-happen.html)
- **Confidence:** HIGH

**Formatter: google-java-format via Spotless**
- **Version:** google-java-format 1.x, Spotless 6.x
- **Rationale:** google-java-format is non-configurable by design (eliminates bikeshedding). [Spotless](https://github.com/diffplug/spotless) wraps it for Maven/Gradle integration.
- **Anti-recommendation:** Do NOT use IDE formatters alone - they drift.
- **Source:** [Spotless GitHub](https://github.com/diffplug/spotless)
- **Confidence:** HIGH

**Test Framework: JUnit 5**
- **Version:** 5.10.x
- **Coverage:** JaCoCo
- **Property Testing:** jqwik
- **Confidence:** HIGH

### Ruby

**Type Checker: Sorbet (inline annotations) or Steep+RBS (separate files)**
- **Sorbet Version:** Current stable
- **Steep Version:** Current stable
- **Rationale:** [Sorbet](https://sorbet.org/) (from Stripe) embeds type annotations in Ruby code, has strong IDE support. RBS+Steep uses separate .rbs files (Ruby 3 official format). Most teams use Sorbet for app code, RBS for libraries.
- **Configuration:** `sorbet/config` or `Steepfile`
- **Source:** [Sorbet vs RBS](https://betterstack.com/community/guides/scaling-ruby/sorbet-vs-rbs/)
- **Confidence:** MEDIUM (Ruby typing ecosystem still maturing)

**Linter + Formatter: Standard Ruby (recommended) or RuboCop**
- **Standard Ruby Version:** Current
- **Rationale:** [Standard Ruby](https://github.com/standardrb/standard) is zero-config RuboCop - eliminates style debates. Built on RuboCop with opinionated defaults. For teams needing customization, use RuboCop directly.
- **Anti-recommendation:** Avoid separate rubocop + rubocop-performance + rubocop-rails; use Standard with plugins instead.
- **Source:** [StandardRB GitHub](https://github.com/standardrb/standard)
- **Confidence:** HIGH

**Test Framework: RSpec**
- **Version:** 3.x
- **Coverage:** SimpleCov
- **Property Testing:** Rantly
- **Confidence:** HIGH

### PHP

**Static Analysis: PHPStan (recommended) or Psalm**
- **PHPStan Version:** 2.x
- **Psalm Version:** 5.x
- **Rationale:** [PHPStan](https://phpstan.org/) has wider adoption and better documentation. Psalm has stronger taint analysis. Many mature teams run both. PHPStan level 9 (or 10 in v2) for strictness.
- **Configuration:** `phpstan.neon` and/or `psalm.xml`
- **Anti-recommendation:** Do NOT weaken analyzer to quiet errors - use baselines instead.
- **Source:** [PHPStan vs Psalm](https://thephp.cc/articles/psalm-or-phpstan)
- **Confidence:** HIGH

**Formatter: PHP CS Fixer**
- **Version:** 3.x
- **Rationale:** [PHP CS Fixer](https://cs.symfony.com/) is the standard, 214M+ downloads. Built-in rule sets for PER-CS, Symfony, and custom styles.
- **Configuration:** `.php-cs-fixer.php`
- **Confidence:** HIGH

**Test Framework: PHPUnit**
- **Version:** 10.x/11.x
- **Coverage:** php-code-coverage (requires pcov or xdebug extension)
- **Property Testing:** Eris
- **Confidence:** HIGH

### Go

**Type Checker: go build (built-in)**
- **Rationale:** Go's compiler is the type checker. No separate tool needed.
- **Confidence:** HIGH

**Linter: golangci-lint**
- **Version:** 2.x (released March 2025)
- **Rationale:** [golangci-lint](https://golangci-lint.run/) is the de facto standard, aggregates 50+ linters, used by Kubernetes, Prometheus, Terraform. v2 introduces new config structure with `linters.default`.
- **Configuration:** `.golangci.yml` (v2 format)
- **Anti-recommendation:** Do NOT run individual linters separately (staticcheck, errcheck, etc.) - use golangci-lint to aggregate.
- **Source:** [golangci-lint v2 announcement](https://ldez.github.io/blog/2025/03/23/golangci-lint-v2/)
- **Confidence:** HIGH

**Formatter: gofmt/goimports (built-in)**
- **Rationale:** gofmt is built into Go toolchain, non-negotiable formatting. goimports adds import management. golangci-lint v2 adds `golangci-lint fmt` command.
- **Confidence:** HIGH

**Test Framework: go test (built-in)**
- **Coverage:** `go test -coverprofile=coverage.out`
- **Property Testing:** gopter
- **Confidence:** HIGH

### Swift

**Type Checker: swiftc (built-in)**
- **Rationale:** Swift's compiler is the type checker.
- **Confidence:** HIGH

**Linter: SwiftLint**
- **Version:** 0.55.x
- **Rationale:** [SwiftLint](https://github.com/realm/SwiftLint) is the standard, 100+ built-in rules, enforces Swift style guide.
- **Configuration:** `.swiftlint.yml`
- **Source:** [SwiftLint GitHub](https://github.com/realm/SwiftLint)
- **Confidence:** HIGH

**Formatter: SwiftFormat**
- **Version:** 0.54.x
- **Rationale:** [SwiftFormat](https://github.com/nicklockwood/SwiftFormat) complements SwiftLint - SwiftLint lints, SwiftFormat formats. Use both together.
- **Configuration:** `.swiftformat`
- **Best Practice:** Run SwiftFormat as pre-commit hook, SwiftLint in Xcode build phase.
- **Source:** [SwiftFormat GitHub](https://github.com/nicklockwood/SwiftFormat)
- **Confidence:** HIGH

**Test Framework: XCTest**
- **Coverage:** Xcode built-in (enable via scheme settings)
- **Property Testing:** SwiftCheck
- **Confidence:** HIGH

### Objective-C

**Static Analysis: Clang Static Analyzer + OCLint**
- **Rationale:** [Clang Static Analyzer](https://clang-analyzer.llvm.org/) is built into Xcode (Build > Analyze). [OCLint](https://oclint.org/) adds 60+ additional checks for code smells and complexity.
- **Configuration:** OCLint uses `.oclint` config file
- **Note:** Can enable Clang analyzer via OCLint's `-enable-clang-static-analyzer` flag.
- **Source:** [OCLint Documentation](https://oclint-docs.readthedocs.io/en/stable/)
- **Confidence:** MEDIUM (Objective-C tooling less actively developed)

**Formatter: clang-format**
- **Rationale:** Part of LLVM toolchain, works for C/C++/ObjC.
- **Configuration:** `.clang-format`
- **Confidence:** HIGH

**Test Framework: XCTest**
- **Coverage:** Xcode built-in
- **Confidence:** HIGH

### Android / Kotlin

**Type Checker: kotlinc (built-in)**
- **Rationale:** Kotlin's compiler is the type checker.
- **Confidence:** HIGH

**Linter: detekt + ktlint**
- **detekt Version:** 1.23.x
- **ktlint Version:** 1.x
- **Rationale:** [detekt](https://detekt.dev/) is for static analysis (complexity, code smells, design issues). [ktlint](https://pinterest.github.io/ktlint/) is for style enforcement. Use both - they complement each other. detekt can integrate ktlint directly.
- **Configuration:** `detekt.yml` for detekt, `.editorconfig` for ktlint
- **Note:** For Jetpack Compose, add compose-rules plugin.
- **Source:** [detekt GitHub](https://github.com/detekt/detekt)
- **Confidence:** HIGH

**Formatter: ktfmt**
- **Version:** 0.61
- **Rationale:** [ktfmt](https://facebook.github.io/ktfmt/) from Facebook, based on google-java-format philosophy - deterministic, non-configurable. IntelliJ/Android Studio plugin available.
- **Alternative:** ktlint also formats, but ktfmt is more opinionated.
- **Configuration:** Gradle plugin or IDE plugin
- **Source:** [ktfmt GitHub](https://github.com/facebook/ktfmt)
- **Confidence:** HIGH

**Test Framework: JUnit 5**
- **Coverage:** JaCoCo
- **Property Testing:** kotest-property
- **Confidence:** HIGH

### Flutter / Dart

**Type Checker + Linter: dart analyze (built-in)**
- **Rationale:** Dart's analyzer provides both type checking and linting. Configure strictness via `analysis_options.yaml`.
- **Recommended Rules:** `package:flutter_lints` (official) or `package:very_good_analysis` (stricter, 86% of rules)
- **Configuration:** `analysis_options.yaml`
- **Source:** [Flutter Linting Guide](https://dcm.dev/blog/2025/10/21/getting-started-flutter-static-analytics-lints)
- **Confidence:** HIGH

**Formatter: dart format (built-in)**
- **Rationale:** Part of Dart SDK, automatic via `dart format .` or `flutter format .`
- **Confidence:** HIGH

**Test Framework: flutter test**
- **Coverage:** `flutter test --coverage` generates lcov.info
- **Property Testing:** Limited - consider fast-check for Dart
- **Confidence:** HIGH

### React Native

**Same tooling as Node/TypeScript** since React Native is TypeScript/JavaScript:
- **Type Checker:** TypeScript
- **Linter:** ESLint with `eslint-plugin-react-native`
- **Formatter:** Prettier
- **Test Framework:** Jest
- **Coverage:** Istanbul (built into Jest)

**Additional Plugins:**
- `eslint-plugin-react`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-native`

**Configuration:** Use ESLint 9 flat config (`eslint.config.mjs`)
- **Source:** [React Native ESLint 9 Setup](https://dev.to/ajmal_hasan/eslint-prettier-setup-for-latest-react-native-with-typescript-17do)
- **Confidence:** HIGH

### Unity / C#

**Type Checker + Linter: Roslyn Analyzers**
- **Recommended:** Microsoft.Unity.Analyzers (official)
- **Rationale:** [Microsoft.Unity.Analyzers](https://github.com/microsoft/Microsoft.Unity.Analyzers) provides Unity-specific diagnostics and removes inapplicable C# warnings.
- **Additional:** UnityEngineAnalyzer for performance-related checks
- **Configuration:** Via `.editorconfig` or ruleset files
- **Source:** [Unity Roslyn Analyzers](https://docs.unity3d.com/6000.1/Documentation/Manual/roslyn-analyzers.html)
- **Confidence:** HIGH

**Formatter: dotnet format**
- **Rationale:** Part of .NET SDK, uses .editorconfig for configuration.
- **Confidence:** HIGH

**Test Framework: NUnit (Unity standard) or xUnit**
- **Coverage:** coverlet
- **Property Testing:** FsCheck
- **Confidence:** HIGH

## Universal Tools

### CI System: GitHub Actions

**Rationale:** De facto standard for open source, excellent ecosystem of actions, native integration with GitHub.

**Key Actions:**
- `actions/checkout@v4`
- `actions/setup-python@v5`
- `actions/setup-node@v4`
- `actions/setup-java@v4`
- `actions/setup-go@v5`
- `golangci/golangci-lint-action@v4`

### Pre-commit Framework

**Tool:** [pre-commit](https://pre-commit.com/)
**Rationale:** Language-agnostic framework for managing git hooks. Single `.pre-commit-config.yaml` can orchestrate linters/formatters for all languages in a monorepo.

**Key Hooks:**
```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    hooks: [ruff, ruff-format]
  - repo: https://github.com/pre-commit/mirrors-eslint
    hooks: [eslint]
  - repo: https://github.com/golangci/golangci-lint
    hooks: [golangci-lint]
```

**CI Integration:** `pre-commit/action@v3.0.1` for GitHub Actions

**Alternative:** [pre-commit.ci](https://pre-commit.ci/) - dedicated service with auto-fix PRs

### Aggregation Platform: SonarQube (optional)

**Use Case:** Unified dashboard across languages, historical trends, quality gates.

**Rationale:** Useful for enterprise visibility but does NOT replace language-native tools. SonarQube consumes reports from native tools.

**Anti-pattern:** Do NOT rely solely on SonarQube's built-in analysis - it's less comprehensive than native tools.

### Multi-Language Linter Aggregators

**MegaLinter:** Aggregates 50+ linters, useful for polyglot repos. Consider for monorepos with many languages.

**Caution:** Can introduce performance bottlenecks and false positive noise. Native tools are preferred for targeted enforcement.

## What NOT to Use

| Don't Use | Use Instead | Reason |
|-----------|-------------|--------|
| flake8 (Python) | ruff | Ruff is 100x faster, replaces flake8+isort+bandit |
| black (Python) | ruff format | Ruff formatter is 30x faster, >99.9% Black compatible |
| TSLint (TypeScript) | ESLint | TSLint is deprecated since 2019 |
| FindBugs (Java) | SpotBugs | FindBugs abandoned; SpotBugs is active fork |
| Individual Go linters | golangci-lint | golangci-lint aggregates all of them efficiently |
| IDE formatters alone | CI-enforced formatters | IDE formatters drift; CI ensures consistency |
| SonarQube alone | Native tools + SonarQube | SonarQube analysis is less comprehensive |

## Property-Based Testing Libraries

| Language | Library | Notes |
|----------|---------|-------|
| Python | [Hypothesis](https://hypothesis.works/) | Gold standard, 5% of Python devs use it |
| JavaScript/TypeScript | fast-check | Most active JS property testing library |
| Java | jqwik | JUnit 5 native integration |
| Kotlin | kotest-property | Part of Kotest framework |
| Ruby | Rantly | Simple but functional |
| PHP | Eris | Port of QuickCheck |
| Go | gopter | GoDoc maintained |
| Swift | SwiftCheck | Port of QuickCheck |
| Haskell | Hedgehog | Modern alternative to QuickCheck |
| Erlang | PropEr | Free alternative to QuviQ QuickCheck |

## Confidence Assessment

| Recommendation | Confidence | Rationale |
|----------------|------------|-----------|
| Python: ruff + pyright + pytest | HIGH | Industry consensus, verified via PyPI adoption data |
| Node/TS: ESLint/Biome + Vitest | HIGH | ESLint dominant, Biome rapidly maturing |
| Java: SpotBugs + Error Prone + JaCoCo | HIGH | Long-established, Google-backed |
| Ruby: Standard Ruby + RSpec + SimpleCov | HIGH | Community standard |
| PHP: PHPStan + PHP CS Fixer + PHPUnit | HIGH | Documented best practices |
| Go: golangci-lint v2 + go test | HIGH | De facto standard per official docs |
| Swift: SwiftLint + SwiftFormat + XCTest | HIGH | Community standard |
| Objective-C: OCLint + clang-format | MEDIUM | Less active development, but stable |
| Android/Kotlin: detekt + ktfmt + JUnit | HIGH | Well-documented, actively maintained |
| Flutter/Dart: dart analyze + flutter test | HIGH | Official tooling, well-integrated |
| React Native: (same as Node/TS) | HIGH | Standard JS/TS tooling applies |
| Unity/C#: Roslyn Analyzers + NUnit | HIGH | Microsoft-backed official tooling |
| Ruby/PHP type checking | MEDIUM | Ecosystem still maturing |
| Property testing adoption | MEDIUM | Valuable but not yet mainstream in most ecosystems |

## Sources

### Primary (HIGH confidence)
- [Astral Ruff Documentation](https://docs.astral.sh/ruff/)
- [golangci-lint Official](https://golangci-lint.run/)
- [detekt Official](https://detekt.dev/)
- [PHPStan Documentation](https://phpstan.org/user-guide/getting-started)
- [SwiftLint GitHub](https://github.com/realm/SwiftLint)
- [Microsoft.Unity.Analyzers](https://github.com/microsoft/Microsoft.Unity.Analyzers)
- [pre-commit Framework](https://pre-commit.com/)

### Secondary (MEDIUM confidence)
- [Biome vs ESLint Comparison](https://medium.com/@harryespant/biome-vs-eslint-the-ultimate-2025-showdown-for-javascript-developers-speed-features-and-3e5130be4a3c)
- [Sorbet vs RBS](https://betterstack.com/community/guides/scaling-ruby/sorbet-vs-rbs/)
- [Python Type Checkers Comparison](https://medium.com/@asma.shaikh_19478/python-type-checking-mypy-vs-pyright-performance-battle-fce38c8cb874)

### Tertiary (research articles, needs validation)
- [Static Analysis Tools Comparison](https://github.com/analysis-tools-dev/static-analysis)
- [Hypothesis QuickCheck Languages](https://hypothesis.works/articles/quickcheck-in-every-language/)

---

**Research Date:** 2026-01-15
**Valid Until:** 2026-04-15 (3 months - tooling evolves quickly)
