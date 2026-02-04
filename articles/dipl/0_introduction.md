---
title: "Introduction"
layout: "base/base_article.njk"
homeTag: "dipl"
tags: "miscs"
order : 2
---

# Introduction

## Motivation and Overview

The visualization of animal, particularly human, anatomy through non-invasive means is one of the most significant achievements in modern medicine.

> **Note:** Or rather we should say one of the most significant accidental gifts of physics to modern medicine.

**Medical scans** allow clinicians to understand pathology and enable them to gather knowledge about the internal state of a human body without making a single incision. However, as data acquisition hardware has improved, it has begun producing increasingly complex, high resolution datasets and the challenge has shifted from the question of how we capture data to how do we display it effectively.

The oldest technique for imaging the internal human body is projectional radiography, commonly known as X-ray. To image a common pathology, such as a **broken bone**, a subject is placed between a source of electromagnetic radiation and a detector. As radiation passes through the body, it is attenuated by various **tissues**, losing intensity. This results in a non-uniform intensity distribution on the detecting plane, allowing **internal structures** and **organs** to be distinguished.

A different approach, sonography, utilizes sound waves. A transducer emits high-frequency sound waves through contact with the skin. These waves travel into the body, where they are either scattered or reflected. The reflected waves are detected as echoes and algorithmically interpreted. To reconstruct an image, the scanner determines how long did the echo take to return and how strong the echo was. These two variables determine the spatial location and brightness of the corresponding pixels in the resulting visual.

Not all medical scans are equivalent, and the choice which to use depends on the needs of the clinician and on the availability of the given technology. Different scanning techniques produce distinct types of output data.

This thesis focuses on scans that produce spatially complete **volumetric data**.

> **Note:** Such that it covers the whole volume uniformly.

The availability of 3D spatial information provides the freedom to project the data in arbitrary orientation and scale configuration onto a **2D monitor**, or project it stereographically and view it through a **virtual reality** systems. This unlocks the full potential of human visual perception and together with real-time interactivity creates an ideal environment for both **education** and **clinical analysis**.

Specifically, we are interested in those methods, where the body is mapped onto an euclidean space of data points, each containing sufficient information to determine the **optical properties** of that physical location.

In Computed Tomography (CT), the output data is created by the measurement of X-ray attenuation from multiple angles. The mathematical reconstruction of this data relies on the Radon transform, an integral transform which reconstructs a function from its line integrals.

> **Note:** An integral transform  where  is some function defined on a plane and  is a function defined on a space of line in the plane whose values are defined as the line integral of that function over that line. The reconstruction of the original object is then achieved by taking the inverse of this transform.

This results in a scalar field of attenuation coefficients that must then be interpreted by the rendering algorithm.

Magnetic Resonance Imaging (MRI) utilizes principles of nuclear magnetic resonance. Here, the output data is derived from the relaxation times of hydrogen nuclei in a magnetic field. The reconstruction of these spatial frequencies into an image is performed via the Fourier transform.

Both techniques result in **volumetric grids** of datapoints. The challenge of this thesis lies in translating these datasets into a physically based optical model that simulates the behavior of light and subsequently, after defining the lighting conditions, projecting the resulting light transport onto a viewing plane. This requires establishing a correlation between each data point and the tissue it represents. Modern approaches may utilize transformer-based neural networks for this task. Tissues can be classified using the global context of the datapoint position, geometric flow, or state-of-the-art pretrained segmentation models.

Once the biological tissue represented by a datapoint is identified, we can proceed to model its specific optical properties (Jacques, 2013) and subsequently simulate light interactions with the dataset, rendering the results on screen.

---

## Goals

The primary objective of this thesis is to develop a **rendering framework** that transforms the raw volumetric data into a visual representation that is both intuitive for non-professionals and functionally valuable for professionals.

> **Note:** Or at least a prototype of rendering framework. Features such as full user interface are outside of the core research scope of this work.
> **Note:** An experienced radiologist might see a fracture where unskilled eye sees only a gray overlapping shapes.

