---
abstract: |
  We validated that a sensor for anhydrotetracycline (aTc) switches on in Nucleus Cytosol with the addition of 10 µM aTc. aTc sensing results in the production of catecholase which converts colorless catechol into a yellow product that is observed at absorbance 385 nm.
---

# Overview

The TetR protein binds to the Tet operator in DNA to repress transcription of the donwstream gene. When bound to tetracycline or tetracycline derivatives, such as anhydrotetracycline, TetR no longer binds the operator DNA, allowing transcription to occur. 

In this work, the Tet operator has been encoded upstream of a catecholase reporter (C23DO). The resulting biosensor is then added to a Nucleus Cytosol reaction supplemented with catechol, which is converted from a colorless substrate to a yellow product by catecholase. In this preliminary work, a homemade stock of TetR in glycerol was used. Glycerol may cause reaction poisoning in Nucleus Cytosol and is not an optimal storage buffer for TetR.

# Results

Comparing the absorbance at 385 nm over time demonstrates that the sensor is able to convert catechol from colorless to yellow faster to visual levels only in the presence of 10 µM anhydrotetracycline in standard Nucleus Cytosol conditions with 20 nM of sensor DNA. Prior visual calibrations determined the visual threshold to be an abosrbance level of 1.0. For each condition, a 10 µl reaction was assembled with 1 mM catechol and incubated at 37 °C in a platereader. 

:::{table} Experiment conditions
:name: reactions

| Condition | Description |
| --- | --- |
| Unregulated  | Control sensor reaction without TetR |
| Regulated  | Sensor reaction with TetR |
| Derepressed  | Sensor reaction with TetR and aTc |
:::



:::{table} Reaction composition
:label: reaction-composition
:align: center

| Component | Stock Concentration | Final concentration | Unregulated [µL] | Regulated [µL] | Derepressed [µL] |
|---|---|---|---|---|---|
| SMix | 3.33x | 1x | 3 | 3 | 3 |
| PMix | 15 mg/mL | 1.80 mg/mL | 1.2 | 1.2 | 1.2 |
| Ribosomes | 10 µM | 1.8 µM | 1.8 | 1.8 | 1.8 |
| tRNA | 35 mg/mL | 3.5 mg/mL | 1 | 1 | 1 |
| pT7-TetO-catecholase (pMN067) DNA template | 275.7 nM | 20 nM | 0.73 | 0.73 | 0.73 |
| Catechol | 100 mM | 1 mM | 0.2 | 0.2 |0.2 |
| TetR | 1305.6 nM | 75 nM | 0 | 0.57 | 0.57 |
| anhydrotetracycline | 100 µM | 10 µM | 0 | 0 | 1 |
| RNAse Inhibitor | 40000 U/mL | 2000 U/mL | 0.5 | 0.5 | 0.5 | 
| Water |  |  | 1.57 | 1 | 0 |

:::

:::{figure} ./experiments/pT7_TetO_catecholase.png
:label: fig:tetO_catecholase
:width: 75%
Kinetics for colorimetric conversion of catechol into a yellow product.
:::


# Conclusion and Future Steps

This preliminary test shows that the TetR sensor with a LacZ reporter is compatible with Nucleus Cytosol. Encapsulation of the sensor will inform whether 10 µM aTc is sufficient for derepression and whether DNA template should be tuned to control leak.

# Bill of Materials

## Critical Materials

| Reagent | Product Name | Manufacturer | Part # | Price | Storage Conditions | Link |
|---|---|---|---|---|---|---|
| Cytosol | Nucleus Cytosol | b.next | N/A | N/A | -80C | N/A |
| TetR | Homemade* | Lucks Lab | N/A | N/A | -80C in glycerol | N/A |
| Catechol | Catechol 120-80-9| Tokyo Chemical Industry | P0567 | $36 | 4C in water at 100 mM | https://www.tcichemicals.com/MX/en/p/P0567 |
| Anhydrotetracycline | Anhydrotetracycline, VETRANAL analytical standard| Sigma-Aldrich | 37919 | $275 | -20C in water at 5 mM | https://www.sigmaaldrich.com/US/en/product/sial/37919?srsltid=AfmBOor-kWLQUYIchxiC-ZxD--uDKjnDc-uSqG_UDo6Q_e35uec-Qnid |

*Homemade TetR used as a temporary solution, though this preparation stored in glycerol is not ideal given glycerol poisoning effects against the Cytosol reaction