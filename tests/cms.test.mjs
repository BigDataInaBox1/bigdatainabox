import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import YAML from 'yaml';
import { models, pageNames } from '../cms/model.mjs';
import { root, readContent, renderPage, validateAll } from '../cms/render.mjs';
import { cmsConfig } from '../scripts/generate-cms-config.mjs';

const source = name => fs.readFileSync(path.join(root,name),'utf8');
const entry = (group,name) => models.find(m=>m.group===group && m.name===name);
const edit = (group,name,change) => { const m=entry(group,name); const data=structuredClone(readContent(m)); change(data); return {[m.path]:data}; };
const page = (name,overrides={}) => load(renderPage(source(name),name,overrides));
const text = $ => { const copy=$.root().clone(); copy.find('script,style,svg').remove(); return copy.find('body').text().replace(/\s/g,''); };

test('checked-in Pages CMS config matches the editor model and protects all content files',()=>{
  const config=YAML.parse(source('.pages.yml'));
  assert.deepEqual(config,cmsConfig());
  const files=config.content.flatMap(g=>g.items);
  assert.equal(files.length,31);
  assert.equal(new Set(files.map(f=>f.name)).size,files.length);
  for (const file of files) {
    assert.ok(fs.existsSync(path.join(root,file.path)));
    assert.equal(file.format,'json');
    assert.deepEqual(file.operations,{create:false,rename:false,delete:false});
  }
  assert.equal(config.settings.hide,true);
  assert.equal(config.settings.content.merge,true);
  assert.equal(config.media[1].input,'public/uploads/documents');
  validateAll();
});

test('default content preserves original copy, headings, sections, IDs, images, and page links',()=>{
  // Baseline generated once from the pre-integration site, kept as a small,
  // versioned semantic snapshot rather than a second copy of the whole website.
  const baseline=JSON.parse(source('tests/fixtures/site-before-cms.json'));
  for(const name of pageNames){
    const $=page(name);
    assert.equal(text($),baseline[name].text,`${name}: copy changed`);
    assert.deepEqual($('h1,h2,h3,h4').map((i,e)=>$(e).text().replace(/\s/g,'')).get(),baseline[name].headings);
    assert.deepEqual($('section').map((i,e)=>$(e).attr('id')??$(e).attr('class')).get(),baseline[name].sections);
    assert.deepEqual($('[id]').map((i,e)=>$(e).attr('id')).get().sort(),baseline[name].ids);
    const images=$('img').map((i,e)=>({src:$(e).attr('src'),alt:$(e).attr('alt'),srcset:$(e).attr('srcset')})).get();
    // The hidden map detail image now has its real CMS source before opening.
    const oldImages=baseline[name].images;
    for(let i=0;i<images.length;i++){
      if(oldImages[i].src==='') continue;
      assert.deepEqual(JSON.parse(JSON.stringify(images[i])),oldImages[i],`${name}: image ${i} changed`);
    }
    assert.deepEqual($('a[href]').map((i,e)=>$(e).attr('href')).get(),baseline[name].links);
  }
});

test('ordinary edits appear in static HTML and are escaped without changing heading structure',()=>{
  const overrides=edit('home','hero',c=>{c.lineOne='Farm <records> & reports';c.description='Editable from Pages CMS.';});
  const $=page('index.html',overrides);
  assert.equal($('.hero-title-main').contents().filter((i,n)=>n.type==='text').text().trim(),'Farm <records> & reports');
  assert.equal($('.hero-title-main records').length,0);
  assert.equal($('.hero-title-main br').length,1);
  assert.equal($('.hero .lead').text(),'Editable from Pages CMS.');
});

test('all static marketing text is bound to the CMS, leaving only interface controls in templates',()=>{
  const overrides={};
  const replace=(fields,data)=>{
    for(const f of fields){
      if(f.list) data[f.name].forEach(item=>replace(f.fields,item));
      else if(f.type==='object') replace(f.fields,data[f.name]);
      else if(!['image','file','number'].includes(f.type) && f.mode!=='url' && data[f.name]) data[f.name]='X';
    }
  };
  for(const model of models){const data=structuredClone(readContent(model));replace(model.fields,data);overrides[model.path]=data;}
  const controls=new Set(['Pauseanimation','1of5','←Previous','Nextinsight→','Continue→','··','X250']);
  for(const name of pageNames){
    const $=page(name,overrides); $('script,style,svg').remove();
    $('body *').each((i,element)=>{
      const value=$(element).contents().toArray().filter(n=>n.type==='text').map(n=>n.data).join('').replace(/\s/g,'');
      if(value && !/^X+$/.test(value)) assert.ok(controls.has(value),`${name}: unmanaged marketing text: ${value}`);
    });
  }
});

test('replacing a responsive image clears old candidates and updates preload without dropping layout hooks',()=>{
  const overrides=edit('home','hero',c=>{c.background={src:'/assets/home/sunlit-wheat-800.webp',alt:'Replacement field photo'};});
  const $=page('index.html',overrides),image=$('.hero-backdrop img');
  assert.equal(image.attr('src'),'/assets/home/sunlit-wheat-800.webp');
  assert.equal(image.attr('alt'),'Replacement field photo');
  assert.equal(image.attr('srcset'),undefined);
  assert.equal($('link[rel="preload"][as="image"]').attr('href'),image.attr('src'));
  assert.equal($('link[rel="preload"][as="image"]').attr('imagesrcset'),undefined);
  assert.equal($('#hero-video').length,1);
});

test('a replacement hero illustration appears instead of the previous animation',()=>{
  const overrides=edit('home','hero',c=>{c.illustration={src:'/assets/spiderag-3d-iphone-mockup.png',alt:'New phone illustration'};});
  const $=page('index.html',overrides);
  assert.equal($('#hero-video-fallback').attr('alt'),'New phone illustration');
  assert.equal($('#hero-video, #hero-motion-toggle').length,0);
});

