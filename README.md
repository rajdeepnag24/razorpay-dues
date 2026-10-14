# Dues — collect what clients owe, from your phone

A prototype feature for the Razorpay mobile app. Built for the **Razorpay AI × PM Build Challenge** at ISB (Track 1: *Razorpay in Your Pocket*), Oct 2026.

**[Live demo](https://razorpay-dues-rajdeepnag2410-5143.vercel.app)** · **[90-second video](docs/dues_demo_90s.mp4)** · **[Product note (PDF)](docs/product_note.pdf)** · **[AI build log](docs/AI_BUILD_LOG.md)**

## The problem

Micro B2B suppliers deliver to the same clients again and again on credit. Example: a home baker who supplies cafés.

- She sends a new Razorpay payment link for each delivery.
- Unpaid links pile up. The app does not group them by client or show how late each one is.
- She chases payment by hand on WhatsApp, which is awkward with repeat clients.

Delayed payments to Indian MSMEs are a large, known problem (about ₹7.34 lakh crore stuck, FISME/C2FO, 2024).

## The solution

**Dues** is a card on the Razorpay app home screen, next to Payment Links.

1. **Group** — unpaid links are grouped by client, with the total due and days late.
2. **Prioritise** — clients that are later than their usual payment time come first.
3. **Nudge** — one tap drafts a polite WhatsApp reminder with a single link for all dues. The merchant edits it and sends it from her own WhatsApp.
4. **Track** — the due clears when the client pays. Auto-nudge can repeat the reminder on a schedule she sets.

Design rule: **AI drafts, she sends.** Nothing goes to a client without the merchant's tap. The whole flow takes under two minutes.

## Key product decisions

- Built on existing payment links, so there is no new setup for the merchant.
- WhatsApp hand-off (`wa.me` link), not a bulk-messaging API — the message comes from her number, which keeps the relationship personal.
- Tone and language options (including Hindi and Hinglish), since many clients are long-term relationships.

## How it works

| Part | What it does |
|---|---|
| `app/page.js` | The mobile app prototype: home, Dues list, client page, nudge composer, auto-nudge |
| `app/api/draft/route.js` | Drafts the nudge. Uses Claude when `ANTHROPIC_API_KEY` is set; otherwise falls back to templates |
| `lib/data.js` | Sample merchant, clients and payment links (synthetic data) |
| `lib/templates.js` | Template drafts by tone and language |
| `lib/insights.js` | Days-late and "usual time to pay" logic used to rank clients |

The live demo runs **without** an LLM key (a cost choice), so drafts come from templates. Set `ANTHROPIC_API_KEY` to switch on AI drafts.

## Run it locally

```bash
npm install
npm run dev
# open http://localhost:3000 (best viewed at phone width)
```

Optional, for AI drafts:

```bash
export ANTHROPIC_API_KEY=your_key
```

## Stack

Next.js 14 (App Router) · React 18 · plain CSS styled after Razorpay's Blade design system · Vercel

## How I built it

I used AI tools across the build: Claude for research synthesis, mockups and the prototype code; ChatGPT and Gemini for synthetic interviews to test my interview guide; Python (ffmpeg, OpenCV) for the demo video. I made the product calls: the problem, the segment, the scope and the trust rules. Details are in the [AI build log](docs/AI_BUILD_LOG.md).

## Disclaimer

An independent student project. Not affiliated with or endorsed by Razorpay. All merchant and client data in this repo is synthetic.

— Rajdeep Nag, ISB PGP 2027
