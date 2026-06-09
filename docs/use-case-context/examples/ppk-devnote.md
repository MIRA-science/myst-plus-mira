---
title: "DevNote: PPK2 Energy Regeneration Effects"
authors:
  - name: Anton Molina
date: 2026-01-15
---

<!--
  Golden test fixture for the DG/MyST parser and visualizer.
  Follows the v2 spec (../context/discourse-graphs-myst-spec.md): the full MIRA
  node set, and the MyST-native convention — the directive ARGUMENT is the
  human-readable statement, and :label:/:id: is the stable identifier.
  Modeled on Anton's real PPK cell-free-expression DevNote
  (bnext-bio/nucleus-developer-notes, dev-notes/08_ppk_cell/main.md).

  A correct parse yields:
    - 1 question:  q-ppk2-energy
    - 2 claims:    claim-ppk2-improves  (addresses q-ppk2-energy),
                   claim-dose-dependent (addresses q-ppk2-energy)
    - 2 evidence:  ev-egfp-50pct   (supports claim-ppk2-improves),
                   ev-dose-response (supports both claims)
    - 2 studies:   study-ppk-egfp  (grounds ev-egfp-50pct,    follows protocol-cellfree-fluor),
                   study-ppk-dose  (grounds ev-dose-response, follows protocol-cellfree-fluor)
    - 1 protocol:  protocol-cellfree-fluor
    - 1 request:   req-encapsulated (request-target claim-ppk2-improves)
    - inline {claim}/{evidence}/{study} role references in the Discussion, all resolved

  NOTE: figures render as ordinary MyST figures here. Linking a figure to the
  evidence it depicts (the extended {figure} directive) is deferred — see the
  spec's "Future Work" section.
-->

# PPK2 Energy Regeneration in Cell-Free Systems

## Question

:::{question} Does PPK2-based energy regeneration improve in vitro protein expression?
:label: q-ppk2-energy
:::

## Claims

:::{claim} PPK2-based energy regeneration improves in vitro protein expression
:label: claim-ppk2-improves
:addresses: q-ppk2-energy

Adding PPK2 to cell-free expression reactions provides a sustained
energy source that increases overall protein yield.
:::

:::{claim} The PPK2 effect is dose-dependent within the tested range
:label: claim-dose-dependent
:addresses: q-ppk2-energy

Expression improvements scale with PPK2 concentration between 0.1–10 mM.
:::

## Evidence

:::{evidence} PPK increases eGFP expression in Nucleus Cytosol by ~50%
:label: ev-egfp-50pct
:supports: claim-ppk2-improves
:data: ./experiments/ppk-egfp-barplot.csv

Fluorescence measurements show a consistent 50% increase in eGFP signal
when 5 mM PPK is added to reactions.
:::

:::{evidence} Expression scales linearly with PPK concentration (R² = 0.94)
:label: ev-dose-response
:supports: [claim-ppk2-improves, claim-dose-dependent]
:data: ./experiments/ppk-dose-response.csv

Dose-response experiments (0.1, 1, 5, 10 mM PPK) show a linear relationship
between PPK concentration and expression level.
:::

## Studies & protocol

:::{study} Cell-free eGFP expression ± 5 mM PPK
:label: study-ppk-egfp
:grounds: ev-egfp-50pct
:follows: protocol-cellfree-fluor
:::

:::{study} PPK dose-response (0.1–10 mM)
:label: study-ppk-dose
:grounds: ev-dose-response
:follows: protocol-cellfree-fluor
:::

:::{protocol} Cell-free expression with eGFP fluorescence readout
:label: protocol-cellfree-fluor

Assemble Nucleus Cytosol reactions ± PPK; incubate at 37 °C; read eGFP
fluorescence over time on a plate reader. (Link or embed the full protocol.)
:::

<!-- Ordinary MyST figure — no discourse relation (see spec Future Work). -->
:::{figure} ./figures/ppk-dose-response.png
:label: fig-dose-response

Dose-response curve for PPK concentration vs. eGFP expression level.
:::

## Discussion

Our experiments provide {evidence}`ev-egfp-50pct` supporting
{claim}`claim-ppk2-improves`, produced in {study}`study-ppk-egfp`. The
{evidence}`ev-dose-response` further suggests this is not a threshold
effect but scales with concentration.

:::{request} Test whether the PPK effect holds in encapsulated reactions
:label: req-encapsulated
:request-target: claim-ppk2-improves
:motivation: Establish whether sustained energy regeneration survives encapsulation before scaling up.
:::
