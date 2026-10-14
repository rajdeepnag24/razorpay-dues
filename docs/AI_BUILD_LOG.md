# Dues: AI Build Log

**Razorpay AI × PM Build Challenge · Track 1: Razorpay in Your Pocket**
Rajdeep Nag · ISB PGP 2027

| | |
|---|---|
| Prototype | https://razorpay-dues-rajdeepnag2410-5143.vercel.app |
| 90-second video | https://drive.google.com/file/d/1UwmQ11VcbmiKz_aRERTDfMGKdzGCgB0N/view?usp=sharing |

> **What Dues is:** a new feature in the Razorpay app for micro B2B suppliers (for example, a home baker who supplies cafés). It groups unpaid payment links by client, shows days late, and helps the merchant send a nudge from her own WhatsApp. An AI draft is ready to edit, and the whole flow takes under 2 minutes.

---

## 0. Summary

| Phase | AI tools | What AI did | What I decided |
|---|---|---|---|
| Problem discovery | Claude, ChatGPT, Gemini, web search | Secondary research, competitor scan, synthetic interviews to test my interview guide | Which problem, which segment, which claims count as evidence |
| Validation | Claude in Chrome, Claude | Captured 54 Razorpay dashboard screens; organised my interview notes | Who to talk to (merchants, Razorpay PMs); what the live app proves |
| Concept and design | Claude (Docs, Artifacts, Design canvas) | Drafted concept notes, mockups, journey map and the product note layout | Scope, cuts, the trust rules, the north-star metric |
| Prototype | Claude (agentic coding), Vercel | Wrote the Next.js app and the `/api/draft` route; deployed it | Screens, flow, data model, "AI drafts, she sends" |
| Video | Claude + Python (ffmpeg, OpenCV, Pillow), ElevenLabs, Clipchamp | Built the 90 s compositing pipeline; cleaned up the voice-over audio | Story order, every caption, what to cut |
| Review | Claude | Checked every deliverable against the brief and the submission form | Final wording and what to drop |

---

## 1. Toolchain

| Tool | Model / version | Used for |
|---|---|---|
| **Claude** (Anthropic) via claude.ai Projects and agentic sessions | Latest Claude models; final build sessions on Claude Opus 5.5 | Research synthesis, app teardown, concept notes, mockups, prototype code, video pipeline, submission QA |
| **Claude in Chrome** (browser agent) | – | Logged-in tour of the Razorpay dashboard (test mode); 54 screenshots across 28 sections |
| **Claude Design canvas** | – | One-page A4 product note (794 × 1123 px) |
| **Claude Docs / Artifacts** | – | Concept note drafts, synthetic interview log, mockups, journey map |
| **ChatGPT** (OpenAI) | Latest GPT model in ChatGPT | Synthetic merchant interviews, brainstorming, copy and prompt drafts |
| **Gemini** (Google) | Latest Gemini model | Synthetic merchant interviews (cross-check of personas), research cross-checks |
| **Vercel** | Next.js hosting, serverless functions | Prototype deployment, connected to Claude for deploys |
| **ElevenLabs** | AI audio clean-up | Voice-over noise removal and clean-up |
| **Clipchamp** | – | Layering the voice-over on the final video |
| **Python**: ffmpeg, OpenCV, NumPy, Pillow | ffmpeg (libx264), OpenCV 5.0 | Frame-by-frame video compositing (Section 4.3) |
| **Web search** | – | MSME payment-delay data, Razorpay docs, competitor docs |

No paid LLM API is used in the live demo (see Section 4.2).

---

## 2. Problem discovery and validation

I treated AI output as **hypotheses** and only treated people and the live app as **evidence**.

### 2.1 Secondary research (AI-assisted, sources checked by me)
- **Payment delays:** FISME/C2FO *Delayed Payments 3.0*: about ₹7.34 lakh crore stuck in delayed payments to Indian MSMEs (March 2024). Average SME collection: about 73 days.
- **The legal limit:** MSMED Act, Section 15. Buyers must pay within 15 days without written terms, and within 45 days at most with terms.
- **Market size:** Recordent SME Report 2026, and about 6.4 crore Indian MSMEs.
- **Competitor scan:** Razorpay Payment Link reminders, Cashfree link reminders, Refrens, OkCredit, Khatabook, Paytm Business Khata, Vyapar, RazorpayX Receivables Agent, Razorpay Agent Studio.

