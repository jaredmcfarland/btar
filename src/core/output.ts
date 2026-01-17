/**
 * Output Module
 * JSON serialization for analysis results
 */

import type { SupportedLanguage, DetectedLanguage } from "./types.js";
import type { MetricResult } from "./metrics/types.js";
import type { MetricsReport } from "./metrics/index.js";
import type { ScoreResult, ScoreInterpretation } from "./scoring.js";

/**
 * Language entry in JSON output
 */
export interface LanguageOutput {
  language: SupportedLanguage;
  confidence: "high" | "medium" | "low";
  markers: string[];
}

/**
 * Metric result entry in JSON output
 */
export interface MetricOutput {
  metric: string;
  tool: string;
  value: number;
  success: boolean;
}

/**
 * Quality gate result
 */
export type GateResult = "passed" | "failed";

/**
 * Options for JSON formatting
 */
export interface FormatJsonOptions {
  /** Quality gate threshold (if set, gateResult will be included) */
  failUnder?: number;
}

/**
 * JSON-serializable analysis output
 */
export interface AnalysisOutput {
  /** Languages detected in the project */
  languages: LanguageOutput[];
  /** Per-dimension metric results by language */
  metrics: {
    typeStrictness: Record<string, MetricOutput>;
    lintErrors: Record<string, MetricOutput>;
    coverage: Record<string, MetricOutput>;
  };
  /** Aggregated summary */
  summary: {
    totalTypeErrors: number;
    totalLintErrors: number;
    averageCoverage: number;
  };
  /** Agent-readiness score */
  score: number;
  /** Score interpretation */
  interpretation: ScoreInterpretation;
  /** Score breakdown by dimension */
  breakdown: {
    typeStrictness: number;
    lintErrors: number;
    coverage: number;
  };
  /** Quality gate result (only present if --fail-under was specified) */
  gateResult?: GateResult;
}

/**
 * Convert Map<SupportedLanguage, MetricResult> to Record<string, MetricOutput>
 */
function mapToRecord(
  map: Map<SupportedLanguage, MetricResult>
): Record<string, MetricOutput> {
  const record: Record<string, MetricOutput> = {};
  for (const [lang, result] of map) {
    record[lang] = {
      metric: result.metric,
      tool: result.tool,
      value: result.value,
      success: result.success,
    };
  }
  return record;
}

/**
 * Format MetricsReport as JSON string
 *
 * @param report - The metrics report to serialize
 * @param scoreResult - The calculated score result
 * @param options - Optional formatting options
 * @returns JSON string with 2-space indentation
 *
 * @example
 * ```ts
 * const report = await runAllMetrics({ directory: ".", languages });
 * const scoreResult = calculateScore(report);
 * const json = formatAsJson(report, scoreResult, { failUnder: 70 });
 * console.log(json); // Valid JSON output with gateResult
 * ```
 */
export function formatAsJson(
  report: MetricsReport,
  scoreResult: ScoreResult,
  options?: FormatJsonOptions
): string {
  const output: AnalysisOutput = {
    languages: report.languages.map((l) => ({
      language: l.language,
      confidence: l.confidence,
      markers: l.markers,
    })),
    metrics: {
      typeStrictness: mapToRecord(report.metrics.typeStrictness),
      lintErrors: mapToRecord(report.metrics.lintErrors),
      coverage: mapToRecord(report.metrics.coverage),
    },
    summary: {
      totalTypeErrors: report.summary.totalTypeErrors,
      totalLintErrors: report.summary.totalLintErrors,
      averageCoverage: report.summary.averageCoverage,
    },
    score: scoreResult.score,
    interpretation: scoreResult.interpretation,
    breakdown: {
      typeStrictness: scoreResult.breakdown.typeStrictness,
      lintErrors: scoreResult.breakdown.lintErrors,
      coverage: scoreResult.breakdown.coverage,
    },
  };

  // Add gate result if threshold was specified
  if (options?.failUnder !== undefined) {
    output.gateResult =
      scoreResult.score >= options.failUnder ? "passed" : "failed";
  }

  return JSON.stringify(output, null, 2);
}
