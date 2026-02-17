/**
 * Language Detector
 * Detects programming languages in a directory based on marker files
 */

import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import type { BTARConfig, BuildSystem, DetectedLanguage, SupportedLanguage } from "./types.js";

/**
 * Language marker definitions
 * Primary markers: definitive project files (high confidence)
 * Secondary markers: supporting evidence (medium confidence)
 */
export interface LanguageMarker {
  primary: string[];
  secondary: string[];
}

/**
 * Marker definitions for each supported language
 */
export const LANGUAGE_MARKERS: Record<SupportedLanguage, LanguageMarker> = {
  python: {
    primary: ["pyproject.toml", "setup.py"],
    secondary: ["requirements.txt", "Pipfile", "setup.cfg"],
  },
  typescript: {
    primary: ["tsconfig.json"],
    secondary: [], // package.json with typescript dep checked separately
  },
  javascript: {
    primary: ["package.json"],
    secondary: ["jsconfig.json"],
  },
  go: {
    primary: ["go.mod"],
    secondary: ["go.sum"],
  },
  java: {
    primary: ["pom.xml", "build.gradle"],
    secondary: ["gradle.properties", "settings.gradle"],
  },
  kotlin: {
    primary: ["build.gradle.kts"],
    secondary: ["settings.gradle.kts"],
  },
  swift: {
    primary: ["Package.swift"],
    secondary: [],
  },
  ruby: {
    primary: ["Gemfile"],
    secondary: ["Gemfile.lock", ".ruby-version"],
  },
  php: {
    primary: ["composer.json"],
    secondary: ["composer.lock"],
  },
};

/**
 * Check if a path should be excluded based on config patterns
 */
