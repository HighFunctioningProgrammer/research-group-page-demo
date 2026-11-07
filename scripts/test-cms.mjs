// Isolated Hugo integration tests. Hosted Pages CMS saves are a separate,
// owner-run acceptance test: this script never connects to GitHub or the CMS.
import assert from 'node:assert/strict';
import {cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync} from 'node:fs';
import {join, resolve, relative, dirname, sep} from 'node:path';
import {spawnSync} from 'node:child_process';
import {inspectContent} from './check-cms.mjs';

const root = resolve('.');
mkdirSync(join(root, '.local'), {recursive: true});
const fixture = mkdtempSync(join(root, '.local/cms-test-'));
const results = [];
const baseURL = 'https://highfunctioningprogrammer.github.io/research-group-page-demo/';
const prefix = '/research-group-page-demo/';
const text = path => readFileSync(path, 'utf8');
const normalized = value => value.replaceAll('\r', '').trim();
const write = (path, value) => { mkdirSync(dirname(path), {recursive: true}); writeFileSync(path, value); };
const data = (path, value) => write(join(fixture, path), JSON.stringify(value, null, 2) + '\n');
const bundle = (path, params, body = '') => write(join(fixture, path), `---\n${JSON.stringify(params, null, 2)}\n---\n\n${body}\n`);
const run = (command, args, options = {}) => {
  const p = spawnSync(command, args, {cwd: fixture, encoding: 'utf8', ...options});
  if (p.error) throw p.error;
  assert.equal(p.status, 0, (p.stdout || '') + (p.stderr || ''));
  return p.stdout;
};
const build = () => run(process.env.HUGO_BIN || 'hugo', ['--minify', '--baseURL', baseURL, '--destination', '.local/output', '--enableGitInfo=false']);
const html = route => text(join(fixture, '.local/output', route, 'index.html'));
const record = name => { results.push(name); console.log(`PASS ${name}`); };
const expand = (field, config) => {
  const f = field.component ? {...config.components[field.component], ...field} : {...field};
  if (f.fields) f.fields = f.fields.map(child => expand(child, config));
  return f;
};
// Contract model of Pages CMS initializeState and content.merge semantics:
// nested objects merge, submitted arrays replace, and empty strings are removed.
// This exercises the configured field coverage, not the hosted editor UI.
const submitted = (fields, original) => Object.fromEntries(fields.map(f => {
  let v = original?.[f.name];
  if (v === undefined) v = f.default ?? (f.list ? [] : f.type === 'boolean' ? false : '');
  if (f.type === 'object') v = f.list ? v.map(item => submitted(f.fields, item)) : submitted(f.fields, v);
  return [f.name, v];
}));
const merge = (a, b) => {
  const result = structuredClone(a);
  for (const [k, v] of Object.entries(b)) result[k] = v && typeof v === 'object' && !Array.isArray(v) ? merge(result[k] || {}, v) : structuredClone(v);
  return result;
};
const sanitize = value => Array.isArray(value) ? value.map(sanitize) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).filter(([,v]) => v !== '' && v !== null && v !== undefined).map(([k,v]) => [k, sanitize(v)])) : value;

