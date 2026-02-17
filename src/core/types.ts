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
 * Build system used by a project
 */
export type BuildSystem = "gradle" | "maven" | "npm" | "go-mod" | "none";

/**
 * Result of language detection
 */
export interface DetectedLanguage {
  language: SupportedLanguage;
  confidence: "high" | "medium" | "low";
  markers: string[];
  buildSystem?: BuildSystem;
  isAndroid?: boolean;
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

/**
 * Custom error for configuration issues
 */
export class ConfigError extends Error {
  constructor(
    message: string,
    public readonly line?: number,
    public readonly column?: number
  ) {
    super(message);
    this.name = "ConfigError";
  }
}
