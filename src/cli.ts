#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { stdin, stdout, stderr } from "node:process";
import { findMiraDirectives, parseMystMarkdown } from "./index.js";

const help = `Usage: myst-plus-mira [options] [file]

Parse MyST Markdown with MIRA directives and emit JSON.

Options:
  --directives-only  Output only question/claim/evidence/study/request/protocol nodes
  --compact          Emit compact JSON
  --help             Show this help

Reads from stdin when file is omitted or "-".
`;

async function readStdin(): Promise<string> {
  stdin.setEncoding("utf8");

  let input = "";
  for await (const chunk of stdin) {
    input += chunk;
  }

  return input;
}

async function main(argv: string[]): Promise<void> {
  if (argv.includes("--help")) {
    stdout.write(help);
    return;
  }

  const compact = argv.includes("--compact");
  const directivesOnly = argv.includes("--directives-only");
  const file = argv.find((arg) => !arg.startsWith("-"));
  const markdown =
    file && file !== "-" ? await readFile(file, "utf8") : await readStdin();
  const tree = parseMystMarkdown(markdown);
  const result = directivesOnly ? findMiraDirectives(tree) : tree;

  const replacer = (key: string, value: unknown) =>
    key === "position" ? undefined : value;
  stdout.write(`${JSON.stringify(result, replacer, compact ? 0 : 2)}\n`);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  stderr.write(`myst-plus-mira: ${message}\n`);
  process.exitCode = 1;
});
