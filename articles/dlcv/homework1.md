---
title: "Homework 1"
layout: "articles/article_dlcv.njk"
homeTag: "dlcv"
tags: "dlcvs"
order : 1
---

# Homework 1: Cifar10 CNN

## Assignment

The goal of this homework is to:

- Design a basic CNN and train on Cifar10 dataset
- Improve the model iteratively and benchmark each iteration

### What is Cifar10

CIFAR-10 is a collection of 60,000 32x32 **color images** divided into 10 mutually exclusive classes. The dataset is split into a training set of 50,000 images and a test set of 10,000 images. The 10 classes are: airplane, automobile, bird, cat, deer, dog, frog, horse, ship, and truck.

## Solution

### Setting

For this project, we will also try to learn how to use Google Cloud virtual machine for compute. Because the virtual machine uses os image with `python 3.12` and `pytorch 2.7.` we will be using those versions.

We will be using uv for project management.

The package name of our project will be `cifar10_cnn` and the structure is:

- Core package contains the training module
- Subpackage `models` contains the base model and every upgrade iteration
- Subpackage `tests` contains testing
- Subpackage `utils` contains data loaders

### Dataset Loaders

Function `get_loaders(batch_size, augment=False, first_1000=False)` returns `DataLoader` objects from `torch.utils.data`:

- the `train_loader` filled with training data
- the `val_loader` filled with validation data

The data can be transformed between loading from builtin Cifar10 object to the loaders:

- `batch_size` - self explaining
- `augment` - image augmentation is handled trough tensor transformation by `CIFAR10` object
- `first_1000` - allows for fast prototyping via `Subset` object

### Input data

Images with resolution of 32x32 and 3 channels. 10 classes. `(image, class)`

### Training

The training loop is classic pytorch template loop:

- **For all epochs do**
    - Train one epoch on training data
    - Evaluate the epoch on validation data
- **For each epoch do**
    - Set model to training mode - `model.train()`
    - **For each batch in loader do** (e.g. `torch.Size([64, 3, 32, 32])`)
        - Send the data to available device (CPU, GPU if CUDA)
        - Do one forward pass on the data
        - Calculate loss
        - Compute statistics

### Base Model

The base model `class Cifar10_CNN_Base(nn.Module):` uses the Adam optimizer and ReLU activations per the assignment.

The model consists of 3 feature-extraction layers with kernel size 3 and standard padding of 1:

| Layer | InOut / Size | Result Data Dimension |
| :---        |    :----:   |          ---: |
| Input | - | `3x32x32` |
| 2D Convolutional | `3, 32` | `32x32x32` |
| 2D Max Pool | `2` | `32x16x16` |
| 2D Convolutional | `32, 64` | `64x16x16` |
| 2D Max Pool | `2` | `64x8x8` |
| 2D Convolutional | `64, 128` | `128x8x8` |
| 2D Max Pool | `2` | `128x4x4` |

And of two classification layers that take in flattened output of the convolution module:

| Layer | InOut / Act | Result Data Dimension |
| :---        |    :----:   |          ---: |
| Input | - | `128x4x4` |
| Flatten | - | `2048` |
| ---        |    ---   |          --- |
| Input | - | `2048` |
| Linear | ReLU | `2048x256` |
| Linear | - | `256x10` |

The output is raw logit representation of the classes logistic distribution.

