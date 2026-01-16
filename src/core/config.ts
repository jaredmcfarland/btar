/**
 * Configuration Loader
 *
 * Loads and parses .btar.yaml configuration files, merging with defaults.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as YAML from "yaml";
import type { BTARConfig, ThresholdConfig } from "./types.js";
import { ConfigError } from "./types.js";

export const DEFAULT_CONFIG: BTARConfig = {
  thresholds: {
    type_strictness: 0,
    lint_errors: 0,
    test_coverage: 70,
    ci_time: 600,
    flaky_rate: 1,
  },
  exclude: [
    "node_modules/**",
    "dist/**",
    "vendor/**",
    "*.generated.*",
  ],
  languages: [],
};

/**
 * Deep merge config with defaults
 * Custom values override defaults, missing values use defaults
 */
function mergeConfig(
  custom: Partial<BTARConfig>,
  defaults: BTARConfig
): BTARConfig {
  return {
    thresholds: {
      ...defaults.thresholds,
      ...(custom.thresholds || {}),
    } as ThresholdConfig,
    exclude: custom.exclude !== undefined ? custom.exclude : defaults.exclude,
    languages:
      custom.languages !== undefined ? custom.languages : defaults.languages,
  };
}

/**
 * Load BTAR configuration from a directory
 * @param directory - Directory containing .btar.yaml
 * @returns Parsed configuration merged with defaults
 * @throws ConfigError if YAML is invalid
 */
export async function loadConfig(directory: string): Promise<BTARConfig> {
  const configPath = path.join(directory, ".btar.yaml");

  // Check if config file exists
  try {
    await fs.access(configPath);
  } catch {
    // File doesn't exist, return defaults
    return DEFAULT_CONFIG;
  }

  // Read and parse config file
  let content: string;
  try {
    content = await fs.readFile(configPath, "utf-8");
  } catch (error) {
    throw new ConfigError(`Failed to read config file: ${error}`);
  }

  // Parse YAML
  let parsed: unknown;
  try {
    parsed = YAML.parse(content);
  } catch (error) {
    if (error instanceof YAML.YAMLParseError) {
      throw new ConfigError(
        `Invalid YAML in .btar.yaml: ${error.message}`,
        error.linePos?.[0]?.line,
        error.linePos?.[0]?.col
      );
    }
    throw new ConfigError(`Invalid YAML in .btar.yaml: ${error}`);
  }

  // Handle empty file or non-object content
  if (parsed === null || parsed === undefined) {
    return DEFAULT_CONFIG;
  }

  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ConfigError("Invalid YAML: config must be an object");
  }

  // Merge with defaults (unknown keys are ignored for forward compatibility)
  return mergeConfig(parsed as Partial<BTARConfig>, DEFAULT_CONFIG);
}
