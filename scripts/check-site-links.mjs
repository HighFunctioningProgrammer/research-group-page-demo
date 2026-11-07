// Check emitted HTML URLs against an existing production output directory.
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {join, resolve, relative} from 'node:path';

const directory=resolve(process.argv[2] || 'public');
const base=new URL(process.argv[3] || 'https://highfunctioningprogrammer.github.io/research-group-page-demo/');
const files=[];
const walk=dir=>{ for(const entry of readdirSync(dir,{withFileTypes:true})) { const path=join(dir,entry.name); if(entry.isDirectory()) walk(path); else if(entry.name.endsWith('.html')) files.push(path); } };
walk(directory);
const failures=new Set();
let checked=0;
for(const file of files) {
  const route=relative(directory,file).replaceAll('\\','/').replace(/index\.html$/,'');
  const page=new URL(route,base);
  const html=readFileSync(file,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
  const check=value=>{
    value=value.replaceAll('&amp;','&');
    if(!value || /^(#|data:|mailto:|tel:|javascript:)/i.test(value)) return;
    let url;
    try { url=new URL(value,page); } catch { failures.add(`${route}: invalid URL ${value}`); return; }
    if(url.origin!==base.origin) return;
    checked++;
    if(!url.pathname.startsWith(base.pathname)) { failures.add(`${route}: escapes Pages prefix: ${value}`); return; }
    const path=resolve(directory,decodeURIComponent(url.pathname.slice(base.pathname.length)));
    if(relative(directory,path).startsWith('..')) { failures.add(`${route}: unsafe path ${value}`); return; }
    const target=existsSync(path) && statSync(path).isDirectory() ? join(path,'index.html') : path;
    if(!existsSync(target)) failures.add(`${route}: missing ${value}`);
  };
  for(const match of html.matchAll(/(?:^|\s)(?:href|src|poster|data-filename)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) check(match[1]??match[2]??match[3]);
  for(const match of html.matchAll(/(?:^|\s)srcset\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    const value=match[1]??match[2];
    if(!value.startsWith('data:')) for(const candidate of value.split(',')) check(candidate.trim().split(/\s+/)[0]);
  }
}
if(failures.size) {
  console.error([...failures].join('\n'));
  process.exitCode=1;
} else console.log(`Site links: PASS — ${files.length} HTML files, ${checked} internal URL/asset references; Pages prefix ${base.pathname}`);
