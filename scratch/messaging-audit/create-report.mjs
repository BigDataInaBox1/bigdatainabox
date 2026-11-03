import fs from 'node:fs';
import path from 'node:path';

const changesPath = 'scratch/messaging-audit/changes.json';
const changes = JSON.parse(fs.readFileSync(changesPath,'utf8'));
const addOnce = item => { if (!changes.some(c=>c.file===item.file && c.label===item.label)) changes.push(item); };
addOnce({file:'spider-ag.html',section:'Final call to action',label:'Plan selection button',before:'Create Free Account &amp; Join',after:'Choose a Plan &amp; Start Trial',reason:'Describe the next step accurately: the button opens plan selection, rather than immediately creating a permanently free account.',count:1});
addOnce({file:'index.html',section:'Source maintenance',label:'Trial section comment',before:'NEWSLETTER CAPTURE',after:'FREE TRIAL CALL TO ACTION',reason:'Match the source comment to the corrected trial CTA.',count:1,kind:'maintenance'});
addOnce({file:'main.js',section:'Source maintenance',label:'Utilities comment',before:'Hamburger navigation, scroll reveal animations, newsletter form',after:'Hamburger navigation, scroll reveal animations, contact modal',reason:'Remove the reference to the deleted local-only newsletter handler.',count:1,kind:'maintenance'});
const css = fs.readFileSync('style.css','utf8');
const cssStart = css.indexOf('.pricing-hero > .container {');
const cssEnd = css.indexOf('\n.pricing-toggle-container {',cssStart);
if (cssEnd < 0) throw new Error('Responsive pricing block end was not found.');
const pricingCss = css.slice(cssStart,cssEnd).trim();
if (!pricingCss.includes('.pricing-hero .toggle-label .save-badge')) throw new Error('Responsive pricing correction was not found.');
addOnce({file:'style.css',section:'Pricing mobile layout',label:'Responsive pricing width and compact toggle',before:'No pricing-specific container minimum-width override or compact mobile billing-toggle rules.',after:pricingCss,reason:'The pre-existing max-content toggle forced the pricing container wider than a phone. Constrain the container, reduce mobile card padding, and compact the labels and savings badge while preserving both billing options.',count:1,kind:'css'});
changes.find(c=>c.file==='style.css'&&c.kind==='css').after=pricingCss;
fs.writeFileSync(changesPath,JSON.stringify(changes,null,2));

const root = process.cwd().replaceAll('\\','/');
const link = (file, line) => `[${file}](<${root}/${file}${line?`:${line}`:''}>)`;
const escapeCell = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('|','\\|').replace(/\r?\n/g,'<br>');
const readable = value => String(value).replaceAll('&amp;','&').replace(/^>(.*)<$/s,'$1');
const sourceLine = item => {
  if (!item.after) return undefined;
  const source=fs.readFileSync(item.file,'utf8');
  const position=source.indexOf(item.after);
  return position<0?undefined:source.slice(0,position).split('\n').length;
};
const copyChanges=changes.filter(c=>!c.kind);
const sourceFiles=[...new Set(changes.map(c=>c.file))];
const counts=Object.fromEntries(sourceFiles.map(file=>[file,changes.filter(c=>c.file===file).length]));

