# MjengoAI Pro — Demo Booking Page

A standalone, single-purpose booking page for `demo.mjengoai.com`. Its only job is
letting a prospective customer pick a date and time and book a free 30-minute
MjengoAI Pro demo. No CRM, dashboard, accounts, or other functionality.

## How it works

- **Frontend:** static HTML/CSS/JS (`index.html`, `styles.css`, `app.js`). No framework, no server code.
- **Scheduling, meeting link, double-booking prevention, reminders and confirmation
  emails are all handled by Calendly** — we embed Calendly's inline widget rather
  than building a custom scheduling engine, per the spec.
- Calendly's native **Google Meet integration** generates the meeting link automatically
  once you connect your Google account to Calendly.
- The page listens for Calendly's `calendly.event_scheduled` browser event and swaps in
  a branded "Demo Booked Successfully" confirmation panel in place of the widget — the
  full booking details (exact date/time and Meet link) arrive via Calendly's own
  confirmation email, since that data isn't exposed to the browser for security reasons.

Nothing on this page touches a database, and there is no backend to secure — the only
"integration" is a public Calendly scheduling link, which is not a secret but is still
injected via an environment variable rather than hardcoded (see below).

## One-time setup in Calendly

1. **Create an event type** named `MjengoAI Pro Demo`, duration **30 minutes**.
2. **Set the event's timezone** to `Africa/Nairobi (EAT, UTC+3)`.
3. **Connect Google Calendar + Google Meet** under Calendly's Integrations, and enable
   automatic Google Meet link generation for this event type. This is also what
   prevents double-booking (Calendly checks your connected calendar's availability).
4. **Add custom intake questions** on the event type (Calendly supports this natively):
   - Full Name (usually the default "Name" field)
   - Company / Organisation
   - Email (default field)
   - Phone / WhatsApp
   Do not add any fields beyond these four.
5. **Turn off Calendly's own booking-page cookie/GDPR banner and branding** where the
   embed settings allow it, so the widget reads as part of the MjengoAI page.
6. Copy the event type's public scheduling link, e.g.
   `https://calendly.com/mjengoai/pro-demo` — you'll need it for `CALENDLY_URL` below.

## Environment variables

| Variable       | Required | Description                                          |
|----------------|----------|-------------------------------------------------------|
| `CALENDLY_URL` | Yes      | Public Calendly scheduling link for the demo event.   |

No API keys, OAuth tokens, or other secrets are needed by this app — Calendly handles
authentication with Google on its own platform. Set `CALENDLY_URL` in your hosting
provider's environment variable settings (never commit a real value; see `.env.example`).

At build time, `build.js` reads `CALENDLY_URL` and writes it into `config.js`, which is
the only place the frontend reads the link from. `config.js` is regenerated on every
deploy and should not be hand-edited or committed with a real value.

## Deploying to demo.mjengoai.com

Any static host with an env-var-aware build step works (Vercel and Netlify shown):

### Vercel
1. Import this repository into Vercel.
2. Project Settings → Environment Variables → add `CALENDLY_URL`.
3. Vercel will run `npm run build` (see `vercel.json`) which generates `config.js`.
4. Project Settings → Domains → add `demo.mjengoai.com` and follow the DNS instructions
   (typically a `CNAME` record pointing at `cname.vercel-dns.com`).

### Netlify
1. New site from this repository.
2. Build command: `npm run build` — Publish directory: `.`
3. Site Settings → Environment Variables → add `CALENDLY_URL`.
4. Domain Settings → add `demo.mjengoai.com` and follow the DNS instructions.

## Local preview

Copy `.env.example` to `.env` and fill in `CALENDLY_URL`:

```bash
cp .env.example .env
# edit .env and set CALENDLY_URL=...
npm run build
npm start
```

`.env` is only read locally by `build.js` and is listed in `.gitignore` — never commit
it. On Vercel/Netlify, set `CALENDLY_URL` in the dashboard instead; `.env` files aren't
used in production.

Then open the printed local URL. The booking flow requires a real, connected Calendly
event to show live availability.

## Files

```
index.html            Page markup (hero + booking section)
styles.css             Brand styling (dark background, green/orange accents)
app.js                  Mounts the Calendly widget, shows the confirmation panel
config.template.js      Template used to generate config.js at build time
config.js               Generated at build time — do not hand-edit for production
build.js                Build step that injects CALENDLY_URL into config.js
package.json            `npm run build` / `npm start`
.env.example            Documents required environment variables
vercel.json             Vercel build configuration
```

## Explicitly out of scope

Per spec, this page intentionally does not include a CRM, admin/sales dashboard,
lead database, trial or payment/subscription management, user accounts, project
management, WhatsApp automation, email marketing, analytics, a chatbot, or search.
It is only a booking page.
