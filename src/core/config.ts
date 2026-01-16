/**
 * Configuration Loader
 *
 * TDD: RED phase - stub implementation that should FAIL tests
 */

import type { BTARConfig } from "./types.js";

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
 * Load BTAR configuration from a directory
 * @param directory - Directory containing .btar.yaml
 * @returns Parsed configuration merged with defaults
 */
export async function loadConfig(directory: string): Promise<BTARConfig> {
  // TODO: Implement - this stub should fail tests
  throw new Error("Not implemented");
}
