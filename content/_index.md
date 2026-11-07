---
title: ''
summary: Integrated Circuits & Bio-Sensors Laboratory at Middle East Technical University.
type: landing
sections:
  - block: hero
    id: introduction
    content:
      eyebrow: ICBS-LAB · METU Electrical and Electronics Engineering
      primary_action:
        text: Meet the team
        url: members/
        style: solid
      secondary_action:
        text: Explore projects
        url: projects/
    design:
      layout: stacked
      alignment: center
      size: none
      spacing:
        padding: ['clamp(2.5rem, 5vw, 4rem)', '0', '1rem', '0']
  - block: markdown
    id: research
    design:
      css_class: icbs-research
      spacing:
        padding: ['2rem', '0', '2.5rem', '0']
  - block: collection
    id: projects
    content:
      title: Featured projects
      count: 3
      sort_by: weight
      sort_ascending: true
      filters:
        folders: [projects]
        featured_only: true
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
