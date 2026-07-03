<!-- @format -->

# SolvingZero Compare Plans Exercise

This is a **2-hour** coding exercise — please don't spend more than 2 hours on it. It's about good engineering decisions far more than about how much you finish; the scope is intentionally a larger, so part of the task is choosing what to build first and what to either leave out or hand off to AI. Please log your core decisions so we can see _when_ and _why_ you made them.

> Anything you build here is **for evaluation only** — it won't be used in production.

SolvingZero helps Australian households understand their electricity and make smart choices. A core piece of that is fetching a household's real usage, working out what they pay today, pulling the plans on the market, and showing them **how much they could save on a better plan**.

## Quick start

**Fastest — zero local setup (GitHub Codespaces):**

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/Sbendat/solvingzero-compare-plans-exercise)

Click the badge (or **Code ▸ Codespaces ▸ Create codespace on main**). The dev container installs dependencies and runs the setup check for you — a working environment in the browser in about a minute.

**Local:**

```bash
nvm use          # optional — pins Node 22 (see .nvmrc)
npm install
npm run verify   # confirms your toolchain + that the data loads (does NOT test your solution)
npm test         # the contract test — fails until you implement the stubs
```

You implement two stubs in `src/`: [`fetchPlans.ts`](src/fetchPlans.ts) and [`estimatePlanCosts.ts`](src/estimatePlanCosts.ts). Then read [`GOAL_GUIDE.md`](GOAL_GUIDE.md) and pick where to start.

## The task

> In this folder is one real household's electricity usage and data. You will also find ten electricity retailers we've chosen for you.

## The ten retailers

You are given a fixed list of ten companies in [`retailers.json`](retailers.json), each with a working base URI. We've picked them to coincide with the current residential plans on this household's network.

### Fetching plans

The CDR "Product Reference Data" (PRD) endpoints are public and unauthenticated.

1. **List a retailer's plans.** `GET {baseUri}/cds-au/v1/energy/plans` with header **`x-v: 1`**. Supports `type`, `fuelType`, `effective`, and pagination. The response's `meta.totalRecords` / `meta.totalPages` tell you when to stop.
2. **Get plan detail.** The pricing lives in the detail: `GET {baseUri}/cds-au/v1/energy/plans/{planId}` with header **`x-v: 3`** (note: the detail endpoint is a **different version** from the list). If a `planId` contains an `@`, **URL-encode it as `%40`** or the request 406s.

> **Offline fallback:** a recorded snapshot of all ten retailers' plans is bundled at [`fixtures/sample-plans.json`](fixtures/sample-plans.json) (fetched live from the PRD endpoints). Use it to build and test your cost engine without waiting on the network — implementing the live fetch in `fetchPlans.ts` is still part of the exercise.

**Filtering to this household** (narrow before you cost):

- **Fuel:** `fuelType` = `ELECTRICITY`.
- **Customer type:** `customerType` = `RESIDENTIAL`.
- **Active:** drop expired plans (`effectiveTo` in the past).
- **Distributor:** the household's distributor is the `LNSP` party in `service-points.json` (`related_participants`). Match it to a plan's `geography.distributors`.
  - **The names don't match verbatim** so you'll need a small reconciliation (e.g. `CitiPower Pty` → `CITIPOWER`). Don't filter by postcode — many regions split postcodes; use the distributor instead.

> **How plan pricing is structured** (rate blocks, time-of-use, tiered, controlled load, feed-in, demand charges, GST, the two snake*case/camelCase formats) is documented in [`DATA_DICTIONARY.md`](DATA_DICTIONARY.md) → \_Plans — CDR `EnergyPlanDetail`*. Both cost goals rely on it.

## What you'll build — the goals

**These are in no particular order, and some depend on others.** Part of what we assess is how you decide what to build first, what to wire together, and what to consciously leave out. See [`GOAL_GUIDE.md`](GOAL_GUIDE.md) for a starting point on each.

- **What is this household paying today?** — cost their _current_ plan (`accounts.json`) against their real usage, as of today, and cross-check it against their real bills. This is your baseline.
- **Find the cheapest plan** — fetch + filter + cost the 10 retailers' plans, rank them, and surface the single best plan as a **saving versus what they pay today**. Define "best" and defend it.
- **User-facing UI** — a minimal page or CLI that shows the household what they pay now, the recommended plan, and the saving. Clarity over polish — **not a design test**.
- **Surface & prioritise the data problems** — real plan data is messy (duplicates, no-pricing, business-only, out-of-zone, demand charges). Record them in `ISSUES.md`, **prioritised by impact** on the answer.

Underpinning all of it is a **cost engine** (cost a plan against 30-minute usage: flat / time-of-use / others, GST, solar credit) and the **fetch + filter + dedup** that feeds it — the two cost goals share both.

## The data you're given

In `user_data/` (real household data, de-identified — see **[`DATA_DICTIONARY.md`](DATA_DICTIONARY.md)**):

- **`usage.json`** — 30-minute interval reads (E1 import, B1 export).
- **`service-points.json`** — the home's connection, distributor, meters/registers.
- **`accounts.json`** — the household's current plan (today's tariff).
- **`bills.json`** — their real bills (a cross-check for your costing).
- **`der.json`** — the solar system.

## What we provide vs what's yours to decide

- **Provided:** TypeScript types ([`src/types.ts`](src/types.ts)), data loaders ([`src/loadData.ts`](src/loadData.ts)), a wired test runner, the data dictionary, the 10 retailers + their base URIs, a fetch guide, and a recorded plans snapshot.
- **Yours to decide:** how to structure the fetch/filter and the cost engine; which tariff features to model and which to scope out; how to de-duplicate; how to define and defend "best"; how to handle data that doesn't fit cleanly; what the UI shows first; pagination/retry strategy.

## What we assess

1. **Code quality & testing** — structure, types, your own tests, readability, sensible (not excessive) abstraction. _Largest single component._
2. **Calculation correctness** — do today's cost and the plan costs reflect the tariffs, usage, GST, and solar credits? Does the baseline reconcile with the bills?
3. **Data-issue handling** — did you notice the messy/invalid plans, and handle them sensibly (not crash, not silently mis-cost)?
4. **Product & judgment** — what the UI surfaces and your `DECISIONS.md` / `ISSUES.md`: what you chose to do, what you skipped, and why.

There is also a **short live walkthrough** after you submit (~20–30 min): we'll ask you to talk through your code and make a small change or two live. It's a conversation about your own work, not a test of memorisation — but being able to extend your own code matters.

## Write-ups

- Spend 20 to 30mins writing up each meaningful decision: what you decided, the options you considered, why you chose, and what you'd do with more time. Include how you **sequenced** the goals and what you left out.

## Running it

```bash
npm install
npm run verify    # setup smoke-test: confirms Node/TS + that the data loads
npm test          # the example/contract test (fails until you implement)
npm run typecheck
```
