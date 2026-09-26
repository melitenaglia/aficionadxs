# // AFCNDXS ARCHIVE — MVP

Static prototype for the AFCNDXS photographic archive.

## Structure

- `public/index.html` — site shell
- `public/styles.css` — visual system
- `public/app.js` — archive, product selector and request cart
- `public/data/archive.json` — photographic archive
- `public/data/products.json` — physical formats
- `public/assets/photos/` — optimized web images
- `wrangler.jsonc` — Cloudflare Workers static-assets deployment

## Cloudflare

The repository is intended to deploy with the command Cloudflare already uses:

`npx wrangler deploy`

No build command is required.

## WhatsApp

Open `public/app.js` and set:

`const WHATSAPP_NUMBER = "";`

to the destination number in international format without `+`.

## Photos

Do not publish RAW/HEIC originals. Keep only optimized WebP derivatives in `public/assets/photos/`.

Current MVP image long edge: max 1800 px, WebP quality 82.

## Important

Only the postcard currently has a fixed public test price (5 EUR). Other formats remain `PRICE ON REQUEST` until supplier, production, VAT and shipping are validated.
