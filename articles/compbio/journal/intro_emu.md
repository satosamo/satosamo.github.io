---
title: "Introduction"
layout: "base/base_article.njk"
homeTag: "compbio"
tags: "compbio_intros"
order : 1
---

# Introduction to EMU

The paper we are studying presents a software tool called **Emu.** This tool was developed to generate accurate taxonomic abundance profiles from full-length 16s rRNA reads obtained by nanopore sequencing (ONT).

::: concept _Species
Taxon is any rank in the biological taxonomy system:
Domain -> Phylum -> Class -> Order -> Family -> Genus -> Species -> Lower
A species is the finest standard rank. In sequencing-based classification, it refers to organisms whose genomes differ enough that they can be considered distinct biological units. A genus-level classification is usually done by 16S short-read sequencing. A species-level classification is dependent on enough variable positions to tell apart species.
:::

Short reads coming from many different species at once are not assembled to contigs because it is not possible without creating chimeric, incorrect sequences. And since short reads only cover a small part of the 16S gene, they don’t observe enough species-specific differences and can't be used to reliably differentiate between them.

A long read, full-length 16S sequencing (the read cover the entire 16S gene) has the potential to allow species-level resolution. This is because full-length read aligns to the full-length reference which exposes the true mismatches at many distinct positions. However, full-length nanopore reads tend to have high error rates.

::: idea _Error rates
A nanopore measures ionic current as DNA passes through. Each 5-6-mer produces a characteristic current distribution. This is a indirect, hard inverse problem. Consequently, the signal for one base overlaps with the next because multiple consecutive bases are inside the pore simultaneously. At the same time, the motor protein does not pull DNA through at a perfectly constant rate. So the DNA can pause, jump or skip or accelerate and jitter because of thermal fluctuations.
:::

Emu solves this problem by using an **Expectation-Maximization algorithm** (EM) to distinguish between true biological differences and sequencing errors.




