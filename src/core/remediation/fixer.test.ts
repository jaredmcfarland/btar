/**
 * Fix Tool Tests
 * Tests for auto-fix functionality
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  FIX_TOOLS,
  runFix,
  parseEslintFixOutput,
  parseRuffFixOutput,
  parseGofmtOutput,
  parseSwiftformatOutput,
  parseKtlintFormatOutput,
  parseRubocopFixOutput,
  parsePhpCsFixerOutput,
  parseGoogleJavaFormatOutput,
} from "./fixer.js";
import * as runner from "../metrics/runner.js";

// Mock the runner module
vi.mock("../metrics/runner.js", () => ({
  runTool: vi.fn(),
}));

describe("FIX_TOOLS", () => {
  it("should define eslint for typescript", () => {
    expect(FIX_TOOLS.typescript).toBeDefined();
    expect(FIX_TOOLS.typescript.tool).toBe("eslint");
    expect(FIX_TOOLS.typescript.command).toContain("--fix");
  });

  it("should define eslint for javascript", () => {
    expect(FIX_TOOLS.javascript).toBeDefined();
    expect(FIX_TOOLS.javascript.tool).toBe("eslint");
    expect(FIX_TOOLS.javascript.command).toContain("--fix");
  });

  it("should define ruff for python", () => {
    expect(FIX_TOOLS.python).toBeDefined();
    expect(FIX_TOOLS.python.tool).toBe("ruff");
    expect(FIX_TOOLS.python.command).toContain("--fix");
  });

  it("should define gofmt for go", () => {
    expect(FIX_TOOLS.go).toBeDefined();
    expect(FIX_TOOLS.go.tool).toBe("gofmt");
    expect(FIX_TOOLS.go.command).toContain("-w");
  });

  it("should define google-java-format for java", () => {
    expect(FIX_TOOLS.java).toBeDefined();
    expect(FIX_TOOLS.java.tool).toBe("google-java-format");
    expect(FIX_TOOLS.java.command).toContain("--replace");
  });

  it("should define swiftformat for swift", () => {
    expect(FIX_TOOLS.swift).toBeDefined();
    expect(FIX_TOOLS.swift.tool).toBe("swiftformat");
  });

  it("should define ktlint for kotlin", () => {
    expect(FIX_TOOLS.kotlin).toBeDefined();
    expect(FIX_TOOLS.kotlin.tool).toBe("ktlint");
    expect(FIX_TOOLS.kotlin.command).toContain("--format");
  });

  it("should define rubocop for ruby", () => {
    expect(FIX_TOOLS.ruby).toBeDefined();
    expect(FIX_TOOLS.ruby.tool).toBe("rubocop");
    expect(FIX_TOOLS.ruby.command).toContain("--autocorrect");
  });

  it("should define php-cs-fixer for php", () => {
    expect(FIX_TOOLS.php).toBeDefined();
    expect(FIX_TOOLS.php.tool).toBe("php-cs-fixer");
    expect(FIX_TOOLS.php.command).toContain("fix");
  });

  it("should have all 9 supported languages defined", () => {
    const languages = [
      "typescript",
      "javascript",
      "python",
      "go",
      "java",
      "swift",
      "kotlin",
      "ruby",
      "php",
    ];
    for (const lang of languages) {
      expect(
        FIX_TOOLS[lang as keyof typeof FIX_TOOLS],
        `${lang} should have fix tool defined`
      ).toBeDefined();
    }
  });
});

describe("parseEslintFixOutput", () => {
  it("should return success for exit code 0", () => {
    const result = parseEslintFixOutput("", "", 0);
    expect(result.success).toBe(true);
    expect(result.tool).toBe("eslint");
    expect(result.message).toContain("successfully");
  });

  it("should return success with message for unfixable errors", () => {
    const result = parseEslintFixOutput("", "", 1);
    expect(result.success).toBe(true);
    expect(result.message).toContain("unfixable");
  });
});

describe("parseRuffFixOutput", () => {
  it("should extract fixed count from stderr", () => {
    const result = parseRuffFixOutput(
      "",
      "Fixed 5 errors in 3 files",
      0
    );
    expect(result.success).toBe(true);
    expect(result.filesModified).toBe(3);
    expect(result.message).toContain("5 errors");
    expect(result.tool).toBe("ruff");
  });

  it("should return success for exit code 0 without count", () => {
    const result = parseRuffFixOutput("", "", 0);
    expect(result.success).toBe(true);
    expect(result.tool).toBe("ruff");
  });

  it("should handle singular error", () => {
    const result = parseRuffFixOutput("", "Fixed 1 error in 1 file", 0);
    expect(result.success).toBe(true);
    expect(result.filesModified).toBe(1);
    expect(result.message).toContain("1 error");
  });
});

describe("parseGofmtOutput", () => {
  it("should return success for exit code 0", () => {
    const result = parseGofmtOutput("", "", 0);
    expect(result.success).toBe(true);
    expect(result.tool).toBe("gofmt");
    expect(result.message).toContain("successfully");
  });

  it("should return failure for non-zero exit", () => {
    const result = parseGofmtOutput("", "syntax error", 1);
    expect(result.success).toBe(false);
    expect(result.message).toContain("syntax error");
  });
});

describe("parseSwiftformatOutput", () => {
  it("should count formatted files from stdout", () => {
    const result = parseSwiftformatOutput(
      "file1.swift\nfile2.swift\nfile3.swift",
      "",
      0
    );
    expect(result.success).toBe(true);
    expect(result.filesModified).toBe(3);
    expect(result.tool).toBe("swiftformat");
  });

  it("should return failure for non-zero exit", () => {
    const result = parseSwiftformatOutput("", "error", 1);
    expect(result.success).toBe(false);
  });
});

describe("parseKtlintFormatOutput", () => {
  it("should return success for exit code 0", () => {
    const result = parseKtlintFormatOutput("", "", 0);
    expect(result.success).toBe(true);
    expect(result.tool).toBe("ktlint");
  });

  it("should return failure for non-zero exit", () => {
    const result = parseKtlintFormatOutput("", "error", 1);
    expect(result.success).toBe(false);
  });
});

describe("parseRubocopFixOutput", () => {
  it("should extract corrected count from output", () => {
    const result = parseRubocopFixOutput(
      "10 files inspected, 5 offenses detected, 3 offenses corrected",
      "",
      0
    );
    expect(result.success).toBe(true);
    expect(result.filesModified).toBe(10);
    expect(result.message).toContain("3 offenses");
    expect(result.tool).toBe("rubocop");
  });

  it("should return success for clean exit", () => {
    const result = parseRubocopFixOutput("5 files inspected, no offenses", "", 0);
    expect(result.success).toBe(true);
  });
});

describe("parsePhpCsFixerOutput", () => {
  it("should count fixed PHP files", () => {
    const result = parsePhpCsFixerOutput(
      "   1) src/test.php\n   2) src/foo.php",
      "",
      0
    );
    expect(result.success).toBe(true);
    expect(result.filesModified).toBe(2);
    expect(result.tool).toBe("php-cs-fixer");
  });

  it("should return failure for non-zero exit", () => {
    const result = parsePhpCsFixerOutput("", "error", 1);
    expect(result.success).toBe(false);
  });
});

describe("parseGoogleJavaFormatOutput", () => {
  it("should return success for exit code 0", () => {
    const result = parseGoogleJavaFormatOutput("", "", 0);
    expect(result.success).toBe(true);
    expect(result.tool).toBe("google-java-format");
  });

  it("should return failure for non-zero exit", () => {
    const result = parseGoogleJavaFormatOutput("", "error", 1);
    expect(result.success).toBe(false);
  });
});

describe("runFix", () => {
  const mockRunTool = runner.runTool as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return success for typescript fix", async () => {
    mockRunTool.mockResolvedValueOnce({
      stdout: "",
      stderr: "",
      exitCode: 0,
      timedOut: false,
    });

    const result = await runFix("typescript", "/test/dir");

    expect(result.success).toBe(true);
    expect(result.tool).toBe("eslint");
  });

  it("should return success for python fix with ruff", async () => {
    mockRunTool.mockResolvedValueOnce({
      stdout: "",
      stderr: "Fixed 3 errors in 2 files",
      exitCode: 0,
      timedOut: false,
    });

    const result = await runFix("python", "/test/dir");

    expect(result.success).toBe(true);
    expect(result.tool).toBe("ruff");
    expect(result.filesModified).toBe(2);
  });

  it("should handle tool not found gracefully (exit code 127)", async () => {
    mockRunTool.mockResolvedValueOnce({
      stdout: "",
      stderr: "eslint: command not found",
      exitCode: 127,
      timedOut: false,
    });

    const result = await runFix("typescript", "/test/dir");

    expect(result.success).toBe(false);
    expect(result.message).toContain("not found");
    expect(result.filesModified).toBe(0);
  });

  it("should handle timeout gracefully", async () => {
    mockRunTool.mockResolvedValueOnce({
      stdout: "",
      stderr: "",
      exitCode: -1,
      timedOut: true,
    });

    const result = await runFix("go", "/test/dir");

    expect(result.success).toBe(false);
    expect(result.message).toContain("timed out");
    expect(result.filesModified).toBe(0);
  });

  it("should pass correct working directory to runTool", async () => {
    mockRunTool.mockResolvedValueOnce({
      stdout: "",
      stderr: "",
      exitCode: 0,
      timedOut: false,
    });

    await runFix("python", "/my/project/dir");

    expect(mockRunTool).toHaveBeenCalledWith({
      command: expect.arrayContaining(["ruff"]),
      cwd: "/my/project/dir",
      timeout: 120000,
    });
  });

  it("should use correct fix command for each language", async () => {
    mockRunTool.mockResolvedValue({
      stdout: "",
      stderr: "",
      exitCode: 0,
      timedOut: false,
    });

    // Test a few languages
    await runFix("typescript", "/test");
    expect(mockRunTool).toHaveBeenLastCalledWith(
      expect.objectContaining({
        command: expect.arrayContaining(["eslint", "--fix"]),
      })
    );

    await runFix("python", "/test");
    expect(mockRunTool).toHaveBeenLastCalledWith(
      expect.objectContaining({
        command: expect.arrayContaining(["ruff", "--fix"]),
      })
    );

    await runFix("go", "/test");
    expect(mockRunTool).toHaveBeenLastCalledWith(
      expect.objectContaining({
        command: expect.arrayContaining(["gofmt", "-w"]),
      })
    );
  });
});
