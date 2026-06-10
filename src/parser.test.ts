import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { findMiraDirectives, parseMystMarkdown } from "./index.js";

describe("parser", () => {
  it("parses augmented/main.md and extracts MIRA directives", () => {
    const markdown = readFileSync(
      join(import.meta.dirname, "..", "test-data", "augmented", "main.md"),
      "utf8",
    );
    const tree = parseMystMarkdown(markdown);
    const directives = findMiraDirectives(tree);
    expect(directives).toMatchSnapshot();
  });
});
