---
title: "Foundations of Probability"
layout: "base/base_article.njk"
homeTag: "mathematics"
tags: "mathematics_prob"
order : 1
---

Talking about probability is talking about assigning a value to some elements of sets, or to some subsets of sets.

A **outcome** is an element. Outcomes must be mutually exclusive. **No two outcomes can happen at the same time.**
An **event** is a subset with outcomes as its elements.

Both the value and the sets must fulfill some conditions to allow this assignment to be without contradictions:

- The set of all possible outcomes $\Omega$ can be whatever set.
- The set of all event $F$ must form a $\sigma$**-algebra**.
- The probability is a measure that assigns to each event $E\in F$ its probability value $P(E)$ (or $Pr(E)$)
- It is a convention that $P(\Omega)=1$
- For general uncountable sets, we need specific $\sigma$-algebra called the **Borel algebra**

We assign probabilities to events. A single outcome can be an event.

For all events, their probabilities are non-negative values.

The probability of an event $A$ happening **or** event $B$ happening (the probability of situation where at least one happens) is the sum of their respective probabilities.

It is important to distinguish between colloquial naming and mathematical definitions.

::: note Example
Let $\Omega$ be the set of outcomes:
- $A$ and name it: It rains and the grass is wet
- $B$ and name it: It rains and the grass is not wet
- $C$ and name it: It doesn't rain and the grass is wet
- $D$ and name it: It doesn't rain the grass is not wet

Let $F$ be the set of events:
- It rains: a subset of $A, B$
- It doesn't rain: a subset of $C, D$
- The grass is wet: a subset of $A, C$
- The grass is not wet: a subset of $B, D$
- Plus the four above
:::


