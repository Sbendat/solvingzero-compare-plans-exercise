<!-- @format -->

# Goal guide — how to get started

This doc provides starting points for each goal, so you don't lose time on plumbing or industry trivia.

**Orientation**

- Two functions to implement: `src/fetchPlans.ts` (get the ten retailer plans and filter to them down)
- Load the household data with `src/loadData.ts` (`loadUsage`, `loadServicePoints`, `loadAccounts`, `loadBills`, `loadDer`). Every field is explained in `DATA_DICTIONARY.md`.
- This household, at a glance: registers `E1` (import) + `B1` (export) only. ~6.4 kW of solar on a 5 kW inverter, no battery, on the Victorian CITIPOWER network (see `der.json`)
- Currently on a time-of-use plan (see `accounts.json`).

> **The goals below are in no particular order.** Capture your thoughts and trade-off calls in your decision log.

---

## Goal: User-facing UI

_Aim: Build the user a UI for them to navigate all the info and data_

**What we want**

- A simple UI that surfaces the key information a user will care about and that will drive action.
- Wire your engine's output straight to the view. Any framework you like (we use Next.js); the repo is a library/test setup, so add your own minimal front-end if you go the web route. This is not a design test.

**Judgment we're looking for**

- What is the primary insight the user should see first? What's the most important information for the user, what will drive change, what will they pay for? Think about your home and your thoughts around energy to drive you.

---

## Goal: Find the cheapest plan

_Aim: Out of the ten retailers, which plan is cheapest for this household?_

**Start here**

- Reuse your cost engine: cost every applicable fetched plan (pricing structures are in `DATA_DICTIONARY.md`), rank cheapest-first, and surface the single best.
- Express the result as a **saving versus what they pay today** — i.e. against the baseline from the _"What is this household paying today?"_ goal (note: that goal appears further down this list, even though this one needs it).

**Your call / watch for**

- **Define "best" explicitly** and defend it: cheapest annual cost? Including or excluding fees, conditional discounts, feed-in? Is the cheapest headline plan one the household is actually eligible for?

---

## Goal: What is this household paying for their energy?

_Aim: Calculate how much this household has spent on their energy so far._

**Start here**

- You can calculate this based on `usage` or you can look at historical bills.
- Calculate how much the user has spent on peak energy and off-peak energy so far.
- Calculate how much the user has spent on daily supply charges so far.
- Add any other costs or credits you think will be important for the user to see.
