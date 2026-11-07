# Pages CMS: administrator setup and content model

## Status and activation boundary

This integration is local configuration and Hugo rendering support. No hosted
CMS connection, GitHub App installation, collaborator invitations, protection
rules, remote branches, push, merge, or deployment were performed by this work.
Complete the owner-run acceptance tests below before inviting normal editors.

The website remains a static HugoBlox site. Hosted Pages CMS edits repository
files through its GitHub App; no CMS runtime, credentials, database, or admin
JavaScript is added to the public website.

## Connect manually after review

1. Review the local `pages-cms-integration` branch and its validation report. The branch starts at the latest visual-refinement HEAD, not the older `main`. Resolve/approve that branch history before merging through your normal process.
2. After approval, make the integration available on GitHub through your normal review process. Create a durable **cms-drafts** branch from the approved website version. Keep it synchronized with `main` after every publication; do not let it diverge behind code changes.
3. Before granting CMS access, protect **main** with a branch protection rule or ruleset. Require a pull request, at least one designated reviewer approval, and the existing Hugo **Build** check plus **CMS content integrity**. Select the actual checks after they have run once. Disallow force pushes/deletions and do not give the Pages CMS App a bypass. Require updated approval after substantive changes. If the repository/account cannot enforce these protections, do not activate the approval workflow on this production repository.
4. Sign into [hosted Pages CMS](https://app.pagescms.org/) with the owner's GitHub account. Manually install its GitHub App for **HighFunctioningProgrammer/research-group-page-demo only**, after reviewing the permissions GitHub displays. Follow the [official quick start](https://pagescms.org/docs/quick-start/).
5. Open the repository and choose **cms-drafts**. Confirm `.pages.yml` loads without errors. Bookmark that branch for maintainers.
6. Complete the hosted acceptance checklist below with the owner or one pilot editor. Then invite approved people by email through Pages CMS. Give each editor the branch-specific bookmark and `CONTENT_MANAGEMENT_GUIDE.md`. Ordinary invited collaborators do not need GitHub accounts.
7. A reviewer opens a GitHub pull request from `cms-drafts` to `main`, checks the file diff and generated site, waits for both required checks, and merges only approved changes. The existing main-branch GitHub Pages workflow publishes the result. No new deployment path is introduced.

Pages CMS collaborators are repository-scoped, **not branch-scoped**. Hiding the
configuration UI and bookmarking `cms-drafts` are usability measures; protection
of `main` is the approval boundary. Test that the App cannot write directly to
`main` before handing over access. Invitations/access are managed in the hosted
service, not committed to `.pages.yml`. See [collaborator access](https://pagescms.org/docs/configuration/collaborators/).

There is no native approval workflow configured inside Pages CMS. Save creates
branch commits; an editor tells the reviewer when ready. Uploads may be saved
before the content entry, so review media changes as well. Keep App commit identity
instead of publishing editors' email addresses in commit authorship. Do not add
access tokens or invitation email lists to the repository.

## Content model and native rendering

| CMS area | Repository source | HugoBlox behavior / compatibility support |
|---|---|---|
| Members and coauthors | `data/authors/*.yaml` | Native `hugoblox/author/v1`, `name`, `role`, `user_groups`, `bio`, `links`. Four original lab categories remain unchanged. External coauthors use a fifth group excluded from Members. |
| Portraits | `cms.avatar` in each author | Native profile helper gains explicit portrait selection, then falls back to `assets/media/authors/<slug>.*`. Existing photographs are not moved or altered. |
| Author detail pages | Existing `content/authors/<slug>/_index.md`; native content adapter for missing pages | New people get native author term pages without a second CMS entry. Existing stubs/URLs remain. |
| Projects | `content/projects/<cms_slug>/index.md` | Native bundles, featured images, rich Markdown body, external links and listing. `publications` gives explicit priority order; papers referencing the project are appended by date without duplicates. |
| Publications | `content/publications/<cms_slug>/index.md` | Native ordered author IDs, publication object, `hugoblox.ids.doi`, `projects`, abstract and attachment rendering. |
| PDFs and BibTeX | Optional `cms.pdf`, optional `bibtex`; original bundled `cite.bib` | Small attachment-helper extensions turn the upload into a normal PDF link and pasted BibTeX into `<paper>/citation.bib`. Pasted text takes precedence; old files remain and are the fallback. |
| Homepage / Contact | `data/site/home.yaml`, `data/site/contact.yaml` | A small landing adapter injects values into the existing hero, Markdown and contact-info blocks. These data files are the single source for editable wording. Design, buttons and collection settings stay in the page configuration. |
| News | `content/news/<cms_slug>/index.md` | Native post type, forced draft. Section itself is draft. No navigation, homepage block or sample article. Launch requires a separate review and relaxing the integrity guard. |

New published projects/publications appear automatically in their main listings.
Native homepage project filtering now honors `featured`, keeps three slots and
sorts by weight. The latest two publications appear on the homepage. All current
published entries explicitly have `draft: false` so the CMS's new-entry draft
default cannot accidentally unpublish them on first save.

People use the existing immutable `slug`; bundles add `cms_slug` matching their
existing folder. The CMS disables rename/delete. Display-name edits retain IDs;
authors should be moved to Alumni instead of deleted. Integrity checks reject
filename/ID mismatches and dangling author/project/publication references,
including in drafts. Existing author stub document titles remain separate native
metadata; ask a maintainer to update the stub title if a person's name changes.

## Media and metadata safety

- Images: Pages CMS maps repository `assets/media` to `/`. Stored values such as `/authors/hasan-ulusan.jpg` are **asset keys**, resolved by HugoBlox's resource helpers and Markdown image hook; they are not emitted as root-host image URLs. Processed output URLs include the GitHub Pages prefix.
- PDFs: uploads go to `static/uploads/publications`, stored as `uploads/publications/<file>.pdf`. Native URL helpers add the base path. External publisher/PDF URLs remain ordinary entries in `links`.
- Random upload filenames reduce collisions. Never delete or rename shared media casually. The CMS cannot disable media deletion with the content operations setting; integrity/build/link checks and reviewer inspection protect referenced assets. Brand assets and all source changes still require review.
- `settings.content.merge: true` preserves unexposed frontmatter and nested object properties. CMS **replaces arrays** on save. Current editable link items are fully modelled; native optional page-link attributes are hidden fields. If developers add new attributes to editable array items, they must add corresponding hidden fields and extend the save-contract/hosted tests before editors save those records.
- The Web address field is intentionally visible once an entry exists because Pages CMS has no conditional create-only property for arbitrary fields. Editors are instructed not to change it; the integrity check blocks mismatched changes from being approved. Hidden UUID fields cannot safely replace the existing friendly IDs.

The few copied native utility partials document the pinned Kit revision
`61f41d3667f1`. Reconcile their small extensions when intentionally upgrading Kit;
no dependencies were changed for this integration.

## Optional citation import

The existing `import-publications.yml` can import a repository BibTeX file and
open a PR. It remains a **maintainer-only** tool, not an editor action. Its output
has not been proven compatible with this installed author/DOI schema or CMS
identifiers. Normalize its output and pass all checks before accepting an import.
No custom DOI lookup service, backend, import dependencies or workflow changes
are introduced here.

## Local developer checks (existing Windows portable tools)

From the repository in PowerShell, configure only this process:

```powershell
$repo = (Get-Location).Path
$env:PATH = "$repo\.local\tools\hugo;$repo\.local\tools\go\go\bin;$repo\.local\tools\node\node-v22.22.0-win-x64;$repo\.local\pnpm\node_modules\.bin;" + $env:PATH
$env:GOMODCACHE = "$repo\.local\gomodcache"
$env:GOCACHE = "$repo\.local\gocache"
$env:HUGO_CACHEDIR = "$repo\.local\hugo-cache"
$env:NODE_PATH = "$repo\node_modules"
node scripts/check-cms.mjs
node scripts/test-cms.mjs
hugo --environment production --minify --baseURL 'https://highfunctioningprogrammer.github.io/research-group-page-demo/'
pnpm.cmd run pagefind
node scripts/check-site-links.mjs
hugo server --environment development --disableFastRender --baseURL 'http://localhost:1313/research-group-page-demo/'
```

Open `http://localhost:1313/research-group-page-demo/`. Stop with Ctrl+C. The
`.cmd` launcher avoids PowerShell execution-policy restrictions without changing
that policy. Tests use copies in ignored `.local/cms-test-*` directories and
remove only their own fixtures. Local build outputs and caches are ignored.

## Owner-run hosted acceptance before normal editor access

Use only explicitly named temporary test entries on `cms-drafts`, with no merge
to production. Keep a record of their paths so only those entries/uploads are
removed afterward. An owner may remove test files through GitHub because CMS
entry deletion is deliberately disabled.

- Confirm all forms open, existing portraits display, reference dropdowns show friendly names, and the editor accepts a new bundle's nested filename.
- Save an existing member without changing it. Check the GitHub diff: affiliations, interests, structured names, links, weights and unexposed metadata must remain. Repeat with a publication and its DOI/venue/author order/citation file.
- Add a temporary member without publications and update their portrait; verify its category and generated profile in a local build of that branch.
- Add a temporary project with a thumbnail and inline image; add a paper with ordered external coauthors, DOI, PDF and pasted BibTeX. Verify image field/rich-text upload paths, citation download, preview and GitHub Pages prefix.
- Save homepage/contact wording, restore it, and confirm layout settings were untouched.
- Confirm drafts stay private to builds and News remains draft-only. Try changing an existing Web address and verify the PR integrity check fails; then restore it.
- Verify ordinary collaborators cannot manage configuration/invitations, and direct `main` writes fail for the App. Verify a reviewer can approve and merge normally.
- Remove only the recorded fixtures and restore any edited real content before approving the feature for use.

If hosted acceptance finds a serializer/schema difference, leave access disabled
and fix it on the development branch. Local contract tests do not replace this
hosted check.

## Recovery

Before merge, correct or revert the affected branch commit. After publication, a
maintainer can use GitHub's commit history/Revert interface to open a reviewed
restoration PR. Restore referenced media and entries together; run both checks.
If access must be withdrawn, remove the invited collaborator in Pages CMS or
adjust/uninstall the App manually in GitHub. No recovery or access changes are
performed automatically by this integration.
