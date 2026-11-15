# Portfolio

Personal site for Joshua De Guzman. Next.js (App Router), plain CSS, IBM Plex via Fontsource.

## Edit the content

All text, projects and links live in `lib/content.ts`. Add a project by adding an entry to `projects`; its page appears at `/work/<slug>`.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Notes

- Colours and type sizes are variables at the top of `app/globals.css`. Dark mode follows the system setting.
- The contact form posts to Formspree (form id in `components/ContactForm.tsx`).
- Keep images under a few hundred KB each: export WebP at about 1600px wide into `public/img`.

## LedgerLens demo

`public/ledgerlens/` is the static demo from the [LedgerLens](https://github.com/Joshupau/ledgerlens) repo, served at `/ledgerlens/`. To update it, run `npm run build:demo` in that repo and copy `demo/dist` (without `artifact.html`) over this folder; the header link line in `index.html` points back to `/work/ledgerlens/` and `/`.
