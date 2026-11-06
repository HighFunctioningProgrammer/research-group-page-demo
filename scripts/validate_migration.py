"""Validate migrated source facts and the generated GitHub Pages artifact.

Run after `hugo --minify` and `pnpm run pagefind`. Standard library only.
"""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import argparse
import hashlib
import json
import re
import subprocess


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
        self.text = []
        self.ids = set()
        self.props = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'style'):
            self.skip += 1
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        for attr in ('href', 'src', 'poster'):
            if attrs.get(attr):
                self.urls.append(attrs[attr])
        if attrs.get('srcset'):
            self.urls.extend(x.strip().split()[0] for x in attrs['srcset'].split(','))
        if attrs.get('data-props'):
            self.props.append(json.loads(attrs['data-props']))
        if tag == 'img' and not attrs.get('alt', '').strip():
            failures.append(f'{current_page}: image missing alternative text')

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.text.append(data)


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--site', default='public', help='Built site directory')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
site = (root / args.site).resolve()
inventory = json.loads((root / 'docs/migration-sources.json').read_text(encoding='utf-8'))
config = (root / 'config/_default/hugo.yaml').read_text(encoding='utf-8')
base = re.search(r"^baseURL:\s*['\"]([^'\"]+)", config, re.M)[1]
base_parts = urlsplit(base)
prefix = base_parts.path
failures = []


def check(condition, message):
    if not condition:
        failures.append(message)


pages = {}
for current_page in site.rglob('*.html'):
    page = Page()
    page.feed(current_page.read_text(encoding='utf-8'))
    pages[current_page] = page
check(bool(pages), 'No built HTML found; run Hugo first')

checked_links = 0
for path, page in pages.items():
    relative = path.relative_to(site).as_posix()
    public_url = urljoin(base, relative)
    urls = list(page.urls)
    for props in page.props:
        # Native hero action URLs are resolved by the browser, after hydration.
        content = props.get('content', {})
        urls.extend(content[key]['url'] for key in ('primary_action', 'secondary_action') if content.get(key, {}).get('url'))
    for url in urls:
        parsed = urlsplit(urljoin(public_url, url))
        if parsed.scheme not in ('http', 'https') or parsed.netloc != base_parts.netloc:
            continue
        if not parsed.path.startswith(prefix):
            failures.append(f'{relative}: internal URL escapes Pages base path: {url}')
            continue
        target = site / unquote(parsed.path[len(prefix):])
        if parsed.path.endswith('/'):
            target = target / 'index.html'
        check(target.is_file(), f'{relative}: missing internal target {url}')
        if parsed.fragment and target in pages:
            check(unquote(parsed.fragment) in pages[target].ids, f'{relative}: missing fragment {url}')
        checked_links += 1

members = inventory['members']
check(len(members) == 19, 'Expected all 19 source members')
check(Counter(p['group'] for p in members) == {'Professor': 1, 'Graduate Students': 8, 'Undergraduate Students': 9, 'Alumni': 1}, 'Member group counts differ from source')
member_page = pages.get(site / 'members/index.html')
member_text = ' '.join(member_page.text) if member_page else ''
for person in members:
    check(person['name'] in member_text, f'Member missing from rendered grid: {person["name"]}')
    record = root / person['target_data']
    check(record.is_file() and person['name'] in record.read_text(encoding='utf-8'), f'Missing or changed author data: {record}')
    check((site / 'authors' / person['slug'] / 'index.html').is_file(), f'Missing native author page: {person["slug"]}')
for group in ('Professor', 'Graduate Students', 'Undergraduate Students', 'Alumni'):
    check(group in member_text, f'Missing group heading: {group}')
if member_page:
    html = (site / 'members/index.html').read_text(encoding='utf-8')
    check('xl:grid-cols-4' in html and 'sm:grid-cols-2' in html and 'grid-cols-1' in html, 'Native responsive member grid is missing')

for asset in inventory['assets']:
    path = root / asset['target']
    check(path.is_file(), f'Missing original photograph: {path}')
    if path.is_file():
        check(hashlib.sha256(path.read_bytes()).hexdigest() == asset['sha256'], f'Original photograph bytes changed: {path}')

for project in inventory['projects']:
    text = (root / project['target']).read_text(encoding='utf-8')
    check(project['description'] in text, f'Project description was truncated: {project["title"]}')

publication_page = pages.get(site / 'publications/index.html')
publication_text = ' '.join(publication_page.text) if publication_page else ''
for publication in inventory['publications']:
    folder = (root / publication['target']).parent
    bib = (folder / 'cite.bib').read_text(encoding='utf-8')
    check(publication['title'] in publication_text, f'Publication missing from archive: {publication["title"]}')
    # Check order in each detail page to avoid shared coauthors in earlier citations.
    detail = pages.get(site / 'publications' / folder.name / 'index.html')
    detail_text = ' '.join(detail.text) if detail else ''
    positions = [detail_text.find(author) for author in publication['authors']]
    check(all(p >= 0 for p in positions) and positions == sorted(positions), f'Publication authors/order changed: {publication["title"]}')
    check(publication['doi'].lower() in bib.lower(), f'BibTeX DOI differs from verified metadata: {folder.name}')
    for author in publication['authors']:
        given, family = author.rsplit(' ', 1)
        check(f'{family}, {given}' in bib, f'BibTeX author missing: {author}')
    check(any(url.lower() == 'https://doi.org/' + publication['doi'].lower() for url in (detail.urls if detail else [])), f'Missing DOI link: {folder.name}')

visible_text = '\n'.join(' '.join(p.text) for p in pages.values())
for demo in ('Alex Johnson', 'Robert Ford', 'Lorem ipsum', 'Senior AI Research Scientist', 'An example journal article', 'An example conference paper'):
    check(demo not in visible_text, f'Demo text remains: {demo}')
for removed in ('blog', 'courses', 'events', 'slides', 'experience'):
    check(not (site / removed).exists(), f'Demo route remains: {removed}')
check((site / 'pagefind/pagefind.js').is_file(), 'Pagefind index is missing')
check('hulusan@metu.edu.tr' in visible_text and '+90 (312) 210-2317' in visible_text, 'Verified contact details missing')

protected = ['go.mod', 'package.json', 'pnpm-lock.yaml', 'hugoblox.yaml', '.github/workflows']
result = subprocess.run(['git', 'diff', '--exit-code', 'HEAD', '--', *protected], cwd=root, capture_output=True)
check(result.returncode == 0, 'Pinned dependency inputs or deployment workflows changed')

if failures:
    print('\n'.join('FAIL: ' + f for f in failures))
    raise SystemExit(1)
print(f'PASS: {len(pages)} HTML files; {checked_links} internal URLs; 19 members in 4 groups; 20 original photographs; 3 complete projects; 2 verified citations; Pagefind; preserved dependency inputs and workflows.')
