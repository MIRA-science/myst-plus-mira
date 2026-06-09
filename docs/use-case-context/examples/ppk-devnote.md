---
title: "DevNote: PPK2 Energy Regeneration Effects"
authors:
  - name: Jane Researcher
date: 2025-01-15
---

<!--
  Golden test fixture for the DG/MyST parser and visualizer.
  Reproduced from the "Complete Example" in the Phase-1 spec
  (../context/discourse-graphs-myst-spec.md). Modeled on Anton's real
  PPK cell-free-expression DevNote (bnext-bio/nucleus-developer-notes,
  dev-notes/08_ppk_cell/main.md).

  A correct parse yields:
    - 2 claim nodes:    claim-ppk2-improves-expression, claim-dose-dependent
    - 2 evidence nodes: ev-egfp-50pct-increase (supports 1 claim),
                        ev-dose-response (supports 2 claims)
    - 2 figure nodes:   fig-ppk-barplot (grounds ev-egfp-50pct-increase),
                        fig-dose-response (grounds ev-dose-response)
    - inline {claim}/{evidence} role references in the Discussion, all resolved
-->

# PPK2 Energy Regeneration in Cell-Free Systems

## Claims

:::{claim} claim-ppk2-improves-expression
:label: PPK2-based energy regeneration improves in vitro protein expression

Adding PPK2 to cell-free expression reactions provides a sustained
energy source that increases overall protein yield.
:::

:::{claim} claim-dose-dependent
:label: The PPK2 effect is dose-dependent within the tested range

Expression improvements scale with PPK2 concentration between 0.1-10 mM.
:::

## Evidence

:::{evidence} ev-egfp-50pct-increase
:label: PPK increases eGFP expression in Nucleus Cytosol by 50%
:supports: claim-ppk2-improves-expression

Fluorescence measurements show consistent 50% increase in eGFP signal
when 5 mM PPK is added to reactions.
:::

:::{evidence} ev-dose-response
:label: Expression scales linearly with PPK concentration
:supports: [claim-ppk2-improves-expression, claim-dose-dependent]

Dose-response experiments (0.1, 1, 5, 10 mM PPK) show linear relationship
between PPK concentration and expression level (R² = 0.94).
:::

## Figures

:::{figure} #fig-expression-barplot
:label: fig-ppk-barplot
:grounds: ev-egfp-50pct-increase

Comparison of eGFP expression with and without PPK treatment.
:::

:::{figure} ./figures/dose-response.png
:label: fig-dose-response
:grounds: ev-dose-response

Dose-response curve for PPK concentration vs. expression level.
:::

## Discussion

Our experiments provide {evidence}`ev-egfp-50pct-increase` supporting
the hypothesis that {claim}`claim-ppk2-improves-expression`. The
{evidence}`ev-dose-response` further suggests this is not a threshold
effect but scales with concentration.