let report = `# Website messaging evaluation and change report

Date: November 3, 2026

## Result and scope

The website now leads more consistently with time back, familiar farm record-keeping, audit preparation, and user review of AI output. The new taglines appear in relevant existing body sections. Organic and specialty growers see audit preparation and traceability; small and mid-sized row crop growers see operation fit and less added workload.

This review covered the homepage, SPIDER Ag product page, pricing page, contact page, interactive map copy, and shared contact modal. It includes ${copyChanges.length} copy-change groups (${copyChanges.reduce((sum,c)=>sum+c.count,0)} text replacements), the correction of a misleading trial email form, a responsive pricing adjustment, and source-comment cleanup. The appendices record every tracked item.

No sections were added, removed, or reordered. All four main hero headings and every image source were preserved, including the photos added in the preceding requests. Supporting hero descriptions were corrected where they conflicted with the supplied claim guardrails; the new campaign taglines were placed in body sections. Prior photo and background work is excluded from this audit's change inventory.

The result is an assessment of the website's wording and the documented workflows, not independent certification of the product's accuracy, security, integrations, or commercial results. No deployment, live signup, purchase, form submission, or customer communication was performed.

## Evaluation against the audience chart

| Message pillar | Priority from the supplied chart | Before this revision | Current treatment | Assessment |
| --- | --- | --- | --- | --- |
| Time savings | Primary for both audiences | Strong individual time-saving statements, but interrupted by platform, equipment, and sensor language. | Leads, comparison, onboarding, benefits, mobile copy, and trial CTA emphasize less retyping and no second job. Existing qualitative time-back language is retained; no invented operational savings numbers are added. | Aligned at the messaging level. |
| Compliance and audit readiness | Primary for organic/specialty growers; secondary reporting simplicity for row crop growers | Some wording implied reports were already assembled without user action. FSA coverage and broad compliance wording exceeded the reviewed workflow evidence. | NOP preparation remains prominent. Copy explains selection, generation, review, correction, and confirmation. The FAQ and product CTA distinguish audit-ready records from the certifier's decision. General organization and reporting remain useful to row crop growers. | Aligned, with product scope stated more accurately. |
| Trustworthy, reviewed AI | Secondary for both audiences: control of records and confidence in data | Review was mentioned, but claims that AI checked its own entries could suggest self-verification or automatic human review. | “Trustworthy AI, Not Blind AI” is supported by an explicit review-and-confirm process. AI drafts and extracts; the grower corrects and saves. | Aligned as a workflow promise, not a claim of error-free AI. |
| Fits your operation and ecosystem | Secondary for organic/specialty growers; primary for smaller row crop operations | The farm/field/plot structure was visible, but named platform integrations and sensor claims distracted from practical fit. | “Farmer-Native Organization” is immediately explained using farm, field, plot, and subplot names and boundaries. Small/mid-sized operation fit and no dedicated data team remain prominent. | Aligned for growers. Broader ecosystem compatibility is not claimed without evidence. |
| Market opportunity and traction | Low for both audiences | Industry-leader funding language and a “Trusted by Real Farmers” gallery could imply stronger validation than the shown material established. | Institutional support is framed as “Research & Community Support.” Illustrative farm photography is described as everyday farm work. Investor/market-size messages are not added. | Appropriately secondary; proof-dependent claims remain open. |

The website remains one shared grower experience. Audience priorities were woven into its existing sections, with practical organization and workflow fit explained for growers.

## Use of the supplied taglines

| Supplied direction | How it is used | Where |
| --- | --- | --- |
| Built for the field, not the office | Used directly as “Built for the Field, Not the Office.” | Mobile sections on both the homepage and SPIDER Ag page. |
| Trustworthy AI, not blind AI | Used directly, followed by the specific review-and-confirm step. | Homepage AI benefit card; reinforced in capture descriptions, pricing features, FAQ, and product audit CTA. |
| Third-party validation | Not published as an established fact. Support relationships are distinguished from independent product validation. | Existing logo area renamed “Research & Community Support”; evidence needed before claiming external validation. |
| AI-driven, low-friction capture | Expressed as “Say It, Snap It, It's Recorded,” “Say It: Voice Notes to Tasks,” and “Snap It: Paper Logs to Tables.” AI is described in the supporting copy. | Homepage comparison and onboarding; SPIDER Ag capture cards and interface tour. |
| Farmer-native organization | Used directly and explained in ordinary farm terms. | Homepage organization benefit and SPIDER Ag organization feature. |
| Audit-ready compliance focus | Expressed as “Audit-Ready Reporting,” “Audit-Ready Records, Reviewed by You,” and “Audit Preparation.” | Benefit cards, report steps, map insight, pricing features, FAQ, and product CTA. |

The wording “AI-driven” was deliberately kept out of lead headlines because the supplied chart says to lead with the benefit. “Third-party validation” was deliberately not asserted without a named assessment, scope, and result. Both choices follow the supplied guardrails while preserving the intended marketing direction.

## Claim and phrasing evaluation

| Guardrail | Action taken | Result / limit |
| --- | --- | --- |
| Prefer audit-ready records over guaranteed compliance | Removed broad compliance-ready plan language and revised report promises. Added the certifier-decision distinction in existing explanatory copy. | The software is positioned as preparation support, not a certification guarantee. The historical founder quotation remains unchanged. |
| Lead with the benefit, not AI-powered language | Replaced dense product introduction language with notes, photos, farm records, and less retyping. | AI remains visible where its role is useful to understand. |
| Avoid dense technical jargon up front | Removed “secure, innovative, two-sided platform,” “Ag-Tech Standard,” and integration-led benefit framing. | Founding history and biographies remain historical material rather than product feature claims. |
| Avoid fully automated or hands-off promises | Replaced passive “already assembled” report claims with create, select, review, and confirm steps. | “Recorded” does not mean approved or guaranteed accurate; nearby copy explains review. |
| Do not invent savings figures | Added no numeric time, yield, profit, or ROI claims. Retained the existing price comparison and gave its basis beside the price. | $40 × 12 = $480; $480 − $250 = $230; $230 ÷ $480 = 47.9167%, rounded to the existing 48% badge. This is a billing comparison, not measured operational savings. |
| Avoid absolute data-safety or availability claims | Removed “100% Private & Secure,” unverified encryption wording, and the blanket “accessible anywhere” storage claim. | The audit does not verify the actual security implementation or data retention policy. |
| Do not imply unsupported multi-user roles | Removed product introduction language that suggested a two-sided supply-chain platform connecting farmers, certifiers, and regulators. | No role, team-account, permission, or certifier-login feature is newly claimed. |
| Do not overpromise named integrations | Removed Operations Center and AgFiniti claims and direct sensor/equipment integration language from the revised written copy and map descriptions. | Existing illustrations and interface screenshots were preserved and are not treated as proof that integrations exist. |
| Keep low-friction capture grounded | Used voice notes and photo capture, then review, correction, and confirmation. | The copy does not promise perfect extraction from every photograph or handwriting sample. |
| Keep offline claims scoped | Pricing and product copy specify voice and photo capture offline and later synchronization. | Full report generation, AI processing, and all application features are not represented as available offline. |
| Treat third-party validation as evidence-dependent | Replaced a broad funding/industry-leader heading and an unsupported trust implication in the photo gallery. | Logo relationships, customer use, and independent testing have not been independently authenticated in this task. |

## Page-by-page changes

### Homepage

- Changed search metadata to farm records and audit preparation, with time savings and review in the description.
- Corrected the hero's supporting paragraph to remove unverified combine/sensor integrations. The main hero headline and imagery remain intact.
- Kept the main “one farm record” message and made organic audit preparation visible earlier.
- Updated all relevant map pins, mobile buttons, initial card text, and JavaScript descriptions together. The map now explains traceability, organization, field context, observations, and audit preparation rather than implying verified profitability analysis or direct equipment/sensor connectivity.
- Replaced the gallery's implied customer-validation heading with “Built for Everyday Farm Work,” explicitly including organic, specialty, and row crop growers.
- Used “Say It, Snap It, It's Recorded” for the comparison, with nearby AI draft/review language. Reframed comparison rows as record storage, organic audit preparation, and farm organization.
- Used “Built for the Field, Not the Office” for the mobile section.
- Reframed the logo area as research/community support, rather than blanket funding or validation.
- Revised onboarding to make capture, review, confirmation, and report generation visible.
- Rebalanced the four benefit cards around audit-ready reporting, farmer-native organization, reviewed AI, and less paperwork.
- Updated FAQ answers for extraction/review, NOP report creation, trial/cancellation access, and control over AI-generated output.
- Replaced the local-only email form and invitation-sent toast with “Choose Your Plan,” linked to the existing pricing page.

### SPIDER Ag page

- Replaced the platform-heavy hero description with a practical explanation of farm records. The “SPIDER Ag: Your Field Companion” heading and faded background image remain intact.
- Used “One Place for Every Farm Record” for the core record card.
- Changed capture titles to “Say It: Voice Notes to Tasks” and “Snap It: Paper Logs to Tables,” supported by review/correction/confirmation language.
- Used “Farmer-Native Organization” and explained the land hierarchy. Removed the absolute promise that the farmer would never need to reorganize anything; the manual warns that changing the hierarchy later can require recreating areas and relinking files.
- Used “Works in the Field, Even Offline” and limited offline description to the documented capture workflow.
- Used “Built for the Field, Not the Office” for the mobile section.
- Shifted interface-tour language toward less paperwork and explicit capture/review steps. Replaced compliance/analytics titles that overstated scope.
- Replaced the final passive report promise with “Audit-Ready Records, Reviewed by You” and an explicit user-initiated workflow. Stated that the certifier makes the certification decision.
- Removed “Instant Setup” and unqualified “Cancel Anytime” from the trial footnote. Changed “Create Free Account & Join” to “Choose a Plan & Start Trial” to match the next step.

### Pricing page

- Replaced the security/compliance metadata with concrete record, capture, and audit-preparation benefits.
- Clarified that continued access after the trial requires a paid plan.
- Changed “Ag-Tech Standard” to “Fits Your Farm.”
- Removed unsupported popularity language and made the annual-versus-monthly savings comparison explicit in both the initial HTML and the billing-toggle code.
- Rewrote the five existing feature rows around less retyping, offline capture, farm organization, dated records/NOP templates, and review-and-confirm AI.
- Replaced the blanket security feature claim.
- Corrected a pre-existing mobile width problem that clipped the pricing card, heading, and billing toggle. Both monthly and annual options remain functional, with the same displayed amounts and signup URLs.

### Contact page and shared contact modal

- Invited visitors to describe how they keep records today and ask about capture, organization, and audit preparation.
- Kept the existing form destination and behavior. No messages or test submissions were sent.

## Evidence used and limitations

The four supplied images were the source of the messaging and audience rules: the preferred/avoided phrasing chart, the audience-priority matrix, the grower positioning statement, and the value propositions.

The local [SPIDER Ag user manual](<${root}/SPIDER Ag User Manual-v2.pdf>) was used as an additional product-scope reference:

- Pages 4 and 7: land areas and assigning records to farm/field/plot/subplot.
- Page 5: voice-generated task lists followed by user review and edits.
- Page 6: extraction from documents and images, followed by review, correction, confirmation, and saving.
- Pages 8–10: NOP/custom reports generated from selected, land-linked files; up to five files; review before saving.
- Pages 11–12: 14-day trial, paid access after the trial, access through the current billing period after cancellation, and downloading needed files/reports before access ends.
- Page 13: offline recording/photos/renaming, later sync, and cautions about altering land hierarchies.

The existing displayed $250/year and $40/month prices supplied the plan-savings arithmetic. Prices were preserved, not independently re-priced or checked against a live payment provider. Existing “no credit card required” trial messaging was retained from the site; the live signup conditions were not independently tested.

No independent AI accuracy study, certifier acceptance statement, security assessment, named integration documentation, quantified time-savings study, or authenticated customer testimonial was supplied or established by this review. Those claims were not invented to fill the gaps.

## Remaining findings and evidence needs

1. **Independent validation remains unproven in the reviewed material.** A publishable claim needs the evaluator's name, what was evaluated, the method/date, the result, and permission to cite it. Institutional support and partner logos are different forms of evidence.
2. **Support/logo relationships need a relationship-by-relationship check before stronger wording.** The images and links were preserved; the heading no longer says every organization funded or validated the product.
3. **Measured operating savings remain an evidence opportunity.** A defensible before/after example or study could support an hours-saved claim later. No number was added now.
4. **The existing map and product images are illustrative.** Written claims were corrected, but those graphics were not redesigned or independently authenticated as current product screenshots. Review them before treating them as evidence of sensor connectivity, financial analysis, or integrations.
5. **Secondary-page demo navigation is still a separate functional issue.** “Schedule Demo” uses a javascript:void(0) placeholder in the SPIDER Ag, pricing, and contact-page navigation. These were noted during the audit; the changes here did not alter those navigation destinations or perform a booking.
6. **Live product behavior remains outside this verification.** The audit used the local manual and website source, not an authenticated product session. Report creation, extraction quality, security, full export behavior, cancellation, and checkout should be confirmed against the deployed product before making stronger promises.

## Validation performed

- Production build: passed with npm run build.
- JavaScript syntax check: passed with node --check main.js.
- Diff whitespace check: passed with git diff --check; Git only noted the existing LF/CRLF normalization warnings.
- Structural comparison with the pre-audit checkpoint: homepage 14 sections; SPIDER Ag 6; pricing 1; contact 1. All section tags/order, four main hero headings, and image src/srcset values were preserved.
- Homepage desktop/mobile review: all eight expandable card paragraphs fit within their existing 160px expansion limit at the 375px browser setting; measured text heights ranged from 116px to 145px.
- Organic-report FAQ: opens and displays the selected-files, review/confirm, and certifier-decision wording.
- Trial CTA: “Choose Your Plan” navigates to the local pricing page.
- Pricing: monthly displays $40/month and the monthly signup URL; annual displays $250/year and the yearly signup URL. The comparison text updates with each option.
- Mobile pricing widths: page width equals viewport content width at both the 375px setting (360px content width) and 320px setting (305px content width), with no horizontal overflow.
- SPIDER Ag: revised capture/organization/offline titles and unchanged hero heading/photo load verified in the browser.
- Contact page: revised form introduction verified in the browser, without submitting the form.
- Interactive map: all five insights cycle through their revised titles and close correctly.

## Changed source files

| File | Tracked items in this report |
| --- | ---: |
${sourceFiles.map(file=>`| ${link(file)} | ${counts[file]} |`).join('\n')}

## Appendix A — Complete copy change inventory

The before/after entries below describe this revision only. Repeated desktop/mobile or initial/toggle strings are identified by their labels and occurrence counts. Entity spelling and short source fragments are preserved where that makes the exact change clear.
`;

