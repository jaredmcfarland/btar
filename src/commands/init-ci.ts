/**
 * Init CI Command
 * Generates GitHub Actions workflow for BTAR analysis
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Options for init-ci command
 */
export interface InitCiOptions {
  threshold?: number;
  force?: boolean;
}

/**
 * Generate GitHub Actions workflow YAML
 */
function generateWorkflow(threshold: number): string {
  return `name: BTAR Analysis

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install BTAR
        run: npm install -g btar

      - name: Run Analysis
        run: btar analyze . --json --fail-under ${threshold}

      - name: Upload Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: btar-report
          path: btar-report.json
`;
}

/**
 * Initialize CI workflow for BTAR
 * @param options - Command options
 */
export async function initCiCommand(
  options: InitCiOptions = {}
): Promise<void> {
  const threshold = options.threshold ?? 70;
  const workflowDir = join(process.cwd(), ".github", "workflows");
  const workflowPath = join(workflowDir, "btar.yml");

  // Check if workflow already exists
  if (existsSync(workflowPath) && !options.force) {
    console.error(
      `Workflow already exists: ${workflowPath}\nUse --force to overwrite.`
    );
    process.exit(1);
  }

  // Create .github/workflows directory if needed
  if (!existsSync(workflowDir)) {
    mkdirSync(workflowDir, { recursive: true });
  }

  // Generate and write workflow
  const workflow = generateWorkflow(threshold);
  writeFileSync(workflowPath, workflow);

  console.log(`Created GitHub Actions workflow: ${workflowPath}`);
  console.log(`Threshold: ${threshold}`);
}
