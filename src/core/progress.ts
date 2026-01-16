/**
 * Progress Reporter
 * Simple progress output with symbols for CLI feedback
 */

/**
 * Progress reporter interface
 */
export interface ProgressReporter {
  start(message: string): void;
  success(message: string): void;
  error(message: string): void;
  info(message: string): void;
}

/**
 * Output symbols
 */
export const SYMBOLS = {
  success: "✓",
  error: "✗",
  progress: "→",
  info: "•",
} as const;

/**
 * Options for createProgressReporter
 */
export interface ProgressOptions {
  quiet?: boolean;
}

/**
 * Create a progress reporter
 * @param options - Configuration options
 * @returns ProgressReporter instance
 */
export function createProgressReporter(
  options: ProgressOptions = {}
): ProgressReporter {
  const { quiet = false } = options;

  // Check if stdout is a TTY for potential color support
  const isTTY = process.stdout.isTTY ?? false;

  // Color helpers (only apply if TTY)
  const green = (s: string) => (isTTY ? `\x1b[32m${s}\x1b[0m` : s);
  const red = (s: string) => (isTTY ? `\x1b[31m${s}\x1b[0m` : s);
  const dim = (s: string) => (isTTY ? `\x1b[2m${s}\x1b[0m` : s);

  return {
    start(message: string): void {
      if (quiet) return;
      console.log(`${dim(SYMBOLS.progress)} ${message}`);
    },

    success(message: string): void {
      if (quiet) return;
      console.log(`${green(SYMBOLS.success)} ${message}`);
    },

    error(message: string): void {
      // Errors always display, even in quiet mode
      console.error(`${red(SYMBOLS.error)} ${message}`);
    },

    info(message: string): void {
      if (quiet) return;
      console.log(`${dim(SYMBOLS.info)} ${message}`);
    },
  };
}
