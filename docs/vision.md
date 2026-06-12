# Vision

## Origin

I'm a member of a private members club — **Beefsteaks & Burgundy**, a gents' dining
club (Singapore chapter). We meet for lunch on the **last Friday of every month**
(attendance optional). The club is run by a **committee** and a **President** who chairs it.

Today we use **WildApricot** for member management and lunch sign-ups. It works, but it's
old, clunky, and slow — it feels like it hasn't evolved since 2007. We want to replace it
with something modern, fast, and pleasant to use.

## The bigger idea

Beefsteaks & Burgundy is a **global club with dozens — possibly hundreds — of chapters**.
The Singapore chapter's needs are very likely the same or near-identical to every other
chapter's, and to most small private clubs generally.

So the plan is:

- Build this **for the Singapore chapter first** (they pay at-cost).
- Design it from day one as a **multi-tenant SaaS** so it can be sold to other chapters
  and clubs globally with little or no change.

This means: **chapter/club isolation is a foundational requirement**, not a later add-on.
Every member, event, and setting belongs to a tenant.

### Onboarding model: self-serve (at the club level)

Any club can **sign up and create their own tenant** without us touching anything. The
person who signs up becomes that club's first **committee** admin. Note the nuance:
self-serve applies to *clubs*, not to *individual members* — because a private members club
is gated, members are **invited/added by the committee**, not free to self-register into a
club. (See "Member onboarding" below.)

## Who uses it

Two roles for now (deliberately simple — expand later):

- **Member** — logs in, views released lunches, signs up, manages their own attendance.
- **Committee** — everything a member can do, plus admin: manage members, create/release
  lunches, set venues & capacity, configure chapter settings.

One committee member can additionally be flagged as **Wine Master** — not a separate role,
just a committee member with an extra hat who gets the wine-selection screens.

(President, Treasurer, etc. are future role refinements, not needed for v1.)

## Core flow (the heart of the product)

The committee **books a restaurant in advance** for a **fixed capacity X**, then creates a
lunch around that booking. The lunch stays hidden until the committee **releases** it to
members. Once released, members **sign up first-come-first-served** against the fixed X;
anyone beyond X joins the **waitlist**.

```
Committee books restaurant (fixed capacity X) → creates lunch → releases it
→ Members sign up FCFS until X is full → waitlist beyond → Lunch happens
```

**Capacity is an input, not a result.** X comes from the real-world booking and is set when
the venue/lunch is created — it is never derived from who signs up. Guests (when allowed)
consume seats out of that same fixed X.

### Committee operations (admin side)

The committee is the power user — replacing a clunky admin tool is a core goal.

- **Per-lunch dashboard:** confirmed list, waitlist, guest count, **headcount vs X**, and
  aggregated **dietary notes**.
- **Manual overrides:** add/remove a member to/from a lunch (someone phones the secretary),
  override the cutoff.
- **Roster management:** add members (by email invite), mark inactive, edit details.
- **Final attendee + dietary list** to share with the restaurant — a light nice-to-have,
  not the thing that sets capacity (the booking already did).

### Notifications (email, v1)

| Trigger | Recipient |
| --- | --- |
| Invited to the club | The new member |
| Sign-up confirmed | The member who signed up |
| Promoted from waitlist | That member |
| Lunch reminder (e.g. 2 days before) | Confirmed attendees |
| Lunch cancelled / changed | All affected |

**Releasing a lunch does NOT auto-email members in v1** — they simply see open lunches when
they log in. (An announce-on-release option is a possible future enhancement.)

## Detailed flows

### Member lifecycle (gated)

```
Invited/added by committee → invite email → set password + complete profile
→ Active member → (Resigned / Lapsed / Removed = inactive)
```

- **Joining (v1):** committee adds a person **by email**; system sends an invite; the person
  sets a password and completes their profile. No public application or nomination workflow
  in v1 — keeps membership truly gated and simple. (Application/nomination = possible future.)
