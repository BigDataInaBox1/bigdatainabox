# Big Data In a Box website

Four existing Vite pages, with client-editable content managed by **Pages CMS** and deployed by the existing Cloudflare Pages Git integration.

- [Client editing guide](docs/CMS-CLIENT-GUIDE.md)
- [Setup, architecture, and maintenance](docs/PAGES-CMS.md)
- [Pages CMS configuration](.pages.yml)

## Local development

Use Node.js 18.17 or newer and install development dependencies for the build.

```sh
npm ci
npm run dev
```

Content is stored in `content/`. Vite renders that content into the existing HTML templates during development and production builds. Edit content through Pages CMS or the corresponding JSON file; changes to the fallback wording inside an HTML template do not override CMS content.

```sh
npm run validate:content
npm run test:cms
npm run test:cms:build
npm run build
npm run preview
```

The production output remains `dist/`. Existing page URLs are unchanged. No CMS server, database, API keys, or additional hosting configuration is required for this website.

The repository integration is ready for activation after these files are published to GitHub. An authorized repository owner must grant the hosted Pages CMS GitHub App access and invite the client; see the setup guide. Live GitHub authorization and a Cloudflare deployment cannot be verified by a local build.
