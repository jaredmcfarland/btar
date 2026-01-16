/**
 * Core type definitions for BTAR
 */

/**
 * Supported languages for detection
 */
export type SupportedLanguage =
  | "python"
  | "typescript"
  | "javascript"
  | "go"
  | "java"
  | "kotlin"
  | "swift"
  | "ruby"
  | "php";

/**
 * Result of language detection
 */
export interface DetectedLanguage {
  language: SupportedLanguage;
  confidence: "high" | "medium" | "low";
  markers: string[];
}

/**
 * Threshold configuration
 */
export interface ThresholdConfig {
  type_strictness: number;
  lint_errors: number;
  test_coverage: number;
  ci_time: number;
  flaky_rate: number;
}

/**
 * Main BTAR configuration
 */
export interface BTARConfig {
  thresholds: ThresholdConfig;
  exclude: string[];
  languages: SupportedLanguage[];
}