test('FAQ, galleries, team and comparison lists can grow without introducing structural controls',()=>{
  let overrides=edit('home','questions',c=>c.questions.push({question:'Can I edit this?',answer:'<p>Yes, in the CMS.</p>'}));
  let $=page('index.html',overrides);
  assert.equal($('.faq-item').length,6);
  assert.equal($('.faq-item:last-child .faq-question span').text(),'Can I edit this?');
  assert.equal($('.faq-item:last-child .faq-answer-inner p').text(),'Yes, in the CMS.');
  overrides=edit('home','farm-gallery',c=>c.slides.push({image:{src:'/assets/home/sunlit-wheat-800.webp',alt:'Added wheat photo'}}));
  $=page('index.html',overrides);
  assert.equal($('#gallery-track .gallery-slide').length,11);
  assert.equal($('#gallery-track .gallery-slide:last-child img').attr('alt'),'Added wheat photo');
  overrides=edit('home','team',c=>c.members.push({name:'New team member',photo:{src:'/assets/team-sree.jpg',alt:'New team member portrait'},description:'An editable biography.',linkedin:'https://www.linkedin.com/in/example'}));
  $=page('index.html',overrides);
  assert.equal($('.team-member').length,4);
  assert.equal($('.team-member:last-child .team-socials a').attr('aria-label'),'LinkedIn profile of New team member');
  assert.equal($('.team-member:nth-child(2) .team-socials').length,0);
  overrides=edit('home','comparison',c=>{c.rows=c.rows.slice(0,3);});
  $=page('index.html',overrides);
  assert.equal($('.compare-matrix tbody tr').length,3);
  assert.equal($('#btn-expand-compare').length,0);
});

test('all five map positions remain fixed while insight copy and image alt text can change',()=>{
  const overrides=edit('home','farm-map',c=>{const item=c.insights.find(i=>i.id===1); item.title='CMS map title';item.mobileLabel='Edited mobile label';item.image.alt='Edited detail photo';});
  const $=page('index.html',overrides);
  assert.equal($('[data-pin="1"]').attr('aria-label'),'CMS map title');
  assert.equal($('[data-prezi-mobile-pin="1"]').text(),'Edited mobile label');
  assert.equal($('#prezi-card-title').text(),'CMS map title');
  assert.equal($('#prezi-card-img').attr('alt'),'Edited detail photo');
  assert.match($('[data-pin="1"]').attr('style'),/top: 42.30%; left: 46.05%/);
  assert.throws(()=>validateAll(edit('home','farm-map',c=>{c.insights[0].id=99;})),/protected map IDs/);
});

test('pricing edits reach the initial static card and preserve the price interval styling',()=>{
  const overrides=edit('pricing','plans',c=>{c.annual.amount=275;c.annual.title='Updated annual plan';c.annual.button.text='Join now';c.annual.billing='An edited annual explanation.';});
  const $=page('pricing-sign-up.html',overrides);
  assert.equal($('#billing-title').text(),'Updated annual plan');
  assert.equal($('#price-display').text(),'$275/year');
  assert.equal($('#price-display .price-interval').length,1);
  assert.equal($('#cta-button').text(),'Join now');
  assert.match($('#billing-period-text').text(),/^An edited annual explanation\./);
});

test('unsafe links, missing media, malformed values and invalid list sizes stop publication',()=>{
  assert.throws(()=>validateAll(edit('home','hero',c=>{c.primary.url='javascript:alert(1)';})),/valid.*link/);
  assert.throws(()=>validateAll(edit('home','hero',c=>{c.background.src='/uploads/images/missing.jpg';})),/not found/);
  assert.throws(()=>validateAll(edit('home','hero',c=>{c.background.src='/../package.json';})),/not found/);
  assert.throws(()=>validateAll(edit('home','hero',c=>{c.background.src='/%2e%2e%5cpackage.json';})),/not found/);
  assert.throws(()=>renderPage(source('index.html').replace('/assets/home/hero-farm-640.webp','/uploads/images/deleted-responsive-variant.webp'),'index.html'),/responsive image not found/);
  assert.throws(()=>validateAll(edit('pricing','plans',c=>{c.annual.amount=-20;})),/invalid number/);
  assert.throws(()=>validateAll(edit('home','questions',c=>{c.questions=[];})),/between/);
  assert.throws(()=>validateAll(edit('home','hero',c=>{c.description=44;})),/expected text/);
});

test('rich text strips scripts and event handlers, while allowing ordinary formatting and links',()=>{
  const overrides=edit('home','story',c=>{c.history='<p><strong>Safe emphasis</strong><script>alert(1)</script><a href="javascript:alert(2)" onclick="alert(3)">Bad destination</a><a href="https://example.com" target="_blank">Good link</a></p>';});
  const $=page('index.html',overrides),p=$('.story-text > p:nth-of-type(2)');
  assert.equal(p.find('script').length,0); assert.equal(p.find('[onclick]').length,0);
  assert.equal(p.find('a[href^="javascript:"]').length,0);
  assert.equal(p.find('strong').text(),'Safe emphasis');
  assert.equal(p.find('a[href="https://example.com"]').attr('rel'),'noopener noreferrer');
  assert.equal(p.find('p').length,0);
});

test('new Contact Us destinations follow the edited link instead of opening the old popup',()=>{
  const overrides=edit('shared','navigation',c=>{c.contact.url='https://example.com/contact';});
  const $=page('index.html',overrides),link=$('.nav-links > li:nth-child(6) a');
  assert.equal(link.attr('href'),'https://example.com/contact');
  assert.equal(link.attr('data-open-contact-modal'),undefined);
});
