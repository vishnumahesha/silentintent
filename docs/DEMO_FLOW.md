# Manual demo flow

The manual click flow you should narrate over. No team bios, no hype, no
autoplay. `Run Full Demo` is hidden in production builds — use the
buttons in order yourself.

For a tighter voice-over breakdown (timestamps, line-by-line), see
[`DEMO_SCRIPT.md`](DEMO_SCRIPT.md). This document is the click sequence.

## Pre-flight

- Browser zoom at 100%, full screen, no dev tools open.
- Run `npm run dev` and load `http://localhost:3000`, or open the
  production URL.
- Click **Reset Demo** in the bottom-right tray to start from a clean
  state. Treasury should read `$10,000`, no log entries.
- Hide any system notifications or browser tabs in the recording frame.

## Opening line (5s)

> "This is SilentIntent. An AI agent has $10,000 of company money. It
> can only spend if a private proof says the offer matches hidden
> policy."

[On screen: hero text, Hero Treasury card showing `$10,000` and
"Awaiting authorization".]

## Setup (15s)

> "Here the company's procurement policy is committed but never
> broadcast. Only the policy commitment is public. If the policy leaked,
> vendors would learn the cap, urgency, and forbidden clauses."

[Camera lingers on the Hidden Procurement Policy panel — four redacted
fields and a commitment hash — and the "What vendors learn if intent
leaks" comparison.]

## Step 1: Click **Analyze BrightReach** (15s)

- Vendor A card switches to analyzing state.
- AI Extraction panel animates BrightReach's chips in:
  - `freshness_verified`
  - `delivery_72hr`
  - `partner_enrichment` (flagged)
  - `category:lead_data`

> "BrightReach Data looks like the obvious winner — $1,900, freshness
> verified, high volume. But the AI extraction layer surfaces a
> campaign-metadata reuse clause buried inside 'partner enrichment'."

## Step 2: Click **Attempt BrightReach Authorization** (15s)

- Proof timeline animates inside the Public Verifier.
- The `forbiddenTerm absent` constraint lights up red.
- Vendor A renders REJECTED, red border.
- A REJECTED proof receipt appears in the Public Verifier with all four
  commitments. Treasury stays at `$10,000`, status reads "Awaiting
  authorization" / "Spend evaluated".

> "The proof fails the forbidden-reuse constraint. BrightReach is
> rejected. The public sees the rejection and four commitments — nothing
> about the actual policy. The treasury is untouched."

## Step 3: Click **Analyze CleanList** (10s)

- Vendor B card switches to analyzing state.
- AI Extraction panel switches to CleanList's chips:
  - `freshness_verified`
  - `delivery_72hr`
  - `customer_siloed`
  - `category:lead_data`

> "CleanList Pro is more expensive — $2,250 — but customer-siloed and
> does not reuse campaign outputs across clients."

## Step 4: Click **Authorize CleanList** (15s)

- Vendor B renders AUTHORIZED, green border.
- Treasury debits from `$10,000` → `$7,750` with the gold spring
  animation; debit ghost line shows
  `−$2,250 authorized to vendor commitment`.
- A new AUTHORIZED proof-receipt card appears at the top of the Public
  Verifier with status, deal ID, policy ID, price band `$2k-$2.5k`,
  treasury action, and all four commitments.

> "The proof authorizes the spend. The treasury debits $2,250 to a
> vendor commitment. The public sees status, deal ID, price band,
> treasury action, and four commitments. Nothing else."

## Closing line (10s)

> "Midnight doesn't prove the AI interpreted English correctly. It
> proves the committed offer facts satisfy the committed policy.
> Production would use vendor-signed offer artifacts. Today, that's
> SilentIntent: private policy in, public authorization out."

[End frame: AUTHORIZED proof receipt + Hero Treasury at `$7,750`.]

## Total length

~85 seconds. Leaves headroom under a 2-minute cut.

## What stays private throughout

- exact budget
- hidden constraints
- forbidden rule
- raw witness values
- salts
- full vendor terms
- AI reasoning trace

## What gets disclosed at each step

| Step | Disclosed |
|---|---|
| Initial | Policy commitment only |
| BrightReach rejected | Status, deal ID, policy ID, intent commitment, offer commitment, authorization commitment, treasury action = `unchanged` |
| CleanList authorized | Status, deal ID, policy ID, price band, intent commitment, offer commitment, vendor commitment, authorization commitment, treasury action = `debit_authorized` |

## Reset between takes

Hit **Reset Demo** in the floating tray. State machine clears all
vendor states, public log, treasury balance, last debit, and bumps
`resetKey` so commitment hash animations replay on the next analyze.
