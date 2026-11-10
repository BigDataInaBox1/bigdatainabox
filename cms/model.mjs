// Developer-owned bindings. Editors see the labels/fields generated in .pages.yml,
// never selectors, HTML templates, integration settings, or layout instructions.
const S = (name, label, selector, extra = {}) => ({ name, label, type: 'string', selector, required: true, options: { maxlength: 180 }, ...extra });
const T = (name, label, selector, extra = {}) => S(name, label, selector, { type: 'text', options: { maxlength: 2400 }, ...extra });
const H = (name, label, selector, extra = {}) => T(name, label, selector, { mode: 'lines', options: { maxlength: 180 }, description: 'Line breaks are kept. Keep headings short so they fit the existing design.', ...extra });
const R = (name, label, selector) => ({ name, label, selector, type: 'rich-text', required: true, mode: 'rich', options: { format: 'html', switcher: false, media: false }, description: 'Use the visual editor for text, emphasis, and links. The website layout stays fixed.' });
const U = (name, label, selector, extra = {}) => S(name, label, selector, { attr: 'href', mode: 'url', options: { maxlength: 1800 }, pattern: { regex: '^(https?://|mailto:|tel:|/|#|[A-Za-z0-9_-]+\\.html)', message: 'Use a website link, an existing page.html URL, #section, mailto:, tel:, or an uploaded file path beginning with /.' }, ...extra });
const I = (name, label, selector, description = 'Choose a photo or upload a replacement. Keep a similar shape to the existing image.') => ({ name, label, type: 'object', selector, mode: 'image', required: true, description, fields: [
  { name: 'src', label: 'Image', type: 'image', required: true, options: { media: 'images', path: 'public/uploads/images', extensions: ['jpg','jpeg','jfif','png','webp','avif','gif'] } },
  T('alt', 'Image description (alt text)', null, { required: !/(backdrop|brand-mark|hero-video-fallback)/.test(selector ?? ''), description: 'Describe what the image shows. Decorative background photos may have an empty description.', options: { maxlength: 400 } })
] });
const L = (name, label, selector, { allowDownload = false, ...extra } = {}) => ({ name, label, selector, type: 'object', mode: 'link', required: true, fields: [
  S('text', 'Button or link text', null, { options: { maxlength: 60 } }),
  U('url', 'Destination', null),
  ...(allowDownload ? [{ name: 'download', label: 'Optional PDF download', type: 'file', required: false, options: { media: 'documents', extensions: ['pdf'] }, description: 'Choose a PDF to make this a download link. Clear this field to use the Destination above.' }] : [])
], ...extra });
const A = (name, label, selector, fields, min = 1, max = 12, extra = {}) => {
  const primary = fields.find(f=>['title','name','question'].includes(f.name));
  const image = fields.find(f=>f.mode==='image');
  const link = fields.find(f=>f.mode==='link');
  const summary = primary?.name || (image ? `${image.name}.alt` : link ? `${link.name}.text` : 'title');
  return { name, label, selector, type: 'object', mode: 'repeat', required: true, fields, list: { min, max, collapsible: { collapsed: true, summary: `{fields.${summary}} (item {index})` } }, ...extra };
};
const intro = (selector, heading = 'h2') => [S('eyebrow', 'Small heading', `${selector} .eyebrow`), H('title', 'Heading', `${selector} ${heading}`), T('description', 'Description', `${selector} p.lead`)];
const actions = (selector) => [L('primary', 'Main button', `${selector} a.btn-primary`, { allowDownload: true }), L('secondary', 'Second button', `${selector} a.btn-secondary`, { allowDownload: true })];
const cardFields = [S('badge', 'Short category', '.card-badge'), S('title', 'Heading', '.card-title'), T('hint', 'Reveal instruction', '.reveal-hint'), T('description', 'Revealed description', '.card-reveal-content p')];
const galleryFields = [I('image', 'Gallery image', 'img')];
const pageFields = [S('title', 'Browser/search title', 'title', { options: { maxlength: 100 } }), T('description', 'Search description', 'meta[name="description"]', { attr: 'content', options: { maxlength: 320 } })];

export const models = [];
function add(group, name, label, page, fields) {
  const model = { group, name, label, page, path: `content/${group}/${name}.json`, fields };
  models.push(model); return model;
}

