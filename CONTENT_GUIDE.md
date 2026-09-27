# AFICIONADXS — Content workflow

## Current content model

The site has three independent layers:

1. PHOTO / ARCHIVE
   - File: `public/data/archive.json`
   - One record per original photograph.
   - Stores archive ID, title, place, date, time, GPS, camera metadata and available physical formats.

2. EDITION
   - File: `public/data/editions.json`
   - One record per graphic composition derived from a source photograph.
   - `archiveId` links the edition back to the original photo.

3. PHYSICAL / OBJECT
   - File: `public/data/products.json`
   - One record per physical format or garment blank.
   - Sizes, colors, fit, quality notes and prices live here.

## Recommended workflow for now

### Add a photograph
Export from Apple Photos / Lightroom as:
- HEIC
- Full size
- Location information enabled
- Metadata enabled

Then provide the file together with the title you want if the automatic location/title is not enough.

### Add an edition
Provide the design export (PNG/JPG) and tell us which archive ID it belongs to.

Example:
- Source photo: `003`
- Edition: `003-A`
- Variant: `ARCHIVE EDITION / WHITE`

### Modify physical formats
Edit `public/data/products.json` or ask ChatGPT to update it.

The current T-shirt families are:
- TS-R · Stanley/Stella Creator 2.0 · regular organic
- TS-H · Comfort Colors 1717 · heavyweight garment-dyed
- TS-O · Stanley/Stella Blaster 2.0 · oversized organic

All are intentionally limited to S–2XL in the AFCNDXS interface.

## Important

Do not upload full-resolution HEIC originals as public website assets. Keep originals private and publish optimized web derivatives only.

The public site is currently a static Cloudflare deployment from GitHub. A secure in-site admin/CMS has not been added yet. Until the content model is stable, GitHub + ChatGPT is the lowest-complexity workflow.
