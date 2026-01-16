/**
 * Analyze Command
 * Analyzes a codebase for agent-readiness
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadConfig } from "../core/config.js";
import { detectLanguages } from "../core/detector.js";
import { createProgressReporter } from "../core/progress.js";

/**
 * Options for analyze command
 */
export interface AnalyzeOptions {
  quiet?: boolean;
  config?: string;
}

/**
 * Analyze a directory for agent-readiness
 * @param directory - Directory to analyze
 * @param options - Command options
 */
export async function analyzeCommand(
  directory: string,
  options: AnalyzeOptions = {}
): Promise<void> {
  const progress = createProgressReporter({ quiet: options.quiet });
  const resolvedDir = resolve(directory);

  // Validate directory exists
  if (!existsSync(resolvedDir)) {
    progress.error(`Directory not found: ${resolvedDir}`);
    process.exit(1);
  }

  progress.start(`Analyzing ${resolvedDir}...`);

  // Load config
  const config = await loadConfig(resolvedDir);

  // Detect languages
  const languages = await detectLanguages(resolvedDir, config);

  if (languages.length === 0) {
    progress.info("No supported languages detected");
    return;
  }

  const languageNames = languages.map((l) => l.language).join(", ");
  progress.success(`Found: ${languageNames}`);
}
