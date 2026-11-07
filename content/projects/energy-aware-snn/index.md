---
cms_slug: energy-aware-snn
draft: false
publications:
  - reinforcement-learning-snn
  - edge-snn-classifier
title: Bio-Inspired Energy-Aware SNN Architecture with Reinforcement Learning
summary: Low-energy spiking neural network hardware for reinforcement learning
  and pattern recognition at the edge.
weight: 3
featured: true
show_date: false
show_author: false
image:
  filename: /mw6welk9-xjmrlw1a.png
---
Bio-inspired Spiking Neural Networks (SNNs) offer potential for scaling to pattern recognition tasks while accommodating low-cost applications. By adapting SNNs to reinforcement learning (RL) schemes, new development avenues open for energy-aware structures. This work employs a real-time RL system with a SNN core for MNIST classification. The proposed architecture enhances a previously developed simple binary decision-making 5-bit integer hardware architecture to handle more complex image recognition tasks at the edge, while maintaining its energy efficiency and high learning accuracy. Although the clock frequency (45 MHz) and dynamic power dissipation (270 mW) scale as expected with network growth on an Intel MAX 10 10M50DAF256C8GES FPGA, the number of cycles for a learning or classifying operation does not change significantly, demonstrating the multi-cycle architecture’s favorable scaling characteristics for low-energy classification problems.