try {
  for (const name of ['assets', 'content', 'data', 'config', 'layouts', 'scripts/cms-check', 'static']) {
    if (existsSync(join(root, name))) cpSync(join(root, name), join(fixture, name), {recursive: true});
  }
  for (const name of ['.pages.yml', 'hugoblox.yaml', 'hugo.yaml', 'hugo.toml', 'go.mod', 'go.sum', 'package.json', 'pnpm-lock.yaml']) {
    if (existsSync(join(root, name))) cpSync(join(root, name), join(fixture, name));
  }
  // Hugo restricts Tailwind's Node process to its project directory. A local
  // copy (no installation) keeps that boundary intact on Windows too.
  cpSync(join(root, 'node_modules'), join(fixture, 'node_modules'), {recursive:true, dereference:true});
  const original = inspectContent(root, {quiet: true});
  const config = original.config;
  const collections = Object.fromEntries(config.content.map(c => [c.name, {...c, fields: c.fields.map(f => expand(f, config))}]));
  assert.equal(config.settings.content.merge, true);
  for (const c of Object.values(collections)) {
    assert.equal(c.operations.delete, false);
    assert.equal(c.operations.rename, false);
    if (c.view) {
      assert.ok(Array.isArray(c.view.sort));
      assert.ok(c.view.default.sort);
    }
  }
  // Compare actual lab content with HEAD using Hugo's parser, not text formatting.
  const tracked = spawnSync('git', ['ls-tree', '-r', '--name-only', 'HEAD', 'data/authors', 'content/projects', 'content/publications'], {cwd: root, encoding: 'utf8'});
  assert.equal(tracked.status, 0, tracked.stderr);
  for (const path of tracked.stdout.trim().split('\n')) {
    const before = spawnSync('git', ['show', `HEAD:${path}`], {cwd: root, maxBuffer: 8 * 1024 * 1024});
    assert.equal(before.status, 0);
    write(join(fixture, path), before.stdout);
    if (path.endsWith('cite.bib')) assert.equal(normalized(text(join(root, path))), normalized(before.stdout.toString('utf8')));
  }
  const before = inspectContent(fixture, {quiet: true, snapshotOnly: true});
  for (const [id, person] of Object.entries(original.people)) {
    if (!before.people[id] || !Object.hasOwn(before.people[id], 'weight')) continue; // newly modelled external coauthors
    const {cms, ...unchanged} = person;
    assert.deepEqual(unchanged, before.people[id]);
  }
  for (const page of original.pages) {
    const old = before.pages.find(p => p.path === page.path);
    assert.ok(old);
    const {cms_slug, draft, publications, authors, ...rest} = page.params;
    const {authors: oldAuthors, publications: oldRelations, draft: oldDraft, cms_slug: oldID, ...oldRest} = old.params;
    assert.equal(page.draft, old.draft);
    assert.deepEqual(rest, oldRest);
    if (authors) assert.deepEqual(authors.map(id => original.people[id].name.display), oldAuthors.map(id => before.people[id]?.name.display || id));
    const oldBody = page.params.cms_slug === 'energy-aware-snn' ? old.body.split('## Related publications')[0] : old.body;
    assert.equal(normalized(page.body), normalized(oldBody));
  }
  record('Original people, project descriptions, publication metadata, author order and citation files preserved');
  cpSync(join(root, 'data'), join(fixture, 'data'), {recursive: true});
  cpSync(join(root, 'content'), join(fixture, 'content'), {recursive: true});

  // Save contracts preserve unmanaged objects/lists and all existing links.
  for (const [name, entries] of [['people', Object.values(original.people)], ['projects', original.pages.filter(p=>p.section==='projects').map(p=>({...p.params, body:p.body}))], ['publications', original.pages.filter(p=>p.section==='publications').map(p=>({...p.params, body:p.body}))]]) {
    for (const entry of entries) {
      const enriched = {...entry, unmanaged: {nested: {value: 'keep'}, list: [{value: 'keep'}]}};
      const saved = sanitize(merge(enriched, submitted(collections[name].fields, enriched)));
      assert.deepEqual(saved.unmanaged, enriched.unmanaged);
      if (entry.affiliations) assert.deepEqual(saved.affiliations, entry.affiliations);
      if (entry.interests) assert.deepEqual(saved.interests, entry.interests);
      if (entry.links) for (let i=0; i<entry.links.length; i++) for (const [k,v] of Object.entries(entry.links[i])) assert.deepEqual(saved.links[i][k], v);
      assert.equal(saved.draft, entry.draft ?? (name==='people' ? undefined : false));
    }
  }
  record('Configured form-save contract preserves unmanaged metadata, nested data, arrays and published status');

  const member = {schema:'hugoblox/author/v1', slug:'cms-fixture-person', name:{display:'Çığ Öztürk', given:'Çığ', family:'Öztürk'}, role:'Fixture Graduate Student', user_groups:['Graduate Students'], cms:{avatar:'/authors/hasan-ulusan.jpg'}, bio:'Fixture biography.', weight:100, links:[{icon:'at-symbol',url:'fixture@example.org',label:'Email'}]};
  data('data/authors/cms-fixture-person.yaml', member);
  data('data/authors/cms-fixture-unreferenced.yaml', {...member,slug:'cms-fixture-unreferenced',name:{display:'Fixture Without Publications'}});
  const edited = structuredClone(original.people['hasan-ulusan']);
  edited.bio = 'Fixture edit of existing biography.';
  edited.cms.avatar = '/authors/ugur-eroglu.jpg';
  data('data/authors/hasan-ulusan.yaml', edited);
  const project = {title:'CMS Fixture Project',cms_slug:'cms-fixture-project',summary:'Fixture summary.',draft:false,featured:true,weight:0,image:{filename:'/authors/ugur-eroglu.jpg'},links:[{type:'site',url:'https://example.org/'}],publications:['cms-fixture-paper'],show_date:false,show_author:false};
  bundle('content/projects/cms-fixture-project/index.md',project,'Fixture research description.\n\n![Research apparatus](/authors/hasan-ulusan.jpg)');
  const bibtex = '@article{fixture2026,\n title={CMS Fixture Paper},\n author={Öztürk, Çığ and Muhtaroglu, Ali},\n year={2026}\n}';
  const paper = {title:'CMS Fixture Paper',cms_slug:'cms-fixture-paper',authors:['cms-fixture-person','ali-muhtaroglu'],date:'2026-01-10',publication_types:['article-journal'],publication:{name:'Fixture Journal'},abstract:'Fixture abstract.',draft:false,profile:false,projects:['cms-fixture-project'],hugoblox:{ids:{doi:'10.1234/fixture'}},cms:{pdf:'uploads/publications/cms-fixture.pdf'},bibtex};
  // A valid tiny one-page PDF; no real manuscript is fabricated or published.
  const pdfParts = ['%PDF-1.4\n'];
  const offsets = [0];
  for (const object of ['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 100 100] >>']) {
    offsets.push(Buffer.byteLength(pdfParts.join('')));
    pdfParts.push(`${offsets.length-1} 0 obj\n${object}\nendobj\n`);
  }
  const xref = Buffer.byteLength(pdfParts.join(''));
  pdfParts.push(`xref\n0 4\n0000000000 65535 f \n${offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')}trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  write(join(fixture,'static/uploads/publications/cms-fixture.pdf'), pdfParts.join(''));
  bundle('content/publications/cms-fixture-paper/index.md',paper);
  bundle('content/publications/cms-fixture-draft/index.md',{...paper,title:'CMS Hidden Draft',cms_slug:'cms-fixture-draft',draft:true});
  bundle('content/news/cms-fixture-news/index.md',{title:'CMS Draft News',cms_slug:'cms-fixture-news',draft:true,type:'post',date:'2026-01-10'},'Draft news.');
  const home = {...original.site.home, headline:'Fixture headline',team_photo:'/authors/hasan-ulusan.jpg'};
  const contact = {...original.site.contact, person:'Fixture contact',email:'fixture@example.org'};
  data('data/site/home.yaml',home);
  data('data/site/contact.yaml',contact);
  inspectContent(fixture,{quiet:true});
  build();
  run(process.execPath,[join(root,'scripts/check-site-links.mjs'),join(fixture,'.local/output')]);
  const personHTML = html('authors/cms-fixture-person');
  assert.ok(personHTML.includes('Çığ Öztürk'));
  assert.ok(personHTML.includes('Fixture biography.'));
  assert.ok(personHTML.includes('mailto:fixture@example.org'));
  assert.ok(html('authors/cms-fixture-unreferenced').includes('Fixture Without Publications'));
  assert.ok(html('members').includes('Çığ Öztürk'));
  assert.ok(!html('members').includes('Ali Muhtaroglu'));
  assert.ok(html('authors/hasan-ulusan').includes('Fixture edit of existing biography.'));
  assert.ok(html('authors/hasan-ulusan').includes('ugur-eroglu'));
  record('Edited existing member, updated portrait, new member/profile without stub, email and external-coauthor exclusion render');
  assert.ok(html('projects').includes('CMS Fixture Project'));
  assert.ok(html('projects/cms-fixture-project').includes('Research apparatus'));
  assert.ok(html('projects/cms-fixture-project').includes('CMS Fixture Paper'));
  assert.ok(html('publications').includes('CMS Fixture Paper'));
  assert.ok(html('publications/cms-fixture-paper').includes('https://doi.org/10.1234/fixture'));
  assert.ok(html('publications/cms-fixture-paper').includes(prefix+'uploads/publications/cms-fixture.pdf'));
  assert.equal(text(join(fixture,'.local/output/publications/cms-fixture-paper/citation.bib')),bibtex);
  assert.ok(html('publications/cms-fixture-paper').includes(prefix+'publications/cms-fixture-paper/citation.bib'));
  assert.ok(html('publications/cms-fixture-paper').indexOf('Çığ Öztürk') < html('publications/cms-fixture-paper').indexOf('Ali Muhtaroglu'));
  assert.ok(!html('publications').includes('CMS Hidden Draft'));
  assert.ok(!existsSync(join(fixture,'.local/output/publications/cms-fixture-draft/index.html')));
  assert.ok(!existsSync(join(fixture,'.local/output/news/index.html')));
  assert.ok(html('').includes('Fixture headline'));
  assert.ok(html('').includes('CMS Fixture Project'));
  assert.ok(html('').includes('CMS Fixture Paper'));
  assert.ok(html('contact').includes('Fixture contact'));
  record('Projects, images, related papers, ordered citations, DOI/PDF/BibTeX, featured content, safe page forms and draft exclusion render');

  // Verify each attachment can stand alone and pasted BibTeX supersedes an old file.
  const oldCitation = 'Original fixture citation';
  write(join(fixture,'content/publications/cms-fixture-paper/cite.bib'),oldCitation);
  const standalone={...paper,projects:[],hugoblox:{},cms:{}};
  bundle('content/publications/cms-fixture-paper/index.md',standalone);
  build();
  assert.ok(html('publications/cms-fixture-paper').includes(prefix+'publications/cms-fixture-paper/citation.bib'));
  assert.ok(!html('publications/cms-fixture-paper').includes('data-filename='+prefix+'publications/cms-fixture-paper/cite.bib'));
  assert.equal(text(join(fixture,'content/publications/cms-fixture-paper/cite.bib')),oldCitation);
  rmSync(join(fixture,'content/publications/cms-fixture-paper/cite.bib'));
  const {bibtex: omitCitation, ...withoutCitation}=standalone;
  bundle('content/publications/cms-fixture-paper/index.md',{...withoutCitation,hugoblox:paper.hugoblox});
  build();
  assert.ok(html('publications/cms-fixture-paper').includes('https://doi.org/10.1234/fixture'));
  bundle('content/publications/cms-fixture-paper/index.md',{...withoutCitation,cms:paper.cms});
  build();
  assert.ok(html('publications/cms-fixture-paper').includes(prefix+'uploads/publications/cms-fixture.pdf'));
  bundle('content/publications/cms-fixture-paper/index.md',paper);
  record('BibTeX-only, DOI-only and PDF-only attachments work; pasted citation overrides without overwriting original file');

  // Native category grouping works for each category; the same ID remains stable.
  for (const category of ['Professor','Undergraduate Students','Alumni']) {
    member.user_groups=[category]; data('data/authors/cms-fixture-person.yaml',member);
    build();
    const members=html('members');
    const at=members.indexOf('Çığ Öztürk');
    assert.ok(at>members.indexOf(`>${category}<`),`Missing ${category} grouping`);
  }
  record('Professor, Graduate Student, Undergraduate Student and Alumni categories; archive retains author ID');

  const expectInvalid = (name, mutation, restore, pattern) => {
    mutation();
    assert.throws(()=>inspectContent(fixture,{quiet:true}),pattern);
    restore(); record(name);
  };
  expectInvalid('Changed person ID rejected',()=>data('data/authors/cms-fixture-person.yaml',{...member,slug:'different-id'}),()=>data('data/authors/cms-fixture-person.yaml',member),/identifier must match filename/);
  expectInvalid('Duplicate person data key rejected',()=>data('data/authors/cms-fixture-person.yml',member),()=>rmSync(join(fixture,'data/authors/cms-fixture-person.yml')),/duplicate person identifier/);
  expectInvalid('Invalid category rejected',()=>data('data/authors/cms-fixture-person.yaml',{...member,user_groups:['Unknown']}),()=>data('data/authors/cms-fixture-person.yaml',member),/invalid category/);
  expectInvalid('Missing portrait rejected',()=>data('data/authors/cms-fixture-person.yaml',{...member,cms:{avatar:'/missing-photo.jpg'}}),()=>data('data/authors/cms-fixture-person.yaml',member),/missing or unsupported image/);
  expectInvalid('Dangling author rejected',()=>bundle('content/publications/cms-fixture-paper/index.md',{...paper,authors:['missing-person']}),()=>bundle('content/publications/cms-fixture-paper/index.md',paper),/unknown author/);
  expectInvalid('Renamed publication ID rejected',()=>bundle('content/publications/cms-fixture-paper/index.md',{...paper,cms_slug:'changed-paper'}),()=>bundle('content/publications/cms-fixture-paper/index.md',paper),/identifier must match bundle/);
  expectInvalid('Dangling project rejected',()=>bundle('content/publications/cms-fixture-paper/index.md',{...paper,projects:['missing-project']}),()=>bundle('content/publications/cms-fixture-paper/index.md',paper),/unknown project/);
  expectInvalid('Dangling publication rejected',()=>bundle('content/projects/cms-fixture-project/index.md',{...project,publications:['missing-paper']}),()=>bundle('content/projects/cms-fixture-project/index.md',project),/unknown publication/);
  expectInvalid('Missing PDF rejected',()=>bundle('content/publications/cms-fixture-paper/index.md',{...paper,cms:{pdf:'uploads/publications/missing.pdf'}}),()=>bundle('content/publications/cms-fixture-paper/index.md',paper),/missing or unsafe PDF/);
  expectInvalid('Publishing News before launch rejected',()=>bundle('content/news/cms-fixture-news/index.md',{title:'Fixture',cms_slug:'cms-fixture-news',draft:false}),()=>bundle('content/news/cms-fixture-news/index.md',{title:'Fixture',cms_slug:'cms-fixture-news',draft:true}),/News is draft-only/);
  write(join(root,'.local/cms-test-results.json'),JSON.stringify({tested:new Date().toISOString(),results},null,2));
  console.log(`CMS integration: ${results.length} checks passed. Hosted editor acceptance remains pending owner connection.`);
} finally {
  const inside=relative(join(root,'.local'),fixture);
  assert.ok(inside && !inside.startsWith('..') && !inside.includes(sep), 'Unsafe fixture cleanup path');
  rmSync(fixture,{recursive:true,force:true});
}
