# Pages CMS integration and handoff

This integration uses the hosted [Pages CMS app](https://app.pagescms.org/) as an editing interface for repository files. Cloudflare Pages continues to build and host the existing Vite website. No database, CMS runtime, paid service, DNS change, custom GitHub App, or new hosting project has been introduced into this website.

Implementation follows the official Pages CMS documentation consulted on November 9, 2026. The hosted app handles its own authentication and collaborator storage; those services are not self-hosted or added to the website.

## One-time activation by a repository administrator

1. Publish the integration files, including `.pages.yml`, `content/`, `cms/`, the updated package files, and the referenced public assets, to the repository and branch Cloudflare already builds. The integration does not change the repository remote or production branch.
2. Go to [Pages CMS](https://app.pagescms.org/) and sign in with GitHub. Install/authorize its GitHub App on the account or **organization that currently owns the repository**. Select this repository rather than granting access to unrelated repositories. Follow any approval process required by the organization.
3. Open the repository and the publishing branch in Pages CMS. The existing `.pages.yml` should produce five grouped menus containing 31 content editors, plus the image and PDF libraries. Do not replace it with the minimal sample configuration.
4. Give the client access. The straightforward option is an email collaborator invitation in Pages CMS: current Pages CMS supports content/media editors without a GitHub account, while configuration and collaborator administration stay with authorized GitHub users. Alternatively, a client with appropriate GitHub repository access can sign in with GitHub. Invitations must be made by the actual administrator; no placeholder email addresses are configured in this repository.
5. Make a small, intentional content change in Pages CMS and save it. Confirm that the expected JSON file changes on the intended branch in GitHub, that Cloudflare creates a deployment for that commit, and that the public page reflects the change. Repeat once with a new image upload and replacement. Restore any test wording through the CMS.
6. Give the client [the editing guide](CMS-CLIENT-GUIDE.md), the repository name, the publishing branch, and their Pages CMS invitation.

The repository configuration is owner-agnostic and works for organization repositories. Repository access is granted in GitHub/Pages CMS, not in `.pages.yml`. Local implementation and build tests cannot establish whether that external app has been authorized or prove a live Cloudflare deployment. No app installation, invitation, Git push, DNS change, or hosting change is performed by these files.

If branch protection prevents direct content commits, retain those protections and use the organization's approved editing/review branch process. Saving to a nonproduction branch does not publish the production website. Confirm the current Cloudflare production branch and build-watch settings rather than changing them as part of this integration.

## Editing inventory

All entries are protected single-file JSON editors with create, rename, and delete disabled. The client edits fields and bounded lists within the existing sections.

| Group | Editors and corresponding files under `content/` |
| --- | --- |
| Across the website (5) | Company name and logos (`shared/brand.json`); navigation/header buttons (`shared/navigation.json`); footer/contact details (`shared/footer.json`); mobile image/offline badge (`shared/mobile-visual.json`); contact popup wording (`shared/contact-popup.json`). |
| Homepage (16) | Search listing (`home/search.json`); opening headline/images (`home/hero.json`); product introduction/screenshots (`home/product-introduction.json`); comparison (`home/comparison.json`); research/community logos and collage (`home/partners.json`); interactive map (`home/farm-map.json`); paperwork callout (`home/paperwork-callout.json`); farm gallery (`home/farm-gallery.json`); mobile section (`home/mobile.json`); getting started (`home/getting-started.json`); challenges (`home/challenges.json`); benefits (`home/benefits.json`); story and founder quote (`home/story.json`); team (`home/team.json`); FAQs (`home/questions.json`); closing trial callout (`home/trial-callout.json`). |
| SPIDER Ag page (7) | Search listing (`product/search.json`); hero (`product/hero.json`); features (`product/features.json`); mobile section (`product/mobile.json`); plan callout (`product/trial-callout.json`); examples gallery (`product/gallery.json`); report callout (`product/report-callout.json`). |
| Pricing page (2) | Introduction/search listing/included features (`pricing/page.json`); monthly/annual plans, savings labels, and subscribe destinations (`pricing/plans.json`). |
| Contact page (1) | Page/search copy, form introduction, and email link (`contact/page.json`). |

There is no customer testimonial collection in the current website. The existing founder quotation and attribution are editable without adding a testimonial section. Product features, benefits, partner organizations, team members, FAQs, galleries, and comparison rows use constrained object lists. The existing three onboarding steps and five map positions have fixed item counts. Map position IDs are hidden and read-only; coordinates remain developer-owned.

All current visitor-facing marketing copy, photos, image alt text, button labels/destinations, search titles/descriptions, and contact details have been migrated. Interface controls such as close buttons, carousel navigation, playback controls, and structural icons stay in code. Zoho form internals and checkout/account behavior remain in their existing external services.

## Rendering architecture

`cms/model.mjs` is the developer-owned source for editor fields and their bindings to existing HTML. `npm run cms:config` generates the root `.pages.yml`. The client never edits DOM selectors, HTML layouts, CSS classes, script paths, embed endpoints, map coordinates, or deployment settings.

`cms/render.mjs` provides a Vite plugin. Before Vite processes an HTML entry, it validates all content and renders that page's fields into its existing template with Cheerio. The result is normal static HTML, including the text and metadata needed by search engines. There is no client-side request to Pages CMS and no API key in the browser.

The four source HTML files retain their original copy as template fallbacks. The JSON content is authoritative for CMS-owned fields. Layout changes belong in the templates/styles; content changes belong in JSON or Pages CMS. When adding a new editable section in the future, update the model and seed its JSON, regenerate the config, and verify its binding and layout.

The interactive farm detail cards and contact popup import their JSON in `main.js`. The pricing toggle imports `content/pricing/plans.json` through `pricing.js`, so monthly and annual views use the same source as the initial static annual card. Vite bundles these imports normally. Existing carousel/lightbox, FAQ, menu, modal, scroll, and GSAP behavior remains in the existing scripts.

Plain text is escaped. Rich-text HTML is limited to ordinary paragraphs, emphasis, lists, and safe links with `sanitize-html`; scripts and event handlers are removed. Rich text rendered into an existing paragraph is flattened to avoid invalid nested paragraphs. Client prices are rendered through text/DOM APIs, not arbitrary HTML.

## Upload paths and Vite behavior

| Media source | Repository storage | Public URL |
| --- | --- | --- |
| Images and logos | Existing `public/` assets; image fields open `public/uploads/images` for new uploads | `/assets/...` for existing media; `/uploads/images/filename.ext` for new field uploads |
| PDF documents | `public/uploads/documents` | `/uploads/documents/filename.pdf` |

Pages CMS maps `input: public` to `output: /` for images. It uses safe filename renaming, image-only extensions, and explicit image alt-text fields. PDFs use their own document-only library and optional file fields on selected callout/podcast links. SVG, executable files, video uploads, arbitrary HTML embeds, and custom CSS are not exposed through these editors.

Vite copies `public/` into `dist/` unchanged. Absolute public URLs therefore work with Cloudflare Pages without runtime image imports, a media server, or hosting rewrites. Fourteen existing source-only image assets were copied to matching `public/assets/...` paths so they resolve in the CMS as well as the production build; the source originals were retained.

Original image `srcset`/`sizes` candidates stay intact until an image is replaced. A replacement removes stale responsive candidates and `<picture>` sources so the browser displays the chosen new file. The homepage's preload is updated when its background changes. Replacing its animated phone illustration removes that illustration's old video and playback button; otherwise the existing animation remains intact. A new company logo is shown in full rather than inheriting the original artwork's crop.

The integration does not resize/compress new uploads automatically. Prefer new filenames for replacements, and optimize large photos before upload. Individual referenced files above 25 MiB fail validation to match Cloudflare Pages' asset limit. Referenced local media must exist, use an allowed extension, and stay within the repository's asset paths. Avoid deleting or renaming images that content still references; the next build will identify the missing file.

## Client safeguards and practical boundaries

- Five labeled groups organize the 31 editors in page order. Field descriptions explain line breaks, image shapes, downloads, and optional LinkedIn links.
- Required fields, bounded list lengths, price bounds, short heading limits, and image descriptions keep editing predictable. Sections and page paths cannot be created, deleted, or moved in the CMS.
- `settings.hide: true` removes the Settings page from the interface. This is a UI choice, not a replacement for GitHub access control. Email collaborators additionally lack configuration/collaborator administration under Pages CMS' own permissions.
- `settings.content.merge: true` preserves unmanaged data when structured files are saved. App commit identity avoids placing client email addresses into commit metadata through this configuration.
- CMS commit messages do not include build-skipping markers. Saves use the existing GitHub-to-Cloudflare flow; no extra workflow, build hook, or secret is required by this implementation.
- Builds fail with a content-file/field path for invalid content. Cloudflare must complete a successful build before an edit appears publicly. Existing live deployments are not replaced by a failed build.
- The CMS controls public website wording, not payment amounts in the separate signup service. Savings labels must be kept consistent manually when prices change.
- There is no new approval/draft workflow or in-editor live website preview. GitHub history remains the recovery mechanism. Protected branches, collaborator access, actual app installation, and Cloudflare build settings remain the administrator's responsibility.

## Commands and validation

```sh
npm ci
npm run validate:content
npm run test:cms
npm run test:cms:build
npm run build
```

`validate:content` checks all JSON content, field types, required values, list sizes, prices, URL schemes, media existence/extensions/size, and map IDs. The normal Vite build also runs those checks; no separate hosting build command is needed.

`test:cms` checks the generated configuration and semantic parity against a snapshot captured before integration, including original text, headings, section order, IDs, image candidates, and links. It also tests ordinary edits, safe rich text, list additions/removals, responsive replacement, map content, pricing, and Contact Us destination changes.

The semantic baseline intentionally records the original website. Future intentional changes to public wording or layout require reviewing the corresponding regression expectations. Content validation and production builds operate on the client's current content and do not require the original wording.

`test:cms:build` temporarily edits real JSON, creates a representative upload, and runs a full production Vite build in an isolated temporary output directory. It checks built HTML, bundled map/popup/pricing data, all page image/script/stylesheet paths, and the uploaded file's bytes, then restores the original files in `finally`. Run it separately from any simultaneous editing or baseline test process because it temporarily changes content files.

For local rendering, run `npm run dev`; content changes trigger a page reload. For production review, run `npm run build` and `npm run preview`. The existing build entry points remain:

- `/` / `index.html`
- `/spider-ag.html`
- `/pricing-sign-up.html`
- `/schedule-demo.html`

The implementation retains the existing Vite major version. CMS tooling is installed as development dependencies because it runs during the build, with no new browser CMS framework. Install development dependencies in the build environment, as required by the original Vite build.

## Verification at handoff

All 12 configuration/rendering regression tests and the separate production-build upload test passed. The final four-page Vite production build also passed. Browser review covered all four pages, monthly/annual pricing, comparison expansion, map details and image descriptions, FAQ expansion, the Zoho contact popup, mobile navigation, and the screenshot lightbox. The tested mobile page had no horizontal overflow, and the reviewed homepage reported no browser warnings or errors.

These checks verify repository behavior and the local production output. The final Pages CMS save → GitHub commit → Cloudflare deployment check remains part of the administrator activation steps above.

## Official references

- [Pages CMS introduction](https://pagescms.org/docs/) and [hosted-app quick start](https://pagescms.org/docs/quick-start/)
- [Content configuration](https://pagescms.org/docs/configuration/content/), [fields](https://pagescms.org/docs/configuration/content/fields/), [lists](https://pagescms.org/docs/configuration/content/list/), and [operations](https://pagescms.org/docs/configuration/content/operations/)
- [Media configuration](https://pagescms.org/docs/configuration/media/), [image fields](https://pagescms.org/docs/configuration/fields/image/), and [rich-text fields](https://pagescms.org/docs/configuration/fields/rich-text/)
- [Settings and commits](https://pagescms.org/docs/configuration/settings/) and [collaborator access](https://pagescms.org/docs/configuration/collaborators/)
- [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/) and [platform limits](https://developers.cloudflare.com/pages/platform/limits/)
