# AGENTS.md — Discourse Graphs in MyST Markdown (DG ⇄ MyST interop)

> **Shared brief for everyone — humans and coding agents — building the MyST/DG interoperability layer:** a way to *author* discourse-graph nodes and relations inside MyST Markdown documents, *visualize* them in the rendered page and as a graph, and *transport* a subgraph out to a collaborator's graph.
>
> **Status:** Draft v0.2 · **Origin:** distilled from the spec ([`context/discourse-graphs-myst-spec.md`](./context/discourse-graphs-myst-spec.md)), the "MyST-DG user story" canvas ([`MyST-DG user story.png`](./MyST-DG%20user%20story.png)), and the development thread on the DG-team Roam page *Project/DG in MyST markdown* (distilled in [`context/roam-project-notes.md`](./context/roam-project-notes.md)).
>
> **Read this before proposing changes.** Rules in [§6](#6-rules--constraints-normative) are **normative** (MUST / SHOULD / MUST NOT). Items in [§9](#9-open-questions--not-decided) are **open** — do **not** implement them as if decided. The [spec](./context/discourse-graphs-myst-spec.md) (v2) is the authoritative **syntax** contract; this file is the **constraints/intent** contract. Where they disagree, prefer the spec for syntax and this file for constraints — and raise the conflict.

---

## 0. How to use this file

- This repository captures **one** project: **representing discourse graphs inside MyST Markdown, and moving them between tools.** This file is its source of truth for *why* and *under what constraints*.
- It exists so that engineers and their coding agents — the MyST/Curvenote crew, the Discourse Graphs team, and collaborating labs — can build **interoperable** pieces (a parser, a visualizer, a transporter) from one shared context, vocabulary, and set of constraints.
- **Three build targets** this brief is organized to serve (see [§5](#5-the-three-build-targets)):
  1. **Parser** — MyST Markdown (+ directives/roles) → a discourse graph (typed nodes + edges) extractable from the MyST AST.
  2. **Visualizer** — render discourse nodes *in the page* and as a *graph view*.
  3. **Transporter** — extract a subgraph and serialize it (JSON-LD/RDF) so it can travel into another lab's graph.
- **Companion artifacts in this repo:**
  - [`context/discourse-graphs-myst-spec.md`](./context/discourse-graphs-myst-spec.md) — the **syntax specification (v2)**: the *full MIRA node set* (`question/claim/evidence/study/protocol/request`) and the schema's real edges. The extended `{figure}` directive and other extensions are in its **Future Work** section. This is the syntax contract a parser implements.
  - [`context/roam-project-notes.md`](./context/roam-project-notes.md) — the **design history & rationale**: the Anton → Matt → Marc-Antoine thread, the minimal-vs-extensible decision, the tree-vs-graph problem, the real-world example, and what is deliberately deferred.
  - [`MyST-DG user story.png`](./MyST-DG%20user%20story.png) — the user-story canvas this brief transcribes ([§2](#2-the-user-story)).
  - [`examples/ppk-devnote.md`](./examples/ppk-devnote.md) — a complete, runnable DevNote using the v2 syntax. Use it as the **golden test fixture** for parser and visualizer.
- **The implementation lives at the repo root** ([`../../src`](../../src)): the `myst-plus-mira` parser. See [§5](#5-the-three-build-targets) for what's built and what isn't.
- **Sibling project:** [`MIRA-science/inter-lab-user-story`](https://github.com/MIRA-science/inter-lab-user-story) covers the *transport & permissions* half of the same vision from the **Obsidian** side. The MyST project here is the **MyST-authoring sibling** of that story; the Transporter target ([§5.3](#53-transporter)) shares its rules. Read its `AGENTS.md` before building transport.

---

## 1. TL;DR

> A researcher writing experiment **developer notes in MyST Markdown** (e.g. in Curvenote / a Jupyter notebook) wants to **embed discourse-graph structure directly in the document** — marking which statements are *questions*, *claims*, and *evidence*, and which *studies* and *protocols* produced them — so that (a) the structure **renders and is visualizable inside the published page**, and (b) a **self-describing subgraph of those nodes can be sent to a collaborator outside their environment** and imported into that collaborator's graph (Roam / Obsidian / another MyST project).

The goal recorded on the project page: *"a minimal schema for including discourse nodes and relations within the MyST Markdown format and abstract syntax tree … so you can author in Curvenote / Jupyter and reference, or author, discourse nodes and relations as an interoperable reference layer."*

Two things must hold at once:
1. **Authoring stays low-friction.** Per-node syntax must be light enough that a researcher reaches for it mid-write. Minimal ceremony beats expressive-but-baroque. (See [§4](#4-phasing-decided).)
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
| **Anton Molina** (bNext / *Nucleus*, synthetic biology; ORCID 0000-0002-7253-2714) | The MyST author. Writes experiment **developer notes ("DevNotes")** in MyST/Curvenote; data on S3 / GenBank. | Originated the MyST+DG formalism proposal (Dec 2025). Wants synbio results authored as discourse structure and shared cross-tool. Integrating DevNotes into an **ARIA-funded "AI scientist"** project. |
| **Matt Akamatsu** (Discourse Graphs / MIRA; ORCID 0000-0002-0286-5310) | DG/MIRA lead. | Co-authored the spec (with Claude) from Anton's proposal; owns this brief. |
| **Marc-Antoine Parent** (Conversence) | Schema/semantics. | Author of the LinkML MIRA/DG schema. Argued for the **extensible** path (namespaced CURIEs, reified relations) — captured as deferred work ([§4](#4-phasing-decided)). |
| **MyST / Curvenote crew** (Rowan et al.) | Likely implementers. | Best placed to implement directives/roles given a spec — per Anton's note on the project page. |

**The concrete, real example (use it):** Anton's PPK cell-free-expression DevNote — *"PPK increases the expression of eGFP in Nucleus Cytosol by ~50%."* It exists today as a Curvenote article and a MyST source file (`nucleus-developer-notes`, `dev-notes/08_ppk_cell/main.md`), rendered at `devnotes.bnext.bio` / `devnotes.nucleus.engineering`. The spec's worked example — reproduced standalone at [`examples/ppk-devnote.md`](./examples/ppk-devnote.md) — is modeled on it. **"Outside the nucleus environment"** means outside bNext's Curvenote/Nucleus stack — i.e. delivered into a collaborator's Roam/Obsidian/MyST discourse graph.

---

## 4. Phasing (decided)

The decision: ship a **complete-but-minimal** vocabulary now; defer **extensibility** and a handful of relations. Don't collapse the two.

- **Now (the v2 spec). ← we are here.** The **full MIRA node grammar** — six directives (`{question}`, `{claim}`, `{evidence}`, `{study}`, `{protocol}`, `{request}`), the schema's core edges (`addresses`, `supports`/`opposes`, `grounds` *Study→Evidence*, `follows`, `request_target`/`request_for`), optional stable ids, single-document resolution, and *minimal per-node syntax*. This is what [`context/discourse-graphs-myst-spec.md`](./context/discourse-graphs-myst-spec.md) specifies and what the parser targets. (Earlier drafts proposed a smaller `{claim}`/`{evidence}`-only vocabulary; the project chose to match the canonical schema's node types instead — so a document can carry `Study`/`Protocol`/`Question`/`Request` natively.)
- **Deferred (the next increments).** The extended **`{figure}` directive** (+ resolving the figure/`grounds` schema mismatch — [§5.3](#53-transporter)); the `informs`/`reproduces`/`resolves` relations (in the DG node grammar but not yet in the LinkML schema); a `{source}`/`SourceDocument` directive; **namespaces/CURIEs** + **reified `{relation}` nodes** + custom node types; **cross-document IDs via OXA**; the **edge-resolution pass** + a `myst export --format=discourse-graph` tool. See the spec's *Future Work*.

> **Rule of thumb (R0):** build the current scope; design so the deferred increments are *additive*. It is easy to add expressivity later and hard to remove it once shipped. Don't pre-build CURIE/namespace machinery now.

---

## 5. The three build targets

Each target below states its **input → output**, the **mechanism**, and the **constraints** that make pieces interoperable. Cite these (and [§6](#6-rules--constraints-normative)) in PRs.

> **Implementation status (this repo, `myst-plus-mira`).** The **Parser** target is partly built — see [`../../src/`](../../src): `directives.ts` (the six MIRA `DirectiveSpec`s), `parser.ts` (a `unified` + `myst-parser` pipeline), `index.ts` (library API — `parseMystMarkdown`, `findMiraDirectives`), `cli.ts` (emits JSON; `--directives-only`). Fixtures live in [`../../test-data/`](../../test-data).
>
> **What's done:** all six directives parse into typed mdast nodes (`{type, kind:'mira', directive, title, identifier, label, options, children}`), with the directive **argument → `title`** and **`:label:`/`:id:` → `identifier`** (the v2 convention).
>
> **What's not done yet (the next steps):**
> 1. **Edges aren't resolved.** Relation options live as raw strings in `options`; there is no resolution pass turning `:supports:`/`:grounds:`/`:addresses:`/… into typed *edges* ([C2](#51-parser)). Today you get typed **nodes**; the **graph** is the next step.
> 2. **Relation options aren't declared** in the directive specs (only generic options like `label`, `id`, `status`, …), so MyST may warn on `:addresses:`/`:grounds:`/etc. Declare them per node type.
> 3. **No `{figure}` extension** (deferred — see [§5.3 C9](#53-transporter)).
> 4. **The `test-data/` examples still use the old `arg=id` convention**; the v2 convention is `arg`=statement, `:label:`=id. Migrate them (or accept both with a warning).
>
> Treat the spec as *syntax intent* and [`../../src`](../../src) as the *evolving source of truth*; where they differ, decide and write it down here.

### 5.1 Parser

**Input:** MyST Markdown / Jupyter notebooks containing the six directives and the inline roles.
**Output:** a **discourse graph** — typed nodes (`question`, `claim`, `evidence`, `study`, `protocol`, `request`) plus typed, *resolved* edges (`addresses`, `supports`, `opposes`, `grounds`, `follows`, `request_target`, `request_for`) — extractable from the MyST AST (the spec calls this an *"evidence map"*).

**Mechanism (current MyST API, verified June 2026):**
- Implement a **MyST plugin** exporting `directives: [...]` and `roles: [...]`. The types are `DirectiveSpec` / `RoleSpec` from **`myst-common`**. A directive object has `name`, `doc`, optional `arg` (positional — here, the **human statement/title**), `options` (named — here `label`/`id`, the relation options, freeform metadata), optional `body` (nested MyST), and a `run(data, vfile)` returning an **array of AST nodes**. This is exactly the shape in [`../../src/directives.ts`](../../src).
- Register via `myst.yml` `project.plugins`, or use the `unified` + `myst-parser` pipeline as in [`../../src/parser.ts`](../../src). JS/TS is the native, lowest-friction path.
- See [§7](#7-syntax-quick-reference) for the directive/role surface; the **full contract is the [spec](./context/discourse-graphs-myst-spec.md)**.

**Constraints:**
- **C1 — Tree carries a graph.** The MyST AST is a tree; discourse relations are graph edges. Declare each edge as an **option on its source node** (e.g. an `evidence` node carries `:supports: <claim-id>`); a resolution pass then materializes typed edges. Do **not** emit reified relation nodes — that is deferred.
- **C2 — Reference resolution order (from the spec):** (1) exact **`:label:`/`:id:`** match → (2) exact **statement** (argument) match → (3) **unique partial** statement match *with a warning* → (4) **error** on no-match or ambiguity. Emit warnings via the `vfile`; don't crash the build.
- **C3 — Match the AST node shape** the parser emits so downstream consumers (visualizer, transporter) can rely on it: `{type, kind:'mira', directive, title, identifier, label, options, children}`; then the resolution pass adds typed edges (a `relations[]` array per node, or a separate edge list). See the spec's *AST Representation*.
- **C4 — Single-document scope** for now. Cross-document references are deferred ([§5.3](#53-transporter), OXA).
- **C5 — Degrade, don't drop.** Unknown options or unresolved targets produce warnings and still render the prose; never silently discard authored content.

**Golden fixture:** parsing [`examples/ppk-devnote.md`](./examples/ppk-devnote.md) must yield **1 question, 2 claims** (each `addresses` the question), **2 evidence** (one supporting two claims), **2 studies** (each `grounds` one evidence and `follows` the protocol), **1 protocol**, and **1 request** (`request_target` a claim) — with the inline role references resolved.

### 5.2 Visualizer

**Input:** the parser's output (discourse nodes + resolved edges).
**Output:** two complementary views, both named on the canvas/spec:
- **(a) In-page rendering** — "*visualize each element in the rendered page.*" Discourse nodes render as distinguishable, labelled blocks with their relations surfaced. Spec's proposed per-format rendering: **HTML** = colored boxes with expandable relation links; **PDF** = numbered statements with cross-references; **JATS** = `<statement>` elements with custom attributes.
- **(b) Graph view** — the network of the six node types and their `addresses`/`supports`/`opposes`/`grounds`/`follows` edges, for a document or a project.

**Constraints:**
- **C6 — Consume parser output, don't re-parse.** Build on the [§5.1](#51-parser) AST contract.
- **C7 — Show provenance where present.** Surface the chain `study → evidence → claim → question`; where a figure/dataset is attached to evidence (`:data:` / `observationBase`), surface it too.
- **C8 — Graceful with gaps.** Render partial graphs (unresolved refs shown as dangling/greyed, not omitted).

**Prior art to reuse, not reinvent:** `DiscourseGraphs/schemas/explorations/elife-claim-trees-review/` is a working **claim-tree viewer** (`index.html` + `app.js`) over a discourse graph, with its data provided in **three serializations** — `headley.dg.jsonld` (DG JSON-LD), `headley.oxa.json` (OXA), and `claim-relations.ttl` (RDF/Turtle). It is the closest existing visualizer and a worked example of the very interchange formats the transporter targets.

### 5.3 Transporter

**Input:** a selected subgraph of the parsed document.
**Output:** a **self-describing subgraph serialized as JSON-LD / RDF** in the **MIRA / DG** vocabulary, suitable for import into another lab's graph and for travel over a transport layer (KOI-net is the candidate — see the sibling repo).
**Goal (canvas):** "*send a subgraph of nodes externally*" / "*to a collaborator outside the nucleus environment.*"

**The vocabulary bridge.** Because the directives *are* the MIRA classes, the mapping is now essentially **1:1**:

| MyST directive | MIRA / DG class | Edges (this spec) |
|---|---|---|
| `{question}` | `mira:Question` (`dg:Question`) | — |
| `{claim}` | `mira:Claim` (`dg:Claim`, an `Argument`) | `addresses` → Question; `supports`/`opposes` → Claim |
| `{evidence}` | `mira:Evidence` (`dg:Evidence`, an `Argument`, a `prov:Entity`) | `supports`/`opposes` → Claim; `observationBase` (`:data:`); `sourceDocument` (`:source:`) |
| `{study}` | `mira:Study` (`prov:Activity`) | `grounds` → Evidence (inverse `is_grounded_in`); `follows` → Protocol |
| `{protocol}` | `mira:Protocol` (`prov:Activity`) | — |
| `{request}` | `mira:Request` | `request_target` → Claim; `request_for` → Study |

The one remaining nuance is **figures/data**: a figure or dataset is the Evidence's `observationBase` (a `prov:Entity`), and grounding is `Study → Evidence` — *not* `Figure → Evidence`. ([C9](#53-transporter))

**Constraints (the transporter inherits the sibling repo's normative rules — cite them as `inter-lab R#`):**
- **C9 — Figure/data = `observationBase`, not a `grounds` edge.** When the deferred `{figure}` directive lands, attach the figure/dataset as the Evidence's `observationBase` (an `Entity`) and/or mint a `Study` for the producing code cell. Do **not** introduce a `Figure → Evidence` `grounds` edge — it contradicts the schema.
- **C10 — Pointers, not payloads** (`inter-lab R2`). Figures, datasets, notebooks, sequences travel as **URIs/links** (S3/GitHub/Curvenote/`oxa:`), never as embedded bytes. (The `:data:` option holds a pointer.)
- **C11 — JSON-LD on the wire, schema-agnostic transport** (`inter-lab R6`, `R7`). Serialize via the published JSON-LD context (`mira.context.jsonld`); the transport layer must not hard-code node shapes, so a schema change doesn't break sharing.
- **C12 — Permissions / subgraph selection are first-class** (`inter-lab R5`). The author chooses *what* to send; sharing a node forces a decision about its relations; do not leak the existence of un-shared nodes via dangling references.
- **C13 — Cross-document / global identity → OXA.** Local `:label:`/`:id:` are fragile across documents. Persistent, resolvable IDs are the job of **OXA** (Open eXchange Architecture — Curvenote's interoperable-manuscript identifier/linking system). Treat cross-document resolution as deferred and design IDs to be OXA-upgradable.

**Prior art:** the same `elife-claim-trees-review/data/` directory shows a discourse graph expressed simultaneously as **OXA JSON** and **DG JSON-LD** and **Turtle** — the reference example for the OXA ⇄ DG-JSON-LD ⇄ RDF round-trip a transporter performs. `DiscourseGraphs/schemas/explorations/mesa/evidence_json_schema.json` is a parallel evidence-schema exploration worth diffing against.

---

## 6. Rules & constraints (normative)

> Treat these as acceptance constraints; cite them in PRs (e.g. "satisfies R3").

- **R0 — Current scope now, extensibility additive.** Ship the six-node grammar + core edges; design so namespaces/reified relations/cross-doc IDs/the `{figure}` extension can be *added* without breaking it. ([§4](#4-phasing-decided))
- **R1 — Minimal per-node syntax.** The vocabulary is the six MIRA node types and their core edges; keep each directive's required syntax light. New required ceremony at authoring time is a regression. Resist namespaces/reification until a concrete need appears.
- **R2 — MyST-native.** Follow MyST conventions for directives, roles, labels, and cross-references: the **argument is the human statement/title**, **`:label:`/`:id:` is the cross-reference identifier**. Build on the real `DirectiveSpec`/`RoleSpec` API; don't invent a parallel markup dialect.
- **R3 — Human-first, optional stable IDs.** Authors think in assertions, not identifiers — the **argument** carries the statement. A `:label:`/`:id:` is **optional** but recommended for anything cross-referenced or likely to be renamed; resolution falls back to statement match. ([C2](#51-parser))
- **R4 — One AST contract.** Parser output MUST conform to the node shape + resolved-edge contract ([C3](#51-parser)); visualizer and transporter build on that, not on re-parsing markdown.
- **R5 — Author declares intent; tooling assists.** Distinguishing question / claim / evidence / study is the scientific value — keep the human's explicit declaration in the loop. Autocomplete, validation, and warnings are good; fully-automatic, intent-stripping extraction is a non-goal. (Mirrors `inter-lab R10`.)
- **R6 — Pointers, not payloads** for any data/figure/notebook/sequence the document references. ([C10](#53-transporter))
- **R7 — Interchange is JSON-LD/RDF in the MIRA/DG vocabulary**, produced via the published context; transport stays schema-agnostic. ([C11](#53-transporter))
- **R8 — Connect to lower layers, don't absorb them.** Pipeline/provenance specifics (PROV-O — `Study`/`Protocol` are `prov:Activity`; Jupyter/dataset lineage) and domain ontologies (e.g. SBOL for synbio constructs) are **adjacent layers the graph points to**, not things the discourse layer reimplements. (Mirrors `inter-lab R9`.)
- **R9 — Don't break the render on bad input.** Unresolved references and unknown options produce build **warnings**, not failures; prose still renders. ([C5](#51-parser), [C8](#52-visualizer))

---

## 7. Syntax quick reference

> Summary only — [`context/discourse-graphs-myst-spec.md`](./context/discourse-graphs-myst-spec.md) is the authoritative contract.

**Node types:** `question`, `claim`, `evidence`, `study`, `protocol`, `request`. **Edges:** `addresses`, `supports`, `opposes`, `grounds`, `follows`, `request_target`, `request_for`.

**General form** — argument = human statement; `:label:`/`:id:` = stable id; relation options reference targets by id (or statement):

```markdown
:::{claim} PPK2-based energy regeneration improves in vitro protein expression
:label: claim-ppk2-improves
:addresses: q-ppk2-energy
:::

:::{evidence} PPK increases eGFP expression in Nucleus Cytosol by ~50%
:label: ev-egfp-50pct
:supports: claim-ppk2-improves        # or :supports: [claim-a, claim-b]
:data: ./experiments/ppk-egfp.csv     # pointer to the underlying data (observationBase)
:::

:::{study} Cell-free eGFP expression ± 5 mM PPK
:label: study-ppk-egfp
:grounds: ev-egfp-50pct
:follows: protocol-cellfree-fluor
:::
```

**Inline roles (references):** `` {claim}`claim-ppk2-improves` ``, `` {evidence}`ev-egfp-50pct` ``, `` {study}`study-ppk-egfp` `` (also `{question}`/`{protocol}`/`{request}`).

**Conventions:** the argument is the statement/title; `:label:`/`:id:` is the optional stable id; relations are declared on their **source** node (`{claim}`→`:addresses:`/`:supports:`; `{evidence}`→`:supports:`/`:opposes:`/`:data:`; `{study}`→`:grounds:`/`:follows:`; `{request}`→`:request-target:`/`:request-for:`).

---

## 8. Known gaps & ambiguities (for implementers)

What's underspecified or unbuilt right now. Resolve in implementation and feed fixes back to the spec.

- **G1 — Edges not yet resolved.** The parser emits typed nodes with raw `options`; the resolution pass (options → typed edges, [C2](#51-parser)) is unbuilt. This is the single biggest gap between "parses" and "is a graph."
- **G2 — Relation options not declared.** `directives.ts` declares only generic options (`label`, `id`, `status`, …), so MyST may warn on `:addresses:`/`:supports:`/`:grounds:`/`:follows:`/`:request-target:`/`:request-for:`. Declare them per node type.
- **G3 — Convention drift in existing notes.** `test-data/*.md` still uses the old `arg=id` convention; the v2 spec uses `arg`=statement, `:label:`=id. Migrate them, or have the parser accept both (with a warning).
- **G4 — `{figure}` ↔ evidence grounding is deferred.** Figures/data should attach as the Evidence's `observationBase`; a `Figure → Evidence` `grounds` edge contradicts the schema (`grounds` is `Study → Evidence`). ([C9](#53-transporter), spec *Future Work*)
- **G5 — `informs`/`reproduces`/`resolves` are not in the LinkML schema** (only in the DG node grammar). Add to `mira.yaml`/`dg_core` before exposing them as directive options.
- **G6 — Jupyter provenance chain.** A figure from a labeled cell implies `dataset → code cell → figure → evidence → claim`; how much is explicit (e.g. a `:data-source:` option) is open. ([R8](#6-rules--constraints-normative), spec *Future Work*)
- **G7 — Cross-document identity.** `:label:`/`:id:` don't resolve across documents; that's the OXA story ([C13](#53-transporter)).

---

## 9. Open questions — NOT decided

> Do not implement these as settled; surface them in design discussions.

- **Reification timing.** When (if ever) edge-options should become reified `{relation}` nodes — and whether some relations (with confidence/provenance) need it sooner.
- **Cross-tool round-trip fidelity.** Whether a subgraph authored in MyST, transported as JSON-LD, imported into Roam/Obsidian, edited, and sent back preserves identity and structure. (Needs the OXA story — [C13](#53-transporter).)
- **How much context auto-travels** with a "send" — mirrors the sibling repo's open *"send closure"* question (Evidence + its Study + Protocol). Now that `study`/`protocol` are authorable nodes, the bundle can be explicit — but how much *connected* context auto-travels is still open.
- **Panels.** Anton's original proposal flagged "panels" as a concept he couldn't pin down in MyST syntax; unresolved.
- **Who implements the directives.** MyST/Curvenote crew vs. DG team — bandwidth/ownership not settled.
- **Provenance boundary.** How much pipeline lineage lives in the graph vs. in an external tool it points to ([R8](#6-rules--constraints-normative) sets direction; the line is unsettled).
- **Whether a separate plugin is even needed.** A note on the project page flags an Obsidian effort doing MyST ⇄ OXA ⇄ atproto bidirectional "lensing" — possibly overlapping. Check before duplicating.

---

## 10. References

- **Syntax spec (v2):** [`context/discourse-graphs-myst-spec.md`](./context/discourse-graphs-myst-spec.md) — the full MIRA node set + edges. Originated upstream at `DiscourseGraphs/schemas` → `explorations/myst/discourse-graphs-myst-spec.md` (v1 Phase-1 draft) <https://github.com/DiscourseGraphs/schemas/blob/main/explorations/myst/discourse-graphs-myst-spec.md>.
- **Development notes (DG-team Roam):** *Project/DG in MyST markdown* <https://roamresearch.com/#/app/discourse-graphs/page/AJu-6cwmT> · distilled: [`context/roam-project-notes.md`](./context/roam-project-notes.md)
- **Canonical schema (LinkML):** `MIRA-science/schema` <https://github.com/MIRA-science/schema> — `mira.yaml` / `mira.jsonld` / `mira.context.jsonld`; builds on `discoursegraphs.yaml` (`dg_core`).
- **This repo's parser (`myst-plus-mira`):** [`../../src/`](../../src) — `directives.ts`, `parser.ts`, `index.ts`, `cli.ts` (library + CLI that parse MIRA directives into typed mdast nodes; built on `myst-parser` / `unified`). Fixtures: [`../../test-data/`](../../test-data). Overview: [root `README.md`](../../README.md).
- **Prior art in `DiscourseGraphs/schemas/explorations/`:** `elife-claim-trees-review/` (claim-tree visualizer; OXA + DG-JSON-LD + TTL data) · `mesa/` (evidence JSON-schema exploration).
- **Sibling project:** [`MIRA-science/inter-lab-user-story`](https://github.com/MIRA-science/inter-lab-user-story) — transport & permissions from the Obsidian side; the Transporter target inherits its rules.
- **MyST plugin API:** Plugins <https://mystmd.org/guide/plugins> · JavaScript plugins (`DirectiveSpec`/`RoleSpec` in `myst-common`) <https://mystmd.org/guide/javascript-plugins>
- **MyST AST:** <https://mystmd.org/spec> · **OXA:** Curvenote Open eXchange Architecture (interoperable manuscript identifier/linking format).
- **Real example:** `bnext-bio/nucleus-developer-notes` → `dev-notes/08_ppk_cell/main.md`; rendered at <https://devnotes.bnext.bio>.
- **Projects:** Discourse Graphs <https://discoursegraphs.com> · MIRA <https://www.mira.science>

---

## Changelog

- **v0.1 (2026-06-09):** Initial brief, distilled from the spec, the MyST-DG user-story canvas, and the *Project/DG in MyST markdown* Roam thread.
- **v0.1.1 (2026-06-09):** Vendored into `myst-plus-mira`; outbound links absolutized; cross-referenced the in-repo parser and flagged its full-node-set / no-`figure` differences from the (then) Phase-1 spec.
- **v0.2 (2026-06-09):** Reconciled to **spec v2** — the full MIRA node grammar is the current scope (not a divergence); convention is argument = statement, `:label:`/`:id:` = id. The `{figure}` directive, `informs`/`reproduces`/`resolves`, namespaces/reified relations, cross-document OXA ids, and the edge-resolution pass + export are the deferred increments. Fixed repo-relative links for the `docs/use-case-context/` location (`../../src`, `../../test-data`, `../../README.md`).
