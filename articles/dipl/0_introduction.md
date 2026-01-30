---
title: "Introduction"
layout: "base/base_article.njk"
homeTag: "dipl"
tags: "miscs"
order : 2
---

# Motivation and Overview

The visualization of animal, particularly human, anatomy through non-invasive means remains one of the most significant achievements in modern medicine. Medical scans have changed the way clinicians understand pathology, allowing for gathering knowledge about the internal state of an animal body without making a single incision. However, as data acquisition hardware improves, it produces higher resolution and more complex datasets and the challenge moves from the question of how we capture data to how we display it effectively.

The primary motivation of this thesis lies in bridging the gap between raw volumetric data and human understandable visual information. [PO]A lesson at a medical school may start with the list of bones and the pairs in which ligaments interface with them but ultimately students must visualize the spatial relationships, get a feel for the textures and contextualize the scales involved themselves.

An important note to make here is that there is a difference between the requirement of precise display of only a subset of information and a relaxed condition that allows for inclusion of any kind of information or of some to a varying degree. 

As an example take dental surgery. A surgeon might at first want to see the bones as close to anatomically precise as possible, as they would appear if all other tissue became transparent. Here we would require the rendering algorithm to simulate light entering all the openings and dents of the bone, interacting on inside of that porous material and exiting back coherently, or diffusing trough the material. On the other hand, when deciding on the precise cuts to be made, a surgeon might want to switch to less realistic model, opting for to anchor the cutting curves on rough anatomical landmarks and working only with the geometry of surfaces lightly shadowed by an ambient light.

[PO]The question of what detail and to what degree realistic, in other words to what degree anatomically correct, the visualization should be, is a partly of this thesis to answer. A survey of clinical practitioners should be included... [TODO AND CLARIFY]

Currently, the field [WHAT FIELD EXACTLY] stands at a crossroads between two competing requirements:

- The need for high-fidelity, physically accurate visualization, asking "How to make it nice?".
- The need for real-time performance, asking "How to make it fast?".

This thesis explores the pipeline from data creation to interactive on-screen pixel generation. We aim to propose a hybrid approach that leverages modern hardware, algorithms, and possibly rapidly improving implementation of neural networks to solve the computational expense of [PHYSICALLY BASED RENDERING METHODS] Monte Carlo path tracing in medical volume rendering.

# Data Acquisition

To understand what constitutes the challenges of rendering, we must first understand the nature of the input data. Medical scans are not standard photographs but rather they are mappings between the space of physical properties and the space of data points.

In Computed Tomography (CT), the input data is created through the measurement of X-ray attenuation. As photons pass through the body, they are absorbed at different rates depending on tissue density (e.g., bone versus soft tissue). The mathematical reconstruction of this data relies heavily on the Radon transform, an integral transform which reconstructs a function from its line integrals. This results in a scalar field of attenuation coefficients that must be interpreted by the rendering algorithm.

Magnetic Resonance Imaging (MRI) utilizes nuclear magnetic resonance principles. Here, the input data is derived from the relaxation times of hydrogen nuclei in a magnetic field. The reconstruction of these spatial frequencies into an image is performed via the Fourier transform.

Both techniques result in volumetric grids of data. The challenge for this thesis is translating these data sets into an optical model that mimics the behavior of light, creating a result picture that doctors can understand.

Our thesis will cover the means of acquiring data only as a means to understand what information is available to us given the technology used to obtain the input data. 



# Rendering

Historically, computer graphics systems have relied on traditional rendering techniques, primarily rasterization. Rasterization is a computationally efficient algorithm that projects 3D geometry onto a 2D plane followed by a number of steps that add color according to various textures that mimic the desired imagined reality. However, in the context of medical volume rendering, rasterization often struggles with complex light interactions, such as semi-transparency and subsurface scattering, which are critical for distinguishing organic tissues. [WHAT ARE THE STRUGGLES] Rasterization requires each spatial data point to contain all the information needed for synthesis of the final pixel. Calculating the respective data is expensive and would be reduced to the same computational problem as physically-based rendering.

To achieve greater realism and utility, in late 1900s and early 2000s the industry moved toward physically-based rendering (PBR). PBR aims to simulate the physical behavior of light as it interacts with the optics of the virtual scene, in our case, the anatomy of the patient.

The gold standard for this is path tracing (specifically Monte Carlo Path Tracing), which calculates the path of light rays as they bounce through the volume. While this produces superior visual quality, it introduces a massive computational cost.