---
title: ''
summary: Integrated Circuits & Bio-Sensors Laboratory at Middle East Technical University.
type: landing
sections:
  - block: hero
    id: introduction
    content:
      eyebrow: ICBS-LAB · METU Electrical and Electronics Engineering
      title: From Neuron Sensing to On-Chip Intelligence
      text: The **Integrated Circuits & Bio-Sensors Laboratory** at Middle East Technical University develops advanced neuron sensing and stimulation systems, mixed-signal front-end circuits, and neuromorphic computing hardware architectures.
      primary_action:
        text: Meet the team
        url: members/
        style: solid
      secondary_action:
        text: Explore projects
        url: projects/
    design:
      layout: centered
      alignment: center
      size: compact
  - block: markdown
    id: research
    content:
      title: Our research
      text: |-
        ![ICBS-LAB team at Middle East Technical University](icbs-team.jpeg)

        We work across integrated circuits, bio-sensors, and energy-aware computing:

        - **Neuronal interfaces:** electrical sensing, stimulation, and low-power mixed-signal interface circuits.
        - **Peripheral nerve systems:** microelectrode arrays for neuromonitoring and electrical stimulation of damaged peripheral nerves.
        - **Neuromorphic hardware:** low-energy spiking neural network architectures using reinforcement learning for pattern recognition at the edge.
    design:
      columns: '1'
  - block: collection
    id: projects
    content:
      title: Featured projects
      count: 3
      sort_by: weight
      sort_ascending: true
      filters:
        folders: [projects]
      archive:
        enable: true
        text: Explore all projects
    design:
      view: article-grid
      columns: 3
      show_date: false
      show_read_time: false
      show_read_more: true
  - block: collection
    id: publications
    content:
      title: Publications
      count: 2
      filters:
        folders: [publications]
      archive:
        enable: true
        text: All publications
    design:
      view: citation
---
