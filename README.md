# ICBS-LAB research group website

Integrated Circuits & Bio-Sensors Laboratory, Middle East Technical University.
This repository adapts the existing HugoBlox Academic CV installation using its native research-group components.

## Local development

Use Hugo **Extended 0.162.1**, Node **22**, Go **1.23**, and pnpm **10.14.0** (the versions used by the existing build configuration).

```sh
pnpm install --frozen-lockfile
hugo server --disableFastRender
```

## Production build and migration validation

```sh
hugo --minify --cleanDestinationDir --environment production
pnpm run pagefind
python scripts/validate_migration.py
```

The configured production URL includes `/research-group-page-demo/`. Preserve that base path in local production checks. The existing GitHub Actions workflow passes GitHub Pages' configured base URL, builds Hugo, generates Pagefind, and publishes on pushes to `main`. No workflow or remote setting was changed by this migration.

## Editing content

- Home sections: `content/_index.md`.
- Member groups and grid: `content/members/_index.md`, using native `team-showcase` with four columns on wide desktops.
- Member records: `data/authors/<slug>.yaml` (installed `hugoblox/author/v1` schema). Portraits: `assets/media/authors/<slug>.*`. Native profile pages: `content/authors/<slug>/_index.md`.
- Projects: `content/projects/<slug>/index.md`. Keep full descriptions and add a concise `summary` for collection cards.
- Publications: `content/publications/<slug>/index.md` and `cite.bib`. Preserve author order; use structured `publication` fields and `hugoblox.ids.doi`.
- Contact: `content/contact/_index.md`. Publish only verified details.
- Identity and theme options: `config/_default/params.yaml`. Navigation: `config/_default/menus.yaml`.

Keep the installed Kit modules, default theme, native layouts, package dependencies, and deployment conventions. Do not copy the legacy Research Group template's Bootstrap stack into this modern Kit installation.

`layouts/landing/members.html` is a small adapter around Kit's existing landing renderer: it corrects the pinned team block's hard-coded author URLs for GitHub Pages' subpath and marks members for search. No custom grid or stylesheet is introduced. Recheck this adapter after any future Kit upgrade.

## Migration records

- [Migration report](docs/migration-report.md): changes, build results, compatibility adaptations, and review items.
- [Migration inventory](docs/migration-inventory.md): audit and source-to-component mapping.
- [Source manifest](docs/migration-sources.json): exact people, source photographs and checksums, complete project descriptions, verified publication metadata.

Content was migrated from the public ICBS-LAB website; contact details were verified against METU's directory, and publication metadata against IEEE's Crossref deposits. See the report for the corrected ICM DOI and one member-name/link discrepancy. Original media provenance is retained; no new license for those photographs is asserted.