By moving beyond traditional method of **transfer functions** towards photorealistic **path tracing** and **splatting**, the thesis aims to explore a theoretical imaging solution that would provide **clinicians** and **educators** with a tool that would improve the comprehension of spatial relations and increase the diagnostic quality and effectiveness. The goal here is to demonstrate that (optical) **anatomical realism** does not have to be sacrificed for **performance**. Building on the potential of the architecture, we aim to enable a degree of **interactivity** previously achievable only by lower-fidelity models. This includes **dynamic lightning** where users can manipulate light sources in real-time allowing for better understanding of **depth** and **surface texture**, linear and non-linear transformations that is, the ability to move, rotate and scale specific anatomical structures and temporal interactivity, where scans containing additional temporal dimension could be used to **animate organs** such as the heart or lungs.

For surgeons and medical students, the benefit of photorealistic visualization lies in the depth of perception and the ability of broad **material differentiation**. Traditional rendering of medical scans often results in 'flat' or 'plastic' appearances that lack both the crude and subtle anatomical details.

> **Note:** Since these methods discard or do not explore the secondary complex interactions of light. These interactions comprise of the majority of 'realism' that is achieved by path tracing methods. The sum total of these interactions create a crude texture that is difficult to achieve by targeted texture design.

By simulating the complex behavior of light, such as subsurface scattering and realistic shadowing, our goal is to produce visualizations that mimic the look and optical feel of a physical human body dissection. This level of visual fidelity allows for better understanding of the relative distance and orientation of overlapping structures. This backend framework, together with an UI that would envelop the internals of the rendering system, could provide students with a 'virtual cadaver', aiding in the transition from reading textbook theory to seeing the operating theater as close to in person as the technology allows.

A core goal of this framework is to alow the user to manipulate the digital volume. Rather than viewing a static image, users will be able to interact with the anatomy through:

* **Segmentation** (medsam3-2025) by using neural network-assisted classification to isolate specific organs or tissue layers.
* **Volumetric editing** by enabling the 'peeling back' of tissue layers, creating slices through the volume or scaling specific structures to reveal underlying pathology.
* **Variable transparency** by adjusting the opacity of structures (like the skin or musculature) to make them semi-transparent, allowing for a 'see-through' effect that visualizes the internal relations within the body.

The nuances of these goals, however, lie in the tradeoff between what is achievable if high-end computing clusters are available and what can be done with a consumer-grade hardware found in clinical institutions and teaching faculties.

> **Note:** This metric will be determined by an indirect survey.

Achieving path-traced realism in real-time requires clever data structures and pruning algorithms to minimize redundant calculations and the waste of available compute power by rendering elements outside of line of sight. Optimizing how the splatting engine traverses the volumetric grid to ensure that only visible and relevant data points contribute to the final image. Implementing efficient ways to handle high-resolution medical datasets without exceeding the VRAM limits of standard GPUs. Balancing the power-hungry but desired stochastic character of path tracing with the rasterization speed of Gaussian splatting to maintain high framerate experience without inducing sickness in the user.

> **Note:** A common problem in VR systems with low framerates.

Finally, the development of this framework will not occur in a communication vacuum. A significant goal of this research is to ensure the output meets the standards of the medical community. We will be gathering qualitative critiques from clinical professionals to assess the diagnostic utility and accuracy of the rendered images and educational faculties to evaluate the efficacy of the tool as a pedagogical resource for medical training.

This iterative process of consultation and improvement aims to ensure that our rendering optimizations translate into tangible benefits for the clinical field.

---

## Methodology and Related Work

As the field of medical visualization has moved from simple cross-sectional slices to complex, interactive 3D environments, achieving the current state of the art requires a clever combination of classical volume rendering, high-end cinematic techniques, and the results of recent explosion of interest in differentiable rendering.

> **Note:** Such that those used in movie making and computer game development.

Historically, the visualization of volumetric grids has relied on two primary methods: **isosurface reconstruction** and **direct volume rendering** (DVR).

DVR uses ray marching method to simulate a ray attutenation from arbitrary viewing angle. The rays are extended from the viewing plane according to the desired type of projection (orthographic, perspective) and for each datapoint hit, the resulting dimming of the ray is calculated. Using transfer function to map scalar values to color and opacity, DVR allows for a semi-transparent view of internal structures. This method can be combined with precalculated gradient to simulate basic shading on the normals. While versatile, standard DVR often lacks realistic lighting, resulting in images that struggle to convey depth and material properties properly, acting more like a x-ray with arbitrary user-specifiec rotation and scale.

