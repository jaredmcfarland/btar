/**
 * Remediation Module
 * Barrel export for recommendation, auto-fix, and ratchet functionality
 */

export {
  generateRecommendations,
  type Recommendation,
  type RecommendationTier,
  type RecommendationCategory,
  type RecommendationImpact,
} from "./recommendations.js";

export {
  loadRatchetScore,
  saveRatchetScore,
  checkRatchetRegression,
  type RatchetState,
  type RatchetResult,
} from "./ratchet.js";

export { runFix, FIX_TOOLS } from "./fixer.js";
export type { FixResult } from "./fixer.js";
