# Design history & rationale — *Project/DG in MyST markdown*

> Distilled from the Discourse Graphs team Roam page **Project/DG in MyST markdown**
> (graph `discourse-graphs`, page UID `AJu-6cwmT`) — <https://roamresearch.com/#/app/discourse-graphs/page/AJu-6cwmT>.
> This is a **summary of the thread for context**, not a verbatim copy; the live page (and its linked-reference mockups) is the source. Captured 2026-06-09.

## Desired outcome (as stated on the page)

> "A minimal schema for including discourse nodes and relations within the MyST Markdown format and abstract syntax tree. The goal is to be able to author in Curvenote / Jupyter notebook and reference, or author, discourse nodes and relations as an **interoperable reference layer** within."

Status on the page: 🌱 Exploration. Related: `Project/v0 schema`, `UserPilot/Anton Molina, bNext`.

## Timeline

- **2025-12-12 — Anton's proposal.** Anton Molina shared a "MyST + discourse graphs formalism" tying the discourse formalism to MyST syntax. It introduced a `{claim}` directive, an extended `{figure}` directive with an `:evidence:` option (the key innovation — an explicit figure→claim(s) link, allowing `:evidence: [claim1, claim2]`), and sketched an **"evidence map"** extraction from the MyST AST. One thing he couldn't pin down: the idea of **panels**.
- **2025-12-14 — Matt's edits.** Matt proposed changes (Loom walkthrough + annotated PDF), grounded in a real example: a Curvenote article and its MyST source. Stated goal: *"propose a reasonable, minimal, first-pass form for these discourse nodes/relations in a MyST AST, to iterate on over the next few–several months."* Time-boxed: "< 45 mins of investment requested."
- **2025-12-17 — Phase-1 spec drafted.** Matt + Claude converted the recommendation into the Phase-1 spec now living in `DiscourseGraphs/schemas`. The repo is intended for others to suggest changes via issues/PRs.
- **2026-03-03 — toward ARIA & the MIRA workshop.** Anton: integrating DevNotes into the **ARIA-funded "AI scientist"** project, and implementing the discourse-graph framework (as pseudocode) in parallel. His three questions: (1) *What would it take to actually implement the custom MyST directives — does the team have bandwidth/skills, or are Rowan & the MyST crew better placed given a spec?* (2) *What visualizations could exploit the discourse semantics embedded in the AST?* (3) Timing — ARIA visiting end of March; the June MIRA workshop as a venue to make it concrete.
- **2026-04-17 — traction.** Anton pitched DGs + developer notes + AI to ARIA; their CTO was interested.
- **2026-04-26 — possible overlap.** A note that someone is building an **Obsidian MyST plugin doing MyST ⇄ OXA ⇄ atproto-record bidirectional "lensing"** — *"so maybe we don't have to."* Worth checking before duplicating effort.

## The core design debate: minimal vs. extensible

Two positions, reconciled by **phasing** (see `AGENTS.md` §4):

- **Marc-Antoine Parent (Conversence)** argued the *extensible* path: a generic `{discourse} dg:claim` directive with **namespaces / CURIEs**, **reified relation nodes** (with source/target/type, and attributes like confidence/provenance), and semantic-web alignment. More powerful, future-proof — but requires namespace registries, prefix resolution, and more from the author.
- **The adoption argument (Matt / Claude)** won for v1: *simple fixed vocabulary wins.* Every piece of syntax a researcher must remember is a barrier. Full claim text as the `:label:` is natural ("researchers think in assertions, not identifiers") but fragile on rename → so **optional stable IDs with human labels as the default**. Block directives for definitions, inline roles for references. "You can always add extensibility later; it's hard to remove complexity once added."

**Resolution:** *Phase 1* = the minimal version (maximize adoption); *Phase 2* = Marc-Antoine's extensible version (namespaces, reified `{relation}` nodes, custom node types like `biolab:construct`, frontmatter prefixes, `myst export --format=discourse-graph`), once researchers hit Phase 1's limits.

## The hard technical problem: a tree that must carry a graph

Recorded directly on the page:

- MyST's linking model is **reference-based** (citations, cross-refs); discourse relations (`supports`, `opposes`, `grounds`) are **semantic edges in a graph**. The AST must either **store relations as metadata on nodes** *or* **create explicit "relation" nodes** in the tree. (Phase 1 chooses metadata-on-source-node; reified relation nodes are Phase 2.)
- The **provenance chain** behind a notebook-cell figure is `DATASET → CODE CELL → FIGURE → EVIDENCE → CLAIM` — *"a lot of edges to represent."* Phase 1 records only `figure → evidence`; making the dataset link explicit (`:data-source:`) is deferred.
- **Global identity:** to reference claims across DevNotes/papers you need a persistent, resolvable ID scheme — *"this is where OXA links come in."* (Cross-document resolution = Phase 2.)
- **OXA alignment:** discourse nodes should follow OXA conventions (typed nodes with `id`, `data`, `children`); OXA's tree doesn't natively represent graph edges, so reified relations would serialize as nodes with `source`/`target`. Co-design with OXA up front to avoid permanent translation overhead.

## Resources linked from the page

- `[[ART]] - MyST Markdown` and `[[ART]] - Open eXchange Architecture (OXA)` (both stub/pointer pages in the graph).
- `MIRA workshop 2026 — modular interoperable research attribution`.
- Possible next step captured as a candidate issue: *"try MyST + DG schema on an example developer note."*

## Why this is the sibling of the inter-lab story

The page is explicitly spun out of `UserPilot/Anton Molina, bNext` and `Project/v0 schema`. Anton is the synthetic-biology / MyST collaborator who also appears as an actor in the [inter-lab user story](https://github.com/MIRA-science/inter-lab-user-story). That story describes **transport & permissions** between labs (Obsidian-centric); this project describes **what happens inside the MyST endpoint** — authoring the structure and emitting the subgraph that the inter-lab transport then carries.
