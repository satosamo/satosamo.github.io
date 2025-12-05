---
title: "Pipeline"
layout: "base/base_article.njk"
homeTag: "compbio"
tags: "compbio_blog_1"
order : 1
---

# Overview

Emu method distinguishes itself from other methods by not requiring consensus sequences but rather uses the information from the entire community (all the reads) to statistically correct abundance. This smooths-out sequencing noise. By re-estimating probabilities, Emu reduces false positives significantly compared to raw proper alignments.

::: concept Consensus Sequences
Multiple reads of the same molecule.
:::

Emu's algorithm is a two-stage process:

1. Classic proper alignments are generated between reads and the reference database
2. EM-based error-correction step is performed to iteratively refine species-level relative
abundances based on total read-mapping counts

### Notation

- $R$ - the set of reads
- we denote a single specific read as $r$
- $S$ - the set of references (the reference database)
- we denote a single specific sequence in the database as $s$
- $T$ - the set of all taxonomy identifications in $S$
- $F$ - **prior sample composition** the vector of probabilities (entries of the vector map one-to-one to species)
- the vector $F$ initially starts with uniformly distributed elements:
$$F(t)_{t\in T} = \frac{1}{|T|}$$
- $C$ - the set of all alignment types (e.g. mismatch, deletion)
- the alignment type event is denoted $c$
- $P(r | s)$ - the probability that (by nanopore sequencing) we get a read $r$ given we are sequencing a reference $s$, in other words the probability the a read $r$ aligns to reference sequence $s$
- $P(r | t)$ - the probability that (by nanopore sequencing) we get a read $r$ given the sequence comes from $t$
- $P(t | r)$ - the probability $t$ is the true taxon for read $r$

## Emu Pipeline

### Mapping

The EMU pipeline starts by taking the input reads $R$ and mapping them to the reference database $S$ using **minimap2**. This step generates the primary proper alignments.

Along with the alignments, we also receive the CIGAR string for each alignment. This supplies us with the information on all differences between the read and references they were aligned against also called the nucleotide **alignment type**.

### Initial probabilities

EMU takes the numerical values for each alignment type and determines the initial likelihoods for them. This is simply:

$$
P(c) =\frac{n_c}{\sum_{c\in C}n_c}
$$

where $P(c)$ is the likelihood for alignment type event, $n_c$ is the amount of events of alignment type $c$ amongst all the primary alignments:

<center>

| $X$ - mismatch | $I$ - insertion | $D$ - deletion | $S$ - softclip |
| :---: | :----: | :---: | :---: |

</center>

Similarly, EMU calculates the likelihood for each pairwise sequence alignment:

