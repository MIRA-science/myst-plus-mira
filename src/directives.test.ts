import { describe, expect, it } from 'vitest';
import {
  findMiraDirectives,
  miraDirectiveNames,
  parseMystMarkdown,
  type MiraDirectiveName,
} from './index.js';

describe('MIRA directives', () => {
  it('parses a directive into a typed MIRA mdast node', () => {
    const tree = parseMystMarkdown(`:::{claim} Treatment reduces risk
:label: claim-risk
:status: draft

The claim body can contain **nested MyST**.
:::
`);

    const [claim] = findMiraDirectives(tree);

    expect(claim).toMatchObject({
      type: 'claim',
      kind: 'mira',
      directive: 'claim',
      title: 'Treatment reduces risk',
      identifier: 'claim-risk',
      label: 'claim-risk',
      options: {
        label: 'claim-risk',
        status: 'draft',
      },
    });
    expect(claim.children[0]?.type).toBe('paragraph');
  });

  it.each(miraDirectiveNames)('supports the %s directive', (name: MiraDirectiveName) => {
    const tree = parseMystMarkdown(`:::{${name}} ${name} title
Content for ${name}.
:::
`);

    const [node] = findMiraDirectives(tree);

    expect(node.type).toBe(name);
    expect(node.title).toBe(`${name} title`);
    expect(node.children).toHaveLength(1);
  });
});
