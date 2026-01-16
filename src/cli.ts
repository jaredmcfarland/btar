#!/usr/bin/env node
/**
 * BTAR CLI entry point
 */

import { Command } from "commander";
import { VERSION } from "./index.js";

const program = new Command();

program
  .name("btar")
  .description("Transform brownfield codebases into agent-ready environments")
  .version(VERSION);

program
  .command("analyze")
  .description("Analyze codebase for agent-readiness")
  .argument("[directory]", "Directory to analyze", ".")
  .action((directory) => {
    console.log(`Analyzing ${directory}...`);
    console.log("Not implemented yet");
  });

program.parse();

export { program };
