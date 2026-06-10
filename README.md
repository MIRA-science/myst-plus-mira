# myst-plus-mira

Parse MyST Markdown with MIRA-specific directives:

| Directive          | Relations                                               |
|--------------------|---------------------------------------------------------|
| `question`         | —                                                       |
| `claim`            | `:addresses:` (question ids)                            |
| `evidence`         | `:supports:` (claim ids), `:derived-from:` (study ids)  |
| `study`            | `:produces:` (evidence ids)                             |
| `protocol`         | —                                                       |
| `follows-protocol` | `:modified-by:` (protocol modification ids)             |
| `request`          | —                                                       |

The package is TypeScript-first and builds on `unified`, mdast, remark-compatible
pipelines, and the JavaScript `myst-parser` package.

## Install

```bash
npm install
npm run build
```

## Use as a library

```ts
import { findMiraDirectives, parseMystMarkdown } from "myst-plus-mira";

const tree = parseMystMarkdown(`
:::{question} Does treatment X reduce cardiovascular risk?
:label: q-risk
:::

:::{claim} Treatment X reduces risk
:label: claim-risk
:addresses: q-risk

Treatment X significantly reduces cardiovascular risk in the target population.
:::

:::{evidence} RCT results support the claim
:label: evidence-rct
:supports: claim-risk
:derived-from: study-rct

The RCT showed a 30% reduction in events (p < 0.01).
:::

:::{study} RCT of Treatment X
:label: study-rct
:produces: evidence-rct
:::
`);

const miraNodes = findMiraDirectives(tree);
```

Each directive becomes an mdast-compatible node whose `type` is the directive
name. The directive argument is the human-readable statement/title; `:label:` is
the optional stable identifier for cross-references. Relation options are parsed
into typed arrays on the node.

```json
{
  "type": "claim",
  "kind": "mira",
  "directive": "claim",
  "title": "Treatment X reduces risk",
  "identifier": "claim-risk",
  "label": "claim-risk",
  "addresses": ["q-risk"],
  "options": {
    "label": "claim-risk",
    "addresses": "q-risk"
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

## Use-case context

The user story, constraints, and syntax spec that motivate this parser live in
[`docs/use-case-context/`](./docs/use-case-context/) — start with
[`docs/use-case-context/AGENTS.md`](./docs/use-case-context/AGENTS.md). It documents the three
build targets (parser / visualizer / transporter), the normative rules, and how this
parser currently stands relative to the spec.
