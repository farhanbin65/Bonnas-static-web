# BONNAS Sanity Studio

## Gallery images

From this directory, run `npm ci` and `npm run deploy` to publish Studio schema
changes to the existing app configured in `sanity.cli.js`. Updating the website
deployment alone does not update the hosted Studio. For a local preview, run
`npm run dev`.

After deployment, refresh Studio and select **Gallery Image** in the Content list.
Create one entry per photo, upload the image, and enter its food name and alt text
(required). Add food details for the future hover/tap overlay, a category, and
search tags. Set display order to 10, 20, 30, etc., then publish. Turn off **Show in
gallery** to hide an entry when the website integration is added.

This schema update only adds content management. The website gallery slider and
search will be connected separately. `scripts/images.json` remains unchanged;
published Sanity entries will supply the new gallery metadata, avoiding two
manually maintained copies. Existing JSON metadata can be migrated separately.

AI tagging is not automatic. Review tags and descriptions before publishing.

## Resources

Congratulations, you have now installed the Sanity Content Studio, an open-source real-time content editing environment connected to the Sanity backend.

Now you can do the following things:

- [Read “getting started” in the docs](https://www.sanity.io/docs/introduction/getting-started?utm_source=readme)
- [Join the Sanity community](https://www.sanity.io/community/join?utm_source=readme)
- [Extend and build plugins](https://www.sanity.io/docs/content-studio/extending?utm_source=readme)