Isosurface reconstruction, most notably the **marching cubes** algorithm implementation, extracts a polygonal mesh from a volume at a specific intensity threshold. While efficient for hardware-accelerated rendering, it discards the internal 'fuzzinnes' of the data and tends to create choppy, smoothed out plastic-like surfaces.

The current industry gold standard for photorealistic medical visualization is **Cinematic Rendering** first introduced to mainstream by Siemens Healthineers (niedermayr-2024). In contrast to simplistic lighting models of DVR this model employs **monte carlo path tracing** to simulate the complex physics of light transport, including global illumination, soft shadows, and ambient occlusion. While Cinematic Rendering results in state-of-the-art visual quality, it is computationally expensive. It continues to struggle to maintain high framerate interactivity on consumer-grade hardware, often requiring specialized workstations or offline rendering.

In the race for of real-time performance, various **novel view synthesis** approaches building on the advances in **differentiable rendering** have been explored.

> **Note:** Essentially outsourcing the problem of calculating high volumes of linear algebra appearing in ray optics mechanics to linear algebra of machine learning.
> **Note:** A rendering pipeline that is differentiable with respect to the parameters of the rendered scene. This allows for a gradient flow from a loss calculated using the ground truth and some scene with flexible enough components back to the scene, adjusting the components to represent the ground truth faithfuly.

Neural radiance fields (Mildenhall, 2020) (NeRFs) introduced a way to represent scenes within neural networks. However, NeRFs often suffer from long training times and slow inference speeds, making them not suitable for real-life performance and the interactive needs of a clinical environment.

The introduction of **3D Gaussian Splatting** (3DGS) (Kerbl, 2023) has marked a significant shift in the field, offering the high fidelity of neural methods with the speed of traditional point-based rasterization. Current research in various splatting methods is rapidly expanding the capabilities of this approach. Recent advances have introduced relightable Gaussians (Gao, 2023; Jiang, 2023), allowing for dynamic lighting changes by incorporating BRDF-like properties into each splat.

> **Note:** Bidirectional reflectance distribution function describes the way light behaves ones it hits the surface of given texture. It is a core part of physically based rendering mathematics.

Advances in shading functions (Liang, 2023) and reflective properties (Yao, 2024) are moving splatting toward true **physically based rendering** (PBR). New methods are addressing the challenge of shadows and complex occlusions within splatted scenes (Bai, 2025), which is vital for understanding the spatial depth of anatomical structures. The question of optimization and visual quality (Yu2023MipSplatting) of Gaussian splatting is being investigated by a large number of teams thanks to the Meta's push for the deployment of this technology in virtual avatar communication systems (Saito, 2023). Leveraging these advancements in Gaussian Splatting and combining them with path-tracing principles, this thesis aims to deliver a framework that matches the visual quality of Siemens’ Cinematic Rendering while maintaining the real-time performance necessary for modern medical practice.

---

## Virtual Reality

The motivating drive behind the proposal of this thesis is supported by the rapid improvement and increasing accessibility of computing hardware capable of such feats. Over the last several years, the sector has moved beyond large, costly solutions requiring flagship hardware toward self-contained, ergonomic systems. Virtual Reality (VR) dominates the potential for immersive experience of medical training (Mergen, 2024). It provides a fully controlled environment for risk-free procedural rehearsals with a active proprietary software provider sector. There has also been a significant surge caused by a push for in the development of augmented reality (AR) and mixed reality (MR) devices that allow user to mix the light coming from the real environment with rendered objects. [TODO]

Modern, eyeglass-like wearables, such as smart glasses, are increasingly viewed as the primary global development target for augmented reality. These systems enable surgeons to overlay volumetric data directly onto the surgical field or allowing students to collaborate around a shared holographic specimen in a physical classroom, or potentially, from home. As the industry moves toward miniaturized, lightweight form factors with higher pixel densities and wider fields of view, the demand for rendering frameworks that can deliver photorealistic, low-latency results increases. This thesis addresses this need by optimizing the path-tracing and splatting pipeline specifically for the performance profiles of these emerging miniaturized wearable platforms.

> **Note:** We will research the capabilities of such systems already in-market and in development.

