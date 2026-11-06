# ICBS-LAB migration report

Completed locally on 6 November 2026. Nothing was pushed or deployed, and no remote settings were changed.

## Result

- Adapted the existing Academic CV site to ICBS-LAB with Home, Members, Projects, Publications, and Contact.
- Reused the pinned Kit's `hero`, `markdown`, `collection`, `team-showcase`, `contact-info`, author taxonomy pages, publication detail layout, citation controls, Pagefind search, navbar, dark mode, default theme, and academic typography.
- Migrated 19 members (1 faculty, 8 graduate, 9 undergraduate, 1 alumnus), their original portraits and professional links, three complete project descriptions, two verified conference citations with BibTeX, and the original team photo. Names and Turkish characters are preserved.
- Removed only identified starter demonstrations, including the fictional author, résumé, blog, courses, events, slides, projects, publications, and GitHub button hook.
- Set the production `baseURL` to the existing GitHub Pages repository URL. All workflows, permissions, pinned module versions, package dependencies, lockfile, and `hugoblox.yaml` remain unchanged. Added `go.sum` checksums for the existing pinned modules.

## Small compatibility adaptations

The native team block hard-codes root-relative `/authors/` links, which break on repository-based Pages sites. `layouts/landing/members.html` delegates rendering to Kit and normalizes only that URL prefix with `relLangURL`. It also makes the member grid searchable. It contains no replacement grid, styles, or JavaScript.

The native hero's image helper fails when the original image is smaller than its smallest 600-pixel variant. The team photo uses Kit's native Markdown responsive image renderer instead. No source photo was enlarged or altered. Publication pages use the native `profile: false` option to omit redundant author biography cards (the pinned card also has root-relative profile links); the ordered citation authors and author archive links remain.

The starter's Creative Commons content-license declaration was removed through the supported copyright option because the source photographs do not state that license. HugoBlox attribution and the repository's existing code license remain.

## Verification

Portable local tools: Hugo Extended **0.162.1**, Node **22.22.0**, Go **1.23.12**, pnpm **10.14.0**. Tools, source caches, and local previews are ignored under `.local/`; dependencies are ignored under `node_modules/`.

| Check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passed; existing lockfile retained |
| `hugo --minify --cleanDestinationDir --environment production` | Passed with the configured Pages base URL |
| Final `hugo --minify --environment production` | Passed without warnings; 71 generated pages, 122 processed images |
| `pnpm run pagefind` | Passed; 6 searchable content pages including members, projects, publications |
| `python scripts/validate_migration.py` | Passed: 59 HTML files, 911 internal URL references, source names/groups, complete project text, ordered publication authors and DOI links, BibTeX, 20 original-photo hashes, demo removal, protected dependency/workflow files |
| `git diff --check` | Passed |
| Local HTTP preview under `/research-group-page-demo/` | Returned HTTP 200 |
| Representative HTTP routes | 14 checks passed: all sections, all projects/publications, representative profiles, BibTeX download, and Pagefind JavaScript |
| Interactive desktop/mobile, dark mode, search dialog and citation modal | Not visually tested: browser inventory was empty and the in-app browser returned `Browser is not available: iab` |

The initial starter build depended on remote demo/Unsplash resources and failed under the network sandbox. Those demonstration resources were removed as requested. The migrated build uses local photographs. Building native Preact assets required normal local filesystem access because sandboxed dependency resolution was denied; the successful build used the unchanged installed dependencies.

## Source mappings and owner review

See [migration-inventory.md](migration-inventory.md) for the architecture audit and page mappings, and [migration-sources.json](migration-sources.json) for every member, source photo URL/checksum, full project description, and verified publication record.

- **Corrected source DOI:** ICM's printed `10.1109/ICM66518.2025.113224899` has an extra final `9`. The source's IEEE document link and IEEE-deposited Crossref metadata verify `10.1109/ICM66518.2025.11322489`.
- **Name discrepancy:** the source displays **Emir Yunus Özen**, while its LinkedIn URL says **emir-yusuf**. Both were preserved for lab review.
- **Faculty title/contact:** kept the requested **Professor** category; the individual role is **Assistant Professor**, verified in METU's faculty directory. Email, phone, and D-124/1 are explicitly faculty-office details.
- **Media:** all 20 original photographs were accessible; no missing images or generated photographs. The owner should confirm permission for continued use, as the old site states no explicit media license.
- **Unprovided details:** detailed bios, graduate degree levels, graduation dates, project dates/statuses, a separate lab-room address/email, office hours, and openings were not invented.
- **Publisher page access:** the linked [ICM IEEE page](https://ieeexplore.ieee.org/document/11322489/) returned HTTP 202 with an empty body, and the [ISCAS IEEE page](https://ieeexplore.ieee.org/abstract/document/11043569) returned HTTP 418. Both citations were independently verified through IEEE's complete Crossref deposits; full-text PDFs were not retrieved or copied.
- **Visual review:** check the native grid at desktop and phone widths, long Turkish names, dark mode, search, and citation/download interactions in a browser before publishing.
