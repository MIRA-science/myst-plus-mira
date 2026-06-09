# Discourse Graphs for MyST Markdown: Specification

**Version:** 2.0-draft  
**Date:** 2026-06-09  
**Authors:**
- Matt Akamatsu (ORCID: [0000-0002-0286-5310](https://orcid.org/0000-0002-0286-5310))
- Claude Opus 4.5 / 4.8 (Anthropic)
Derived from a document drafted by Anton Molina (ORCID: [0000-0002-7253-2714](https://orcid.org/0000-0002-7253-2714)); grounded in the MIRA / Discourse Graphs LinkML schema.

**Status:** Proposal

> **What changed from v1 (2025-12-17).** v1 specified a deliberately minimal Phase‑1 vocabulary — two directives (`{claim}`, `{evidence}`) plus an extended `{figure}`. This v2 brings the spec in line with (a) the canonical **MIRA schema** — the *full complement of node types* (`Question`, `Claim`, `Evidence`, `Study`, `Protocol`, `Request`) and their real edges — and (b) the reference parser in [`MIRA-science/myst-plus-mira`](https://github.com/MIRA-science/myst-plus-mira), which already registers those six directives. The biggest concrete change: the directive **argument is now the human-readable statement/title**, and **`:label:` (or `:id:`) is the optional stable identifier** (MyST-native: `:label:` is the cross-reference target). This is the inverse of v1, where the argument was the id. The extended `{figure}` directive and several relations are deferred — see [Future Work](#future-work).

---

## Overview

In our lab, it is possible to make meaningful progress on an experimental or engineering workflow in a single day. However, current tools separate data from claims and do not support continuous workflows. They also make it challenging to rigorously share work across labs.

This specification defines a set of MyST Markdown **directives** and **roles** for embedding **discourse graph** semantics — the MIRA node grammar — directly into scientific documents (developer notes, Curvenote articles, Jupyter notebooks). By making the structure of a scientific argument explicit in the document, we can (1) render and visualize it in the published page, (2) extract a typed graph from the MyST AST, and (3) serialize a self-describing subgraph that travels into a collaborator's discourse graph.

### Goals

1. Let researchers systematically connect **questions → claims → evidence → the studies and protocols that produced it**.
2. Keep developer notes short, modular, and focused.
3. Make connections identifiable across notes, papers, and working groups.
4. Provide a foundation for queryable databases combining formulations, designs, and performance data — and for cross-tool sharing.

### Design principles

- **MyST-native.** Use real directives and roles; `:label:` is the cross-reference id, as everywhere else in MyST.
- **Complete but lightweight.** Cover the full MIRA node grammar, but keep per-node syntax minimal; advanced metadata is optional.
- **Stable references, human-first.** The argument is the human statement; an optional `:label:`/`:id:` gives a stable handle for references and cross-document use.
- **Progressive complexity.** Start with `{question}`/`{claim}`/`{evidence}`; add `{study}`/`{protocol}`/`{request}` as the work warrants.
- **Schema-grounded.** Node types and edges map 1:1 onto the canonical MIRA LinkML schema, so a document serializes cleanly to JSON-LD/RDF.

---

## Core concepts

### The MIRA node grammar

Discourse graphs decompose scientific work into modular, typed, reusable nodes. MIRA defines six:

| Node | Directive | Definition | MIRA / DG class |
|------|-----------|------------|-----------------|
| **Question** | `{question}` | A scientific unknown we want to make known, addressable by research methods. | `mira:Question` (`dg:Question`) |
| **Claim** | `{claim}` | An atomic, generalized assertion that (proposes to) answer a Question. | `mira:Claim` (`dg:Claim`) |
| **Evidence** | `{evidence}` | A specific empirical observation from one application of a research method. | `mira:Evidence` (`dg:Evidence`, a `prov:Entity`) |
| **Study** | `{study}` | A research activity/experiment that produced a data artifact. | `mira:Study` (`prov:Activity`) |
| **Protocol** | `{protocol}` | The method/approach a Study follows to generate Evidence. | `mira:Protocol` (`prov:Activity`) |
| **Request** | `{request}` | A requested-but-not-yet-existing experiment/analysis — the collaboration primitive. | `mira:Request` |

Both `Claim` and `Evidence` are **Arguments** (they can `supports`/`opposes` a Claim).

### The relations (edges)

These are exactly the edges in the MIRA schema. Each is declared on its **source** node (the node whose domain it is):

| Edge | Source → Target | Declared on | Meaning |
|------|-----------------|-------------|---------|
| `addresses` | Claim → Question | `{claim}` | the claim proposes to answer the question |
| `supports` | Evidence \| Claim → Claim | `{evidence}` / `{claim}` | the source provides positive support for the claim |
| `opposes` | Evidence \| Claim → Claim | `{evidence}` / `{claim}` | the source contradicts/weakens the claim |
| `grounds` | Study → Evidence | `{study}` | the study produced / grounds the observation (inverse: `is_grounded_in`) |
| `follows` | Study → Protocol | `{study}` | the study follows this protocol (the canvas labels this "uses") |
| `request_target` | Request → Claim | `{request}` | the claim the requested work would illuminate |
| `request_for` | Request → Study | `{request}` | the study the request asks to be done |

The argument structure, end to end:

```
Question  ◄──addresses──  Claim  ◄──supports/opposes──  Evidence  ◄──grounds──  Study  ──follows──►  Protocol
                            ▲                                                       ▲
                            └──────────── Request ──request_target───────┘  (request_for ──►)
```

Evidence additionally carries (from the DG core, for provenance and literature use): `observationStatement` (→ Claim, what the observation asserts), `observationOriginActivity` (→ the Study/Activity at its origin), `observationBase` (→ the data Entity the observation rests on), and `sourceDocument` (→ a SourceDocument, for literature-derived Evidence). These are optional and discussed under [Data model](#data-model--schema-mapping).

---

## Syntax reference

**General form.** Every MIRA directive takes the same shape:

```markdown
:::{<type>} <human-readable statement / title>
:label: <optional-stable-id>
:<relation>: <target-id>            # zero or more relation options
:<field>: <value>                   # zero or more freeform fields

Optional body — nested MyST Markdown (prose, lists, math, etc.).
:::
```

- **Argument** (after `{type}`) — the **human-readable statement** (the claim text, the question, …). Becomes the node `title`. Optional if `:title:` is given.
- **`:label:`** — the **stable identifier** for cross-referencing (MyST-native). `:id:` is an accepted alias and takes precedence; `:name:` also aliases. Optional, but **recommended for any node referenced elsewhere or expected to be renamed**.
- **Relation options** — `:supports:`, `:opposes:`, `:addresses:`, `:grounds:`, `:follows:`, `:request-target:`, `:request-for:`. Single value or a list: `:supports: [claim-a, claim-b]`.
- **Body** — parsed as nested MyST.
- **Freeform fields** (e.g. `:status:`, `:method:`, `:source:`, `:doi:`, `:url:`, `:tags:`, `:priority:`) — allowed and carried as metadata; encode something in a *typed* relation only when a tool must understand it (otherwise prose/freeform is fine).

### `{question}`

```markdown
:::{question} Is the TetR/TetO biosensor system functional in Nucleus Cytosol?
:label: q-tetR-cytosol
:::
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| Argument | Yes* | The question, in human-readable form (*or supply `:title:`). |
| `:label:` / `:id:` | No | Stable identifier. |
| Body | No | Extended context. |

### `{claim}`

```markdown
:::{claim} The TetR sensor with a catecholase reporter is compatible with Nucleus Cytosol
:label: claim-tetR-compatible
:addresses: q-tetR-cytosol

Optional synthesis of why we believe this.
:::
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| Argument | Yes* | The claim statement. |
| `:label:` / `:id:` | No | Stable identifier. |
| `:addresses:` | No | Question id(s) this claim answers. |
| `:supports:` / `:opposes:` | No | Claim id(s) this claim supports/opposes (claim-to-claim argument). |
| Body | No | Extended description. |

### `{evidence}`

```markdown
:::{evidence} Sensor converts catechol to a yellow product above visual threshold only with 10 µM aTc
:label: ev-atc-derepression
:supports: claim-tetR-compatible
:data: ./experiments/pT7_TetO_catecholase.csv      # pointer to the underlying data (observationBase)

What was observed, with enough context to read it cold.
:::
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| Argument | Yes* | The observation statement. |
| `:label:` / `:id:` | No | Stable identifier. |
| `:supports:` / `:opposes:` | No | Claim id(s) this evidence supports/opposes. |
| `:data:` | No | **Pointer** to the underlying data artifact (the `observationBase`) — a path, S3/HTTP URI, or repo+commit+path. Never the data itself. |
| `:source:` | No | For literature-derived evidence: a citation / DOI / `SourceDocument` id. |
| Body | No | Extended description / context. |

### `{study}`

```markdown
:::{study} aTc dose-response in standard Nucleus Cytosol
:label: study-atc-platereader
:grounds: ev-atc-derepression
:follows: protocol-platereader-a385

10 µl reactions, 1 mM catechol, 20 nM sensor DNA, 37 °C in a plate reader.
:::
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| Argument | Yes* | Short name of the experiment/activity. |
| `:label:` / `:id:` | No | Stable identifier. |
| `:grounds:` | No | Evidence id(s) this study produced/grounds. |
| `:follows:` | No | Protocol id(s) this study follows. |
| Body | No | Experimental detail (or a pointer to it). |

### `{protocol}`

```markdown
:::{protocol} Plate-reader absorbance assay (A385)
:label: protocol-platereader-a385

Measure A385 over time; visual threshold A385 = 1.0. (Link or embed the full protocol.)
:::
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| Argument | Yes* | Protocol name. |
| `:label:` / `:id:` | No | Stable identifier. |
| Body | No | The method, or a pointer to it. |

### `{request}`

```markdown
:::{request} Encapsulate the sensor and test whether 10 µM aTc is sufficient for derepression
:label: req-encapsulation
:request-target: claim-tetR-compatible
:motivation: Determine whether DNA template should be tuned to control leak.
:skill: cell-free encapsulation

Optional detail.
:::
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| Argument | Yes* | What is being requested (an experiment/analysis that does not exist yet). |
| `:label:` / `:id:` | No | Stable identifier. |
| `:request-target:` | No | Claim id(s) the requested work would illuminate (→ `request_target`). |
| `:request-for:` | No | Study id the request asks to be done (→ `request_for`). |
| `:motivation:`, `:skill:` | No | Why it's needed; skill required to claim it. |
| Body | No | Extended description. |

---

## Inline references with roles

For referencing discourse nodes within prose, use inline role syntax with the node's id (or its statement):

```markdown
This preliminary test {claim}`claim-tetR-compatible` is backed by
{evidence}`ev-atc-derepression`, produced in {study}`study-atc-platereader`.
```

Roles are available for every node type: `{question}`, `{claim}`, `{evidence}`, `{study}`, `{protocol}`, `{request}`. (MyST's native `{ref}` / `[](#label)` cross-references also resolve to a node by its `:label:`.)

---

## Complete example

A full developer note exercising all six node types:

```markdown
---
title: "DevNote: TetO-catecholase sensor in Nucleus Cytosol"
authors:
  - name: Maram Naji
date: 2026-05-08
---

# Overview

:::{question} Is the TetR/TetO biosensor system functional in Nucleus Cytosol?
:label: q-tetR-cytosol
:::

:::{claim} The TetR sensor with a catecholase reporter is compatible with Nucleus Cytosol
:label: claim-tetR-compatible
:addresses: q-tetR-cytosol
:::

# Results

:::{evidence} Sensor converts catechol to a yellow product above visual threshold only with 10 µM aTc
:label: ev-atc-derepression
:supports: claim-tetR-compatible
:data: ./experiments/pT7_TetO_catecholase.csv
:::

:::{study} aTc dose-response in standard Nucleus Cytosol
:label: study-atc-platereader
:grounds: ev-atc-derepression
:follows: protocol-platereader-a385
:::

:::{protocol} Plate-reader absorbance assay (A385)
:label: protocol-platereader-a385

A385 over time; visual threshold A385 = 1.0; 10 µl reactions at 37 °C.
:::

# Conclusion and next steps

This preliminary result {claim}`claim-tetR-compatible` is supported by
{evidence}`ev-atc-derepression`.

:::{request} Encapsulate the sensor and test whether 10 µM aTc is sufficient for derepression
:label: req-encapsulation
:request-target: claim-tetR-compatible
:motivation: Determine whether the DNA template should be tuned to control leak.
:::
```

---

## Reference resolution

When a relation option names a target, the resolver follows this order:

1. **Exact ID match** — the value matches a node's `:label:`/`:id:`.
2. **Exact statement match** — the value matches a node's argument/title text exactly.
3. **Unique partial match** — the value is a unique substring of a statement (emit a **warning**).
4. **Error** — no match, or ambiguous matches.

Resolution warnings/errors should be emitted on the MyST `vfile` (a build warning), and **must not** crash the build or drop the authored prose. **Recommendation:** give any node referenced across documents — or that you may rename — an explicit `:label:`/`:id:`.

---

## Data model & schema mapping

The directives map 1:1 onto the canonical MIRA LinkML schema ([`MIRA-science/schema`](https://github.com/MIRA-science/schema): `mira.yaml`, which imports `discoursegraphs.yaml` / `dg_core`). The **interchange format is JSON-LD/RDF** via the published context (`mira.context.jsonld`).

| Directive | Class | Key slots (this spec) |
|-----------|-------|-----------------------|
| `{question}` | `mira:Question` (`dg:Question`) | — |
| `{claim}` | `mira:Claim` (`dg:Claim`, an `Argument`) | `addresses`, `supports`, `opposes` |
| `{evidence}` | `mira:Evidence` (`dg:Evidence`, an `Argument`, a `prov:Entity`) | `supports`, `opposes`, `observationBase` (`:data:`), `observationOriginActivity`, `sourceDocument` (`:source:`) |
| `{study}` | `mira:Study` (`prov:Activity`) | `grounds` (inverse `is_grounded_in`), `follows` |
| `{protocol}` | `mira:Protocol` (`prov:Activity`) | — |
| `{request}` | `mira:Request` | `request_target`, `request_for` |

**Layering (connect, don't absorb).** Provenance of *how data was produced* (Study/Protocol as `prov:Activity`; finer pipeline lineage via PROV-O, Snakemake/Nextflow) and domain ontologies (e.g. SBOL for synthetic-biology constructs) live in **adjacent/lower layers the graph points to**, not inside the discourse layer. Discourse graphs answer *what question / what claim / what evidence*; PROV-O answers *what software/protocol produced this artifact*. Per **pointers-not-payloads**, data/code/media are referenced by URI, never embedded.

---

## AST representation

The reference parser ([`myst-plus-mira`](https://github.com/MIRA-science/myst-plus-mira)) emits, for each directive, an mdast-compatible node:

```json
{
  "type": "claim",
  "kind": "mira",
  "directive": "claim",
  "title": "The TetR sensor with a catecholase reporter is compatible with Nucleus Cytosol",
  "identifier": "claim-tetR-compatible",
  "label": "claim-tetR-compatible",
  "options": {
    "label": "claim-tetR-compatible",
    "addresses": "q-tetR-cytosol"
  },
  "children": [ { "type": "paragraph", "children": [] } ]
}
```

- `title` ← the directive argument (or `:title:`).
- `identifier` / `label` ← `:id:` ?? `:label:` ?? `:name:`.
- `options` ← all named options **as authored**, including relation options.
- `children` ← the parsed body (nested MyST).

**Edges are not yet resolved.** Today relation options live as raw strings in `options`. The next implementation step (see [Future Work](#future-work)) is a **resolution pass** that turns those into typed edges — e.g. a normalized `relations` array on each node, or a separate edge list:

```json
{ "source": "ev-atc-derepression", "type": "supports", "target": "claim-tetR-compatible" }
```

This resolved graph is what the visualizer renders and the transporter serializes to JSON-LD.

---

## Known limitations (this version)

Out of scope for v2; revisit with user feedback:

1. **Relation attributes** — no confidence, weight, or provenance on edges yet (just source/target/type).
2. **Namespace prefixes / CURIEs** — no `dg:claim` / `biolab:construct` extensibility; the six node types are fixed.
3. **Reified relation nodes** — relations are declared on the source node, not as first-class `{relation}` nodes.
4. **Bidirectional declaration** — declare each edge once, on its source; inverses (`supportedBy`, `is_grounded_in`, …) are derived, not authored.
5. **Cross-document resolution** — references resolve within a single document/project.

---

## Future Work

The following are deliberately **not** in this version. They are the most likely next increments.

### Extended `{figure}` directive (and figure/data grounding)

v1 proposed extending MyST's `{figure}` with discourse relations so a figure could `:grounds:` an Evidence node. We defer it because of a **semantic mismatch with the schema** that must be resolved first: in the MIRA schema, `grounds` is **`Study → Evidence`**, and a figure/dataset is the Evidence's **`observationBase`** (a `prov:Entity`), *not* a grounding activity. A future `{figure}` extension should therefore either (a) attach the figure/data as the Evidence's `observationBase` pointer, and/or (b) mint a `Study` for the producing code cell — not introduce a `Figure → Evidence` `grounds` edge that contradicts the schema. Related, deferred pieces:

- **Jupyter cell provenance.** A figure generated by a labeled notebook cell (`#fig-cell-label`) implies a chain `dataset → code cell → figure → evidence → claim`. Decide how much of this is explicit in the AST (e.g. a `:data-source:` option) vs. left implicit in the code.
- **Reconciling existing notes.** Developer notes today (e.g. the `myst-plus-mira` test-data) use `:::{figure} … :grounds: <evidence>`; a migration path is needed.

### Relations present in the DG grammar but not yet in the LinkML schema

- **`informs`** (Evidence/Result/Claim → Question/Hypothesis), **`reproduces`** (Evidence → Evidence), **`resolves`** (Result → Issue). These appear in the Discourse Graphs node grammar but are **not yet slots in `mira.yaml`/`dg_core`**. Add them to the schema first, then expose as directive options.
- **Hypothesis** as a distinct node type (the DG grammar separates Hypothesis from Claim; MIRA currently folds the answering assertion into `Claim`).

### `SourceDocument` and literature-derived evidence

Promote `:source:` into a first-class `{source}` directive (`dg:SourceDocument`) so literature-derived Evidence can `sourceDocument`-link to a citable work (`describesActivity` → the Study it reports).

### Extensibility (the original "Phase 2")

- A generic `{discourse} prefix:type` directive with **namespace/CURIE** support and frontmatter prefix declarations.
- **Reified `{relation}` nodes** carrying attributes (`:confidence:`, `:provenance:`).
- Custom domain node types (e.g. `biolab:construct` with a sequence pointer).

### Cross-document identity & export

- **Persistent, resolvable IDs across documents** via **OXA** (Curvenote's Open eXchange Architecture). Design `:label:`/`:id:` to be OXA-upgradable.
- **Edge-resolution pass + validation + autocomplete** (resolve relation options to typed edges; warn on dangling references; autocomplete ids when typing `:supports:`).
- **`myst export --format=discourse-graph document.md > graph.jsonld`** — emit the resolved subgraph as JSON-LD/RDF for transport into another lab's graph.

### Authoring ergonomics

- **Study-as-container.** Allow a `{study}` block to *contain* its `{protocol}` and `{evidence}` blocks, with the `grounds`/`follows` edges inferred from nesting (an alternative to declaring them by reference).
- **Rendering.** Per-format rendering of discourse nodes (HTML colored boxes with expandable relation links; PDF numbered statements; JATS `<statement>` elements) — out of scope for this *syntax* spec.

---

## Development notes

Ongoing development notes: [Project/DG in MyST markdown](https://roamresearch.com/#/app/discourse-graphs/page/AJu-6cwmT) (Discourse Graphs team Roam). Reference parser: [`MIRA-science/myst-plus-mira`](https://github.com/MIRA-science/myst-plus-mira). Please get in touch by email if you'd like to contribute via GitHub or this page.

## Appendix: relation semantics

| Relation | Source → Target | Semantics |
|----------|-----------------|-----------|
| `addresses` | Claim → Question | the claim proposes to answer the question |
| `supports` | Evidence → Claim | the evidence provides positive support for the claim |
| `supports` | Claim → Claim | the first claim, if true, supports the second |
| `opposes` | Evidence → Claim | the evidence contradicts or weakens the claim |
| `opposes` | Claim → Claim | the claims are in tension |
| `grounds` | Study → Evidence | the study produced / grounds the observation (inverse: `is_grounded_in`) |
| `follows` | Study → Protocol | the study follows (uses) the protocol |
| `request_target` | Request → Claim | the claim the requested work would illuminate |
| `request_for` | Request → Study | the study the request asks to be done |

---

## Changelog

- **v2.0-draft (2026-06-09):** Revised to the full MIRA node grammar (`Question`, `Claim`, `Evidence`, `Study`, `Protocol`, `Request`) and the schema's real edges; aligned to the `myst-plus-mira` reference parser (argument = human statement, `:label:`/`:id:` = stable identifier — inverse of v1). Moved the extended `{figure}` directive, `informs`/`reproduces`/`resolves`, `SourceDocument`, namespaces/reified relations, cross-document OXA ids, and JSON-LD export tooling to **Future Work**.
- **v1.0-draft (2025-12-17):** Initial Phase-1 specification — minimal `{claim}`/`{evidence}` + extended `{figure}`.
