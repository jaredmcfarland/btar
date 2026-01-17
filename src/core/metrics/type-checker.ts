/**
 * Type Strictness Measurement
 * Runs type checkers (tsc, mypy, go vet) and counts errors
 */

import type { SupportedLanguage } from "../types.js";
import type { MetricResult, MetricParser } from "./types.js";
import { runTool } from "./runner.js";

/**
 * Type checker tool configuration for a language
 */
export interface TypeCheckerTool {
  /** Tool name for display */
  tool: string;
  /** Command to execute */
  command: string[];
  /** Parser to extract error count from output */
  parseErrors: MetricParser;
}

/**
 * Parse tsc (TypeScript compiler) output for error count
 *
 * Matches patterns like:
 * - "src/foo.ts(10,5): error TS2345: ..."
 * - "Found 5 errors."
 */
export function parseTscErrors(
  stdout: string,
  stderr: string,
  exitCode: number
): number {
  if (exitCode === 0) {
    return 0;
  }

  const combined = stdout + stderr;

  // Check for "Found N error(s)" summary line
  const summaryMatch = combined.match(/Found (\d+) errors?/i);
  if (summaryMatch) {
    return parseInt(summaryMatch[1], 10);
  }

  // Count individual error lines
  const errorLines = combined.match(/error TS\d+:/g);
  return errorLines ? errorLines.length : 0;
}

/**
 * Parse mypy (Python type checker) output for error count
 *
 * Matches patterns like:
 * - "foo.py:10: error: ..."
 * - "Found 5 errors in 3 files"
 */
export function parseMypyErrors(
  stdout: string,
  stderr: string,
  exitCode: number
): number {
  if (exitCode === 0) {
    return 0;
  }

  const combined = stdout + stderr;

  // Check for summary line "Found N error(s)"
  const summaryMatch = combined.match(/Found (\d+) errors?/i);
  if (summaryMatch) {
    return parseInt(summaryMatch[1], 10);
  }

  // Count individual error lines (file:line: error:)
  const errorLines = combined.match(/:\d+: error:/g);
  return errorLines ? errorLines.length : 0;
}

/**
 * Parse go vet output for error count
 *
 * Matches patterns like:
 * - "./main.go:10:5: ..."
 * - "# pkg/foo" (package header, not an error)
 */
export function parseGoVetErrors(
  stdout: string,
  stderr: string,
  exitCode: number
): number {
  if (exitCode === 0) {
    return 0;
  }

  const combined = stdout + stderr;

  // Count lines matching .go:line:col pattern (excluding package headers)
  const errorLines = combined.split("\n").filter((line) => {
    // Match: path.go:line:col: message
    return /\.go:\d+:\d*:/.test(line);
  });

  return errorLines.length;
}

/**
 * Mapping of languages to their type checker tools
 * null means the language is dynamically typed with no standard type checker
 */
export const TYPE_CHECKER_TOOLS: Record<
  SupportedLanguage,
  TypeCheckerTool | null
> = {
  typescript: {
    tool: "tsc",
    command: ["npx", "tsc", "--noEmit"],
    parseErrors: parseTscErrors,
  },
  python: {
    tool: "mypy",
    command: ["mypy", "."],
    parseErrors: parseMypyErrors,
  },
  go: {
    tool: "go vet",
    command: ["go", "vet", "./..."],
    parseErrors: parseGoVetErrors,
  },
  java: {
    tool: "javac",
    command: ["javac", "-Xlint:all", "-d", "/tmp", "-sourcepath", "."],
    parseErrors: (stdout, stderr, exitCode) => {
      if (exitCode === 0) return 0;
      // Count lines with "error:" in them
      const combined = stdout + stderr;
      const errorLines = combined.match(/: error:/g);
      return errorLines ? errorLines.length : 0;
    },
  },
  kotlin: {
    tool: "kotlinc",
    command: ["kotlinc", "-Werror"],
    parseErrors: (stdout, stderr, exitCode) => {
      if (exitCode === 0) return 0;
      const combined = stdout + stderr;
      const errorLines = combined.match(/: error:/g);
      return errorLines ? errorLines.length : 0;
    },
  },
  swift: {
    tool: "swiftc",
    command: ["swift", "build"],
    parseErrors: (stdout, stderr, exitCode) => {
      if (exitCode === 0) return 0;
      const combined = stdout + stderr;
      const errorLines = combined.match(/: error:/g);
      return errorLines ? errorLines.length : 0;
    },
  },
  // Dynamically typed languages - no static type checker by default
  javascript: null,
  ruby: null,
  php: null,
};

/**
 * Measure type strictness for a language by running its type checker
 *
 * @param language - Language to check
 * @param directory - Project directory to check
 * @returns MetricResult with error count
 *
 * @example
 * ```ts
 * const result = await measureTypeStrictness("typescript", "/path/to/project");
 * if (result.success) {
 *   console.log(`Type errors: ${result.value}`);
 * }
 * ```
 */
export async function measureTypeStrictness(
  language: SupportedLanguage,
  directory: string
): Promise<MetricResult> {
  const toolConfig = TYPE_CHECKER_TOOLS[language];

  // Dynamic languages have no type checker
  if (toolConfig === null) {
    return {
      metric: "type_strictness",
      tool: "n/a",
      value: 0,
      success: true,
    };
  }

  const { tool, command, parseErrors } = toolConfig;

  // Run the type checker
  const result = await runTool({
    command,
    cwd: directory,
    timeout: 120000, // 2 minutes for large projects
  });

  // Tool not installed
  if (result.exitCode === 127) {
    return {
      metric: "type_strictness",
      tool,
      value: -1,
      success: false,
      raw: result.stderr || `${tool} not found`,
    };
  }

  // Timeout
  if (result.timedOut) {
    return {
      metric: "type_strictness",
      tool,
      value: -1,
      success: false,
      raw: "Tool execution timed out",
    };
  }

  // Parse error count from output
  const errorCount = parseErrors(result.stdout, result.stderr, result.exitCode);

  return {
    metric: "type_strictness",
    tool,
    value: errorCount,
    success: true,
    raw:
      result.exitCode !== 0 ? result.stdout || result.stderr : undefined,
  };
}
