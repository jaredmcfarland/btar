/**
 * Tier-Based Recommendations Engine
 *
 * Generates actionable, prioritized recommendations based on Agent-Readiness Score
 */

import type { ScoreResult } from "../scoring.js";
import type { MetricsReport } from "../metrics/index.js";

/**
 * Priority tier for recommendations
 */
export type RecommendationTier = "P0" | "P1" | "P2" | "P3";

/**
 * Category of recommendation
 */
export type RecommendationCategory =
  | "type-strictness"
  | "lint-errors"
  | "test-coverage"
  | "general";

/**
 * Impact level of implementing the recommendation
 */
export type RecommendationImpact = "high" | "medium" | "low";

/**
 * A single actionable recommendation
 */
export interface Recommendation {
  /** Priority tier (P0 = highest) */
  tier: RecommendationTier;
  /** Category of the recommendation */
  category: RecommendationCategory;
  /** Human-readable recommendation message */
  message: string;
  /** Impact level of implementing this recommendation */
  impact: RecommendationImpact;
  /** Optional tool command suggestion */
  tool?: string;
}

/**
 * Generate tier-based recommendations from score and metrics
 *
 * @param scoreResult - The calculated score result
 * @param report - The metrics report with detailed measurements
 * @returns Array of recommendations ordered by priority
 */
export function generateRecommendations(
  _scoreResult: ScoreResult,
  _report: MetricsReport
): Recommendation[] {
  // TODO: Implement tier-based recommendation logic
  throw new Error("Not implemented");
}
