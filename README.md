# SunTop Trade — Website

Hong Kong trading company sourcing direct from vetted Chinese factories for Australian buyers. Door-to-door delivery in AUD.

**Live site:** https://suntoptrade.pages.dev (and custom domain when wired)

## Stack

- Static HTML / CSS / JS — no build step, no framework
- Fonts: Fraunces (display) + Manrope (body) + JetBrains Mono (labels) via Google Fonts
- Hosted on Cloudflare Pages (auto-deploys on push to `main`)

## Local dev

```powershell
cd "Website_v21"
python -m http.server 8767
# open http://localhost:8767/index.html
```

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — magazine-cover product carousel + Alibaba comparison + voice-of-buyer + founder note |
| `how-it-works.html` | 5-step process + FAQ |
| `categories.html` | 9 sourcing categories + active-lane Q&A |
| `partners.html` | Factory partner register + 8-step vetting protocol |
| `case-studies.html` | Indicative project scenarios |
| `private-clients.html` | Premium private sourcing track ($5k AUD minimum) |
| `operating-model.html` | Long-form Q&A — pricing, GST, timelines, force majeure |
| `about.html` | Company background |
| `request-a-quote.html` | RFQ form with photo/drawing/spec upload |
| `terms.html` | T&Cs (16 clauses, ACL non-excludable carve-out) |
| `privacy.html` | Privacy policy (Privacy Act 1988 + OAIC route) |

## Assets

- `assets/styles.css` — single stylesheet for all pages
- `assets/app.js` — nav drawer, hero carousel, RFQ form logic
- `assets/Sun_Top_Brand.png` — primary brand mark (transparent, cropped)
- `assets/hero/slide_0[1-6].jpg` — hero carousel photos (optimised)
- `assets/favicon-*.png` — favicons (32, 180, 512)

## Deployment

This repo is connected to Cloudflare Pages — every push to `main` triggers a deploy.

- `_headers` — security + cache headers (Pages reads this automatically)
- `_redirects` — vanity URL rewrites (e.g. `/quote` → `/request-a-quote.html`)
- `robots.txt` + `sitemap.xml` — SEO

## Contact

- Director: Frank Vottari · Sun Top Trade Co., Limited (Hong Kong)
- Email: sales@suntoptrade.com
