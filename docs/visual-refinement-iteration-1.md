# Visual refinement · Iteration 1

Prepared for visual review on 7 November 2026. No commit, push, merge, or deployment was performed.

## Git preparation

The starting working tree on `migrate-icbs-website` was clean. After `git fetch origin`, `git merge-base --is-ancestor migrate-icbs-website origin/main` returned 0: the migration was already merged. This iteration starts on `visual-refinement-iteration-1` from `origin/main` at `f03c8f0` (the migration PR merge).

## Changes and reused functionality

| File | Purpose |
| --- | --- |
| `data/themes/metu.yaml` | Native dual-mode HugoBlox theme pack. Centralizes METU red `#E31837`, cool gray `#717073`, black, white light surfaces, and charcoal dark surfaces. Kit generates its existing color scales from these values. |
| `config/_default/params.yaml` | Selects the `metu` pack and removes the second university name from the native copyright notice. Retains academic typography, navigation behavior, theme toggle, search, and visible HugoBlox credit. |
| `content/_index.md` | Uses native hero layout and spacing settings to shorten the hero. Keeps the exact headline, lab description, both actions, research copy, and project/publication collections. Makes “Our research” a semantic Markdown heading. |
| `assets/css/custom.css` | Uses Kit's existing fingerprinted custom-CSS hook. Bounds homepage heading sizes, arranges native Markdown research content into two columns at 56rem and above, enlarges the original photo without cropping, and provides a lighter native red for dark-mode navigation text. Simplifies footer spacing and hides only the optional marketing CTA. |
| `docs/visual-refinement-iteration-1.md` | Records scope, validation, preview commands, and review limitations. |

No new component, template override, framework, package, font, photograph, or JavaScript was introduced. The original author, project, publication, contact, and media files remain unchanged, as do menus, module pins, dependency files, workflows, and the existing license.

The installed Markdown block ignores `design.columns`; it provides no two-column content API. Its supported CSS hook is used to arrange the existing Markdown output. The alternative native image-and-text block requires an image at least 400 pixels wide; the existing team photo is 250 pixels wide. Retaining Markdown's working responsive-image pipeline avoids a framework override or an image-processing workaround.

The existing academic font pack remains in use. The hero now has 40–64 pixels of top padding and 16 pixels below, instead of the native compact preset's 64–96 pixels on both sides. The heading scales between 34 and 52 pixels, and the description retains a readable bounded line length. The photo and research copy stack below 896 pixels and sit side by side above that width.

The pinned Kit source's [MIT license](https://github.com/HugoBlox/kit/blob/61f41d3667f1/LICENSE.md) and repository license remain intact. The native “Made with Hugo Blox” credit is visible. Only the separate template/website-builder marketing button is hidden via its existing `data-hbx="poweredby_cta"` marker; the native footer renderer is retained.

## Validation

Used the existing portable Go 1.23.12, Node 22.22.0, Hugo Extended 0.162.1, pnpm 10.14.0, and `.local/gomodcache`. No packages were installed or upgraded. Module downloads were disabled during builds.

- Production Hugo build with minification and `https://highfunctioningprogrammer.github.io/research-group-page-demo/`: passed without warnings, 71 generated pages, 122 processed images.
- Pagefind: passed, 6 searchable pages, 354 indexed words.
- Existing migration validator: passed, 59 HTML files and 947 internal URL references. Includes all 19 member records, all 20 original-photo checksums, three complete projects, and both verified citations.
- Native Hugo preview: Home, Members, Projects, Publications, and Contact all returned HTTP 200. All 66 tested internal page/asset URLs returned HTTP 200, including custom CSS and Pagefind JavaScript.
- Source comparisons: homepage headline, lab description, three research-area descriptions, and both collection configurations preserved. Protected content, media, dependency, menu, workflow, and license files are byte-for-byte unchanged in Git.
- `git diff --check`: passed.
- Generated theme variables verified against the exact red and cool-gray values; the footer names the university once. Native mobile-navigation markup and brand credit remain present.
- Selected color-pair contrast checks pass 4.5:1: red on white 4.72:1, white on button red 5.65:1, cool gray on white 4.92:1, cool gray on footer 4.59:1, dark navigation accent on charcoal 9.52:1, and dark primary text on charcoal 17.31:1. This is a targeted color check, not a complete accessibility audit.

## Local preview

From the repository root in PowerShell, use process-scoped environment variables:

```powershell
$repo = (Get-Location).Path
$env:PATH = "$repo\.local\tools\node\node-v22.22.0-win-x64;$repo\.local\tools\go\go\bin;$repo\.local\tools\hugo;$repo\.local\pnpm\node_modules\.bin;$env:PATH"
$env:GOMODCACHE = "$repo\.local\gomodcache"
$env:GOCACHE = "$repo\.local\gocache"
$env:HUGO_CACHEDIR = "$repo\.local\hugo-cache"
$env:GOPROXY = 'off'
$env:GOTOOLCHAIN = 'local'

hugo --environment production --minify --baseURL 'https://highfunctioningprogrammer.github.io/research-group-page-demo/' --destination .local/iteration-1-preview
pnpm.cmd exec pagefind --site .local/iteration-1-preview
hugo server --disableFastRender --bind 127.0.0.1 --port 1313 --appendPort=false --baseURL 'http://127.0.0.1:1313/research-group-page-demo/' --destination .local/iteration-1-preview
```

Open **http://127.0.0.1:1313/research-group-page-demo/**. Stop with **Ctrl+C**. The development server serves the Pagefind index generated into the same ignored destination; regenerate Pagefind after content changes. These commands do not change global PATH or deployment settings. The temporary validation server was stopped after testing.

## Review limits and separate issue

- Browser automation is unavailable in this session (browser inventory is empty), so viewport screenshots, actual mobile-menu interactions, and visual light/dark rendering remain for manual review. The responsive CSS and native navigation markup were checked statically; HTTP serving and resource paths were tested.
- Review at phone width, approximately 1024 pixels, and wide desktop width in both modes before accepting this iteration.
- The original team photograph is only **250 × 125 pixels**. It now fills the available photo column, but a higher-resolution original would improve sharpness. Its bytes and aspect ratio are unchanged.
- The previously identified unused `/media/textures/noise-pattern.svg` reference remains in upstream `.noise-texture` CSS. The class is not used by generated HTML or JavaScript. No workaround was introduced.
- Work stops here for visual review. Members and Projects layouts have not been redesigned.
