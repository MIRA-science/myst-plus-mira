# Discourse Graphs in MyST Markdown

*A MyST/DG interop user story — how a researcher's questions, claims, and evidence, written into a MyST document as they work, become a graph that renders in the page and travels into a collaborator's notebook.*

---

Anton writes his experiments down as he runs them — developer notes in MyST Markdown, in Curvenote, next to the code and the figures. One note says: *PPK increases eGFP expression in the Nucleus cytosol by about 50%.* Today that sentence is just prose. It is a **claim** that answers a **question**, it rests on **evidence**, and that evidence was produced by a **study** following a **protocol** — but nothing in the document knows that, so nothing downstream can use it.

This project gives that structure a home **inside the Markdown itself**. A handful of MyST directives let Anton mark which statements are questions, claims, and evidence, and which studies and protocols produced them — light enough to reach for mid-write. Once it's there, two things become possible: the structure **renders and is visualizable in the published page**, and a **self-describing subgraph of those nodes can be sent to a collaborator outside Anton's environment** — into their Roam, Obsidian, or MyST discourse graph — carrying pointers back to the data, never the 80-gigabyte data itself.

## What this enables, in two moves

- **Author + visualize.** Write `:::{question}`, `:::{claim}`, `:::{evidence}`, `:::{study}`, `:::{protocol}`, `:::{request}` in a MyST doc; the parser lifts a discourse graph out of the AST; the page renders each node and the relations between them — in the document, and as a graph.
- **Send a subgraph.** Select a slice of that graph and serialize it as JSON-LD/RDF in the shared MIRA/DG vocabulary, so it lands in another lab's graph and traces back through pointers — the same destination the [inter-lab story](https://github.com/MIRA-science/inter-lab-user-story) describes, reached from the MyST side.

## What's in here

| File | What it is |
|---|---|
| [`AGENTS.md`](./AGENTS.md) | **Start here.** The shared brief: the user story, actors, what's in scope now vs. deferred, the **three build targets** (parser / visualizer / transporter), normative rules, known gaps, and open questions. Written so coding agents in different teams can build interoperable pieces from one source of truth. |
| [`context/discourse-graphs-myst-spec.md`](./context/discourse-graphs-myst-spec.md) | The **syntax specification (v2)** — the full MIRA node set and the schema's real edges; the extended `{figure}` directive and other extensions are in its *Future Work* section. The syntax contract a parser implements. |
| [`context/roam-project-notes.md`](./context/roam-project-notes.md) | The **design history & rationale** — the Anton → Matt → Marc-Antoine thread, the minimal-vs-extensible debate, the tree-vs-graph problem, and what is deferred. |
| [`examples/ppk-devnote.md`](./examples/ppk-devnote.md) | A complete, runnable DevNote in the v2 syntax — the **golden test fixture** for parser and visualizer. |
| [`MyST-DG user story.png`](./MyST-DG%20user%20story.png) | The user-story canvas — source → transport → destination, with MyST as the source tool. |

> This context lives **alongside the implementation it informs**: the `myst-plus-mira` parser at the repository root ([`../../src`](../../src), [root README](../../README.md)) already parses MIRA directives into typed nodes. See [`AGENTS.md` §5](./AGENTS.md#5-the-three-build-targets) for what's built and what isn't (the edge-resolution layer and the `{figure}` directive are the next steps).

## The shape of the data

The six MIRA node types and the edges between them:

```
Question  ◄─addresses─  Claim  ◄─supports/opposes─  Evidence  ◄─grounds─  Study  ─follows─►  Protocol
                          ▲                                                  ▲
                          └──────────── Request ─request_target──┘  (request_for ─►)
```

`Claim` and `Evidence` are *arguments* (they support/oppose claims); `Study` and `Protocol` are *activities*; `Request` is the collaboration primitive — a placeholder for science not yet done. The directives map 1:1 onto the [MIRA / Discourse Graphs schema](https://github.com/MIRA-science/schema) (`mira.yaml`), so a subgraph serializes cleanly to JSON-LD/RDF. See [`AGENTS.md` §5.3](./AGENTS.md#53-transporter).

## The principles, in one breath

- **Minimal per-node syntax** — six node types, core edges, light required markup; low cognitive load is the adoption thesis.
- **MyST-native** — real directives/roles; the **argument is the statement**, `:label:`/`:id:` is the cross-reference id.
- **One AST contract** — the visualizer and transporter build on the parser's output, never re-parse.
- **Pointers, not payloads** — reference data/code/media by URI; never embed it.
- **Current scope now, extensibility additive** — namespaces, reified relations, cross-document OXA ids, and the `{figure}` directive come later, without breaking what's here.

The normative versions (the MUSTs and SHOULDs) live in [`AGENTS.md` §6](./AGENTS.md#6-rules--constraints-normative).

## Building from this

If you're picking up a piece — the **parser** (MyST plugin), the **visualizer** (in-page + graph view), or the **transporter** (subgraph → JSON-LD → another graph): **read [`AGENTS.md`](./AGENTS.md) first.** Treat its §6 rules as acceptance constraints, its §8 gaps as things to resolve and feed upstream, and its §9 open questions as genuinely open. Don't reinvent the visualizer or the OXA ⇄ JSON-LD round-trip — `DiscourseGraphs/schemas/explorations/` already has worked examples.

## Status

Draft v0.2, 2026-06-09. The syntax spec (v2) covers the full MIRA node grammar; the reference parser at the repo root already parses these directives into typed nodes (edge resolution and the `{figure}` directive are next). The real test case — Anton's PPK DevNote — exists today as live MyST source.

---

🧠 [discoursegraphs.com](https://discoursegraphs.com) · 🔬 [mira.science](https://www.mira.science) · ✍️ [mystmd.org](https://mystmd.org) · 📐 [DiscourseGraphs/schemas](https://github.com/DiscourseGraphs/schemas)
