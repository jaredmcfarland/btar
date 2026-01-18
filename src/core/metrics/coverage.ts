/**
 * Test Coverage Measurement
 * Measures test coverage percentage across different languages
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { SupportedLanguage } from "../types.js";
import type { MetricResult, MetricParser } from "./types.js";
import { runTool } from "./runner.js";

/**
 * Coverage tool configuration
 */
export interface CoverageTool {
  /** Tool name for reporting */
  tool: string;
  /** Command to execute coverage measurement */
  command: string[];
  /** Parser to extract percentage from output */
  parseCoverage: MetricParser;
}

/**
 * Parse c8/nyc coverage output
 * Looks for "All files" line with percentage
 *
 * Example: "All files | 85.5 | 90.2 | 78.3 | 85.5 |"
 */
function parseC8Coverage(stdout: string, _stderr: string, exitCode: number): number {
  // If tool not found, return -1
  if (exitCode === 127) {
    return -1;
  }

  // Look for "All files" line with percentage
  // Format: "All files | XX.XX | ..."
  const allFilesMatch = stdout.match(/All files[^|]*\|\s*([\d.]+)/);
  if (allFilesMatch) {
    const value = parseFloat(allFilesMatch[1]);
    return isNaN(value) ? 0 : Math.min(100, Math.max(0, value));
  }

  // Alternative: Look for total percentage line (vitest format)
  // Format: "Coverage for all files: XX.XX%"
  const totalMatch = stdout.match(/(?:total|coverage)[^:]*:\s*([\d.]+)%/i);
  if (totalMatch) {
    const value = parseFloat(totalMatch[1]);
    return isNaN(value) ? 0 : Math.min(100, Math.max(0, value));
  }

  // If tests ran but no coverage data, return 0
  return 0;
}

/**
 * Parse pytest-cov coverage output
 * Looks for "TOTAL" line with percentage
 *
 * Example: "TOTAL         100    15    85%"
 */
function parsePytestCoverage(stdout: string, _stderr: string, exitCode: number): number {
  // If tool not found, return -1
  if (exitCode === 127) {
    return -1;
  }

  // Look for TOTAL line with percentage
  // Format: "TOTAL ... XX%"
  const totalMatch = stdout.match(/^TOTAL\s+.*?(\d+)%/m);
  if (totalMatch) {
    const value = parseInt(totalMatch[1], 10);
    return isNaN(value) ? 0 : Math.min(100, Math.max(0, value));
  }

  // Alternative: coverage.py format
  // "Total coverage: XX.X%"
  const coverageMatch = stdout.match(/(?:total|overall)\s+coverage[:\s]*([\d.]+)%/i);
  if (coverageMatch) {
    const value = parseFloat(coverageMatch[1]);
    return isNaN(value) ? 0 : Math.min(100, Math.max(0, value));
  }

  return 0;
}

/**
 * Parse go test coverage output
 * Looks for "coverage: XX.X% of statements" pattern
 *
 * Example: "coverage: 72.5% of statements"
 */
function parseGoCoverage(stdout: string, _stderr: string, exitCode: number): number {
  // If tool not found, return -1
  if (exitCode === 127) {
    return -1;
  }

  // Go test outputs coverage per package. Collect all and average.
  // Format: "coverage: XX.X% of statements"
  const allMatches = stdout.matchAll(/coverage:\s*([\d.]+)%\s+of\s+statements/g);
  const percentages: number[] = [];
  for (const match of allMatches) {
    const value = parseFloat(match[1]);
    if (!isNaN(value)) {
      percentages.push(value);
    }
  }

  if (percentages.length > 0) {
    const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length;
    return Math.min(100, Math.max(0, avg));
  }

  // Fallback: Look for any coverage percentage pattern
  const fallbackMatches = stdout.matchAll(/coverage:\s*([\d.]+)%/g);
  for (const match of fallbackMatches) {
    const value = parseFloat(match[1]);
    if (!isNaN(value)) {
      percentages.push(value);
    }
  }

  if (percentages.length > 0) {
    const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length;
    return Math.min(100, Math.max(0, avg));
  }

  // "[no test files]" is common - means 0% coverage
  if (stdout.includes("[no test files]") || stdout.includes("no test files")) {
    return 0;
  }

  return 0;
}

/**
 * Parse generic coverage output
 * Looks for percentage patterns (XX% or XX.X%)
 */
function parseGenericCoverage(stdout: string, _stderr: string, exitCode: number): number {
  // If tool not found, return -1
  if (exitCode === 127) {
    return -1;
  }

  // Look for common coverage report patterns
  // "Coverage: XX.X%", "Total: XX%", "Line coverage: XX.X%"
  const patterns = [
    /(?:line\s+)?coverage[:\s]*([\d.]+)%/i,
    /total[:\s]*([\d.]+)%/i,
    /^[\s]*(\d+(?:\.\d+)?)\s*%/m,
  ];

  for (const pattern of patterns) {
    const match = stdout.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      if (!isNaN(value)) {
        return Math.min(100, Math.max(0, value));
      }
    }
  }

  return 0;
}

