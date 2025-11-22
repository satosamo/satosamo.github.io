---
title: "Hashing"
layout: "articles/article_ds.njk"
homeTag: "ds"
tags: "datastructures"
order : 2
---

## Hashing

Hashing is a process during which an input, called the **key**, gets transformed into a fixed-size output, a **hash value** using a **hash function**.

### Compression of Information

Information theory treats a hash function as a function that compresses information into fewer bits.

- SHA-256 maps to 256 bits
- a typical hash table maps to 32 or 64 bits
- bucket hash table maps to a few bits after modulo

Since this hash mapping reduce the number of bits, information is necessarily lost. This causes an events called **collisions** where two keys map to the same hash value.

### Good Hash Function

A good hash function exhibits high level of randomness.

- every bit of the output depends on each bit of the input
- output bits behave statistically independently
- for any two keys, the probability they map to the same hash value is small, ideally uniform

### Data Hashing

The goal of hashing in computer science applications is to place data into a fixed-sized structure efficiently. This includes:

- hash tables
- bloom filters
- hash-based file systems
- symbol tables
- caches
- cryptography

This is achieved by interpreting the hash value of a piece of data as the index in that data structure. 

```python
h = hash(key)
index = h mod table_size
```

### The Need for Speed

For arbitrary data, hashing is the only known practical method to achieve constant time lookup. This means that hash tables allow us to access and element in expected constant time.

- modern workloads require billions of lookups per second (google)

### Distributed Systems

Having a consistent hashing system allows distributed systems to unify in data storage and handle requests among clusters. Hashing eliminates the need for central command unifying local data storage systems.