$$
P(r | s) = \prod_{c\in C} P(c) ^{n'_{c(r,s)}}
$$

where $n'_{(r,s)}$ is the normalized number of alignment type $c$ observed between alignment of $r$ and $s$.

The normalization of $n'_{(r,s)}$ is done as the length of the longest alignment for read $r$ divided by the length of the alignment:

$$
n'_{(r,s)} = n_{(r,s)} \frac{\max_{s'\in S}{\text{len}(r, s')}}{\text{len}(r,s)}
$$

::: note Probability & Likelihood
Probability is about data given a model. We talk about the probability of an *outcome*.
Likelihood is about the model given data. We talk about the likelihood of a *parameter*.
:::

If for specific pair no alignment is made, we set $P(r|s)=0$.

Since we are interested in the most-likely taxonomy of $r$ rather than the most-similar sequence $s$, we keep only the highest $P(r|s)$ for any $s$ with species-level taxonomy identification $t$. Thus, the alignment probability between each read $r$ and species-level taxonomy $t$ is calculated with 
$$
P(r|t) = \max_{s\in t}(\prod_{c\in C}P(c)^{n'_{c(r,s)}})
$$

where $s\in t$ represents all $s$ with taxonomy id $t$.

We also set initially

$$F(t)_{t\in T} := \frac{1}{|T|}$$

### 1. Expectation step (E-step)

Now, using Bayes' Theorem we can flip the conditional relation in probability $P(r|t)$ that we get a read $r$ given the sequence comes from $t$ to $P(t|r)$, the probability $t$ is the true taxon for read $r$:

$$
P(t|r) = \frac{P(r|t)P(t)}{P(r)} = \frac{P(r|t)F(t)}{\sum_{t\in T}P(r|t)F(t)}
$$

where we used the fact that $F(t)\equiv P(t)$ and $P(r)=\sum_{t\in T}P(r|t)F(t)$.

::: idea
This step down-weights alignments to species that are currently estimated to be rare in the sample. 

With error-prone Oxford Nanopore reads, a single read often looks like several different species. To fix this, the algorithm introduces and uses $F(t)$, the prior sample composition which represents the estimated relative abundance of species $t$ in the entire sample. (*"How likely is it to find this species in the sample at all?"*)

The "flip" calculates $P(t|r)$ (the probability the read actually belongs to species $t$) by multiplying the alignment score by the species abundance:

$$
P(t|r) \propto P(r|t) \times F(t)
$$

By flipping the probability, Emu penalizes the rare species. It assumes that an any random read is statistically much more likely to come from the "soup" of species we already know exists in the sample, rather than a species that is barely present.
:::

### 2. Maximization step (M-step)

Redistribute the sample composition $F$ based on the probabilities calculated in the E-step:

$$
L(R) = \sum_{r \in R} \log \left[ \sum_{s \in S} P(r|t) \cdot F(t) \right]
$$

::: idea
In many regression problems (like standard linear regression), we can invert a matrix and solve for the optimal weights *analytically* in a single step. This is not done in practice however as inverting matrix is a harder problem. 

The goal of Emu is to find the abundance profile $F$ that maximizes the **total log likelihood** of observing all reads $R$. The equation provided in the paper is:

$$L(R) = \sum_{r \in R} \log \left[ \sum_{s \in S} P(r|t) \cdot F(t) \right]$$

To solve this *analytically*, we would normally take the derivative of $L(R)$ with respect to $F(t)$, set it to zero, and solve for $F(t)$.

The problem, however, arises when we take the derivative of log of sums and we end up with:

$$
\frac{\partial L}{\partial F(t)}
= \sum_{r\in R} \frac{P(r\mid t)}{\sum_{s\in S} P(r\mid t)F(t)} = 0
$$

This is a set of non-linear equations that cannot be isolated algebraically. Since we cannot jump to the peak of the mountain (analytical solution) because the map is too complex (coupled non-linear equations), we use the Expectation-Maximization (EM) algorithm to climb the hill one step at a time.

- Step 1 (Expectation): Pretend we know the abundance $F$. Use it to softly assign reads to species.
- Step 2 (Maximization): Pretend these assignments are hard facts. Just count the reads to update $F$.
:::

### 3. Convergence step

To check for convergence we calculate the total log-likelihood $L(R)$ of the data given the model:

$$
L(R) = \sum_{r \in R} \log \left[ \sum_{s \in S} P(r|t) \cdot F(t) \right]
$$

If the increase in $L(R)$ compared to the previous iteration is greater than $0.01$ (is substantial), the loop repeats with updated $F$. Otherwise the redistribution is complete and we move on to the next step.

### Noise trimming

The probabilistic nature of the algorithm causes the vector $F$ to contain a tail of entries (but not in entry position meaning of the word) with small probabilities. This tail of false positives can be removed by setting a threshold under which any abundance will be set to $0$. The threshold is set so that if the probability $F(t)$ is calculated as 

$$
\frac{\text{\#reads from t}}{\text{\#total reads}}
$$

then the threshold is

- $1$ read from $t$ for small samples
- $10$ reads from $t$ for samples of $ >1000$

### Final pass

Emu performs one final round of abundance redistribution with the trimmed vector to produce the final community profile. In the software the resulting $F$ is exposed as the final sample composition estimation.
