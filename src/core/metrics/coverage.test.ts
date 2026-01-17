/**
 * Coverage Measurement Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { COVERAGE_TOOLS, measureCoverage } from "./coverage.js";
import * as runner from "./runner.js";

// Mock the runner module
vi.mock("./runner.js", () => ({
  runTool: vi.fn(),
}));

describe("COVERAGE_TOOLS", () => {
  describe("tool mappings", () => {
    it("maps typescript to c8", () => {
      expect(COVERAGE_TOOLS.typescript.tool).toBe("c8");
      expect(COVERAGE_TOOLS.typescript.command).toContain("c8");
    });

    it("maps javascript to c8", () => {
      expect(COVERAGE_TOOLS.javascript.tool).toBe("c8");
      expect(COVERAGE_TOOLS.javascript.command).toContain("c8");
    });

    it("maps python to pytest-cov", () => {
      expect(COVERAGE_TOOLS.python.tool).toBe("pytest-cov");
      expect(COVERAGE_TOOLS.python.command).toContain("pytest");
      expect(COVERAGE_TOOLS.python.command).toContain("--cov=.");
    });

    it("maps go to go test", () => {
      expect(COVERAGE_TOOLS.go.tool).toBe("go test");
      expect(COVERAGE_TOOLS.go.command).toContain("go");
      expect(COVERAGE_TOOLS.go.command).toContain("-cover");
    });

    it("maps all supported languages", () => {
      const languages = [
        "typescript",
        "javascript",
        "python",
        "go",
        "java",
        "kotlin",
        "swift",
        "ruby",
        "php",
      ] as const;

      for (const lang of languages) {
        expect(COVERAGE_TOOLS[lang]).toBeDefined();
        expect(COVERAGE_TOOLS[lang].tool).toBeTruthy();
        expect(COVERAGE_TOOLS[lang].command.length).toBeGreaterThan(0);
        expect(typeof COVERAGE_TOOLS[lang].parseCoverage).toBe("function");
      }
    });
  });
});

describe("coverage parsing", () => {
  describe("c8/nyc parser", () => {
    const parser = COVERAGE_TOOLS.typescript.parseCoverage;

    it("parses All files percentage", () => {
      const stdout = `
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   85.5  |    90.2  |   78.3  |   85.5  |
 src/     |   85.5  |    90.2  |   78.3  |   85.5  |
----------|---------|----------|---------|---------|-------------------
`;
      expect(parser(stdout, "", 0)).toBe(85.5);
    });

    it("parses integer percentage", () => {
      const stdout = `
All files |   100   |   100    |   100   |   100   |
`;
      expect(parser(stdout, "", 0)).toBe(100);
    });

    it("returns -1 for tool not found (exit 127)", () => {
      expect(parser("", "command not found", 127)).toBe(-1);
    });

    it("returns 0 for no coverage data", () => {
      const stdout = "No tests found";
      expect(parser(stdout, "", 1)).toBe(0);
    });

    it("clamps values to 0-100 range", () => {
      // Edge case: percentage > 100 (shouldn't happen but handle it)
      const stdout = `All files | 150.5 |`;
      expect(parser(stdout, "", 0)).toBe(100);
    });
  });

  describe("pytest-cov parser", () => {
    const parser = COVERAGE_TOOLS.python.parseCoverage;

    it("parses TOTAL line percentage", () => {
      const stdout = `
Name                  Stmts   Miss  Cover   Missing
---------------------------------------------------
src/__init__.py           0      0   100%
src/main.py              50     10    80%
---------------------------------------------------
TOTAL                    50     10    80%
`;
      expect(parser(stdout, "", 0)).toBe(80);
    });

    it("parses integer percentage", () => {
      const stdout = `
TOTAL                   100     15    85%
`;
      expect(parser(stdout, "", 0)).toBe(85);
    });

    it("returns -1 for tool not found", () => {
      expect(parser("", "pytest: command not found", 127)).toBe(-1);
    });

    it("returns 0 for no coverage data", () => {
      const stdout = "no tests ran";
      expect(parser(stdout, "", 0)).toBe(0);
    });
  });

  describe("go test parser", () => {
    const parser = COVERAGE_TOOLS.go.parseCoverage;

    it("parses coverage percentage from single package", () => {
      const stdout = `
ok  	example.com/pkg	0.015s	coverage: 72.5% of statements
`;
      expect(parser(stdout, "", 0)).toBe(72.5);
    });

    it("parses coverage from multiple packages (averages)", () => {
      const stdout = `
ok  	example.com/pkg1	0.010s	coverage: 80.0% of statements
ok  	example.com/pkg2	0.012s	coverage: 60.0% of statements
`;
      expect(parser(stdout, "", 0)).toBe(70); // Average of 80 and 60
    });

    it("returns 0 for no test files", () => {
      const stdout = `
?   	example.com/pkg	[no test files]
`;
      expect(parser(stdout, "", 0)).toBe(0);
    });

    it("returns -1 for tool not found", () => {
      expect(parser("", "go: command not found", 127)).toBe(-1);
    });

    it("parses integer percentage", () => {
      const stdout = `
ok  	example.com/pkg	0.015s	coverage: 100% of statements
`;
      expect(parser(stdout, "", 0)).toBe(100);
    });
  });
});

describe("measureCoverage", () => {
  const mockRunTool = vi.mocked(runner.runTool);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns coverage percentage for typescript", async () => {
    mockRunTool.mockResolvedValue({
      stdout: "All files | 85.5 | 90 | 80 | 85.5 |",
      stderr: "",
      exitCode: 0,
      timedOut: false,
    });

    const result = await measureCoverage("typescript", "/test/project");

    expect(result.metric).toBe("test_coverage");
    expect(result.tool).toBe("c8");
    expect(result.value).toBe(85.5);
    expect(result.success).toBe(true);
  });

  it("returns coverage percentage for python", async () => {
    mockRunTool.mockResolvedValue({
      stdout: "TOTAL     100     20    80%",
      stderr: "",
      exitCode: 0,
      timedOut: false,
    });

    const result = await measureCoverage("python", "/test/project");

    expect(result.metric).toBe("test_coverage");
    expect(result.tool).toBe("pytest-cov");
    expect(result.value).toBe(80);
    expect(result.success).toBe(true);
  });

  it("returns coverage percentage for go", async () => {
    mockRunTool.mockResolvedValue({
      stdout: "ok example.com/pkg 0.01s coverage: 72.5% of statements",
      stderr: "",
      exitCode: 0,
      timedOut: false,
    });

    const result = await measureCoverage("go", "/test/project");

    expect(result.metric).toBe("test_coverage");
    expect(result.tool).toBe("go test");
    expect(result.value).toBe(72.5);
    expect(result.success).toBe(true);
  });

  it("uses extended timeout (120s)", async () => {
    mockRunTool.mockResolvedValue({
      stdout: "",
      stderr: "",
      exitCode: 0,
      timedOut: false,
    });

    await measureCoverage("typescript", "/test/project");

    expect(mockRunTool).toHaveBeenCalledWith({
      command: expect.any(Array),
      cwd: "/test/project",
      timeout: 120000,
    });
  });

  it("handles tool not found", async () => {
    mockRunTool.mockResolvedValue({
      stdout: "",
      stderr: "c8: command not found",
      exitCode: 127,
      timedOut: false,
    });

    const result = await measureCoverage("typescript", "/test/project");

    expect(result.success).toBe(false);
    expect(result.value).toBe(-1);
  });

  it("handles timeout", async () => {
    mockRunTool.mockResolvedValue({
      stdout: "",
      stderr: "",
      exitCode: -1,
      timedOut: true,
    });

    const result = await measureCoverage("typescript", "/test/project");

    expect(result.success).toBe(false);
    expect(result.value).toBe(-1);
    expect(result.raw).toContain("timed out");
  });

  it("normalizes value to 0-100 range", async () => {
    // Even if tests fail, if we get coverage output we use it
    mockRunTool.mockResolvedValue({
      stdout: "All files | 45.3 |",
      stderr: "",
      exitCode: 1, // Tests failed but coverage still reported
      timedOut: false,
    });

    const result = await measureCoverage("typescript", "/test/project");

    expect(result.value).toBe(45.3);
    expect(result.success).toBe(true);
  });
});
