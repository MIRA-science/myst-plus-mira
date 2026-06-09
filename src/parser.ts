import { mystParser, mystParse } from 'myst-parser';
import { unified } from 'unified';
import type { DirectiveSpec, GenericNode, GenericParent } from 'myst-common';
import { isMiraDirectiveNode, miraDirectives, type MiraDirectiveNode } from './directives.js';

export type MystParserOptions = NonNullable<Parameters<typeof mystParse>[1]>;

export interface MiraParserOptions extends Omit<MystParserOptions, 'directives'> {
  directives?: DirectiveSpec[];
}

function withMiraDirectives(options: MiraParserOptions = {}): MystParserOptions {
  const { directives = [], ...mystOptions } = options;

  return {
    ...mystOptions,
    directives: [...miraDirectives, ...directives],
  };
}

export function createMiraProcessor(options: MiraParserOptions = {}) {
  return unified().use(mystParser, withMiraDirectives(options));
}

export function parseMystMarkdown(markdown: string, options: MiraParserOptions = {}): GenericParent {
  return createMiraProcessor(options).parse(markdown) as GenericParent;
}

export function parseMystMarkdownDirect(markdown: string, options: MiraParserOptions = {}) {
  return mystParse(markdown, withMiraDirectives(options));
}

export function findMiraDirectives(tree: GenericNode): MiraDirectiveNode[] {
  const nodes: MiraDirectiveNode[] = [];

  function visit(node: GenericNode): void {
    if (isMiraDirectiveNode(node)) nodes.push(node);
    node.children?.forEach(visit);
  }

  visit(tree);
  return nodes;
}