add('shared', 'brand', 'Company name and logos', '*', [
  H('name', 'Company name (two short lines)', '.brand-name', { options: { maxlength: 80 } }),
  I('logo', 'Company logo', '.brand-mark img', 'The original logo keeps its existing crop. A replacement is displayed in full beside the company name.'),
  S('homeLabel', 'Logo link description', '.logo-link', { attr: 'aria-label' })
]);
add('shared', 'navigation', 'Navigation and header buttons', '*', [
  L('howItWorks', 'How It Works', '.nav-links > li:nth-child(1) > a'),
  L('story', 'Our Story', '.nav-links > li:nth-child(2) > a'),
  L('product', 'SPIDER Ag', '.nav-links > li:nth-child(3) > a'),
  L('productLogin', 'SPIDER Ag dropdown login', '.dropdown-menu a'),
  L('pricing', 'Pricing', '.nav-links > li:nth-child(4) > a'),
  L('demo', 'Schedule Demo', '.nav-links > li:nth-child(5) > a'),
  L('contact', 'Contact Us', '.nav-links > li:nth-child(6) > a'),
  L('trial', 'Free Trial (mobile menu)', '.btn-nav-drawer'),
  L('loginButton', 'Login button', '.nav-actions a:first-child'),
  L('trialButton', 'Free Trial button', '.nav-actions a:last-child')
]);
add('shared', 'footer', 'Footer and contact details', '*', [
  T('summary', 'Company summary', '.footer-brand > p:first-of-type'),
  H('address', 'Postal address', '.footer-brand > p:last-of-type'),
  S('navigationHeading', 'Navigation heading', '.footer-links h4'),
  A('links', 'Footer navigation', '.footer-links li', [L('link', 'Link', 'a')], 1, 8),
  S('contactHeading', 'Contact heading', '.footer-contact h4'),
  L('phone', 'Telephone', '.footer-contact a[href^="tel:"]'),
  L('email', 'Email address', '.footer-contact a[href^="mailto:"]'),
  T('copyright', 'Copyright line', '.footer-bottom p:first-child'),
  T('company', 'Company/legal line', '.footer-bottom p:last-child')
]);
add('shared', 'mobile-visual', 'Mobile app image and offline badge', '*', [
  I('image', 'Phone image', '.phone-3d-screen', 'Use a transparent PNG/WebP phone mockup to keep the existing presentation.'),
  S('badgeTitle', 'Badge first line', '.offline-phone-callout span', { mode: 'direct' }),
  S('badgeMessage', 'Badge second line', '.offline-phone-callout strong')
]);
add('shared', 'contact-popup', 'Contact popup wording', null, [
  S('eyebrow', 'Small heading', null), S('title', 'Popup title', null, { options: { maxlength: 80 } }), T('description', 'Introduction', null, { options: { maxlength: 320 } })
]);

