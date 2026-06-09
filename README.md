# myst-plus-mira

Parse MyST Markdown with MIRA-specific directives:

- `question`
- `claim`
- `evidence`
- `study`
- `request`
- `protocol`

The package is TypeScript-first and builds on `unified`, mdast, remark-compatible
pipelines, and the JavaScript `myst-parser` package.

## Install

```bash
npm install
npm run build
```

## Use as a library

```ts
import { findMiraDirectives, parseMystMarkdown } from 'myst-plus-mira';

const tree = parseMystMarkdown(`:::{claim} Treatment reduces risk
:label: claim-risk

The claim body can contain **nested MyST**.
:::
`);

const miraNodes = findMiraDirectives(tree);
```

Each directive becomes an mdast-compatible node whose `type` is the directive
name. The directive body is parsed as nested MyST content.

```json
{
  "type": "claim",
  "kind": "mira",
  "directive": "claim",
  "title": "Treatment reduces risk",
  "identifier": "claim-risk",
  "label": "claim-risk",
  "options": {
    "label": "claim-risk"
  },
  "children": []
}
```

## Use as a CLI

```bash
myst-plus-mira document.md
myst-plus-mira --directives-only document.md
cat document.md | myst-plus-mira --compact -
```

The CLI emits JSON for either the full MyST/mdast tree or only the MIRA
directive nodes.
