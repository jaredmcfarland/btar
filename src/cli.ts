#!/usr/bin/env node
/**
 * BTAR CLI entry point
 */

import { Command } from "commander";
import { VERSION } from "./index.js";
import { analyzeCommand } from "./commands/analyze.js";

const program = new Command();

program
  .name("btar")
  .description("Transform brownfield codebases into agent-ready environments")
  .version(VERSION);

program
  .command("analyze <directory>")
  .description("Analyze codebase for agent-readiness")
  .option("-q, --quiet", "Suppress progress output")
  .option("-c, --config <path>", "Path to config file")
  .action(async (directory, options) => {
    await analyzeCommand(directory, options);
  });

program.parseAsync(process.argv).catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});

export { program };
