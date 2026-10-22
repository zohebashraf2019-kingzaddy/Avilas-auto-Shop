# Avila's Auto & Truck Repair — website

Static multi-page site for Avila's Auto & Truck Repair (2530 Sutro St #3, Reno, NV · est. 1976).

## Pages
- `index.html` — home: intro video hero, services preview, shop video showcase, reviews, map
- `services.html` — all services with category tabs (links like `/services#tires` open a tab)
- `about.html` — story, milestones, values, shop gallery
- `contact.html` — free estimate form, hours with live open/closed status, map

## Deploy (Vercel)
Import the repo in Vercel → Framework preset **Other** → no build command, output directory `.` (root).
`vercel.json` turns on clean URLs (`/services` instead of `/services.html`).

## Estimate form
The form posts to FormSubmit (`https://formsubmit.co/ajax/help@avilasautorepairinc.com`).
The **first** submission sends a one-time activation email to that inbox — click the link in it
and every request after that is delivered as a normal email. To send to another inbox,
change the `action` on the form in `contact.html`.

## Editing
- Hours: `assets/js/main.js` (`HOURS` object, used for the open/closed badge) and the hours tables/footer text in the HTML.
- Colors/fonts: CSS variables at the top of `assets/css/style.css`.
- Videos live in `assets/video/` (compressed H.264, muted autoplay loops; sound button toggles audio).
