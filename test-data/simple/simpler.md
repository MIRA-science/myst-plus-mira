:::{question}
:label: question-1
Is the TetR/TetO biosensor system functional in Nucleus Cytosol? 
:::

::::{study}

:::{Materials}
TODO: table
:::

:::{Protocol}
TODO: link to protocol
:::


::::{evidence} ev-atc-derepression-kinetics

Sensor converts catechol to yellow product above visual threshold only in the presence of 10 µM aTc

:supports: claim-1
:method: plate-reader absorbance at 385 nm; 10 µl reactions at 37 °C; visual threshold A385 = 1.0
:::

:::{figure} ./experiments/pT7_TetO_catecholase.png
:label: fig-tetO-catecholase
:width: 75%
:grounds: ev-atc-derepression-kinetics

Kinetics for colorimetric conversion of catechol into a yellow product.
:::

::::

:::{request}
Encapsulation of the sensor will inform whether 10 µM aTc is sufficient for derepression and whether DNA template should be tuned to control leak.
:::