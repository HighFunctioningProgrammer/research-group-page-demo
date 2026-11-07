# Pages CMS integration validation

Validated locally on Windows, 7 November 2026. The hosted CMS is **not connected
or enabled**. Configuration/rendering work is ready for review; hosted form-save
acceptance and access/protection setup remain owner actions.

## Results

| Check | Result |
|---|---|
| Portable toolchain | Hugo Extended 0.162.1; Go 1.23.12; Node.js 22.22.0; pnpm 10.14.0 via `pnpm.cmd` |
| Dependencies | Existing installed packages and `.local/gomodcache`; no installations, upgrades or dependency-file changes |
| CMS integrity | PASS, including drafts, future and expired entries |
| Isolated integration tests | 16 grouped checks passed; only explicitly created fixture copies were changed/removed |
| Hugo production build | PASS, `--minify`, correct GitHub Pages base URL; 71 pages, 124 processed images, 23 aliases, no warnings/errors on the final build |
| Pagefind | PASS, installed Pagefind 1.5.2; 59 HTML files discovered, 6 pages indexed, 353 words, one language |
| Generated HTML links/assets | PASS, 59 HTML files and 806 internal URL/asset references; no missing targets or paths escaping `/research-group-page-demo/` |
| Local HTTP preview | Homepage, Members, Projects, Publications, Contact, external-coauthor profile, original citation, team photograph and favicon returned HTTP 200 |
| Preview cleanup | Temporary Hugo server stopped; no listener remained on port 1313 |
| Source checks | Node syntax checks and `git diff --check` passed |
| Existing deployment/dependencies/design | Existing build/deploy/import workflows, Hugo/module pins, package files, METU theme, CSS and navigation unchanged |

Production commands used:

```text
node scripts/test-cms.mjs
node scripts/check-cms.mjs
hugo --environment production --minify --baseURL https://highfunctioningprogrammer.github.io/research-group-page-demo/
pnpm.cmd run pagefind
node scripts/check-site-links.mjs
```

The native filesystem sandbox initially prevented Hugo's existing bundler from
resolving Preact; the untouched baseline also failed there. The authorized local
build passed with filesystem access, without dependency/configuration changes.
PowerShell blocks the `.ps1` pnpm launcher; the existing `.cmd` launcher works.
Fixture tests copy installed packages locally because Hugo restricts Tailwind's
Node process to the fixture project directory; no packages are installed.

## What the tests cover

- Compared the 19 original people and the three project/two publication bundles with HEAD `0d5369a` using Hugo's parser. Original descriptions, roles, categories, affiliations, interests, links, venue/date/DOI metadata and displayed ordered author names are retained. Original BibTeX content is unchanged, allowing Windows Git line-ending conversion.
- Exercised the configured save contract against every existing editable record: unexposed top-level/nested metadata and separate lists remain; current link-item properties remain; an unchanged published record stays published. This is a local model of the documented/source-audited Pages CMS merge behavior, **not an actual hosted save**.
- Edited an existing member's biography/portrait only in an isolated copy. Created a new person and a separate person with no publication reference or physical author stub. Native author pages, contact links and team listings rendered.
- Checked Professor, Graduate Student, Undergraduate Student and Alumni placement. External coauthors stayed off Members. Archiving retained the author identifier.
- Created a project with thumbnail, inline image, external link and related paper. Created a publication with ordered author references, Turkish characters, venue, DOI, abstract, PDF, project and pasted citation. Verified the Cite URL/download and GitHub Pages paths.
- Checked standalone BibTeX-only, DOI-only and PDF-only attachments. Pasted BibTeX took precedence without overwriting the original bundled citation.
- Checked automatic listings, homepage featured projects/latest publications, homepage/contact data projection, and exclusion of draft papers and News.
- Rejected changed/duplicate person identifiers, invalid category, missing portrait, dangling author/project/publication, mismatched publication identifier, missing PDF and premature News publication.

Test fixtures live only in a newly created ignored `.local/cms-test-*` copy and
are removed by the test's cleanup. No test person, project, paper, PDF or news
article remains in real site content. Repeatable scripts are included; the local
run summary is in ignored `.local/cms-test-results.json`.

## Source changes and mappings

| Files | Purpose |
|---|---|
| `.pages.yml` | Native CMS collections/forms, references, validation, media mapping, protected content operations and metadata merging |
| Existing 19 `data/authors/*.yaml` files | Add explicit references to their existing portraits; preserve native data |
| Two new external-coauthor YAML records | Model names already present in citations without inventing roles, affiliations or biographies |
| Existing five project/publication bundle indexes | Stable CMS IDs and explicit published status; canonical external author references; structured project-paper relationships |
| `content/_index.md`, `content/contact/_index.md`, `data/site/*.yaml` | Move editable wording/photo/contact values into safe forms; retain native block configuration and existing rendered wording |
| `content/authors/_content.gotmpl` | Generate missing native author term pages |
| `content/news/_index.md` | Draft-only section, with no public feature/navigation |
| `layouts/_partials/landing_page.html` | Project editable data into the existing native landing blocks |
| Three `layouts/_partials/functions/*.html` overrides | Small extensions to the pinned native author/attachment helpers for selected portraits, plain emails, uploaded PDFs and pasted BibTeX |
| `layouts/_partials/page_related.html` | Replace the manually maintained project-paper list with structured relationships in the existing article footer; retain its original links/order |
| `scripts/check-cms.mjs`, `scripts/cms-check/**`, `scripts/test-cms.mjs`, `scripts/check-site-links.mjs` | Dependency-free content audit, isolated integration/regression tests and generated-link checks |
| `.github/workflows/cms-content-check.yml` | New read-only PR status; existing deployment workflows untouched |
| `static/uploads/publications/.gitkeep` | Ensure the PDF upload directory exists; no actual documents added |
| `CONTENT_MANAGEMENT_GUIDE.md`, `docs/CMS_SETUP.md`, this report | Editor instructions, manual access/review setup, implementation model and verification evidence |

Git began clean on `visual-refinement-iteration-1` at `0d5369a`. The final local
branch is `pages-cms-integration`, with the same HEAD and uncommitted CMS changes.
There are 26 modified tracked files and 25 new files. No commit, push, merge,
deployment, App installation or remote settings change was performed.

## Limits and owner review

- No enabled browser surface was available. HTTP/generated HTML checks passed; desktop/mobile visual inspection and browser interaction remain manual review items. No redesign or CSS change was made.
- Hosted CMS schema loading, actual save/upload/reference-picker behavior, invited-email sign-in, App branch protection and the reviewer workflow cannot be tested before the owner's manual connection. Follow the pilot checklist in [CMS_SETUP.md](CMS_SETUP.md) before normal editor access.
- The GitHub Actions status is configured but has not run remotely. Its module-free Hugo checker passed locally; owners must select the actual emitted check names when configuring protection.
- CMS arrays replace wholesale. All currently used editable link properties are modelled; developers must extend hidden fields/tests when introducing additional technical attributes within those arrays.
- BibTeX receives a basic shape check; a reviewer must verify its bibliographic accuracy. Optional automatic DOI/import functionality is not enabled or claimed tested.
- Existing Pagefind coverage indexes six marked pages. This integration preserves that coverage rather than changing search templates.
- The known unused CSS reference `/media/textures/noise-pattern.svg` is unchanged. The generated HTML link check does not audit CSS URLs. No workaround was added.

Preview instructions and manual connection steps are in [CMS_SETUP.md](CMS_SETUP.md).
