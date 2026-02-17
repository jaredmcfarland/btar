/**
 * Metrics Module
 * Barrel export and orchestration for all metric measurements
 */

import type { DetectedLanguage, SupportedLanguage } from "../types.js";
import type { MetricResult } from "./types.js";

// Re-export all metric functions and types
export { measureTypeStrictness, TYPE_CHECKER_TOOLS } from "./type-checker.js";
export { measureLintErrors, LINTER_TOOLS } from "./linter.js";
export { measureCoverage, COVERAGE_TOOLS } from "./coverage.js";
export * from "./types.js";
export { runTool } from "./runner.js";

// Import for internal use
import { measureTypeStrictness } from "./type-checker.js";
import { measureLintErrors } from "./linter.js";
import { measureCoverage } from "./coverage.js";

/**
 * Options for running all metrics
 */
export interface MetricsOptions {
  /** Directory to analyze */
  directory: string;
  /** Detected languages in the project */
  languages: DetectedLanguage[];
  /** Progress callback */
  onProgress?: (
    metric: string,
    status: "start" | "done",
    result?: MetricResult
  ) => void;
}

/**
 * Complete metrics report for a project
 */
export interface MetricsReport {
  /** Languages that were analyzed */
  languages: DetectedLanguage[];
  /** Per-dimension metric results */
  metrics: {
    typeStrictness: Map<SupportedLanguage, MetricResult>;
    lintErrors: Map<SupportedLanguage, MetricResult>;
    coverage: Map<SupportedLanguage, MetricResult>;
  };
  /** Aggregated summary */
  summary: {
    /** Total type errors across all languages */
    totalTypeErrors: number;
    /** Total lint errors across all languages */
    totalLintErrors: number;
    /** Average coverage percentage across all languages */
    averageCoverage: number;
  };
}

/**
 * Run all metrics for detected languages
 *
 * @param options - Metrics options including directory and languages
 * @returns Complete metrics report with per-language results and summary
 *
 * @example
 * ```ts
 * const report = await runAllMetrics({
 *   directory: "/path/to/project",
 *   languages: [{ language: "typescript", confidence: "high", markers: ["tsconfig.json"] }],
 *   onProgress: (metric, status) => console.log(`${metric}: ${status}`)
 * });
 *
 * console.log(`Type errors: ${report.summary.totalTypeErrors}`);
 * console.log(`Lint errors: ${report.summary.totalLintErrors}`);
 * console.log(`Coverage: ${report.summary.averageCoverage}%`);
 * ```
 */
export async function runAllMetrics(
  options: MetricsOptions
): Promise<MetricsReport> {
  const { directory, languages, onProgress } = options;

  // Initialize result maps
  const typeStrictness = new Map<SupportedLanguage, MetricResult>();
  const lintErrors = new Map<SupportedLanguage, MetricResult>();
  const coverage = new Map<SupportedLanguage, MetricResult>();

  // Run metrics for each language
  // Pass full DetectedLanguage to metric functions for build system awareness
  for (const detectedLang of languages) {
    const { language } = detectedLang;

    // Type strictness
    onProgress?.("Type Strictness", "start");
    const typeResult = await measureTypeStrictness(detectedLang, directory);
    typeStrictness.set(language, typeResult);
    onProgress?.("Type Strictness", "done", typeResult);

    // Lint errors
    onProgress?.("Lint Errors", "start");
    const lintResult = await measureLintErrors(detectedLang, directory);
    lintErrors.set(language, lintResult);
    onProgress?.("Lint Errors", "done", lintResult);

    // Coverage
    onProgress?.("Test Coverage", "start");
    const coverageResult = await measureCoverage(detectedLang, directory);
    coverage.set(language, coverageResult);
    onProgress?.("Test Coverage", "done", coverageResult);
  }

  // Calculate summary totals
  let totalTypeErrors = 0;
  let totalLintErrors = 0;
  let coverageSum = 0;
  let coverageCount = 0;

  for (const result of typeStrictness.values()) {
    if (result.success && result.value >= 0) {
      totalTypeErrors += result.value;
    }
  }

  for (const result of lintErrors.values()) {
    if (result.success && result.value >= 0) {
      totalLintErrors += result.value;
    }
  }

  for (const result of coverage.values()) {
    if (result.success && result.value >= 0) {
      coverageSum += result.value;
      coverageCount++;
    }
  }

  const averageCoverage =
    coverageCount > 0 ? Math.round((coverageSum / coverageCount) * 10) / 10 : 0;

  return {
    languages,
    metrics: {
      typeStrictness,
      lintErrors,
      coverage,
    },
    summary: {
      totalTypeErrors,
      totalLintErrors,
      averageCoverage,
    },
  };
}