/**
 * Coverage tools mapping by language
 */
export const COVERAGE_TOOLS: Record<SupportedLanguage, CoverageTool> = {
  typescript: {
    tool: "c8",
    command: ["npx", "c8", "--reporter=text-summary", "npm", "test"],
    parseCoverage: parseC8Coverage,
  },
  javascript: {
    tool: "c8",
    command: ["npx", "c8", "--reporter=text-summary", "npm", "test"],
    parseCoverage: parseC8Coverage,
  },
  python: {
    tool: "pytest-cov",
    command: ["pytest", "--cov=.", "--cov-report=term-missing", "-q"],
    parseCoverage: parsePytestCoverage,
  },
  go: {
    tool: "go test",
    command: ["go", "test", "-cover", "./..."],
    parseCoverage: parseGoCoverage,
  },
  java: {
    tool: "jacoco",
    command: ["mvn", "test", "jacoco:report"],
    parseCoverage: parseGenericCoverage,
  },
  kotlin: {
    tool: "jacoco",
    command: ["./gradlew", "test", "jacocoTestReport"],
    parseCoverage: parseGenericCoverage,
  },
  swift: {
    tool: "swift test",
    command: ["swift", "test", "--enable-code-coverage"],
    parseCoverage: parseGenericCoverage,
  },
  ruby: {
    tool: "simplecov",
    command: ["bundle", "exec", "rspec", "--format", "progress"],
    parseCoverage: parseGenericCoverage,
  },
  php: {
    tool: "phpunit",
    command: ["./vendor/bin/phpunit", "--coverage-text"],
    parseCoverage: parseGenericCoverage,
  },
};

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect the appropriate coverage tool for TypeScript/JavaScript projects
 * Checks for vitest, jest, or falls back to c8
 */
async function detectJsCoverageTool(directory: string): Promise<CoverageTool> {
  // Check for vitest config
  const vitestConfigs = [
    "vitest.config.ts",
    "vitest.config.js",
    "vitest.config.mts",
    "vitest.config.mjs",
  ];

  for (const config of vitestConfigs) {
    if (await fileExists(path.join(directory, config))) {
      return {
        tool: "vitest",
        command: ["npx", "vitest", "run", "--coverage"],
        parseCoverage: parseC8Coverage,
      };
    }
  }

  // Check package.json for vitest in devDependencies
  try {
    const pkgPath = path.join(directory, "package.json");
    const pkgContent = await fs.readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgContent) as { devDependencies?: Record<string, string>; dependencies?: Record<string, string> };

    if (pkg.devDependencies?.vitest || pkg.dependencies?.vitest) {
      return {
        tool: "vitest",
        command: ["npx", "vitest", "run", "--coverage"],
        parseCoverage: parseC8Coverage,
      };
    }

    // Check for jest
    if (pkg.devDependencies?.jest || pkg.dependencies?.jest) {
      return {
        tool: "jest",
        command: ["npx", "jest", "--coverage", "--coverageReporters=text-summary"],
        parseCoverage: parseC8Coverage,
      };
    }
  } catch {
    // Ignore parse errors
  }

  // Default to c8
  return COVERAGE_TOOLS.typescript;
}

/**
 * Measure test coverage for a project
 *
 * @param language - The language to measure coverage for
 * @param directory - The directory containing the project
 * @returns MetricResult with coverage percentage (0-100) or -1 if tool unavailable
 *
 * @example
 * ```ts
 * const result = await measureCoverage("typescript", "/path/to/project");
 * if (result.success) {
 *   console.log(`Coverage: ${result.value}%`);
 * }
 * ```
 */
export async function measureCoverage(
  language: SupportedLanguage,
  directory: string
): Promise<MetricResult> {
  // For JS/TS, detect the appropriate tool
  let toolConfig: CoverageTool;
  if (language === "typescript" || language === "javascript") {
    toolConfig = await detectJsCoverageTool(directory);
  } else {
    toolConfig = COVERAGE_TOOLS[language];
  }

  // Extended timeout for coverage (runs tests, can be slow)
  const COVERAGE_TIMEOUT = 120000; // 2 minutes

  const result = await runTool({
    command: toolConfig.command,
    cwd: directory,
    timeout: COVERAGE_TIMEOUT,
  });

  // Parse coverage percentage from output
  const value = toolConfig.parseCoverage(result.stdout, result.stderr, result.exitCode);

  // Tool not found
  if (value === -1) {
    return {
      metric: "test_coverage",
      tool: toolConfig.tool,
      value: -1,
      success: false,
      raw: result.stderr,
    };
  }

  // Timed out
  if (result.timedOut) {
    return {
      metric: "test_coverage",
      tool: toolConfig.tool,
      value: -1,
      success: false,
      raw: "Coverage measurement timed out",
    };
  }

  // Success - return parsed percentage
  return {
    metric: "test_coverage",
    tool: toolConfig.tool,
    value,
    success: true,
    raw: result.stdout.slice(0, 1000), // Limit raw output size
  };
}
