---
title: Constancy of the Speed of Light
summary: The second postulate of special relativity, where it comes from, and what it forces upon space and time.
glyph: lightcone
tags: [relativity, electromagnetism]
---

## The postulate

Special relativity rests on two statements:

1. The laws of physics take the same form in every inertial frame.
2. Light propagates in vacuum with the same speed $c$ in every inertial frame, independently of the motion of the source.

The second postulate is the radical one. Galilean intuition says velocities add: a photon emitted from a moving train should travel at $c + v$. Experiment — beginning with Michelson–Morley in 1887 — says it does not.

## Where it comes from

The postulate is not an arbitrary axiom; it is forced by electromagnetism. Maxwell's equations in vacuum yield the wave equation

$$\nabla^2 \mathbf{E} - \frac{1}{c^2}\frac{\partial^2 \mathbf{E}}{\partial t^2} = 0, \qquad c = \frac{1}{\sqrt{\mu_0 \varepsilon_0}},$$

with $c$ built out of constants of nature, with no reference to any preferred frame. If the first postulate is to hold for electromagnetism, every inertial observer must measure the same $c$.

## What it costs

Keeping $c$ invariant means abandoning absolute simultaneity. The transformation between inertial frames can no longer be Galilean; it must preserve the quantity

$$\Delta s^2 = -c^2\,\Delta t^2 + \Delta x^2 + \Delta y^2 + \Delta z^2,$$

the **spacetime interval**. The linear maps that do so are the Lorentz transformations; for relative velocity $v$ along $x$,

$$t' = \gamma\left(t - \frac{vx}{c^2}\right), \qquad x' = \gamma\,(x - vt), \qquad \gamma = \frac{1}{\sqrt{1 - v^2/c^2}}.$$

Time dilation and length contraction are immediate corollaries — not optical illusions but consequences of the geometry of the interval.

## The light cone

Because $\Delta s^2 = 0$ characterises light rays in *every* frame, the light cone through an event is an invariant structure. It partitions spacetime into timelike, null, and spacelike regions, and with it, causality itself becomes frame-independent: no observer can disagree about what may influence what.
