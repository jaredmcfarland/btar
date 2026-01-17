/**
 * Recommendations Engine Tests
 *
 * TDD tests for tier-based recommendation generation
 */

import { describe, it, expect } from "vitest";
import {
  generateRecommendations,
  type Recommendation,
  type RecommendationTier,
} from "./recommendations.js";
import type { ScoreResult } from "../scoring.js";
import type { MetricsReport } from "../metrics/index.js";
import type { DetectedLanguage } from "../types.js";

/**
 * Helper to create a ScoreResult for testing
 */
function createScoreResult(
  score: number,
  interpretation: "excellent" | "good" | "needs-work" | "poor"
): ScoreResult {
  // Calculate breakdown to roughly match the score
  const typeStrictness = Math.min(30, Math.round(score * 0.3));
  const lintErrors = Math.min(30, Math.round(score * 0.3));
  const coverage = Math.max(0, score - typeStrictness - lintErrors);

  return {
    score,
    breakdown: {
      typeStrictness,
      lintErrors,
      coverage,
    },
    interpretation,
  };
}

/**
 * Helper to create a MetricsReport for testing
 */
function createReport(options: {
  typeErrors: number;
  lintErrors: number;
  coverage: number;
  hasCoverage?: boolean;
}): MetricsReport {
  const { typeErrors, lintErrors, coverage, hasCoverage = true } = options;

  const lang: DetectedLanguage = {
    language: "typescript",
    confidence: "high",
    markers: ["tsconfig.json"],
  };

  return {
    languages: [lang],
    metrics: {
      typeStrictness: new Map([
        [
          "typescript",
          {
            metric: "type_strictness",
            tool: "tsc",
            value: typeErrors,
            success: true,
          },
        ],
      ]),
      lintErrors: new Map([
        [
          "typescript",
          {
            metric: "lint_errors",
            tool: "eslint",
            value: lintErrors,
            success: true,
          },
        ],
      ]),
      coverage: new Map([
        [
          "typescript",
          {
            metric: "test_coverage",
            tool: "c8",
            value: hasCoverage ? coverage : -1,
            success: hasCoverage,
          },
        ],
      ]),
    },
    summary: {
      totalTypeErrors: typeErrors,
      totalLintErrors: lintErrors,
      averageCoverage: hasCoverage ? coverage : 0,
    },
  };
}

