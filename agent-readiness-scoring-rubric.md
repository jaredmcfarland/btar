# Agent-Readiness Scoring Rubric

**Purpose:** Systematically assess how effectively AI coding agents can operate in a given repository.

**Core Principle:** Agent effectiveness is bounded by verification quality, not AI capability. This rubric measures the "verification ceiling" of a codebase.

---

## Scoring Overview

| Category | Weight | Max Points |
|----------|--------|------------|
| **Verification Speed** | 25% | 25 |
| **Verification Quality** | 35% | 35 |
| **Test Infrastructure** | 25% | 25 |
| **Context & Documentation** | 15% | 15 |
| **Total** | 100% | 100 |

**Interpretation:**
- **80-100:** Agent-ready. High-confidence autonomous operation.
- **60-79:** Agent-assisted. Effective with human review checkpoints.
- **40-59:** Agent-limited. Significant gaps create blind spots.
- **0-39:** Agent-hostile. Major infrastructure investment needed.

---

## Category 1: Verification Speed (25 points)

*How quickly can an agent get feedback on its work?*

### 1.1 CI Feedback Time (10 points)

Time from commit push to full validation result (tests + lint + type check).

| Metric | Points | Rationale |
|--------|--------|-----------|
| < 3 minutes | 10 | Enables rapid iteration cycles |
| 3-5 minutes | 8 | Acceptable for most workflows |
| 5-10 minutes | 5 | Noticeable friction |
| 10-15 minutes | 2 | Significant iteration penalty |
| > 15 minutes | 0 | Prohibitive for agent loops |

**How to measure:**
```bash
# Check recent CI runs in GitHub Actions / CircleCI / etc.
# Measure wall-clock time from trigger to completion
```

### 1.2 Flaky Test Rate (8 points)

Percentage of test runs that fail intermittently without code changes.

| Metric | Points | Rationale |
|--------|--------|-----------|
| < 0.5% | 8 | Near-deterministic feedback |
| 0.5-1% | 6 | Occasional noise |
| 1-3% | 3 | Agents learn wrong lessons |
| 3-5% | 1 | Significant trust erosion |
| > 5% | 0 | Feedback signal destroyed |

**How to measure:**
```bash
# Run test suite 10+ times on unchanged code
# Count runs with failures / total runs
# Or check CI history for "re-run" patterns
```

### 1.3 CI Green Rate on Main (7 points)

Percentage of commits to main branch with passing CI.

| Metric | Points | Rationale |
|--------|--------|-----------|
| > 98% | 7 | Agent can trust baseline |
| 95-98% | 5 | Occasional noise |
| 90-95% | 3 | Baseline unreliable |
| 80-90% | 1 | Significant noise |
| < 80% | 0 | Cannot distinguish agent failures |

**How to measure:**
```bash
# Check CI dashboard for last 50-100 commits to main
# Count green builds / total builds
```

---

## Category 2: Verification Quality (35 points)

*When tests pass, does that actually mean the code is correct?*

### 2.1 Mutation Score (15 points)

Percentage of code mutations detected by test suite.

| Metric | Points | Rationale |
|--------|--------|-----------|
| > 85% | 15 | Tests catch subtle logic errors |
| 75-85% | 12 | Strong verification |
| 60-75% | 8 | Moderate gaps |
| 40-60% | 4 | Significant blind spots |
| < 40% | 0 | Tests provide false confidence |

**How to measure:**
```bash
# Python
pip install mutmut
mutmut run --paths-to-mutate=src/

# JavaScript/TypeScript
npm install -g stryker-cli
stryker run
```

**Why this matters most:** Mutation testing answers "if an agent makes a subtle logic error, will tests catch it?" This is THE question for agent safety.

### 2.2 Type Coverage - Strict Mode (12 points)

Percentage of code passing strict type checking.

| Metric | Points | Rationale |
|--------|--------|-----------|
| 100% strict | 12 | Full compile-time verification |
| > 95% strict | 9 | Near-complete coverage |
| 80-95% strict | 6 | Significant gaps |
| Basic typing only | 3 | Some type safety |
| No type checking | 0 | Agents hallucinate types |

**How to measure:**
```bash
# Python
mypy --strict src/ 2>&1 | grep -c "error:"
# Target: 0 errors

# TypeScript
npx tsc --strict --noEmit 2>&1 | grep -c "error"
# Target: 0 errors

# Swift
# Enabled by default in Xcode

# Kotlin
# Configure kotlin.code.style=official
```

### 2.3 Lint Errors on Main (8 points)

