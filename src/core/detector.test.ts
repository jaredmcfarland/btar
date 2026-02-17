/**
 * Language Detector Tests
 * TDD RED phase: Write tests describing expected behavior
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { detectLanguages, detectBuildSystem, LANGUAGE_MARKERS } from "./detector.js";
import type { BTARConfig } from "./types.js";

// Default config for tests
const defaultConfig: BTARConfig = {
  thresholds: {
    type_strictness: 0,
    lint_errors: 0,
    test_coverage: 70,
    ci_time: 600,
    flaky_rate: 1,
  },
  exclude: [],
  languages: [],
};

describe("LANGUAGE_MARKERS", () => {
  it("should define markers for Python", () => {
    expect(LANGUAGE_MARKERS.python).toBeDefined();
    expect(LANGUAGE_MARKERS.python.primary).toContain("pyproject.toml");
    expect(LANGUAGE_MARKERS.python.primary).toContain("setup.py");
  });

  it("should define markers for TypeScript", () => {
    expect(LANGUAGE_MARKERS.typescript).toBeDefined();
    expect(LANGUAGE_MARKERS.typescript.primary).toContain("tsconfig.json");
  });

  it("should define markers for Go", () => {
    expect(LANGUAGE_MARKERS.go).toBeDefined();
    expect(LANGUAGE_MARKERS.go.primary).toContain("go.mod");
  });

  it("should define markers for Java", () => {
    expect(LANGUAGE_MARKERS.java).toBeDefined();
    expect(LANGUAGE_MARKERS.java.primary).toContain("pom.xml");
    expect(LANGUAGE_MARKERS.java.primary).toContain("build.gradle");
  });

  it("should define markers for Kotlin", () => {
    expect(LANGUAGE_MARKERS.kotlin).toBeDefined();
    expect(LANGUAGE_MARKERS.kotlin.primary).toContain("build.gradle.kts");
  });

  it("should define markers for Swift", () => {
    expect(LANGUAGE_MARKERS.swift).toBeDefined();
    expect(LANGUAGE_MARKERS.swift.primary).toContain("Package.swift");
  });

  it("should define markers for Ruby", () => {
    expect(LANGUAGE_MARKERS.ruby).toBeDefined();
    expect(LANGUAGE_MARKERS.ruby.primary).toContain("Gemfile");
  });

  it("should define markers for PHP", () => {
    expect(LANGUAGE_MARKERS.php).toBeDefined();
    expect(LANGUAGE_MARKERS.php.primary).toContain("composer.json");
  });

  it("should define markers for JavaScript", () => {
    expect(LANGUAGE_MARKERS.javascript).toBeDefined();
    expect(LANGUAGE_MARKERS.javascript.primary).toContain("package.json");
  });
});

describe("detectLanguages", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "btar-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe("single language detection", () => {
    it("should detect Python project from pyproject.toml", async () => {
      writeFileSync(join(tempDir, "pyproject.toml"), "[project]\nname = 'test'");

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("python");
      expect(result[0].confidence).toBe("high");
      expect(result[0].markers).toContain("pyproject.toml");
    });

    it("should detect Python project from setup.py", async () => {
      writeFileSync(join(tempDir, "setup.py"), "from setuptools import setup");

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("python");
      expect(result[0].confidence).toBe("high");
    });

    it("should detect Python project from requirements.txt", async () => {
      writeFileSync(join(tempDir, "requirements.txt"), "requests==2.28.0");

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("python");
      expect(result[0].confidence).toBe("medium");
    });

    it("should detect TypeScript project from tsconfig.json", async () => {
      writeFileSync(join(tempDir, "tsconfig.json"), '{ "compilerOptions": {} }');

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("typescript");
      expect(result[0].confidence).toBe("high");
    });

    it("should detect TypeScript from package.json with typescript dependency", async () => {
      writeFileSync(
        join(tempDir, "package.json"),
        JSON.stringify({
          name: "test",
          devDependencies: { typescript: "^5.0.0" },
        })
      );

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result.some((r) => r.language === "typescript")).toBe(true);
    });

    it("should detect Go project from go.mod", async () => {
      writeFileSync(join(tempDir, "go.mod"), "module example.com/test\ngo 1.21");

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("go");
      expect(result[0].confidence).toBe("high");
    });

    it("should detect Java project from pom.xml", async () => {
      writeFileSync(join(tempDir, "pom.xml"), "<project></project>");

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("java");
      expect(result[0].confidence).toBe("high");
    });

    it("should detect Java project from build.gradle", async () => {
      writeFileSync(join(tempDir, "build.gradle"), "plugins { id 'java' }");

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("java");
      expect(result[0].confidence).toBe("high");
    });

    it("should detect Kotlin project from build.gradle.kts", async () => {
      writeFileSync(join(tempDir, "build.gradle.kts"), "plugins { kotlin(\"jvm\") }");

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("kotlin");
      expect(result[0].confidence).toBe("high");
    });

    it("should detect Swift project from Package.swift", async () => {
      writeFileSync(join(tempDir, "Package.swift"), "import PackageDescription");

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("swift");
      expect(result[0].confidence).toBe("high");
    });

    it("should detect Ruby project from Gemfile", async () => {
      writeFileSync(join(tempDir, "Gemfile"), "source 'https://rubygems.org'");

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("ruby");
      expect(result[0].confidence).toBe("high");
    });

    it("should detect PHP project from composer.json", async () => {
      writeFileSync(join(tempDir, "composer.json"), '{ "name": "test/test" }');

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("php");
      expect(result[0].confidence).toBe("high");
    });

    it("should detect JavaScript project from package.json without typescript", async () => {
      writeFileSync(
        join(tempDir, "package.json"),
        JSON.stringify({ name: "test", dependencies: { express: "^4.0.0" } })
      );

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("javascript");
    });
  });

  describe("monorepo detection", () => {
    it("should detect multiple languages in monorepo", async () => {
      // Python + TypeScript monorepo
      writeFileSync(join(tempDir, "pyproject.toml"), "[project]");
      writeFileSync(join(tempDir, "tsconfig.json"), "{}");

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.some((r) => r.language === "python")).toBe(true);
      expect(result.some((r) => r.language === "typescript")).toBe(true);
    });

    it("should detect Go + Java monorepo", async () => {
      writeFileSync(join(tempDir, "go.mod"), "module test");
      writeFileSync(join(tempDir, "pom.xml"), "<project></project>");

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result.some((r) => r.language === "go")).toBe(true);
      expect(result.some((r) => r.language === "java")).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should return empty array for empty directory", async () => {
      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result).toHaveLength(0);
    });

    it("should return empty array for directory with only excluded files", async () => {
      writeFileSync(join(tempDir, "pyproject.toml"), "[project]");

      const configWithExcludes: BTARConfig = {
        ...defaultConfig,
        exclude: ["**/*"],
      };

      const result = await detectLanguages(tempDir, configWithExcludes);

      expect(result).toHaveLength(0);
    });

    it("should respect exclude patterns from config", async () => {
      // Create nested structure
      mkdirSync(join(tempDir, "vendor"), { recursive: true });
      writeFileSync(join(tempDir, "vendor", "pyproject.toml"), "[project]");
      writeFileSync(join(tempDir, "tsconfig.json"), "{}");

      const configWithExcludes: BTARConfig = {
        ...defaultConfig,
        exclude: ["vendor/**"],
      };

      const result = await detectLanguages(tempDir, configWithExcludes);

      // Should only find TypeScript, not Python in vendor
      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("typescript");
    });

    it("should handle non-existent directory gracefully", async () => {
      const result = await detectLanguages("/nonexistent/path", defaultConfig);

      expect(result).toHaveLength(0);
    });
  });

  describe("confidence levels", () => {
    it("should return high confidence for primary markers", async () => {
      writeFileSync(join(tempDir, "pyproject.toml"), "[project]");

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result[0].confidence).toBe("high");
    });

    it("should return medium confidence for secondary markers", async () => {
      writeFileSync(join(tempDir, "requirements.txt"), "requests");

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result[0].confidence).toBe("medium");
    });
  });

  describe("build system detection", () => {
    it("should detect Gradle build system for Java with build.gradle", async () => {
      writeFileSync(join(tempDir, "build.gradle"), "apply plugin: 'java'");

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result[0].language).toBe("java");
      expect(result[0].buildSystem).toBe("gradle");
      expect(result[0].isAndroid).toBe(false);
    });

    it("should detect Android project with com.android.library plugin", async () => {
      writeFileSync(
        join(tempDir, "build.gradle"),
        "apply plugin: 'com.android.library'"
      );

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result[0].language).toBe("java");
      expect(result[0].buildSystem).toBe("gradle");
      expect(result[0].isAndroid).toBe(true);
    });

    it("should detect Android project with AndroidManifest.xml", async () => {
      writeFileSync(join(tempDir, "build.gradle"), "apply plugin: 'java'");
      mkdirSync(join(tempDir, "src", "main"), { recursive: true });
      writeFileSync(
        join(tempDir, "src", "main", "AndroidManifest.xml"),
        "<manifest/>"
      );

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result[0].buildSystem).toBe("gradle");
      expect(result[0].isAndroid).toBe(true);
    });

    it("should detect Maven build system for Java with pom.xml", async () => {
      writeFileSync(join(tempDir, "pom.xml"), "<project/>");

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result[0].language).toBe("java");
      expect(result[0].buildSystem).toBe("maven");
      expect(result[0].isAndroid).toBe(false);
    });

    it("should detect npm build system for TypeScript", async () => {
      writeFileSync(join(tempDir, "tsconfig.json"), "{}");
      writeFileSync(
        join(tempDir, "package.json"),
        JSON.stringify({ devDependencies: { typescript: "^5.0.0" } })
      );

      const result = await detectLanguages(tempDir, defaultConfig);

      const tsLang = result.find((l) => l.language === "typescript");
      expect(tsLang?.buildSystem).toBe("npm");
    });

    it("should detect go-mod build system for Go", async () => {
      writeFileSync(join(tempDir, "go.mod"), "module example.com/foo");

      const result = await detectLanguages(tempDir, defaultConfig);

      expect(result[0].language).toBe("go");
      expect(result[0].buildSystem).toBe("go-mod");
    });
  });
});