function shouldExclude(filePath: string, baseDir: string, excludePatterns: string[]): boolean {
  if (excludePatterns.length === 0) return false;

  const relativePath = relative(baseDir, filePath);

  for (const pattern of excludePatterns) {
    // Handle glob patterns
    if (pattern === "**/*") {
      return true;
    }

    // Handle directory prefix patterns like "vendor/**"
    if (pattern.endsWith("/**")) {
      const prefix = pattern.slice(0, -3);
      if (relativePath.startsWith(prefix + "/") || relativePath === prefix) {
        return true;
      }
    }

    // Handle exact matches
    if (relativePath === pattern || filePath.endsWith(pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if package.json contains TypeScript as a dependency
 */
function hasTypescriptDependency(packageJsonPath: string): boolean {
  try {
    const content = readFileSync(packageJsonPath, "utf-8");
    const pkg = JSON.parse(content);

    const hasDep = (deps: Record<string, string> | undefined): boolean =>
      deps !== undefined && "typescript" in deps;

    return hasDep(pkg.dependencies) || hasDep(pkg.devDependencies);
  } catch {
    return false;
  }
}

/**
 * Detect the build system used for a given language in a directory
 */
export function detectBuildSystem(directory: string, language: SupportedLanguage): { buildSystem: BuildSystem; isAndroid: boolean } {
  if (language === "java" || language === "kotlin") {
    // Check for Gradle (Android/Gradle projects)
    const hasGradlew = existsSync(join(directory, "gradlew"));
    const hasBuildGradle = existsSync(join(directory, "build.gradle"));
    const hasBuildGradleKts = existsSync(join(directory, "build.gradle.kts"));

    if (hasGradlew || hasBuildGradle || hasBuildGradleKts) {
      // Detect if it's an Android project
      let isAndroid = existsSync(join(directory, "src", "main", "AndroidManifest.xml"));

      if (!isAndroid && (hasBuildGradle || hasBuildGradleKts)) {
        try {
          const gradleFile = hasBuildGradle ? "build.gradle" : "build.gradle.kts";
          const content = readFileSync(join(directory, gradleFile), "utf-8");
          isAndroid = content.includes("com.android.library") ||
                      content.includes("com.android.application");
        } catch {
          // Ignore read errors
        }
      }

      return { buildSystem: "gradle", isAndroid };
    }

    // Check for Maven
    if (existsSync(join(directory, "pom.xml"))) {
      return { buildSystem: "maven", isAndroid: false };
    }

    return { buildSystem: "none", isAndroid: false };
  }

  if (language === "typescript" || language === "javascript") {
    if (existsSync(join(directory, "package.json"))) {
      return { buildSystem: "npm", isAndroid: false };
    }
    return { buildSystem: "none", isAndroid: false };
  }

  if (language === "go") {
    if (existsSync(join(directory, "go.mod"))) {
      return { buildSystem: "go-mod", isAndroid: false };
    }
    return { buildSystem: "none", isAndroid: false };
  }

  return { buildSystem: "none", isAndroid: false };
}

/**
 * Detect languages in a directory
 * @param directory - The directory to scan
 * @param config - BTAR configuration with exclude patterns
 * @returns Array of detected languages with confidence and markers
 */
export async function detectLanguages(
  directory: string,
  config: BTARConfig
): Promise<DetectedLanguage[]> {
  // Handle non-existent directory
  if (!existsSync(directory)) {
    return [];
  }

  const detected: DetectedLanguage[] = [];
  const foundLanguages = new Set<SupportedLanguage>();

  // Read directory contents
  let files: string[];
  try {
    files = readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
  } catch {
    return [];
  }

  // Check each file against language markers
  for (const file of files) {
    const filePath = join(directory, file);

    // Skip excluded files
    if (shouldExclude(filePath, directory, config.exclude)) {
      continue;
    }

    // Check primary markers for each language
    for (const [lang, markers] of Object.entries(LANGUAGE_MARKERS) as [
      SupportedLanguage,
      LanguageMarker
    ][]) {
      // Skip if already detected (avoid duplicates)
      if (foundLanguages.has(lang)) continue;

      // Check primary markers (high confidence)
      if (markers.primary.includes(file)) {
        // Special handling for package.json
        if (file === "package.json") {
          if (hasTypescriptDependency(filePath)) {
            // Has TypeScript dependency - register as TypeScript
            if (!foundLanguages.has("typescript")) {
              foundLanguages.add("typescript");
              detected.push({
                language: "typescript",
                confidence: "high",
                markers: ["package.json (typescript dependency)"],
              });
            }
          } else {
            // Plain JavaScript project
            foundLanguages.add("javascript");
            detected.push({
              language: "javascript",
              confidence: "high",
              markers: [file],
            });
          }
        } else {
          foundLanguages.add(lang);
          detected.push({
            language: lang,
            confidence: "high",
            markers: [file],
          });
        }
      }
    }
  }

  // Check secondary markers if no primary found for a language
  for (const file of files) {
    const filePath = join(directory, file);

    if (shouldExclude(filePath, directory, config.exclude)) {
      continue;
    }

    for (const [lang, markers] of Object.entries(LANGUAGE_MARKERS) as [
      SupportedLanguage,
      LanguageMarker
    ][]) {
      if (foundLanguages.has(lang)) continue;

      if (markers.secondary.includes(file)) {
        foundLanguages.add(lang);
        detected.push({
          language: lang,
          confidence: "medium",
          markers: [file],
        });
      }
    }
  }

  // Also scan immediate subdirectories for markers (monorepo support)
  try {
    const subdirs = readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    for (const subdir of subdirs) {
      const subdirPath = join(directory, subdir);

      // Skip excluded directories
      if (shouldExclude(subdirPath, directory, config.exclude)) {
        continue;
      }

      // Skip common non-source directories
      if (["node_modules", ".git", "dist", "build", "vendor"].includes(subdir)) {
        continue;
      }

      let subFiles: string[];
      try {
        subFiles = readdirSync(subdirPath, { withFileTypes: true })
          .filter((entry) => entry.isFile())
          .map((entry) => entry.name);
      } catch {
        continue;
      }

      for (const file of subFiles) {
        const filePath = join(subdirPath, file);

        if (shouldExclude(filePath, directory, config.exclude)) {
          continue;
        }

        for (const [lang, markers] of Object.entries(LANGUAGE_MARKERS) as [
          SupportedLanguage,
          LanguageMarker
        ][]) {
          if (foundLanguages.has(lang)) continue;

          if (markers.primary.includes(file)) {
            foundLanguages.add(lang);
            detected.push({
              language: lang,
              confidence: "high",
              markers: [`${subdir}/${file}`],
            });
          }
        }
      }
    }
  } catch {
    // Ignore subdirectory scan errors
  }

  // Detect build system for each language
  for (const lang of detected) {
    const { buildSystem, isAndroid } = detectBuildSystem(directory, lang.language);
    lang.buildSystem = buildSystem;
    lang.isAndroid = isAndroid;
  }

  return detected;
}