Number of linter violations on main branch.

| Metric | Points | Rationale |
|--------|--------|-----------|
| 0 errors | 8 | Binary pass/fail signal |
| 1-5 errors | 5 | Minor noise |
| 6-20 errors | 2 | Ambiguous standards |
| > 20 errors | 0 | No enforceable standard |

**How to measure:**
```bash
# Python
ruff check src/ --statistics

# JavaScript/TypeScript
eslint src/ --format compact | wc -l

# Swift
swiftlint lint --reporter summary

# Kotlin
./gradlew detekt
```

---

## Category 3: Test Infrastructure (25 points)

*Does the test suite cover what matters?*

### 3.1 Line/Branch Coverage (8 points)

Percentage of code lines/branches executed by tests.

| Metric | Points | Rationale |
|--------|--------|-----------|
| > 90% | 8 | Comprehensive execution |
| 80-90% | 6 | Good coverage |
| 60-80% | 4 | Moderate gaps |
| 40-60% | 2 | Significant gaps |
| < 40% | 0 | Minimal coverage |

**How to measure:**
```bash
# Python
pytest --cov=src/ --cov-report=term-missing

# JavaScript/TypeScript
jest --coverage

# Swift
xcodebuild test -enableCodeCoverage YES

# Kotlin
./gradlew jacocoTestReport
```

### 3.2 Property-Based Tests Present (7 points)

Are critical code paths covered by property-based tests?

| Metric | Points | Rationale |
|--------|--------|-----------|
| PBT on core paths + integration | 7 | Exhaustive edge case coverage |
| PBT on core paths | 5 | Good invariant verification |
| Some PBT present | 3 | Partial coverage |
| No PBT | 0 | Manual edge case identification |

**What to look for:**
```python
# Python - Hypothesis
from hypothesis import given, strategies as st

@given(st.dictionaries(st.text(), st.integers()))
def test_roundtrip(data):
    assert decode(encode(data)) == data
```

```swift
// Swift - SwiftCheck
property("reverse is involutory") <- forAll { (xs: [Int]) in
    xs.reversed().reversed() == xs
}
```

### 3.3 Test Quality Indicators (5 points)

Qualitative assessment of test suite design.

| Indicator | Points |
|-----------|--------|
| Tests verify behavior, not implementation | +1 |
| Tests have clear arrange/act/assert structure | +1 |
| Edge cases explicitly tested | +1 |
| Error paths tested | +1 |
| No mocking of core logic | +1 |

### 3.4 Test Isolation (5 points)

Can tests run independently and in parallel?

| Metric | Points | Rationale |
|--------|--------|-----------|
| Fully parallel, no shared state | 5 | Maximum CI speed |
| Mostly isolated, few dependencies | 3 | Some serialization needed |
| Significant test interdependencies | 1 | Fragile test ordering |
| Tests require specific order | 0 | Cannot parallelize |

---

## Category 4: Context & Documentation (15 points)

*Can an agent understand what it should do?*

### 4.1 Agent Context File (6 points)

Presence and completeness of AGENTS.md / CLAUDE.md / similar.

| Metric | Points | Rationale |
|--------|--------|-----------|
| Complete file with all sections | 6 | Full context available |
| File present, missing sections | 4 | Partial guidance |
| README only | 2 | Human-oriented docs |
| No context documentation | 0 | Agent must infer everything |

**Required sections for full points:**
- [ ] Build commands
- [ ] Test commands  
- [ ] Lint commands
- [ ] Architecture overview
- [ ] Code style conventions
- [ ] Common pitfalls / constraints

### 4.2 Public API Documentation (5 points)

Coverage and quality of docstrings/comments on public interfaces.

| Metric | Points | Rationale |
|--------|--------|-----------|
| > 95% with examples | 5 | Agents infer behavior from docs |
| > 80% coverage | 3 | Most functions documented |
| > 50% coverage | 1 | Partial documentation |
| < 50% coverage | 0 | Agents must read implementation |

**How to measure:**
```bash
# Python
interrogate src/ -v  # Measures docstring coverage

# JavaScript/TypeScript
# Check for JSDoc comments on exports

# Swift/Kotlin
# Check for /// documentation comments
```

### 4.3 Type Hints as Documentation (4 points)

Do type signatures communicate intent?

| Metric | Points | Rationale |
|--------|--------|-----------|
| Rich types (Literal, TypedDict, Union, generics) | 4 | Self-documenting signatures |
| Basic types on all public APIs | 2 | Minimal type documentation |
| Incomplete or Any types | 0 | Types don't communicate |