### 2.2 Synthetic interviews (AI): used to sharpen questions, never as evidence
- 11 simulated merchant interviews in ChatGPT, Gemini and Claude. Round 1 had 5 broad personas; round 2 had 4 in-segment personas plus cross-checks.
- **Purpose:** stress-test my interview guide and early mockups before talking to real people.
- **Rule:** every claim that came from them was marked `*` in the concept note and had to be replaced by real data before submission.

### 2.3 Real conversations (led by me)
- **Merchants:** conversations with merchants who sell on credit and have run their business on the Razorpay app and payment links.
- **Razorpay PMs:** conversations with PMs at Razorpay and people who worked on the merchant app.
- **What they confirmed:** the problem is real. Business clients pay weeks late. Merchants track who owes what outside the app, in WhatsApp, notes or memory. Chasing a regular client feels awkward, so they wait. Built-in link reminders are unknown or switched off.
- **What changed because of them:** the segment moved to B2B suppliers with repeat clients; nudges go from the merchant's own WhatsApp, not a Razorpay SMS; and "Mark paid" was added for cash payments.

### 2.4 Live-app teardown (evidence I captured myself)
- **Android app, own merchant account, live ₹1 link, 12 Oct 2026:**
  - A link has no client name, no client totals and no days-late view.
  - Status shows only "CREATED".
  - The link detail says **"Auto Reminders: Disabled"**.
  - The only reminder switch is account-wide, on a desktop dashboard page.
- **Web dashboard, test mode, 13 Oct 2026:**
  - Claude in Chrome captured 54 screens across 28 sections.
  - The developer bar offers "MCP · Connect AI tools" and "CLI". Home cards are labelled "Insight by RAY".
  - No Agent Studio was visible on this account.

### 2.5 The pivot
- **v0, "Collect" (8 Oct):** solo service operators (photographers, tutors), with a Dues tab inside Transactions.
- **v1, "Dues" (12–13 Oct):** micro B2B suppliers who deliver repeatedly to the same clients on credit (bakers → cafés, tiffins → offices). Dues is a Home card next to Payment Links.
- **Why:** grouping by client matters most when one client has many open links. B2B repeat orders create exactly that, and the MSMED payment limits apply.

---

## 3. Key product and AI decisions (mine)

| Decision | Why | What AI contributed |
|---|---|---|
| Group unpaid links **by client**, with one new Client field | Turns loose links into "who owes what" without a ledger | Options and trade-offs; I picked the minimal data change |
| Send from **her own WhatsApp** (`wa.me` click-to-chat), not a bot or the WhatsApp Business API | Clients trust a known sender; no setup cost | Implementation |
| **AI drafts, she sends** | A nudge to a regular client is a relationship risk; she approves every message | – |
| **Facts from data, words from AI** | Amount, dates and the link come from Razorpay records as structured fields. The model only writes the tone | Prompt contract and fallback logic |
| Tone (Friendly, Direct, Firm) × language (English, Hinglish, Hindi) | Indian B2B chasing is often Hinglish; tone rises with each nudge | Template variants |
| Auto-nudge **opt-in only**: max 3, 7 days apart, stops on payment | Automate only after trust is earned | – |
| **Mark paid** for cash | Prevents nudging someone who already paid; guardrail under 1% | – |
| **Out on purpose:** invoicing and GST, auto-send by default, credit and early payout | Focus on one job; Vyapar and Zoho already do invoicing | – |
| North star: **₹ paid within 7 days of a nudge** | Measures the outcome, not activity | Metric options; I chose and set targets |

---

## 4. Build: technical detail