let number=0;
for (const file of sourceFiles) {
  const items=copyChanges.filter(c=>c.file===file);
  if (!items.length) continue;
  report+=`\n### ${file}\n\n| Item / location | Before | After | Reason |\n| --- | --- | --- | --- |\n`;
  for (const item of items) {
    number++;
    report+=`| ${number}. ${escapeCell(item.section)} — ${escapeCell(item.label)}${item.count>1?` (${item.count} occurrences)`:''}<br>${link(item.file,sourceLine(item))} | ${escapeCell(readable(item.before))} | ${escapeCell(readable(item.after))} | ${escapeCell(item.reason)} |\n`;
  }
}
report+='\n## Appendix B — Functional, layout, and maintenance changes\n';
for (const item of changes.filter(c=>c.kind)) {
  report+=`\n### ${item.section} — ${item.label}\n\nFile: ${link(item.file,sourceLine(item))}\n\n${item.reason}\n\nBefore:\n\n\`\`\`${item.kind==='markup'?'html':item.kind==='css'?'text':item.kind==='logic'?'javascript':'text'}\n${item.before}\n\`\`\`\n\nAfter:\n\n`;
  report+=item.after?`\`\`\`${item.kind==='markup'?'html':item.kind==='css'?'css':'text'}\n${item.after}\n\`\`\`\n`:'The local-only success handler was removed. The replacement CTA is a normal link to pricing-sign-up.html.\n';
}

fs.mkdirSync('docs',{recursive:true});
const output=path.join('docs','WEBSITE-MESSAGING-AUDIT-2026-11-03.md');
fs.writeFileSync(output,report);
console.log(JSON.stringify({report:output,copyGroups:copyChanges.length,copyReplacements:copyChanges.reduce((sum,c)=>sum+c.count,0),technicalItems:changes.filter(c=>c.kind).length,sourceFiles:counts,words:report.split(/\s+/).length},null,2));