While 2D monitors are sufficient for standard diagnostics, VR provides a 1:1 spatial mapping that aligns with how humans naturally perceive the physical world. This is particularly important in two key areas.

Traditional medical training often relies on textbooks, 2D atlases, and limited access to cadaver specimens. VR overcomes these problems by providing a 'digital cadaver' that is infinitely reusable and free from biological decay. By allowing students to 'walk through' a heart or navigate the vascular system at an exaggerated scale, VR enables for a deeper understanding of complex spatial relationships that are often lost in cross-sectional imaging. Students can perform repeated manipulations such as isolating a specific nerve or simulating a surgical pathway, allowing them to learn from mistakes without patient risk.

For surgeons, VR acts as a bridge between the digital scan and the operating theater. Surgeons can use the proposed rendering framework to interact with patient-specific anatomy, testing different surgical approaches by manipulating and 'hiding' tissue layers to find the most efficient route. Our framework could offer a multi-user environment where a team (e.g., a radiologist and a surgeon) can simultaneously view the same model in a shared virtual space, regardless of their physical location.

---

## Progress so Far

The chosen topic covers both medical and computer science. The initial phase involved a study of the medical literature to understand the broad language of anatomy and diagnostics based on medical scans. A review of current standards in medical imaging (e.g., DICOM, CT/MRI segmentation) was conducted where the limitations of traditional 2D slice viewing were discovered. Parallel to the medical study, a review of state-of-the-art computer science literature was conducted. Investigating the mathematical framework of 3D Gaussians scene reconstruction and studying how gradient-based optimization can be used to refine medical models. We have studied the shading programming language HLSL and rendering process of DVR and isosurface reconstruction on concrete datasets using the Unity engine.

> **Note:** [https://unity.com/](https://unity.com/)

We continue to review the literature to build an intuition for the possibilities and limitations of the gaussian splatting technology and the direction in which the general research is headed.

The next steps will consist of translating the theory behind gaussian splatting into practice by studying the reference implementation of the papers. This will give us a outlook on the possibilities and problems to try to find solutions to in the next phase.

In parallel, we will research the hardware capabilities of current and next-generation virtual reality systems together with benchmarking the current generation of graphics hardware found on personal computers on rendering path tracing and splatting methods.

### Bibliography

* **Jacques, Steven L (2013).** Optical properties of biological tissues: a review. *Physics in Medicine & Biology*, 58(11), R37.
* **Engel, Klaus (2016).** Real-Time Monte-Carlo Path Tracing of Medical Volume Data. *Proceedings of the GPU Technology Conference (GTC)*.
* **Pharr, Matt; Jakob, Wenzel; Humphreys, Greg (2023).** *Physically Based Rendering: From Theory to Implementation* (4th ed.). MIT Press.
* **Kerbl, Bernhard et al. (2023).** 3D Gaussian Splatting for Real-Time Radiance Field Rendering. *arXiv:2308.04079*.
* **Zhu, Zuoliang et al. (2025).** GS-ROR2: bidirectional-guided 3DGS and SDF for reflective object relighting and reconstruction. *ACM Transactions on Graphics*, 45(1).
* **Gao, Jian et al. (2023).** Relightable 3D Gaussians: Realistic Point Cloud Relighting with BRDF Decomposition and Ray Tracing. *arXiv:2311.16043*.
* **Jiang, Yingwenqi et al. (2023).** GaussianShader: 3D Gaussian Splatting with Shading Functions for Reflective Surfaces. *arXiv:2311.17977*.
* **Liang, Zhihao et al. (2023).** GS-IR: 3D Gaussian splatting for inverse rendering. *arXiv:2311.16473*.
* **Bai, Haiyang et al. (2025).** GaRe: Relightable 3D Gaussian Splatting for Outdoor Scenes from Unconstrained Photo Collections. *arXiv:2507.20512*.
* **Yao, Yuxuan et al. (2024).** Reflective gaussian splatting. *arXiv:2412.19282*.
* **Niedermayr, Simon et al. (2024).** Application of 3D Gaussian splatting for cinematic anatomy on consumer class devices. *arXiv:2404.11285*.
* **Mildenhall, Ben et al. (2020).** NERF: Representing scenes as neural radiance fields for view synthesis. *arXiv:2003.08934*.
