---
title: Interactive figure showcase
summary: The differential as a linear approximation — a test bed for inline interactive figures.
glyph: integral
tags: [analysis]
draft: true
---

## The differential as a linear approximation

If $f$ is differentiable at $a$, then near $a$ the graph is well approximated by its tangent line:

$$f(a + \Delta x) = f(a) + \underbrace{f'(a)\,\Delta x}_{df} + \varepsilon(\Delta x), \qquad \frac{\varepsilon(\Delta x)}{\Delta x} \to 0 \text{ as } \Delta x \to 0.$$

The **differential** $df = f'(a)\,\Delta x$ is the change along the tangent; $\Delta f$ is the change along the curve. Below, $f = \sin$ and $a = 1$. Drag the slider, or press play to shrink $\Delta x$ to $0$: the bars at the step show $df$ (blue), $\Delta f$ (plain) and the gap between them (orange). The gap shrinks faster than $\Delta x$ itself, so the last readout tends to $0$.

<div class="fig" data-figure="linear-approx"></div>
<script src="/assets/js/linear-approx.js" defer></script>

<noscript><em>The interactive figure needs JavaScript. It shows the graph of $\sin x$, its tangent at $x = 1$, and how $df$ and $\Delta f$ differ for a step $\Delta x$.</em></noscript>

The approximation is only first-order: the error is $O(\Delta x^2)$ when $f$ is twice differentiable, which is why halving $\Delta x$ roughly quarters the orange gap.