### 4.1 Workflow
1. **Brief → problem space:** Claude summarised the challenge brief and JD. I chose Track 1.
2. **Research → concept:** AI-assisted research (Section 2), then concept note v0 in Claude Docs, every synthetic claim flagged `*`.
3. **Mockups:** Claude Artifacts styled after Razorpay's Blade design language (navy #0B1F44, Razorpay blue, Lato, IBM Plex Mono).
4. **Prototype:** Claude wrote the code in agentic sessions. I reviewed each screen against the flow. Deployed to Vercel.
5. **Recording:** 12 scripted 1080p30 screen recordings of the prototype flow, about 3.6 minutes in total.
6. **Video:** a Python compositor cut this to exactly 90.0 s (Section 4.3). Voice-over cleaned in ElevenLabs and layered in Clipchamp.
7. **Product note:** Claude Design canvas, A4, one page.
8. **QA:** Claude checked the note and video against the brief and submission form. Fixes were applied (Section 5).

### 4.2 Prototype architecture
```
Next.js (App Router) on Vercel
├── app/page              one client component; screen state machine
│     screens: home → dues → client(café) → nudge → whatsapp → paid
│              → completed → insights → newlink
│     data: seeded in-memory demo (4 cafés, links, nudges); "Reset demo" restores it
├── app/api/draft         POST serverless route: nudge text
│     in:  { contact, contactRole, clientName, amount, linkCount,
│            firstDate, lastDate, oldestDays, usualDaysToPay,
│            nudgeCount, tone, lang, partial, link, variant }
│     out: { text, source: "claude" | "template" }
│     uses Claude when an API key is configured; otherwise a
│     deterministic template (tone × language × nudge count × variant)
└── client fallback       if the request fails: a minimal safe template
                          (name, amount, link)
Send = window.open("https://wa.me/?text=" + encodeURIComponent(draft))
```
- **Live deployment:** no LLM key is configured, which was a cost decision. The live demo returns `source: "template"`. The Claude path is wired and switched on by an environment variable.
- **Grounding:** the model gets facts as typed fields, so amount, dates and link are never generated from memory.

### 4.3 Video compositing pipeline (Python, about 250 lines)
**Goal:** 12 raw clips with white callout cards → one 90 s, Apple-style demo. The phone is cut out onto a gradient, with new captions and no leftover UI.

- **Phone detection, per frame:**
  - On a half-resolution frame, mark dark navy bezel pixels (R < 60, G < 70, B < 120, B > R + 8).
  - Left and right edges are the columns where more than 30% of the height is dark.
  - Top and bottom edges are the rows where more than 50% of the width is dark. If none, the edge is off-frame.
- **Mask:** an anti-aliased rounded rectangle, corner radius 0.135 × phone width, inset 1 px. This removes the old background, callouts and labels.
- **Stabilising:**
  - The phone is re-centred at x = 600 px, smoothed over frames (EMA, α = 0.4).
  - When the phone is partly off-frame, the last known width rebuilds the missing edge.
