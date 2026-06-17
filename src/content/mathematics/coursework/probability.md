---
title: Conditional Probability
summary: s
course: True
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


We are Bayesian statisticians.

We imagine a world where we know it may rain but it doesn't have to. We also know the grass may get wet but it doesn't have to.

We think nothing else can happen. Everything except raining and grass getting wet has a zero probability of happening.

**Outcomes:**
- Let $Pr(a)$ be the probability of outcome $a$ called: **it rains and the grass is wet**.
- Let $Pr(b)$ be the probability of outcome $b$ called: **it rains and the grass is not wet**.
- Let $Pr(c)$ be the probability of outcome $c$ called: **it doesn't rain and the grass is wet**.
- Let $Pr(d)$ be the probability of outcome $d$ called: **it doesn't rains and the grass is not wet**.

**Events:**
- Event called: **it rains** - a subset $E_{\text{rain}} = (a, b)$
- Event called: **it doesn't rain** - a subset $E_{\text{no rain}} = (c, d)$
- Event called: **the grass is wet** - a subset $E_{\text{grass wet}} = (a, c)$
- Event called: **the grass is not wet** - a subset $E_{\text{grass not wet}} =(b, d)$
- *Plus the four above*

We are tasked with defining this: 

***"what is the probability that the grass is wet if it is given that it rains"***


It would be sensible to ask this question: what is the difference between the 'probability that the grass is wet and that it rains' and the 'probability that the grass is wet given it rains'? 

The first case is asking what is the probability of the intersection of events 'it rains' and 'grass is wet' which is the outcome $A$ with probability $P(a)$.

The second case is asking what is the probability of an event 'grass is wet' when any other outcome can come only from the event 'it rains'. Meaning, when fixing any event trough the statement: 'it is given that...', we create a new space of all possible outcomes - those that can occur only in the event we are taken as given. 

In our case, giving 'it rains', we limit ourselves only to outcomes in event $E_{rains}$: $(a, b)$.

We, however, did not touch the function or *parameters* of the world that determine the values of probabilities. This means, if no other outcome is possible, we would get $P(a)+P(b)\neq 1$. The probabilities of $P(a)$ and $P(b)$ must thus be recalculated as those are the only two outcomes in our new universe of outcomes. Let the probability be $P'$.

The relation ship between the remaining outcomes has not changed. If one was twice as probable as the other one, that ratio must be conserved.

We want to scale the probabilities to achieve the normalization condition.

$$
P'(a) = \alpha P(a) \\
P'(b) = \alpha P(b) \\
\alpha P(a) + \alpha P(a) = 1\\
\alpha = \frac{1}{P(b) + P(b)}
$$

From axiom of probability addition we may call the probability $P(a) + P(b)$ the probability of event 'it rains': $P(E_{rains})$.

The new probabilities are thus $P'(a) = \frac{P(a)}{P(E_{rains})}$ and $P'(b) = \frac{P(b)}{P(E_{rains})}$.

If we denote $P'(a)\equiv P(a|E_{rains})$ and $P'(b)\equiv P(b|E_{rains})$ we have:

$$
P(a|E_{rains}) = \frac{P(a)}{P(E_{rains})}
$$
$$
P(b|E_{rains}) = \frac{P(b)}{P(E_{rains})}
$$

Which is the definition of **Conditional Probability**:
$$
P(X \mid Y) = \frac{P(X \cap Y)}{P(Y)}
$$

---

More straight forward way is this.

Consider a space of possible outcomes $\Omega$. A probability of a event $A$ occurring is defined (by the way of measure) as

$$
Pr(A) = \frac{|A|}{|\Omega|}
$$

Now, assigning a probability that event (or some event from events) $A$ happened given that event (or some event from events) $B$ happened is saying that some event $C$ happened and $C$ must be a possible event in $A$ and $B$. 


