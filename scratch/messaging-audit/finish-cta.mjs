import fs from 'node:fs';
const beforeHtml = fs.readFileSync('index.html', 'utf8');
const formStart = beforeHtml.indexOf('          <form class="newsletter-form"');
const formEnd = beforeHtml.indexOf('          </div>', beforeHtml.indexOf('          <div class="newsletter-toast"', formStart)) + '          </div>'.length;
if (formStart < 0 || formEnd < formStart) throw new Error('Expected trial form was not found.');
const beforeForm = beforeHtml.slice(formStart, formEnd);
const afterForm = `          <a href="pricing-sign-up.html" class="btn btn-primary">
            Choose Your Plan
            <span class="btn-icon-wrapper">
              <svg viewBox="0 0 24 24">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </span>
          </a>`;
const beforeJs = fs.readFileSync('main.js', 'utf8');
const jsStart = beforeJs.indexOf('  /* ---- Newsletter Form Handler ---- */');
const jsEnd = beforeJs.indexOf('  /* ---- Active Navigation Highlighting ---- */', jsStart);
if (jsStart < 0 || jsEnd < jsStart) throw new Error('Expected newsletter handler was not found.');
const beforeHandler = beforeJs.slice(jsStart, jsEnd);
fs.writeFileSync('index.html', beforeHtml.slice(0, formStart) + afterForm + beforeHtml.slice(formEnd));
fs.writeFileSync('main.js', beforeJs.slice(0, jsStart) + beforeJs.slice(jsEnd));
const changesPath = 'scratch/messaging-audit/changes.json';
const changes = JSON.parse(fs.readFileSync(changesPath, 'utf8'));
changes.push(
  { file:'index.html', section:'Trial call to action', label:'Pricing/signup link replaces nonfunctional email form', before:beforeForm, after:afterForm, reason:'The old form collected an email and showed an invite-sent message without a backend. A direct link to the existing plan selection page makes the action truthful.', count:1, kind:'markup' },
  { file:'main.js', section:'Trial call to action', label:'Remove local-only email success handler', before:beforeHandler, after:'', reason:'Remove the code that displayed an invitation confirmation without sending an invitation. No real signup or backend handler was removed.', count:1, kind:'logic' }
);
fs.writeFileSync(changesPath, JSON.stringify(changes,null,2));
console.log('Replaced the local-only email form with a direct pricing/signup link; removed the misleading toast handler.');
