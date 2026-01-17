/**
 * Output Module
 * JSON serialization for analysis results
 */

import type { SupportedLanguage, DetectedLanguage } from "./types.js";
import type { MetricResult } from "./metrics/types.js";
import type { MetricsReport } from "./metrics/index.js";

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
 * @returns JSON string with 2-space indentation
 *
 * @example
 * ```ts
 * const report = await runAllMetrics({ directory: ".", languages });
 * const json = formatAsJson(report);
 * console.log(json); // Valid JSON output
 * ```
 */
export function formatAsJson(report: MetricsReport): string {
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
  };

  return JSON.stringify(output, null, 2);
}
