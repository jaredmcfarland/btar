/**
 * AGENTS.md Validation and Generation
 *
 * Provides functions to validate existing AGENTS.md files and generate new ones
 * from codebase analysis. AGENTS.md is the standard format for providing context
 * to AI coding agents.
 */

import { readFileSync, existsSync } from "node:fs";
import type { DetectedLanguage, SupportedLanguage } from "../types.js";

/**
 * Result of validating an AGENTS.md file
 */
export interface AgentsMdValidation {
  exists: boolean;
  issues: string[];
  sections: string[];
}

/**
 * Options for generating an AGENTS.md file
 */
export interface AgentsMdOptions {
  projectName: string;
  languages: DetectedLanguage[];
  buildCommand?: string;
  testCommand?: string;
  lintCommand?: string;
}

/**
 * Recommended sections and their alternatives
 */
const RECOMMENDED_SECTIONS: { name: string; alternatives: string[] }[] = [
  { name: "Build", alternatives: ["Building", "Setup", "Installation"] },
  { name: "Test", alternatives: ["Testing", "Tests"] },
  { name: "Style", alternatives: ["Code Style", "Conventions", "Formatting"] },
];

/**
 * Language-specific defaults for AGENTS.md generation
 */
const LANGUAGE_DEFAULTS: Record<
  SupportedLanguage,
  { build: string; test: string; lint: string }
> = {
  typescript: {
    build: "npm run build",
    test: "npm test",
    lint: "npm run lint",
  },
  javascript: {
    build: "npm run build",
    test: "npm test",
    lint: "npm run lint",
  },
  python: {
    build: "pip install -e .",
    test: "pytest",
    lint: "ruff check .",
  },
  go: {
    build: "go build ./...",
    test: "go test ./...",
    lint: "go fmt ./... && go vet ./...",
  },
  java: {
    build: "mvn compile",
    test: "mvn test",
    lint: "mvn checkstyle:check",
  },
  kotlin: {
    build: "gradle build",
    test: "gradle test",
    lint: "gradle ktlintCheck",
  },
  swift: {
    build: "swift build",
    test: "swift test",
    lint: "swiftlint",
  },
  ruby: {
    build: "bundle install",
    test: "bundle exec rspec",
    lint: "bundle exec rubocop",
  },
  php: {
    build: "composer install",
    test: "vendor/bin/phpunit",
    lint: "vendor/bin/phpcs",
  },
};

/**
 * Validate an existing AGENTS.md file
 *
 * @param filePath - Path to the AGENTS.md file
 * @returns Validation result with issues and detected sections
 */
export async function validateAgentsMd(filePath: string): Promise<AgentsMdValidation> {
  // Check if file exists
  if (!existsSync(filePath)) {
    return {
      exists: false,
      issues: ["File not found"],
      sections: [],
    };
  }

  // Read file content
  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    return {
      exists: false,
      issues: ["File not found"],
      sections: [],
    };
  }

  // Check for empty file
  if (content.trim() === "") {
    return {
      exists: true,
      issues: ["Empty file"],
      sections: [],
    };
  }

  // Extract section headings (## and ### headings)
  const headingPattern = /^#{1,3}\s+(.+)$/gm;
  const sections: string[] = [];
  let match;
  while ((match = headingPattern.exec(content)) !== null) {
    sections.push(match[1].trim());
  }

  // Check for recommended sections
  const issues: string[] = [];

  for (const recommended of RECOMMENDED_SECTIONS) {
    const allNames = [recommended.name, ...recommended.alternatives];
    const hasSection = sections.some((section) =>
      allNames.some(
        (name) =>
          section.toLowerCase() === name.toLowerCase() ||
          section.toLowerCase().includes(name.toLowerCase())
      )
    );

    if (!hasSection) {
      const alternativesList = recommended.alternatives.join(", ");
      issues.push(
        `Missing recommended: ${recommended.name} commands (or: ${alternativesList})`
      );
    }
  }

  return {
    exists: true,
    issues,
    sections,
  };
}

/**
 * Generate an AGENTS.md file from project information
 *
 * @param options - Generation options including project name and detected languages
 * @returns Generated markdown content
 */
export function generateAgentsMd(options: AgentsMdOptions): string {
  const { projectName, languages, buildCommand, testCommand, lintCommand } = options;

  // Get primary language for defaults
  const primaryLang = languages[0]?.language ?? "typescript";
  const defaults = LANGUAGE_DEFAULTS[primaryLang];

  // Use custom commands or language defaults
  const build = buildCommand ?? defaults.build;
  const test = testCommand ?? defaults.test;
  const lint = lintCommand ?? defaults.lint;

  // Build the markdown content
  const lines: string[] = [];

  // Title
  lines.push(`# ${projectName}`);
  lines.push("");
  lines.push("This file provides context for AI coding agents.");
  lines.push("");

  // Languages section
  if (languages.length > 0) {
    lines.push("## Languages");
    lines.push("");
    for (const lang of languages) {
      lines.push(`- **${capitalizeFirst(lang.language)}** (${lang.confidence} confidence)`);
    }
    lines.push("");
  }

  // Build section
  lines.push("## Build");
  lines.push("");
  lines.push("```bash");
  lines.push(build);
  lines.push("```");
  lines.push("");

  // Language-specific build notes
  if (languages.length > 1) {
    lines.push("### Per-Language Build");
    lines.push("");
    for (const lang of languages) {
      const langDefaults = LANGUAGE_DEFAULTS[lang.language];
      lines.push(`- **${capitalizeFirst(lang.language)}:** \`${langDefaults.build}\``);
    }
    lines.push("");
  }

  // Test section
  lines.push("## Testing");
  lines.push("");
  lines.push("```bash");
  lines.push(test);
  lines.push("```");
  lines.push("");

  // Language-specific test notes
  if (languages.length > 1) {
    lines.push("### Per-Language Tests");
    lines.push("");
    for (const lang of languages) {
      const langDefaults = LANGUAGE_DEFAULTS[lang.language];
      lines.push(`- **${capitalizeFirst(lang.language)}:** \`${langDefaults.test}\``);
    }
    lines.push("");
  }

  // Style/Lint section
  lines.push("## Code Style");
  lines.push("");
  lines.push("```bash");
  lines.push(lint);
  lines.push("```");
  lines.push("");

  // Language-specific style notes
  for (const lang of languages) {
    lines.push(`### ${capitalizeFirst(lang.language)}`);
    lines.push("");
    lines.push(getLanguageStyleNotes(lang.language));
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get style notes for a language
 */
function getLanguageStyleNotes(language: SupportedLanguage): string {
  switch (language) {
    case "typescript":
      return "- Follow TypeScript strict mode conventions\n- Use ESLint with TypeScript parser";
    case "javascript":
      return "- Follow ESLint conventions\n- Use Prettier for formatting";
    case "python":
      return "- Follow PEP 8 style guide\n- Use type hints where possible";
    case "go":
      return "- Run `go fmt` before committing\n- Follow Go naming conventions";
    case "java":
      return "- Follow Java naming conventions\n- Use Checkstyle for enforcement";
    case "kotlin":
      return "- Follow Kotlin coding conventions\n- Use ktlint for formatting";
    case "swift":
      return "- Follow Swift API design guidelines\n- Use SwiftLint for enforcement";
    case "ruby":
      return "- Follow Ruby style guide\n- Use RuboCop for linting";
    case "php":
      return "- Follow PSR-12 coding standard\n- Use PHP_CodeSniffer";
    default:
      return "- Follow project conventions";
  }
}
