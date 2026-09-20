# ReLoop ♻️ - One Photo Can Save The Planet

Snap a photo of old electronics. ReLoop identifies the item with AI, tells you whether it is recyclable,
which toxic materials it contains, how much CO₂ you save by recycling it, and shows recycling centers on a map.
You also earn **Green Score** points that are kept on your own device.

Built for **Tech for Better Tomorrow (worldwide)**. Roughly 50 million tons of e-waste are produced every year and about 80% of it is not recycled.

**Stack:** Next.js 14 (App Router), Tailwind CSS 3, Lucide icons, Hugging Face Inference API (`microsoft/resnet-50`).

## ReLoop Guide

The floating chatbot button in the bottom-right corner is the **ReLoop Guide**. It is available on every page and helps
users complete the main recycling workflow without leaving the current screen.

- Ask how ReLoop works, why electronics should be recycled, what devices can be scanned, or how to prepare a device.
- Tap the camera icon inside the guide to upload or capture an electronics photo. The guide reuses `POST /api/analyze`
  and the same `lib/match.js` mapping as the full Scan page.
- Use **Find a nearby drop-off** to allow browser location access and open a Google Maps search for nearby e-waste
  recycling centers or electronics shops. The map link also works without location permission by searching near the user.

The guide does not store chat messages or uploaded photos. Location is requested only after the user taps **Use my
location**. On browsers that block geolocation, the Google Maps fallback still lets the user choose their area manually.

---

## Run it locally

```bash
npm install
# put your token in .env.local (already created, see below)
npm run dev                 # http://localhost:3000
```

Production build, exactly like Vercel does it:

```bash
npm run build && npm start
```

## Environment: one file, one variable

`.env.local` at the project root contains a single variable:

```
HF_TOKEN=hf_xxxxxxxxxxxxxxxx
```

- Create a token at https://huggingface.co/settings/tokens. A **fine-grained** token needs the
  permission **"Make calls to Inference Providers"**. A classic **Read** token also works.
- The token is only read on the server (`app/api/analyze/route.js`). The browser calls `/api/analyze` on
  the same domain, so no `NEXT_PUBLIC_` variables exist.
- Without a valid token the app still works: the API returns a clearly flagged **sample result**
  (`fallback: true`) and the UI says so.

## Deploy to Vercel

1. Push this folder to a Git repository and import it in Vercel (framework is auto-detected as Next.js).
2. Under **Settings → Environment Variables** add **only** `HF_TOKEN`.
3. Deploy. `.env.local` is git-ignored and is never uploaded.

## How it works

1. `/scan` lets the user drop, pick or capture a photo. The photo is shrunk to ≤1024 px in the browser
   (`lib/image.js`) so it stays under Vercel's ~4.5 MB request limit.
2. The photo is posted as `FormData` (`image`) to `POST /api/analyze`, which forwards the bytes to Hugging Face.
3. The route returns `{ predictions, topLabel }`. If Hugging Face fails or times out, it returns
   `{ predictions: [{ label: "cell phone", score: 0.99 }], topLabel: "cell phone", fallback: true }`.
4. `lib/match.js` maps the model's labels to an entry in `data/ewasteData.json`. ResNet-50 predicts the 1,000
   ImageNet classes ("notebook, notebook computer", "cellular telephone, ..."), so every item lists the
   ImageNet aliases it should match in `keywords`. The top 5 predictions are checked in order, which handles
   cases where the model's #1 guess is "web site" and #2 is "laptop".
5. If nothing maps to e-waste, the user gets a "pick your item" grid instead of a dead end.
6. `ResultCard` shows the item, badges, toxic materials, CO₂ saved, tree equivalent, tip, Green Score
   (+10 per scan, stored in `localStorage`), a Google Maps embed, and Scan another / Share impact buttons.
7. `ReLoopGuide` is mounted globally from `app/layout.jsx`. It provides quick answers, sends guide photos through the
  existing analyzer, and builds a Google Maps nearby-search link from the user's coordinates when available.

### Tree equivalent

`0.8 kg CO₂ = 1 tree for 8 days`, so `days = co2 × 10` (see `lib/impact.js`).

### Model availability

Hugging Face has retired hosted models and moved the old `api-inference.huggingface.co` host to
`https://router.huggingface.co/hf-inference/...`. The route therefore tries, in order:
`microsoft/resnet-50`, `google/vit-base-patch16-224`, `facebook/convnext-tiny-224` (all ImageNet-1k, so the same
label mapping works), then the legacy host. Each failure is logged as `[reloop] <model> responded with HTTP <code>`
in your Vercel function logs. Edit the `ENDPOINTS` array in `app/api/analyze/route.js` to change the list.

## Add or edit items

Each entry in `data/ewasteData.json`:

```json
"laptop": {
  "name": "Laptop",
  "emoji": "💻",
  "category": "Computing",
  "co2": 5.0,
  "toxic": "Lead, Lithium, Mercury (older screens)",
  "recyclable": true,
  "hazard": "medium",
  "tip": "Wipe your data securely...",
  "keywords": ["laptop", "notebook computer", "notebook"]
}
```

`keywords` are matched as whole words (plural `s` allowed) against the model labels; the longest match wins.
`hazard` (`low | medium | high`) controls the "Special handling" badge.

**About the numbers:** the CO₂ values are rough, rounded estimates for demonstration. Replace them with figures from
your own sources if you need precision. The headline stats on the landing page (50M tons, 80%) are easy to
update in `app/page.jsx`.

## Project structure

```
reloop-next/
├── app/
│   ├── api/analyze/route.js   Route Handler: FormData in, Hugging Face call, fallback
│   ├── scan/page.jsx          Scan page (metadata + <ScanClient />)
│   ├── layout.jsx             Fonts, metadata, Navbar
│   ├── page.jsx               Landing page
│   ├── globals.css            Tailwind layers, glass/button utilities
│   └── icon.svg               Favicon
├── components/
│   ├── Navbar.jsx  UploadBox.jsx  ResultCard.jsx  ImpactStats.jsx  ReLoopGuide.jsx
│   ├── ScanClient.jsx         Scan flow state (upload → analyze → result)
│   └── AnimatedNumber.jsx
├── data/ewasteData.json       25 items
├── lib/                       impact math, label matching, image compression, localStorage hook
├── .env.local                 HF_TOKEN only
└── package.json
```

## Privacy

Photos are sent to Hugging Face for classification and are never stored by this app. The Green Score lives in
your browser's `localStorage`.
