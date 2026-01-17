/**
 * Type Checker Tests
 *
 * Tests for type strictness measurement across languages
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  TYPE_CHECKER_TOOLS,
  parseTscErrors,
  parseMypyErrors,
  parseGoVetErrors,
  measureTypeStrictness,
} from "./type-checker.js";

// Mock the runner module
vi.mock("./runner.js", () => ({
  runTool: vi.fn(),
}));

import { runTool } from "./runner.js";

const mockRunTool = vi.mocked(runTool);

describe("TYPE_CHECKER_TOOLS", () => {
  describe("tool mapping", () => {
    it("maps typescript to tsc", () => {
      const config = TYPE_CHECKER_TOOLS.typescript;
      expect(config).not.toBeNull();
      expect(config?.tool).toBe("tsc");
      expect(config?.command).toEqual(["npx", "tsc", "--noEmit"]);
    });

    it("maps python to mypy", () => {
      const config = TYPE_CHECKER_TOOLS.python;
      expect(config).not.toBeNull();
      expect(config?.tool).toBe("mypy");
      expect(config?.command).toEqual(["mypy", "."]);
    });

    it("maps go to go vet", () => {
      const config = TYPE_CHECKER_TOOLS.go;
      expect(config).not.toBeNull();
      expect(config?.tool).toBe("go vet");
      expect(config?.command).toEqual(["go", "vet", "./..."]);
    });

    it("returns null for javascript (dynamically typed)", () => {
      expect(TYPE_CHECKER_TOOLS.javascript).toBeNull();
    });

    it("returns null for ruby (dynamically typed)", () => {
      expect(TYPE_CHECKER_TOOLS.ruby).toBeNull();
    });

    it("returns null for php (dynamically typed)", () => {
      expect(TYPE_CHECKER_TOOLS.php).toBeNull();
    });
  });
});

describe("parseTscErrors", () => {
  it("returns 0 when exit code is 0", () => {
    const count = parseTscErrors("", "", 0);
    expect(count).toBe(0);
  });

  it("parses summary line 'Found N errors'", () => {
    const stdout = `
src/foo.ts(10,5): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
src/bar.ts(20,3): error TS2322: Type 'boolean' is not assignable to type 'string'.

Found 2 errors.
`;
    const count = parseTscErrors(stdout, "", 1);
    expect(count).toBe(2);
  });

  it("counts error TS patterns when no summary", () => {
    const stdout = `
src/foo.ts(10,5): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
src/bar.ts(20,3): error TS2322: Type 'boolean' is not assignable to type 'string'.
src/baz.ts(5,1): error TS7006: Parameter 'x' implicitly has an 'any' type.
`;
    const count = parseTscErrors(stdout, "", 1);
    expect(count).toBe(3);
  });

  it("handles output in stderr", () => {
    const stderr = `src/index.ts(1,1): error TS1005: ')' expected.`;
    const count = parseTscErrors("", stderr, 1);
    expect(count).toBe(1);
  });
});

describe("parseMypyErrors", () => {
  it("returns 0 when exit code is 0", () => {
    const count = parseMypyErrors("Success: no issues found in 5 source files", "", 0);
    expect(count).toBe(0);
  });

  it("parses summary line 'Found N errors'", () => {
    const stdout = `
app/main.py:10: error: Incompatible return value type
app/utils.py:25: error: Missing positional argument "name"
Found 2 errors in 2 files (checked 10 source files)
`;
    const count = parseMypyErrors(stdout, "", 1);
    expect(count).toBe(2);
  });

  it("counts :line: error: patterns when no summary", () => {
    const stdout = `
app/main.py:10: error: Incompatible return value type
app/main.py:15: error: "str" has no attribute "foo"
app/utils.py:25: error: Missing positional argument
`;
    const count = parseMypyErrors(stdout, "", 1);
    expect(count).toBe(3);
  });
});

describe("parseGoVetErrors", () => {
  it("returns 0 when exit code is 0", () => {
    const count = parseGoVetErrors("", "", 0);
    expect(count).toBe(0);
  });

  it("counts .go:line:col: patterns", () => {
    const stderr = `
# example.com/pkg
./main.go:10:5: result of fmt.Sprintf call not used
./utils.go:25:3: unreachable code
`;
    const count = parseGoVetErrors("", stderr, 1);
    expect(count).toBe(2);
  });

  it("ignores package header lines", () => {
    const stderr = `
# example.com/pkg
./main.go:10:5: unused variable
`;
    const count = parseGoVetErrors("", stderr, 1);
    expect(count).toBe(1);
  });
});

describe("measureTypeStrictness", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns n/a for dynamically typed languages", async () => {
    const result = await measureTypeStrictness("javascript", "/path/to/project");

    expect(result).toEqual({
      metric: "type_strictness",
      tool: "n/a",
      value: 0,
      success: true,
    });

    // Should not call runTool for dynamic languages
    expect(mockRunTool).not.toHaveBeenCalled();
  });

  it("runs tsc for typescript and parses errors", async () => {
    mockRunTool.mockResolvedValue({
      stdout: "src/foo.ts(1,1): error TS2345: ...\n\nFound 1 errors.",
      stderr: "",
      exitCode: 1,
      timedOut: false,
    });

    const result = await measureTypeStrictness("typescript", "/my/project");

    expect(mockRunTool).toHaveBeenCalledWith({
      command: ["npx", "tsc", "--noEmit"],
      cwd: "/my/project",
      timeout: 120000,
    });

    expect(result.metric).toBe("type_strictness");
    expect(result.tool).toBe("tsc");
    expect(result.value).toBe(1);
    expect(result.success).toBe(true);
  });

  it("returns success: false when tool not installed", async () => {
    mockRunTool.mockResolvedValue({
      stdout: "",
      stderr: "tsc not found",
      exitCode: 127,
      timedOut: false,
    });

    const result = await measureTypeStrictness("typescript", "/my/project");

    expect(result.success).toBe(false);
    expect(result.value).toBe(-1);
    expect(result.tool).toBe("tsc");
    expect(result.raw).toContain("not found");
  });

  it("returns success: false when tool times out", async () => {
    mockRunTool.mockResolvedValue({
      stdout: "",
      stderr: "",
      exitCode: -1,
      timedOut: true,
    });

    const result = await measureTypeStrictness("python", "/my/project");

    expect(result.success).toBe(false);
    expect(result.value).toBe(-1);
    expect(result.tool).toBe("mypy");
    expect(result.raw).toBe("Tool execution timed out");
  });

  it("returns 0 errors when tool succeeds", async () => {
    mockRunTool.mockResolvedValue({
      stdout: "",
      stderr: "",
      exitCode: 0,
      timedOut: false,
    });

    const result = await measureTypeStrictness("go", "/my/project");

    expect(result.value).toBe(0);
    expect(result.success).toBe(true);
    expect(result.tool).toBe("go vet");
    expect(result.raw).toBeUndefined();
  });
});
