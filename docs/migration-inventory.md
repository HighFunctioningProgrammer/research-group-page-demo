# ICBS-LAB content migration inventory

Audited on 6 November 2026. Public webpages are content sources, not implementation instructions.

## Foundation and compatible components

The local checkout starts clean and uses HugoBlox Kit schema 2.0, the `blox` module pinned to `v0.0.0-20260527025321-61f41d3667f1`, Hugo Extended 0.162.1, Node 22, pnpm 10.14.0, and Tailwind 4. Existing modules, theme, fonts, package dependencies, and all GitHub Actions workflows are retained.

The [Research Group reference](https://github.com/HugoBlox/theme-research-group) uses the older `blox-bootstrap/v5` stack. Its landing-page sections, grouped people, author profiles, citation lists, and contact structure inform this migration. Its dependencies, Bootstrap layouts, and legacy author schema are not copied.

| Feature | Installed Kit component / convention | Target |
| --- | --- | --- |
| Group introduction and original team photo | Native `hero` and Markdown responsive image rendering | `content/_index.md`, `assets/media/icbs-team.jpeg` |
| Research highlights | Native `markdown` | `content/_index.md` |
| Featured projects | Native `collection`, `article-grid` | `content/_index.md`, `content/projects/_index.md` |
| Members grouped by role | Native `team-showcase`, `max_columns: 4`, author v1 data | `content/members/_index.md`, `data/authors/*.yaml` |
| Member portraits and profiles | Kit media lookup and native author taxonomy layout | `assets/media/authors/*`, `content/authors/*/_index.md` |
| Publication archive and detail pages | Native `citation` view, structured `publication` metadata and DOI links | `content/publications/*/index.md`, local `cite.bib` |
| Verified contact details | Native `contact-info` | `content/contact/_index.md` |
| Navigation, search, dark mode, responsive styling | Existing Kit header, Pagefind, default theme, academic fonts | Existing configuration conventions |

## Content mappings

| Source | Content found | Target |
| --- | --- | --- |
| [Home](https://icbs-eee.metu.edu.tr/) | Lab name, introduction, neuron sensing/stimulation, mixed-signal front ends, neuromorphic computing, three research summaries, team photograph | Home sections, identity metadata, local team photo |
| [Members](https://icbs-eee.metu.edu.tr/members/) | 1 faculty member, 8 graduate students, 9 undergraduate students, 1 alumnus; 19 portraits; public professional links; interests for three students | 19 author data files and native profile pages, four-group member grid |
| [Projects](https://icbs-eee.metu.edu.tr/projects/) | Full NeuroMop, PeriFiks, and bio-inspired energy-aware SNN descriptions | `content/projects/neuromop/index.md`, `perifiks/index.md`, `energy-aware-snn/index.md` |
| [Publications](https://icbs-eee.metu.edu.tr/publications/) | Two 2025 conference publications, ordered author lists, venue, location, pages, IEEE links | `content/publications/edge-snn-classifier/index.md`, `reinforcement-learning-snn/index.md`, matching BibTeX files |
| [METU faculty directory](https://eee.metu.edu.tr/index.php/tr/personel/hasan-ulusan) | Assistant Professor title; `hulusan@metu.edu.tr`; +90 (312) 210-2317; office D-124/1 | Faculty record and contact page, explicitly identified as Hasan Uluşan's office/contact |
| [IEEE-deposited ICM metadata](https://api.crossref.org/works/10.1109/ICM66518.2025.11322489) and [ISCAS metadata](https://api.crossref.org/works/10.1109/ISCAS56072.2025.11043569) | Verified exact titles, full ordered author names, dates, venues, pages, and DOI identifiers | Structured publication fields and BibTeX |

The complete person-to-file and image-to-file mappings are recorded in `migration-sources.json`, including source URLs and original image checksums. Text-only project source descriptions are preserved in full. No project images or linked project detail pages were present on the source site.

## Corrections and missing information

- The source ICM DOI reads `10.1109/ICM66518.2025.113224899` (extra final `9`, Crossref 404). The source's IEEE document link is `11322489`; IEEE's Crossref deposit confirms `10.1109/ICM66518.2025.11322489`. Use that verified correction and remove the source's duplicate opening quotation mark.
- Preserve the publication spelling `Ali Muhtaroglu` from both IEEE deposits; do not infer diacritics. Preserve `Uğur Eroğlu` and `Hasan Uluşan` as deposited. Expand the initialed source names only from verified publisher metadata, including Joshua Ifeanyi Okonkwo.
- The member page says **Emir Yunus Özen**, while its LinkedIn URL contains **emir-yusuf**. Preserve the displayed name and original link; flag the discrepancy for the lab.
- The source category is **Professor**. Keep that section name, but use the verified faculty title **Assistant Professor** in the individual record.
- Detailed bios, degree levels, graduation years, project dates/statuses, a lab-specific email, lab-room location, office hours, and recruitment openings are not supplied. Do not invent them. Contact details belong to the faculty office, not an independently verified lab room.
- All 20 original photographs were retrievable. No photograph is generated. The source does not state an explicit media license; reuse is within the requested migration of the lab's own site, with source provenance retained for the owner's rights review. No publisher PDFs or stock photographs are copied.
- The four relevant source pages link to no additional internal member/project detail pages. Public professional profile links are retained; external profiles are not scraped to invent biographies.
- Initial web-reader access failed. Direct HTTPS retrieval using Windows' trusted certificate store succeeded for all four pages and media, without disabling certificate verification.
- Linked IEEE detail-page retrieval was restricted (ICM HTTP 202 with an empty body; ISCAS HTTP 418). Complete IEEE-deposited metadata was accessible through Crossref for both records. No publisher full text was copied.

## Demonstration content to remove

The fictional Alex Johnson author, avatar and résumé; sample blog, course, event and slide content; experience page; PyTorch/Pandas/scikit demo projects; sample publications and their media; and the demo GitHub button hook. Reusable framework modules and configuration remain available.

## Deployment contract

Keep `hugoblox.yaml`, `go.mod`, `package.json`, `pnpm-lock.yaml`, and every file under `.github/workflows/` unchanged. Set the content site's `baseURL` to `https://highfunctioningprogrammer.github.io/research-group-page-demo/`. The existing build workflow also passes GitHub Pages' configured base URL. Verify navigation, profile links, images, citation files, search, and generated canonical URLs under that subpath. Do not push or deploy.