describe("generateRecommendations", () => {
  describe("Recommendation structure", () => {
    it("returns array of Recommendation objects", () => {
      const scoreResult = createScoreResult(75, "good");
      const report = createReport({ typeErrors: 5, lintErrors: 10, coverage: 70 });

      const recommendations = generateRecommendations(scoreResult, report);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it("each Recommendation has required fields", () => {
      const scoreResult = createScoreResult(60, "needs-work");
      const report = createReport({ typeErrors: 10, lintErrors: 20, coverage: 50 });

      const recommendations = generateRecommendations(scoreResult, report);

      for (const rec of recommendations) {
        expect(rec).toHaveProperty("tier");
        expect(rec).toHaveProperty("category");
        expect(rec).toHaveProperty("message");
        expect(rec).toHaveProperty("impact");

        expect(["P0", "P1", "P2", "P3"]).toContain(rec.tier);
        expect(["type-strictness", "lint-errors", "test-coverage", "general"]).toContain(
          rec.category
        );
        expect(["high", "medium", "low"]).toContain(rec.impact);
        expect(typeof rec.message).toBe("string");
        expect(rec.message.length).toBeGreaterThan(0);
      }
    });

    it("tool field is optional but string when present", () => {
      const scoreResult = createScoreResult(60, "needs-work");
      const report = createReport({ typeErrors: 10, lintErrors: 20, coverage: 50 });

      const recommendations = generateRecommendations(scoreResult, report);

      for (const rec of recommendations) {
        if (rec.tool !== undefined) {
          expect(typeof rec.tool).toBe("string");
        }
      }
    });
  });

  describe("excellent tier (score 90+)", () => {
    it("provides maintenance recommendations", () => {
      const scoreResult = createScoreResult(95, "excellent");
      const report = createReport({ typeErrors: 0, lintErrors: 0, coverage: 95 });

      const recommendations = generateRecommendations(scoreResult, report);

      expect(recommendations.length).toBeGreaterThan(0);
      // Should suggest advanced practices, not fixes
      const hasMaintenanceRec = recommendations.some(
        (r) =>
          r.message.toLowerCase().includes("excellent") ||
          r.message.toLowerCase().includes("maintain") ||
          r.message.toLowerCase().includes("consider")
      );
      expect(hasMaintenanceRec).toBe(true);
    });

    it("suggests advanced metrics for perfect scores", () => {
      const scoreResult = createScoreResult(100, "excellent");
      const report = createReport({ typeErrors: 0, lintErrors: 0, coverage: 100 });

      const recommendations = generateRecommendations(scoreResult, report);

      // Should suggest property-based tests or similar advanced practices
      const hasAdvancedRec = recommendations.some(
        (r) =>
          r.message.toLowerCase().includes("property") ||
          r.message.toLowerCase().includes("mutation") ||
          r.message.toLowerCase().includes("benchmark")
      );
      expect(hasAdvancedRec).toBe(true);
    });

    it("uses low impact ratings for suggestions", () => {
      const scoreResult = createScoreResult(92, "excellent");
      const report = createReport({ typeErrors: 0, lintErrors: 2, coverage: 90 });

      const recommendations = generateRecommendations(scoreResult, report);

      // Most recommendations should be low impact (optional improvements)
      const lowImpactCount = recommendations.filter((r) => r.impact === "low").length;
      expect(lowImpactCount).toBeGreaterThanOrEqual(recommendations.length / 2);
    });
  });

  describe("good tier (score 70-89)", () => {
    it("suggests fixing remaining errors", () => {
      const scoreResult = createScoreResult(75, "good");
      const report = createReport({ typeErrors: 5, lintErrors: 10, coverage: 70 });

      const recommendations = generateRecommendations(scoreResult, report);

      // Should have recommendations for type and lint errors
      const hasTypeRec = recommendations.some((r) => r.category === "type-strictness");
      const hasLintRec = recommendations.some((r) => r.category === "lint-errors");

      expect(hasTypeRec).toBe(true);
      expect(hasLintRec).toBe(true);
    });

    it("includes specific error counts in messages", () => {
      const scoreResult = createScoreResult(78, "good");
      const report = createReport({ typeErrors: 7, lintErrors: 15, coverage: 75 });

      const recommendations = generateRecommendations(scoreResult, report);

      // Messages should reference actual error counts
      const hasSpecificCount = recommendations.some(
        (r) => r.message.includes("7") || r.message.includes("15")
      );
      expect(hasSpecificCount).toBe(true);
    });

    it("suggests improving coverage if below 80%", () => {
      const scoreResult = createScoreResult(72, "good");
      const report = createReport({ typeErrors: 0, lintErrors: 5, coverage: 65 });

      const recommendations = generateRecommendations(scoreResult, report);

      const hasCoverageRec = recommendations.some((r) => r.category === "test-coverage");
      expect(hasCoverageRec).toBe(true);
    });
  });

  describe("needs-work tier (score 50-69)", () => {
    it("prioritizes type errors (P0)", () => {
      const scoreResult = createScoreResult(55, "needs-work");
      const report = createReport({ typeErrors: 20, lintErrors: 30, coverage: 40 });

      const recommendations = generateRecommendations(scoreResult, report);

      // First recommendation should be about type errors
      const typeRecs = recommendations.filter((r) => r.category === "type-strictness");
      expect(typeRecs.length).toBeGreaterThan(0);
      expect(typeRecs[0].tier).toBe("P0");
    });

    it("treats lint errors as P1", () => {
      const scoreResult = createScoreResult(58, "needs-work");
      const report = createReport({ typeErrors: 15, lintErrors: 40, coverage: 45 });

      const recommendations = generateRecommendations(scoreResult, report);

      const lintRecs = recommendations.filter((r) => r.category === "lint-errors");
      expect(lintRecs.length).toBeGreaterThan(0);
      expect(lintRecs[0].tier).toBe("P1");
    });

    it("treats coverage as P2", () => {
      const scoreResult = createScoreResult(52, "needs-work");
      const report = createReport({ typeErrors: 25, lintErrors: 50, coverage: 30 });

      const recommendations = generateRecommendations(scoreResult, report);

      const coverageRecs = recommendations.filter((r) => r.category === "test-coverage");
      expect(coverageRecs.length).toBeGreaterThan(0);
      expect(coverageRecs[0].tier).toBe("P2");
    });

    it("uses high impact ratings", () => {
      const scoreResult = createScoreResult(55, "needs-work");
      const report = createReport({ typeErrors: 20, lintErrors: 40, coverage: 35 });

      const recommendations = generateRecommendations(scoreResult, report);

      // Most recommendations should be high impact
      const highImpactCount = recommendations.filter((r) => r.impact === "high").length;
      expect(highImpactCount).toBeGreaterThan(0);
    });
  });

  describe("poor tier (score <50)", () => {
    it("focuses on foundation first", () => {
      const scoreResult = createScoreResult(30, "poor");
      const report = createReport({ typeErrors: 100, lintErrors: 200, coverage: 10 });

      const recommendations = generateRecommendations(scoreResult, report);

      // Should have foundational recommendations
      const hasFoundationRec = recommendations.some(
        (r) =>
          r.message.toLowerCase().includes("foundation") ||
          r.message.toLowerCase().includes("set up") ||
          r.message.toLowerCase().includes("add") ||
          r.tier === "P0"
      );
      expect(hasFoundationRec).toBe(true);
    });

    it("recommends setting up type checking if many errors", () => {
      const scoreResult = createScoreResult(25, "poor");
      const report = createReport({ typeErrors: 150, lintErrors: 100, coverage: 5 });

      const recommendations = generateRecommendations(scoreResult, report);

      const typeRecs = recommendations.filter((r) => r.category === "type-strictness");
      expect(typeRecs.length).toBeGreaterThan(0);
      expect(typeRecs[0].tier).toBe("P0");
      expect(typeRecs[0].impact).toBe("high");
    });

    it("recommends linter setup if many lint errors", () => {
      const scoreResult = createScoreResult(35, "poor");
      const report = createReport({ typeErrors: 50, lintErrors: 200, coverage: 15 });

      const recommendations = generateRecommendations(scoreResult, report);

      const lintRecs = recommendations.filter((r) => r.category === "lint-errors");
      expect(lintRecs.length).toBeGreaterThan(0);
    });

    it("defers coverage improvements until basics fixed", () => {
      const scoreResult = createScoreResult(28, "poor");
      const report = createReport({ typeErrors: 100, lintErrors: 150, coverage: 5 });

      const recommendations = generateRecommendations(scoreResult, report);

      const coverageRecs = recommendations.filter((r) => r.category === "test-coverage");
      // Coverage should be P3 (low priority) when score is poor
      if (coverageRecs.length > 0) {
        expect(coverageRecs[0].tier).toBe("P3");
      }
    });
  });

  describe("ordering", () => {
    it("orders recommendations by tier (P0 first)", () => {
      const scoreResult = createScoreResult(55, "needs-work");
      const report = createReport({ typeErrors: 20, lintErrors: 40, coverage: 35 });

      const recommendations = generateRecommendations(scoreResult, report);

      const tierOrder: Record<RecommendationTier, number> = {
        P0: 0,
        P1: 1,
        P2: 2,
        P3: 3,
      };

      for (let i = 1; i < recommendations.length; i++) {
        const prevTier = tierOrder[recommendations[i - 1].tier];
        const currTier = tierOrder[recommendations[i].tier];
        expect(currTier).toBeGreaterThanOrEqual(prevTier);
      }
    });

    it("within same tier, orders by impact (high first)", () => {
      const scoreResult = createScoreResult(60, "needs-work");
      const report = createReport({ typeErrors: 15, lintErrors: 25, coverage: 40 });

      const recommendations = generateRecommendations(scoreResult, report);

      const impactOrder: Record<string, number> = {
        high: 0,
        medium: 1,
        low: 2,
      };

      // Group by tier and check impact ordering within each group
      const byTier = new Map<RecommendationTier, Recommendation[]>();
      for (const rec of recommendations) {
        const group = byTier.get(rec.tier) || [];
        group.push(rec);
        byTier.set(rec.tier, group);
      }

      for (const [, group] of byTier) {
        for (let i = 1; i < group.length; i++) {
          const prevImpact = impactOrder[group[i - 1].impact];
          const currImpact = impactOrder[group[i].impact];
          expect(currImpact).toBeGreaterThanOrEqual(prevImpact);
        }
      }
    });
  });

  describe("tool suggestions", () => {
    it("includes tool suggestions for lint fixes when applicable", () => {
      const scoreResult = createScoreResult(75, "good");
      const report = createReport({ typeErrors: 0, lintErrors: 20, coverage: 80 });

      const recommendations = generateRecommendations(scoreResult, report);

      const lintRecs = recommendations.filter((r) => r.category === "lint-errors");
      // At least one lint recommendation should have a tool suggestion
      const hasToolSuggestion = lintRecs.some((r) => r.tool !== undefined);
      expect(hasToolSuggestion).toBe(true);
    });

    it("suggests eslint --fix for typescript/javascript projects", () => {
      const scoreResult = createScoreResult(70, "good");
      const report = createReport({ typeErrors: 0, lintErrors: 15, coverage: 70 });

      const recommendations = generateRecommendations(scoreResult, report);

      const eslintRec = recommendations.find(
        (r) => r.category === "lint-errors" && r.tool?.includes("eslint")
      );
      expect(eslintRec).toBeDefined();
    });
  });

  describe("edge cases", () => {
    it("handles zero errors gracefully", () => {
      const scoreResult = createScoreResult(92, "excellent");
      const report = createReport({ typeErrors: 0, lintErrors: 0, coverage: 92 });

      const recommendations = generateRecommendations(scoreResult, report);

      // Should still return recommendations (maintenance/improvement suggestions)
      expect(recommendations.length).toBeGreaterThan(0);
      // Should not recommend fixing errors that don't exist
      const noFixZeroErrors = recommendations.every(
        (r) => !r.message.toLowerCase().includes("fix 0")
      );
      expect(noFixZeroErrors).toBe(true);
    });

    it("handles missing coverage data", () => {
      const scoreResult = createScoreResult(60, "needs-work");
      const report = createReport({
        typeErrors: 10,
        lintErrors: 20,
        coverage: 0,
        hasCoverage: false,
      });

      const recommendations = generateRecommendations(scoreResult, report);

      // Should recommend adding coverage tooling
      const hasCoverageSetupRec = recommendations.some(
        (r) =>
          r.category === "test-coverage" &&
          (r.message.toLowerCase().includes("set up") ||
            r.message.toLowerCase().includes("add") ||
            r.message.toLowerCase().includes("configure"))
      );
      expect(hasCoverageSetupRec).toBe(true);
    });

    it("returns at least one recommendation for any score", () => {
      const scores = [0, 25, 50, 75, 100];
      const interpretations: Array<"excellent" | "good" | "needs-work" | "poor"> = [
        "poor",
        "poor",
        "needs-work",
        "good",
        "excellent",
      ];

      for (let i = 0; i < scores.length; i++) {
        const scoreResult = createScoreResult(scores[i], interpretations[i]);
        const report = createReport({
          typeErrors: Math.max(0, 100 - scores[i]),
          lintErrors: Math.max(0, 100 - scores[i]),
          coverage: scores[i],
        });

        const recommendations = generateRecommendations(scoreResult, report);
        expect(recommendations.length).toBeGreaterThan(0);
      }
    });
  });
});
