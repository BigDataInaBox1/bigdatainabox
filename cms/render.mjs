import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import sanitizeHtml from 'sanitize-html';
import { models, pageNames } from './model.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const select = ($, context, selector) => selector === ':scope' ? context : context.find(selector);
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline = html => {
  const $ = load(`<div>${html}</div>`, null, false);
  const box = $('div').first();
  box.children('p').each((i, p) => $(p).replaceWith(`${i ? '<br><br>' : ''}${$(p).html()}`));
  return box.html();
};
export function rich(value, paragraph = false) {
  const safe = sanitizeHtml(value, {
    allowedTags: ['p','br','strong','b','em','i','u','a','ul','ol','li'],
    allowedAttributes: { a: ['href','target','rel','title'] },
    allowedSchemes: ['http','https','mailto','tel'], allowProtocolRelative: false,
    transformTags: { a: (tagName, attrs) => ({tagName, attribs: {...attrs, ...(attrs.target === '_blank' ? {rel:'noopener noreferrer'} : {})}}) }
  });
  return paragraph ? inline(safe) : safe;
}
export function readContent(model, overrides = {}) {
  if (Object.hasOwn(overrides, model.path)) return overrides[model.path];
  try { return JSON.parse(fs.readFileSync(path.join(root, model.path), 'utf8')); }
  catch (error) { throw new Error(`CMS: cannot read ${model.path}: ${error.message}`); }
}
export function localAsset(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
  let raw;
  try { raw = decodeURIComponent(value.split(/[?#]/)[0]); } catch { return null; }
  if (raw.split('/').includes('..') || raw.includes('\\') || raw.startsWith('//')) return null;
  const publicRoot = path.join(root, 'public');
  const asset = path.resolve(publicRoot, raw.slice(1));
  if (!asset.startsWith(publicRoot + path.sep)) return null;
  // Runtime JSON image URLs are copied from public without Vite rewriting.
  // A similarly named source-only asset cannot substitute for a missing upload.
  return fs.existsSync(asset) && fs.statSync(asset).isFile() ? asset : null;
}
export function validUrl(value) {
  if (typeof value !== 'string' || /[\u0000-\u001f\\]/.test(value) || value.startsWith('//')) return false;
  return /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[+\d(). -]+|\/(?!\/)[^\s]*|#[^\s]+|[A-Za-z0-9_-]+\.html(?:[?#][^\s]*)?)$/.test(value);
}
function validateFields(fields, data, location) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`${location}: expected an object`);
  for (const f of fields) {
    const v = data[f.name]; const at = `${location}.${f.name}`;
    if (v === undefined || v === null || v === '') {
      if (f.required) throw new Error(`${at}: a value is required`);
      continue;
    }
    if (f.list) {
      if (!Array.isArray(v)) throw new Error(`${at}: expected a list`);
      if (v.length < (f.list.min ?? 0) || v.length > (f.list.max ?? 100)) throw new Error(`${at}: keep between ${f.list.min ?? 0} and ${f.list.max ?? 100} items`);
      v.forEach((item,i) => validateFields(f.fields, item, `${at}[${i}]`)); continue;
    }
    if (f.type === 'object') { validateFields(f.fields, v, at); continue; }
    if (f.type === 'number') {
      if (!Number.isFinite(v) || v < (f.options?.min ?? -Infinity) || v > (f.options?.max ?? Infinity)) throw new Error(`${at}: invalid number`);
      continue;
    }
    if (typeof v !== 'string') throw new Error(`${at}: expected text`);
    if (v.length > (f.options?.maxlength ?? 20000)) throw new Error(`${at}: text is too long`);
    if (f.mode === 'url' && !validUrl(v)) throw new Error(`${at}: enter a valid website, page, email, or telephone link`);
    if (f.type === 'image' || f.type === 'file') {
      const asset = localAsset(v);
      if (!asset) throw new Error(`${at}: uploaded file not found: ${v}`);
      if (!f.options?.extensions?.includes(path.extname(asset).slice(1).toLowerCase())) throw new Error(`${at}: unsupported file type`);
      if (fs.statSync(asset).size > 25 * 1024 * 1024) throw new Error(`${at}: files must be 25 MiB or smaller for Cloudflare Pages`);
    }
  }
}
export function validateAll(overrides = {}) {
  for (const model of models) {
    const data = readContent(model, overrides);
    validateFields(model.fields, data, model.path);
    if (model.name === 'farm-map') {
      const ids = data.insights.map(item => item.id).sort();
      if (JSON.stringify(ids) !== '[1,2,3,4,5]') throw new Error('Farm map: the five protected map IDs must stay 1 through 5.');
    }
  }
}

function setDirect($, node, value) {
  const textNodes = node.contents().toArray().filter(n => n.type === 'text');
  textNodes.forEach(n => $(n).remove());
  node.prepend(`${escape(value)} `);
}
function image($, node, value) {
  const before = node.attr('src');
  if (before !== value.src) {
    node.removeAttr('srcset sizes');
    node.closest('picture').find('source').remove();
    if (node.attr('id') === 'hero-video-fallback') {
      $('#hero-video, #hero-motion-toggle').remove();
    }
    if (node.parent().hasClass('brand-mark')) node.parent().addClass('brand-mark--custom');
  }
  node.attr({src:value.src, alt:value.alt ?? ''});
}
function apply($, context, f, value) {
  if (!f.selector) return;
  const nodes = select($, context, f.selector);
  if (f.mode === 'repeat' || f.mode === 'partners' || f.mode === 'inlineLinks') {
    if (!nodes.length) throw new Error(`CMS template binding missing: ${f.selector}`);
    const originals = nodes.toArray().map(n => $(n).clone());
    const marker = $('<template></template>'); nodes.first().before(marker); nodes.remove();
    if (f.mode === 'inlineLinks') {
      // Remove original separator text; the CMS owns the complete link list.
      marker.parent().contents().filter((i,n)=>n.type==='text' && /[·]/.test(n.data)).remove();
    }
    if (f.mode === 'partners') context.find('.partners-logo-row').empty();
    value.forEach((item,i) => {
      const node = originals[f.template === 'first' ? 0 : (i < originals.length ? i : 0)].clone();
      for (const field of f.fields) apply($, node, field, item[field.name]);
      if (node.hasClass('team-member')) {
        if (!item.linkedin) node.find('.team-socials').remove();
        else node.find('.team-socials a').attr('aria-label', `LinkedIn profile of ${item.name}`);
      }
      if (node.is('tr')) {
        node.find('.compare-cell-bdib .compare-feature-label').text(item.title);
        node.toggleClass('expandable-row', i >= 4);
        if (i >= 4) node.css('display','none'); else node.css('display','');
      }
      if (f.mode === 'partners') {
        const rows = context.find('.partners-logo-row');
        rows.eq(i < 4 ? 0 : 1).append(node);
      } else {
        if (f.mode === 'inlineLinks' && i) marker.before(' &middot; ');
        marker.before(node);
      }
    });
    marker.remove(); return;
  }
  if (f.mode === 'map') return;
  nodes.each((i, element) => {
    const node = $(element);
    if (f.mode === 'image') { image($,node,value); return; }
    if (f.mode === 'link') {
      const download = f.fields.some(field=>field.name==='download') ? value.download : '';
      setDirect($,node,value.text); node.attr('href',download || value.url);
      // A changed Contact Us destination must be followed, not intercepted.
      if (download || !['schedule-demo.html','/schedule-demo.html'].includes(value.url)) node.removeAttr('data-open-contact-modal data-open-demo-modal');
      return;
    }
    if (f.attr) { node.attr(f.attr,value ?? ''); return; }
    if (f.mode === 'direct') setDirect($,node,value);
    else if (f.mode === 'lines') node.html(escape(value).replace(/\n/g,'<br>'));
    else if (f.mode === 'rich') node.html(rich(value, node.is('p')));
    else node.text(value ?? '');
  });
}

export function renderPage(html, filename, overrides = {}) {
  const name = path.basename(filename);
  if (!pageNames.includes(name)) return html;
  validateAll(overrides);
  const $ = load(html);
  for (const model of models) {
    if (model.page !== '*' && model.page !== name) continue;
    const data = readContent(model, overrides);
    for (const f of model.fields) apply($, $.root(), f, data[f.name]);
  }
  if (name === 'index.html') {
    const model = models.find(m=>m.name==='farm-map'); const map=readContent(model,overrides);
    for (const item of map.insights) {
      $(`[data-pin="${item.id}"]`).attr('aria-label',item.title).find('.pin-label').text(item.label);
      $(`[data-prezi-mobile-pin="${item.id}"]`).text(item.mobileLabel);
    }
    const initial=map.insights.find(i=>i.id===1);
    $('#prezi-card-title').text(initial.title); $('#prezi-card-desc').text(initial.description); $('#prezi-step-tag').text(initial.category);
    $('#prezi-card-img').attr({src:initial.image.src,alt:initial.image.alt});
    const background=$('.hero-backdrop img'); const preload=$('link[rel="preload"][as="image"]').first();
    if (preload.attr('href') !== background.attr('src')) preload.attr('href',background.attr('src')).removeAttr('imagesrcset imagesizes');
    const compare=readContent(models.find(m=>m.name==='comparison'),overrides);
    $('#btn-expand-compare').attr({'data-expand-label':compare.expandLabel,'data-collapse-label':compare.collapseLabel});
    if (compare.rows.length <= 4) $('#btn-expand-compare').remove();
  }
  if (name === 'pricing-sign-up.html') {
    const plans=readContent(models.find(m=>m.name==='plans'),overrides);
    $('#billing-title').text(plans.annual.title);
    const interval=$('#price-display .price-interval').clone().text(plans.annual.interval);
    $('#price-display').empty().append(escape(plans.currency+plans.annual.amount)).append(interval);
    $('#billing-period-text').text(plans.annual.billing+' ').append($('<strong class="billing-savings"></strong>').text(plans.savingsDetail));
    $('#savings-callout .callout-pill').text(plans.savingsPill);
    setDirect($,$('#label-monthly'),plans.monthly.label); setDirect($,$('#label-annual'),plans.annual.label);
    $('.save-badge').text(plans.savingsBadge);
    $('#cta-button').text(plans.annual.button.text).attr('href',plans.annual.button.url);
  }
  // Original responsive variants remain in templates until a photo is replaced.
  // Catch accidental deletion of one of those library files before publishing.
  $('[srcset], [imagesrcset]').each((i, element) => {
    const sourceSet = $(element).attr('srcset') || $(element).attr('imagesrcset');
    const candidates = sourceSet.split(',').map(candidate => candidate.trim().replace(/\s+\d+(?:\.\d+)?[wx]$/, ''));
    for (const candidate of candidates) {
      if (candidate.startsWith('/') && !localAsset(candidate)) throw new Error(`CMS: ${name}: responsive image not found: ${candidate}`);
    }
  });
  return $.html();
}

export function cmsPlugin() {
  return {
    name:'bdib-pages-cms', enforce:'pre',
    buildStart() { validateAll(); },
    transformIndexHtml: { order:'pre', handler(html, context) { return renderPage(html,context.filename); } },
    configureServer(server) {
      server.watcher.add(path.join(root,'content'));
      server.watcher.on('change',file=> { if (file.startsWith(path.join(root,'content')+path.sep)) server.ws.send({type:'full-reload'}); });
    }
  };
}
