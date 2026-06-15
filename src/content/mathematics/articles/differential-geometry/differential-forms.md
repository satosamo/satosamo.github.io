---
title: Differential Forms
summary: The exterior algebra, the differential, and why integration was secretly about forms all along.
glyph: wedge
tags: [topology, geometry]
---

## Motivation

Vector calculus in $\R^3$ has three derivative operators — gradient, curl, divergence — and three integral theorems that look suspiciously similar. Differential forms unify all of them into a single operator $d$ and a single theorem.

::: theorem Stokes
Let $M$ be a compact oriented smooth $n$-manifold with boundary, and let $\omega$ be an $(n-1)$-form on $M$. Then

$$\int_{\partial M} \omega = \int_M d\omega.$$
:::

This holds in any dimension; Green, Gauss, and the classical Stokes theorem are its $n = 2, 3$ shadows.

## The exterior algebra

Let $V$ be a [[vector-spaces|real vector space]]. A **$k$-form** on $V$ is an alternating multilinear map

$$\alpha : \underbrace{V \times \cdots \times V}_{k} \to \mathbb{R},$$

and the space of such maps is denoted $\Lambda^k V^*$. The **wedge product** combines a $k$-form and an $\ell$-form into a $(k+\ell)$-form, and it is graded-commutative:

$$\alpha \wedge \beta = (-1)^{k\ell}\, \beta \wedge \alpha.$$

In particular $dx \wedge dx = 0$ — the algebraic shadow of the fact that a parallelogram spanned by one vector has zero area.

## Differential forms on manifolds

A differential $k$-form on a smooth manifold $M$ is a smooth assignment $p \mapsto \omega_p \in \Lambda^k T_p^*M$. In local coordinates $(x^1, \dots, x^n)$ every $k$-form is

$$\omega = \sum_{i_1 < \cdots < i_k} f_{i_1 \cdots i_k}\, dx^{i_1} \wedge \cdots \wedge dx^{i_k}.$$

## The exterior derivative

There is a unique operator $d : \Omega^k(M) \to \Omega^{k+1}(M)$ such that

1. $d$ is the ordinary differential on functions,
2. $d(\alpha \wedge \beta) = d\alpha \wedge \beta + (-1)^k \alpha \wedge d\beta$,
3. $d^2 = 0$.

::: proof
Properties 1–2 force the coordinate formula $d\omega = \sum df_{I} \wedge dx^{I}$; uniqueness follows since any two such operators agree on functions and products. For $d^2 = 0$, expand in coordinates and use the symmetry of second partials against the antisymmetry of the wedge.
:::

::: remark
$d^2 = 0$ is the seed of de Rham cohomology: closed forms ($d\omega = 0$) modulo exact forms ($\omega = d\eta$) detect the topology of $M$. Pairing $d$ with [[vector-fields]] via interior products and Lie derivatives is Cartan's calculus.
:::

## Dictionary with vector calculus

| Vector calculus on $\mathbb{R}^3$ | Forms |
| --- | --- |
| $\nabla f$ | $df$ on $\Omega^0$ |
| $\nabla \times F$ | $d$ on $\Omega^1$ |
| $\nabla \cdot F$ | $d$ on $\Omega^2$ |
| $\nabla \times \nabla f = 0$ | $d^2 = 0$ |

Green, Gauss, and Stokes are then literally the same theorem, applied in dimensions where $\partial M$ happens to be a curve or a surface.
