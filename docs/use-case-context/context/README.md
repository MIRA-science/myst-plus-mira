# context/

Source material this brief is distilled from. Provenance for each file:

| File | What | Source | Snapshot |
|---|---|---|---|
| [`discourse-graphs-myst-spec.md`](./discourse-graphs-myst-spec.md) | The **syntax specification**, **revised to v2 (2026-06-09)**: the full MIRA node set (`question/claim/evidence/study/protocol/request`) and the schema's real edges, aligned to this repo's parser ([`src/`](https://github.com/MIRA-science/myst-plus-mira/tree/main/src)); the extended `{figure}` directive and other extensions are in its **Future Work** section. | Originated upstream at `DiscourseGraphs/schemas` → `explorations/myst/discourse-graphs-myst-spec.md` (v1 Phase-1 draft) — <https://github.com/DiscourseGraphs/schemas/blob/main/explorations/myst/discourse-graphs-myst-spec.md>; revised here. | v2 2026-06-09 — **diverges from the upstream v1**; reconcile upstream once the merge settles. |
| [`roam-project-notes.md`](./roam-project-notes.md) | **Design history & rationale** — the proposal thread, the minimal-vs-extensible debate, the tree-vs-graph problem, deferrals. Summary, not verbatim. | DG-team Roam page *Project/DG in MyST markdown* (`discourse-graphs` / `AJu-6cwmT`) — <https://roamresearch.com/#/app/discourse-graphs/page/AJu-6cwmT> | 2026-06-09. |

The original v1 was *"a vibecoded prototype, to be interpreted broadly"*; v2 grounds it in the MIRA schema and the reference parser. Where the spec and [`../AGENTS.md`](../AGENTS.md) diverge, prefer the **spec** for *syntax* and `AGENTS.md` for *constraints/intent* — and raise the conflict. (Note: `AGENTS.md` §4/§7/§8 still frame the older "Phase-1 minimal" vocabulary as rationale; the spec has since moved to the full node set.)
