import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { load } from 'cheerio';
import { root } from '../cms/render.mjs';

test('real JSON edits and a new upload survive a complete Vite production build', { timeout: 120000 }, () => {
  // Separate command from the unit suite: it temporarily changes real content
  // files so Vite's JSON module imports are tested as well as static HTML.
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'bdib-pagescms-build-'));
  const upload = path.join(root, 'public/uploads/images/cms-build-smoke.webp');
  assert.equal(fs.existsSync(upload), false, 'never overwrite an existing upload');
  const originals = new Map();
  const edit = (relative, change) => {
    const filename = path.join(root, relative);
    const original = fs.readFileSync(filename);
    originals.set(filename, original);
    const data = JSON.parse(original);
    change(data);
    fs.writeFileSync(filename, JSON.stringify(data, null, 2) + '\n');
  };
  try {
    fs.copyFileSync(path.join(root, 'public/assets/home/sunlit-wheat-800.webp'), upload);
    edit('content/home/hero.json', c => {
      c.description = 'Production smoke test: client-edited introduction.';
      c.background = { src: '/uploads/images/cms-build-smoke.webp', alt: 'Uploaded wheat photograph' };
    });
    edit('content/product/hero.json', c => {
      c.background = { src: '/uploads/images/cms-build-smoke.webp', alt: 'Uploaded product background' };
    });
    edit('content/home/farm-map.json', c => {
      c.insights[1].title = 'CMS_BUILD_MAP_MARKER';
      c.insights[1].image = { src: '/uploads/images/cms-build-smoke.webp', alt: 'CMS_BUILD_MAP_ALT' };
    });
    edit('content/shared/contact-popup.json', c => { c.title = 'CMS_BUILD_POPUP_MARKER'; });
    edit('content/pricing/plans.json', c => {
      c.monthly.amount = 47;
      c.monthly.title = 'CMS_BUILD_MONTHLY_MARKER';
      c.annual.amount = 275;
    });
    const result = spawnSync(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), 'build', '--outDir', output, '--emptyOutDir'], { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const home = load(fs.readFileSync(path.join(output, 'index.html'), 'utf8'));
    assert.equal(home('#top .lead').text(), 'Production smoke test: client-edited introduction.');
    assert.equal(home('.hero-backdrop img').attr('src'), '/uploads/images/cms-build-smoke.webp');
    assert.equal(home('.hero-backdrop img').attr('srcset'), undefined);
    assert.equal(home('link[rel="preload"][as="image"]').attr('href'), '/uploads/images/cms-build-smoke.webp');
    const product = load(fs.readFileSync(path.join(output, 'spider-ag.html'), 'utf8'));
    assert.equal(product('.spider-hero-backdrop img').attr('src'), '/uploads/images/cms-build-smoke.webp');
    const pricing = load(fs.readFileSync(path.join(output, 'pricing-sign-up.html'), 'utf8'));
    assert.equal(pricing('#price-display').text(), '$275/year');
    const scripts = fs.readdirSync(path.join(output, 'assets')).filter(name => name.endsWith('.js')).map(name => fs.readFileSync(path.join(output, 'assets', name), 'utf8')).join('\n');
    for (const marker of ['CMS_BUILD_MAP_MARKER', 'CMS_BUILD_MAP_ALT', 'CMS_BUILD_POPUP_MARKER', 'CMS_BUILD_MONTHLY_MARKER']) assert.ok(scripts.includes(marker), `JSON module value missing: ${marker}`);
    assert.match(scripts, /amount:47/);
    assert.deepEqual(fs.readFileSync(path.join(output, 'uploads/images/cms-build-smoke.webp')), fs.readFileSync(upload));
    for (const page of ['index.html', 'spider-ag.html', 'pricing-sign-up.html', 'schedule-demo.html']) {
      const $ = load(fs.readFileSync(path.join(output, page), 'utf8'));
      $('img[src],script[src],link[rel="stylesheet"][href]').each((i, el) => {
        const url = $(el).attr('src') || $(el).attr('href');
        if (!url || !url.startsWith('/') || url.startsWith('//')) return;
        assert.ok(fs.existsSync(path.join(output, decodeURIComponent(url.slice(1).split(/[?#]/)[0]))), `${page}: built asset missing: ${url}`);
      });
    }
  } finally {
    for (const [filename, original] of originals) fs.writeFileSync(filename, original);
    if (fs.existsSync(upload)) fs.unlinkSync(upload);
    // Only remove the verified directory created by this test inside OS temp.
    assert.equal(path.dirname(path.resolve(output)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(output).startsWith('bdib-pagescms-build-'));
    fs.rmSync(output, { recursive: true, force: true });
  }
});
