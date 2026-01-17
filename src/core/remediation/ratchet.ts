/**
 * Ratchet Mode - Score Persistence and Regression Detection
 *
 * Enables CI enforcement of "never go backwards" - once a score is achieved,
 * regressions fail the build. This prevents gradual quality degradation.
 *
 * The ratchet score is persisted to `.btar-score` in the project root.
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ScoreResult } from "../scoring.js";

/**
 * Name of the ratchet score file
 */
const RATCHET_FILE = ".btar-score";

/**
 * Persisted ratchet state
 */
export interface RatchetState {
  /** Baseline score that must be maintained or exceeded */
  score: number;
  /** ISO timestamp when this baseline was saved */
  timestamp: string;
  /** Per-dimension breakdown for debugging regressions */
  breakdown: ScoreResult["breakdown"];
}

/**
 * Result of checking for score regression
 */
export interface RatchetResult {
  /** Whether the current score passes the ratchet check */
  passed: boolean;
  /** Human-readable message explaining the result */
  message: string;
  /** Score difference (positive = improvement, negative = regression) */
  delta: number;
}

/**
 * Validate that an object is a valid RatchetState
 */
function isValidRatchetState(obj: unknown): obj is RatchetState {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const state = obj as Record<string, unknown>;

  // Check required fields exist and have correct types
  if (typeof state.score !== "number") {
    return false;
  }

  if (typeof state.timestamp !== "string") {
    return false;
  }

  if (typeof state.breakdown !== "object" || state.breakdown === null) {
    return false;
  }

  const breakdown = state.breakdown as Record<string, unknown>;
  if (
    typeof breakdown.typeStrictness !== "number" ||
    typeof breakdown.lintErrors !== "number" ||
    typeof breakdown.coverage !== "number"
  ) {
    return false;
  }

  return true;
}

/**
 * Load persisted ratchet score from .btar-score file
 *
 * @param directory - Directory containing .btar-score file
 * @returns RatchetState if file exists and is valid, null otherwise
 *
 * @example
 * ```ts
 * const baseline = await loadRatchetScore("/path/to/project");
 * if (baseline) {
 *   console.log(`Baseline score: ${baseline.score}`);
 * } else {
 *   console.log("No baseline score set");
 * }
 * ```
 */
export async function loadRatchetScore(directory: string): Promise<RatchetState | null> {
  const filePath = join(directory, RATCHET_FILE);

  try {
    const content = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(content) as unknown;

    if (!isValidRatchetState(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    // File doesn't exist or can't be read
    return null;
  }
}

/**
 * Save current score as new ratchet baseline
 *
 * @param directory - Directory to save .btar-score file in
 * @param scoreResult - Current score result to persist
 *
 * @example
 * ```ts
 * const score = calculateScore(metrics);
 * await saveRatchetScore("/path/to/project", score);
 * console.log("New baseline saved");
 * ```
 */
export async function saveRatchetScore(directory: string, scoreResult: ScoreResult): Promise<void> {
  const filePath = join(directory, RATCHET_FILE);

  const state: RatchetState = {
    score: scoreResult.score,
    timestamp: new Date().toISOString(),
    breakdown: scoreResult.breakdown,
  };

  const content = JSON.stringify(state, null, 2);
  await writeFile(filePath, content, "utf-8");
}

/**
 * Check if current score represents a regression from baseline
 *
 * @param current - Current score result
 * @param baseline - Previously saved ratchet state
 * @returns RatchetResult indicating pass/fail and delta
 *
 * @example
 * ```ts
 * const baseline = await loadRatchetScore(directory);
 * if (baseline) {
 *   const result = checkRatchetRegression(currentScore, baseline);
 *   if (!result.passed) {
 *     console.error(result.message);
 *     process.exit(1);
 *   }
 * }
 * ```
 */
export function checkRatchetRegression(current: ScoreResult, baseline: RatchetState): RatchetResult {
  const delta = current.score - baseline.score;

  if (delta > 0) {
    return {
      passed: true,
      delta,
      message: `Score improved: ${current.score} (was ${baseline.score}, +${delta})`,
    };
  }

  if (delta === 0) {
    return {
      passed: true,
      delta: 0,
      message: `Score maintained at ${current.score}`,
    };
  }

  // Regression detected
  return {
    passed: false,
    delta,
    message: `Score regression: ${current.score} < ${baseline.score} (${delta} points)`,
  };
}
