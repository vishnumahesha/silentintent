# Component Map

A quick orientation for anyone landing in the codebase. Each component
listed here lives under `components/`. State and routing live in
`app/page.tsx`; the proof model lives in `lib/mockProof.ts`.

## State owners

| Module | Responsibility |
|---|---|
| `app/page.tsx` | Top-level state machine — vendor states, treasury balance, public log, last debit, reset key, active-vendor derivation. Wires props down to every panel. |
| `lib/mockProof.ts` | Proof model. Owns the policy constants, the deterministic `stableHash`, the constraint evaluation, and the `ProofResult` shape. Replace `generateProof` with the live Compact verifier when ready; keep the return type stable. |

## Components

### `TreasuryHeader`
- Top bar: brand, subtitle, treasury balance display, debit ghost line.
- Props: `balanceCents`, `lastDebit`.
- Was the primary treasury display; secondary now that `HeroTreasury`
  owns the dominant visual.

### `HeroTreasury`
- Big right-column treasury card inside the hero region.
- Anchor for the DeFi framing — 48px gold balance, status pill, animated
  debit line.
- Props: `balanceCents`, `hasDebit`, `debitCents`, `hasAnyResult`.

### `NarrativeStepper`
- 4-step pill stepper under the hero: "Hidden policy committed → AI
  extracts vendor facts → Proof checks constraints → Public sees only
  result".
- Static, no props. Used to explain the product in 5 seconds.

### `HiddenPolicyPanel`
- Left half of the policy / leak comparison row.
- Shows four redacted fields (budget, category, credential, forbidden
  term), a "Private witness" badge, and the policy commitment hash.
- Props: `resetKey` (used to retrigger the commitment scramble animation
  on reset).

### `CompetitorIntelPanel`
- Right half of the row, titled "What vendors learn if intent leaks".
- Two columns: leaked-intent danger column (policy + BrightReach's
  exploit moves) versus SilentIntent's safe disclosure column.
- Static, no props.

### `VendorCard`
- Vendor UI for both BrightReach (A) and CleanList (B). Renders surface
  label, name, price, summary, chip row, optional proposal excerpt,
  proof commitment, REJECTED / AUTHORIZED state block, and the two
  action buttons.
- Props: `vendorName`, `category`, `priceLabel`, `proposalText`,
  `summaryLine`, `chips`, `surfaceLabel`, `authorizeLabel`,
  `priceCents`, `status`, `proof`, `resetKey`, `isLogged`, `onAnalyze`,
  `onAuthorize`.
- Border color and width switch on `status`.

### `AIExtractionPanel`
- Two-column panel under the vendor row.
- Idle: shows "Agent Sees" list + "Agent Cannot See" list + truth badge
  with tooltip.
- Active: shows extracted facts as JSON-like rows for the active vendor;
  flagged chips render in red when the vendor is rejected.
- Props: `activeVendor` (name + status + chips) or null.

### `PublicVerifier`
- Owns the proof timeline + the disclosure card list.
- Proof timeline lights up green pass / red fail per constraint after
  analysis completes.
- Latest disclosure card renders at receipt scale (32px status, left
  accent bar, "PROOF RECEIPT" eyebrow); previous entries dim.
- Props: `log`, `resetKey`, `analyzing`, `latestProof`.

### `DemoControls`
- Fixed bottom-right floating tray.
- Manual action buttons: Analyze BrightReach, Attempt BrightReach
  Authorization, Analyze CleanList, Authorize CleanList, Reset Demo.
- `Run Full Demo` button gated behind `NODE_ENV !== 'production'`.
- Props: `onReset`, `onAnalyzeA`, `onAnalyzeB`, `onAuthorizeA`,
  `onAuthorizeB`, `vendorAStatus`, `vendorBStatus`.

### `CommitmentHash`
- Mono hash display with a brief scramble animation on mount and on
  `resetKey` change.
- **Hydration note**: the initial state is the deterministic truncated
  hash. Scramble only runs inside `useEffect`, so SSR and client first
  render match.
- Props: `hash`, `resetKey?`.

### `RedactedField`
- Small label + shimmering redaction bar.
- Used inside the competitor intel table's third blank row and earlier
  versions of the hidden policy panel.

### `AppFooter`
- Bottom strip with the Mode + Network honesty badges and a Technical
  Artifacts row linking the circuit spec, the verification script, and
  the README.
- Renders the disclaimers after the product is understood (rather than
  in the header).

## Conventions

- All UI uses CSS variables from `app/globals.css` (`@theme` block).
  Tokens: `--color-bg`, `--color-surface`, `--color-surface-raised`,
  `--color-treasury-gold`, `--color-text-primary/secondary/tertiary`,
  `--color-success`, `--color-reject`, `--color-border`,
  `--color-border-accent`.
- Type tokens: `--font-size-hero` (48px), `--font-size-section` (24px),
  `--font-size-card-title` (20px), `--font-size-body` (13px),
  `--font-size-meta` (12px), `--font-size-mono` (13px).
- Most colors are inline `style` rather than Tailwind classes — keeps
  the components self-contained and easy to lift into the team repo.
- No external state library, no auth, no API calls, no env vars.

## Where to make changes

| Change | Edit |
|---|---|
| Add a new constraint check | `lib/mockProof.ts` (the `evaluateOffer` function) and update the `PROOF_STEPS` array in `components/PublicVerifier.tsx`. |
| Swap vendor data | `app/page.tsx` constants at the top; consider moving to `lib/demoData.ts` if it grows. |
| Wire the real Compact verifier | Replace the body of `generateProof` in `lib/mockProof.ts`. Keep the `ProofResult` shape. |
| Change disclosure boundary | `components/PublicVerifier.tsx` (`DisclosureEntry`). |
| Update demo copy / hero | `app/page.tsx` hero block, `components/NarrativeStepper.tsx`, `components/HeroTreasury.tsx`. |
