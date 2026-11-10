# Editing your website with Pages CMS

Your website keeps its existing design. Pages CMS gives you forms for changing the words, pictures, buttons, and lists inside the existing sections.

## Sign in and publish

1. Open [Pages CMS](https://app.pagescms.org/), using the invitation or access details supplied by your website administrator.
2. Open the Big Data In a Box website repository and the publishing branch your administrator identifies.
3. Choose a section in the left menu. Expand a group such as **Homepage** to find its editors.
4. Make your changes and save. Saving writes the change to GitHub. On the publishing branch, that starts the existing Cloudflare build and deployment.
5. Wait for the deployment to finish, then refresh your public website and check your change. Saving and publishing are separate steps; a saved change is not immediately live.

Only save changes that are ready to publish. The integration does not add an approval or draft publishing workflow. If you need a review before publication, ask your website administrator to use the repository's existing branch/review workflow.

## Where to find things

| Menu group | Content you can edit |
| --- | --- |
| **Across the website** | Company name and logos; header navigation and buttons; footer, address, email, and telephone; shared mobile app picture and offline badge; contact popup wording. Shared changes appear on every page that uses that item. |
| **Homepage** | Search listing; opening headline, pictures, and buttons; SPIDER Ag introduction and screenshot carousel; comparison table; research and community logos and collage; interactive farm map; paperwork callout; farm photo gallery; mobile introduction; three getting-started steps; challenges and benefits; Our Story and founder quotation; founding team; FAQs; closing trial callout. |
| **SPIDER Ag page** | Search listing; opening heading, faded background, logo, and buttons; feature descriptions and overview image; mobile introduction; plan callout; examples gallery; audit-ready records callout. |
| **Pricing page** | Page introduction, search listing, included features, monthly and annual prices, billing explanations, savings labels, and Subscribe links. |
| **Contact page** | Search listing, page introduction, form heading and description, and the email invitation below the form. |

The website currently has a founder quotation, editable under **Homepage → Our Story and founder quote**. It has no separate customer testimonial section.

## Change text and links

- Use the descriptive field labels to find the text on the page. A **Small heading** is the short label above a larger heading.
- Keep headings close to their current length. Some heading fields preserve line breaks; the homepage opening headline has three separate fields to preserve its typography.
- Rich-text fields have a visual toolbar for paragraphs, emphasis, and links. Paste plain text where possible. The site safely limits formatting to protect the design.
- A button has a text field and a destination. Use a complete web address such as `https://example.com`, an existing page such as `spider-ag.html`, an anchor such as `#story`, or an email link such as `mailto:info@example.com`.
- Keep existing destinations unless you intend to send visitors somewhere different. Changing a Contact Us button away from the contact page makes it follow the new link instead of opening the original popup.
- Some callout buttons and podcast links also have an **Optional PDF download** field. Choosing a PDF makes the link open that PDF; clearing it restores the destination field. Opening a PDF does not force a file download in every browser.

## Upload or replace a picture

1. Open the relevant content editor and expand the picture field.
2. Use **Image** to select an existing picture or upload a new one. New field uploads start in `uploads/images` in the image library.
3. Enter a short, useful **Image description (alt text)**, such as “Farmer checking records on a tablet in a wheat field.” Alt text also appears as the caption in the existing photo lightboxes.
4. Save the content editor and wait for the website deployment.

Upload JPG, JPEG, JFIF, PNG, WebP, AVIF, or GIF files. Use a similar shape to the original: wide pictures for backgrounds and banners, portraits for the team, and transparent PNG/WebP for phone mockups and logos. Images are fitted to the existing design; the CMS does not offer a crop or focal-point editor.

For website speed, use compressed pictures and aim for around 2 MB or less where practical. The build rejects an individual referenced upload larger than 25 MiB, Cloudflare Pages' asset limit. Uploaded replacements are served at the size you provide; this integration does not automatically generate smaller versions.

The **Images and logos** library contains existing pictures as well as new uploads. Leave existing files in place if they may still be used elsewhere. Prefer uploading a new filename and selecting it in the relevant editor. This also avoids an old image remaining in a visitor's browser cache. Uploading alone does not select the image for a page.

Decorative background pictures may leave alt text empty. Other image fields require a description. Replacing the homepage's animated phone illustration switches that illustration to your new static image; the rest of the page animation stays in place.

## Edit lists

Expand an item to edit it. Where the editor permits it, add, remove, or reorder items inside the existing list. For example, you can add team members, questions, or gallery pictures without creating a new page section.

List limits keep the existing design usable. The getting-started list stays at three steps, and the farm map keeps its five existing map positions. You can change each map position's label, heading, description, and detail picture. Keep the overview map aligned with those positions if you replace its background illustration.

To add a team member, provide their name, portrait, alt text, and biography. Their LinkedIn profile is optional; leave it empty to omit that icon.

## Change prices carefully

Under **Pricing page → Monthly and annual plans**, update each plan's price, interval, billing explanation, and Subscribe link. Review the annual savings pill, badge, and highlighted savings text at the same time: those are editable marketing statements, not automatically calculated amounts.

These settings change the website display and outgoing links. They do not change the amount charged by the separate SPIDER Ag signup/payment service. Keep those destinations and billing terms aligned with that service.

## What stays with your website administrator

Page URLs, section structure, layout, colors, icons, animations, the farm map's coordinates, and technical integrations stay in the website code. The contact form itself is hosted by Zoho; its questions, delivery settings, and embedded form URL are managed there. The CMS changes the text surrounding that form.

You cannot create, rename, or delete the site's content files through these editors. Pages CMS settings are hidden to keep the interface focused on editing.

## If a saved change does not appear

First check that you edited the publishing branch and that Cloudflare finished deploying the latest change. Refresh the page after deployment. If publication fails, send your website administrator the editor name and the time of your save. Missing files, invalid links, or incomplete required content can prevent a build; the previously published site remains the version visitors see until a successful deployment.

To undo a published change, change the field back and save again. Your administrator can also recover previous content from GitHub history.