- **Profile:** name, email, phone, **dietary preferences** (it's a dining club), join date.
- **Leaving:** members are **never hard-deleted** — they're marked **inactive** (resigned/
  lapsed/removed). Inactive members can't log in or sign up, but their **attendance history
  is preserved**.

### Lunch lifecycle (core)

```
Draft → Released → [sign-ups open] → Full → Waitlist → [cutoff: sign-ups lock]
→ Completed → Attendance recorded
```

- **Member cancels** a spot → frees capacity → **auto-promote** the first waitlisted member
  and notify them.
- **Sign-up cutoff:** each lunch has a **configurable cutoff** (e.g. 2 days before). After
  the cutoff, sign-ups and cancellations **lock** so the committee can confirm a final
  headcount with the restaurant.
- **Committee cancels the whole lunch** → everyone (signed-up + waitlisted) is notified;
  spots and waitlist cleared.
- **Capacity change** after release → if raised, auto-promote from the waitlist; if lowered,
  handle gracefully (never silently bump confirmed attendees).

### Guests (committee-gated)

- Committee toggles **"guests allowed"** (per club, optionally per lunch) and sets a
  **max guests per member**.
- **Guests count against venue capacity** — a member + 2 guests consumes 3 seats. This keeps
  the headcount accurate for the restaurant booking.

## Back-of-house: committee planning

The product has two halves. **Front-of-house** is everything above — members browsing and
signing up for released lunches. **Back-of-house** is the committee's own planning work,
which WildApricot doesn't support at all and which is done manually today. This back-of-house
tooling is likely the real differentiator.

### The venue pipeline

Roster-planning (A) and committee tastings (B) aren't separate features — they're **stages in
a venue's journey** to becoming a lunch:

```
Candidate venue → Committee tasting (feedback) → Approved & booked → Lunch (released to members)
   roster ahead       evaluation visit             fixed capacity X     front-of-house flow
```

- The committee curates a **pipeline of candidate restaurants ahead** of time.
- Before committing, they do a **committee tasting** at the restaurant and capture **feedback**
  (to share with the restaurant and to inform the go/no-go).
- Approved venues graduate into **booked lunches** with a fixed capacity X.

So a **venue is a first-class entity with a lifecycle**, not just a location stapled onto one
lunch.

### Wine

- One committee member is flagged **Wine Master** and gets wine-selection screens.
- The **club cellar** is a **lightweight wine catalogue** in v1 (name, vintage, notes) — *not*
  bottle-level inventory/stock tracking. Wines may also come from the **restaurant's list**.
- For each lunch, the Wine Master **selects the wines** and records the intended **pairing**.
- **Blind tasting happens in the room, phones away.** The app's job is to help the Wine Master
  *prepare and record* the pairing beforehand, then **get out of the way** during the lunch —
  there is **no member-facing in-app guessing/scoring**.

## Scope

### v1 (MVP)
- Multi-tenant foundation (chapter isolation)
- Member auth & profiles
- Member roster (committee-managed)
- Venues (name, location, capacity)
- Lunches/events: create, release, capacity-limited sign-up
- Two roles: member / committee

### Soon after
- **Waitlists** — when a lunch is full, members queue and auto-promote on cancellation
- **Guests** — if the committee allows it, members may invite up to **X guests**
- **Email notifications** — sign-up confirmation, upcoming-lunch reminders
- **Attendance history** — per member and per lunch
- **Member directory**

### Back-of-house (committee planning — own track, likely post-MVP)
- **Venue pipeline** — candidate venues, tasting stage with feedback, approval → booked lunch
- **Wine** — Wine Master flag, lightweight cellar/wine catalogue, per-lunch wine selection &
  recorded pairing (no member-facing blind-tasting feature)

### Future
- **Payments / dues** — collecting lunch fees or membership dues
- Richer roles (President, Treasurer, …)
- Bottle-level **cellar inventory** (stock, consumption, value)

## Why not just keep WildApricot
It's old, clunky, and slow — stuck circa 2007. We want something modern, fast, and ours.

## Scale (Singapore chapter)
~45 members. Tiny per chapter — but the multi-tenant ambition (many chapters) is what
drives the architecture, not raw member count.
