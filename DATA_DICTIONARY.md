<!-- @format -->

# Data Dictionary

Everything you need to interpret the data is below, how you use this is up
to you. You shouldn't need outside knowledge of the Australian energy market.

> **Two naming conventions** The household data (`usage`, `service-points`, `accounts`,
> `der`, `bills`) comes from our data middleman and is **snake_case**. The plans you fetch from the CDR are
> **camelCase** (`EnergyPlanDetail`).

## How the files relate

- A **service point** is the premises' connection. It lists the distributor (via `related_participants`),
  the meters, and their registers.
- **Usage** is a list of daily interval reads of electricty usage, one record per register per day, linked by `service_point_id`.
- **Accounts** holds the household's **current** plan; **bills** are their real invoices; **der** is the
  solar system.

## Usage (`user_data/usage.json`)

Each record is **one register, one day**:

- `register_suffix` — the NEM register. **`E1` = consumption** (energy drawn from the grid, positive kWh).
  **`B1` = export** (solar sent back to the grid) stored as a negative kWh.
- `read_start_date` — the local **date only** (e.g. `"2026-06-20"`); no time, no timezone offset.
  Interval _i_ covers local time `[i×30, (i+1)×30)` minutes after local midnight.
- `interval_read.read_interval_length` — minutes per interval
- `interval_read.interval_reads` — kWh for each interval across the day

## Service points (`user_data/service-points.json`)

- `related_participants[]` — connection parties. **The one with `role: "LNSP"` is the distribution
  network**. **A plan only applies to this household if its
  `geography.distributors` includes this distributor.** Note the names won't match exactly.
- `meters[].registers[]` — `register_suffix`, `controlled_load`, `network_tariff_code`, etc. (registers
  live **under meters**).
- `jurisdiction_code`, `location` — where the premises is. _(Don't filter plans by postcode — region
  borders split postcodes; use the distributor.)_
- `consumer_profile.classification` — `RESIDENTIAL` here.

## Accounts (`user_data/accounts.json`) — the household's CURRENT plan

- `accounts[].plans[].plan_detail.electricity_contract` — the contract they're on today:
  `pricing_model`, `tariff_period[]`, `rate_block_u_type`, `time_of_use_rates[]`
- `daily_supply_charge` - flat daily fee for being connected to the grid
- `solar_feed_in_tariff[]` - unit price for exporting solar for credits
- Times here are full `"HH:MM:SS+10:00"`; the plans you fetch use a shorter form (see below).

## Bills (`user_data/bills.json`)

- `billing[]` — transactions, discriminated by `transaction_u_type` (`usage` / `otherCharges` /
  `onceOff` / `payment`). A `usage` transaction's `usage` object has `amount` (**GST-INCLUSIVE** — the sibling `gst` field ≈ `amount`/11),
  `description` (e.g. `DAILY_SUPPLY`, peak/off-peak energy), `start_date`/`end_date`

## DER (`user_data/der.json`)

- `der_records[]` — the solar system (`ac_connections[]` → inverter + `der_devices[]` panels, capacity).
  Context for why the household exports (as in do they have solar or not).

## Plans — CDR `EnergyPlanDetail`

- `customerType` — `RESIDENTIAL` or `BUSINESS`. (This household is residential.)
- `fuelType` — `ELECTRICITY` (vs gas).
- `geography.distributors[]` — the networks the plan is offered on (match to the household's LNSP).
- `effectiveFrom` / `effectiveTo` — availability window (`effectiveTo: null` = open-ended). Expired
  plans should be dropped.

### Reading a plan's pricing

Pricing lives on `electricityContract.tariffPeriod[]`. **`rateBlockUType` is the discriminant:**

- `"singleRate"` → `singleRate.rates[].unitPrice` — one flat usage rate.
- `"timeOfUseRates"` → `timeOfUseRates[]` — each has a `type` (`PEAK`/`SHOULDER`/`OFF_PEAK`), a
  `rates[].unitPrice`, and `timeOfUse[]` windows. Each window has `days` (e.g. `["MON",…,"FRI"]`) and
  `startTime`/`endTime` as **local `"HH:MM"`** (24-hour, e.g. `"21:00"`; start inclusive, end exclusive; midnight = `"00:00"`).
  A window may **wrap midnight** (e.g. `startTime: "21:00"`, `endTime: "06:00"`).
- **Tiered / block rates:** a rate block can have **multiple `rates[]`**, each applying up to a `volume`
  threshold — a stepped price by consumption, not a single flat rate.
- `dailySupplyCharge` — **$/day** fixed charge (string).

Other things on `electricityContract` (when present):

- `solarFeedInTariff[]` — `singleTariff.rates[].unitPrice` is the **$/kWh credited** for exported (`B1`)
  energy. Variants exist (single vs time-varying).
- `controlledLoad[]` — a separate rate for a controlled-load register. **It lives at
  `electricityContract` level, _not_ inside `tariffPeriod`** — easy to miss.
- `fees[]` — fixed or percentage fees (e.g. membership, card processing, disconnection).
- `demandCharges[]` — charged on **peak demand (kW), not energy (kWh)**. Rare on residential plans, and a
  trap: treating one as ordinary usage makes the plan look falsely cheap.

### Watch for (applies to both the current plan and fetched plans)

- **All `unitPrice` and `dailySupplyCharge` values are GST-EXCLUSIVE.** A consumer-facing figure adds
  **10% GST** (×1.1). Feed-in credits are not GST-bearing.
- `B1` export is **negative** kWh → a solar credit that reduces the bill.
- **Two pricing shapes, same logic:** the current plan (`accounts.json`) is snake_case with times
  `"HH:MM:SS+10:00"`; the fetched plans are camelCase with `"HH:MM"`. Factor your engine so it costs both.
