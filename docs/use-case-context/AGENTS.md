# AGENTS.md — Discourse Graphs in MyST Markdown (DG ⇄ MyST interop)

> **Shared brief for everyone — humans and coding agents — building the MyST/DG interoperability layer:** a way to *author* discourse-graph nodes and relations inside MyST Markdown documents, *visualize* them in the rendered page and as a graph, and *transport* a subgraph out to a collaborator's graph.
>
> **Status:** Draft v0.1.1 · **Origin:** distilled from the Phase-1 spec ([`context/discourse-graphs-myst-spec.md`](./context/discourse-graphs-myst-spec.md)), the "MyST-DG user story" canvas ([`MyST-DG user story.png`](./MyST-DG%20user%20story.png)), and the development thread on the DG-team Roam page *Project/DG in MyST markdown* (distilled in [`context/roam-project-notes.md`](./context/roam-project-notes.md)).
>
> **Read this before proposing changes.** Rules in [§6](#6-rules--constraints-normative) are **normative** (MUST / SHOULD / MUST NOT). Items in [§9](#9-open-questions--not-decided) are **open** — do **not** implement them as if decided. The Phase-1 spec is described by its own authors as a *vibecoded prototype, to be interpreted broadly*: where this file and the spec snapshot disagree, **prefer the intent recorded here** and raise the conflict.

---

## 0. How to use this file

- This repository captures **one** project: **representing discourse graphs inside MyST Markdown, and moving them between tools.** This file is its source of truth.
- It exists so that engineers and their coding agents — the MyST/Curvenote crew, the Discourse Graphs team, and collaborating labs — can build **interoperable** pieces (a parser, a visualizer, a transporter) from one shared context, vocabulary, and set of constraints.
- **Three build targets** this brief is organized to serve (see [§5](#5-the-three-build-targets)):
  1. **Parser** — MyST Markdown (+ directives/roles) → a discourse graph (typed nodes + edges) extractable from the MyST AST.
  2. **Visualizer** — render discourse nodes *in the page* and as a *graph view*.
  3. **Transporter** — extract a subgraph and serialize it (JSON-LD/RDF) so it can travel into another lab's graph.
- **Companion artifacts in this repo:**
  - [`context/discourse-graphs-myst-spec.md`](./context/discourse-graphs-myst-spec.md) — verbatim snapshot of the **Phase-1 syntax specification** (the canonical, evolving copy lives upstream — see [§10](#10-references)). This is the syntax contract a parser implements.
  - [`context/roam-project-notes.md`](./context/roam-project-notes.md) — the **design history & rationale**: the Anton → Matt → Marc-Antoine thread, the two-phase decision, the tree-vs-graph problem, the real-world example, and what is deliberately deferred.
  - [`MyST-DG user story.png`](./MyST-DG%20user%20story.png) — the user-story canvas this brief transcribes ([§2](#2-the-user-story)).
  - [`examples/ppk-devnote.md`](./examples/ppk-devnote.md) — a complete, runnable DevNote using the syntax. Use it as the **golden test fixture** for parser and visualizer.
- **Sibling project:** [`MIRA-science/inter-lab-user-story`](https://github.com/MIRA-science/inter-lab-user-story) covers the *transport & permissions* half of the same vision from the **Obsidian** side. The MyST project here is the **MyST-authoring sibling** of that story; the Transporter target ([§5.3](#53-transporter)) shares its rules. Read its `AGENTS.md` before building transport.

---

## 1. TL;DR

> A researcher writing experiment **developer notes in MyST Markdown** (e.g. in Curvenote / a Jupyter notebook) wants to **embed discourse-graph structure directly in the document** — marking which statements are *claims*, which are *evidence*, and how figures *ground* that evidence — so that (a) the structure **renders and is visualizable inside the published page**, and (b) a **self-describing subgraph of those nodes can be sent to a collaborator outside their environment** and imported into that collaborator's graph (Roam / Obsidian / another MyST project).

The goal recorded on the project page: *"a minimal schema for including discourse nodes and relations within the MyST Markdown format and abstract syntax tree … so you can author in Curvenote / Jupyter and reference, or author, discourse nodes and relations as an interoperable reference layer."*

Two things must hold at once:
1. **Authoring stays low-friction.** The syntax must be light enough that a researcher reaches for it mid-write. Minimal vocabulary beats expressive-but-ceremonial. (This is the explicit Phase-1 bet — see [§4](#4-phasing-decided).)
2. **The structure is machine-portable.** The same markup that renders nicely must decompose into typed nodes + edges that serialize to the shared interchange format and merge into another graph.

---

## 2. The user story

Transcribed from [`MyST-DG user story.png`](./MyST-DG%20user%20story.png). The central ask (the blue path on the canvas):

> **"Take MyST documents (nucleus dev notes) and represent [a] graph of discourse nodes, in order to:**
> - **visualize each element in the rendered page**
> - **send a subgraph of nodes to a collaborator outside the nucleus environment."**

And the collaborator-facing want (right of canvas):

> *"I want to share my individual results + context with a collaborator (inside nucleus / outside nucleus)."*

The canvas lays out the same **source → transport → destination** shape as the sibling inter-lab story, but with **MyST as the source tool**:

| | **Source (MyST author)** | **Transport** | **Destination (collaborator)** |
|---|---|---|---|
| **does** | render discourse nodes in MyST; select & **send a subgraph externally** | convert/push (e.g. to **KOI**); land in **MIRA database** / web interface | import connected nodes; **auto-summary**; **notification of updates**; **add commentary**; **claim a request** (expt / analysis / lit-analysis); **send a request** (expt / analysis) |
| **format** | MyST Markdown + DG directives | **MIRA format, JSON-LD** | markdown in a discourse graph (Roam / Obsidian / MyST) |
| **also on canvas** | — | dashboard / kanban view of DG nodes on a web interface; permissions / account; notifications | — |

The named people on the canvas (Luke, Sekhar, Nokome) are DG engineers on the web-interface / KOI / database side; **Anton** is the MyST author (see [§3](#3-actors--grounding)).

> **Relationship to the sibling story:** the inter-lab repo's actor *Anton (synthetic biology, MyST)* **is** the protagonist here. That repo treats his MyST tool as one endpoint to interoperate with; **this** repo is the spec for what happens *inside* that endpoint.

---

## 3. Actors & grounding

| Actor | Role | In the story |
|---|---|---|
| **Anton Molina** (bNext / *Nucleus*, synthetic biology; ORCID 0000-0002-7253-2714) | The MyST author. Writes experiment **developer notes ("DevNotes")** in MyST/Curvenote; data on S3 / GenBank. | Originated the MyST+DG formalism proposal (Dec 2025). Wants synbio results to be authored as discourse structure and shared cross-tool. Integrating DevNotes into an **ARIA-funded "AI scientist"** project. |
| **Matt Akamatsu** (Discourse Graphs / MIRA; ORCID 0000-0002-0286-5310) | DG/MIRA lead. | Co-authored the Phase-1 spec (with Claude) from Anton's proposal; owns this brief. |
| **Marc-Antoine Parent** (Conversence) | Schema/semantics. | Author of the LinkML MIRA/DG schema. Argued for the **extensible** path (namespaced CURIEs, reified relations) — captured as **Phase 2** ([§4](#4-phasing-decided)). |
| **MyST / Curvenote crew** (Rowan et al.) | Likely implementers. | Best placed to implement the directives/roles given a spec — per Anton's note on the project page. |

**The concrete, real example (use it):** Anton's PPK cell-free-expression DevNote — *"PPK increases the expression of eGFP in Nucleus Cytosol by ~50%."* It exists today as a Curvenote article and a MyST source file (`nucleus-developer-notes`, `dev-notes/08_ppk_cell/main.md`), rendered at `devnotes.bnext.bio` / `devnotes.nucleus.engineering`. The Phase-1 spec's worked example — reproduced standalone at [`examples/ppk-devnote.md`](./examples/ppk-devnote.md) — is modeled on it. **"Outside the nucleus environment"** means outside bNext's Curvenote/Nucleus stack — i.e. delivered into a collaborator's Roam/Obsidian/MyST discourse graph.

---

## 4. Phasing (decided)

The project is explicitly **two-phase**. This is the central design decision; do not collapse it.

- **Phase 1 — minimal, fixed vocabulary (maximize adoption). ← we are here.** Two core directives (`{claim}`, `{evidence}`), an extended `{figure}`, two inline roles, a fixed relation set, optional stable IDs, single-document resolution. Bounded implementation (~a few hundred lines of JS/TS). This is what [`context/discourse-graphs-myst-spec.md`](./context/discourse-graphs-myst-spec.md) specifies and what a v1 parser/visualizer targets.
- **Phase 2 — extensible (after adoption).** A generic `{discourse} prefix:type` directive with **namespace/CURIE** support, **reified `{relation}` nodes** carrying attributes (confidence, provenance), frontmatter prefix declarations, **cross-document IDs** (via OXA — see [§5.3](#53-transporter)), custom node types (e.g. `biolab:construct` with a sequence pointer), and a `myst export --format=discourse-graph` tool.

> **Rule of thumb (R0):** build Phase 1 now; design so Phase 2 is *additive*. It is easy to add expressivity later and hard to remove it once shipped. Don't pre-build CURIE/namespace machinery into v1.

---

## 5. The three build targets

Each target below states its **input → output**, the **mechanism**, and the **constraints** that make pieces interoperable. Cite these (and [§6](#6-rules--constraints-normative)) in PRs.

> **Implementation status (this repo, `myst-plus-mira`).** The **Parser** target is already partly built — see [`../src/`](../src): `directives.ts` (MIRA `DirectiveSpec`s), `parser.ts` (a `unified` + `myst-parser` pipeline), `index.ts` (the library API — `parseMystMarkdown`, `findMiraDirectives`), and `cli.ts` (emits JSON; `--directives-only`). Fixtures live in [`../test-data/`](../test-data).
>
> **Two divergences from the Phase-1 spec — reconcile them deliberately, don't treat them as drift:**
> 1. **Full node set, not the minimal one.** The code registers directives for `question, claim, evidence, study, request, protocol` — i.e. it implements the **canonical MIRA schema's node types** rather than the spec's minimal `claim`/`evidence`. This is defensible — it lets a document carry `Study`/`Protocol`/`Question`/`Request` *natively*, shrinking the "partial subgraph" gap in [§5.3](#53-transporter) — but it trades away the [R1](#6-rules--constraints-normative) minimal-syntax/adoption bet. Make it a conscious choice, not an accident.
> 2. **No `figure` directive yet, and edges aren't resolved.** There is no extended `{figure}`/`:grounds:`, so the figure→evidence link ([C9](#53-transporter)/[G3](#8-known-spec-gaps--ambiguities)) is unbuilt. And as documented, a parsed directive carries its raw `options` (e.g. `{label: …}`), not resolved `relations[]` — so the [C2](#51-parser) reference-resolution layer (turning `:supports:`/`:grounds:` targets into typed *edges*) is still to come. Today the parser yields typed **nodes**; the **graph** (edges) is the next step.
>
> Treat the spec snapshot as *syntax intent* and [`../src`](../src) as the *evolving source of truth*; where they differ, decide and write it down here.

### 5.1 Parser

**Input:** MyST Markdown / Jupyter notebooks containing the Phase-1 directives and roles.
**Output:** a **discourse graph** — typed nodes (`claim`, `evidence`, `figure`) plus typed, resolved edges (`supports`, `opposes`, `grounds`, `informs`) — extractable from the MyST AST (the spec calls this an *"evidence map"*).

**Mechanism (current MyST API, verified June 2026):**
- Implement a **MyST plugin** exporting `directives: [...]` and `roles: [...]`. The types are `DirectiveSpec` / `RoleSpec` from **`myst-common`**. A directive object has `name`, `doc`, optional `arg` (positional — here, the stable ID), `options` (named — here `label`, `supports`, `opposes`, `grounds`), optional `body` (the content/caption), and a `run(data, vfile)` that returns an **array of AST nodes**.
- Register it in `myst.yml` under `project.plugins`. JS/TS is the native, lowest-friction path.
- See [§7](#7-syntax-quick-reference) for the exact directive/role surface; the **full contract is the spec snapshot**.

**Constraints:**
- **C1 — Tree carries a graph.** The MyST AST is a tree; discourse relations are graph edges. In **Phase 1, store edges as metadata on the *source* node** (e.g. an `evidence` node carries `relations: [{type:'supports', target:'claim-id'}]`). Do **not** emit reified relation nodes — that is Phase 2.
- **C2 — Reference resolution order (exact, from the spec):** (1) exact **ID** match → (2) exact **`:label:`** match → (3) **unique partial** label match *with a warning* → (4) **error** on no-match or ambiguity. Emit warnings via the `vfile`, don't crash the build.
- **C3 — Match the AST node shapes** in the spec's *AST Representation* section so downstream consumers (visualizer, transporter) can rely on them: `claim {type,id,label,children}`, `evidence {type,id,label,relations[],children}`, `figure {type,id,src,relations[],children}`.
- **C4 — Single-document scope** for v1 resolution. Cross-document references are Phase 2 ([§5.3](#53-transporter), OXA).
- **C5 — Degrade, don't drop.** Unknown options or unresolved targets produce warnings and still render the prose; never silently discard authored content.

**Golden fixture:** parsing [`examples/ppk-devnote.md`](./examples/ppk-devnote.md) must yield 2 claims, 2 evidence nodes (one supporting two claims), 2 figures grounding evidence, and the inline role references resolved.

### 5.2 Visualizer

**Input:** the parser's output (discourse nodes + edges in the AST).
**Output:** two complementary views, both named on the canvas/spec:
- **(a) In-page rendering** — "*visualize each element in the rendered page.*" Discourse nodes render as distinguishable, labelled blocks with their relations surfaced. Spec's proposed per-format rendering: **HTML** = colored boxes with expandable relation links; **PDF** = numbered statements with cross-references; **JATS** = `<statement>` elements with custom attributes.
- **(b) Graph view** — the network of claim/evidence/figure nodes and their supports/grounds/opposes edges, for a document or a project.

**Constraints:**
- **C6 — Consume parser output, don't re-parse.** Build on the [§5.1](#51-parser) AST contract.
- **C7 — Show provenance where present.** Where a figure references a notebook cell, surface the chain figure → evidence → claim (and dataset → cell, when available — see [§8](#8-known-spec-gaps--ambiguities)).
- **C8 — Graceful with gaps.** Render partial graphs (unresolved refs shown as dangling/greyed, not omitted).

**Prior art to reuse, not reinvent:** `DiscourseGraphs/schemas/explorations/elife-claim-trees-review/` is a working **claim-tree viewer** (`index.html` + `app.js`) over a discourse graph, with its data provided in **three serializations** — `headley.dg.jsonld` (DG JSON-LD), `headley.oxa.json` (OXA), and `claim-relations.ttl` (RDF/Turtle). It is the closest existing visualizer and a worked example of the very interchange formats the transporter targets.

### 5.3 Transporter

**Input:** a selected subgraph of the parsed document.
**Output:** a **self-describing subgraph serialized as JSON-LD / RDF** in the **MIRA / DG** vocabulary, suitable for import into another lab's graph and for travel over a transport layer (KOI-net is the candidate — see the sibling repo).
**Goal (canvas):** "*send a subgraph of nodes externally*" / "*to a collaborator outside the nucleus environment.*"

**The vocabulary bridge (this is the crux of interop):** Phase-1 MyST uses a *deliberately smaller* vocabulary than the canonical schema. A transporter MUST map between them.

| MyST Phase-1 | Canonical MIRA / DG class (LinkML) | Notes |
|---|---|---|
| `{claim}` | `mira:Claim` (`is_a dg:Claim`) | direct. |
| `{evidence}` + `:supports:` / `:opposes:` | `mira:Evidence` (`is_a dg:Evidence`), edges `dg:supports` / `dg:opposes` (Evidence is an `Argument`) → `Claim` | direct. |
| extended `{figure}` + `:grounds: <evidence>` | **mismatch — see C9** | the data/figure artifact ≈ Evidence's `dg:observationBase` (an `Entity`); MIRA's `grounds` edge is `Study → Evidence`, not `Figure → Evidence`. |
| *(no spec directive — but **see [`../src`](../src)**)* | `mira:Study`, `mira:Protocol`, `mira:Question`, `mira:Request` | the Phase-1 *spec* yields a **partial** subgraph here — but **this repo's parser already implements `study`/`protocol`/`question`/`request` directives**, so a document *can* carry them natively. Whatever isn't authored as a node lives in prose/the notebook and is synthesized or left as pointers. |

**Constraints (the transporter inherits the sibling repo's normative rules — cite them as `inter-lab R#`):**
- **C9 — Resolve the `figure`/`grounds` semantic mismatch explicitly.** In MyST the *figure* grounds the *evidence*; in MIRA, an *activity* (`Study`) grounds Evidence and the figure/data is the Evidence's `observationBase` (an `Entity`). A transporter MUST choose and document a mapping (e.g. MyST figure → `Entity` set as `observationBase`, optionally minting a `Study` for the producing code cell). Do not paper over this.
- **C10 — Pointers, not payloads** (`inter-lab R2`). Figures, datasets, notebooks, sequences travel as **URIs/links** (S3/GitHub/Curvenote/`oxa:`), never as embedded bytes.
- **C11 — JSON-LD on the wire, schema-agnostic transport** (`inter-lab R6`, `R7`). Serialize via the published JSON-LD context (`mira.context.jsonld`); the transport layer must not hard-code node shapes, so a schema change doesn't break sharing.
- **C12 — Permissions / subgraph selection are first-class** (`inter-lab R5`). The author chooses *what* to send; sharing a node forces a decision about its relations; do not leak the existence of un-shared nodes via dangling references.
- **C13 — Cross-document / global identity → OXA.** Local `:label:`-based IDs are fragile across documents. Persistent, resolvable IDs are the job of **OXA** (Open eXchange Architecture — Curvenote's interoperable-manuscript identifier/linking system). Treat cross-document resolution as **Phase 2** and design IDs to be OXA-upgradable.

**Prior art:** the same `elife-claim-trees-review/data/` directory shows a discourse graph expressed simultaneously as **OXA JSON** and **DG JSON-LD** and **Turtle** — the reference example for the OXA ⇄ DG-JSON-LD ⇄ RDF round-trip a transporter performs. `DiscourseGraphs/schemas/explorations/mesa/evidence_json_schema.json` is a parallel evidence-schema exploration worth diffing against.

---

## 6. Rules & constraints (normative)

> Treat these as acceptance constraints; cite them in PRs (e.g. "satisfies R3").

- **R0 — Phase 1 now, Phase 2 additive.** Ship the minimal fixed vocabulary; design so namespaces/reified relations/cross-doc IDs can be *added* without breaking v1. ([§4](#4-phasing-decided))
- **R1 — Minimal syntax wins.** Two directives (`claim`, `evidence`), one extension (`figure`), two roles, four relation names. New required ceremony at authoring time is a regression. Low cognitive load is the adoption thesis.
- **R2 — MyST-native.** Follow existing MyST conventions for directives, roles, labels, and cross-references. Build on the real `DirectiveSpec`/`RoleSpec` API; don't invent a parallel markup dialect.
- **R3 — Optional stable IDs, human labels by default.** Authors think in assertions, not identifiers; the `:label:` *is* the claim text. A positional ID is **optional** and used for stable cross-referencing. Resolution falls back label→partial. ([C2](#51-parser))
- **R4 — One AST contract.** Parser output MUST conform to the AST node shapes in the spec ([C3](#51-parser)); visualizer and transporter build on that contract, not on re-parsing markdown.
- **R5 — Author declares intent; tooling assists.** Distinguishing claim / evidence / grounding is the scientific value — keep the human's explicit declaration in the loop. Autocomplete, validation, and warnings are good; fully-automatic, intent-stripping extraction is a non-goal. (Mirrors `inter-lab R10`.)
- **R6 — Pointers, not payloads** for any data/figure/notebook/sequence the document references. ([C10](#53-transporter))
- **R7 — Interchange is JSON-LD/RDF in the MIRA/DG vocabulary**, produced via the published context; transport stays schema-agnostic. ([C11](#53-transporter))
- **R8 — Connect to lower layers, don't absorb them.** Pipeline/provenance specifics (PROV-O; Jupyter/dataset lineage) and domain ontologies (e.g. SBOL for synbio constructs) are **adjacent layers the graph points to**, not things the discourse layer reimplements. (Mirrors `inter-lab R9`.)
- **R9 — Don't break the render on bad input.** Unresolved references and unknown options produce build **warnings**, not failures; prose still renders. ([C5](#51-parser), [C8](#52-visualizer))

---

## 7. Syntax quick reference

> Summary only — [`context/discourse-graphs-myst-spec.md`](./context/discourse-graphs-myst-spec.md) is the authoritative contract.

**Node types (Phase 1):** `claim`, `evidence`. **Relations:** `supports`, `opposes`, `informs`, `grounds`.

```markdown
:::{claim} claim-ppk2-expression
:label: PPK2-based energy regeneration improves in vitro protein expression
Optional extended description.
:::

:::{evidence} ev-ppk-egfp-50pct
:label: PPK increases eGFP expression in Nucleus Cytosol by 50%
:supports: claim-ppk2-expression        # or :supports: [claim-a, claim-b]
What was actually observed.
:::

:::{figure} ./figures/ppk-barplot.png    # or  #fig-cell-label  for a notebook cell output
:label: fig-ppk-expression
:grounds: ev-ppk-egfp-50pct
Caption.
:::
```

**Inline roles (references):** `` {claim}`claim-ppk2-expression` `` and `` {evidence}`ev-ppk-egfp-50pct` ``.

**Directive parameters:** argument after `{claim}`/`{evidence}` = optional stable ID; `:label:` = required human statement; `:supports:`/`:opposes:` on evidence; `:grounds:` on figure; figure argument (path or `#cell-label`) and caption are required.

---

## 8. Known spec gaps & ambiguities (for implementers)

These are *underspecified in the Phase-1 prototype* (distinct from the deliberately out-of-scope items the spec lists). Resolve them in implementation and feed fixes back upstream.

- **G1 — `informs` has no carrier.** It is named in the relation table but **no directive option** in the examples emits it. Treat as reserved; decide whether `:informs:` is a valid option on `evidence`/`claim` and document it.
- **G2 — Claim→Claim `supports`/`opposes` is in the semantics table but the `{claim}` directive defines no `:supports:`/`:opposes:` option** (only `evidence` and `figure` carry relations in the examples). The claim AST example has no `relations[]`. Decide whether claims may carry relations and update the AST shape if so.
- **G3 — `grounds` direction vs. the canonical schema.** MyST: *figure* `grounds` *evidence*. MIRA: `grounds` is *Study → Evidence*; the figure/data is `observationBase`. ([C9](#53-transporter))
- **G4 — Jupyter provenance chain.** A figure referencing a cell (`#cell-label`) implies `dataset → code cell → figure → evidence → claim`, but Phase 1 only records `figure → evidence`. Whether to make `:data-source:` explicit is an open enhancement (spec defers to Phase 2). ([R8](#6-rules--constraints-normative))
- **G5 — Label-as-ID fragility.** With no stable ID, renaming a `:label:` breaks references. Tooling SHOULD warn; authors SHOULD add IDs to anything referenced across documents. ([R3](#6-rules--constraints-normative))

---

## 9. Open questions — NOT decided

> Do not implement these as settled; surface them in design discussions.

- **Reification timing.** When (if ever) Phase 1's metadata-on-source-node should become reified `{relation}` nodes — and whether some relations (with confidence/provenance) need it sooner.
- **Cross-tool round-trip fidelity.** Whether a subgraph authored in MyST, transported as JSON-LD, imported into Roam/Obsidian, edited, and sent back preserves identity and structure. (Needs the OXA story — [C13](#53-transporter).)
- **How much context auto-travels** with a "send" — mirrors the sibling repo's open *"send closure"* question (Evidence + its Study + Protocol), but a MyST DevNote may not contain Study/Protocol nodes at all ([§5.3](#53-transporter) table).
- **Panels.** Anton's original proposal flagged "panels" as a concept he couldn't pin down in MyST syntax; unresolved.
- **Who implements the directives.** MyST/Curvenote crew vs. DG team — bandwidth/ownership not settled.
- **Provenance boundary.** How much pipeline lineage lives in the graph vs. in an external tool it points to ([R8](#6-rules--constraints-normative) sets direction; the line is unsettled).
- **Whether a separate plugin is even needed.** A note on the project page flags an Obsidian effort doing MyST ⇄ OXA ⇄ atproto bidirectional "lensing" — possibly overlapping. Check before duplicating.

---

## 10. References

- **Phase-1 spec (canonical, evolving):** `DiscourseGraphs/schemas` → `explorations/myst/discourse-graphs-myst-spec.md` <https://github.com/DiscourseGraphs/schemas/blob/main/explorations/myst/discourse-graphs-myst-spec.md> · verbatim snapshot here: [`context/discourse-graphs-myst-spec.md`](./context/discourse-graphs-myst-spec.md)
- **Development notes (DG-team Roam):** *Project/DG in MyST markdown* <https://roamresearch.com/#/app/discourse-graphs/page/AJu-6cwmT> · distilled: [`context/roam-project-notes.md`](./context/roam-project-notes.md)
- **Canonical schema (LinkML):** `MIRA-science/schema` <https://github.com/MIRA-science/schema> — `mira.yaml` / `mira.jsonld` / `mira.context.jsonld`; builds on `discoursegraphs.yaml` (`dg_core`).
- **Prior art in `DiscourseGraphs/schemas/explorations/`:** `elife-claim-trees-review/` (claim-tree visualizer; OXA + DG-JSON-LD + TTL data) · `mesa/` (evidence JSON-schema exploration).
- **This repo's parser (`myst-plus-mira`):** [`../src/`](../src) — `directives.ts`, `parser.ts`, `index.ts`, `cli.ts` (library + CLI that parse MIRA directives into typed mdast nodes; built on `myst-parser` / `unified`). Fixtures: [`../test-data/`](../test-data). Overview: [root `README.md`](../README.md).
- **Sibling project:** [`MIRA-science/inter-lab-user-story`](https://github.com/MIRA-science/inter-lab-user-story) — transport & permissions from the Obsidian side; the Transporter target inherits its rules.
- **MyST plugin API:** Plugins <https://mystmd.org/guide/plugins> · JavaScript plugins (`DirectiveSpec`/`RoleSpec` in `myst-common`) <https://mystmd.org/guide/javascript-plugins>
- **MyST AST:** <https://mystmd.org/spec> · **OXA:** Curvenote Open eXchange Architecture (interoperable manuscript identifier/linking format).
- **Real example:** `bnext-bio/nucleus-developer-notes` → `dev-notes/08_ppk_cell/main.md`; rendered at <https://devnotes.bnext.bio>.
- **Projects:** Discourse Graphs <https://discoursegraphs.com> · MIRA <https://www.mira.science>

---

## Changelog

- **v0.1 (2026-06-09):** Initial brief, distilled from the Phase-1 spec, the MyST-DG user-story canvas, and the *Project/DG in MyST markdown* Roam thread.
- **v0.1.1 (2026-06-09):** Vendored into `myst-plus-mira` as `use-case-context/`; outbound links absolutized; cross-referenced the in-repo parser ([`../src`](../src)) and flagged its full-node-set / no-`figure` divergences from the Phase-1 spec ([§5](#5-the-three-build-targets)).