**Good example:**
```python
def track(
    event_name: str,
    properties: dict[str, str | int | float | bool | None],
    *,
    distinct_id: str,
    timestamp: datetime | None = None
) -> TrackResponse:
```

**Bad example:**
```python
def track(event_name, properties, **kwargs) -> Any:
```

---

## Assessment Worksheet

### Repository: ________________
### Date: ________________
### Assessed by: ________________

| Metric | Score | Max | Notes |
|--------|-------|-----|-------|
| **Verification Speed** | | **25** | |
| 1.1 CI Feedback Time | | 10 | Time: _____ min |
| 1.2 Flaky Test Rate | | 8 | Rate: _____% |
| 1.3 CI Green Rate | | 7 | Rate: _____% |
| **Verification Quality** | | **35** | |
| 2.1 Mutation Score | | 15 | Score: _____% |
| 2.2 Type Coverage (Strict) | | 12 | Coverage: _____% |
| 2.3 Lint Errors on Main | | 8 | Count: _____ |
| **Test Infrastructure** | | **25** | |
| 3.1 Line/Branch Coverage | | 8 | Coverage: _____% |
| 3.2 Property-Based Tests | | 7 | Present: Y/N |
| 3.3 Test Quality | | 5 | Checklist: ___/5 |
| 3.4 Test Isolation | | 5 | Parallel: Y/N |
| **Context & Documentation** | | **15** | |
| 4.1 Agent Context File | | 6 | Present: Y/N |
| 4.2 API Documentation | | 5 | Coverage: _____% |
| 4.3 Type Hints Quality | | 4 | Rich types: Y/N |
| **TOTAL** | | **100** | |

---

## Priority Actions by Score Range

### Score 0-39: Foundation Building
1. **First:** Establish CI pipeline with lint + type check + tests
2. **Second:** Add strict type checking, resolve all errors
3. **Third:** Achieve 0 lint errors on main

### Score 40-59: Quality Improvement  
1. **First:** Introduce mutation testing, target 60%+ score
2. **Second:** Add property-based tests to core paths
3. **Third:** Create AGENTS.md with build/test/lint commands

### Score 60-79: Optimization
1. **First:** Raise mutation score to 80%+
2. **Second:** Reduce CI time to < 5 minutes
3. **Third:** Eliminate flaky tests (< 1%)

### Score 80+: Maintenance
1. **First:** Add mutation score to CI as quality gate
2. **Second:** Expand property-based test coverage
3. **Third:** Ratchet metrics (only allow improvements)

---

## Language-Specific Tool Reference

### Python
| Category | Tool |
|----------|------|
| Type Checker | `mypy --strict` |
| Linter | `ruff` |
| Test Runner | `pytest` |
| Coverage | `pytest-cov` |
| Mutation | `mutmut` |
| Property Testing | `hypothesis` |
| Doc Coverage | `interrogate` |

### TypeScript/JavaScript
| Category | Tool |
|----------|------|
| Type Checker | `tsc --strict` |
| Linter | `eslint` + `prettier` |
| Test Runner | `jest` or `vitest` |
| Coverage | Built into jest/vitest |
| Mutation | `stryker` |
| Property Testing | `fast-check` |

### Swift (iOS)
| Category | Tool |
|----------|------|
| Type Checker | Built into Swift compiler |
| Linter | `swiftlint` |
| Test Runner | `XCTest` |
| Coverage | Xcode built-in |
| Mutation | `muter` |
| Property Testing | `SwiftCheck` |

### Kotlin (Android)
| Category | Tool |
|----------|------|
| Type Checker | Built into Kotlin compiler |
| Linter | `detekt` or `ktlint` |
| Test Runner | JUnit |
| Coverage | `jacoco` |
| Mutation | `pitest` |
| Property Testing | `kotest` |

---

## Appendix: The Verifier's Rule

This rubric is grounded in Jason Wei's Verifier's Rule:

> "The ease of training AI to solve a task is proportional to how verifiable the task is."

The five properties of high verifiability that this rubric measures:

1. **Objective truth** → Type checking, lint rules (binary pass/fail)
2. **Fast to verify** → CI feedback time
3. **Scalable to verify** → Test parallelization, CI infrastructure
4. **Low noise** → Flaky test rate, CI green rate
5. **Continuous reward** → Mutation score, coverage metrics

Investing in verification infrastructure is investing in AI agent effectiveness. The bottleneck is not AI capability—it's your ability to verify AI output.