add('home', 'search', 'Homepage search listing', 'index.html', pageFields);
add('home', 'hero', 'Opening headline and images', 'index.html', [
  S('lineOne', 'Headline first line', '.hero-title-main', { mode: 'direct' }),
  S('lineTwo', 'Headline second line', '.nowrap-line'),
  S('accent', 'Headline accent line', '.hero-title-accent'),
  T('description', 'Introduction', '#top .hero-content > .lead'),
  ...actions('#top .hero-actions'),
  S('trialNote', 'Trial reassurance', '.hero-trial-note', { mode: 'direct' }),
  S('scrollLabel', 'Scroll instruction', '.scroll-down-text'),
  I('background', 'Faded background photograph', '.hero-backdrop img'),
  I('illustration', 'Hero illustration', '#hero-video-fallback', 'Replacing this image uses your new static illustration in place of the current animated phone. Use a transparent PNG/WebP.')
]);
add('home', 'product-introduction', 'SPIDER Ag introduction and screenshots', 'index.html', [
  ...intro('#spider-ag .gallery-intro'), I('logo', 'SPIDER Ag logo', '#spider-ag .product-logo'),
  L('button', 'Feature button', '#spider-ag .gallery-intro a.btn'),
  A('slides', 'Product screenshots', '#spider-carousel-track .gallery-slide', galleryFields, 2, 16)
]);
add('home', 'comparison', 'Notebook and SPIDER Ag comparison', 'index.html', [
  ...intro('#compare .compare-intro'), S('oldHeading', 'Left column heading', '.compare-header-old'),
  I('logo', 'Right column logo', '.compare-header-bdib img'),
  S('productHeading', 'Right column heading', '.compare-header-bdib', { mode: 'direct' }),
  A('rows', 'Comparison rows', '.compare-matrix tbody tr', [
    S('title', 'Comparison topic', '.compare-cell-old .compare-feature-label'),
    T('old', 'Notebook description', '.compare-cell-old .compare-value', { mode: 'direct' }),
    T('product', 'SPIDER Ag description', '.compare-cell-bdib .compare-value', { mode: 'direct' })
  ], 1, 12),
  S('expandLabel', 'Show comparison button', '#btn-expand-compare'),
  S('collapseLabel', 'Hide comparison button', null)
]);
add('home', 'partners', 'Research and community logos', 'index.html', [
  H('title', 'Heading', '.trust-title'),
  A('logos', 'Organizations', '.partner-logo-item', [
    I('image', 'Logo', 'img'), U('url', 'Organization website', ':scope'),
    S('title', 'Organization name', ':scope', { attr: 'title' })
  ], 1, 8, { mode: 'partners' }),
  I('collage', 'Farm collage banner', '.partner-landscape img')
]);
add('home', 'farm-map', 'Interactive farm map', 'index.html', [
  H('title', 'Heading', '.prezi-main-title'), T('description', 'Introduction', '.prezi-intro'),
  I('image', 'Farm map background', '.prezi-map-img'),
  A('insights', 'Five map insights', '.prezi-pin', [
    { name: 'id', label: 'Map position (fixed)', type: 'number', required: true, readonly: true, hidden: true },
    S('title', 'Insight heading', ':scope', { attr: 'aria-label' }),
    S('label', 'Map label', '.pin-label'),
    S('mobileLabel', 'Mobile button label', null), S('category', 'Detail category', null),
    T('description', 'Detail description', null), I('image', 'Detail image', null)
  ], 5, 5, { mode: 'map' })
]);
add('home', 'paperwork-callout', 'Paperwork time callout', 'index.html', [
  S('eyebrow', 'Small heading', '#partner-to-profit .eyebrow'), H('title', 'Heading', '#partner-to-profit h2'),
  T('description', 'Description', '.partner-cta-subtext'), ...actions('.partner-cta-actions')
]);
add('home', 'farm-gallery', 'Everyday farm work gallery', 'index.html', [
  H('title', 'Heading', '#gallery h2'), T('description', 'Introduction', '#gallery .lead'),
  A('slides', 'Farm photographs', '#gallery-track .gallery-slide', galleryFields, 2, 20)
]);
add('home', 'mobile', 'Built for the field', 'index.html', [
  ...intro('#mobile-app .mobile-app-text-col').filter(f=>f.name!=='description'), ...actions('#mobile-app .mobile-app-text-col'),
  R('description', 'Introduction', '#mobile-app .lead'), I('background', 'Faded background photograph', '.mobile-field-backdrop img')
]);
add('home', 'getting-started', 'Three steps to get started', 'index.html', [
  ...intro('.onboarding-intro'), I('background', 'Faded background photograph', '.onboarding-backdrop img'),
  A('steps', 'Getting-started steps', '.onboarding-step', [H('title', 'Step heading', 'h3'), T('description', 'Step description', 'p')], 3, 3)
]);
for (const [name, label, section] of [['challenges','Everyday challenges','#painpoints'], ['benefits','Benefits and value','#value-props']]) {
  add('home', name, label, 'index.html', [
    ...intro(`${section} .section-intro`), A('cards', label, `${section} .interactive-card`, cardFields, 1, 8)
  ]);
}
add('home', 'story', 'Our Story and founder quote', 'index.html', [
  S('eyebrow', 'Small heading', '.story-text .eyebrow'), H('title', 'Heading', '.story-text h2'),
  I('image', 'Story photograph', '.story-field-photo img'),
  R('introduction', 'Opening paragraph', '.story-text > p:first-of-type'),
  T('quote', 'Founder quotation', '.story-quote', { mode: 'direct' }), S('quoteAuthor', 'Quotation attribution', '.story-quote cite'),
  R('history', 'Company history paragraph', '.story-text > p:nth-of-type(2)'),
  S('podcastHeading', 'Podcast introduction', '.story-podcast-links strong'),
  A('podcastLinks', 'Podcast links', '.story-podcast-links a', [L('link', 'Podcast link', ':scope', { allowDownload: true })], 1, 5, { mode: 'inlineLinks' })
]);
add('home', 'team', 'Founding team', 'index.html', [
  A('members', 'Team members', '.team-member', [
    S('name', 'Full name', 'h4'), I('photo', 'Portrait', 'img.team-photo'),
    T('description', 'Role and biography', '.team-member-desc'),
    U('linkedin', 'LinkedIn profile (optional)', '.team-socials a', { required: false })
  ], 1, 12, { template: 'first' })
]);
add('home', 'questions', 'Frequently asked questions', 'index.html', [
  S('eyebrow', 'Small heading', '.faq-section .eyebrow'), H('title', 'Heading', '.faq-section h2'),
  A('questions', 'Questions and answers', '.faq-item', [S('question', 'Question', '.faq-question span'), R('answer', 'Answer', '.faq-answer-inner')], 1, 20)
]);
add('home', 'trial-callout', 'Closing trial callout', 'index.html', [
  H('title', 'Heading', '.newsletter h2'), T('description', 'Description', '.newsletter p'),
  L('button', 'Plan button', '.newsletter a.btn')
]);