- **Shadow:** a blurred mask at 1/8 scale, offset down, alpha 0.55.
- **Background:** a diagonal gradient (navy #0A1B5C → blue #1F6AF0 → violet #7A2EF2) with two slowly drifting radial glows. It is computed at 480 × 270 and upscaled.
- **Captions:**
  - Inter Display: a small label, a 78 px headline and a 30 px line below.
  - Each element fades in and rises 36 px with a cubic ease-out, staggered by 120 ms.
- **Edit:**
  - 17 segments, each with its own in point, out point and speed (1.0–1.6×), plus 0.35 s crossfades.
  - The title card, "Introducing Dues" card and end card have their lengths solved so the total is exactly 90.0 s.
- **Encode:** raw BGR frames piped to ffmpeg, libx264, CRF 17, yuv420p, faststart.
- **QA automation:** a scan measures bezel occlusion on each side, every 0.2 s. A one-sided occlusion over 8 rows flags an old callout overlapping the phone, which found the Insights shot. Contact sheets at 1 fps were checked by eye.

### 4.4 Dashboard capture workaround (browser agent)
- **Problem:** Claude in Chrome's screenshots could not be saved to disk.
- **Fix:**
  - A hidden `<input type=file>` was injected into the page.
  - Each screenshot was uploaded into it and then saved as a blob download.
  - Single-page app navigation kept the input alive across sections.
  - The page height was measured to decide how many scroll captures each page needed.
  - When Chrome's multiple-downloads block appeared, the merchant allowed it.
- **Result:** 54 JPGs, zipped. Personal details were flagged before sharing.

---

## 5. AI outputs I rejected or corrected

### 5.1 Main example: "Reminders are on by default"
- **AI output:** concept note v0 said Razorpay sends up to 3 SMS/email reminders on payment links, "on by default". This came from AI reading Razorpay's docs.
- **What I did:** I checked the live Android app with my own account and a real ₹1 link. The link detail said **"Auto Reminders: Disabled"**, and the only switch was an account-wide toggle on a desktop page.
- **Why it mattered:** it changed the problem statement. The gap is not "no reminders exist". It is "reminders are off, desktop-only, SMS/email, and show no view of who owes what". That is the reason Dues lives on the phone.

### 5.2 Synthetic interviews offered as evidence: rejected
- AI-generated personas produced vivid quotes and percentages, such as "3 of 4 didn't know reminders exist".
- I used them only to test my questions, flagged every derived claim, and replaced them with real conversations (Section 2.3).
- The persona in the final note is labelled illustrative.

### 5.3 A demo statistic presented as a result: corrected
- A caption in the first video cut said "73% pay within 7 days of a nudge". That number is prototype demo data, and it conflicted with the note's target (53% vs 33%).
- I changed it to "See which nudges work. Nudged vs not, side by side."

### 5.4 Pipeline errors caught in review
- The first video cut let part of an old callout card ("Does nudging…") show next to the phone in the Insights shot.
- In one zoomed shot, the phone slid off-screen.
- **Fixes:** re-centring the phone, a new in point for the Insights shot, and the automated occlusion scan.

---

## 6. What AI did vs. what I did

| AI did | I did |
|---|---|
| Summarised the brief; drafted research summaries and competitor tables | Chose the track, the merchant segment and the one job to solve |
| Generated synthetic interviews | Ran the real merchant and Razorpay PM conversations, and decided what counts as evidence |
| Drove the browser to capture 54 dashboard screens | Tested the live app with my own account and a real link |
| Wrote the prototype code and deployment | Designed the flow, screens, data model and trust rules; reviewed every screen |
| Wrote the video compositor; proposed caption copy | Set the story order, approved or rewrote every caption, set the 90 s cut |
| Laid out the one-page note; checked it against the brief | Chose what to keep and cut, the metrics and targets, the scope |
| Cleaned up the voice-over audio (ElevenLabs) | Wrote and recorded the voice-over |

---

## 7. Limitations, risks and verification

### Limitations
- **Demo data:** cafés, amounts, the persona "Jahnvi" and her quote are illustrative. Insights numbers are demo data.
- **Templates, not live AI:** the public demo uses templates because no LLM key is set. The AI path exists but isn't exercised live.
- **No real Razorpay APIs:** links are placeholders, paid status is simulated, and WhatsApp send is not confirmed back to the app.
- **The Client field:** the grouping assumes merchants tag a client. Suggesting one from the phone number is designed but untested.

### Risks and mitigations
- **A wrong fact in a message:** facts come from structured fields, she reviews every draft, and the text is editable.
- **Strained client relationships:** Friendly first, max 3 nudges, 7 days apart; auto-nudge is opt-in.
- **Nudging a paid due:** "Mark paid" for cash; matching UPI payments made outside links comes next. Guardrail: under 1% of nudges.
- **Privacy:** client phone numbers stay with the merchant. A nudge opens her own WhatsApp, and nothing is sent by Razorpay in v1.

### Verification steps taken
- [x] The prototype URL loads publicly with no login (checked 13 Oct).
- [x] `POST /api/draft` tested: returns HTTP 200, `source: "template"`, with the correct amount, dates and link.
- [ ] Re-check each market statistic against its named source (note footer) before submitting.
- [x] Every synthetic claim flagged and kept out of the evidence.
- [x] Video checked frame by frame at 1 fps; duration confirmed at exactly 90.000 s.
- [x] Product note fits one A4 page.
- [x] No API keys, credentials or private data in this log. Screenshots are from the author's own account, in test mode or with personal details greyed out.

---
*Built with AI, decided by me.*
