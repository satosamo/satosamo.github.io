---
title: Vector Spaces
summary: The axioms, bases, and dimension.
glyph: group
tags: [algebra]
---

## Axioms

A **vector space** over a field $k$ is an abelian group $(V, +)$ with a scalar multiplication $k \times V \to V$ satisfying, for all $a, b \in k$ and $u, v \in V$:

$$a(u + v) = au + av, \quad (a+b)v = av + bv, \quad (ab)v = a(bv), \quad 1v = v.$$

## Bases and dimension

Every vector space has a basis (a maximal linearly independent set), and any two bases have the same cardinality — the **dimension** of $V$. The proof in the infinite-dimensional case requires Zorn's lemma.

A linear map $T : V \to W$ between finite-dimensional spaces satisfies the rank–nullity theorem:

$$\dim V = \operatorname{rank} T + \dim \ker T.$$
