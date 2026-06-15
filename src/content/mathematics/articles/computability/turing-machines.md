---
title: Turing Machines
summary: The model, the universal machine, and the halting problem.
glyph: tape
tags: [complexity, logic]
---

## The model

A **Turing machine** is a tuple $(Q, \Gamma, \delta, q_0, F)$: a finite set of states, a tape alphabet, a transition function

$$\delta : Q \times \Gamma \to Q \times \Gamma \times \{L, R\},$$

an initial state, and accepting states. Despite its austerity, the model captures — by the Church–Turing thesis — everything we mean by *effective computation*.

## Undecidability

The **halting problem** asks: given a machine $M$ and input $w$, does $M$ halt on $w$? Turing's diagonal argument shows no machine decides this. Suppose $H$ decided halting; build $D$ that, on input $\langle M \rangle$, runs $H(M, \langle M \rangle)$ and does the opposite. Then

$$D(\langle D \rangle) \text{ halts} \iff D(\langle D \rangle) \text{ does not halt},$$

a contradiction. Rice's theorem generalises: every non-trivial semantic property of programs is undecidable.

## An interactive machine

The machine below computes **binary increment**: state `scan` walks right to the end of the input, then `carry` flips trailing 1s to 0s until it can write the carried 1. Try `111` to watch a full carry chain.

<div class="tm-mount"></div>
<script src="/assets/js/turing.js" defer></script>

<noscript><em>The interactive figure needs JavaScript; the transition table above is the same machine.</em></noscript>

| State | Read | Write | Move | Next |
| --- | --- | --- | --- | --- |
| scan | 0 or 1 | same | R | scan |
| scan | ␣ | ␣ | L | carry |
| carry | 1 | 0 | L | carry |
| carry | 0 or ␣ | 1 | — | halt |

The cost model here (one cell, one step) is what makes statements like those in [[asymptotic-notation]] meaningful.