describe("detectBuildSystem", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "btar-buildsys-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("returns gradle for directory with gradlew", () => {
    writeFileSync(join(tempDir, "gradlew"), "#!/bin/sh", { mode: 0o755 });
    const result = detectBuildSystem(tempDir, "java");
    expect(result.buildSystem).toBe("gradle");
  });

  it("returns maven for directory with pom.xml", () => {
    writeFileSync(join(tempDir, "pom.xml"), "<project/>");
    const result = detectBuildSystem(tempDir, "java");
    expect(result.buildSystem).toBe("maven");
  });

  it("returns none for directory without build files", () => {
    const result = detectBuildSystem(tempDir, "java");
    expect(result.buildSystem).toBe("none");
  });

  it("returns npm for TypeScript with package.json", () => {
    writeFileSync(join(tempDir, "package.json"), "{}");
    const result = detectBuildSystem(tempDir, "typescript");
    expect(result.buildSystem).toBe("npm");
  });

  it("returns go-mod for Go with go.mod", () => {
    writeFileSync(join(tempDir, "go.mod"), "module test");
    const result = detectBuildSystem(tempDir, "go");
    expect(result.buildSystem).toBe("go-mod");
  });

  it("returns none for unsupported language", () => {
    const result = detectBuildSystem(tempDir, "ruby");
    expect(result.buildSystem).toBe("none");
  });
});
