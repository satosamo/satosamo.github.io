---
title: "CIGAR strings"
layout: "base/base_article.njk"
homeTag: "compbio"
tags: "course_compbio"
order : 2
---

# CIGAR strings

The ‘CIGAR’ (Compact Idiosyncratic Gapped Alignment Report) string is how the SAM/BAM format represents spliced alignments.

CIGAR strings have a number of operators:

- $M$ - Match - Exact match of x positions
- $N$ - Alignment gap - Next x positions on ref don’t match
- $D$ - Deletion - Next x positions on ref don’t match
- $I$ - Insertion - Next x positions on query don’t match

**Example:**

```
CIGAR=3M2I3M:

0123456789
AAGTC  TAGAA (ref) 
  GTCGATAG (query)
```
