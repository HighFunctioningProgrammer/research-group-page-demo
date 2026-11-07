// Uses the installed Hugo YAML/frontmatter parser; no npm packages or network.
import {mkdtempSync, readFileSync, rmSync, readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve, join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';

export function inspectContent(root, {snapshotOnly = false, quiet = false} = {}) {
  root = resolve(root);
  const output = mkdtempSync(join(tmpdir(), 'icbs-cms-check-'));
  try {
    // YAML data keys must be unique even if an alternate extension is added.
    const ids = new Set();
    for (const name of readdirSync(join(root, 'data/authors'))) {
      if (!/\.ya?ml$/i.test(name)) continue;
      const id = name.replace(/\.ya?ml$/i, '');
      if (ids.has(id)) throw Error(`CMS: duplicate person identifier: ${id}`);
      ids.add(id);
    }
    const result = spawnSync(process.env.HUGO_BIN || 'hugo', [
      '--source', join(root, 'scripts/cms-check'), '--destination', output,
      '--buildDrafts', '--buildFuture', '--buildExpired',
    ], {cwd: root, encoding: 'utf8', env: {...process.env, HUGO_CMS_SNAPSHOT_ONLY: snapshotOnly ? '1' : ''}});
    if (result.error) throw result.error;
    if (result.status !== 0) throw Error((result.stdout || '') + (result.stderr || ''));
    if (!quiet) {
      process.stdout.write(result.stdout || '');
      process.stderr.write(result.stderr || '');
    }
    return JSON.parse(readFileSync(join(output, 'index.json'), 'utf8'));
  } finally {
    // Only this invocation's newly created temporary directory is removed.
    if (!resolve(output).startsWith(resolve(tmpdir()) + '/') && !resolve(output).startsWith(resolve(tmpdir()) + '\\')) throw Error('Unsafe cleanup path');
    rmSync(output, {recursive: true, force: true});
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    inspectContent(process.argv[2] || '.');
    console.log('CMS integrity: PASS (including drafts, future and expired entries).');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
