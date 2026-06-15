---
title: Vector Fields
summary: Sections of the tangent bundle, flows, and the Lie bracket.
glyph: vector
tags: [geometry, analysis]
---

## Definition

A **vector field** on a smooth manifold $M$ is a smooth section $X : M \to TM$ of the tangent bundle: an assignment of a tangent vector $X_p \in T_pM$ to each point, varying smoothly. Equivalently, $X$ is a derivation on $C^\infty(M)$:

$$X(fg) = f\,X(g) + g\,X(f).$$

## Flows

A vector field generates a flow: the unique family of diffeomorphisms $\varphi_t$ with

$$\frac{d}{dt}\Big|_{t=0} \varphi_t(p) = X_p.$$

Existence and uniqueness of integral curves is the Picard–Lindelöf theorem in coordinates.

## The Lie bracket

Two vector fields combine into a third via

$$[X, Y] = XY - YX,$$

which measures the failure of their flows to commute. The bracket makes the vector fields on $M$ into an infinite-dimensional Lie algebra, and $[X,Y] = 0$ exactly when the flows commute.
