## 1. Fix the "Loading player data…" bug

The Wynncraft v3 API requires UUIDs **without dashes**. We're sending `c7124311-49b0-49ac-ba66-d8857ae58320` which 400s. Strip dashes before the request in `src/lib/player.functions.ts`. Also fall back to username if UUID lookup fails.

## 2. Header tweak

Center the "[Next] · Wynncraft" tag in `SiteHeader` instead of left.

## 3. Auth — using Lovable Cloud (required)

I'll enable Lovable Cloud. Auth will use **email + password** under the hood, but the UI will show **Minecraft username + passcode** (we'll synthesize an internal email like `<username>@quotegang.local` so users only ever see/enter their IGN).

- Signup validates the IGN against the Mojang API (`https://api.mojang.com/users/profiles/minecraft/<name>`) so fake names are rejected.
- Passcode: min 8 chars, all symbols allowed.
- Passwords are hashed by Supabase Auth (bcrypt) — strong, industry standard. No custom "encryption."
- After login, header shows skin head + IGN top-left and a Logout button.

### About the admin login

Hardcoding `admin` / `qmmdt739qR` in the frontend is **not secure** — anyone can read it in the JS bundle. Instead:
- I'll create one admin account in the database with username `admin` and that passcode you chose.
- Admin status is stored in a separate `user_roles` table (server-checked, never trust the client).
- Same login form for everyone; if the account has the `admin` role, admin UI unlocks.

You can change/rotate the admin passcode anytime from the Cloud dashboard.

## 4. Applications system

Tables (with RLS):
- `applications` — user_id, ign, discord_username, activity, willing_events (bool|null), status (`pending`/`accepted`/`rejected`/`cancelled`), reviewer_message, created_at, reviewed_at.
- `user_roles` — user_id, role enum (`admin`/`user`).

Rules enforced server-side:
- Must be logged in to apply (otherwise show "Log in or apply on Discord" modal).
- One application per user per 24h (DB-level check in a server function).
- User can cancel their own pending application; cancelled apps are hidden from everyone (not shown to admins).
- Accepted/rejected apps auto-purge after 30 days via a scheduled cleanup (cron) or a query filter — I'll filter by date and add a server-side cleanup function.

### Webhook

The Discord webhook URL **cannot be truly hidden from the client if the client posts to it**. Solution: store the webhook URL as a **server secret** (`DISCORD_WEBHOOK_URL`) and POST from a server function. The browser never sees the URL. Inspecting source/network shows only a call to our own server function.

Webhook embeds:
- On submit: rich embed with header (IGN), body (Discord, activity, willing), footer with timestamp + "Review at <site>/admin/applications" link.
- On accept/reject: follow-up embed with status + reason.

### Apply form fields
- IGN (auto-filled from logged-in account, validated)
- Discord username
- How active are you? (textarea)
- Willing to participate in guild/raid/events? (Yes / No / skip — optional)

## 5. Admin UI

- New `/admin/applications` route, gated by `_admin` layout (`beforeLoad` checks role server-side).
- "View Applications" link appears in header **only** for admins.
- Tabs: Pending · Accepted · Rejected (last 30 days).
- Each app card: skin head left, IGN as title, apply date, status badge. Click → full details + Accept/Reject buttons + optional message field.

## 6. User "My Application" view

- New `/my-application` route for logged-in users.
- Shows their latest app as a card (skin head, IGN, date, status badge).
- If pending: Cancel button.
- If accepted/rejected: shows reviewer message if present.

## 7. Anti-abuse

- 1 application per 24h enforced in the DB (unique partial index + server check).
- Server function rate-limits webhook calls.
- All sensitive logic (webhook POST, role checks, status transitions) runs in server functions — nothing exploitable from devtools.

---

### Files I'll create/edit

**Fix + header**
- edit `src/lib/player.functions.ts` (strip dashes, fallback)
- edit `src/components/SiteHeader.tsx` (center tag, show user when logged in)

**Auth**
- new `src/routes/login.tsx`, `src/routes/signup.tsx`
- new `src/routes/_authenticated.tsx` (route guard)
- new `src/routes/_authenticated/_admin.tsx` (admin guard)
- new `src/lib/auth.ts` (IGN→email helper, Mojang validation server fn)
- new `src/hooks/use-auth.tsx`

**Applications**
- new `src/lib/applications.functions.ts` (submit, list, update, cancel — all server-side)
- new `src/routes/apply.tsx`
- new `src/routes/_authenticated/my-application.tsx`
- new `src/routes/_authenticated/_admin/applications.tsx`
- new `src/components/ApplicationCard.tsx`
- new migration: `applications`, `user_roles`, `app_role` enum, `has_role()` function, RLS policies

**Secrets**
- `DISCORD_WEBHOOK_URL` (server-only)

---

### Things I am NOT doing (and why)

- **Hardcoding the admin password in frontend code** — readable by anyone. Using a real admin account + role table instead.
- **Custom encryption of passwords** — Supabase Auth's bcrypt is the right answer; rolling my own would be less secure.
- **Hiding the webhook in the browser** — impossible if browser calls it. Moved to server secret.

Ready to build all of this in one go?