add('product', 'search', 'SPIDER Ag search listing', 'spider-ag.html', pageFields);
add('product', 'hero', 'SPIDER Ag opening section', 'spider-ag.html', [
  ...intro('.spider-hero .hero-content', 'h1'),
  I('logo', 'SPIDER Ag logo', '.spider-hero .product-logo'), I('background', 'Faded background photograph', '.spider-hero-backdrop img'),
  ...actions('.spider-hero .hero-actions')
]);
add('product', 'features', 'Farm record features', 'spider-ag.html', [
  S('eyebrow', 'Small heading', '.spider-showcase .eyebrow'), H('title', 'Overview heading', '.spider-showcase h3'),
  T('description', 'Overview description', '.spider-showcase .bento-item p'),
  I('image', 'Overview screenshot', '.spider-showcase .bento-mockup-wrapper img'),
  A('features', 'Feature descriptions', '.feature-list-card', [S('title', 'Feature heading', 'h4'), T('description', 'Feature description', 'p')], 1, 8)
]);
add('product', 'mobile', 'Built for the field', 'spider-ag.html', [
  ...intro('#mobile-app .mobile-app-text-col').filter(f=>f.name!=='description'),
  R('description', 'Introduction', '#mobile-app .lead'), ...actions('#mobile-app .mobile-app-text-col')
]);
add('product', 'trial-callout', 'Farm-sized plans callout', 'spider-ag.html', [
  S('eyebrow', 'Small heading', '.spider-mid-cta .eyebrow'), H('title', 'Heading', '.spider-mid-cta h2'),
  T('description', 'Description', '.spider-mid-cta p'), ...actions('.spider-mid-cta')
]);
add('product', 'gallery', 'SPIDER Ag in Action gallery', 'spider-ag.html', [
  S('eyebrow', 'Small heading', '.spider-gallery-section .eyebrow'),
  H('title', 'Heading', '.spider-gallery-section h2'), T('description', 'Introduction', '.spider-gallery-section .lead'),
  A('cards', 'Product examples', '.spider-gallery-card', [I('image', 'Example image', 'img'), S('title', 'Heading', 'h3'), T('description', 'Description', 'p')], 1, 12)
]);
add('product', 'report-callout', 'Audit-ready records callout', 'spider-ag.html', [
  S('eyebrow', 'Small heading', '.spider-bottom-join .eyebrow'), H('title', 'Heading', '.spider-bottom-join h2'),
  T('description', 'Description', '.spider-bottom-join .lead'), ...actions('.spider-bottom-join'),
  S('trialNote', 'Trial reassurance', '.spider-bottom-join .lead ~ p')
]);

add('pricing', 'page', 'Pricing introduction and search listing', 'pricing-sign-up.html', [
  ...pageFields.map(f=>({...f,name:`search${f.name[0].toUpperCase()}${f.name.slice(1)}`})),
  S('eyebrow', 'Small heading', '.pricing-hero .hero-content .eyebrow'), H('title', 'Page heading', '.pricing-hero h1'),
  T('description', 'Page introduction', '.pricing-hero .hero-content .lead'),
  S('cardLabel', 'Plan card small heading', '.card-core .eyebrow'),
  A('features', 'Included features', '.pricing-features-list li', [T('title', 'Feature description', 'span')], 1, 10)
]);
add('pricing', 'plans', 'Monthly and annual plans', null, [
  S('currency', 'Currency symbol', null, { options: { maxlength: 5 } }),
  ...['monthly','annual'].map(name=>({name,label:name==='monthly'?'Monthly plan':'Annual plan',type:'object',required:true,fields:[
    S('title','Plan heading',null), S('label','Toggle label',null),
    {name:'amount',label:'Price',type:'number',required:true,options:{min:0,max:100000}},
    S('interval','Price interval',null,{options:{maxlength:20}}),
    T('billing','Billing explanation',null), L('button','Subscribe button',null)
  ]})),
  S('savingsPill','Annual savings callout',null), S('savingsBadge','Annual toggle savings label',null),
  S('savingsDetail','Highlighted annual savings text',null)
]);
add('contact', 'page', 'Contact page wording and search listing', 'schedule-demo.html', [
  ...pageFields.map(f=>({...f,name:`search${f.name[0].toUpperCase()}${f.name.slice(1)}`})),
  S('eyebrow', 'Small heading', '.schedule-hero .eyebrow'), H('title', 'Page heading', '.schedule-hero h1'),
  R('description', 'Introduction', '.schedule-hero .lead'), H('formTitle', 'Form heading', '.demo-form-header h2'),
  T('formDescription', 'Form introduction', '.demo-form-header p'),
  T('emailIntroduction', 'Email invitation', '.schedule-bottom-cta p'), L('email','Email link','.schedule-bottom-cta a')
]);

export const groupLabels = { shared: 'Across the website', home: 'Homepage', product: 'SPIDER Ag page', pricing: 'Pricing page', contact: 'Contact page' };
export const pageNames = ['index.html','spider-ag.html','pricing-sign-up.html','schedule-demo.html'];
